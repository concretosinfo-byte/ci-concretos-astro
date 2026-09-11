import { describe, expect, it } from 'vitest';
import { handleMessage, newSession, parseDate, type QuoteSession } from '../src/quote/flow.js';

const options = { currencySymbol: '$' };
const now = new Date('2026-03-10T12:00:00Z');

function run(session: QuoteSession, messages: string[]) {
  let current = session;
  let last = handleMessage(current, messages[0] ?? '', { ...options, now });
  current = last.session;
  for (const message of messages.slice(1)) {
    last = handleMessage(current, message, { ...options, now });
    current = last.session;
  }
  return last;
}

describe('parseDate', () => {
  it('acepta formatos latinos, ISO y palabras clave', () => {
    expect(parseDate('15/03/2026', now)).toBe('2026-03-15');
    expect(parseDate('2026-03-15', now)).toBe('2026-03-15');
    expect(parseDate('hoy', now)).toBe('2026-03-10');
    expect(parseDate('manana', now)).toBe('2026-03-11');
  });

  it('rechaza fechas invalidas', () => {
    expect(parseDate('31/02/2026', now)).toBeUndefined();
    expect(parseDate('proxima semana', now)).toBeUndefined();
  });
});

describe('handleMessage', () => {
  it('completa el flujo y devuelve la cotizacion', () => {
    const result = run(newSession('5215512345678', now), [
      'hola',
      'Constructora Delta',
      '2',
      '15',
      '15/03/2026',
      'Av. Insurgentes Sur 1234, Del Valle, CDMX',
      'si',
    ]);

    expect(result.session.state).toBe('completed');
    expect(result.quote).toBeDefined();
    expect(result.quote?.product.sku).toBe('CONC-250');
    expect(result.quote?.quantity).toBe(15);
    expect(result.quote?.deliveryDate).toBe('2026-03-15');
    expect(result.quote?.subtotal).toBe(35100);
  });

  it('rechaza cantidades por debajo del minimo', () => {
    const result = run(newSession('5215512345678', now), ['hola', 'Obras del Norte', '1', '3']);
    expect(result.session.state).toBe('awaiting_quantity');
    expect(result.replies[0]).toContain('pedido minimo');
    expect(result.quote).toBeUndefined();
  });

  it('permite cancelar en cualquier momento', () => {
    const result = run(newSession('5215512345678', now), ['hola', 'Obras del Norte', 'cancelar']);
    expect(result.session.state).toBe('start');
    expect(result.quote).toBeUndefined();
  });

  it('no genera cotizacion si el cliente no confirma', () => {
    const result = run(newSession('5215512345678', now), [
      'hola',
      'Obras del Norte',
      '1',
      '10',
      'hoy',
      'Calle Pino 45, Centro, Monterrey',
      'no',
    ]);
    expect(result.quote).toBeUndefined();
    expect(result.session.state).toBe('awaiting_name');
  });
});
