import { parseLista } from '../ai/parsing';

const MODEL = 'claude-sonnet-4-5';

let __ultimaLlamada = 0;
const wait = (ms: number) => new Promise((r) => setTimeout(r, ms));

export async function fetchTrending({ pais, mes, temas, redes }: { pais: string, mes: string, temas: string[], redes: string[] }) {
  const gap = Date.now() - __ultimaLlamada;
  if (gap < 3000) await wait(3000 - gap);
  __ultimaLlamada = Date.now();
  
  const prompt = \`Consulta Google Trends (trends.google.com) y fuentes de la industria para identificar qué términos y temas de MARKETING están en aumento AHORA (\${mes} de \${new Date().getFullYear()}) en \${pais}.

Busca específicamente consultas en tendencia o en aumento dentro de este universo, NO tendencias generales:
marketing digital, growth, paid media, Meta Ads, Google Ads, performance marketing, generación y calidad de leads, funnels, CRO, e-commerce, ROAS, CAC, atribución, analítica, automatización, CRM, SEO, demand generation, marketing B2B, creatividad publicitaria e inteligencia artificial aplicada al marketing.

REGLAS ESTRICTAS
- DESCARTA por completo cualquier tendencia ajena al marketing: espectáculos, deportes, política, noticias, celebridades o efemérides sin relación con el sector. Si un término está en tendencia pero no sirve a una agencia B2B, no lo incluyas.
- DESCARTA hashtags genéricos y sobresaturados que no aporten alcance real (por ejemplo los de una sola palabra común) y cualquiera ligado a polémicas o temas sensibles.
- Prioriza términos con señal real de crecimiento en búsquedas o en conversación profesional del sector.
\${(temas && temas.length) ? '- Da preferencia a los que se relacionen con estos temas del mes: ' + temas.join(', ') + '.' : ''}
\${(redes && redes.length) ? '- Contexto de publicación: ' + redes.join(', ') + '.' : ''}

Devuelve de 8 a 12 hashtags. Responde ÚNICAMENTE con un arreglo JSON válido, sin markdown ni texto alrededor:
[{"tag":"#EjemploHashtag","tema":"subtema de marketing al que pertenece, 1 a 3 palabras","motivo":"señal de tendencia y fuente, máximo 12 palabras"}]\`;

  const res = await fetch('https://api.anthropic.com/v1/messages', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      model: MODEL,
      max_tokens: 1800,
      messages: [{ role: 'user', content: prompt }],
      tools: [{ type: 'web_search_20250305', name: 'web_search' }],
    }),
  });
  
  if (!res.ok) throw new Error(res.status === 429 || res.status === 529 ? 'Hay mucha demanda en este momento. Espera un minuto e inténtalo otra vez.' : 'No se pudo consultar la web (código ' + res.status + ').');
  const data = await res.json();
  const text = (data.content || []).filter((b: any) => b.type === 'text').map((b: any) => b.text).join('\\n');
  const lista = parseLista(text);
  
  return lista.filter((x: any) => x && x.tag).map((x: any) => ({
    tag: String(x.tag).trim().replace(/^#*/, '#').replace(/\\s+/g, ''),
    tema: String(x.tema || '').trim(),
    motivo: String(x.motivo || '').trim(),
  }));
}

export async function fetchDemandaSEO(endpoint: string, geo: string, periodo: string) {
  const base = String(endpoint || '').trim();
  if (!/^https:\\/\\//i.test(base)) throw new Error('La URL del servicio debe empezar con https://');
  const url = base + (base.indexOf('?') === -1 ? '?' : '&') + 'geo=' + encodeURIComponent(geo) + '&periodo=' + encodeURIComponent(periodo);
  
  let res;
  try {
    res = await fetch(url, { redirect: 'follow' });
  } catch (e) {
    throw new Error('No se pudo contactar el servicio. Verifica que la URL sea correcta y que permita el acceso desde el navegador (CORS).');
  }
  if (!res.ok) throw new Error('El servicio respondió con código ' + res.status + '.');
  
  let data;
  try { data = await res.json(); } catch (e) { throw new Error('El servicio no devolvió JSON válido.'); }
  if (data && data.error) throw new Error(data.error);
  
  const arr = Array.isArray(data) ? data : (data && Array.isArray(data.terminos) ? data.terminos : null);
  if (!arr) throw new Error('La respuesta no incluye el arreglo "terminos".');
  
  const limpio = arr.filter((x: any) => x && x.termino).map((x: any) => ({
    termino: String(x.termino).trim(),
    semilla: String(x.semilla || '').trim(),
    interes: Number(x.interes) || 0,
    variacion: String(x.variacion || '').trim(),
    tipo: String(x.tipo || '').trim(),
  }));
  
  if (!limpio.length) throw new Error('El servicio no devolvió términos.');
  return limpio;
}
