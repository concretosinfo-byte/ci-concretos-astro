import type { CompletedQuote } from '../quote/flow.js';

export interface EstimatePayload {
  customer_id: string;
  date: string;
  reference_number: string;
  notes: string;
  custom_body: string;
  line_items: Array<{
    name: string;
    description: string;
    rate: number;
    quantity: number;
    unit: string;
  }>;
}

export function buildEstimatePayload(quote: CompletedQuote, customerId: string): EstimatePayload {
  return {
    customer_id: customerId,
    date: quote.deliveryDate,
    reference_number: `WA-${quote.phone}`,
    notes: `Cotizacion solicitada por WhatsApp desde +${quote.phone}.`,
    custom_body: `Entrega: ${quote.deliveryDate} en ${quote.address}`,
    line_items: [
      {
        name: quote.product.name,
        description: `${quote.product.description}. Entrega en ${quote.address}.`,
        rate: quote.product.unitPrice,
        quantity: quote.quantity,
        unit: quote.product.unit,
      },
    ],
  };
}
