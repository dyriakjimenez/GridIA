import { parseGridJSON } from './parsing';

const MODEL = 'claude-sonnet-4-5';

let __ultimaLlamada = 0;

const wait = (ms: number) => new Promise((r) => setTimeout(r, ms));

export function traducirError(err: any): string {
  const m = (err && err.message) || '';
  if (m.startsWith('LIMIT|')) {
    const ep = parseInt(m.split('|')[1]);
    let cuando = '';
    if (ep) {
      const d = new Date(ep * 1000);
      const hoy = new Date().toDateString() === d.toDateString();
      cuando = ' Se restablece ' + (hoy ? 'hoy' : 'el ' + d.toLocaleDateString('es-MX', { day: '2-digit', month: 'short' })) + ' a las ' + d.toLocaleTimeString('es-MX', { hour: '2-digit', minute: '2-digit' }).replace(/\\s*\\./g, '') + '.';
    }
    return 'Alcanzaste el límite de uso de Claude de tu cuenta (no es un fallo de la herramienta: cada generación consume tu cuota).' + cuando + ' Al reanudar, genera de a una zona y con menos publicaciones para que rinda más.';
  }
  if (m === 'OVERLOADED') return 'La IA sigue saturada tras varios reintentos automáticos (~1.5 min de espera acumulada). Suele ser un límite temporal por minuto: espera 2–3 minutos y vuelve a intentar.';
  if (/fetch|network/i.test(m)) return 'Sin conexión con el servicio de IA. Revisa tu internet y reintenta.';
  return m || 'Ocurrió un error al generar la parrilla.';
}

export async function callClaudeGrid(prompt: string, files: any[]): Promise<any> {
  const gap = Date.now() - __ultimaLlamada;
  if (gap < 3000) await new Promise((r) => setTimeout(r, 3000 - gap));
  __ultimaLlamada = Date.now();
  let content: any;
  
  if (files && files.length) {
    content = [];
    files.forEach((f) => {
      if (f.mime === 'application/pdf') content.push({ type: 'document', source: { type: 'base64', media_type: 'application/pdf', data: f.data } });
      else if (f.mime.startsWith('image/')) content.push({ type: 'image', source: { type: 'base64', media_type: f.mime, data: f.data } });
    });
    content.push({ type: 'text', text: prompt });
  } else {
    content = prompt;
  }
  
  const res = await fetch('https://api.anthropic.com/v1/messages', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ model: MODEL, max_tokens: 8000, messages: [{ role: 'user', content }] }),
  });
  
  if (!res.ok) {
    let cuerpo = '';
    try { cuerpo = await res.text(); } catch (e) { cuerpo = ''; }
    if (/exceeded_limit|"type"\\s*:\\s*"rate_limit|Límite alcanzado/i.test(cuerpo)) {
      const m = cuerpo.match(/"resetsAt"\\s*:\\s*(\\d+)/) || cuerpo.match(/"resets_at"\\s*:\\s*(\\d+)/);
      throw new Error('LIMIT|' + (m ? m[1] : ''));
    }
    if (res.status === 429 || res.status === 529) throw new Error('OVERLOADED');
    throw new Error('La IA no pudo responder (código ' + res.status + '). Espera unos segundos e inténtalo otra vez.');
  }
  
  const data = await res.json();
  const text = (data.content || []).filter((b: any) => b.type === 'text').map((b: any) => b.text).join('\\n');
  if (!text) throw new Error('La IA devolvió una respuesta vacía. Vuelve a generar la parrilla.');
  try {
    return parseGridJSON(text);
  } catch (e) {
    throw new Error('La respuesta de la IA llegó incompleta o ilegible.');
  }
}

export async function callWithRetry(prompt: string, files: any[], onStatus?: (msg: string | null) => void): Promise<any> {
  const ESPERAS_DEMANDA = [12, 25, 40];
  let lastErr = null;
  for (let intento = 0; intento <= 3; intento++) {
    try {
      if (onStatus) onStatus(null);
      return await callClaudeGrid(prompt, files);
    } catch (ex: any) {
      lastErr = ex;
      if (ex && String(ex.message || '').startsWith('LIMIT|')) throw ex;
      const saturado = ex && ex.message === 'OVERLOADED';
      const fueUltimo = saturado ? intento === 3 : intento === 2;
      if (fueUltimo) break;
      const seg = saturado ? ESPERAS_DEMANDA[intento] : 3;
      for (let s = seg; s > 0; s--) {
        if (onStatus) onStatus(saturado
          ? 'Alta demanda de IA detectada · reintento automático en ' + s + ' s (intento ' + (intento + 2) + ' de 4)'
          : 'Hubo un detalle con la respuesta · reintentando en ' + s + ' s…');
        await wait(1000);
      }
    }
  }
  throw lastErr || new Error('Sin respuesta de la IA.');
}
