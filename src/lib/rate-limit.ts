/**
 * Rate limiter simples em memória.
 * Para produção com múltiplas instâncias, trocar por Redis/Upstash.
 */

interface RateLimitEntry {
  count: number;
  resetAt: number;
}

const store = new Map<string, RateLimitEntry>();

// Limpa entradas expiradas a cada 5 min
setInterval(() => {
  const now = Date.now();
  store.forEach((entry, key) => {
    if (now > entry.resetAt) store.delete(key);
  });
}, 5 * 60 * 1000);

interface RateLimitOptions {
  /** Número máximo de requisições na janela */
  limit: number;
  /** Janela de tempo em segundos */
  windowSeconds: number;
}

export function rateLimit(
  identifier: string,
  { limit, windowSeconds }: RateLimitOptions
): { success: boolean; remaining: number } {
  const now = Date.now();
  const entry = store.get(identifier);

  if (!entry || now > entry.resetAt) {
    store.set(identifier, { count: 1, resetAt: now + windowSeconds * 1000 });
    return { success: true, remaining: limit - 1 };
  }

  if (entry.count >= limit) {
    return { success: false, remaining: 0 };
  }

  entry.count++;
  return { success: true, remaining: limit - entry.count };
}
