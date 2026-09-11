import type { AiAgent } from '../ai/agent.js';
import { findProduct } from './catalog.js';
import {
  newSession,
  parseDate,
  type CompletedQuote,
  type FlowResult,
  type QuoteSession,
} from './flow.js';

const HISTORY_LIMIT = 20;
const CANCEL_WORDS = ['cancelar', 'salir', 'terminar'];

export async function handleMessageWithAi(
  session: QuoteSession,
  message: string,
  agent: AiAgent,
  now: Date = new Date(),
): Promise<FlowResult> {
  const text = message.trim();

  if (CANCEL_WORDS.includes(text.toLowerCase())) {
    return {
      session: newSession(session.phone, now),
      replies: ['Cotizacion cancelada. Escribe cuando quieras retomarla.'],
    };
  }

  const today = now.toISOString().slice(0, 10);
  const extraction = await agent.respond(session.history, text, today);

  const next: QuoteSession = {
    ...session,
    draft: { ...session.draft },
    history: [
      ...session.history,
      { role: 'user' as const, content: text },
      { role: 'assistant' as const, content: extraction.reply },
    ].slice(-HISTORY_LIMIT),
    updatedAt: now.getTime(),
  };

  if (extraction.customerName) next.draft.customerName = extraction.customerName;
  if (extraction.address) next.draft.address = extraction.address;

  const product = extraction.productSku ? findProduct(extraction.productSku) : undefined;
  if (product) next.draft.product = product;

  if (typeof extraction.quantity === 'number' && Number.isFinite(extraction.quantity) && extraction.quantity > 0) {
    next.draft.quantity = extraction.quantity;
  }

  if (extraction.deliveryDate) {
    const parsed = parseDate(extraction.deliveryDate, now);
    if (parsed) next.draft.deliveryDate = parsed;
  }

  const quote = extraction.confirmed ? toCompletedQuote(next) : undefined;
  next.state = quote ? 'completed' : 'awaiting_confirmation';

  return { session: next, replies: [extraction.reply], quote };
}

function toCompletedQuote(session: QuoteSession): CompletedQuote | undefined {
  const { customerName, product, quantity, deliveryDate, address } = session.draft;
  if (!customerName || !product || quantity === undefined || !deliveryDate || !address) {
    return undefined;
  }
  if (quantity < product.minQuantity) return undefined;
  return {
    phone: session.phone,
    customerName,
    product,
    quantity,
    deliveryDate,
    address,
    subtotal: Number((product.unitPrice * quantity).toFixed(2)),
  };
}
