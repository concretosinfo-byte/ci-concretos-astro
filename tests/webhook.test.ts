import { createHmac } from 'node:crypto';
import type { AddressInfo } from 'node:net';
import type { Server } from 'node:http';
import { afterEach, describe, expect, it, vi } from 'vitest';
import { loadConfig } from '../src/config.js';
import { createLogger } from '../src/logger.js';
import { createServer } from '../src/server.js';
import { isValidSignature } from '../src/whatsapp/signature.js';
import { buildEstimatePayload } from '../src/zoho/estimate.js';
import type { CompletedQuote } from '../src/quote/flow.js';

const env = {
  WHATSAPP_VERIFY_TOKEN: 'verify-token',
  WHATSAPP_APP_SECRET: 'app-secret',
  WHATSAPP_ACCESS_TOKEN: 'access-token',
  WHATSAPP_PHONE_NUMBER_ID: '1234567890',
  ZOHO_CLIENT_ID: 'client-id',
  ZOHO_CLIENT_SECRET: 'client-secret',
  ZOHO_REFRESH_TOKEN: 'refresh-token',
  ZOHO_ORGANIZATION_ID: '99999',
  ZOHO_WEBHOOK_TOKEN: 'webhook-token',
};

const config = loadConfig(env as NodeJS.ProcessEnv);
const logger = createLogger('error');

function startServer() {
  const sent: Array<{ to: string; body: string }> = [];
  const app = createServer({
    config,
    logger,
    whatsapp: {
      sendText: async (to, body) => {
        sent.push({ to, body });
      },
    },
    zoho: {
      createEstimateForQuote: vi.fn(async () => ({
        estimateId: '1',
        estimateNumber: 'EST-0001',
        total: 100,
        status: 'draft',
      })),
      getEstimate: vi.fn(async (estimateId: string) => ({
        estimateId,
        estimateNumber: 'EST-0001',
        total: 35100,
        status: 'sent',
        referenceNumber: 'WA-5215512345678',
        customerName: 'Constructora Delta',
        estimateUrl: 'https://books.zoho.com/estimate/abc',
      })),
    },
  });
  const server = app.listen(0);
  const { port } = server.address() as AddressInfo;
  return { server, port, sent };
}

let running: Server | undefined;

afterEach(() => {
  running?.close();
  running = undefined;
});

describe('webhook de WhatsApp', () => {
  it('responde al handshake de verificacion', async () => {
    const { server, port } = startServer();
    running = server;
    const response = await fetch(
      `http://127.0.0.1:${port}/webhook/whatsapp?hub.mode=subscribe&hub.verify_token=verify-token&hub.challenge=42`,
    );
    expect(response.status).toBe(200);
    expect(await response.text()).toBe('42');
  });

  it('rechaza un token de verificacion incorrecto', async () => {
    const { server, port } = startServer();
    running = server;
    const response = await fetch(
      `http://127.0.0.1:${port}/webhook/whatsapp?hub.mode=subscribe&hub.verify_token=malo&hub.challenge=42`,
    );
    expect(response.status).toBe(403);
  });

  it('rechaza payloads sin firma valida', async () => {
    const { server, port } = startServer();
    running = server;
    const response = await fetch(`http://127.0.0.1:${port}/webhook/whatsapp`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', 'x-hub-signature-256': 'sha256=deadbeef' },
      body: JSON.stringify({ object: 'whatsapp_business_account', entry: [] }),
    });
    expect(response.status).toBe(401);
  });

  it('contesta el saludo inicial cuando la firma es valida', async () => {
    const { server, port, sent } = startServer();
    running = server;
    const body = JSON.stringify({
      object: 'whatsapp_business_account',
      entry: [
        {
          changes: [
            {
              value: {
                messages: [{ from: '5215512345678', id: 'wamid.1', type: 'text', text: { body: 'hola' } }],
              },
            },
          ],
        },
      ],
    });
    const signature = `sha256=${createHmac('sha256', env.WHATSAPP_APP_SECRET).update(body).digest('hex')}`;

    const response = await fetch(`http://127.0.0.1:${port}/webhook/whatsapp`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', 'x-hub-signature-256': signature },
      body,
    });
    expect(response.status).toBe(200);

    await vi.waitFor(() => expect(sent.length).toBeGreaterThan(0));
    expect(sent[0]?.to).toBe('5215512345678');
    expect(sent[0]?.body).toContain('CI Concretos');
  });
});

describe('webhook de aprobacion de Zoho', () => {
  it('rechaza llamadas sin el token compartido', async () => {
    const { server, port } = startServer();
    running = server;
    const response = await fetch(`http://127.0.0.1:${port}/webhook/zoho/estimate-approved`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ estimate_id: '1' }),
    });
    expect(response.status).toBe(401);
  });

  it('envia la cotizacion aprobada al telefono del reference_number', async () => {
    const { server, port, sent } = startServer();
    running = server;
    const response = await fetch(`http://127.0.0.1:${port}/webhook/zoho/estimate-approved`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', 'x-webhook-token': 'webhook-token' },
      body: JSON.stringify({ estimate: { estimate_id: '1' } }),
    });
    expect(response.status).toBe(202);

    await vi.waitFor(() => expect(sent.length).toBeGreaterThan(0));
    expect(sent[0]?.to).toBe('5215512345678');
    expect(sent[0]?.body).toContain('EST-0001');
    expect(sent[0]?.body).toContain('https://books.zoho.com/estimate/abc');
  });
});

describe('firma', () => {
  it('valida el HMAC del cuerpo crudo', () => {
    const raw = '{"a":1}';
    const signature = `sha256=${createHmac('sha256', 'secreto').update(raw).digest('hex')}`;
    expect(isValidSignature(raw, signature, 'secreto')).toBe(true);
    expect(isValidSignature(raw, signature, 'otro')).toBe(false);
    expect(isValidSignature(raw, undefined, 'secreto')).toBe(false);
  });
});

describe('payload de Zoho', () => {
  it('arma la estimacion con una linea por producto', () => {
    const quote: CompletedQuote = {
      phone: '5215512345678',
      customerName: 'Constructora Delta',
      product: {
        sku: 'CONC-250',
        name: "Concreto premezclado f'c 250 kg/cm2",
        description: 'desc',
        unit: 'm3',
        unitPrice: 2340,
        minQuantity: 7,
      },
      quantity: 15,
      deliveryDate: '2026-03-15',
      address: 'Av. Insurgentes Sur 1234',
      subtotal: 35100,
    };

    const payload = buildEstimatePayload(quote, 'contact-1');
    expect(payload.customer_id).toBe('contact-1');
    expect(payload.date).toBe('2026-03-15');
    expect(payload.line_items).toHaveLength(1);
    expect(payload.line_items[0]).toMatchObject({ rate: 2340, quantity: 15, unit: 'm3' });
  });
});
