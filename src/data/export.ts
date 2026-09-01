import * as XLSX from 'xlsx';
import { Post } from '../domain/schema';

const CSV_HEADERS = ['Zona', 'Fecha', 'Día', 'Hora', 'Status', 'Enfoque de la publicación (Inbound Marketing)', 'Etapa del funnel', 'Idea principal', 'Copy in', 'Copy out', 'Formato del arte a desarrollar', 'Arte', 'Estado foco', 'Modismos (término: significado)', 'Master Prompt (Midjourney)', 'Video - Escenas', 'Video - AI Tool', 'Video - Prompts Imagen', 'Video - Prompts Video', 'Paso a paso'];
const LID_CSV_HEADERS = ['Red social', 'Fecha', 'Hora', 'Status', 'Enfoque de la publicación (Inbound Marketing)', 'Etapa del funnel', 'INSIGHT', 'Idea principal', 'Copy in', 'Copy out', 'Arte', 'Día', 'Audiencia / decisor', 'Pilar de contenido', 'Propiedad editorial', 'Tema/Campaña', 'Ficha de canal', 'Repurposing', 'Hashtags', 'Tipo de post', 'Formato del arte a desarrollar', 'Master Prompt (Midjourney)', 'Video - Escenas', 'Video - AI Tool', 'Video - Prompts Imagen', 'Video - Prompts Video', 'Paso a paso'];

export const slug = (s: string) => String(s).normalize('NFD').replace(/[\\u0300-\\u036f]/g, '').replace(/[^a-z0-9]+/gi, '_').replace(/^_|_$/g, '').toLowerCase();

function hora12(h?: string) {
  const m = /^(\\d{1,2}):(\\d{2})/.exec(String(h || '').trim());
  if (!m) return h || '—';
  let hh = parseInt(m[1], 10);
  const suf = hh >= 12 ? 'PM' : 'AM';
  hh = hh % 12 || 12;
  return hh + ':' + m[2] + ' ' + suf;
}

export function postToRow(zona: string, p: Post) {
  const modismos = (p.tecnicismosRegionales || []).map((x) => x.termino + ': ' + x.significado).join(' | ');
  const vd = p.videoDetails;
  return [zona, p.fecha || '', p.dia, p.hora || '', p.status || 'Pendiente', p.enfoquePublicacion || '', p.etapaFunnel || '', p.ideaPrincipal || '', p.copyIn || '', p.copyOut || '', p.formatoArte || '', p.explicacionArte || '', p.estadoFoco || '', modismos, p.masterPromptMidjourney || '', vd ? vd.numEscenas : '', vd ? vd.videoAITool : '', vd ? (vd.promptsEscenasMidjourney || []).join(' ; ') : '', vd ? (vd.promptsVideoAI || []).join(' ; ') : '', p.pasoAPaso || ''];
}

export function lidPostToRow(p: Post) {
  const vd = p.videoDetails;
  const redes = (Array.isArray(p.redesSociales) && p.redesSociales.length ? p.redesSociales : (p.plataforma ? [p.plataforma] : [])).join(' / ');
  return [redes, p.fecha || '', hora12(p.hora), p.status || 'Pendiente', p.enfoquePublicacion || '', p.etapaFunnel || '', p.insight || '', p.ideaPrincipal || '', p.copyIn || '', p.copyOut || '', p.explicacionArte || '', p.diaSemana || '', p.audiencia || '', p.pilar || '', p.propiedad || '', p.temaCampana || '', p.fichaCanal || '', p.repurposing || '', (p.hashtags || []).join(' '), p.tipoPost || '', p.formatoArte || '', p.masterPromptMidjourney || '', vd ? vd.numEscenas : '', vd ? vd.videoAITool : '', vd ? (vd.promptsEscenasMidjourney || []).join(' ; ') : '', vd ? (vd.promptsVideoAI || []).join(' ; ') : '', p.pasoAPaso || ''];
}

const TPL_XLSX_LABELS = { fecha: 'Fecha', hora: 'Hora', status: 'Status', enfoque: 'Enfoque de la publicación (Inbound Marketing)', funnel: 'Etapa del funnel', idea: 'Idea principal', cin: 'Copy in', cout: 'Copy out', formato: 'Formato del arte a desarrollar', arte: 'Arte' };

export function postsToAOA(posts: Post[], conZona: boolean) {
  const fila = (label: string, fn: (p: Post) => any) => [label].concat(posts.map(fn));
  const vd = (p: Post, f: (v: any) => any) => (p.videoDetails ? f(p.videoDetails) : '');
  const mod = (p: Post) => (p.tecnicismosRegionales || []).map((t) => t.termino + ': ' + t.significado).join(' | ');
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

export function lidPostsToAOA(posts: Post[]) {
  const fila = (label: string, fn: (p: Post) => any) => [label].concat(posts.map(fn));
  const vd = (p: Post, f: (v: any) => any) => (p.videoDetails ? f(p.videoDetails) : '');
  const redes = (p: Post) => (Array.isArray(p.redesSociales) && p.redesSociales.length ? p.redesSociales : (p.plataforma ? [p.plataforma] : [])).join(' / ');
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

export function downloadXLSX(filename: string, posts: Post[], conZona: boolean, modo?: string) {
  const ordenados = [...posts].sort((a, b) => (a.dia - b.dia) || String(a._zona || '').localeCompare(String(b._zona || '')));
  const ws = XLSX.utils.aoa_to_sheet(modo === 'lid' ? lidPostsToAOA(ordenados) : postsToAOA(ordenados, conZona));
  ws['!cols'] = [{ wch: 40 }].concat(ordenados.map(() => ({ wch: 46 })));
  const wb = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(wb, ws, 'Parrilla');
  XLSX.writeFile(wb, filename);
}

export function downloadCSV(filename: string, rows: any[][], headers?: string[]) {
  const body = [(headers || CSV_HEADERS).join(',')].concat(rows.map((r) => r.map((f) => '"' + String(f).replace(/"/g, '""') + '"').join(','))).join('\\n');
  const uri = 'data:text/csv;charset=utf-8,' + encodeURIComponent('\\uFEFF' + body);
  const a = document.createElement('a');
  a.href = uri; a.download = filename;
  document.body.appendChild(a); a.click(); document.body.removeChild(a);
}
