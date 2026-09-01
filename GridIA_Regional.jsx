import React, { useState, useEffect, useCallback } from 'react';
import * as XLSX from 'xlsx';

/* =========================================================================
   GridIA by Lid Marketing — Edición interna (IA integrada de Claude)
   Réplica de la interfaz original + selector de PAÍS y parrillas por zona
   (Norte / Centro / Sur) adaptadas a los estados y a sus modismos regionales.
   ========================================================================= */


/* ---- Sistema de temas: azul (primario), morado (secundario), naranja (énfasis) ---- */
const PALETTES = {
  /* Parrillas de cliente: azul · morado · naranja */
  base: {
    dark: {
      '--bg': '#0A0C16', '--panel': '#12162A', '--panel-2': '#0E1122', '--inset': '#080A13',
      '--line': '#232945', '--line-soft': '#191D33',
      '--text': '#ECEEF8', '--text-2': '#A3AAC6', '--muted': '#697091',
      '--accent': '#5B7CFF', '--accent-hover': '#7B96FF', '--accent-hi': '#9DB2FF',
      '--accent-soft': 'rgba(91,124,255,.14)', '--accent-ring': 'rgba(91,124,255,.30)',
      '--accent-border': 'rgba(91,124,255,.42)', '--on-accent': '#070911',
      '--violet': '#A472F7', '--violet-hi': '#C2A0FF', '--violet-soft': 'rgba(164,114,247,.14)', '--violet-border': 'rgba(164,114,247,.40)',
      '--amber': '#FF8F45', '--amber-hi': '#FFB07A', '--amber-soft': 'rgba(255,143,69,.13)', '--amber-border': 'rgba(255,143,69,.38)',
      '--danger': '#F2646C', '--danger-soft': 'rgba(242,100,108,.10)', '--danger-border': 'rgba(242,100,108,.30)',
      '--shadow': '0 18px 44px rgba(0,0,0,.42)', '--shadow-sm': '0 4px 14px rgba(0,0,0,.28)',
      '--glow-1': 'rgba(91,124,255,.10)', '--glow-2': 'rgba(164,114,247,.08)',
      '--btn': '#FF8F45', '--btn-hover': '#FFA463', '--on-btn': '#1B0E04', '--btn-glow': 'rgba(255,143,69,.34)',
    },
    light: {
      '--bg': '#F6F7FC', '--panel': '#FFFFFF', '--panel-2': '#F3F5FC', '--inset': '#EEF1F9',
      '--line': '#DFE4F2', '--line-soft': '#EAEEF8',
      '--text': '#161A2C', '--text-2': '#4B5470', '--muted': '#7C849F',
      '--accent': '#3E63E8', '--accent-hover': '#2F52D8', '--accent-hi': '#2C4ACB',
      '--accent-soft': 'rgba(62,99,232,.09)', '--accent-ring': 'rgba(62,99,232,.20)',
      '--accent-border': 'rgba(62,99,232,.30)', '--on-accent': '#FFFFFF',
      '--violet': '#7C43E0', '--violet-hi': '#6A31CE', '--violet-soft': 'rgba(124,67,224,.09)', '--violet-border': 'rgba(124,67,224,.28)',
      '--amber': '#E2701C', '--amber-hi': '#C55C0F', '--amber-soft': 'rgba(226,112,28,.10)', '--amber-border': 'rgba(226,112,28,.30)',
      '--danger': '#D63C48', '--danger-soft': 'rgba(214,60,72,.07)', '--danger-border': 'rgba(214,60,72,.26)',
      '--shadow': '0 16px 40px rgba(30,41,90,.10)', '--shadow-sm': '0 3px 12px rgba(30,41,90,.07)',
      '--glow-1': 'rgba(62,99,232,.07)', '--glow-2': 'rgba(124,67,224,.05)',
      '--btn': '#F97316', '--btn-hover': '#EA6E1F', '--on-btn': '#1B0E04', '--btn-glow': 'rgba(249,115,22,.30)',
    },
  },
  /* LID Marketing: lima de marca · esmeralda · verde profundo */
  lid: {
    dark: {
      '--bg': '#021410', '--panel': '#06231B', '--panel-2': '#041B15', '--inset': '#010D0A',
      '--line': '#0D3A2C', '--line-soft': '#092A20',
      '--text': '#E9F7EF', '--text-2': '#9CC9B2', '--muted': '#76A28C',
      '--accent': '#A3E635', '--accent-hover': '#B8ED5C', '--accent-hi': '#C4F171',
      '--accent-soft': 'rgba(163,230,53,.14)', '--accent-ring': 'rgba(163,230,53,.28)',
      '--accent-border': 'rgba(163,230,53,.40)', '--on-accent': '#06301F',
      '--violet': '#34D399', '--violet-hi': '#6EE7B7', '--violet-soft': 'rgba(52,211,153,.14)', '--violet-border': 'rgba(52,211,153,.38)',
      '--amber': '#F0B429', '--amber-hi': '#F7C948', '--amber-soft': 'rgba(240,180,41,.13)', '--amber-border': 'rgba(240,180,41,.36)',
      '--danger': '#F2646C', '--danger-soft': 'rgba(242,100,108,.10)', '--danger-border': 'rgba(242,100,108,.30)',
      '--shadow': '0 18px 44px rgba(0,10,6,.55)', '--shadow-sm': '0 4px 14px rgba(0,10,6,.38)',
      '--glow-1': 'rgba(52,211,153,.055)', '--glow-2': 'rgba(163,230,53,.04)',
      '--btn': '#A3E635', '--btn-hover': '#B8ED5C', '--on-btn': '#06301F', '--btn-glow': 'rgba(163,230,53,.30)',
    },
    light: {
      '--bg': '#F2FAF5', '--panel': '#FFFFFF', '--panel-2': '#EDF7F1', '--inset': '#E7F4EC',
      '--line': '#D2E8DC', '--line-soft': '#E0F0E7',
      '--text': '#06291D', '--text-2': '#3C6A54', '--muted': '#6E9A83',
      '--accent': '#15803D', '--accent-hover': '#116932', '--accent-hi': '#0F5C2C',
      '--accent-soft': 'rgba(21,128,61,.09)', '--accent-ring': 'rgba(21,128,61,.20)',
      '--accent-border': 'rgba(21,128,61,.30)', '--on-accent': '#FFFFFF',
      '--violet': '#0D9488', '--violet-hi': '#0B7C72', '--violet-soft': 'rgba(13,148,136,.09)', '--violet-border': 'rgba(13,148,136,.28)',
      '--amber': '#B45309', '--amber-hi': '#92400E', '--amber-soft': 'rgba(180,83,9,.09)', '--amber-border': 'rgba(180,83,9,.28)',
      '--danger': '#D63C48', '--danger-soft': 'rgba(214,60,72,.07)', '--danger-border': 'rgba(214,60,72,.26)',
      '--shadow': '0 16px 40px rgba(6,60,40,.10)', '--shadow-sm': '0 3px 12px rgba(6,60,40,.07)',
      '--glow-1': 'rgba(21,128,61,.07)', '--glow-2': 'rgba(52,211,153,.06)',
      '--btn': '#96DB22', '--btn-hover': '#A3E635', '--on-btn': '#06301F', '--btn-glow': 'rgba(150,219,34,.32)',
    },
  },
};

/* ---- Fecha en español a partir del día del mes seleccionado ---- */
const DIAS_SEM = ['Dom', 'Lun', 'Mar', 'Mié', 'Jue', 'Vie', 'Sáb'];
const MES3 = ['Ene', 'Feb', 'Mar', 'Abr', 'May', 'Jun', 'Jul', 'Ago', 'Sep', 'Oct', 'Nov', 'Dic'];
const DIAS_LARGOS = ['Domingo', 'Lunes', 'Martes', 'Miércoles', 'Jueves', 'Viernes', 'Sábado'];
function dateFor(dia, mesNombre) {
  const mi = MONTHS.indexOf(mesNombre);
  if (mi < 0) return null;
  const hoy = new Date();
  const año = mi < hoy.getMonth() ? hoy.getFullYear() + 1 : hoy.getFullYear();
  const ultimo = new Date(año, mi + 1, 0).getDate();
  return new Date(año, mi, Math.min(dia, ultimo));
}
function fechaDe(dia, mesNombre) {
  const d = dateFor(dia, mesNombre);
  if (!d) return 'Día ' + dia;
  return DIAS_SEM[d.getDay()] + ' ' + String(d.getDate()).padStart(2, '0') + '/' + MES3[d.getMonth()] + '/' + d.getFullYear();
}
function diaSemanaDe(dia, mesNombre) {
  const d = dateFor(dia, mesNombre);
  return d ? DIAS_LARGOS[d.getDay()] : '—';
}

function hora12(h) {
  const m = /^(\d{1,2}):(\d{2})/.exec(String(h || '').trim());
  if (!m) return h || '—';
  let hh = parseInt(m[1], 10);
  const suf = hh >= 12 ? 'PM' : 'AM';
  hh = hh % 12 || 12;
  return hh + ':' + m[2] + ' ' + suf;
}

const STATUS_OPTIONS = ['Pendiente', 'En diseño', 'Aprobado', 'Programado', 'Publicado'];
const LABEL_TO_KEY = { Norte: 'norte', Centro: 'centro', Sur: 'sur', General: 'general' };
const PLATAFORMAS = ['LinkedIn', 'Instagram', 'Facebook', 'X', 'TikTok', 'YouTube', 'SEO / Blog'];
const TIPOS_POST = ['Text post', 'Documento/Carrusel', 'Carrusel', 'Reel', 'Video', 'Video largo', 'Short', 'Hilo', 'Post estático', 'Historia', 'Artículo SEO', 'Encuesta'];

/* ===================== BRAND INTELLIGENCE — LID MARKETING =====================
   Capa interna del generador. No se muestra al usuario: gobierna cómo piensa la IA
   cuando produce la parrilla de la agencia.                                    */

const LID_PILARES = [
  'Estrategia / LID POV (25%)',
  'Casos / Resultados / Proof (20%)',
  'Educación avanzada (15%)',
  'Inside LID / Procesos (15%)',
  'Tendencias / LID Radar (10%)',
  'Equipo / Cultura / Expertise humano (10%)',
  'Venta directa (5%)',
];
const LID_PROPIEDADES = ['LID POV', 'Inside LID', 'LID Breakdown', 'LID Data', 'LID Cases', 'Ask LID', 'LID Radar', 'Creative vs Performance', '60 segundos con LID', 'LID Audit'];
const LID_FUNNEL = ['Awareness', 'Consideration', 'Trust', 'Conversion', 'Retention'];
const LID_AUDIENCIAS = ['CEO / Director General', 'CMO / Director de Marketing', 'Marketing Manager', 'Performance / Paid Media Manager', 'Director Comercial / Ventas', 'E-commerce Manager', 'Fundador / Empresario'];

const LID_CANAL = {
  LinkedIn: 'Canal principal de autoridad B2B, confianza y demanda. Formatos: text post, documento/carrusel, caso, gráfico, video, análisis. Lenguaje senior, claro y con postura, sin sonar a whitepaper corporativo. Busca relevancia profesional, no engagement banal. Normalmente sin emojis. Define en fichaCanal la voz que firma: marca LID (visión institucional), dirección/fundador (negocio y liderazgo), especialista (expertise técnico) o equipo (cultura y procesos).',
  Instagram: 'Marca, autoridad visual, humanización y proof. Prioriza Reels y carruseles: breakdowns, casos, inside LID, mini frameworks, errores de performance, creative strategy. La idea principal debe estar en los primeros segundos o en la primera línea. Más ágil y visual que LinkedIn, sin perder profundidad. Emojis con moderación.',
  Facebook: 'No replica Instagram automáticamente: agrega contexto y explicación más completa, aprovecha conversación y comunidad, casos y contenido educativo. Puede compartir concepto con Instagram, pero el copy se reescribe.',
  X: 'POV, velocidad, conversación y autoridad intelectual: observaciones afiladas de 2 a 4 líneas, ideas contrarias, microanálisis, aprendizajes de campañas. Corto, directo, conversacional; nunca institucional ni promocional. Usa hilo SOLO cuando la idea exija breakdown o framework. NUNCA hashtags y normalmente sin emojis.',
  TikTok: 'Descubrimiento y expertise humano: especialista frente a cámara, POV, mitos, mini auditorías, behind the scenes, reacciones. Natural, rápido y humano, pero nunca amateur intelectualmente. Hook en los primeros 2 segundos. Usa una tendencia solo si LID puede aportar perspectiva propia. Emojis con moderación.',
  YouTube: 'Biblioteca intelectual de la marca: breakdowns, análisis, casos, auditorías, metodologías y masterclasses; Shorts derivados de los videos largos. En fichaCanal define título, concepto de thumbnail, hook, capítulos y Shorts derivados. Sin clickbait que el contenido no cumpla. Normalmente sin emojis.',
  'SEO / Blog': 'Captura demanda existente y construye autoridad temática por clusters, nunca artículos sueltos ni genéricos. En fichaCanal define: keyword primaria, keywords secundarias, intención (informacional / comercial / comparativa / transaccional), title SEO, slug, meta description y H2 sugeridos. Escribe para personas primero; nada de keyword stuffing. Normalmente sin emojis.',
};

/* ---- Base histórica de publicaciones (.xlsx / .xls / .csv) ---- */
const BASE_COLS = {
  semana: ['semana', 'sem'],
  fecha: ['fecha', 'date'],
  dia: ['dia', 'día', 'day'],
  plataforma: ['plataforma', 'red social', 'red', 'canal', 'platform'],
  tipo: ['tipo post', 'tipo de post', 'tipo', 'formato'],
  tema: ['tema / campaña', 'tema/campaña', 'tema campaña', 'tema', 'campaña'],
  copy: ['copy', 'copy in', 'texto', 'contenido'],
  arte: ['arte / asset', 'arte/asset', 'arte', 'asset'],
  link: ['link / url', 'link/url', 'link', 'url'],
  responsable: ['responsable', 'owner'],
  estado: ['estado', 'status'],
  hora: ['hora publi.', 'hora publicacion', 'hora publicación', 'hora'],
  notas: ['notas', 'nota', 'observaciones'],
};
const PLAT_MAP = {
  'meta': 'Facebook + Instagram', 'facebook': 'Facebook', 'fb': 'Facebook',
  'instagram': 'Instagram', 'ig': 'Instagram', 'linkedin': 'LinkedIn', 'li': 'LinkedIn',
  'x': 'X', 'twitter': 'X', 'tiktok': 'TikTok',
  'youtube': 'YouTube', 'youtube shorts': 'YouTube', 'yt': 'YouTube', 'shorts': 'YouTube',
  'blog seo': 'SEO / Blog', 'blog': 'SEO / Blog', 'seo': 'SEO / Blog', 'seo / blog': 'SEO / Blog',
};
const norm = (v) => String(v == null ? '' : v).replace(/\r\n?/g, '\n').trim();
const key = (v) => norm(v).toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '');

/* Convierte a ISO. Prioriza el valor real de fecha del archivo; para texto
   (CSV) usa el orden día/mes detectado en toda la columna. */
function fechaISO(v, diaPrimero) {
  if (v instanceof Date && !isNaN(v.getTime())) {
    return v.getFullYear() + '-' + String(v.getMonth() + 1).padStart(2, '0') + '-' + String(v.getDate()).padStart(2, '0');
  }
  const t = norm(v);
  if (!t) return '';
  let m = /^(\d{4})-(\d{1,2})-(\d{1,2})/.exec(t);
  if (m) return m[1] + '-' + m[2].padStart(2, '0') + '-' + m[3].padStart(2, '0');
  m = /^(\d{1,2})[\/\-.](\d{1,2})[\/\-.](\d{2,4})$/.exec(t);
  if (m) {
    const y = m[3].length === 2 ? '20' + m[3] : m[3];
    let a = parseInt(m[1], 10), b = parseInt(m[2], 10);
    let dia, mes;
    if (a > 12) { dia = a; mes = b; }
    else if (b > 12) { mes = a; dia = b; }
    else if (diaPrimero) { dia = a; mes = b; }
    else { mes = a; dia = b; }
    return y + '-' + String(mes).padStart(2, '0') + '-' + String(dia).padStart(2, '0');
  }
  const MESES3 = { ene: 1, feb: 2, mar: 3, abr: 4, may: 5, jun: 6, jul: 7, ago: 8, sep: 9, oct: 10, nov: 11, dic: 12, jan: 1, apr: 4, aug: 8, dec: 12 };
  m = /^(\d{1,2})[\-\s\/]([a-zA-Z]{3,})[\-\s\/](\d{2,4})$/.exec(t);
  if (m) {
    const mes = MESES3[key(m[2]).slice(0, 3)];
    if (mes) {
      const y = m[3].length === 2 ? '20' + m[3] : m[3];
      return y + '-' + String(mes).padStart(2, '0') + '-' + m[1].padStart(2, '0');
    }
  }
  const d = new Date(t);
  if (!isNaN(d.getTime())) return d.getFullYear() + '-' + String(d.getMonth() + 1).padStart(2, '0') + '-' + String(d.getDate()).padStart(2, '0');
  return t;
}
/* ¿La columna de fechas de texto viene como día/mes? */
function detectaDiaPrimero(valores) {
  let diaPrimero = false;
  for (const v of valores) {
    const m = /^(\d{1,2})[\/\-.](\d{1,2})[\/\-.](\d{2,4})$/.exec(norm(v));
    if (!m) continue;
    if (parseInt(m[1], 10) > 12) return true;
    if (parseInt(m[2], 10) > 12) return false;
  }
  return diaPrimero;
}
/* Hora en formato 24h a partir del valor real o del texto. */
function horaHHMM(v) {
  if (v instanceof Date && !isNaN(v.getTime())) {
    return String(v.getHours()).padStart(2, '0') + ':' + String(v.getMinutes()).padStart(2, '0');
  }
  const t = norm(v);
  const m = /(\d{1,2}):(\d{2})/.exec(t);
  if (!m) return t;
  let h = parseInt(m[1], 10);
  if (/p\.?\s?m/i.test(t) && h < 12) h += 12;
  if (/a\.?\s?m/i.test(t) && h === 12) h = 0;
  return String(h).padStart(2, '0') + ':' + m[2];
}
/* Unifica "Viernes", "viernes" y "miercoles" en una sola etiqueta. */
function diaCanon(v) {
  const k = key(v);
  const hit = DIAS_LARGOS.find((d) => key(d) === k);
  return hit || (norm(v) ? norm(v).charAt(0).toUpperCase() + norm(v).slice(1).toLowerCase() : '');
}

function mapCol(header) {
  const h = key(header);
  for (const campo of Object.keys(BASE_COLS)) {
    if (BASE_COLS[campo].some((alias) => h === alias || h.startsWith(alias))) return campo;
  }
  return null;
}

/* Lee el archivo en el navegador y lo normaliza a filas comparables. */
async function parseBaseFile(file) {
  const buf = await file.arrayBuffer();
  const wb = XLSX.read(new Uint8Array(buf), { type: 'array', cellDates: true });
  const sh = wb.Sheets[wb.SheetNames[0]];
  if (!sh) throw new Error('El archivo no tiene hojas legibles.');
  const aoa = XLSX.utils.sheet_to_json(sh, { header: 1, blankrows: false, raw: true, defval: '' });
  if (!aoa.length) throw new Error('El archivo está vacío.');

  let hi = -1, mapa = null;
  for (let i = 0; i < Math.min(aoa.length, 12); i++) {
    const m = aoa[i].map(mapCol);
    if (m.filter(Boolean).length >= 4) { hi = i; mapa = m; break; }
  }
  if (hi === -1) throw new Error('No se reconocieron las columnas. Se esperan encabezados como Fecha, Plataforma, Tipo Post, Tema / Campaña y Copy.');

  const colFecha = mapa.indexOf('fecha');
  const diaPrimero = colFecha === -1 ? false : detectaDiaPrimero(aoa.slice(hi + 1).map((f) => f[colFecha]));

  const filas = [];
  for (let r = hi + 1; r < aoa.length; r++) {
    const fila = {};
    mapa.forEach((campo, c) => {
      if (!campo) return;
      const bruto = aoa[r][c];
      if (campo === 'fecha') fila.fecha = fechaISO(bruto, diaPrimero);
      else if (campo === 'hora') fila.hora = horaHHMM(bruto);
      else fila[campo] = norm(bruto);
    });
    fila.diaNorm = diaCanon(fila.dia);
    if (Object.values(fila).some((v) => v)) {
      const pk = key(fila.plataforma);
      fila.plataformaNorm = PLAT_MAP[pk] || (fila.plataforma || '');
      filas.push(fila);
    }
  }
  if (!filas.length) throw new Error('No se encontraron publicaciones debajo de los encabezados.');
  return filas;
}

/* Resumen para la interfaz. */
function baseResumen(filas) {
  const cuenta = (campo) => {
    const m = {};
    filas.forEach((f) => { const v = norm(f[campo]); if (v) m[v] = (m[v] || 0) + 1; });
    return Object.keys(m).sort((a, b) => m[b] - m[a]).map((k) => ({ v: k, n: m[k] }));
  };
  const campanas = [];
  const vistos = new Set();
  filas.forEach((f) => {
    const t = norm(f.tema).split('—')[0].trim();
    if (t && t.length <= 46 && !vistos.has(t.toLowerCase())) { vistos.add(t.toLowerCase()); campanas.push(t); }
  });
  const fechas = filas.map((f) => norm(f.fecha)).filter((x) => /^\d{4}-\d{2}-\d{2}$/.test(x)).sort();
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

/* Digest compacto que se inyecta al generador. */
function baseDigest(filas) {
  const r = baseResumen(filas);
  const lista = (arr, n) => arr.slice(0, n).map((x) => x.v + ' (' + x.n + ')').join(' · ');
  const recientes = filas.slice(-20).map((f) => {
    const t = norm(f.tema).replace(/\s+/g, ' ').slice(0, 90);
    const c = norm(f.copy).replace(/\s+/g, ' ').slice(0, 115);
    return '· ' + [norm(f.fecha).slice(0, 10), f.plataformaNorm, norm(f.tipo)].filter(Boolean).join(' | ') + ' — ' + t + (c ? ' :: ' + c : '');
  }).join('\n');
  return `BASE HISTÓRICA DE PUBLICACIONES (archivo cargado por el equipo — ${r.total} publicaciones, ${r.desde} a ${r.hasta})
Esta base es la referencia real de cómo publica LID. Úsala así:
- CONTINÚA su taxonomía. Plataformas ya en uso: ${lista(r.plataformas, 8)}. Tipos de post ya en uso: ${lista(r.tipos, 10)}.
- REUTILIZA sus líneas de campaña en "temaCampana" cuando el tema lo permita, para dar continuidad editorial: ${r.campanas.slice(0, 18).join(' | ')}.
- RESPETA la cadencia observada. Días con más actividad: ${lista(r.dias, 7)}${r.horas.length ? '. Horarios usados: ' + lista(r.horas, 4) : ''}.
- IMITA la voz real de los copys de abajo: afirmaciones con postura, frases cortas, tensión al inicio y aterrizaje en negocio. No copies su redacción: adopta su tono.
- NO REPITAS ninguno de estos ángulos ya publicados. Si un tema es valioso, ábrelo desde un ángulo, formato o audiencia distintos y hazlo explícito en el nuevo enfoque.

PUBLICACIONES YA PUBLICADAS (no repetir):
${recientes}`;
}

const LID_BRAND = `SISTEMA DE MARCA — LID MARKETING (gobierna toda la parrilla)

POSICIONAMIENTO
- LID no es una agencia que "publica y pauta": es un partner estratégico de crecimiento que conecta estrategia, creatividad, tecnología, data, paid media y performance para convertir inversión de marketing en resultados de negocio.
- Concepto rector: marketing con impacto de negocio. No publicamos para demostrar que hacemos marketing; publicamos para demostrar que entendemos cómo hacer crecer un negocio mediante marketing.
- Territorio: donde el marketing se cruza con el negocio (adquisición, generación de demanda, conversión, rentabilidad, calidad de leads, e-commerce, automatización, analítica, ventas).

ENEMIGO CONCEPTUAL: el marketing sin estrategia. Cuestiona con criterio, nunca por polémica: publicar por cumplir calendario, subir presupuesto sin leer el sistema completo, perseguir leads baratos sin evaluar calidad, celebrar vanity metrics, campañas sin tracking ni hipótesis, creatividad desconectada del performance, tendencias por moda, reportes sin interpretación, marketing y ventas desconectados, culpar al algoritmo antes que a la estrategia.

AUDIENCIA: cada pieza se dirige a UN decisor humano concreto (campo "audiencia"), elegido entre: ${LID_AUDIENCIAS.join(' | ')}. Nunca escribas para "empresas" en abstracto. El contenido NO se diseña para estudiantes, buscadores de tips rápidos ni para quien entiende marketing como "subir posts": pueden consumirlo, pero no definen el nivel.

PERSONALIDAD: estratega + especialista + challenger + partner. Voz segura, analítica, clara, directa, humana y comercial; provocadora solo cuando hay argumento. NO arrogante, infantil, motivacional, gurú, burocrática ni "agencia cool" sin sustancia.

LENGUAJE: español natural de México/LatAm. Anglicismos de marketing (performance, paid media, funnel, growth, revenue, CRO, pipeline, demand generation) solo cuando sean naturales en la conversación profesional, nunca para aparentar expertise. Prioriza afirmaciones con postura, tensión, preguntas inteligentes y relaciones causa-efecto.
- Ejemplo débil: "El marketing digital es fundamental para las empresas."
- Ejemplo LID: "Tu problema probablemente no es falta de marketing. Es no saber qué parte del sistema está frenando el crecimiento."

PROHIBIDO como eje del mensaje: "llevamos tu marca al siguiente nivel", "impulsamos tu negocio", "potenciamos tu marca", "experiencias únicas", "soluciones innovadoras", "estrategias 360", "resultados increíbles", "transformamos ideas en resultados", "somos apasionados del marketing". Tampoco "5 tips de marketing", "¿qué es marketing digital?", "ventajas de Google Ads", "¿sabías que...?", efemérides irrelevantes ni frases motivacionales. Si un tema es básico, elévalo: en vez de "¿qué es un lead?", "qué hace que un lead sea realmente útil para ventas".

TESIS EDITORIAL: cada pieza responde, directa o indirectamente, a cómo piensa un equipo especializado cuando enfrenta un problema real de negocio. No repitas información: interprétala. Prioriza "qué significa esto para el negocio" sobre "qué es esto".

MOTOR DE ÁNGULOS (recórrelo antes de escribir cada pieza): 1) problema real de negocio, 2) persona que lo vive, 3) creencia habitual de esa persona, 4) insight que LID puede aportar para moverla, 5) consecuencia comercial, 6) mejor expresión para ese canal, 7) qué debe pensar o hacer la audiencia después. Nunca partas del formato ni del servicio: la estrategia decide el formato.

ESTRUCTURA DE COPY: hook que detiene por una idea (tensión, contradicción, identificación o impacto comercial) → tensión del problema → insight de LID → desarrollo con argumento, ejemplo o metodología → conexión explícita con negocio → CTA acorde al funnel.

CTA POR ETAPA: Awareness (¿te ha pasado?, ¿coincides?, guarda esta idea, compártelo con tu equipo) · Consideration (revísalo en tu próxima campaña, guarda el framework, úsalo en tu próxima auditoría) · Trust (conoce cómo abordamos este problema, mira la metodología, conoce el caso) · Conversion (solicita un diagnóstico, hablemos de tu estrategia, agenda una conversación) · Retention (profundidad, innovación, evolución de la industria). No fuerces un CTA si la pieza funciona mejor sin él.

VERACIDAD: nunca inventes estadísticas, porcentajes, benchmarks, casos, clientes, testimonios, cifras, estudios ni cambios de algoritmo. Si no hay dato real disponible, convierte la pieza en análisis, hipótesis, metodología, pregunta o escenario conceptual. Los casos sin datos autorizados se anonimizan y se cuentan como metodología: problema → diagnóstico → hipótesis → intervención → resultado → aprendizaje.

FILTRO DE SUSTITUIBILIDAD (obligatorio antes de dar por buena una pieza): "¿podría otra agencia publicar esto cambiando solo el logotipo?". Si la respuesta es sí, el ángulo todavía no es LID: profundízalo.

CRITERIOS DE ACEPTACIÓN: destinatario claro · parte de un problema o insight real · tiene postura · demuestra criterio · conectada con negocio · nativa de su canal · no intercambiable con otra agencia · no repite otra pieza de la parrilla · cumple una función en el funnel · el formato tiene sentido para el concepto · no inventa información. Si una idea no aumenta autoridad, confianza, consideración, memorabilidad, demanda u oportunidad comercial, no merece un espacio.`;
const MODEL = 'claude-sonnet-4-5';

const MONTHS = ['Enero', 'Febrero', 'Marzo', 'Abril', 'Mayo', 'Junio', 'Julio', 'Agosto', 'Septiembre', 'Octubre', 'Noviembre', 'Diciembre'];
const POST_COUNTS = [4, 6, 8, 10, 12, 16];
const FOCUS_OPTIONS = ['Ventas', 'Branding', 'Alcance', 'Reconocimiento de Marca', 'Posicionamiento de Marca'];
const FORMAT_OPTIONS = ['Imagen', 'Video', 'Ambas'];

const VIDEO_AI_TOOLS = [
  { name: 'Seedance 1.0 Pro', credits: 250 }, { name: 'Seedance 1.0 Lite', credits: 200 },
  { name: 'Kling 2.1 Master', credits: 1400 }, { name: 'Kling 2.1', credits: 300 },
  { name: 'Kling 1.6 Pro', credits: 500 }, { name: 'Kling 1.6 Standard', credits: 300 },
  { name: 'MiniMax Hailuo 02', credits: 300 }, { name: 'MiniMax', credits: 500 },
  { name: 'Google Veo 3', credits: 12000 }, { name: 'Google Veo 3 Fast', credits: 6400 },
  { name: 'Google Veo 2', credits: 1000 }, { name: 'Runway Gen 4', credits: 500 },
  { name: 'PixVerse 4.5', credits: 825 },
];

const REGION_KEYS = ['norte', 'centro', 'sur'];
const REGION_LABEL = { norte: 'Norte', centro: 'Centro', sur: 'Sur', general: 'General', lid: 'LID Marketing' };

/* ---- Catálogo de países: estados por zona + estilo lingüístico de referencia ---- */
const COUNTRIES = {
  'México': {
    emoji: '🇲🇽',
    regions: {
      norte: {
        estados: ['Baja California', 'Baja California Sur', 'Sonora', 'Chihuahua', 'Coahuila', 'Nuevo León', 'Tamaulipas', 'Sinaloa', 'Durango'],
        nota: 'Español norteño: directo, práctico y desenfadado. Modismos como "qué onda", "ándale", "órale", "compa", "carnal", "a todo dar", "plebada/plebes", "morros", "bien chido", anglicismos fronterizos ("troca", "lonche", "parquear", "wachar"). Tono aspiracional, trabajador y de rendimiento.',
      },
      centro: {
        estados: ['Aguascalientes', 'Zacatecas', 'San Luis Potosí', 'Nayarit', 'Jalisco', 'Colima', 'Guanajuato', 'Querétaro', 'Hidalgo', 'Michoacán', 'Estado de México', 'Ciudad de México', 'Morelos', 'Tlaxcala', 'Puebla'],
        nota: 'Español del centro (chilango/bajío): "chido", "padrísimo", "no manches", "qué pex", "híjole", "ahorita", "un chorro", "neta", "cámara", "chamba", "chela". Tono urbano, dinámico, con humor y doble sentido, muy trendy y digital.',
      },
      sur: {
        estados: ['Guerrero', 'Oaxaca', 'Chiapas', 'Veracruz', 'Tabasco', 'Campeche', 'Yucatán', 'Quintana Roo'],
        nota: 'Español del sur y sureste: cálido, hospitalario y pausado. Regionalismos costeños/mayas: "está cañón", "chilo", en Yucatán muletillas mayas ("¿va?", "papitas", "lo/loch"), tono jarocho/tabasqueño relajado ("¿qué pasó, mi rey?", "chamaco"). Tono comunitario, familiar y de arraigo.',
      },
    },
  },
  'Colombia': {
    emoji: '🇨🇴',
    regions: {
      norte: { estados: ['Atlántico (Barranquilla)', 'Bolívar (Cartagena)', 'Magdalena', 'La Guajira', 'Cesar', 'Córdoba', 'Sucre', 'San Andrés y Providencia'], nota: 'Costeño/Caribe: cálido y alegre. "ajá", "eche", "no joda", "bacano", "mani", "erda", ritmo y humor, cadencia caribeña.' },
      centro: { estados: ['Cundinamarca (Bogotá)', 'Antioquia (Medellín)', 'Santander', 'Norte de Santander', 'Boyacá', 'Caldas', 'Risaralda', 'Quindío', 'Tolima', 'Huila'], nota: 'Andino (paisa/rolo/santandereano): "parce", "bacano", "chévere", "qué más pues", "berraco", "hágale", trato cordial y de "usted".' },
      sur: { estados: ['Valle del Cauca (Cali)', 'Cauca', 'Nariño', 'Putumayo', 'Caquetá', 'Amazonas', 'Meta', 'Casanare', 'Chocó'], nota: 'Sur/Pacífico/valluno: "ve", "mirá ve", "oís", "chévere", "bacano", sabor pacífico, caleño y llanero.' },
    },
  },
  'Argentina': {
    emoji: '🇦🇷',
    regions: {
      norte: { estados: ['Jujuy', 'Salta', 'Tucumán', 'Catamarca', 'Santiago del Estero', 'La Rioja', 'Formosa', 'Chaco', 'Misiones', 'Corrientes'], nota: 'Norteño (NOA/NEA): tonada cantada, "che", "chango", "pibe", calidez provinciana, guaranismos en el litoral.' },
      centro: { estados: ['Córdoba', 'Santa Fe', 'Entre Ríos', 'Buenos Aires', 'Ciudad de Buenos Aires', 'La Pampa', 'San Luis', 'Mendoza', 'San Juan'], nota: 'Rioplatense/cordobés: voseo, "che", "copado", "quilombo", "posta", tonada cordobesa, humor urbano.' },
      sur: { estados: ['Neuquén', 'Río Negro', 'Chubut', 'Santa Cruz', 'Tierra del Fuego'], nota: 'Patagónico: sobrio, "che", modismos sureños, identidad de paisaje, viento y aventura.' },
    },
  },
  'Perú': {
    emoji: '🇵🇪',
    regions: {
      norte: { estados: ['Tumbes', 'Piura', 'Lambayeque', 'La Libertad (Trujillo)', 'Cajamarca', 'Amazonas', 'San Martín'], nota: 'Norteño costeño: cálido, "causa", "pata", "bacán", "de hechera", sabor chiclayano/piurano.' },
      centro: { estados: ['Lima', 'Callao', 'Áncash', 'Huánuco', 'Pasco', 'Junín', 'Huancavelica', 'Ica', 'Ucayali'], nota: 'Limeño/central: "pe", "jerga", "chévere", "bacán", "al toque", "habla", urbano y directo.' },
      sur: { estados: ['Ayacucho', 'Apurímac', 'Cusco', 'Arequipa', 'Moquegua', 'Tacna', 'Puno', 'Madre de Dios'], nota: 'Sureño/andino: orgullo cusqueño y "characato" arequipeño, quechuismos, tono regionalista.' },
    },
  },
  'Chile': {
    emoji: '🇨🇱',
    regions: {
      norte: { estados: ['Arica y Parinacota', 'Tarapacá', 'Antofagasta', 'Atacama', 'Coquimbo'], nota: 'Norte: "cachái", "al tiro", identidad minera y costera, tono sobrio y trabajador.' },
      centro: { estados: ['Valparaíso', 'Metropolitana (Santiago)', "O'Higgins", 'Maule', 'Ñuble', 'Biobío'], nota: 'Central/santiaguino: "cachái", "bacán", "la raja", "al tiro", "pololo", jerga rápida y urbana.' },
      sur: { estados: ['La Araucanía', 'Los Ríos', 'Los Lagos', 'Aysén', 'Magallanes'], nota: 'Sur: "po", calidez sureña, mapuchismos, identidad de lluvia, campo y naturaleza.' },
    },
  },
  'Ecuador': {
    emoji: '🇪🇨',
    regions: {
      norte: { estados: ['Carchi', 'Imbabura', 'Esmeraldas', 'Sucumbíos', 'Pichincha (Quito)', 'Napo', 'Orellana'], nota: 'Sierra norte/Quito: serrano cordial, "ñaño", "chévere", "chuta", "de una", quichuismos.' },
      centro: { estados: ['Cotopaxi', 'Tungurahua', 'Chimborazo', 'Bolívar', 'Pastaza', 'Manabí', 'Los Ríos', 'Santo Domingo'], nota: 'Centro/Manabí: montubio y serrano, "mijín", "verás", "chuzo", cadencia costeña-serrana.' },
      sur: { estados: ['Azuay (Cuenca)', 'Cañar', 'Loja', 'El Oro', 'Guayas (Guayaquil)', 'Santa Elena', 'Zamora Chinchipe', 'Morona Santiago', 'Galápagos'], nota: 'Sur/Guayaquil: costeño "ma", "pana", "bacán", "de ley", "full", humor guayaco.' },
    },
  },
  'España': {
    emoji: '🇪🇸',
    regions: {
      norte: { estados: ['Galicia', 'Asturias', 'Cantabria', 'País Vasco', 'Navarra', 'La Rioja', 'Aragón', 'Cataluña'], nota: 'Norte: sobrio, "majo", orgullo verde y gastronómico, catalanismos/vasquismos puntuales.' },
      centro: { estados: ['Madrid', 'Castilla y León', 'Castilla-La Mancha', 'Extremadura'], nota: 'Centro/Madrid: "majo", "guay", "flipar", "currar", castizo y directo.' },
      sur: { estados: ['Andalucía', 'Región de Murcia', 'Comunidad Valenciana', 'Islas Baleares', 'Canarias'], nota: 'Sur/andaluz-levante: salero, "quillo", "illo", "ea", "chacho", humor y arte.' },
    },
  },
  'Venezuela': {
    emoji: '🇻🇪',
    regions: {
      norte: { estados: ['Distrito Capital (Caracas)', 'Miranda', 'La Guaira', 'Aragua', 'Carabobo', 'Falcón', 'Nueva Esparta', 'Yaracuy', 'Lara'], nota: 'Central/costero: "chamo", "pana", "chévere", "burda", "na guará" (Lara), caraqueño rápido.' },
      centro: { estados: ['Zulia (Maracaibo)', 'Trujillo', 'Mérida', 'Táchira', 'Barinas', 'Portuguesa', 'Cojedes', 'Guárico'], nota: 'Andino/zuliano: gocho cordial y maracucho fuerte ("mollejúo", "vale"), calidez andina.' },
      sur: { estados: ['Apure', 'Anzoátegui', 'Monagas', 'Sucre', 'Bolívar', 'Amazonas', 'Delta Amacuro'], nota: 'Oriente/Guayana: "muchacho", "compái", "vale", sabor oriental y cadencia caribeña.' },
    },
  },
  'Guatemala': {
    emoji: '🇬🇹',
    regions: {
      norte: { estados: ['Petén', 'Alta Verapaz', 'Baja Verapaz', 'Izabal', 'Quiché'], nota: 'Norte/Verapaces: cálido, voces q\u2019eqchi\u2019/mayas, "vos", "cabal".' },
      centro: { estados: ['Guatemala', 'Sacatepéquez', 'Chimaltenango', 'El Progreso', 'Jalapa', 'Zacapa', 'Chiquimula', 'Santa Rosa'], nota: 'Centro/capital: chapín urbano, "vos", "cabal", "chilero", "shute", cordial.' },
      sur: { estados: ['Escuintla', 'Suchitepéquez', 'Retalhuleu', 'Quetzaltenango', 'Totonicapán', 'Sololá', 'San Marcos', 'Huehuetenango', 'Jutiapa'], nota: 'Occidente/sur: "vos", "patojo", voces mayas (k\u2019iche\u2019/mam), sabor de boca costa.' },
    },
  },
  'República Dominicana': {
    emoji: '🇩🇴',
    regions: {
      norte: { estados: ['Santiago', 'Puerto Plata', 'La Vega', 'Espaillat', 'Duarte', 'Valverde', 'Samaná', 'Montecristi', 'Dajabón', 'Sánchez Ramírez'], nota: 'Cibao: cantado, "manín", "qué lo que", "vaina", "tíguere", calidez cibaeña.' },
      centro: { estados: ['Distrito Nacional (Santo Domingo)', 'Santo Domingo', 'Monte Plata', 'San Cristóbal', 'La Altagracia', 'La Romana', 'San Pedro de Macorís', 'Hato Mayor'], nota: 'Capital/este: dominicano urbano, "dígalo", "qué lo que", "jevi", dembow y flow.' },
      sur: { estados: ['Peravia', 'Azua', 'San José de Ocoa', 'Barahona', 'Bahoruco', 'Independencia', 'Pedernales', 'San Juan', 'Elías Piña'], nota: 'Sur: "compái", sabor sureño, campo y merengue típico.' },
    },
  },
};

const allStatesOf = (c) => ({
  norte: [...COUNTRIES[c].regions.norte.estados],
  centro: [...COUNTRIES[c].regions.centro.estados],
  sur: [...COUNTRIES[c].regions.sur.estados],
});

/* ------------------------------- Estilos ------------------------------- */
const STYLES = `
@import url('https://fonts.googleapis.com/css2?family=Poppins:wght@300;400;500;600;700&display=swap');

.gridia{
  --sans:'Poppins',-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,sans-serif;
  --mono:'Poppins',-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,sans-serif;
  --ease:cubic-bezier(.22,1,.36,1);
  --grad:linear-gradient(120deg,var(--accent) 0%,var(--violet) 62%,var(--amber) 130%);
  background:var(--bg);color:var(--text);min-height:100%;
  font-family:var(--sans);font-size:14px;font-weight:400;line-height:1.6;letter-spacing:-.005em;
  -webkit-font-smoothing:antialiased;
  transition:background-color .4s var(--ease),color .4s var(--ease);
}
.gridia *{box-sizing:border-box;}
/* Cambio de tema y de espacio de trabajo: el color viaja, el layout no se mueve */
.gridia *,.gridia *::before,.gridia *::after{
  transition:background-color .6s var(--ease),border-color .6s var(--ease),color .6s var(--ease),
             fill .6s var(--ease),stroke .6s var(--ease),box-shadow .6s var(--ease),background-image .6s var(--ease);
}
.gridia.ws-lid{
  background-image:radial-gradient(1100px 560px at 15% -8%,var(--glow-1),transparent 62%),
                   radial-gradient(900px 520px at 88% 108%,var(--glow-2),transparent 60%);
  background-attachment:fixed;
}
/* Cifras alineadas ahora que las etiquetas también son Poppins */
.gridia .dnum,.gridia .ddate,.gridia .zmeta,.gridia .zdone,.gridia code,.gridia .thash b{font-variant-numeric:tabular-nums;}
.gridia .wrap{max-width:none;margin:0 auto;padding:0 40px 100px;}
@media(max-width:760px){.gridia .wrap{padding:0 16px 64px;}}

@keyframes gin{from{opacity:0;transform:translateY(10px);}to{opacity:1;transform:none;}}
@keyframes gfade{from{opacity:0;}to{opacity:1;}}
@keyframes gpulse{0%,100%{opacity:.55;}50%{opacity:1;}}
@keyframes gsheen{from{background-position:0% 50%;}to{background-position:180% 50%;}}

/* ---------- Encabezado ---------- */
.gridia .header{display:flex;align-items:center;justify-content:space-between;gap:20px;
  padding:28px 0 22px;margin-bottom:32px;border-bottom:1px solid var(--line);flex-wrap:wrap;animation:gin .5s var(--ease) both;}
.gridia .brand{display:flex;align-items:center;gap:14px;}
.gridia h1{font-size:29px;font-weight:600;margin:0;letter-spacing:-.045em;color:var(--text);}
.gridia h1 .ia{background:var(--grad);background-size:200% auto;-webkit-background-clip:text;background-clip:text;
  -webkit-text-fill-color:transparent;animation:gsheen 9s linear infinite alternate;}
.gridia .sub{font-family:var(--mono);font-size:10px;font-weight:600;letter-spacing:.16em;text-transform:uppercase;
  color:var(--muted);padding-left:14px;border-left:1px solid var(--line);}
@media(max-width:760px){.gridia .sub{border-left:0;padding-left:0;flex-basis:100%;}}
.gridia .hactions{display:flex;align-items:center;gap:10px;}
.gridia .badge{display:inline-flex;align-items:center;gap:8px;font-family:var(--mono);font-size:10px;font-weight:500;
  letter-spacing:.12em;text-transform:uppercase;color:var(--text-2);
  border:1px solid var(--line);border-radius:100px;padding:7px 14px;background:var(--panel-2);}
.gridia .badge::before{content:"";width:5px;height:5px;border-radius:50%;background:var(--grad);animation:gpulse 2.6s ease-in-out infinite;}
.gridia .tbtn{display:inline-flex;align-items:center;justify-content:center;width:38px;height:38px;cursor:pointer;
  background:var(--panel-2);border:1px solid var(--line);border-radius:100px;color:var(--text-2);
  transition:all .25s var(--ease);}
.gridia .tbtn:hover{color:var(--accent);border-color:var(--accent-border);transform:translateY(-1px);box-shadow:var(--shadow-sm);}
.gridia .tbtn svg{transition:transform .5s var(--ease);}
.gridia .tbtn:hover svg{transform:rotate(25deg);}

/* ---------- Superficies ---------- */
.gridia .card{background:var(--panel);border:1px solid var(--line);border-radius:16px;padding:28px 30px;
  box-shadow:var(--shadow-sm);animation:gin .5s var(--ease) both;}
@media(max-width:760px){.gridia .card{padding:20px 16px;border-radius:12px;}}

.gridia .sectitle{display:flex;align-items:center;gap:12px;margin:0 0 22px;padding:0;border:0;
  font-family:var(--mono);font-size:10px;font-weight:600;letter-spacing:.17em;text-transform:uppercase;color:var(--text-2);}
.gridia .sectitle::after{content:"";flex:1;height:1px;background:linear-gradient(90deg,var(--line),transparent);}
.gridia .sectitle.mt{margin-top:38px;}
.gridia .step{font-family:var(--mono);font-size:10px;font-weight:700;letter-spacing:.1em;
  background:var(--grad);-webkit-background-clip:text;background-clip:text;-webkit-text-fill-color:transparent;flex:none;}

/* ---------- Campos ---------- */
.gridia .grid{display:grid;gap:18px;}
.gridia .cols-4{grid-template-columns:repeat(4,1fr);}
.gridia .cols-2{grid-template-columns:repeat(2,1fr);}
.gridia .span2{grid-column:span 2;}
@media(max-width:980px){.gridia .cols-4,.gridia .cols-2{grid-template-columns:1fr;}.gridia .span2{grid-column:auto;}}
.gridia label.fl{display:block;font-family:var(--mono);font-size:9.5px;font-weight:600;letter-spacing:.14em;
  text-transform:uppercase;color:var(--muted);margin-bottom:9px;}
.gridia .fl .cnt{color:var(--btn);margin-left:5px;font-weight:700;}
.gridia input[type=text],.gridia select,.gridia textarea{width:100%;background:var(--inset);
  border:1px solid var(--line);border-radius:10px;padding:11px 13px;color:var(--text);font-size:13.5px;
  outline:none;font-family:inherit;transition:border-color .22s var(--ease),box-shadow .22s var(--ease),background-color .22s var(--ease);}
.gridia textarea{resize:vertical;min-height:64px;line-height:1.65;}
.gridia input:focus,.gridia select:focus,.gridia textarea:focus{border-color:var(--accent);box-shadow:0 0 0 4px var(--accent-ring);}
.gridia select{appearance:none;background-image:url("data:image/svg+xml;utf8,<svg xmlns='http://www.w3.org/2000/svg' width='14' height='14' viewBox='0 0 20 20' fill='%237C849F'><path d='M5 8l5 5 5-5z'/></svg>");
  background-repeat:no-repeat;background-position:right 12px center;padding-right:34px;cursor:pointer;}
.gridia .country{font-weight:500;}
.gridia .hint{font-size:12px;color:var(--muted);margin-top:9px;line-height:1.55;}

/* ---------- Chips ---------- */
.gridia .chips{display:flex;flex-wrap:wrap;gap:8px;}
.gridia .chip{cursor:pointer;border:1px solid var(--line);background:var(--panel-2);color:var(--text-2);
  border-radius:100px;padding:7px 14px;font-size:12.5px;font-weight:500;user-select:none;
  transition:all .22s var(--ease);}
.gridia .chip:hover{border-color:var(--accent-border);color:var(--text);transform:translateY(-1px);}
.gridia .chip:active{transform:scale(.97);}
.gridia .chip.on{background:var(--btn);color:var(--on-btn);border-color:var(--btn);font-weight:600;
  box-shadow:0 2px 12px var(--btn-glow);}
.gridia .chip.on:hover{background:var(--btn-hover);border-color:var(--btn-hover);color:var(--on-btn);}
.gridia .chip.off{opacity:.3;cursor:not-allowed;}
.gridia .chip.off:hover{border-color:var(--line);color:var(--text-2);transform:none;}

/* ---------- Botones ---------- */
.gridia .btn{cursor:pointer;border:1px solid transparent;border-radius:100px;font-weight:600;font-size:13.5px;
  padding:11px 22px;display:inline-flex;align-items:center;gap:9px;font-family:inherit;
  transition:all .25s var(--ease);}
.gridia .btn-primary{background:var(--btn);color:var(--on-btn);font-weight:600;box-shadow:0 4px 16px var(--btn-glow);}
.gridia .btn-primary:not(:disabled):hover{background:var(--btn-hover);transform:translateY(-2px);box-shadow:0 9px 26px var(--btn-glow);}
.gridia .btn-primary:not(:disabled):active{transform:translateY(0);box-shadow:0 3px 10px var(--btn-glow);}
.gridia .btn-ghost{background:transparent;border-color:var(--line);color:var(--text-2);font-size:12.5px;padding:9px 16px;}
.gridia .btn-ghost:not(:disabled):hover{border-color:var(--btn);color:var(--btn);background:transparent;transform:translateY(-1px);}
.gridia .btn:disabled{opacity:.35;cursor:not-allowed;}
.gridia .btn:focus-visible,.gridia .vbtn:focus-visible,.gridia .chip:focus-visible,.gridia .tbtn:focus-visible{outline:2px solid var(--btn);outline-offset:3px;}
.gridia .link{cursor:pointer;color:var(--accent);font-size:12px;font-weight:600;background:none;border:none;padding:0;
  font-family:inherit;transition:color .2s var(--ease);}
.gridia .link:hover{color:var(--violet);text-decoration:underline;}

/* ---------- Espacios de trabajo y vistas ---------- */
.gridia .wsbar{display:flex;gap:6px;margin:0 0 30px;border-bottom:1px solid var(--line);}
.gridia .wsbtn{cursor:pointer;background:transparent;border:0;position:relative;
  color:var(--muted);font-family:inherit;font-size:14px;font-weight:500;padding:13px 4px;margin-right:28px;
  display:inline-flex;align-items:baseline;gap:9px;transition:color .25s var(--ease);}
.gridia .wsbtn::after{content:"";position:absolute;left:0;right:0;bottom:-1px;height:2px;border-radius:2px;
  background:var(--grad);transform:scaleX(0);transform-origin:left;transition:transform .35s var(--ease);}
.gridia .wsbtn:hover{color:var(--text);}
.gridia .wsbtn.active{color:var(--text);font-weight:600;}
.gridia .wsbtn.active::after{transform:scaleX(1);}
.gridia .wsbtn .wsk{font-family:var(--mono);font-size:9.5px;letter-spacing:.13em;text-transform:uppercase;color:var(--muted);}
.gridia .wsbtn.active .wsk{color:var(--violet);}
.gridia .toolbar{display:flex;justify-content:space-between;align-items:center;gap:16px;margin:34px 0 18px;flex-wrap:wrap;}
.gridia .toolbar .t-title{display:flex;align-items:center;gap:10px;font-size:13px;color:var(--muted);}
.gridia .row-actions{display:flex;gap:8px;align-items:center;flex-wrap:wrap;}
.gridia .viewswitch{display:inline-flex;border:1px solid var(--line);border-radius:100px;padding:4px;gap:4px;
  margin-bottom:22px;flex-wrap:wrap;background:var(--panel-2);}
.gridia .vbtn{cursor:pointer;background:transparent;border:none;color:var(--muted);font-family:inherit;font-weight:500;
  font-size:13px;padding:9px 17px;border-radius:100px;display:inline-flex;align-items:center;gap:7px;transition:all .25s var(--ease);}
.gridia .vbtn:hover{color:var(--text);}
.gridia .vbtn.active{background:var(--btn);color:var(--on-btn);font-weight:600;box-shadow:0 3px 12px var(--btn-glow);}
.gridia .vbtn .mini{font-family:var(--mono);font-size:9.5px;letter-spacing:.1em;text-transform:uppercase;opacity:.72;}

/* ---------- Zonas ---------- */
.gridia .zonecard{margin-bottom:14px;padding:22px 26px;}
.gridia .zonecard:nth-of-type(2){animation-delay:.06s;}
.gridia .zonecard:nth-of-type(3){animation-delay:.12s;}
.gridia .zhead{display:flex;align-items:center;justify-content:space-between;gap:18px;flex-wrap:wrap;}
.gridia .zid{display:flex;align-items:baseline;gap:14px;flex-wrap:wrap;min-width:0;}
.gridia .zname{font-size:17px;font-weight:600;color:var(--text);letter-spacing:-.025em;}
.gridia .zmeta{font-family:var(--mono);font-size:10px;letter-spacing:.11em;text-transform:uppercase;color:var(--muted);}
.gridia .zdone{font-family:var(--mono);font-size:10px;font-weight:600;letter-spacing:.09em;text-transform:uppercase;
  color:var(--accent-hi);border:1px solid var(--accent-border);background:var(--accent-soft);border-radius:100px;padding:4px 11px;}
.gridia .zsettings{margin-top:20px;padding-top:20px;border-top:1px solid var(--line-soft);animation:gin .35s var(--ease) both;}
.gridia .zsettings .selcount{margin-top:16px;}
.gridia .panel-head{display:flex;justify-content:space-between;align-items:flex-start;gap:20px;flex-wrap:wrap;margin-bottom:20px;}
.gridia .panel-title{font-size:19px;font-weight:600;color:var(--text);margin:0;letter-spacing:-.03em;}
.gridia .panel-note{color:var(--text-2);font-size:13px;line-height:1.7;margin-top:10px;max-width:840px;}
.gridia .panel-note b{color:var(--violet-hi);font-weight:600;}
.gridia .summary{margin-top:12px;font-size:12.5px;color:var(--text-2);background:var(--panel-2);
  border:1px solid var(--line-soft);border-left:2px solid var(--accent);border-radius:0 10px 10px 0;
  padding:11px 15px;line-height:1.65;max-width:840px;}
.gridia .summary b{color:var(--text);font-weight:600;}
.gridia .selcount{font-family:var(--mono);font-size:9.5px;letter-spacing:.12em;text-transform:uppercase;
  color:var(--muted);margin:22px 0 11px;display:flex;align-items:center;gap:10px;flex-wrap:wrap;}
.gridia .ztag{display:inline-block;border-radius:100px;padding:3px 10px;font-family:var(--mono);font-size:9.5px;
  font-weight:600;letter-spacing:.07em;text-transform:uppercase;background:var(--violet-soft);color:var(--violet-hi);
  border:1px solid var(--violet-border);}
.gridia .gz{font-family:var(--mono);font-size:9.5px;color:var(--muted);margin-top:5px;letter-spacing:.1em;text-transform:uppercase;}

/* ---------- Avisos ---------- */
.gridia .warnline{margin-top:12px;font-size:12.5px;color:var(--amber-hi);background:var(--amber-soft);
  border:1px solid var(--amber-border);border-radius:10px;padding:11px 15px;line-height:1.6;max-width:840px;
  animation:gin .35s var(--ease) both;}
.gridia .err{background:var(--danger-soft);border:1px solid var(--danger-border);color:var(--danger);
  border-radius:10px;padding:14px 17px;margin-top:18px;font-size:13px;animation:gin .35s var(--ease) both;}
.gridia .err b{color:var(--danger);}
.gridia .empty{color:var(--muted);text-align:center;padding:54px 20px;font-size:13px;line-height:1.75;
  border:1px dashed var(--line);border-radius:12px;background:var(--panel-2);}
.gridia .loadingbox{display:flex;gap:16px;align-items:flex-start;margin-top:22px;background:var(--panel-2);
  border:1px solid var(--line);border-left:2px solid var(--violet);border-radius:0 12px 12px 0;padding:20px;
  animation:gin .35s var(--ease) both;}
.gridia .loadingbox b{color:var(--text);font-size:14px;font-weight:600;}
.gridia .loadingbox p{margin:8px 0 0;color:var(--text-2);font-size:12.5px;animation:gfade .5s var(--ease);}
.gridia .loadingbox .eta{color:var(--muted);font-size:11.5px;margin-top:10px;}
.gridia .check{font-family:var(--mono);font-size:11.5px;font-weight:700;line-height:1;}

/* ---------- Glosario ---------- */
.gridia .glossary{background:var(--panel-2);border:1px solid var(--line);border-radius:12px;padding:20px;margin:20px 0;}
.gridia .glossary h4{margin:0 0 14px;color:var(--text-2);font-family:var(--mono);font-size:9.5px;
  font-weight:600;letter-spacing:.15em;text-transform:uppercase;}
.gridia .gitem{display:inline-flex;flex-direction:column;border:1px solid var(--line-soft);background:var(--panel);
  border-radius:10px;padding:10px 13px;margin:0 8px 8px 0;max-width:300px;vertical-align:top;
  transition:transform .22s var(--ease),border-color .22s var(--ease);}
.gridia .gitem:hover{transform:translateY(-2px);border-color:var(--violet-border);}
.gridia .gitem b{color:var(--violet-hi);font-size:12.5px;font-weight:600;}
.gridia .gitem span{color:var(--muted);font-size:11.5px;margin-top:3px;line-height:1.5;}

/* ---------- Resultados y tabla ---------- */
.gridia .result-head{display:flex;justify-content:space-between;align-items:flex-start;gap:18px;flex-wrap:wrap;margin-bottom:16px;}
.gridia .result-head h3{margin:0;color:var(--text);font-size:17px;font-weight:600;letter-spacing:-.025em;}
.gridia .result-head p{margin:7px 0 0;color:var(--muted);font-size:12.5px;line-height:1.6;}
.gridia .tablewrap{overflow-x:auto;border:1px solid var(--line);border-radius:12px;background:var(--panel-2);
  animation:gin .45s var(--ease) both;scroll-behavior:smooth;}
.gridia table{border-collapse:separate;border-spacing:0;width:max-content;min-width:100%;}
.gridia th,.gridia td{border-bottom:1px solid var(--line-soft);border-right:1px solid var(--line-soft);
  padding:14px 16px;font-size:12.5px;vertical-align:top;text-align:left;}
.gridia thead th{background:var(--panel);position:sticky;top:0;min-width:300px;padding:13px 16px;}
.gridia .dnum{display:block;font-family:var(--mono);font-size:12px;font-weight:600;letter-spacing:.1em;color:var(--accent);}
.gridia .ddate{display:block;font-family:var(--mono);font-size:9.5px;letter-spacing:.08em;text-transform:uppercase;color:var(--muted);margin-top:4px;}
.gridia .stickyc{position:sticky;left:0;z-index:2;background:var(--panel);color:var(--text-2);min-width:184px;
  font-family:var(--mono);font-size:9.5px;font-weight:600;letter-spacing:.12em;text-transform:uppercase;}
.gridia thead th.stickyc{z-index:3;color:var(--muted);}
.gridia td.cell{background:var(--panel-2);color:var(--text-2);min-width:300px;white-space:pre-wrap;line-height:1.7;
  transition:background-color .2s var(--ease);}
.gridia tbody tr:hover td.cell{background:var(--panel);}
.gridia td.sep{background:var(--inset);color:var(--muted);font-family:var(--mono);font-size:9.5px;
  letter-spacing:.19em;text-transform:uppercase;font-weight:600;padding:10px 16px;}
.gridia code{color:var(--accent-hi);font-family:var(--mono);font-size:11.5px;font-weight:400;word-break:break-word;display:block;line-height:1.7;letter-spacing:.01em;}
.gridia .tag{display:inline-block;border-radius:100px;padding:3px 10px;font-family:var(--mono);font-size:9.5px;
  font-weight:600;letter-spacing:.07em;text-transform:uppercase;}
.gridia .tag.v{background:var(--amber-soft);color:var(--amber-hi);border:1px solid var(--amber-border);}
.gridia .tag.i{background:var(--inset);color:var(--text-2);border:1px solid var(--line);}
.gridia .statussel{background:var(--inset);border:1px solid var(--line);color:var(--text);border-radius:8px;
  padding:7px 9px;font-size:12px;width:100%;cursor:pointer;font-family:inherit;transition:all .22s var(--ease);}
.gridia .statussel:focus{border-color:var(--accent);outline:none;box-shadow:0 0 0 4px var(--accent-ring);}
.gridia .terms{margin:0;padding-left:16px;}
.gridia .terms li{margin-bottom:6px;}
.gridia .terms b{color:var(--text);font-weight:600;}
.gridia .vd p{margin:0 0 6px;}
.gridia .vd b{color:var(--text);font-weight:600;}
.gridia .vd ul{margin:3px 0 10px;padding-left:16px;}

/* ---------- Etiquetas y tendencias ---------- */
.gridia .tagbox{display:flex;flex-wrap:wrap;gap:8px;align-items:center;background:var(--inset);
  border:1px solid var(--line);border-radius:10px;padding:9px 11px;transition:all .22s var(--ease);}
.gridia .tagbox:focus-within{border-color:var(--accent);box-shadow:0 0 0 4px var(--accent-ring);}
.gridia .tagbox input{flex:1;min-width:160px;background:transparent;border:0;color:var(--text);
  font-size:13.5px;font-family:inherit;outline:none;padding:3px 2px;}
.gridia .tag-on{display:inline-flex;align-items:center;gap:8px;background:var(--btn);color:var(--on-btn);
  border:1px solid var(--btn);border-radius:100px;padding:5px 10px;font-size:12.5px;font-weight:600;
  box-shadow:0 2px 10px var(--btn-glow);animation:gin .3s var(--ease) both;}
.gridia .tag-on button{background:transparent;border:0;color:inherit;cursor:pointer;font-size:14px;line-height:1;
  padding:0;opacity:.6;transition:opacity .2s var(--ease);}
.gridia .tag-on button:hover{opacity:1;}
.gridia .sugg{display:flex;flex-wrap:wrap;gap:7px;margin-top:10px;align-items:center;}
.gridia .sugg .sl{font-family:var(--mono);font-size:9.5px;letter-spacing:.13em;text-transform:uppercase;color:var(--muted);margin-right:2px;}
.gridia .sugg button{cursor:pointer;background:transparent;border:1px dashed var(--line);color:var(--muted);
  border-radius:100px;padding:5px 11px;font-size:12px;font-family:inherit;transition:all .22s var(--ease);}
.gridia .sugg button:hover:not(:disabled){border-style:solid;border-color:var(--btn);color:var(--btn);transform:translateY(-1px);}
.gridia .sugg button:disabled{opacity:.28;cursor:not-allowed;}
.gridia .basebox{margin-top:11px;border:1px solid var(--accent-border);border-radius:12px;background:var(--accent-soft);
  padding:16px;animation:gin .4s var(--ease) both;}
.gridia .basehead{display:flex;align-items:center;justify-content:space-between;gap:12px;flex-wrap:wrap;margin-bottom:12px;}
.gridia .basename{font-weight:600;font-size:13.5px;color:var(--text);display:flex;align-items:center;gap:9px;}
.gridia .basestats{display:flex;flex-wrap:wrap;gap:18px;}
.gridia .bstat{display:flex;flex-direction:column;gap:2px;}
.gridia .bstat b{font-size:17px;font-weight:600;color:var(--accent-hi);line-height:1.2;font-variant-numeric:tabular-nums;}
.gridia .bstat span{font-family:var(--mono);font-size:9px;letter-spacing:.13em;text-transform:uppercase;color:var(--muted);}
.gridia .basetax{margin-top:13px;padding-top:12px;border-top:1px solid var(--line-soft);font-size:12px;color:var(--text-2);line-height:1.7;}
.gridia .basetax b{color:var(--text);font-weight:600;}
.gridia .demlist{display:flex;flex-wrap:wrap;gap:7px;margin-top:11px;}
.gridia .dterm{cursor:pointer;display:inline-flex;align-items:baseline;gap:8px;background:var(--panel-2);
  border:1px solid var(--line);border-radius:100px;padding:6px 12px;font-family:inherit;font-size:12.5px;
  color:var(--text-2);transition:all .22s var(--ease);}
.gridia .dterm:hover{border-color:var(--accent-border);color:var(--text);}
.gridia .dterm.on{background:var(--accent-soft);border-color:var(--accent-border);color:var(--accent-hi);font-weight:600;}
.gridia .dterm .dm{font-size:10px;color:var(--muted);font-variant-numeric:tabular-nums;}
.gridia .dterm.on .dm{color:var(--accent-hi);opacity:.75;}
.gridia .trendhead{display:flex;align-items:center;justify-content:space-between;gap:12px;flex-wrap:wrap;margin-bottom:9px;}
.gridia .trendbox{margin-top:13px;border:1px solid var(--line);border-radius:12px;background:var(--panel-2);padding:16px;
  animation:gin .4s var(--ease) both;}
.gridia .trendbox .tl{font-family:var(--mono);font-size:9.5px;letter-spacing:.14em;text-transform:uppercase;
  color:var(--muted);margin-bottom:11px;display:block;}
.gridia .thash{display:inline-flex;flex-direction:column;align-items:flex-start;gap:3px;cursor:pointer;background:transparent;
  border:1px dashed var(--line);border-radius:10px;padding:8px 12px;margin:0 7px 7px 0;font-family:inherit;
  text-align:left;max-width:270px;transition:all .22s var(--ease);}
.gridia .thash:hover:not(:disabled){border-style:solid;border-color:var(--amber-border);background:var(--amber-soft);transform:translateY(-2px);}
.gridia .thash:disabled{opacity:.3;cursor:not-allowed;}
.gridia .thash b{font-family:var(--mono);font-size:12px;font-weight:600;color:var(--amber-hi);}
.gridia .thash span{font-size:11px;color:var(--muted);line-height:1.45;}

/* ---------- Adjuntos ---------- */
.gridia .files{display:flex;flex-wrap:wrap;gap:8px;margin-top:11px;}
.gridia .file{display:flex;align-items:center;gap:9px;background:var(--panel-2);border:1px solid var(--line);
  border-radius:100px;padding:6px 12px;font-size:12px;color:var(--text-2);animation:gin .3s var(--ease) both;}
.gridia .file button{background:transparent;border:none;color:var(--muted);cursor:pointer;font-size:14px;
  line-height:1;padding:0 2px;transition:color .2s var(--ease);}
.gridia .file button:hover{color:var(--danger);}
.gridia .uploader{display:flex;align-items:center;justify-content:center;gap:8px;cursor:pointer;
  background:var(--inset);border:1px dashed var(--line);border-radius:10px;padding:13px;color:var(--muted);
  font-size:12.5px;font-weight:500;transition:all .22s var(--ease);}
.gridia .uploader:hover{border-color:var(--accent-border);color:var(--accent-hi);background:var(--accent-soft);}

.gridia .spin{animation:gridiaspin .85s linear infinite;}
@keyframes gridiaspin{to{transform:rotate(360deg);}}
@media(prefers-reduced-motion:reduce){.gridia *{animation:none!important;transition:none!important;}}
`;

/* ------------------------------- Iconos ------------------------------- */
const Logo = () => (
  <svg width="34" height="34" viewBox="0 0 40 40" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
    <defs>
      <linearGradient id="glg" x1="0" y1="0" x2="40" y2="40" gradientUnits="userSpaceOnUse">
        <stop stopColor="var(--accent)" /><stop offset="0.6" stopColor="var(--violet)" /><stop offset="1" stopColor="var(--amber)" />
      </linearGradient>
    </defs>
    <rect x="0.5" y="0.5" width="39" height="39" rx="11" stroke="var(--line)" fill="var(--panel-2)" />
    <rect x="10" y="10" width="8" height="8" rx="2.4" fill="url(#glg)" />
    <rect x="22" y="10" width="8" height="8" rx="2.4" fill="url(#glg)" opacity="0.52" />
    <rect x="10" y="22" width="8" height="8" rx="2.4" fill="url(#glg)" opacity="0.52" />
    <rect x="22" y="22" width="8" height="8" rx="2.4" fill="url(#glg)" opacity="0.2" />
  </svg>
);
const Sun = () => (
  <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round">
    <circle cx="12" cy="12" r="4.2" /><path d="M12 2.4v2.2M12 19.4v2.2M4.2 4.2l1.6 1.6M18.2 18.2l1.6 1.6M2.4 12h2.2M19.4 12h2.2M4.2 19.8l1.6-1.6M18.2 5.8l1.6-1.6" />
  </svg>
);
const Moon = () => (
  <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
    <path d="M20.5 14.2A8.6 8.6 0 019.8 3.5a8.6 8.6 0 1010.7 10.7z" />
  </svg>
);
const Spin = ({ color = 'currentColor' }) => (
  <svg className="spin" width="18" height="18" viewBox="0 0 24 24" fill="none">
    <circle cx="12" cy="12" r="10" style={{ stroke: color }} strokeWidth="4" opacity="0.25" />
    <path d="M4 12a8 8 0 018-8" style={{ stroke: color }} strokeWidth="4" strokeLinecap="round" />
  </svg>
);
const DL = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
    <path d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1M16 12l-4 4-4-4M12 16V4" strokeLinecap="round" strokeLinejoin="round" />
  </svg>
);

const LOAD_MSGS = [
  'Analizando los modismos de la zona…',
  'Repartiendo publicaciones entre los estados seleccionados…',
  'Redactando copies con sabor local (con brand safety)…',
  'Armando master prompts de arte en inglés…',
  'Calculando créditos de producción…',
];
function LoadingBlock({ zona, prog }) {
  const [i, setI] = useState(0);
  useEffect(() => {
    const t = setInterval(() => setI((x) => (x + 1) % LOAD_MSGS.length), 2600);
    return () => clearInterval(t);
  }, []);
  return (
    <div className="loadingbox">
      <Spin color="var(--violet)" />
      <div>
        <b>Generando Parrilla {zona}…</b>
        {prog && <p style={{ color: 'var(--violet-hi)', fontWeight: 600 }}>Publicaciones listas: {prog.done}/{prog.total}</p>}
        {prog && prog.msg
          ? <p style={{ color: '#ffd166', fontWeight: 700 }}>{prog.msg}</p>
          : <p>{LOAD_MSGS[i]}</p>}
        <p className="eta">Si la IA está saturada, el sistema espera y reintenta solo (hasta 4 intentos). Puede tardar de 1 a 3 minutos. No cierres esta vista.</p>
      </div>
    </div>
  );
}

/* --------------------------- IA: llamada + parseo --------------------------- */
function tryParse(t) {
  try { return JSON.parse(t); } catch (e) { return null; }
}
/* Calcula los cierres pendientes de un prefijo JSON (ignorando llaves dentro de strings). */
function pendingClosers(prefix) {
  const stack = [];
  let inStr = false, esc = false;
  for (let i = 0; i < prefix.length; i++) {
    const c = prefix[i];
    if (inStr) {
      if (esc) esc = false;
      else if (c === '\\') esc = true;
      else if (c === '"') inStr = false;
      continue;
    }
    if (c === '"') { inStr = true; continue; }
    if (c === '{' || c === '[') stack.push(c);
    else if (c === '}') { if (stack[stack.length - 1] === '{') stack.pop(); else return null; }
    else if (c === ']') { if (stack[stack.length - 1] === '[') stack.pop(); else return null; }
  }
  if (inStr) return null;
  return stack.reverse().map((c) => (c === '{' ? '}' : ']')).join('');
}
/* Repara un JSON truncado: corta en el último objeto completo y cierra la estructura. */
function repairTruncatedJSON(t) {
  const cuts = [];
  for (let i = t.length - 1; i >= 0 && cuts.length < 60; i--) {
    if (t[i] === '}') cuts.push(i);
  }
  for (const i of cuts) {
    const prefix = t.slice(0, i + 1);
    const closers = pendingClosers(prefix);
    if (closers === null) continue;
    const candidate = (prefix + closers).replace(/,(\s*[}\]])/g, '$1');
    const parsed = tryParse(candidate);
    if (parsed && Array.isArray(parsed.posts) && parsed.posts.length) return parsed;
  }
  return null;
}
function parseGridJSON(text) {
  let t = String(text).trim();
  const fence = t.match(/```(?:json)?\s*([\s\S]*?)```/i);
  if (fence) t = fence[1].trim();
  const first = t.indexOf('{');
  if (first > 0) t = t.slice(first);
  const direct = tryParse(t.replace(/,(\s*[}\]])/g, '$1'));
  if (direct) return direct;
  const last = t.lastIndexOf('}');
  if (last !== -1) {
    const sliced = t.slice(0, last + 1).replace(/,(\s*[}\]])/g, '$1');
    const p2 = tryParse(sliced);
    if (p2) return p2;
  }
  const repaired = repairTruncatedJSON(t);
  if (repaired) { repaired._recuperado = true; return repaired; }
  throw new Error('JSON ilegible');
}

let __ultimaLlamada = 0;
async function callClaudeGrid(prompt, files) {
  const gap = Date.now() - __ultimaLlamada;
  if (gap < 3000) await new Promise((r) => setTimeout(r, 3000 - gap));
  __ultimaLlamada = Date.now();
  let content;
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
    if (/exceeded_limit|"type"\s*:\s*"rate_limit|Límite alcanzado/i.test(cuerpo)) {
      const m = cuerpo.match(/"resetsAt"\s*:\s*(\d+)/) || cuerpo.match(/"resets_at"\s*:\s*(\d+)/);
      throw new Error('LIMIT|' + (m ? m[1] : ''));
    }
    if (res.status === 429 || res.status === 529) throw new Error('OVERLOADED');
    throw new Error('La IA no pudo responder (código ' + res.status + '). Espera unos segundos e inténtalo otra vez.');
  }
  const data = await res.json();
  const text = (data.content || []).filter((b) => b.type === 'text').map((b) => b.text).join('\n');
  if (!text) throw new Error('La IA devolvió una respuesta vacía. Vuelve a generar la parrilla.');
  try {
    return parseGridJSON(text);
  } catch (e) {
    throw new Error('La respuesta de la IA llegó incompleta o ilegible.');
  }
}

const wait = (ms) => new Promise((r) => setTimeout(r, ms));

/* Traduce errores técnicos a mensajes accionables para el operador. */
function traducirError(err) {
  const m = (err && err.message) || '';
  if (m.startsWith('LIMIT|')) {
    const ep = parseInt(m.split('|')[1]);
    let cuando = '';
    if (ep) {
      const d = new Date(ep * 1000);
      const hoy = new Date().toDateString() === d.toDateString();
      cuando = ' Se restablece ' + (hoy ? 'hoy' : 'el ' + d.toLocaleDateString('es-MX', { day: '2-digit', month: 'short' })) + ' a las ' + d.toLocaleTimeString('es-MX', { hour: '2-digit', minute: '2-digit' }).replace(/\s*\./g, '') + '.';
    }
    return 'Alcanzaste el límite de uso de Claude de tu cuenta (no es un fallo de la herramienta: cada generación consume tu cuota).' + cuando + ' Al reanudar, genera de a una zona y con menos publicaciones para que rinda más.';
  }
  if (m === 'OVERLOADED') return 'La IA sigue saturada tras varios reintentos automáticos (~1.5 min de espera acumulada). Suele ser un límite temporal por minuto: espera 2–3 minutos y vuelve a intentar.';
  if (/fetch|network/i.test(m)) return 'Sin conexión con el servicio de IA. Revisa tu internet y reintenta.';
  return m || 'Ocurrió un error al generar la parrilla.';
}

/* Reintentos con espera progresiva. Ante alta demanda (429/529) espera 12→25→40 s
   (suficiente para que un límite por minuto se libere) mostrando cuenta regresiva. */
async function callWithRetry(prompt, files, onStatus) {
  const ESPERAS_DEMANDA = [12, 25, 40];
  let lastErr = null;
  for (let intento = 0; intento <= 3; intento++) {
    try {
      if (onStatus) onStatus(null);
      return await callClaudeGrid(prompt, files);
    } catch (ex) {
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

/* Parseo de una lista JSON devuelta por la IA. */
function parseLista(text) {
  let t = String(text).trim();
  const fence = t.match(/```(?:json)?\s*([\s\S]*?)```/i);
  if (fence) t = fence[1].trim();
  const i = t.indexOf('[');
  const j = t.lastIndexOf(']');
  if (i === -1 || j === -1 || j < i) throw new Error('Sin lista');
  return JSON.parse(t.slice(i, j + 1).replace(/,(\s*[}\]])/g, '$1'));
}

/* Consulta Google Trends (vía búsqueda web en vivo) acotado a marketing. */
async function fetchTrending({ pais, mes, temas, redes }) {
  const gap = Date.now() - __ultimaLlamada;
  if (gap < 3000) await new Promise((r) => setTimeout(r, 3000 - gap));
  __ultimaLlamada = Date.now();
  const prompt = `Consulta Google Trends (trends.google.com) y fuentes de la industria para identificar qué términos y temas de MARKETING están en aumento AHORA (${mes} de ${new Date().getFullYear()}) en ${pais}.

Busca específicamente consultas en tendencia o en aumento dentro de este universo, NO tendencias generales:
marketing digital, growth, paid media, Meta Ads, Google Ads, performance marketing, generación y calidad de leads, funnels, CRO, e-commerce, ROAS, CAC, atribución, analítica, automatización, CRM, SEO, demand generation, marketing B2B, creatividad publicitaria e inteligencia artificial aplicada al marketing.

REGLAS ESTRICTAS
- DESCARTA por completo cualquier tendencia ajena al marketing: espectáculos, deportes, política, noticias, celebridades o efemérides sin relación con el sector. Si un término está en tendencia pero no sirve a una agencia B2B, no lo incluyas.
- DESCARTA hashtags genéricos y sobresaturados que no aporten alcance real (por ejemplo los de una sola palabra común) y cualquiera ligado a polémicas o temas sensibles.
- Prioriza términos con señal real de crecimiento en búsquedas o en conversación profesional del sector.
${(temas && temas.length) ? '- Da preferencia a los que se relacionen con estos temas del mes: ' + temas.join(', ') + '.' : ''}
${(redes && redes.length) ? '- Contexto de publicación: ' + redes.join(', ') + '.' : ''}

Devuelve de 8 a 12 hashtags. Responde ÚNICAMENTE con un arreglo JSON válido, sin markdown ni texto alrededor:
[{"tag":"#EjemploHashtag","tema":"subtema de marketing al que pertenece, 1 a 3 palabras","motivo":"señal de tendencia y fuente, máximo 12 palabras"}]`;
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
  const text = (data.content || []).filter((b) => b.type === 'text').map((b) => b.text).join('\n');
  const lista = parseLista(text);
  return lista.filter((x) => x && x.tag).map((x) => ({
    tag: String(x.tag).trim().replace(/^#*/, '#').replace(/\s+/g, ''),
    tema: String(x.tema || '').trim(),
    motivo: String(x.motivo || '').trim(),
  }));
}


/* Consulta el servicio de tendencias de LID (proxy propio) para obtener
   demanda de búsqueda real que alimente la planeación SEO. */
async function fetchDemandaSEO(endpoint, geo, periodo) {
  const base = String(endpoint || '').trim();
  if (!/^https:\/\//i.test(base)) throw new Error('La URL del servicio debe empezar con https://');
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
  const limpio = arr.filter((x) => x && x.termino).map((x) => ({
    termino: String(x.termino).trim(),
    semilla: String(x.semilla || '').trim(),
    interes: Number(x.interes) || 0,
    variacion: String(x.variacion || '').trim(),
    tipo: String(x.tipo || '').trim(),
  }));
  if (!limpio.length) throw new Error('El servicio no devolvió términos.');
  return limpio;
}

/* Días del mes distribuidos uniformemente para n publicaciones. */
function planDays(n) {
  return Array.from({ length: n }, (_, i) => Math.max(1, Math.min(30, Math.round(((i + 1) * 30) / (n + 1)))));
}

/* Créditos calculados por la app (determinista): Imagen = 1; Video = créditos de la tool × escenas. */
function computeCredits(posts) {
  let imgs = 0, vids = 0, total = 0;
  const porTool = {};
  posts.forEach((p) => {
    if (p.formatoArte === 'Video' && p.videoDetails) {
      vids++;
      const tool = VIDEO_AI_TOOLS.find((t) => t.name === String(p.videoDetails.videoAITool || '').trim());
      const esc = Math.max(1, parseInt(p.videoDetails.numEscenas) || 1);
      const c = (tool ? tool.credits : 300) * esc;
      total += c;
      const nm = tool ? tool.name : (p.videoDetails.videoAITool || 'Video AI');
      porTool[nm] = (porTool[nm] || 0) + c;
    } else {
      imgs++;
      total += 1;
    }
  });
  const min = total;
  const max = Math.round(total * 1.4);
  const det = Object.keys(porTool).map((k) => k + ': ' + porTool[k]).join(' · ');
  return { min, max, summary: 'Estimación: ' + min.toLocaleString() + '–' + max.toLocaleString() + ' créditos · ' + imgs + ' imágenes (1 c/u) y ' + vids + ' videos' + (det ? ' (' + det + ')' : '') + '. El rango superior contempla retomas.' };
}

function buildPrompt({ country, regionLabel, zonaNota, estados, form, days, prevPosts, totalPosts, esGeneral, esLid, plataformas, temas, hashtags, base, demanda }) {
  const focus = form.focus.join(', ') || 'Branding';
  const brandBlock = form.brandContext && form.brandContext.trim()
    ? 'Contexto de marca aportado por el usuario (MANUAL DE VOZ Y TONO):\n' + form.brandContext.trim()
    : (esLid
      ? 'Voz por defecto (LID Marketing): agencia mexicana de marketing digital, unidad Media & Growth posicionada como "Algorithmic Growth Center". Tono experto, directo y sin relleno; autoridad basada en datos y casos reales, no en frases motivacionales. Audiencia B2B: directores de marketing, líderes de growth, dueños de negocio y equipos in-house.'
      : (form.client.toLowerCase() === 'bait'
        ? 'Voz de marca por defecto (Bait): moderna, accesible, amigable y empoderadora; evita tecnicismos; optimista y enfocada en el valor de estar conectado sin gastar de más. Para todos: estudiantes, emprendedores, familias.'
        : 'Investiga brevemente la marca "' + form.client + '" según tu conocimiento para inferir su negocio, público y tono.'));
  const filesNote = (form.brandFiles && form.brandFiles.length)
    ? 'Se adjuntaron ' + form.brandFiles.length + ' documento(s)/imagen(es) de marca (manual de voz y tono / brandbook); analízalos como fuente principal y OBLIGATORIA de identidad visual y verbal.'
    : '';

  const usados = new Set((prevPosts || []).map((p) => p.estadoFoco));
  const pendientes = esGeneral ? [] : estados.filter((s) => !usados.has(s));
  const prevImgs = (prevPosts || []).filter((p) => p.formatoArte !== 'Video').length;
  const prevVids = (prevPosts || []).length - prevImgs;
  const continuidad = (prevPosts && prevPosts.length)
    ? `CONTINUIDAD (este es un bloque intermedio de una parrilla de ${totalPosts} publicaciones)
- Ya existen ${prevPosts.length} publicaciones. NO repitas estas ideas ni sus ángulos: ${prevPosts.slice(-12).map((p) => 'Día ' + p.dia + ' (' + (p.plataforma || p.estadoFoco || '') + '): ' + p.ideaPrincipal).join(' | ')}
- Balance de formatos hasta ahora: ${prevImgs} Imagen / ${prevVids} Video. Compensa para que el total quede equilibrado según "${form.formats}".
${esLid ? '- Rota las plataformas y los tipos de post; no repitas la misma combinación dos veces seguidas.' : (esGeneral ? '- Mantén la variedad temática cubriendo distintos momentos de consumo y audiencias del país.' : (pendientes.length ? '- Estados aún SIN publicación (dales prioridad): ' + pendientes.join(', ') + '.' : '- Todos los estados ya tienen al menos una publicación; alterna entre ellos.'))}
` : (esLid ? `- Reparte las publicaciones entre las plataformas seleccionadas y varía los tipos de post.` : (esGeneral ? `- Cubre distintos momentos de consumo, audiencias y ocasiones relevantes a nivel nacional.` : `- Distribuye las publicaciones entre los estados seleccionados de forma representativa.`));

  const tarea = esLid
    ? `TAREA: genera ${days.length} publicaciones (bloque de una parrilla de ${totalPosts}) para las redes sociales propias de ${form.client}, organizadas por plataforma, tipo de post y tema/campaña.`
    : (esGeneral
      ? `TAREA: genera ${days.length} publicaciones (bloque de una parrilla de ${totalPosts}) GENERALES para TODO ${country} (parrilla nacional), en español neutro y con apego estricto al manual de voz y tono de la marca.`
      : `TAREA: genera ${days.length} publicaciones (bloque de una parrilla de ${totalPosts}) para la ZONA ${regionLabel.toUpperCase()} de ${country}, adaptadas a los estados seleccionados y, sobre todo, a su forma de hablar.`);

  const tallyPilar = {};
  (prevPosts || []).forEach((x) => { if (x.pilar) tallyPilar[x.pilar] = (tallyPilar[x.pilar] || 0) + 1; });
  const tallyTxt = Object.keys(tallyPilar).length ? Object.keys(tallyPilar).map((k) => k + ': ' + tallyPilar[k]).join(' · ') : 'ninguno todavía';
  const canales = (plataformas || PLATAFORMAS);

  const bloqueBase = (esLid && base && base.length) ? '\n\n' + baseDigest(base) : '';
  const adaptacionLid = `${LID_BRAND}${bloqueBase}

CANALES SELECCIONADOS — una idea estratégica, expresiones nativas distintas
Nunca repartas el mismo copy entre redes. Una misma tesis se reinterpreta según el canal:
${canales.map((pl) => '· ' + pl + ': ' + (LID_CANAL[pl] || 'usa el formato y el tono nativos de la plataforma.')).join('\n')}

- "redesSociales": arreglo con los canales donde vive la pieza. Agrupa varios SOLO cuando el contenido funcione igual en todos (por ejemplo Facebook + Instagram); separa cuando el formato o la audiencia lo exijan (un hilo solo en X, un artículo solo en SEO / Blog, un análisis ejecutivo solo en LinkedIn). Si agrupas, el copy debe leerse natural en todos.
- "tipoPost": formato nativo del canal, entre: ${TIPOS_POST.join(' | ')}.
- "audiencia": el decisor concreto al que le habla la pieza.
- "insight": la verdad de negocio o del consumidor que justifica la publicación, en UNA frase de máximo 20 palabras. Observación real y específica, jamás un lugar común ni el resumen del post.
- "pilar": elige entre ${LID_PILARES.join(' | ')}. Respeta esa distribución a lo largo del mes; no acumules piezas del mismo pilar. Pilares ya usados en esta parrilla: ${tallyTxt}.
- "propiedad": marco editorial recurrente, entre ${LID_PROPIEDADES.join(' | ')}. No hace falta nombrarla en el copy: orienta el enfoque.
- "etapaFunnel": ${LID_FUNNEL.join(' | ')}. Reparte la parrilla entre las etapas; no la llenes de Conversion.
- "fichaCanal": especificación técnica propia del canal, en una línea compacta. SEO / Blog: keyword primaria, secundarias, intención, title, slug, meta description y H2 sugeridos. YouTube: título, concepto de thumbnail, capítulos y Shorts derivados. X: estructura del hilo si aplica. LinkedIn: qué voz firma (marca, dirección, especialista o equipo). Meta y TikTok: hook visual y beats. Deja "" si el canal no lo requiere.
- "repurposing": en máximo 20 palabras, cómo reutilizar esta misma tesis en otro canal con una expresión distinta.
${(demanda && demanda.length) ? `- DEMANDA DE BÚSQUEDA REAL (Google Trends). Para las piezas de SEO / Blog, elige la keyword primaria y el ángulo a partir de estos términos con demanda comprobada, y regístralos en "fichaCanal". Criterio obligatorio: DESCARTA los términos que no tengan relación con marketing — en estos datos se cuelan homónimos y ruido (nombres de personas, bolsa, productos ajenos). Descarta también los de intención básica o de estudiante ("qué es", "curso", "maestría") salvo que puedas elevarlos a una pregunta de negocio, según la regla de originalidad de la marca. Si ninguno sirve para la pieza, usa tu criterio y no fuerces la keyword. Estos términos NO deben influir en las piezas de otros canales.
${demanda.map((d) => '  · ' + d.termino + (d.semilla ? ' [semilla: ' + d.semilla + ']' : '') + (d.variacion ? ' · ' + d.variacion : '') + (d.tipo ? ' · ' + d.tipo : '')).join('\n')}` : ''}
- "temaCampana": el tema o campaña al que pertenece la pieza, tomado de la lista del mes; reutiliza los nombres para que el mes se lea como campañas con hilo argumental.
${(hashtags && hashtags.length) ? `- HASHTAGS APROBADOS DEL MES (cada uno con el subtema de marketing al que pertenece):
${hashtags.map((h) => '  · ' + (h.tag || h) + (h.tema ? ' → ' + h.tema : '')).join('\n')}
  REGLA DE PERTINENCIA (obligatoria): incluye un hashtag SOLO si su subtema coincide con el tema real de esa publicación. Máximo 3 por pieza, al final del copyOut, y devuélvelos en "hashtags".
  Si ninguno corresponde al tema de la pieza, devuelve "hashtags": [] y no escribas ninguno. Es preferible una publicación sin hashtags que con hashtags que no vienen al caso: no los repartas por rellenar, no repitas el mismo set en todas las piezas y no fuerces la relación.
  EXCEPCIÓN: si la publicación va en X, deja "hashtags" vacío y no los escribas en el copy.` : '- No se aprobaron hashtags este mes: deja "hashtags" como arreglo vacío y no escribas ninguno en el copy.'}
- Emojis: en LinkedIn, X, YouTube y SEO normalmente ninguno; en Meta y TikTok con moderación y nunca como sustituto de una idea.
- Deja "tecnicismosRegionales" como un arreglo vacío [] y usa "estadoFoco": "Nacional".`;

  const adaptacion = esLid ? adaptacionLid : esGeneral
    ? `ESPAÑOL NEUTRO NACIONAL + VOZ DE MARCA (lo MÁS importante)
- Alcance: TODO ${country}, sin dirigirse a ninguna región o estado en particular.
- Lenguaje: español neutro de ${country}, claro y ampliamente entendido en todo el país. EVITA regionalismos marcados, jerga local fuerte y referencias geográficas específicas; se permiten coloquialismos suaves de uso nacional solo si el manual de voz lo respalda.
- VOZ Y TONO: el manual de voz y tono de la marca MANDA sobre cualquier estilo. Respeta su personalidad, vocabulario permitido/prohibido, tratamiento (tú/usted) y nivel de formalidad en cada copy.
- Brand safety SIEMPRE: buen gusto, sin groserías, mensaje claro para una marca nacional.
- En cada post usa "estadoFoco": "Nacional" y en "tecnicismosRegionales" lista (máx. 2) las expresiones coloquiales NEUTRAS de alcance nacional o frases clave del tono de marca que usaste, con una nota breve de su función.`
    : `ADAPTACIÓN REGIONAL (lo MÁS importante)
- Zona: ${regionLabel} de ${country}. Estados: ${estados.join(', ')}.
- Estilo lingüístico de referencia: ${zonaNota}
- En cada publicación usa de forma AUTÉNTICA los modismos y regionalismos más comunes de esa zona; apóyate también en tu conocimiento propio de la región.
- Brand safety SIEMPRE: expresiones con buen gusto, sin groserías, mensaje claro para una marca nacional.
- En cada post indica "estadoFoco" (uno de la lista) y sus "tecnicismosRegionales" (término + significado breve).`;

  return `Eres "GridIA", arquitecto de parrillas de contenido de clase mundial (marketing, publicidad, comunicación y medios digitales), especializado en Facebook, Instagram, TikTok y LinkedIn, con enfoque en performance, brand safety e Inbound Marketing.

${tarea}

MARCA
- Cliente: ${form.client}
- ${brandBlock}
${filesNote ? '- ' + filesNote : ''}
${esLid ? '- Temas y campañas del mes (usa EXACTAMENTE estos nombres en "temaCampana" y reparte las publicaciones entre ellos): ' + ((temas && temas.length) ? temas.join(' | ') : 'no se definieron; propón de 2 a 4 campañas coherentes con la marca y reutilízalas') : '- Oferta comercial: ' + (form.offer || '(no especificada)')}
${form.comments ? '- Comentarios generales: ' + form.comments : ''}

PARÁMETROS
- Mes: ${form.month}. Incorpora con naturalidad temas de temporada y fechas relevantes de ${country} en ese mes.
- Genera EXACTAMENTE ${days.length} publicaciones, una por cada uno de estos días del mes (usa esos números en "dia"): ${days.join(', ')}.
- Enfoque de la parrilla: ${focus}.
- Formatos permitidos: ${form.formats}.
- Metodología: Inbound Marketing (etapas Atraer, Convertir, Cerrar, Deleitar), progresando por el funnel a lo largo del mes. ${esLid ? 'Asigna además "etapaFunnel" con la arquitectura de funnel de LID (' + LID_FUNNEL.join(', ') + ').' : 'Asigna además "etapaFunnel" según la etapa Inbound: Atraer=TOFU, Convertir=MOFU, Cerrar=BOFU, Deleitar=Fidelización.'}
- Para cada publicación sugiere "hora" óptima de publicación en formato 24h "HH:MM", según la audiencia y las mejores prácticas de redes sociales en ${country}; varía las horas a lo largo del mes (no repitas siempre la misma).

${continuidad}

${adaptacion}

REGLAS DE COPY
- copyIn: titular potente, MÁXIMO 5 palabras${esLid ? '' : ', SIN mencionar la marca "' + form.client + '"'}.
- copyOut: MÁXIMO 2 párrafos cortos, ${esLid ? 'escrito en la voz de la marca y adaptado a la plataforma' : 'SIN mencionar la marca, ' + (esGeneral ? 'en español neutro fiel a la voz de marca' : 'con los modismos integrados con naturalidad')}; cierra con un llamado a la acción coherente con su etapa Inbound (Atraer=descubrir/seguir, Convertir=registrar/consultar, Cerrar=comprar/activar, Deleitar=compartir/recomendar).
- Textos en ESPAÑOL; prompts de imagen/video en INGLÉS.

LÍMITES DE LONGITUD (OBLIGATORIOS, para que la respuesta quepa completa)
- ideaPrincipal ≤ 15 palabras · explicacionArte ≤ 35 palabras · pasoAPaso ≤ 40 palabras.
- masterPromptMidjourney ≤ 45 palabras (inglés, cinematográfico, alta calidad).
- Videos: numEscenas entre 2 y 3 MÁXIMO; cada prompt de escena (imagen y video) ≤ 25 palabras en inglés.
- videoAITool: elige UNA de esta lista escribiendo el nombre EXACTO: ${VIDEO_AI_TOOLS.map((t) => t.name).join(' | ')}.
- Máximo ${esGeneral ? 2 : 3} tecnicismosRegionales por post.

FORMATO DE SALIDA (OBLIGATORIO)
Responde ÚNICAMENTE con un objeto JSON válido y COMPACTO (una sola línea, sin markdown, sin comillas triples, sin texto antes ni después), con esta forma exacta:
{"posts":[{"dia":0,"hora":"HH:MM",${esLid ? '"redesSociales":["..."],"audiencia":"...","insight":"...","pilar":"...","propiedad":"...","tipoPost":"...","temaCampana":"...","fichaCanal":"...","repurposing":"...","hashtags":["..."],' : ''}"estadoFoco":"...","ideaPrincipal":"...","enfoquePublicacion":"Atraer|Convertir|Cerrar|Deleitar","etapaFunnel":"${esLid ? LID_FUNNEL.join('|') : 'TOFU|MOFU|BOFU|Fidelización'}","copyIn":"...","copyOut":"...","tecnicismosRegionales":[{"termino":"...","significado":"..."}],"explicacionArte":"...","formatoArte":"Imagen|Video","masterPromptMidjourney":"...","videoDetails":{"numEscenas":0,"videoAITool":"...","promptsEscenasMidjourney":["..."],"promptsVideoAI":["..."]},"pasoAPaso":"..."}]}
Si un post es "Imagen", usa "videoDetails": null.`;
}

/* ------------------------------- CSV ------------------------------- */
const CSV_HEADERS = ['Zona', 'Fecha', 'Día', 'Hora', 'Status', 'Enfoque de la publicación (Inbound Marketing)', 'Etapa del funnel', 'Idea principal', 'Copy in', 'Copy out', 'Formato del arte a desarrollar', 'Arte', 'Estado foco', 'Modismos (término: significado)', 'Master Prompt (Midjourney)', 'Video - Escenas', 'Video - AI Tool', 'Video - Prompts Imagen', 'Video - Prompts Video', 'Paso a paso'];

const slug = (s) => String(s).normalize('NFD').replace(/[\u0300-\u036f]/g, '').replace(/[^a-z0-9]+/gi, '_').replace(/^_|_$/g, '').toLowerCase();

function postToRow(zona, p) {
  const modismos = (p.tecnicismosRegionales || []).map((x) => x.termino + ': ' + x.significado).join(' | ');
  const vd = p.videoDetails;
  return [zona, p.fecha || '', p.dia, p.hora || '', p.status || 'Pendiente', p.enfoquePublicacion || '', p.etapaFunnel || '', p.ideaPrincipal || '', p.copyIn || '', p.copyOut || '', p.formatoArte || '', p.explicacionArte || '', p.estadoFoco || '', modismos, p.masterPromptMidjourney || '', vd ? vd.numEscenas : '', vd ? vd.videoAITool : '', vd ? (vd.promptsEscenasMidjourney || []).join(' ; ') : '', vd ? (vd.promptsVideoAI || []).join(' ; ') : '', p.pasoAPaso || ''];
}
const TPL_XLSX_LABELS = { fecha: 'Fecha', hora: 'Hora', status: 'Status', enfoque: 'Enfoque de la publicación (Inbound Marketing)', funnel: 'Etapa del funnel', idea: 'Idea principal', cin: 'Copy in', cout: 'Copy out', formato: 'Formato del arte a desarrollar', arte: 'Arte' };
function postsToAOA(posts, conZona) {
  const fila = (label, fn) => [label].concat(posts.map(fn));
  const vd = (p, f) => (p.videoDetails ? f(p.videoDetails) : '');
  const mod = (p) => (p.tecnicismosRegionales || []).map((t) => t.termino + ': ' + t.significado).join(' | ');
  const head = [' '].concat(posts.map((p) => 'Día ' + p.dia + (conZona && p._zona ? ' · ' + p._zona : '')));
  return [
    head,
    fila(TPL_XLSX_LABELS.fecha, (p) => p.fecha || ''),
    fila(TPL_XLSX_LABELS.hora, (p) => p.hora || ''),
    fila(TPL_XLSX_LABELS.status, (p) => p.status || 'Pendiente'),
    fila(TPL_XLSX_LABELS.enfoque, (p) => p.enfoquePublicacion || ''),
    fila(TPL_XLSX_LABELS.funnel, (p) => p.etapaFunnel || ''),
    fila(TPL_XLSX_LABELS.idea, (p) => p.ideaPrincipal || ''),
    fila(TPL_XLSX_LABELS.cin, (p) => p.copyIn || ''),
    fila(TPL_XLSX_LABELS.cout, (p) => p.copyOut || ''),
    fila(TPL_XLSX_LABELS.formato, (p) => p.formatoArte || ''),
    fila(TPL_XLSX_LABELS.arte, (p) => p.explicacionArte || ''),
    [],
    ['EXTRAS GRIDIA'],
    fila('Estado foco', (p) => p.estadoFoco || ''),
    fila('Modismos usados', mod),
    fila('Master Prompt (Midjourney, EN)', (p) => p.masterPromptMidjourney || ''),
    fila('Video · AI Tool', (p) => vd(p, (v) => v.videoAITool || '')),
    fila('Video · Escenas', (p) => vd(p, (v) => v.numEscenas || '')),
    fila('Video · Prompts imagen (EN)', (p) => vd(p, (v) => (v.promptsEscenasMidjourney || []).join(' ; '))),
    fila('Video · Prompts video (EN)', (p) => vd(p, (v) => (v.promptsVideoAI || []).join(' ; '))),
    fila('Paso a paso', (p) => p.pasoAPaso || ''),
  ];
}
function lidPostsToAOA(posts) {
  const fila = (label, fn) => [label].concat(posts.map(fn));
  const vd = (p, f) => (p.videoDetails ? f(p.videoDetails) : '');
  const redes = (p) => (Array.isArray(p.redesSociales) && p.redesSociales.length ? p.redesSociales : (p.plataforma ? [p.plataforma] : [])).join(' / ');
  return [
    ['LID MKT'].concat(posts.map(() => '')),
    fila('Red social', redes),
    fila('Fecha', (p) => p.fecha || ''),
    fila('Hora', (p) => hora12(p.hora)),
    fila('Status', (p) => p.status || 'Pendiente'),
    fila('Enfoque de la publicación (Inbound Marketing)', (p) => p.enfoquePublicacion || ''),
    fila('Etapa del funnel', (p) => p.etapaFunnel || ''),
    fila('INSIGHT', (p) => p.insight || ''),
    fila('Idea principal', (p) => p.ideaPrincipal || ''),
    fila('Copy in', (p) => p.copyIn || ''),
    fila('Copy out', (p) => p.copyOut || ''),
    fila('Arte', (p) => p.explicacionArte || ''),
    [],
    ['EXTRAS GRIDIA'],
    fila('Día', (p) => p.diaSemana || ''),
    fila('Audiencia / decisor', (p) => p.audiencia || ''),
    fila('Pilar de contenido', (p) => p.pilar || ''),
    fila('Propiedad editorial', (p) => p.propiedad || ''),
    fila('Tema/Campaña', (p) => p.temaCampana || ''),
    fila('Ficha de canal', (p) => p.fichaCanal || ''),
    fila('Repurposing', (p) => p.repurposing || ''),
    fila('Hashtags', (p) => (p.hashtags || []).join(' ')),
    fila('Tipo de post', (p) => p.tipoPost || ''),
    fila('Formato del arte a desarrollar', (p) => p.formatoArte || ''),
    fila('Master Prompt (Midjourney, EN)', (p) => p.masterPromptMidjourney || ''),
    fila('Video · AI Tool', (p) => vd(p, (v) => v.videoAITool || '')),
    fila('Video · Escenas', (p) => vd(p, (v) => v.numEscenas || '')),
    fila('Video · Prompts imagen (EN)', (p) => vd(p, (v) => (v.promptsEscenasMidjourney || []).join(' ; '))),
    fila('Video · Prompts video (EN)', (p) => vd(p, (v) => (v.promptsVideoAI || []).join(' ; '))),
    fila('Paso a paso', (p) => p.pasoAPaso || ''),
  ];
}
const LID_CSV_HEADERS = ['Red social', 'Fecha', 'Hora', 'Status', 'Enfoque de la publicación (Inbound Marketing)', 'Etapa del funnel', 'INSIGHT', 'Idea principal', 'Copy in', 'Copy out', 'Arte', 'Día', 'Audiencia / decisor', 'Pilar de contenido', 'Propiedad editorial', 'Tema/Campaña', 'Ficha de canal', 'Repurposing', 'Hashtags', 'Tipo de post', 'Formato del arte a desarrollar', 'Master Prompt (Midjourney)', 'Video - Escenas', 'Video - AI Tool', 'Video - Prompts Imagen', 'Video - Prompts Video', 'Paso a paso'];
function lidPostToRow(p) {
  const vd = p.videoDetails;
  const redes = (Array.isArray(p.redesSociales) && p.redesSociales.length ? p.redesSociales : (p.plataforma ? [p.plataforma] : [])).join(' / ');
  return [redes, p.fecha || '', hora12(p.hora), p.status || 'Pendiente', p.enfoquePublicacion || '', p.etapaFunnel || '', p.insight || '', p.ideaPrincipal || '', p.copyIn || '', p.copyOut || '', p.explicacionArte || '', p.diaSemana || '', p.audiencia || '', p.pilar || '', p.propiedad || '', p.temaCampana || '', p.fichaCanal || '', p.repurposing || '', (p.hashtags || []).join(' '), p.tipoPost || '', p.formatoArte || '', p.masterPromptMidjourney || '', vd ? vd.numEscenas : '', vd ? vd.videoAITool : '', vd ? (vd.promptsEscenasMidjourney || []).join(' ; ') : '', vd ? (vd.promptsVideoAI || []).join(' ; ') : '', p.pasoAPaso || ''];
}

function downloadXLSX(filename, posts, conZona, modo) {
  const ordenados = [...posts].sort((a, b) => (a.dia - b.dia) || String(a._zona || '').localeCompare(String(b._zona || '')));
  const ws = XLSX.utils.aoa_to_sheet(modo === 'lid' ? lidPostsToAOA(ordenados) : postsToAOA(ordenados, conZona));
  ws['!cols'] = [{ wch: 40 }].concat(ordenados.map(() => ({ wch: 46 })));
  const wb = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(wb, ws, 'Parrilla');
  XLSX.writeFile(wb, filename);
}

function downloadCSV(filename, rows, headers) {
  const body = [(headers || CSV_HEADERS).join(',')].concat(rows.map((r) => r.map((f) => '"' + String(f).replace(/"/g, '""') + '"').join(','))).join('\n');
  const uri = 'data:text/csv;charset=utf-8,' + encodeURIComponent('\uFEFF' + body);
  const a = document.createElement('a');
  a.href = uri; a.download = filename;
  document.body.appendChild(a); a.click(); document.body.removeChild(a);
}

/* ------------------------- Celda de la tabla ------------------------- */
function renderCell(label, p) {
  switch (label) {
    case 'Fecha': return <b style={{ color: '#fff' }}>{p.fecha || ('Día ' + p.dia)}</b>;
    case 'Hora': return <span style={{ color: 'var(--amber-hi)', fontFamily: 'var(--mono)', fontSize: 12 }}>{hora12(p.hora)}</span>;
    case 'Día': return <span style={{ fontFamily: 'var(--mono)', fontSize: 12 }}>{p.diaSemana || '—'}</span>;
    case 'Plataforma': return <span className="ztag">{p.plataforma || '—'}</span>;
    case 'Red social': {
      const redes = Array.isArray(p.redesSociales) && p.redesSociales.length ? p.redesSociales : (p.plataforma ? [p.plataforma] : []);
      return redes.length
        ? <span style={{ display: 'flex', flexWrap: 'wrap', gap: 5 }}>{redes.map((r, i) => <span key={i} className="ztag">{r}</span>)}</span>
        : <span style={{ color: 'var(--muted)' }}>—</span>;
    }
    case 'Hashtags': return (p.hashtags && p.hashtags.length)
      ? <span style={{ fontFamily: 'var(--mono)', fontSize: 11.5, color: 'var(--amber-hi)', lineHeight: 1.7 }}>{p.hashtags.join(' ')}</span>
      : <span style={{ color: 'var(--muted)' }}>—</span>;
    case 'INSIGHT': return p.insight ? <i style={{ color: 'var(--text)' }}>{p.insight}</i> : <span style={{ color: 'var(--muted)' }}>—</span>;
    case 'Tipo de post': return <span className="tag i">{p.tipoPost || '—'}</span>;
    case 'Tema/Campaña': return <b style={{ color: 'var(--violet-hi)' }}>{p.temaCampana || '—'}</b>;
    case 'Audiencia': return p.audiencia ? <span className="tag i">{p.audiencia}</span> : <span style={{ color: 'var(--muted)' }}>—</span>;
    case 'Pilar': return p.pilar ? <span style={{ color: 'var(--violet-hi)', fontWeight: 600 }}>{p.pilar}</span> : <span style={{ color: 'var(--muted)' }}>—</span>;
    case 'Propiedad editorial': return p.propiedad ? <span className="ztag">{p.propiedad}</span> : <span style={{ color: 'var(--muted)' }}>—</span>;
    case 'Ficha de canal': return p.fichaCanal ? <span style={{ fontSize: 12 }}>{p.fichaCanal}</span> : <span style={{ color: 'var(--muted)' }}>—</span>;
    case 'Repurposing': return p.repurposing ? <i style={{ color: 'var(--text-2)' }}>{p.repurposing}</i> : <span style={{ color: 'var(--muted)' }}>—</span>;
    case 'Enfoque (Inbound)': return p.enfoquePublicacion || '—';
    case 'Etapa del funnel': return <span className="tag i">{p.etapaFunnel || '—'}</span>;
    case 'Idea principal': return p.ideaPrincipal || '—';
    case 'Estado foco': return <b style={{ color: 'var(--violet-hi)' }}>{p.estadoFoco || '—'}</b>;
    case 'Copy in': return <b style={{ color: '#fff', fontSize: 14 }}>{p.copyIn}</b>;
    case 'Copy out': return p.copyOut;
    case 'Modismos usados':
      return (p.tecnicismosRegionales && p.tecnicismosRegionales.length)
        ? <ul className="terms">{p.tecnicismosRegionales.map((x, i) => <li key={i}><b>{x.termino}</b>: {x.significado}</li>)}</ul>
        : <span style={{ color: '#666' }}>—</span>;
    case 'Arte': return p.explicacionArte;
    case 'Formato del arte': return <span className={'tag ' + (p.formatoArte === 'Video' ? 'v' : 'i')}>{p.formatoArte}</span>;
    case 'Master Prompt': return <code>{p.masterPromptMidjourney}</code>;
    case 'Video':
      if (!p.videoDetails) return <span style={{ color: '#666' }}>—</span>;
      const vd = p.videoDetails;
      return (
        <div className="vd">
          <p><b>AI Tool:</b> {vd.videoAITool}</p>
          <p><b>Escenas:</b> {vd.numEscenas}</p>
          <div><b>Prompts imagen:</b>
            <ul>{(vd.promptsEscenasMidjourney || []).map((x, i) => <li key={i}><code>{x}</code></li>)}</ul>
          </div>
          <div><b>Prompts video:</b>
            <ul>{(vd.promptsVideoAI || []).map((x, i) => <li key={i}><code>{x}</code></li>)}</ul>
          </div>
        </div>
      );
    case 'Paso a paso': return p.pasoAPaso;
    default: return null;
  }
}

/* Criterios del template XLSX (mismo orden) + extras GridIA */
const TPL_PARAMS = ['Fecha', 'Hora', 'Status', 'Enfoque (Inbound)', 'Etapa del funnel', 'Idea principal', 'Copy in', 'Copy out', 'Formato del arte', 'Arte'];
const EXTRA_PARAMS = ['Estado foco', 'Modismos usados', 'Master Prompt', 'Video', 'Paso a paso'];
/* Criterios de la parrilla LID Marketing + extras de producción */
const LID_PARAMS = ['Red social', 'Fecha', 'Hora', 'Status', 'Enfoque (Inbound)', 'Etapa del funnel', 'INSIGHT', 'Idea principal', 'Copy in', 'Copy out', 'Arte'];
const LID_EXTRAS = ['Día', 'Audiencia', 'Pilar', 'Propiedad editorial', 'Tema/Campaña', 'Ficha de canal', 'Repurposing', 'Hashtags', 'Tipo de post', 'Formato del arte', 'Master Prompt', 'Video', 'Paso a paso'];

function GridTable({ result, conZona, onStatus, base, extras }) {
  const posts = [...(result.posts || [])].sort((a, b) => (a.dia - b.dia) || String(a._zona || '').localeCompare(String(b._zona || '')));
  const filas = base || TPL_PARAMS;
  const filasExtra = extras || EXTRA_PARAMS;
  const params = conZona ? ['Zona', ...filas] : filas;
  const celda = (label, p) => {
    if (label === 'Zona') return <span className="ztag">{p._zona || '—'}</span>;
    if (label === 'Status') {
      return onStatus
        ? <select className="statussel" value={p.status || 'Pendiente'} onChange={(e) => onStatus(p, e.target.value)}>{STATUS_OPTIONS.map((o) => <option key={o}>{o}</option>)}</select>
        : <span className="tag i">{p.status || 'Pendiente'}</span>;
    }
    return renderCell(label, p);
  };
  const fila = (label) => (
    <tr key={label}>
      <td className="stickyc">{label}</td>
      {posts.map((p, i) => <td key={i} className="cell">{celda(label, p)}</td>)}
    </tr>
  );
  return (
    <div className="tablewrap">
      <table>
        <thead>
          <tr>
            <th className="stickyc">Parámetro</th>
            {posts.map((p, i) => (
              <th key={i}>
                <span className="dnum">D{String(p.dia).padStart(2, '0')}</span>
                <span className="ddate">{(p.fecha || '') + (conZona && p._zona ? ' · ' + p._zona : '')}</span>
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {params.map(fila)}
          <tr><td className="sep" colSpan={posts.length + 1}>Extras GridIA · producción</td></tr>
          {filasExtra.map(fila)}
        </tbody>
      </table>
    </div>
  );
}

/* ------------------------------ App ------------------------------ */
export default function App() {
  const [country, setCountry] = useState('México');
  const [selectedStates, setSelectedStates] = useState(() => allStatesOf('México'));
  const [view, setView] = useState('zonas');
  const [openZone, setOpenZone] = useState(null);
  const [workspace, setWorkspace] = useState('cliente');
  const [theme, setTheme] = useState('dark');
  const [lidForm, setLidForm] = useState({
    client: 'LID Marketing',
    month: MONTHS[(new Date().getMonth() + 1) % 12],
    postCount: 8,
    formats: 'Ambas',
    focus: [],
    plataformas: ['Facebook', 'Instagram', 'LinkedIn'],
    temas: [],
    hashtags: [],
    base: null,
    baseNombre: '',
    seoEndpoint: '',
    demanda: [],
    demandaSel: [],
    offer: '',
    comments: '',
    brandContext: '',
    brandFiles: [],
  });
  const [temaInput, setTemaInput] = useState('');
  const addTema = (t) => {
    const v = String(t || '').trim();
    if (!v) return;
    setLidForm((f) => (f.temas.some((x) => x.toLowerCase() === v.toLowerCase()) ? f : { ...f, temas: [...f.temas, v] }));
    setTemaInput('');
  };
  const removeTema = (t) => setLidForm((f) => ({ ...f, temas: f.temas.filter((x) => x !== t) }));

  const [baseErr, setBaseErr] = useState(null);
  const [baseCargando, setBaseCargando] = useState(false);
  const cargarBase = async (e) => {
    const file = (e.target.files || [])[0];
    e.target.value = '';
    if (!file) return;
    setBaseCargando(true); setBaseErr(null);
    try {
      const filas = await parseBaseFile(file);
      setLid({ base: filas, baseNombre: file.name });
    } catch (err) {
      setBaseErr((err && err.message) || 'No se pudo leer el archivo.');
    } finally {
      setBaseCargando(false);
    }
  };
  const quitarBase = () => { setLid({ base: null, baseNombre: '' }); setBaseErr(null); };

  const [dem, setDem] = useState({ loading: false, error: null, at: null });
  const consultarDemanda = async () => {
    setDem({ loading: true, error: null, at: null });
    try {
      const t = await fetchDemandaSEO(lidForm.seoEndpoint, 'MX', '30d');
      setLid({ demanda: t, demandaSel: t });
      setDem({ loading: false, error: null, at: new Date() });
    } catch (err) {
      setLid({ demanda: [], demandaSel: [] });
      setDem({ loading: false, error: (err && err.message) || 'No se pudo consultar el servicio.', at: null });
    }
  };
  const toggleDemanda = (t) => setLidForm((f) => ({
    ...f,
    demandaSel: f.demandaSel.some((x) => x.termino === t.termino)
      ? f.demandaSel.filter((x) => x.termino !== t.termino)
      : [...f.demandaSel, t],
  }));

  const [hashInput, setHashInput] = useState('');
  const [trend, setTrend] = useState({ loading: false, error: null, items: [], at: null });
  const addHashtag = (t, tema) => {
    const v = '#' + String(t || '').trim().replace(/^#*/, '').replace(/\s+/g, '');
    if (v.length < 2) return;
    setLidForm((f) => (f.hashtags.some((x) => x.tag.toLowerCase() === v.toLowerCase()) ? f : { ...f, hashtags: [...f.hashtags, { tag: v, tema: tema || '' }] }));
    setHashInput('');
  };
  const removeHashtag = (t) => setLidForm((f) => ({ ...f, hashtags: f.hashtags.filter((x) => x.tag !== t) }));
  const buscarTendencias = async () => {
    setTrend({ loading: true, error: null, items: [], at: null });
    try {
      const items = await fetchTrending({ pais: 'México', mes: lidForm.month, temas: lidForm.temas, redes: lidForm.plataformas });
      setTrend({ loading: false, error: items.length ? null : 'La búsqueda no devolvió hashtags. Inténtalo de nuevo.', items, at: new Date() });
    } catch (err) {
      setTrend({ loading: false, error: (err && err.message) || 'No se pudo completar la búsqueda.', items: [], at: null });
    }
  };
  const setLid = (patch) => setLidForm((f) => ({ ...f, ...patch }));
  const toggleLidFocus = (opt) => setLidForm((f) => {
    const has = f.focus.includes(opt);
    const next = has ? f.focus.filter((x) => x !== opt) : [...f.focus, opt];
    return next.length <= 3 ? { ...f, focus: next } : f;
  });
  const toggleLidPlataforma = (pl) => setLidForm((f) => ({
    ...f,
    plataformas: f.plataformas.includes(pl) ? f.plataformas.filter((x) => x !== pl) : [...f.plataformas, pl],
  }));


  const [form, setForm] = useState({
    client: 'Bait',
    offer: '9GB por $100 con RRSS ilimitadas (FB / IG / X / Snapchat / Telegram / Messenger / WA)',
    month: MONTHS[(new Date().getMonth() + 1) % 12],
    postCount: 8,
    focus: ['Reconocimiento de Marca', 'Branding', 'Ventas'],
    formats: 'Ambas',
    comments: '',
    plataformas: ['LinkedIn', 'Instagram', 'X', 'TikTok'],
    brandContext: '',
    brandFiles: [],
  });

  const [results, setResults] = useState({ norte: null, centro: null, sur: null, general: null, lid: null });
  const [loading, setLoading] = useState({ norte: false, centro: false, sur: false, general: false, lid: false });
  const [errors, setErrors] = useState({ norte: null, centro: null, sur: null, general: null, lid: null });
  const [batch, setBatch] = useState(null);
  const [progress, setProgress] = useState({ norte: null, centro: null, sur: null, general: null, lid: null });

  const set = (patch) => setForm((f) => ({ ...f, ...patch }));

  const changeCountry = (c) => {
    setCountry(c);
    setSelectedStates(allStatesOf(c));
    setResults((r) => ({ norte: null, centro: null, sur: null, general: null, lid: r.lid }));
    setErrors({ norte: null, centro: null, sur: null, general: null, lid: null });
    setView('zonas');
  };

  const toggleFocus = (opt) => {
    const has = form.focus.includes(opt);
    const next = has ? form.focus.filter((x) => x !== opt) : [...form.focus, opt];
    if (next.length <= 3) set({ focus: next });
  };

  const togglePlataforma = (pl) => setForm((f) => ({
    ...f,
    plataformas: f.plataformas.includes(pl) ? f.plataformas.filter((x) => x !== pl) : [...f.plataformas, pl],
  }));

  const toggleState = (rk, estado) => {
    setSelectedStates((prev) => {
      const arr = prev[rk];
      const has = arr.includes(estado);
      return { ...prev, [rk]: has ? arr.filter((s) => s !== estado) : [...arr, estado] };
    });
  };
  const setAll = (rk, all) => setSelectedStates((prev) => ({ ...prev, [rk]: all ? [...COUNTRIES[country].regions[rk].estados] : [] }));

  const handleFiles = (e) => {
    const files = Array.from(e.target.files || []);
    e.target.value = '';
    const ok = files.filter((f) => f.type === 'application/pdf' || f.type.startsWith('image/'));
    if (!ok.length) return;
    Promise.all(ok.map((f) => new Promise((resolve) => {
      const r = new FileReader();
      r.onload = (ev) => resolve({ name: f.name, mime: f.type, data: String(ev.target.result).split(',')[1] });
      r.onerror = () => resolve(null);
      r.readAsDataURL(f);
    }))).then((list) => set({ brandFiles: [...form.brandFiles, ...list.filter(Boolean)].slice(0, 5) }));
  };
  const removeFile = (i) => set({ brandFiles: form.brandFiles.filter((_, idx) => idx !== i) });


  const generate = useCallback(async (rk) => {
    if (!form.client.trim()) { setErrors((e) => ({ ...e, [rk]: 'Escribe el nombre del cliente en el Paso 1 antes de generar.' })); return; }
    const esGeneral = rk === 'general';
    const esLid = rk === 'lid';
    const cfg = esLid ? { ...lidForm, client: 'LID Marketing' } : form;
    const sinEstados = esGeneral || esLid;
    const region = sinEstados ? null : COUNTRIES[country].regions[rk];
    const estados = sinEstados ? [] : selectedStates[rk];
    if (!sinEstados && !estados.length) { setErrors((e) => ({ ...e, [rk]: 'Selecciona al menos un estado de esta zona para generar su parrilla.' })); return; }
    if (esLid && !cfg.plataformas.length) { setErrors((e) => ({ ...e, [rk]: 'Selecciona al menos una red social para generar la parrilla.' })); return; }
    limiteAlcanzado.current = false;
    setLoading((l) => ({ ...l, [rk]: true }));
    setErrors((e) => ({ ...e, [rk]: null }));
    setProgress((p) => ({ ...p, [rk]: { done: 0, total: cfg.postCount, msg: null } }));

    const days = planDays(cfg.postCount);
    const chunk = esLid ? 5 : 8;
    const bloques = [];
    for (let i = 0; i < days.length; i += chunk) bloques.push(days.slice(i, i + chunk));

    const acc = [];
    let aviso = null;
    const setMsg = (m) => setProgress((p) => ({ ...p, [rk]: { done: Math.min(acc.length, cfg.postCount), total: cfg.postCount, msg: m } }));
    /* Integra posts nuevos: dedupe por día y normaliza días fuera del plan. */
    const absorber = (data) => {
      (data.posts || []).forEach((p) => {
        if (!p || !p.copyIn) return;
        const ocupados = new Set(acc.map((x) => x.dia));
        if (!days.includes(p.dia) || ocupados.has(p.dia)) {
          const libre = days.find((d) => !ocupados.has(d));
          if (libre === undefined) return;
          p.dia = libre;
        }
        if (!p.status) p.status = 'Pendiente';
        if (!p.hora) p.hora = '12:00';
        acc.push(p);
      });
      setMsg(null);
    };

    try {
      for (let b = 0; b < bloques.length; b++) {
        const prompt = buildPrompt({ country, regionLabel: REGION_LABEL[rk], zonaNota: region ? region.nota : '', estados, form: cfg, days: bloques[b], prevPosts: acc, totalPosts: cfg.postCount, esGeneral, esLid, plataformas: cfg.plataformas, temas: cfg.temas, hashtags: cfg.hashtags, base: cfg.base, demanda: cfg.demandaSel });
        let data;
        try {
          data = await callWithRetry(prompt, cfg.brandFiles, setMsg);
        } catch (ex) {
          if (acc.length) { aviso = 'La IA completó ' + acc.length + ' de ' + cfg.postCount + ' publicaciones y no pudo continuar. ' + traducirError(ex); break; }
          throw ex;
        }
        absorber(data);
      }

      /* Pase de completado (auto-sanado): si un bloque llegó recortado y reparado,
         pide SOLO los días faltantes en una llamada pequeña. */
      let topups = 0;
      while (acc.length < cfg.postCount && topups < 2 && !aviso) {
        const hechos = new Set(acc.map((p) => p.dia));
        const faltantes = days.filter((d) => !hechos.has(d));
        if (!faltantes.length) break;
        setMsg('Completando ' + faltantes.length + ' publicación(es) faltante(s)…');
        try {
          const data = await callWithRetry(
            buildPrompt({ country, regionLabel: REGION_LABEL[rk], zonaNota: region ? region.nota : '', estados, form: cfg, days: faltantes, prevPosts: acc, totalPosts: cfg.postCount, esGeneral, esLid, plataformas: cfg.plataformas, temas: cfg.temas, hashtags: cfg.hashtags, base: cfg.base, demanda: cfg.demandaSel }),
            cfg.brandFiles, setMsg
          );
          absorber(data);
        } catch (ex) {
          aviso = 'Se completaron ' + acc.length + ' de ' + cfg.postCount + ' publicaciones. ' + traducirError(ex);
        }
        topups++;
      }

      if (!acc.length) throw new Error('La IA no devolvió publicaciones. Inténtalo de nuevo.');
      if (!aviso && acc.length < cfg.postCount) aviso = 'Se generaron ' + acc.length + ' de ' + cfg.postCount + ' publicaciones; pulsa Generar de nuevo si quieres la parrilla completa.';
      acc.sort((a, b) => a.dia - b.dia);
      acc.forEach((p) => { p.fecha = fechaDe(p.dia, cfg.month); p.diaSemana = diaSemanaDe(p.dia, cfg.month); });

      const seen = new Set();
      const glosario = [];
      acc.forEach((p) => (p.tecnicismosRegionales || []).forEach((t) => {
        const k = String(t.termino || '').toLowerCase().trim();
        if (k && !seen.has(k)) { seen.add(k); glosario.push({ termino: t.termino, significado: t.significado }); }
      }));

      setResults((r) => ({ ...r, [rk]: { region: REGION_LABEL[rk], posts: acc, glosarioRegional: glosario, creditos: computeCredits(acc), aviso } }));
    } catch (err) {
      if (err && String(err.message || '').startsWith('LIMIT|')) limiteAlcanzado.current = true;
      setErrors((e) => ({ ...e, [rk]: traducirError(err) }));
    } finally {
      setLoading((l) => ({ ...l, [rk]: false }));
      setProgress((p) => ({ ...p, [rk]: null }));
    }
  }, [country, selectedStates, form, lidForm]);

  const generateAll = async () => {
    const zonas = REGION_KEYS.filter((k) => selectedStates[k].length);
    setView('zonas');
    for (let i = 0; i < zonas.length; i++) {
      const z = zonas[i];
      setBatch({ i: i + 1, total: zonas.length, zona: REGION_LABEL[z] });
      await generate(z);
      if (limiteAlcanzado.current) break;
      if (i < zonas.length - 1) await wait(2500);
    }
    setBatch(null);
  };

  const anyGenerated = REGION_KEYS.some((k) => results[k]);
  const anyLoading = REGION_KEYS.some((k) => loading[k]);

  const exportRegion = (rk) => {
    const res = results[rk]; if (!res) return;
    const rows = [...(res.posts || [])].sort((a, b) => a.dia - b.dia).map((p) => postToRow(REGION_LABEL[rk], p));
    downloadCSV('parrilla_' + slug(country) + '_' + rk + '.csv', rows);
  };
  const exportAll = () => {
    const rows = [];
    REGION_KEYS.forEach((rk) => {
      const res = results[rk];
      if (res) [...(res.posts || [])].sort((a, b) => a.dia - b.dia).forEach((p) => rows.push(postToRow(REGION_LABEL[rk], p)));
    });
    if (rows.length) downloadCSV('parrilla_' + slug(country) + '_todas_las_zonas.csv', rows);
  };

  const updateStatus = (key, dia, status) => setResults((r) => {
    const res = r[key];
    if (!res) return r;
    return { ...r, [key]: { ...res, posts: res.posts.map((p) => (p.dia === dia ? { ...p, status } : p)) } };
  });

  const exportLidXLSX = () => {
    if (results.lid) downloadXLSX('parrilla_lid_marketing_' + slug(lidForm.month) + '.xlsx', results.lid.posts, false, 'lid');
  };
  const exportLidCSV = () => {
    if (results.lid) downloadCSV('parrilla_lid_marketing_' + slug(lidForm.month) + '.csv', [...results.lid.posts].sort((a, b) => a.dia - b.dia).map(lidPostToRow), LID_CSV_HEADERS);
  };

  const exportRegionXLSX = (rk) => {
    const res = results[rk];
    if (res) downloadXLSX('parrilla_' + slug(country) + '_' + rk + '.xlsx', res.posts, false);
  };

  const zonasListas = REGION_KEYS.filter((k) => results[k]);
  const combinado = (() => {
    if (!zonasListas.length) return null;
    const posts = zonasListas.flatMap((k) => (results[k].posts || []).map((p) => ({ ...p, _zona: REGION_LABEL[k] })));
    const mapa = {};
    zonasListas.forEach((k) => (results[k].glosarioRegional || []).forEach((g) => {
      const key = String(g.termino || '').toLowerCase().trim();
      if (!key) return;
      if (!mapa[key]) mapa[key] = { termino: g.termino, significado: g.significado, zonas: [] };
      if (!mapa[key].zonas.includes(REGION_LABEL[k])) mapa[key].zonas.push(REGION_LABEL[k]);
    }));
    return { posts, glosario: Object.values(mapa), creditos: computeCredits(posts) };
  })();

  return (
    <div className={'gridia ' + theme + (workspace === 'lid' ? ' ws-lid' : '')} style={PALETTES[workspace === 'lid' ? 'lid' : 'base'][theme]}>
      <style>{STYLES}</style>
      <div className="wrap">
        <header className="header">
          <div className="brand">
            <Logo />
            <h1>Grid<span className="ia">IA</span></h1>
            <span className="sub">LID Marketing · Parrillas de contenido</span>
          </div>
          <div className="hactions">
            <div className="badge">IA integrada de Claude</div>
            <button className="tbtn" onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')}
              title={theme === 'dark' ? 'Cambiar a tema claro' : 'Cambiar a tema oscuro'}
              aria-label={theme === 'dark' ? 'Cambiar a tema claro' : 'Cambiar a tema oscuro'}>
              {theme === 'dark' ? <Sun /> : <Moon />}
            </button>
          </div>
        </header>

        <nav className="wsbar">
          <button className={'wsbtn' + (workspace === 'cliente' ? ' active' : '')} onClick={() => setWorkspace('cliente')}>
            Parrillas de cliente <span className="wsk">Por país y zona</span>
          </button>
          <button className={'wsbtn' + (workspace === 'lid' ? ' active' : '')} onClick={() => setWorkspace('lid')}>
            LID Marketing <span className="wsk">Redes propias{results.lid ? ' · lista' : ''}</span>
          </button>
        </nav>

        {workspace === 'cliente' && (<>
        {/* -------- Configuración -------- */}
        <div className="card">
          <h2 className="sectitle"><span className="step">01</span>Configuración del proyecto</h2>
          <div className="grid cols-4">
            <div className="span2">
              <label className="fl">País</label>
              <select className="country" value={country} onChange={(e) => changeCountry(e.target.value)}>
                {Object.keys(COUNTRIES).map((c) => <option key={c} value={c}>{COUNTRIES[c].emoji + '  ' + c}</option>)}
              </select>
              <div className="hint">Define el país. Cada zona (Norte / Centro / Sur) usará sus estados y sus modismos regionales al generar.</div>
            </div>
            <div>
              <label className="fl">Cliente</label>
              <input type="text" value={form.client} onChange={(e) => set({ client: e.target.value })} placeholder="Ej. Bait" />
            </div>
            <div>
              <label className="fl">Mes</label>
              <select value={form.month} onChange={(e) => set({ month: e.target.value })}>
                {MONTHS.map((m) => <option key={m}>{m}</option>)}
              </select>
            </div>
          </div>

          <div className="grid cols-4" style={{ marginTop: 16 }}>
            <div>
              <label className="fl">No. de publicaciones</label>
              <select value={form.postCount} onChange={(e) => set({ postCount: parseInt(e.target.value) })}>
                {POST_COUNTS.map((n) => <option key={n} value={n}>{n}</option>)}
              </select>
            </div>
            <div>
              <label className="fl">Formatos</label>
              <select value={form.formats} onChange={(e) => set({ formats: e.target.value })}>
                {FORMAT_OPTIONS.map((f) => <option key={f}>{f}</option>)}
              </select>
            </div>
            <div className="span2">
              <label className="fl">Enfoque de la parrilla <span className="cnt">{form.focus.length}/3</span></label>
              <div className="chips" style={{ paddingTop: 4 }}>
                {FOCUS_OPTIONS.map((o) => {
                  const on = form.focus.includes(o);
                  const off = !on && form.focus.length >= 3;
                  return <span key={o} className={'chip' + (on ? ' on' : '') + (off ? ' off' : '')} onClick={() => toggleFocus(o)}>{o}</span>;
                })}
              </div>
            </div>
          </div>

          <h2 className="sectitle mt"><span className="step">02</span>Marca y estrategia</h2>
          <div className="grid cols-2">
            <div className="span2">
              <label className="fl">Oferta comercial</label>
              <textarea value={form.offer} onChange={(e) => set({ offer: e.target.value })} rows={2} />
            </div>
            <div className="span2">
              <label className="fl">Comentarios generales</label>
              <textarea value={form.comments} onChange={(e) => set({ comments: e.target.value })} rows={2} placeholder="Instrucciones adicionales, tono específico o exclusiones…" />
            </div>
            <div className="span2">
              <label className="fl">Contexto de marca (voz y tono, brandbook resumido)</label>
              <textarea value={form.brandContext} onChange={(e) => set({ brandContext: e.target.value })} rows={2} placeholder="Pega aquí un resumen de la voz de marca, valores o mensajes clave…" />
              <label className="uploader" htmlFor="bf" style={{ marginTop: 10 }}>
                <span>+ Adjuntar documentos de marca (PDF o imágenes, máx. 5)</span>
              </label>
              <input id="bf" type="file" multiple accept="image/*,.pdf" style={{ display: 'none' }} onChange={handleFiles} />
              {form.brandFiles.length > 0 && (
                <div className="files">
                  {form.brandFiles.map((f, i) => (
                    <div key={i} className="file"><span>{f.name}</span><button onClick={() => removeFile(i)}>×</button></div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>

        {/* -------- Barra de acciones -------- */}
        <div className="toolbar">
          <div className="t-title"><span className="step">03</span>Genera la parrilla general del país, cada zona (o las tres seguidas) y únelas en la vista combinada.</div>
          <div className="row-actions">
            <button className="btn btn-ghost" onClick={generateAll} disabled={anyLoading} title="Genera Norte, Centro y Sur en secuencia con la configuración actual">
              {anyLoading ? <><Spin color="var(--violet)" /> {batch ? 'Generando ' + batch.zona + ' (' + batch.i + '/' + batch.total + ')…' : 'Generando…'}</> : 'Generar las 3 zonas'}
            </button>
            <button className="btn btn-ghost" onClick={exportAll} disabled={!anyGenerated} title={anyGenerated ? 'Descarga un CSV combinado con columna Zona' : 'Genera al menos una zona para poder exportar'}><DL /> Exportar todo (CSV)</button>
          </div>
        </div>

        {/* -------- Selector de vista -------- */}
        <div className="viewswitch">
          <button className={'vbtn' + (view === 'zonas' ? ' active' : '')} onClick={() => setView('zonas')}>
            Por zonas <span className="mini">Norte · Centro · Sur</span>
          </button>
          <button className={'vbtn' + (view === 'general' ? ' active' : '')} onClick={() => setView('general')} title="Parrilla nacional en español neutro, regida por el manual de voz y tono">
            General (país) {results.general && <span className="check">✓</span>}
          </button>
          <button className={'vbtn' + (view === 'combinada' ? ' active' : '')} onClick={() => setView('combinada')} title={zonasListas.length ? 'Ver todas las zonas unidas en una sola parrilla' : 'Genera al menos una zona para combinar'}>
            Parrilla combinada {zonasListas.length > 0 && <span className="check">✓ {zonasListas.length}</span>}
          </button>
        </div>

        {/* -------- Vista: las 3 zonas en una sola página -------- */}
        {view === 'zonas' && REGION_KEYS.map((rk) => {
          const region = COUNTRIES[country].regions[rk];
          const result = results[rk];
          const abierto = openZone === rk;
          const nEst = selectedStates[rk].length;
          const exceso = nEst > form.postCount;
          return (
            <div className="card zonecard" key={rk}>
              <div className="zhead">
                <div className="zid">
                  <span className="zname">{REGION_LABEL[rk]}</span>
                  <span className="zmeta">{nEst} de {region.estados.length} estados · {form.postCount} posts · {form.month}</span>
                  {result && <span className="zdone">{result.posts.length} publicaciones</span>}
                </div>
                <div className="row-actions">
                  <button className="link" onClick={() => setOpenZone(abierto ? null : rk)}>
                    {abierto ? 'Ocultar ajustes' : 'Ajustes de zona'}
                  </button>
                  <button className="btn btn-primary" onClick={() => generate(rk)} disabled={loading[rk] || nEst === 0} title={nEst === 0 ? 'Selecciona al menos un estado en Ajustes de zona' : 'Genera la parrilla de esta zona'}>
                    {loading[rk] ? <><Spin color="var(--on-btn)" /> Generando…</> : (result ? 'Regenerar' : 'Generar')}
                  </button>
                </div>
              </div>

              {nEst === 0 && <div className="warnline">Sin estados seleccionados. Abre <b>Ajustes de zona</b> para elegir al menos uno.</div>}
              {exceso && <div className="warnline">{nEst} estados para {form.postCount} publicaciones: no todos tendrán post propio. Sube el número de publicaciones o deja los prioritarios.</div>}

              {abierto && (
                <div className="zsettings">
                  <div className="panel-note"><b>Estilo regional:</b> {region.nota}</div>
                  <div className="selcount">
                    Estados de la zona
                    <span>
                      <button className="link" onClick={() => setAll(rk, true)}>Todos</button>
                      <span style={{ color: 'var(--line)', margin: '0 7px', opacity: .6 }}>·</span>
                      <button className="link" onClick={() => setAll(rk, false)}>Ninguno</button>
                    </span>
                  </div>
                  <div className="chips">
                    {region.estados.map((x) => (
                      <span key={x} className={'chip' + (selectedStates[rk].includes(x) ? ' on' : '')} onClick={() => toggleState(rk, x)}>{x}</span>
                    ))}
                  </div>
                </div>
              )}

              {errors[rk] && (
                <div className="err">
                  <b>No se pudo generar.</b> {errors[rk]}{' '}
                  <button className="link" onClick={() => generate(rk)} style={{ marginLeft: 6 }}>Reintentar →</button>
                </div>
              )}

              {loading[rk] && <LoadingBlock zona={REGION_LABEL[rk]} prog={progress[rk]} />}

              {result && !loading[rk] && (
                <div style={{ marginTop: 22 }}>
                  <div className="result-head">
                    <div>
                      <h3>Zona {REGION_LABEL[rk]} · {country}</h3>
                      <p>{result.creditos ? result.creditos.summary : ''}</p>
                    </div>
                    <div className="row-actions">
                      <button className="btn btn-ghost" onClick={() => exportRegionXLSX(rk)} title="Descarga esta zona en Excel con la estructura del template"><DL /> XLSX</button>
                      <button className="btn btn-ghost" onClick={() => exportRegion(rk)} title="Descarga esta zona en CSV (UTF-8)"><DL /> CSV</button>
                    </div>
                  </div>

                  {result.aviso && <div className="warnline" style={{ marginBottom: 12 }}>{result.aviso}</div>}

                  {result.glosarioRegional && result.glosarioRegional.length > 0 && (
                    <div className="glossary">
                      <h4>Glosario regional · {REGION_LABEL[rk]}</h4>
                      {result.glosarioRegional.map((g, i) => (
                        <span key={i} className="gitem"><b>{g.termino}</b><span>{g.significado}</span></span>
                      ))}
                    </div>
                  )}

                  <GridTable result={result} onStatus={(x, v) => updateStatus(rk, x.dia, v)} />
                </div>
              )}
            </div>
          );
        })}

        {/* -------- Vista: parrilla general nacional (español neutro + manual de marca) -------- */}
        {view === 'general' && (
          <div className="card">
            <div className="panel-head">
              <div>
                <h3 className="panel-title">Parrilla General · {country} <span className="ztag" style={{ verticalAlign: 'middle', marginLeft: 6 }}>Todo el país</span></h3>
                <div className="panel-note"><b>Estilo:</b> español neutro de {country}, entendible en todo el territorio, sin regionalismos marcados ni referencias geográficas específicas. La voz manda: el copy se apega estrictamente al manual de voz y tono cargado en el <b>Paso 2</b> (texto y/o documentos).</div>
                <div className="summary">Se generarán <b>{form.postCount} publicaciones</b> ({form.formats.toLowerCase()}) de alcance <b>nacional</b> · Mes: <b>{form.month}</b> · Enfoque: <b>{form.focus.join(', ') || '—'}</b> · Cliente: <b>{form.client || '—'}</b></div>
                {!form.brandContext.trim() && form.brandFiles.length === 0 && (
                  <div className="warnline">Aún no cargaste el manual de voz y tono (Paso 2): se usará la voz por defecto o inferida de la marca. Para máxima fidelidad, pega el manual en "Contexto de marca" o adjúntalo en PDF.</div>
                )}
              </div>
              <button className="btn btn-primary" onClick={() => generate('general')} disabled={loading.general} title="Genera la parrilla nacional en español neutro">
                {loading.general ? <><Spin color="var(--on-btn)" /> Generando…</> : 'Generar Parrilla General'}
              </button>
            </div>

            {errors.general && (
              <div className="err">
                <b>No se pudo generar.</b> {errors.general}{' '}
                <button className="link" onClick={() => generate('general')} style={{ marginLeft: 6 }}>Reintentar →</button>
              </div>
            )}

            {loading.general && <LoadingBlock zona="General" prog={progress.general} />}

            {results.general && !loading.general && (
              <div style={{ marginTop: 22 }}>
                <div className="result-head">
                  <div>
                    <h3>Parrilla generada · General (nacional)</h3>
                    <p>{results.general.creditos ? results.general.creditos.summary : ''}</p>
                  </div>
                  <div className="row-actions">
                    <button className="btn btn-ghost" onClick={() => exportRegionXLSX('general')} title="Descarga la parrilla general en Excel con la estructura exacta del template"><DL /> XLSX (template)</button>
                    <button className="btn btn-ghost" onClick={() => exportRegion('general')} title="Descarga la parrilla general en CSV (UTF-8)"><DL /> CSV</button>
                  </div>
                </div>

                {results.general.aviso && <div className="warnline" style={{ marginBottom: 12 }}>{results.general.aviso}</div>}

                {results.general.glosarioRegional && results.general.glosarioRegional.length > 0 && (
                  <div className="glossary">
                    <h4>Expresiones y tono usados — General</h4>
                    {results.general.glosarioRegional.map((g, i) => (
                      <span key={i} className="gitem"><b>{g.termino}</b><span>{g.significado}</span></span>
                    ))}
                  </div>
                )}

                <GridTable result={results.general} onStatus={(p, v) => updateStatus('general', p.dia, v)} />
              </div>
            )}

            {!results.general && !loading.general && !errors.general && (
              <div className="empty" style={{ marginTop: 22 }}>
                Completa los pasos <b style={{ color: '#fff' }}>1</b> y <b style={{ color: '#fff' }}>2</b> (idealmente con el manual de voz y tono) y pulsa <b style={{ color: '#fff' }}>Generar Parrilla General</b> para crear la parrilla nacional en español neutro.
              </div>
            )}
          </div>
        )}

        {/* -------- Vista: parrilla combinada (las 3 zonas en una sola) -------- */}
        {view === 'combinada' && (
          <div className="card">
            {!combinado && (
              <div className="empty">
                Aún no hay zonas generadas. Vuelve a <b style={{ color: '#fff' }}>Por zonas</b>, genera al menos una (o pulsa <b style={{ color: '#fff' }}>Generar las 3 zonas</b>) y aquí se unirán automáticamente en una sola parrilla.
              </div>
            )}

            {combinado && (
              <div>
                <div className="result-head">
                  <div>
                    <h3 className="panel-title">Parrilla combinada · {country}</h3>
                    <p>{combinado.posts.length} publicaciones de {zonasListas.length} zona(s): {zonasListas.map((k) => REGION_LABEL[k]).join(' + ')} · {combinado.creditos.summary}</p>
                    {zonasListas.length < 3 && (
                      <div className="warnline" style={{ marginTop: 10 }}>Faltan zonas por generar ({REGION_KEYS.filter((k) => !results[k]).map((k) => REGION_LABEL[k]).join(', ')}); al generarlas se sumarán aquí automáticamente.</div>
                    )}
                  </div>
                  <div className="row-actions">
                    <button className="btn btn-ghost" onClick={() => downloadXLSX('parrilla_' + slug(country) + '_combinada.xlsx', combinado.posts, true)} title="Descarga la parrilla combinada en Excel con la estructura del template"><DL /> XLSX (template)</button>
                    <button className="btn btn-ghost" onClick={exportAll} title="Descarga la parrilla combinada en CSV con columna Zona"><DL /> CSV</button>
                  </div>
                </div>

                {combinado.glosario.length > 0 && (
                  <div className="glossary">
                    <h4>Glosario regional unificado</h4>
                    {combinado.glosario.map((g, i) => (
                      <span key={i} className="gitem"><b>{g.termino}</b><span>{g.significado}</span><span className="gz">{g.zonas.join(' · ')}</span></span>
                    ))}
                  </div>
                )}

                <GridTable result={{ posts: combinado.posts }} conZona onStatus={(p, v) => updateStatus(LABEL_TO_KEY[p._zona], p.dia, v)} />
              </div>
            )}
          </div>
        )}
        </>)}

        {/* ============ ESPACIO DE TRABAJO: LID MARKETING (redes propias) ============ */}
        {workspace === 'lid' && (<>
          <div className="card">
            <h2 className="sectitle"><span className="step">01</span>Configuración de la parrilla</h2>
            <div className="grid cols-4">
              <div>
                <label className="fl">Mes</label>
                <select value={lidForm.month} onChange={(e) => setLid({ month: e.target.value })}>
                  {MONTHS.map((m) => <option key={m}>{m}</option>)}
                </select>
              </div>
              <div>
                <label className="fl">No. de publicaciones</label>
                <select value={lidForm.postCount} onChange={(e) => setLid({ postCount: parseInt(e.target.value) })}>
                  {POST_COUNTS.map((n) => <option key={n} value={n}>{n}</option>)}
                </select>
              </div>
              <div className="span2">
                <label className="fl">Formatos</label>
                <select value={lidForm.formats} onChange={(e) => setLid({ formats: e.target.value })}>
                  {FORMAT_OPTIONS.map((f) => <option key={f}>{f}</option>)}
                </select>
              </div>
            </div>

            <div className="grid cols-2" style={{ marginTop: 18 }}>
              <div className="span2">
                <label className="fl">Redes sociales <span className="cnt">{lidForm.plataformas.length}/{PLATAFORMAS.length}</span></label>
                <div className="chips">
                  {PLATAFORMAS.map((pl) => (
                    <span key={pl} className={'chip' + (lidForm.plataformas.includes(pl) ? ' on' : '')} onClick={() => toggleLidPlataforma(pl)}>{pl}</span>
                  ))}
                </div>
                <div className="hint">Una misma publicación puede salir en varias redes; GridIA arma las combinaciones según el contenido.</div>
              </div>
              <div className="span2">
                <label className="fl">Enfoque de la parrilla <span className="cnt">{lidForm.focus.length}/3</span></label>
                <div className="chips">
                  {FOCUS_OPTIONS.map((o) => {
                    const on = lidForm.focus.includes(o);
                    const off = !on && lidForm.focus.length >= 3;
                    return <span key={o} className={'chip' + (on ? ' on' : '') + (off ? ' off' : '')} onClick={() => toggleLidFocus(o)}>{o}</span>;
                  })}
                </div>
              </div>
              <div className="span2">
                <label className="fl">Temas y campañas del mes <span className="cnt">{lidForm.temas.length}</span></label>
                <div className="tagbox">
                  {lidForm.temas.map((t) => (
                    <span key={t} className="tag-on">{t}<button onClick={() => removeTema(t)} title={'Quitar ' + t}>×</button></span>
                  ))}
                  <input
                    type="text"
                    value={temaInput}
                    onChange={(e) => setTemaInput(e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter' || e.key === ',') { e.preventDefault(); addTema(temaInput); }
                      else if (e.key === 'Backspace' && !temaInput && lidForm.temas.length) { removeTema(lidForm.temas[lidForm.temas.length - 1]); }
                    }}
                    onBlur={() => addTema(temaInput)}
                    placeholder={lidForm.temas.length ? 'Añadir tema…' : 'Escribe un tema y pulsa Enter'}
                  />
                </div>
                <div className="hint">Cada publicación se asigna a uno de estos temas, de modo que el mes se lea como campañas y no como posts sueltos. Escríbelos o tómalos de tu archivo base.</div>
              </div>
            </div>

            <h2 className="sectitle mt"><span className="step">02</span>Base, comentarios y señales externas</h2>
            <div className="grid cols-2">
              <div className="span2">
                <label className="fl">Base de publicaciones (XLSX o CSV)</label>
                <label className="uploader" htmlFor="basefile">
                  <span>{baseCargando ? 'Leyendo archivo…' : (lidForm.base ? '+ Reemplazar archivo base' : '+ Subir tabla de publicaciones (.xlsx, .xls o .csv)')}</span>
                </label>
                <input id="basefile" type="file" accept=".xlsx,.xls,.csv" style={{ display: 'none' }} onChange={cargarBase} />
                <div className="hint">Se usa como referencia del histórico: continúa tus campañas, respeta tu cadencia, imita tu voz y evita repetir lo ya publicado. No cambia la estructura de la parrilla.</div>

                {baseErr && <div className="warnline">{baseErr}</div>}

                {lidForm.base && (() => {
                  const r = baseResumen(lidForm.base);
                  return (
                    <div className="basebox">
                      <div className="basehead">
                        <span className="basename"><span className="check">✓</span>{lidForm.baseNombre}</span>
                        <button className="link" onClick={quitarBase}>Quitar base</button>
                      </div>
                      <div className="basestats">
                        <span className="bstat"><b>{r.total}</b><span>Publicaciones</span></span>
                        <span className="bstat"><b>{r.plataformas.length}</b><span>Plataformas</span></span>
                        <span className="bstat"><b>{r.tipos.length}</b><span>Tipos de post</span></span>
                        <span className="bstat"><b>{r.campanas.length}</b><span>Campañas</span></span>
                      </div>
                      <div className="basetax">
                        <b>Plataformas:</b> {r.plataformas.slice(0, 8).map((x) => x.v + ' (' + x.n + ')').join(' · ') || '—'}<br />
                        <b>Tipos de post:</b> {r.tipos.slice(0, 8).map((x) => x.v).join(' · ') || '—'}
                        {r.desde && <><br /><b>Periodo:</b> {r.desde} → {r.hasta}</>}
                      </div>
                      {r.campanas.length > 0 && (
                        <div className="sugg">
                          <span className="sl">Campañas detectadas</span>
                          {r.campanas.slice(0, 12).map((c) => (
                            <button key={c} onClick={() => addTema(c)} disabled={lidForm.temas.some((x) => x.toLowerCase() === c.toLowerCase())}>+ {c}</button>
                          ))}
                        </div>
                      )}
                    </div>
                  );
                })()}
              </div>

              <div className="span2">
                <label className="fl">Comentarios generales de la parrilla</label>
                <textarea value={lidForm.comments} onChange={(e) => setLid({ comments: e.target.value })} rows={3}
                  placeholder="Indicaciones para todo el mes: prioridades, anuncios que no pueden faltar, temas a evitar, tono de alguna campaña, fechas bloqueadas…" />
                <div className="hint">Se aplica a todas las publicaciones de la parrilla.</div>
              </div>

              <div className="span2">
                <div className="trendhead">
                  <label className="fl" style={{ marginBottom: 0 }}>Hashtags <span className="cnt">{lidForm.hashtags.length}</span></label>
                  <button className="btn btn-ghost" onClick={buscarTendencias} disabled={trend.loading}
                    title="Consulta Google Trends y fuentes del sector para proponer hashtags de marketing en aumento">
                    {trend.loading ? <><Spin color="var(--amber)" /> Consultando Google Trends…</> : 'Buscar en Google Trends'}
                  </button>
                </div>
                <div className="tagbox">
                  {lidForm.hashtags.map((t) => (
                    <span key={t.tag} className="tag-on" title={t.tema ? 'Tema: ' + t.tema : 'Añadido manualmente'}>
                      {t.tag}<button onClick={() => removeHashtag(t.tag)} title={'Quitar ' + t.tag}>×</button>
                    </span>
                  ))}
                  <input
                    type="text"
                    value={hashInput}
                    onChange={(e) => setHashInput(e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter' || e.key === ',' || e.key === ' ') { e.preventDefault(); addHashtag(hashInput); }
                      else if (e.key === 'Backspace' && !hashInput && lidForm.hashtags.length) { removeHashtag(lidForm.hashtags[lidForm.hashtags.length - 1]); }
                    }}
                    onBlur={() => addHashtag(hashInput)}
                    placeholder={lidForm.hashtags.length ? 'Añadir hashtag…' : 'Escribe un hashtag y pulsa Enter'}
                  />
                </div>
                <div className="hint">Solo se asignan a publicaciones cuyo tema coincide con el del hashtag, máximo 3. Si ninguno corresponde, la publicación sale sin hashtags. En X nunca se colocan.</div>

                {trend.error && <div className="warnline">{trend.error} <button className="link" onClick={buscarTendencias} style={{ marginLeft: 6 }}>Reintentar →</button></div>}

                {trend.items.length > 0 && (
                  <div className="trendbox">
                    <span className="tl">Tendencias de marketing · {trend.at ? trend.at.toLocaleTimeString('es-MX', { hour: '2-digit', minute: '2-digit' }) : ''} · toca para añadir</span>
                    {trend.items.map((h) => (
                      <button key={h.tag} className="thash" onClick={() => addHashtag(h.tag, h.tema)}
                        disabled={lidForm.hashtags.some((x) => x.tag.toLowerCase() === h.tag.toLowerCase())}>
                        <b>{h.tag}</b>
                        {h.tema && <span style={{ color: 'var(--amber-hi)', fontWeight: 600 }}>{h.tema}</span>}
                        {h.motivo && <span>{h.motivo}</span>}
                      </button>
                    ))}
                    <div className="hint" style={{ marginTop: 6 }}>Consulta en vivo a Google Trends y fuentes del sector, acotada a marketing. No es una conexión directa a la API de Trends (el navegador la bloquea), así que conviene revisarlos antes de aprobarlos.</div>
                  </div>
                )}
              </div>

              <div className="span2">
                <label className="fl">Demanda de búsqueda (servicio de Trends de LID)</label>
                <div className="trendhead">
                  <input type="text" value={lidForm.seoEndpoint} onChange={(e) => setLid({ seoEndpoint: e.target.value })}
                    placeholder="https://script.google.com/macros/s/.../exec" style={{ flex: 1, minWidth: 240 }} />
                  <button className="btn btn-ghost" onClick={consultarDemanda} disabled={dem.loading || !lidForm.seoEndpoint.trim()}
                    title={lidForm.seoEndpoint.trim() ? 'Consulta tu servicio de tendencias' : 'Pega primero la URL del servicio'}>
                    {dem.loading ? <><Spin color="var(--accent)" /> Consultando…</> : 'Consultar demanda'}
                  </button>
                </div>
                <div className="hint">Alimenta únicamente las piezas de <b>SEO / Blog</b>: la keyword y el ángulo se eligen con demanda real. No influye en los demás canales. Si lo dejas vacío, GridIA planea el SEO con su propio criterio.</div>

                {dem.error && <div className="warnline">{dem.error}</div>}

                {lidForm.demanda.length > 0 && (
                  <div className="trendbox">
                    <div className="trendhead" style={{ marginBottom: 4 }}>
                      <span className="tl" style={{ marginBottom: 0 }}>
                        {lidForm.demandaSel.length} de {lidForm.demanda.length} términos activos · {dem.at ? dem.at.toLocaleTimeString('es-MX', { hour: '2-digit', minute: '2-digit' }) : ''}
                      </span>
                      <span>
                        <button className="link" onClick={() => setLid({ demandaSel: [...lidForm.demanda] })}>Todos</button>
                        <span style={{ color: 'var(--line)', margin: '0 7px', opacity: .6 }}>·</span>
                        <button className="link" onClick={() => setLid({ demandaSel: [] })}>Ninguno</button>
                      </span>
                    </div>
                    <div className="demlist">
                      {lidForm.demanda.map((t) => (
                        <button key={t.termino + t.semilla} className={'dterm' + (lidForm.demandaSel.some((x) => x.termino === t.termino) ? ' on' : '')}
                          onClick={() => toggleDemanda(t)} title={'Semilla: ' + (t.semilla || '—')}>
                          {t.termino}
                          <span className="dm">{t.variacion || t.interes}{t.tipo === 'rising' ? ' ↑' : ''}</span>
                        </button>
                      ))}
                    </div>
                    <div className="hint" style={{ marginTop: 10 }}>Estos datos traen ruido: aparecen homónimos y búsquedas de nivel básico. Desactiva los que no correspondan; solo los activos llegan al generador.</div>
                  </div>
                )}
              </div>
            </div>
          </div>

          <div className="toolbar">
            <div className="t-title"><span className="step">03</span>Genera la parrilla de redes propias: red social, insight y campaña por publicación.</div>
            <button className="btn btn-primary" onClick={() => generate('lid')} disabled={loading.lid || lidForm.plataformas.length === 0} title={lidForm.plataformas.length === 0 ? 'Selecciona al menos una red social' : 'Genera la parrilla de LID Marketing'}>
              {loading.lid ? <><Spin color="var(--on-btn)" /> Generando…</> : (results.lid ? 'Regenerar parrilla' : 'Generar parrilla')}
            </button>
          </div>

          <div className="card">
            <div className="zhead">
              <div className="zid">
                <span className="zname">LID Marketing</span>
                <span className="zmeta">{lidForm.postCount} posts · {lidForm.plataformas.length} redes · {lidForm.temas.length} campañas · {lidForm.month}{lidForm.base ? ' · base: ' + lidForm.base.length + ' publicaciones' : ''}</span>
                {results.lid && <span className="zdone">{results.lid.posts.length} publicaciones</span>}
              </div>
              {results.lid && !loading.lid && (
                <div className="row-actions">
                  <button className="btn btn-ghost" onClick={exportLidXLSX} title="Descarga en Excel con las columnas Fecha, Día, Plataforma, Tipo de post, Tema/Campaña, Copy in, Copy out y Arte"><DL /> XLSX</button>
                  <button className="btn btn-ghost" onClick={exportLidCSV} title="Descarga en CSV (UTF-8)"><DL /> CSV</button>
                </div>
              )}
            </div>

            {lidForm.plataformas.length === 0 && <div className="warnline">Selecciona al menos una red social en el paso 01 para habilitar la generación.</div>}

            {errors.lid && (
              <div className="err">
                <b>No se pudo generar.</b> {errors.lid}{' '}
                <button className="link" onClick={() => generate('lid')} style={{ marginLeft: 6 }}>Reintentar →</button>
              </div>
            )}

            {loading.lid && <LoadingBlock zona="LID Marketing" prog={progress.lid} />}

            {results.lid && !loading.lid && (
              <div style={{ marginTop: 22 }}>
                {results.lid.creditos && <p style={{ color: 'var(--muted)', fontSize: 12.5, margin: '0 0 14px' }}>{results.lid.creditos.summary}</p>}
                {results.lid.aviso && <div className="warnline" style={{ marginBottom: 12 }}>{results.lid.aviso}</div>}
                <GridTable result={results.lid} base={LID_PARAMS} extras={LID_EXTRAS} onStatus={(x, v) => updateStatus('lid', x.dia, v)} />
              </div>
            )}

            {!results.lid && !loading.lid && !errors.lid && (
              <div className="empty" style={{ marginTop: 18 }}>
                Configura el mes, las redes y los temas del mes, y pulsa <b style={{ color: 'var(--text)' }}>Generar parrilla</b>.
              </div>
            )}
          </div>
        </>)}
      </div>
    </div>
  );
}
