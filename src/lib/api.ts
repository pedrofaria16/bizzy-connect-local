// Small API helper that injects dev auth header (x-user-id) from localStorage
export function getStoredUserId() {
  if (typeof window === 'undefined') return null;
  const raw = localStorage.getItem('bizzy_user') || localStorage.getItem('user');
  console.debug('[api] getStoredUserId raw:', raw);
  if (!raw) return null;
  try {
    const parsed = JSON.parse(raw);
    if (parsed == null) return null;
    // common shapes: { id: 1 } or { user: { id: 1 } } or { _id: '...' }
    if (typeof parsed === 'object') {
      const getIfValid = (v: any) => {
        if (v == null) return null;
        if (typeof v === 'number') return v;
        if (typeof v === 'string' && /^\d+$/.test(v)) return v;
        return null;
      };
      const tryKeys = [parsed.id, parsed._id, (parsed as any).user?.id, (parsed as any).user?._id];
      for (const k of tryKeys) {
        const ok = getIfValid(k);
        if (ok != null) return ok;
      }
      // fallback: search object values for a numeric-looking value
      for (const v of Object.values(parsed)) {
        const ok = getIfValid(v);
        if (ok != null) return ok;
      }
      console.debug('[api] getStoredUserId parsed but no numeric id found:', parsed);
      return null;
    }
    // raw parsed primitive: return only if numeric-like
    if (typeof parsed === 'number') return parsed;
    if (typeof parsed === 'string' && /^\d+$/.test(parsed)) return parsed;
    console.debug('[api] getStoredUserId parsed primitive not numeric:', parsed);
    return null;
  } catch (e) {
    // raw is not JSON, return as-is if non-empty
    console.debug('[api] getStoredUserId raw non-json:', raw);
    return raw || null;
  }
}

export async function apiFetch(path: string, opts: any = {}) {
  const headers = Object.assign({}, opts.headers || {});
  const id = getStoredUserId();
  if (id) headers['x-user-id'] = String(id);
  const res = await fetch(path, { ...opts, headers });
  return res;
}

export async function apiJson(path: string, opts: any = {}) {
  const res = await apiFetch(path, opts);
  const json = await res.json().catch(() => ({}));
  if (!res.ok) throw new Error(json.error || json.message || 'API error');
  return json;
}
