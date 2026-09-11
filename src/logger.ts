type Level = 'debug' | 'info' | 'warn' | 'error';

const order: Record<Level, number> = { debug: 10, info: 20, warn: 30, error: 40 };

export interface Logger {
  debug(message: string, meta?: Record<string, unknown>): void;
  info(message: string, meta?: Record<string, unknown>): void;
  warn(message: string, meta?: Record<string, unknown>): void;
  error(message: string, meta?: Record<string, unknown>): void;
}

export function createLogger(level: Level = 'info'): Logger {
  const log = (entryLevel: Level, message: string, meta?: Record<string, unknown>) => {
    if (order[entryLevel] < order[level]) return;
    const payload = { level: entryLevel, time: new Date().toISOString(), message, ...meta };
    process.stdout.write(`${JSON.stringify(payload)}\n`);
  };

  return {
    debug: (m, meta) => log('debug', m, meta),
    info: (m, meta) => log('info', m, meta),
    warn: (m, meta) => log('warn', m, meta),
    error: (m, meta) => log('error', m, meta),
  };
}
