// Lightweight client-side "WAF" helpers.
// NOT a true network firewall (a real WAF lives in front of your hosting, e.g. Cloudflare).
// These helpers reduce common in-app abuse: XSS payloads in form fields and brute-force loops.

const XSS_PATTERNS = [
  /<\s*script\b[^>]*>/i,
  /<\s*iframe\b[^>]*>/i,
  /\son\w+\s*=/i,           // inline event handlers
  /javascript\s*:/i,
  /data\s*:\s*text\/html/i,
];

const SQLI_PATTERNS = [
  /(\b)(union\s+select|drop\s+table|insert\s+into|delete\s+from|update\s+\w+\s+set)(\b)/i,
  /(\s|^)(--|#|\/\*)/,
];

export interface SanitizeResult {
  clean: string;
  blocked: boolean;
  reason?: string;
}

/** Strip dangerous markup/SQL-like sequences from arbitrary text input. */
export const sanitizeInput = (raw: string, opts: { maxLen?: number } = {}): SanitizeResult => {
  const maxLen = opts.maxLen ?? 2000;
  let s = (raw ?? "").toString();
  if (s.length > maxLen) s = s.slice(0, maxLen);
  let blocked = false;
  let reason: string | undefined;
  for (const p of XSS_PATTERNS) {
    if (p.test(s)) { blocked = true; reason = "Potentially unsafe markup detected"; break; }
  }
  if (!blocked) {
    for (const p of SQLI_PATTERNS) {
      if (p.test(s)) { blocked = true; reason = "Potentially unsafe query detected"; break; }
    }
  }
  // Always escape angle brackets defensively even if not blocked.
  const clean = s.replace(/<[^>]*>/g, "");
  return { clean, blocked, reason };
};

/**
 * In-memory + localStorage sliding-window rate limit.
 * Returns true when the action is allowed, false when limited.
 */
export const rateLimit = (key: string, max: number, windowMs: number): boolean => {
  const k = `waf_rl_${key}`;
  const now = Date.now();
  let arr: number[] = [];
  try { arr = JSON.parse(localStorage.getItem(k) || "[]"); } catch { arr = []; }
  arr = arr.filter((t) => now - t < windowMs);
  if (arr.length >= max) {
    localStorage.setItem(k, JSON.stringify(arr));
    return false;
  }
  arr.push(now);
  localStorage.setItem(k, JSON.stringify(arr));
  return true;
};
