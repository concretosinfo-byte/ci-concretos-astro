import { newSession, type QuoteSession } from './flow.js';

export interface SessionStore {
  get(phone: string): QuoteSession;
  set(session: QuoteSession): void;
  delete(phone: string): void;
}

export function createMemoryStore(ttlMinutes: number): SessionStore {
  const sessions = new Map<string, QuoteSession>();
  const ttlMs = ttlMinutes * 60 * 1000;

  return {
    get(phone) {
      const existing = sessions.get(phone);
      if (!existing) return newSession(phone);
      if (Date.now() - existing.updatedAt > ttlMs) {
        sessions.delete(phone);
        return newSession(phone);
      }
      return existing;
    },
    set(session) {
      sessions.set(session.phone, session);
    },
    delete(phone) {
      sessions.delete(phone);
    },
  };
}
