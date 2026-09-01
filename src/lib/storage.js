/* ============ ARMAZENAMENTO (Supabase — versão web publicada) ============ */
export const SUPA_URL = "https://wcarxggugedqzfredmdd.supabase.co";
export const SUPA_ANON_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6IndjYXJ4Z2d1Z2VkcXpmcmVkbWRkIiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODc4NTgzNTEsImV4cCI6MjEwMzQzNDM1MX0.KFa565es3VGduwNIBHOMj93dfTlPoPlFE_XWvnj5frU";

// Mantido em memória e atualizado pelo auth.js (onAuthStateChange) — evita ter que
// tornar supaHeaders()/todo o resto do app assíncrono só pra ler o token atual.
let currentAccessToken = null;
export function setCurrentAccessToken(token) {
  currentAccessToken = token;
}

/* Modo pré-visualização de plano de convidado: os DADOS pessoais do dono
   da conta (históricos, refeições, peso, perfil, últimas cargas) ficam
   invisíveis, simulando a conta zerada que o convidado verá. As chaves de
   plano ('plan', 'plan_*') continuam acessíveis. */
let previewGuest = false;
export function setPreviewGuestMode(on) { previewGuest = !!on; }
export function isPreviewGuest() { return previewGuest; }
const DADO_PESSOAL = /^(log:|meal:|lastset:|weight:)|^profile$|^corridaSemana$/;

function supaTableFor(key) {
  if (key.startsWith('log:')) return 'logs';
  if (key.startsWith('meal:')) return 'meals';
  if (key.startsWith('lastset:')) return 'lastset';
  return 'misc_kv';
}
export function supaHeaders(extra) {
  return Object.assign({ apikey: SUPA_ANON_KEY, Authorization: 'Bearer ' + (currentAccessToken || SUPA_ANON_KEY) }, extra || {});
}

export const storage = {
  async get(key) {
    if (previewGuest && DADO_PESSOAL.test(key)) return null;
    const table = supaTableFor(key);
    const url = `${SUPA_URL}/rest/v1/${table}?key=eq.${encodeURIComponent(key)}&select=value`;
    const res = await fetch(url, { headers: supaHeaders() });
    if (!res.ok) throw new Error('Storage get failed: ' + res.status);
    const rows = await res.json();
    if (!rows.length) return null;
    return { key, value: JSON.stringify(rows[0].value), shared: false };
  },
  async set(key, value) {
    // em pré-visualização nada é gravado — nem na conta do dono, nem em lugar algum
    if (previewGuest && DADO_PESSOAL.test(key)) return { key, value, shared: false, preview: true };
    const table = supaTableFor(key);
    const parsed = JSON.parse(value);
    const res = await fetch(`${SUPA_URL}/rest/v1/${table}`, {
      method: 'POST',
      headers: supaHeaders({ 'Content-Type': 'application/json', Prefer: 'resolution=merge-duplicates,return=minimal' }),
      body: JSON.stringify({ key, value: parsed, updated_at: new Date().toISOString() })
    });
    if (!res.ok) throw new Error('Storage set failed: ' + res.status);
    return { key, value, shared: false };
  },
  async delete(key) {
    if (previewGuest && DADO_PESSOAL.test(key)) return { key, deleted: true, shared: false, preview: true };
    const table = supaTableFor(key);
    const res = await fetch(`${SUPA_URL}/rest/v1/${table}?key=eq.${encodeURIComponent(key)}`, {
      method: 'DELETE', headers: supaHeaders()
    });
    if (!res.ok) throw new Error('Storage delete failed: ' + res.status);
    return { key, deleted: true, shared: false };
  },
  async list(prefix) {
    if (previewGuest && prefix && DADO_PESSOAL.test(prefix)) return { keys: [], prefix, shared: false };
    const table = supaTableFor(prefix || '');
    const params = new URLSearchParams({ select: 'key' });
    if (prefix) params.set('key', `like.${prefix}*`);
    const res = await fetch(`${SUPA_URL}/rest/v1/${table}?${params.toString()}`, { headers: supaHeaders() });
    if (!res.ok) throw new Error('Storage list failed: ' + res.status);
    const rows = await res.json();
    return { keys: rows.map(r => r.key), prefix, shared: false };
  }
};
