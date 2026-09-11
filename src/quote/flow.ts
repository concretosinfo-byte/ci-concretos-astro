import { catalogMenu, findProduct, type Product } from './catalog.js';

export type QuoteState =
  | 'start'
  | 'awaiting_name'
  | 'awaiting_product'
  | 'awaiting_quantity'
  | 'awaiting_date'
  | 'awaiting_address'
  | 'awaiting_confirmation'
  | 'completed';

export interface QuoteDraft {
  customerName?: string;
  product?: Product;
  quantity?: number;
  deliveryDate?: string;
  address?: string;
}

export interface QuoteSession {
  phone: string;
  state: QuoteState;
  draft: QuoteDraft;
  updatedAt: number;
}

export interface CompletedQuote {
  phone: string;
  customerName: string;
  product: Product;
  quantity: number;
  deliveryDate: string;
  address: string;
  subtotal: number;
}

export interface FlowResult {
  session: QuoteSession;
  replies: string[];
  quote?: CompletedQuote;
}

export interface FlowOptions {
  currencySymbol: string;
  now?: Date;
}

const RESTART_WORDS = ['hola', 'menu', 'menú', 'cotizar', 'inicio', 'reiniciar'];
const CANCEL_WORDS = ['cancelar', 'salir', 'terminar'];

export function newSession(phone: string, now: Date = new Date()): QuoteSession {
  return { phone, state: 'start', draft: {}, updatedAt: now.getTime() };
}

export function parseDate(input: string, now: Date): string | undefined {
  const value = input.trim().toLowerCase();
  const day = 24 * 60 * 60 * 1000;
  if (value === 'hoy') return toIsoDate(now);
  if (value === 'manana' || value === 'mañana') return toIsoDate(new Date(now.getTime() + day));

  const iso = /^(\d{4})-(\d{2})-(\d{2})$/.exec(value);
  if (iso) return buildDate(Number(iso[1]), Number(iso[2]), Number(iso[3]));

  const latin = /^(\d{1,2})[/-](\d{1,2})[/-](\d{4})$/.exec(value);
  if (latin) return buildDate(Number(latin[3]), Number(latin[2]), Number(latin[1]));

  return undefined;
}

function buildDate(year: number, month: number, day: number): string | undefined {
  const date = new Date(Date.UTC(year, month - 1, day));
  if (
    date.getUTCFullYear() !== year ||
    date.getUTCMonth() !== month - 1 ||
    date.getUTCDate() !== day
  ) {
    return undefined;
  }
  return toIsoDate(date);
}

function toIsoDate(date: Date): string {
  return date.toISOString().slice(0, 10);
}

function money(amount: number, symbol: string): string {
  return `${symbol}${amount.toLocaleString('es-MX', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
}

export function summarize(quote: CompletedQuote, currencySymbol: string): string {
  return [
    'Resumen de tu cotizacion:',
    `Cliente: ${quote.customerName}`,
    `Producto: ${quote.product.name}`,
    `Cantidad: ${quote.quantity} ${quote.product.unit}`,
    `Precio unitario: ${money(quote.product.unitPrice, currencySymbol)}`,
    `Subtotal: ${money(quote.subtotal, currencySymbol)}`,
    `Fecha de entrega: ${quote.deliveryDate}`,
    `Direccion: ${quote.address}`,
  ].join('\n');
}

function draftToQuote(session: QuoteSession): CompletedQuote | undefined {
  const { customerName, product, quantity, deliveryDate, address } = session.draft;
  if (!customerName || !product || quantity === undefined || !deliveryDate || !address) {
    return undefined;
  }
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

export function handleMessage(
  session: QuoteSession,
  message: string,
  options: FlowOptions,
): FlowResult {
  const now = options.now ?? new Date();
  const text = message.trim();
  const normalized = text.toLowerCase();
  const next: QuoteSession = {
    ...session,
    draft: { ...session.draft },
    updatedAt: now.getTime(),
  };

  if (CANCEL_WORDS.includes(normalized)) {
    return {
      session: { ...newSession(session.phone, now) },
      replies: ['Cotizacion cancelada. Escribe "hola" cuando quieras empezar de nuevo.'],
    };
  }

  if (session.state === 'start' || session.state === 'completed' || RESTART_WORDS.includes(normalized)) {
    const fresh = newSession(session.phone, now);
    fresh.state = 'awaiting_name';
    return {
      session: fresh,
      replies: [
        'Hola, soy el cotizador de CI Concretos.',
        'Para prepararte una cotizacion, dime el nombre del cliente o de la empresa.',
      ],
    };
  }

  switch (session.state) {
    case 'awaiting_name': {
      if (text.length < 3) {
        return { session: next, replies: ['Necesito un nombre de al menos 3 caracteres.'] };
      }
      next.draft.customerName = text;
      next.state = 'awaiting_product';
      return {
        session: next,
        replies: [
          `Gracias, ${text}.`,
          `Que producto necesitas? Responde con el numero:\n${catalogMenu(options.currencySymbol)}`,
        ],
      };
    }

    case 'awaiting_product': {
      const product = findProduct(text);
      if (!product) {
        return {
          session: next,
          replies: [
            `No reconoci ese producto. Elige un numero de la lista:\n${catalogMenu(options.currencySymbol)}`,
          ],
        };
      }
      next.draft.product = product;
      next.state = 'awaiting_quantity';
      return {
        session: next,
        replies: [
          `${product.name}. Cuantos ${product.unit} necesitas? (minimo ${product.minQuantity} ${product.unit})`,
        ],
      };
    }

    case 'awaiting_quantity': {
      const product = next.draft.product;
      const quantity = Number(text.replace(',', '.').replace(/[^\d.]/g, ''));
      if (!product) {
        next.state = 'awaiting_product';
        return {
          session: next,
          replies: [`Elige primero un producto:\n${catalogMenu(options.currencySymbol)}`],
        };
      }
      if (!Number.isFinite(quantity) || quantity <= 0) {
        return { session: next, replies: ['Indicame la cantidad en numeros, por ejemplo: 12'] };
      }
      if (quantity < product.minQuantity) {
        return {
          session: next,
          replies: [
            `El pedido minimo es de ${product.minQuantity} ${product.unit}. Indicame una cantidad mayor o igual.`,
          ],
        };
      }
      next.draft.quantity = quantity;
      next.state = 'awaiting_date';
      return {
        session: next,
        replies: ['Para que fecha la necesitas? Usa el formato DD/MM/AAAA, o escribe "hoy" o "manana".'],
      };
    }

    case 'awaiting_date': {
      const parsed = parseDate(text, now);
      if (!parsed) {
        return {
          session: next,
          replies: ['No entendi la fecha. Usa el formato DD/MM/AAAA, por ejemplo 15/03/2026.'],
        };
      }
      next.draft.deliveryDate = parsed;
      next.state = 'awaiting_address';
      return { session: next, replies: ['Cual es la direccion de la obra?'] };
    }

    case 'awaiting_address': {
      if (text.length < 8) {
        return {
          session: next,
          replies: ['Necesito una direccion mas completa (calle, numero, colonia y ciudad).'],
        };
      }
      next.draft.address = text;
      next.state = 'awaiting_confirmation';
      const quote = draftToQuote(next);
      if (!quote) {
        const fresh = newSession(session.phone, now);
        fresh.state = 'awaiting_name';
        return {
          session: fresh,
          replies: ['Perdi algunos datos. Empecemos de nuevo: nombre del cliente o empresa.'],
        };
      }
      return {
        session: next,
        replies: [
          summarize(quote, options.currencySymbol),
          'Confirmas para generar la cotizacion en Zoho? Responde SI o NO.',
        ],
      };
    }

    case 'awaiting_confirmation': {
      if (['si', 'sí', 'confirmo', 'ok', 'dale'].includes(normalized)) {
        const quote = draftToQuote(next);
        if (!quote) {
          const fresh = newSession(session.phone, now);
          fresh.state = 'awaiting_name';
          return {
            session: fresh,
            replies: ['Perdi algunos datos. Empecemos de nuevo: nombre del cliente o empresa.'],
          };
        }
        next.state = 'completed';
        return { session: next, replies: ['Generando tu cotizacion en Zoho Books...'], quote };
      }
      if (['no', 'corregir', 'cambiar'].includes(normalized)) {
        const fresh = newSession(session.phone, now);
        fresh.state = 'awaiting_name';
        return { session: fresh, replies: ['Sin problema, empecemos de nuevo. Nombre del cliente o empresa?'] };
      }
      return { session: next, replies: ['Responde SI para generar la cotizacion o NO para corregirla.'] };
    }

    default: {
      const fresh = newSession(session.phone, now);
      fresh.state = 'awaiting_name';
      return { session: fresh, replies: ['Empecemos. Nombre del cliente o empresa?'] };
    }
  }
}
