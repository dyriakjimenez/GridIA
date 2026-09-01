import * as XLSX from 'xlsx';

const BASE_COLS: Record<string, string[]> = {
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

const PLAT_MAP: Record<string, string> = {
  'meta': 'Facebook + Instagram', 'facebook': 'Facebook', 'fb': 'Facebook',
  'instagram': 'Instagram', 'ig': 'Instagram', 'linkedin': 'LinkedIn', 'li': 'LinkedIn',
  'x': 'X', 'twitter': 'X', 'tiktok': 'TikTok',
  'youtube': 'YouTube', 'youtube shorts': 'YouTube', 'yt': 'YouTube', 'shorts': 'YouTube',
  'blog seo': 'SEO / Blog', 'blog': 'SEO / Blog', 'seo': 'SEO / Blog', 'seo / blog': 'SEO / Blog',
};

const DIAS_LARGOS = ['Domingo', 'Lunes', 'Martes', 'Miércoles', 'Jueves', 'Viernes', 'Sábado'];

const norm = (v: any) => String(v == null ? '' : v).replace(/\\r\\n?/g, '\\n').trim();
const key = (v: any) => norm(v).toLowerCase().normalize('NFD').replace(/[\\u0300-\\u036f]/g, '');

function fechaISO(v: any, diaPrimero: boolean) {
  if (v instanceof Date && !isNaN(v.getTime())) {
    return v.getFullYear() + '-' + String(v.getMonth() + 1).padStart(2, '0') + '-' + String(v.getDate()).padStart(2, '0');
  }
  const t = norm(v);
  if (!t) return '';
  let m = /^(\\d{4})-(\\d{1,2})-(\\d{1,2})/.exec(t);
  if (m) return m[1] + '-' + m[2].padStart(2, '0') + '-' + m[3].padStart(2, '0');
  m = /^(\\d{1,2})[\\/\\-.](\\d{1,2})[\\/\\-.](\\d{2,4})$/.exec(t);
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
  const MESES3: Record<string, number> = { ene: 1, feb: 2, mar: 3, abr: 4, may: 5, jun: 6, jul: 7, ago: 8, sep: 9, oct: 10, nov: 11, dic: 12, jan: 1, apr: 4, aug: 8, dec: 12 };
  m = /^(\\d{1,2})[\\-\\s\\/]([a-zA-Z]{3,})[\\-\\s\\/](\\d{2,4})$/.exec(t);
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

function detectaDiaPrimero(valores: any[]) {
  let diaPrimero = false;
  for (const v of valores) {
    const m = /^(\\d{1,2})[\\/\\-.](\\d{1,2})[\\/\\-.](\\d{2,4})$/.exec(norm(v));
    if (!m) continue;
    if (parseInt(m[1], 10) > 12) return true;
    if (parseInt(m[2], 10) > 12) return false;
  }
  return diaPrimero;
}

function horaHHMM(v: any) {
  if (v instanceof Date && !isNaN(v.getTime())) {
    return String(v.getHours()).padStart(2, '0') + ':' + String(v.getMinutes()).padStart(2, '0');
  }
  const t = norm(v);
  const m = /(\\d{1,2}):(\\d{2})/.exec(t);
  if (!m) return t;
  let h = parseInt(m[1], 10);
  if (/p\\.?\\s?m/i.test(t) && h < 12) h += 12;
  if (/a\\.?\\s?m/i.test(t) && h === 12) h = 0;
  return String(h).padStart(2, '0') + ':' + m[2];
}

function diaCanon(v: any) {
  const k = key(v);
  const hit = DIAS_LARGOS.find((d) => key(d) === k);
  return hit || (norm(v) ? norm(v).charAt(0).toUpperCase() + norm(v).slice(1).toLowerCase() : '');
}

function mapCol(header: string) {
  const h = key(header);
  for (const campo of Object.keys(BASE_COLS)) {
    if (BASE_COLS[campo].some((alias) => h === alias || h.startsWith(alias))) return campo;
  }
  return null;
}

export async function parseBaseFile(file: File): Promise<any[]> {
  const buf = await file.arrayBuffer();
  const wb = XLSX.read(new Uint8Array(buf), { type: 'array', cellDates: true });
  const sh = wb.Sheets[wb.SheetNames[0]];
  if (!sh) throw new Error('El archivo no tiene hojas legibles.');
  const aoa = XLSX.utils.sheet_to_json<any[]>(sh, { header: 1, blankrows: false, raw: true, defval: '' });
  if (!aoa.length) throw new Error('El archivo está vacío.');

  let hi = -1, mapa: (string | null)[] = [];
  for (let i = 0; i < Math.min(aoa.length, 12); i++) {
    const m = aoa[i].map(mapCol);
    if (m.filter(Boolean).length >= 4) { hi = i; mapa = m; break; }
  }
  if (hi === -1) throw new Error('No se reconocieron las columnas. Se esperan encabezados como Fecha, Plataforma, Tipo Post, Tema / Campaña y Copy.');

  const colFecha = mapa.indexOf('fecha');
  const diaPrimero = colFecha === -1 ? false : detectaDiaPrimero(aoa.slice(hi + 1).map((f) => f[colFecha]));

  const filas: any[] = [];
  for (let r = hi + 1; r < aoa.length; r++) {
    const fila: any = {};
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
