import { z } from 'zod';
import { catalog } from '../quote/catalog.js';
import type { Logger } from '../logger.js';

export interface AiTurn {
  role: 'user' | 'assistant';
  content: string;
}

export interface AiExtraction {
  reply: string;
  customerName?: string;
  productSku?: string;
  quantity?: number;
  deliveryDate?: string;
  address?: string;
  confirmed: boolean;
}

export interface AiAgent {
  respond(history: AiTurn[], message: string, today: string): Promise<AiExtraction>;
}

export interface AiAgentOptions {
  apiKey: string;
  baseUrl: string;
  model: string;
  currencySymbol: string;
  companyName: string;
}

const responseSchema = z.object({
  reply: z.string().min(1),
  customer_name: z.string().nullable().optional(),
  product_sku: z.string().nullable().optional(),
  quantity: z.number().nullable().optional(),
  delivery_date: z.string().nullable().optional(),
  address: z.string().nullable().optional(),
  confirmed: z.boolean().nullable().optional(),
});

function systemPrompt(options: AiAgentOptions, today: string): string {
  const products = catalog
    .map(
      (product) =>
        `- ${product.sku}: ${product.name}, ${options.currencySymbol}${product.unitPrice} por ${product.unit}, pedido minimo ${product.minQuantity} ${product.unit}`,
    )
    .join('\n');

  return [
    `Eres el asesor virtual de ${options.companyName} y atiendes por WhatsApp en espanol de Mexico.`,
    'Tu objetivo es reunir los datos necesarios para una cotizacion de concreto premezclado.',
    'Datos requeridos: nombre del cliente o empresa, producto del catalogo, cantidad en m3,',
    'fecha de entrega y direccion de la obra.',
    '',
    'Catalogo:',
    products,
    '',
    `La fecha de hoy es ${today}. Devuelve siempre delivery_date en formato YYYY-MM-DD.`,
    'Reglas:',
    '- Pregunta solo por los datos que falten, maximo dos por mensaje, en tono breve y cordial.',
    '- No inventes precios ni productos fuera del catalogo.',
    '- Respeta el pedido minimo de cada producto y pide una cantidad mayor si el cliente pide menos.',
    '- Cuando tengas todos los datos, muestra un resumen con el subtotal y pide confirmacion explicita.',
    '- Pon confirmed en true solo cuando el cliente confirme ese resumen.',
    '- Aclara que la cotizacion pasa por revision de un asesor antes de enviarse formalmente.',
    '- Responde unicamente con un objeto JSON con las claves: reply, customer_name, product_sku,',
    '  quantity, delivery_date, address, confirmed.',
  ].join('\n');
}

export function createAiAgent(options: AiAgentOptions, logger: Logger): AiAgent {
  return {
    async respond(history, message, today) {
      const response = await fetch(`${options.baseUrl}/chat/completions`, {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${options.apiKey}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          model: options.model,
          temperature: 0.2,
          response_format: { type: 'json_object' },
          messages: [
            { role: 'system', content: systemPrompt(options, today) },
            ...history.map((turn) => ({ role: turn.role, content: turn.content })),
            { role: 'user', content: message },
          ],
        }),
      });

      if (!response.ok) {
        const detail = await response.text();
        logger.error('Fallo la llamada al modelo', { status: response.status, detail });
        throw new Error(`El modelo respondio ${response.status}`);
      }

      const body = (await response.json()) as {
        choices?: Array<{ message?: { content?: string } }>;
      };
      const content = body.choices?.[0]?.message?.content;
      if (!content) throw new Error('El modelo no devolvio contenido');

      const parsed = responseSchema.safeParse(JSON.parse(content));
      if (!parsed.success) {
        logger.error('Respuesta del modelo con formato inesperado', { content });
        throw new Error('Respuesta del modelo con formato inesperado');
      }

      const data = parsed.data;
      return {
        reply: data.reply,
        customerName: data.customer_name ?? undefined,
        productSku: data.product_sku ?? undefined,
        quantity: data.quantity ?? undefined,
        deliveryDate: data.delivery_date ?? undefined,
        address: data.address ?? undefined,
        confirmed: data.confirmed ?? false,
      };
    },
  };
}
