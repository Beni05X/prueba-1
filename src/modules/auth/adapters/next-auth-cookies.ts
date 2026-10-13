export function cookieLines(headers: Headers): string[] {
  const extended = headers as Headers & { getSetCookie?: () => string[] };
  const separate = extended.getSetCookie?.();
  const values = separate?.length ? separate : [headers.get('set-cookie') ?? ''];
  return values.flatMap(splitCookies).filter(Boolean);
}

// React Native can combine repeated headers. An Expires comma is not a cookie
// boundary; a boundary must be followed by another cookie name and '='.
function splitCookies(value: string): string[] {
  const lines: string[] = [];
  let start = 0;
  let quoted = false;
  for (let i = 0; i < value.length; i++) {
    if (value[i] === '"' && value[i - 1] !== '\\') quoted = !quoted;
    if (!quoted && value[i] === ',' && /^\s*[!#$%&'*+\-.^_`|~\da-zA-Z]+=/.test(value.slice(i + 1))) {
      lines.push(value.slice(start, i).trim());
      start = i + 1;
    }
  }
  lines.push(value.slice(start).trim());
  return lines;
}

function cookiePair(line: string): readonly [string, string] | null {
  const pair = line.split(';', 1)[0];
  const separator = pair.indexOf('=');
  if (separator < 1) return null;
  const name = pair.slice(0, separator).trim();
  if (!/^[!#$%&'*+\-.^_`|~\da-zA-Z]+$/.test(name)) return null;
  return [name, pair.slice(separator + 1).trim()];
}
const sessionName = /^(?:__Secure-)?(?:authjs|next-auth)\.session-token(?:\.\d+)?$/;
const csrfName = /^(?:__Host-)?(?:authjs|next-auth)\.csrf-token$/;

function expired(line: string): boolean {
  const maxAge = /;\s*Max-Age=(-?\d+)/i.exec(line);
  if (maxAge) return Number(maxAge[1]) <= 0;
  const expires = /;\s*Expires=([^;]+)/i.exec(line);
  return !!expires && Date.parse(expires[1]) <= Date.now();
}

/** Names only, safe for diagnostics. Never expose serialized cookie values. */
export function cookieNames(headers: Headers): string[] {
  return [...new Set(cookieLines(headers).flatMap((line) => {
    const pair = cookiePair(line);
    return pair ? [pair[0]] : [];
  }))];
}

export function sessionCookies(headers: Headers): Record<string, string> {
  const cookies: Record<string, string> = {};
  for (const line of cookieLines(headers)) {
    const pair = cookiePair(line);
    if (pair && sessionName.test(pair[0]) && pair[1] && !expired(line)) cookies[pair[0]] = pair[1];
  }
  return cookies;
}

export function csrfCookie(headers: Headers): string | null {
  const candidates: [string, string][] = [];
  for (const line of cookieLines(headers)) {
    const pair = cookiePair(line);
    if (pair && pair[1] && csrfName.test(pair[0]) && !expired(line)) candidates.push([pair[0], pair[1]]);
  }
  const pair = candidates.find(([name]) => name === '__Host-authjs.csrf-token')
    ?? candidates.find(([name]) => name === 'authjs.csrf-token') ?? candidates[0];
  return pair ? `${pair[0]}=${pair[1]}` : null;
}

export function callbackCookie(headers: Headers): string | null {
  for (const line of cookieLines(headers)) {
    const pair = cookiePair(line);
    if (pair && pair[1] && /^(?:__Secure-)?authjs\.callback-url$/.test(pair[0]) && !expired(line)) return `${pair[0]}=${pair[1]}`;
  }
  return null;
}

export function storedCookieHeader(raw: string): string | null {
  try {
    const value: unknown = JSON.parse(raw);
    if (typeof value !== 'object' || value === null || Array.isArray(value)) return null;
    const entries = Object.entries(value);
    if (!entries.length || entries.some(([name, cookie]) => !sessionName.test(name) || typeof cookie !== 'string' || !cookie || /[\s;,]/.test(cookie))) return null;
    return entries.map(([name, value]) => `${name}=${value}`).join('; ');
  } catch { return null; }
}

export type CsrfPair = Readonly<{ token: string; cookie: string }>;
export function storedCsrfPair(raw: string): CsrfPair | null {
  try {
    const value: unknown = JSON.parse(raw);
    if (typeof value !== 'object' || value === null || !('token' in value) || !('cookie' in value) || typeof value.token !== 'string' || !value.token || typeof value.cookie !== 'string') return null;
    const separator = value.cookie.indexOf('=');
    if (!csrfName.test(value.cookie.slice(0, separator)) || /[\s;,\\]/.test(value.cookie)) return null;
    const encoded = value.cookie.slice(value.cookie.indexOf('=') + 1);
    const serialized = encoded.startsWith('"') && encoded.endsWith('"') ? encoded.slice(1, -1) : encoded;
    const [token, hash, extra] = decodeURIComponent(serialized).split('|');
    return token === value.token && !!hash && extra === undefined ? { token: value.token, cookie: value.cookie } : null;
  } catch { return null; }
}
