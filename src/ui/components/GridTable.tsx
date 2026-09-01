import React from 'react';
import { Post, STATUS_OPTIONS, TPL_PARAMS, EXTRA_PARAMS } from '../../domain/schema';

function hora12(h?: string) {
  const m = /^(\\d{1,2}):(\\d{2})/.exec(String(h || '').trim());
  if (!m) return h || '—';
  let hh = parseInt(m[1], 10);
  const suf = hh >= 12 ? 'PM' : 'AM';
  hh = hh % 12 || 12;
  return hh + ':' + m[2] + ' ' + suf;
}

function renderCell(label: string, p: Post) {
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
    case 'Video': {
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
    }
    case 'Paso a paso': return p.pasoAPaso;
    default: return null;
  }
}

interface GridTableProps {
  result: { posts: Post[] };
  conZona?: boolean;
  onStatus?: (p: Post, v: string) => void;
  base?: string[];
  extras?: string[];
}

export function GridTable({ result, conZona, onStatus, base, extras }: GridTableProps) {
  const posts = [...(result.posts || [])].sort((a, b) => (a.dia - b.dia) || String(a._zona || '').localeCompare(String(b._zona || '')));
  const filas = base || TPL_PARAMS;
  const filasExtra = extras || EXTRA_PARAMS;
  const params = conZona ? ['Zona', ...filas] : filas;
  
  const celda = (label: string, p: Post) => {
    if (label === 'Zona') return <span className="ztag">{p._zona || '—'}</span>;
    if (label === 'Status') {
      return onStatus
        ? <select className="statussel" value={p.status || 'Pendiente'} onChange={(e) => onStatus(p, e.target.value)}>{STATUS_OPTIONS.map((o) => <option key={o}>{o}</option>)}</select>
        : <span className="tag i">{p.status || 'Pendiente'}</span>;
    }
    return renderCell(label, p);
  };
  
  const fila = (label: string) => (
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
