import type { Config } from '../config.js';
import type { Logger } from '../logger.js';
import type { CompletedQuote } from '../quote/flow.js';
import { buildEstimatePayload } from './estimate.js';

export interface CreatedEstimate {
  estimateId: string;
  estimateNumber: string;
  total: number;
  status: string;
}

export interface EstimateDetails {
  estimateId: string;
  estimateNumber: string;
  total: number;
  status: string;
  referenceNumber: string;
  customerName: string;
  estimateUrl?: string;
}

export interface ZohoClient {
  createEstimateForQuote(quote: CompletedQuote): Promise<CreatedEstimate>;
  getEstimate(estimateId: string): Promise<EstimateDetails>;
}

interface TokenCache {
  accessToken: string;
  expiresAt: number;
}

export function createZohoClient(config: Config, logger: Logger): ZohoClient {
  let cache: TokenCache | undefined;

  async function accessToken(): Promise<string> {
    if (cache && cache.expiresAt > Date.now() + 60_000) return cache.accessToken;

    const params = new URLSearchParams({
      refresh_token: config.ZOHO_REFRESH_TOKEN,
      client_id: config.ZOHO_CLIENT_ID,
      client_secret: config.ZOHO_CLIENT_SECRET,
      grant_type: 'refresh_token',
    });
    const response = await fetch(`${config.ZOHO_ACCOUNTS_DOMAIN}/oauth/v2/token?${params.toString()}`, {
      method: 'POST',
    });
    const body = (await response.json()) as { access_token?: string; expires_in?: number; error?: string };
    if (!response.ok || !body.access_token) {
      logger.error('No se pudo renovar el token de Zoho', { status: response.status, error: body.error });
      throw new Error('No se pudo renovar el token de Zoho');
    }
    cache = {
      accessToken: body.access_token,
      expiresAt: Date.now() + (body.expires_in ?? 3600) * 1000,
    };
    return cache.accessToken;
  }

  async function booksRequest<T>(
    path: string,
    init: { method: 'GET' | 'POST'; body?: unknown; query?: Record<string, string> } = { method: 'GET' },
  ): Promise<T> {
    const token = await accessToken();
    const query = new URLSearchParams({
      organization_id: config.ZOHO_ORGANIZATION_ID,
      ...(init.query ?? {}),
    });
    const response = await fetch(`${config.ZOHO_API_DOMAIN}/books/v3${path}?${query.toString()}`, {
      method: init.method,
      headers: {
        Authorization: `Zoho-oauthtoken ${token}`,
        'Content-Type': 'application/json',
      },
      body: init.body === undefined ? undefined : JSON.stringify(init.body),
    });
    const payload = (await response.json()) as T & { code?: number; message?: string };
    if (!response.ok || (payload.code !== undefined && payload.code !== 0)) {
      logger.error('Error en la API de Zoho Books', {
        path,
        status: response.status,
        code: payload.code,
        message: payload.message,
      });
      throw new Error(`Zoho Books ${path} respondio ${response.status}: ${payload.message ?? 'error'}`);
    }
    return payload;
  }

  async function findOrCreateContact(quote: CompletedQuote): Promise<string> {
    const search = await booksRequest<{ contacts: Array<{ contact_id: string; contact_name: string }> }>(
      '/contacts',
      { method: 'GET', query: { phone: quote.phone } },
    );
    const existing = search.contacts?.[0];
    if (existing) return existing.contact_id;

    const created = await booksRequest<{ contact: { contact_id: string } }>('/contacts', {
      method: 'POST',
      body: {
        contact_name: quote.customerName,
        company_name: quote.customerName,
        contact_type: 'customer',
        contact_persons: [
          {
            first_name: quote.customerName,
            phone: quote.phone,
            is_primary_contact: true,
          },
        ],
      },
    });
    return created.contact.contact_id;
  }

  return {
    async createEstimateForQuote(quote) {
      const customerId = await findOrCreateContact(quote);
      const payload = buildEstimatePayload(quote, customerId);
      const created = await booksRequest<{
        estimate: { estimate_id: string; estimate_number: string; total: number; status: string };
      }>('/estimates', { method: 'POST', body: payload });

      return {
        estimateId: created.estimate.estimate_id,
        estimateNumber: created.estimate.estimate_number,
        total: created.estimate.total,
        status: created.estimate.status,
      };
    },

    async getEstimate(estimateId) {
      const fetched = await booksRequest<{
        estimate: {
          estimate_id: string;
          estimate_number: string;
          total: number;
          status: string;
          reference_number?: string;
          customer_name?: string;
          estimate_url?: string;
        };
      }>(`/estimates/${encodeURIComponent(estimateId)}`, { method: 'GET' });

      return {
        estimateId: fetched.estimate.estimate_id,
        estimateNumber: fetched.estimate.estimate_number,
        total: fetched.estimate.total,
        status: fetched.estimate.status,
        referenceNumber: fetched.estimate.reference_number ?? '',
        customerName: fetched.estimate.customer_name ?? '',
        estimateUrl: fetched.estimate.estimate_url,
      };
    },
  };
}
