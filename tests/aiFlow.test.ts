import { describe, expect, it } from 'vitest';
import type { AiAgent, AiExtraction } from '../src/ai/agent.js';
import { handleMessageWithAi } from '../src/quote/aiFlow.js';
import { newSession } from '../src/quote/flow.js';

const now = new Date('2026-03-10T12:00:00Z');

function stubAgent(extraction: AiExtraction): AiAgent {
  return { respond: async () => extraction };
}

describe('handleMessageWithAi', () => {
  it('guarda el historial y no cotiza hasta que el cliente confirma', async () => {
    const result = await handleMessageWithAi(
      newSession('5215512345678', now),
      'necesito concreto',
      stubAgent({ reply: 'Claro, para que obra?', confirmed: false }),
      now,
    );

    expect(result.quote).toBeUndefined();
    expect(result.session.history).toHaveLength(2);
    expect(result.session.history[1]?.content).toBe('Claro, para que obra?');
  });

  it('genera la cotizacion cuando el modelo devuelve todos los datos confirmados', async () => {
    const result = await handleMessageWithAi(
      newSession('5215512345678', now),
      'si, confirmo',
      stubAgent({
        reply: 'Perfecto, la registro.',
        customerName: 'Constructora Delta',
        productSku: 'CONC-250',
        quantity: 15,
        deliveryDate: '2026-03-15',
        address: 'Av. Insurgentes Sur 1234, CDMX',
        confirmed: true,
      }),
      now,
    );

    expect(result.quote?.subtotal).toBe(35100);
    expect(result.session.state).toBe('completed');
  });

  it('ignora productos y cantidades invalidas devueltos por el modelo', async () => {
    const result = await handleMessageWithAi(
      newSession('5215512345678', now),
      'si',
      stubAgent({
        reply: 'Listo',
        customerName: 'Obras del Norte',
        productSku: 'NO-EXISTE',
        quantity: 2,
        deliveryDate: '2026-03-15',
        address: 'Calle Pino 45, Monterrey',
        confirmed: true,
      }),
      now,
    );

    expect(result.quote).toBeUndefined();
    expect(result.session.draft.product).toBeUndefined();
  });

  it('cancela sin llamar al modelo', async () => {
    const agent: AiAgent = {
      respond: async () => {
        throw new Error('no deberia llamarse');
      },
    };
    const result = await handleMessageWithAi(newSession('5215512345678', now), 'cancelar', agent, now);
    expect(result.session.state).toBe('start');
    expect(result.replies[0]).toContain('cancelada');
  });
});
