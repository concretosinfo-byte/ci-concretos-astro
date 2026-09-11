import express, { type Express, type Request, type Response } from 'express';
import type { AiAgent } from './ai/agent.js';
import type { Config } from './config.js';
import type { Logger } from './logger.js';
import { handleMessageWithAi } from './quote/aiFlow.js';
import { handleMessage, summarize, type FlowResult } from './quote/flow.js';
import type { SessionStore } from './quote/store.js';
import { createMemoryStore } from './quote/store.js';
import type { WhatsAppClient } from './whatsapp/client.js';
import { isValidSignature } from './whatsapp/signature.js';
import { extractMessages, webhookPayloadSchema, type WebhookPayload } from './whatsapp/types.js';
import type { ZohoClient } from './zoho/client.js';
import { phoneFromReference } from './zoho/estimate.js';

export interface ServerDeps {
  config: Config;
  logger: Logger;
  whatsapp: WhatsAppClient;
  zoho: ZohoClient;
  agent?: AiAgent;
  store?: SessionStore;
}

export function createServer({ config, logger, whatsapp, zoho, agent, store }: ServerDeps): Express {
  const sessions = store ?? createMemoryStore(config.QUOTE_SESSION_TTL_MINUTES);
  const processedMessages = new Set<string>();
  const app = express();

  app.use(
    express.json({
      verify: (req, _res, buf) => {
        (req as Request & { rawBody?: Buffer }).rawBody = buf;
      },
    }),
  );

  app.get('/health', (_req: Request, res: Response) => {
    res.json({ status: 'ok', ai: Boolean(agent) });
  });

  app.get('/webhook/whatsapp', (req: Request, res: Response) => {
    const mode = req.query['hub.mode'];
    const token = req.query['hub.verify_token'];
    const challenge = req.query['hub.challenge'];
    if (mode === 'subscribe' && token === config.WHATSAPP_VERIFY_TOKEN && typeof challenge === 'string') {
      res.status(200).send(challenge);
      return;
    }
    res.sendStatus(403);
  });

  app.post('/webhook/whatsapp', (req: Request, res: Response) => {
    const rawBody = (req as Request & { rawBody?: Buffer }).rawBody ?? Buffer.from('');
    if (!isValidSignature(rawBody, req.header('x-hub-signature-256'), config.WHATSAPP_APP_SECRET)) {
      logger.warn('Firma invalida en webhook de WhatsApp');
      res.sendStatus(401);
      return;
    }

    const parsed = webhookPayloadSchema.safeParse(req.body);
    if (!parsed.success) {
      logger.warn('Payload de webhook no reconocido');
      res.sendStatus(200);
      return;
    }

    res.sendStatus(200);
    void processMessages(parsed.data);
  });

  // Zoho Books dispara este webhook (o el equipo lo llama manualmente) cuando la
  // cotizacion ya fue revisada y se aprueba su envio al cliente.
  app.post('/webhook/zoho/estimate-approved', (req: Request, res: Response) => {
    if (req.header('x-webhook-token') !== config.ZOHO_WEBHOOK_TOKEN) {
      res.sendStatus(401);
      return;
    }

    const body = req.body as { estimate_id?: string; estimate?: { estimate_id?: string } };
    const estimateId = body.estimate_id ?? body.estimate?.estimate_id;
    if (!estimateId) {
      res.status(400).json({ error: 'Falta estimate_id' });
      return;
    }

    res.status(202).json({ accepted: true });
    void deliverApprovedEstimate(estimateId);
  });

  async function deliverApprovedEstimate(estimateId: string): Promise<void> {
    try {
      const estimate = await zoho.getEstimate(estimateId);
      const phone = phoneFromReference(estimate.referenceNumber);
      if (!phone) {
        logger.warn('Cotizacion sin telefono de WhatsApp en reference_number', {
          estimateId,
          referenceNumber: estimate.referenceNumber,
        });
        return;
      }

      const lines = [
        `Hola${estimate.customerName ? ` ${estimate.customerName}` : ''}, tu cotizacion ${estimate.estimateNumber} ya fue revisada por nuestro equipo.`,
        `Total: ${config.QUOTE_CURRENCY_SYMBOL}${estimate.total.toLocaleString('es-MX', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`,
      ];
      if (estimate.estimateUrl) lines.push(`Puedes verla aqui: ${estimate.estimateUrl}`);
      lines.push('Respondenos por este medio si deseas confirmar el pedido o ajustar algo.');

      await whatsapp.sendText(phone, lines.join('\n'));
      logger.info('Cotizacion aprobada enviada por WhatsApp', {
        estimateId,
        estimateNumber: estimate.estimateNumber,
        phone,
      });
    } catch (error) {
      logger.error('No se pudo enviar la cotizacion aprobada', {
        estimateId,
        error: error instanceof Error ? error.message : String(error),
      });
    }
  }

  async function processMessages(payload: WebhookPayload): Promise<void> {
    for (const message of extractMessages(payload)) {
      if (processedMessages.has(message.messageId)) continue;
      processedMessages.add(message.messageId);

      try {
        const session = sessions.get(message.from);
        let result: FlowResult;
        if (agent) {
          try {
            result = await handleMessageWithAi(session, message.text, agent);
          } catch (error) {
            logger.warn('El agente de IA fallo, se usa el flujo guiado', {
              error: error instanceof Error ? error.message : String(error),
            });
            result = handleMessage(session, message.text, {
              currencySymbol: config.QUOTE_CURRENCY_SYMBOL,
            });
          }
        } else {
          result = handleMessage(session, message.text, {
            currencySymbol: config.QUOTE_CURRENCY_SYMBOL,
          });
        }
        sessions.set(result.session);

        for (const reply of result.replies) {
          await whatsapp.sendText(message.from, reply);
        }

        if (!result.quote) continue;

        try {
          const estimate = await zoho.createEstimateForQuote(result.quote);
          logger.info('Cotizacion creada como borrador en Zoho Books', {
            phone: message.from,
            estimateNumber: estimate.estimateNumber,
            status: estimate.status,
          });
          await whatsapp.sendText(
            message.from,
            [
              `Registre tu solicitud con el folio ${estimate.estimateNumber}.`,
              summarize(result.quote, config.QUOTE_CURRENCY_SYMBOL),
              'Un asesor de CI Concretos validara los datos y te enviamos la cotizacion formal por este mismo chat.',
            ].join('\n\n'),
          );
        } catch (error) {
          logger.error('No se pudo crear la cotizacion en Zoho', {
            phone: message.from,
            error: error instanceof Error ? error.message : String(error),
          });
          await whatsapp.sendText(
            message.from,
            'Tuvimos un problema al registrar tu cotizacion. Un asesor la revisara manualmente y te contactara.',
          );
        }
      } catch (error) {
        logger.error('Error procesando mensaje de WhatsApp', {
          phone: message.from,
          error: error instanceof Error ? error.message : String(error),
        });
      }
    }
  }

  return app;
}
