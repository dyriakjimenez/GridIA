import React, { useState, useEffect, useCallback, useRef } from 'react';
import { Spin } from '../ui/components/Spin';
import { DL } from '../ui/components/DL';
import { LoadingBlock } from '../ui/components/LoadingBlock';
import { GridTable } from '../ui/components/GridTable';
import { Logo, Sun, Moon } from '../ui/components/Icons';
import { PALETTES } from '../ui/theme';

import { COUNTRIES, REGION_KEYS, REGION_LABEL, allStatesOf } from '../domain/regions';
import { MONTHS, POST_COUNTS, FOCUS_OPTIONS, FORMAT_OPTIONS, PLATAFORMAS, LABEL_TO_KEY, LID_PARAMS, LID_EXTRAS } from '../domain/schema';
import { computeCredits } from '../domain/credits';

import { buildPrompt } from '../ai/promptBuilder';
import { callWithRetry, traducirError } from '../ai/client';

import { parseBaseFile } from '../data/baseFile';
import { fetchTrending, fetchDemandaSEO } from '../data/trends';
import { baseResumen } from '../data/digest';
import { downloadCSV, downloadXLSX, postToRow, lidPostToRow, slug } from '../data/export';

const MES3 = ['Ene', 'Feb', 'Mar', 'Abr', 'May', 'Jun', 'Jul', 'Ago', 'Sep', 'Oct', 'Nov', 'Dic'];
const DIAS_SEM = ['Dom', 'Lun', 'Mar', 'Mié', 'Jue', 'Vie', 'Sáb'];
const DIAS_LARGOS = ['Domingo', 'Lunes', 'Martes', 'Miércoles', 'Jueves', 'Viernes', 'Sábado'];

function dateFor(dia: number, mesNombre: string) {
  const mi = MONTHS.indexOf(mesNombre);
  if (mi < 0) return null;
  const hoy = new Date();
  const año = mi < hoy.getMonth() ? hoy.getFullYear() + 1 : hoy.getFullYear();
  const ultimo = new Date(año, mi + 1, 0).getDate();
  return new Date(año, mi, Math.min(dia, ultimo));
}
function fechaDe(dia: number, mesNombre: string) {
  const d = dateFor(dia, mesNombre);
  if (!d) return 'Día ' + dia;
  return DIAS_SEM[d.getDay()] + ' ' + String(d.getDate()).padStart(2, '0') + '/' + MES3[d.getMonth()] + '/' + d.getFullYear();
}
function diaSemanaDe(dia: number, mesNombre: string) {
  const d = dateFor(dia, mesNombre);
  return d ? DIAS_LARGOS[d.getDay()] : '—';
}
function planDays(n: number) {
  return Array.from({ length: n }, (_, i) => Math.max(1, Math.min(30, Math.round(((i + 1) * 30) / (n + 1)))));
}

const wait = (ms: number) => new Promise((r) => setTimeout(r, ms));

export default function App() {
  const [country, setCountry] = useState('México');
  const [selectedStates, setSelectedStates] = useState(() => allStatesOf('México'));
  const [view, setView] = useState('zonas');
  const [openZone, setOpenZone] = useState<string | null>(null);
  const [workspace, setWorkspace] = useState('cliente');
  const [theme, setTheme] = useState('dark');
  const [lidForm, setLidForm] = useState<any>({
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
  const addTema = (t: string) => {
    const v = String(t || '').trim();
    if (!v) return;
    setLidForm((f: any) => (f.temas.some((x: string) => x.toLowerCase() === v.toLowerCase()) ? f : { ...f, temas: [...f.temas, v] }));
    setTemaInput('');
  };
  const removeTema = (t: string) => setLidForm((f: any) => ({ ...f, temas: f.temas.filter((x: string) => x !== t) }));

  const [baseErr, setBaseErr] = useState<string | null>(null);
  const [baseCargando, setBaseCargando] = useState(false);
  const cargarBase = async (e: any) => {
    const file = (e.target.files || [])[0];
    e.target.value = '';
    if (!file) return;
    setBaseCargando(true); setBaseErr(null);
    try {
      const filas = await parseBaseFile(file);
      setLid({ base: filas, baseNombre: file.name });
    } catch (err: any) {
      setBaseErr((err && err.message) || 'No se pudo leer el archivo.');
    } finally {
      setBaseCargando(false);
    }
  };
  const quitarBase = () => { setLid({ base: null, baseNombre: '' }); setBaseErr(null); };

  const [dem, setDem] = useState<any>({ loading: false, error: null, at: null });
  const consultarDemanda = async () => {
    setDem({ loading: true, error: null, at: null });
    try {
      const t = await fetchDemandaSEO(lidForm.seoEndpoint, 'MX', '30d');
      setLid({ demanda: t, demandaSel: t });
      setDem({ loading: false, error: null, at: new Date() });
    } catch (err: any) {
      setLid({ demanda: [], demandaSel: [] });
      setDem({ loading: false, error: (err && err.message) || 'No se pudo consultar el servicio.', at: null });
    }
  };
  const toggleDemanda = (t: any) => setLidForm((f: any) => ({
    ...f,
    demandaSel: f.demandaSel.some((x: any) => x.termino === t.termino)
      ? f.demandaSel.filter((x: any) => x.termino !== t.termino)
      : [...f.demandaSel, t],
  }));

  const [hashInput, setHashInput] = useState('');
  const [trend, setTrend] = useState<any>({ loading: false, error: null, items: [], at: null });
  const addHashtag = (t: string, tema?: string) => {
    const v = '#' + String(t || '').trim().replace(/^#*/, '').replace(/\\s+/g, '');
    if (v.length < 2) return;
    setLidForm((f: any) => (f.hashtags.some((x: any) => x.tag.toLowerCase() === v.toLowerCase()) ? f : { ...f, hashtags: [...f.hashtags, { tag: v, tema: tema || '' }] }));
    setHashInput('');
  };
  const removeHashtag = (t: string) => setLidForm((f: any) => ({ ...f, hashtags: f.hashtags.filter((x: any) => x.tag !== t) }));
  const buscarTendencias = async () => {
    setTrend({ loading: true, error: null, items: [], at: null });
    try {
      const items = await fetchTrending({ pais: 'México', mes: lidForm.month, temas: lidForm.temas, redes: lidForm.plataformas });
      setTrend({ loading: false, error: items.length ? null : 'La búsqueda no devolvió hashtags. Inténtalo de nuevo.', items, at: new Date() });
    } catch (err: any) {
      setTrend({ loading: false, error: (err && err.message) || 'No se pudo completar la búsqueda.', items: [], at: null });
    }
  };
  const setLid = (patch: any) => setLidForm((f: any) => ({ ...f, ...patch }));
  const toggleLidFocus = (opt: string) => setLidForm((f: any) => {
    const has = f.focus.includes(opt);
    const next = has ? f.focus.filter((x: string) => x !== opt) : [...f.focus, opt];
    return next.length <= 3 ? { ...f, focus: next } : f;
  });
  const toggleLidPlataforma = (pl: string) => setLidForm((f: any) => ({
    ...f,
    plataformas: f.plataformas.includes(pl) ? f.plataformas.filter((x: string) => x !== pl) : [...f.plataformas, pl],
  }));

  const [form, setForm] = useState<any>({
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

  const [results, setResults] = useState<any>({ norte: null, centro: null, sur: null, general: null, lid: null });
  const [loading, setLoading] = useState<any>({ norte: false, centro: false, sur: false, general: false, lid: false });
  const [errors, setErrors] = useState<any>({ norte: null, centro: null, sur: null, general: null, lid: null });
  const [batch, setBatch] = useState<any>(null);
  const [progress, setProgress] = useState<any>({ norte: null, centro: null, sur: null, general: null, lid: null });
  const limiteAlcanzado = useRef(false);

  const set = (patch: any) => setForm((f: any) => ({ ...f, ...patch }));

  const changeCountry = (c: string) => {
    setCountry(c);
    setSelectedStates(allStatesOf(c));
    setResults((r: any) => ({ norte: null, centro: null, sur: null, general: null, lid: r.lid }));
    setErrors({ norte: null, centro: null, sur: null, general: null, lid: null });
    setView('zonas');
  };

  const toggleFocus = (opt: string) => {
    const has = form.focus.includes(opt);
    const next = has ? form.focus.filter((x: string) => x !== opt) : [...form.focus, opt];
    if (next.length <= 3) set({ focus: next });
  };

  const toggleState = (rk: string, estado: string) => {
    setSelectedStates((prev: any) => {
      const arr = prev[rk];
      const has = arr.includes(estado);
      return { ...prev, [rk]: has ? arr.filter((s: string) => s !== estado) : [...arr, estado] };
    });
  };
  const setAll = (rk: string, all: boolean) => setSelectedStates((prev: any) => ({ ...prev, [rk]: all ? [...COUNTRIES[country].regions[rk].estados] : [] }));

  const handleFiles = (e: any) => {
    const files = Array.from(e.target.files || []) as File[];
    e.target.value = '';
    const ok = files.filter((f) => f.type === 'application/pdf' || f.type.startsWith('image/'));
    if (!ok.length) return;
    Promise.all(ok.map((f) => new Promise<{ name: string; mime: string; data: string }>((resolve) => {
      const r = new FileReader();
      r.onload = (ev) => resolve({ name: f.name, mime: f.type, data: String(ev.target?.result).split(',')[1] });
      r.onerror = () => resolve({ name: '', mime: '', data: '' });
      r.readAsDataURL(f);
    }))).then((list) => set({ brandFiles: [...form.brandFiles, ...list.filter((x) => x.name)].slice(0, 5) }));
  };
  const removeFile = (i: number) => set({ brandFiles: form.brandFiles.filter((_: any, idx: number) => idx !== i) });

  const generate = useCallback(async (rk: string) => {
    if (!form.client.trim()) { setErrors((e: any) => ({ ...e, [rk]: 'Escribe el nombre del cliente en el Paso 1 antes de generar.' })); return; }
    const esGeneral = rk === 'general';
    const esLid = rk === 'lid';
    const cfg = esLid ? { ...lidForm, client: 'LID Marketing' } : form;
    const sinEstados = esGeneral || esLid;
    const region = sinEstados ? null : COUNTRIES[country].regions[rk];
    const estados = sinEstados ? [] : selectedStates[rk];
    if (!sinEstados && !estados.length) { setErrors((e: any) => ({ ...e, [rk]: 'Selecciona al menos un estado de esta zona para generar su parrilla.' })); return; }
    if (esLid && !cfg.plataformas.length) { setErrors((e: any) => ({ ...e, [rk]: 'Selecciona al menos una red social para generar la parrilla.' })); return; }
    limiteAlcanzado.current = false;
    setLoading((l: any) => ({ ...l, [rk]: true }));
    setErrors((e: any) => ({ ...e, [rk]: null }));
    setProgress((p: any) => ({ ...p, [rk]: { done: 0, total: cfg.postCount, msg: null } }));

    const days = planDays(cfg.postCount);
    const chunk = esLid ? 5 : 8;
    const bloques = [];
    for (let i = 0; i < days.length; i += chunk) bloques.push(days.slice(i, i + chunk));

    const acc: any[] = [];
    let aviso = null;
    const setMsg = (m: string | null) => setProgress((p: any) => ({ ...p, [rk]: { done: Math.min(acc.length, cfg.postCount), total: cfg.postCount, msg: m } }));
    
    const absorber = (data: any) => {
      (data.posts || []).forEach((p: any) => {
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
        const prompt = buildPrompt({ country, regionLabel: REGION_LABEL[rk] || '', zonaNota: region ? region.nota : '', estados, form: cfg, days: bloques[b], prevPosts: acc, totalPosts: cfg.postCount, esGeneral, esLid, plataformas: cfg.plataformas, temas: cfg.temas, hashtags: cfg.hashtags, base: cfg.base, demanda: cfg.demandaSel });
        let data;
        try {
          data = await callWithRetry(prompt, cfg.brandFiles, setMsg);
        } catch (ex: any) {
          if (acc.length) { aviso = 'La IA completó ' + acc.length + ' de ' + cfg.postCount + ' publicaciones y no pudo continuar. ' + traducirError(ex); break; }
          throw ex;
        }
        absorber(data);
      }

      let topups = 0;
      while (acc.length < cfg.postCount && topups < 2 && !aviso) {
        const hechos = new Set(acc.map((p) => p.dia));
        const faltantes = days.filter((d) => !hechos.has(d));
        if (!faltantes.length) break;
        setMsg('Completando ' + faltantes.length + ' publicación(es) faltante(s)…');
        try {
          const data = await callWithRetry(
            buildPrompt({ country, regionLabel: REGION_LABEL[rk] || '', zonaNota: region ? region.nota : '', estados, form: cfg, days: faltantes, prevPosts: acc, totalPosts: cfg.postCount, esGeneral, esLid, plataformas: cfg.plataformas, temas: cfg.temas, hashtags: cfg.hashtags, base: cfg.base, demanda: cfg.demandaSel }),
            cfg.brandFiles, setMsg
          );
          absorber(data);
        } catch (ex: any) {
          aviso = 'Se completaron ' + acc.length + ' de ' + cfg.postCount + ' publicaciones. ' + traducirError(ex);
        }
        topups++;
      }

      if (!acc.length) throw new Error('La IA no devolvió publicaciones. Inténtalo de nuevo.');
      if (!aviso && acc.length < cfg.postCount) aviso = 'Se generaron ' + acc.length + ' de ' + cfg.postCount + ' publicaciones; pulsa Generar de nuevo si quieres la parrilla completa.';
      acc.sort((a, b) => a.dia - b.dia);
      acc.forEach((p) => { p.fecha = fechaDe(p.dia, cfg.month); p.diaSemana = diaSemanaDe(p.dia, cfg.month); });

      const seen = new Set();
      const glosario: any[] = [];
      acc.forEach((p) => (p.tecnicismosRegionales || []).forEach((t: any) => {
        const k = String(t.termino || '').toLowerCase().trim();
        if (k && !seen.has(k)) { seen.add(k); glosario.push({ termino: t.termino, significado: t.significado }); }
      }));

      setResults((r: any) => ({ ...r, [rk]: { region: REGION_LABEL[rk] || '', posts: acc, glosarioRegional: glosario, creditos: computeCredits(acc), aviso } }));
    } catch (err: any) {
      if (err && String(err.message || '').startsWith('LIMIT|')) limiteAlcanzado.current = true;
      setErrors((e: any) => ({ ...e, [rk]: traducirError(err) }));
    } finally {
      setLoading((l: any) => ({ ...l, [rk]: false }));
      setProgress((p: any) => ({ ...p, [rk]: null }));
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

  const exportRegion = (rk: string) => {
    const res = results[rk]; if (!res) return;
    const rows = [...(res.posts || [])].sort((a, b) => a.dia - b.dia).map((p) => postToRow(REGION_LABEL[rk], p));
    downloadCSV('parrilla_' + slug(country) + '_' + rk + '.csv', rows);
  };
  const exportAll = () => {
    const rows: any[] = [];
    REGION_KEYS.forEach((rk) => {
      const res = results[rk];
      if (res) [...(res.posts || [])].sort((a, b) => a.dia - b.dia).forEach((p) => rows.push(postToRow(REGION_LABEL[rk], p)));
    });
    if (rows.length) downloadCSV('parrilla_' + slug(country) + '_todas_las_zonas.csv', rows);
  };

  const updateStatus = (key: string, dia: number, status: string) => setResults((r: any) => {
    const res = r[key];
    if (!res) return r;
    return { ...r, [key]: { ...res, posts: res.posts.map((p: any) => (p.dia === dia ? { ...p, status } : p)) } };
  });

  const exportLidXLSX = () => {
    if (results.lid) downloadXLSX('parrilla_lid_marketing_' + slug(lidForm.month) + '.xlsx', results.lid.posts, false, 'lid');
  };
  const exportLidCSV = () => {
    if (results.lid) downloadCSV('parrilla_lid_marketing_' + slug(lidForm.month) + '.csv', [...results.lid.posts].sort((a, b) => a.dia - b.dia).map(lidPostToRow), LID_CSV_HEADERS);
  };

  const exportRegionXLSX = (rk: string) => {
    const res = results[rk];
    if (res) downloadXLSX('parrilla_' + slug(country) + '_' + rk + '.xlsx', res.posts, false);
  };

  const LID_CSV_HEADERS = ['Red social', 'Fecha', 'Hora', 'Status', 'Enfoque de la publicación (Inbound Marketing)', 'Etapa del funnel', 'INSIGHT', 'Idea principal', 'Copy in', 'Copy out', 'Arte', 'Día', 'Audiencia / decisor', 'Pilar de contenido', 'Propiedad editorial', 'Tema/Campaña', 'Ficha de canal', 'Repurposing', 'Hashtags', 'Tipo de post', 'Formato del arte a desarrollar', 'Master Prompt (Midjourney)', 'Video - Escenas', 'Video - AI Tool', 'Video - Prompts Imagen', 'Video - Prompts Video', 'Paso a paso'];

  const zonasListas = REGION_KEYS.filter((k) => results[k]);
  const combinado = (() => {
    if (!zonasListas.length) return null;
    const posts = zonasListas.flatMap((k) => (results[k].posts || []).map((p: any) => ({ ...p, _zona: REGION_LABEL[k] })));
    const mapa: any = {};
    zonasListas.forEach((k) => (results[k].glosarioRegional || []).forEach((g: any) => {
      const key = String(g.termino || '').toLowerCase().trim();
      if (!key) return;
      if (!mapa[key]) mapa[key] = { termino: g.termino, significado: g.significado, zonas: [] };
      if (!mapa[key].zonas.includes(REGION_LABEL[k])) mapa[key].zonas.push(REGION_LABEL[k]);
    }));
    return { posts, glosario: Object.values(mapa), creditos: computeCredits(posts) };
  })();

  const paletteMode = workspace === 'lid' ? 'lid' : 'base';
  const currentPalette = PALETTES[paletteMode][theme] as React.CSSProperties;

  return (
    <div className={'gridia ' + theme + (workspace === 'lid' ? ' ws-lid' : '')} style={currentPalette}>
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
                  {form.brandFiles.map((f: any, i: number) => (
                    <div key={i} className="file"><span>{f.name}</span><button onClick={() => removeFile(i)}>×</button></div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>

        <div className="toolbar">
          <div className="t-title"><span className="step">03</span>Genera la parrilla general del país, cada zona (o las tres seguidas) y únelas en la vista combinada.</div>
          <div className="row-actions">
            <button className="btn btn-ghost" onClick={generateAll} disabled={anyLoading} title="Genera Norte, Centro y Sur en secuencia con la configuración actual">
              {anyLoading ? <><Spin color="var(--violet)" /> {batch ? 'Generando ' + batch.zona + ' (' + batch.i + '/' + batch.total + ')…' : 'Generando…'}</> : 'Generar las 3 zonas'}
            </button>
            <button className="btn btn-ghost" onClick={exportAll} disabled={!anyGenerated} title={anyGenerated ? 'Descarga un CSV combinado con columna Zona' : 'Genera al menos una zona para poder exportar'}><DL /> Exportar todo (CSV)</button>
          </div>
        </div>

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
                    {region.estados.map((x: string) => (
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
                      {result.glosarioRegional.map((g: any, i: number) => (
                        <span key={i} className="gitem"><b>{g.termino}</b><span>{g.significado}</span></span>
                      ))}
                    </div>
                  )}

                  <GridTable result={result} onStatus={(x: any, v: string) => updateStatus(rk, x.dia, v)} />
                </div>
              )}
            </div>
          );
        })}

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
                    {results.general.glosarioRegional.map((g: any, i: number) => (
                      <span key={i} className="gitem"><b>{g.termino}</b><span>{g.significado}</span></span>
                    ))}
                  </div>
                )}

                <GridTable result={results.general} onStatus={(p: any, v: string) => updateStatus('general', p.dia, v)} />
              </div>
            )}

            {!results.general && !loading.general && !errors.general && (
              <div className="empty" style={{ marginTop: 22 }}>
                Completa los pasos <b style={{ color: '#fff' }}>1</b> y <b style={{ color: '#fff' }}>2</b> (idealmente con el manual de voz y tono) y pulsa <b style={{ color: '#fff' }}>Generar Parrilla General</b> para crear la parrilla nacional en español neutro.
              </div>
            )}
          </div>
        )}

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
                    {combinado.glosario.map((g: any, i: number) => (
                      <span key={i} className="gitem"><b>{g.termino}</b><span>{g.significado}</span><span className="gz">{g.zonas.join(' · ')}</span></span>
                    ))}
                  </div>
                )}

                <GridTable result={{ posts: combinado.posts }} conZona onStatus={(p: any, v: string) => updateStatus(LABEL_TO_KEY[p._zona] || '', p.dia, v)} />
              </div>
            )}
          </div>
        )}
        </>)}

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
                  {lidForm.temas.map((t: string) => (
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
                        <b>Plataformas:</b> {r.plataformas.slice(0, 8).map((x: any) => x.v + ' (' + x.n + ')').join(' · ') || '—'}<br />
                        <b>Tipos de post:</b> {r.tipos.slice(0, 8).map((x: any) => x.v).join(' · ') || '—'}
                        {r.desde && <><br /><b>Periodo:</b> {r.desde} → {r.hasta}</>}
                      </div>
                      {r.campanas.length > 0 && (
                        <div className="sugg">
                          <span className="sl">Campañas detectadas</span>
                          {r.campanas.slice(0, 12).map((c: string) => (
                            <button key={c} onClick={() => addTema(c)} disabled={lidForm.temas.some((x: string) => x.toLowerCase() === c.toLowerCase())}>+ {c}</button>
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
                  {lidForm.hashtags.map((t: any) => (
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
                      else if (e.key === 'Backspace' && !hashInput && lidForm.hashtags.length) { removeHashtag(lidForm.hashtags[lidForm.hashtags.length - 1].tag); }
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
                    {trend.items.map((h: any) => (
                      <button key={h.tag} className="thash" onClick={() => addHashtag(h.tag, h.tema)}
                        disabled={lidForm.hashtags.some((x: any) => x.tag.toLowerCase() === h.tag.toLowerCase())}>
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
                      {lidForm.demanda.map((t: any) => (
                        <button key={t.termino + t.semilla} className={'dterm' + (lidForm.demandaSel.some((x: any) => x.termino === t.termino) ? ' on' : '')}
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
                <GridTable result={results.lid} base={LID_PARAMS} extras={LID_EXTRAS} onStatus={(x: any, v: string) => updateStatus('lid', x.dia, v)} />
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
