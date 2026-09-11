import express, { type Express, type Request, type Response } from 'express';
import type { Config } from './config.js';
import type { Logger } from './logger.js';
import { handleMessage, summarize } from './quote/flow.js';
import type { SessionStore } from './quote/store.js';
import { createMemoryStore } from './quote/store.js';
import type { WhatsAppClient } from './whatsapp/client.js';
import { isValidSignature } from './whatsapp/signature.js';
import { extractMessages, webhookPayloadSchema } from './whatsapp/types.js';
import type { ZohoClient } from './zoho/client.js';

export interface ServerDeps {
  config: Config;
  logger: Logger;
  whatsapp: WhatsAppClient;
  zoho: ZohoClient;
  store?: SessionStore;
}

export function createServer({ config, logger, whatsapp, zoho, store }: ServerDeps): Express {
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
    res.json({ status: 'ok' });
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

  async function processMessages(payload: Parameters<typeof extractMessages>[0]): Promise<void> {
    for (const message of extractMessages(payload)) {
      if (processedMessages.has(message.messageId)) continue;
      processedMessages.add(message.messageId);

      try {
        const session = sessions.get(message.from);
        const result = handleMessage(session, message.text, {
          currencySymbol: config.QUOTE_CURRENCY_SYMBOL,
        });
        sessions.set(result.session);

        for (const reply of result.replies) {
          await whatsapp.sendText(message.from, reply);
        }

        if (!result.quote) continue;

        try {
          const estimate = await zoho.createEstimateForQuote(result.quote);
          logger.info('Cotizacion creada en Zoho Books', {
            phone: message.from,
            estimateNumber: estimate.estimateNumber,
          });
          await whatsapp.sendText(
            message.from,
            [
              `Listo, tu cotizacion ${estimate.estimateNumber} quedo registrada en Zoho Books.`,
              summarize(result.quote, config.QUOTE_CURRENCY_SYMBOL),
              'Un asesor de CI Concretos te contactara para confirmar la entrega.',
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
