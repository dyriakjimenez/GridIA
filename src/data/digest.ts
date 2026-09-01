import { Post } from '../domain/schema';

export interface BaseResumen {
  total: number;
  plataformas: { v: string; n: number }[];
  tipos: { v: string; n: number }[];
  campanas: string[];
  dias: { v: string; n: number }[];
  horas: { v: string; n: number }[];
  desde: string;
  hasta: string;
}

const norm = (v: any) => String(v == null ? '' : v).replace(/\\r\\n?/g, '\\n').trim();

export function baseResumen(filas: any[]): BaseResumen {
  const cuenta = (campo: string) => {
    const m: Record<string, number> = {};
    filas.forEach((f) => { const v = norm(f[campo]); if (v) m[v] = (m[v] || 0) + 1; });
    return Object.keys(m).sort((a, b) => m[b] - m[a]).map((k) => ({ v: k, n: m[k] }));
  };
  const campanas: string[] = [];
  const vistos = new Set<string>();
  filas.forEach((f) => {
    const t = norm(f.tema).split('—')[0].trim();
    if (t && t.length <= 46 && !vistos.has(t.toLowerCase())) { vistos.add(t.toLowerCase()); campanas.push(t); }
  });
  const fechas = filas.map((f) => norm(f.fecha)).filter((x) => /^\\d{4}-\\d{2}-\\d{2}$/.test(x)).sort();
  return {
    total: filas.length,
    plataformas: cuenta('plataformaNorm'),
    tipos: cuenta('tipo'),
    campanas,
    dias: cuenta('diaNorm'),
    horas: cuenta('hora'),
    desde: fechas[0] || '', hasta: fechas[fechas.length - 1] || '',
  };
}

export function baseDigest(filas: any[]): string {
  const r = baseResumen(filas);
  const lista = (arr: any[], n: number) => arr.slice(0, n).map((x) => x.v + ' (' + x.n + ')').join(' · ');
  const recientes = filas.slice(-20).map((f) => {
    const t = norm(f.tema).replace(/\\s+/g, ' ').slice(0, 90);
    const c = norm(f.copy).replace(/\\s+/g, ' ').slice(0, 115);
    return '· ' + [norm(f.fecha).slice(0, 10), f.plataformaNorm, norm(f.tipo)].filter(Boolean).join(' | ') + ' — ' + t + (c ? ' :: ' + c : '');
  }).join('\\n');
  return \`BASE HISTÓRICA DE PUBLICACIONES (archivo cargado por el equipo — \${r.total} publicaciones, \${r.desde} a \${r.hasta})
Esta base es la referencia real de cómo publica LID. Úsala así:
- CONTINÚA su taxonomía. Plataformas ya en uso: \${lista(r.plataformas, 8)}. Tipos de post ya en uso: \${lista(r.tipos, 10)}.
- REUTILIZA sus líneas de campaña en "temaCampana" cuando el tema lo permita, para dar continuidad editorial: \${r.campanas.slice(0, 18).join(' | ')}.
- RESPETA la cadencia observada. Días con más actividad: \${lista(r.dias, 7)}\${r.horas.length ? '. Horarios usados: ' + lista(r.horas, 4) : ''}.
- IMITA la voz real de los copys de abajo: afirmaciones con postura, frases cortas, tensión al inicio y aterrizaje en negocio. No copies su redacción: adopta su tono.
- NO REPITAS ninguno de estos ángulos ya publicados. Si un tema es valioso, ábrelo desde un ángulo, formato o audiencia distintos y hazlo explícito en el nuevo enfoque.

PUBLICACIONES YA PUBLICADAS (no repetir):
\${recientes}\`;
}
