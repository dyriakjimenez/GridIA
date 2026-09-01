import { Post, VIDEO_AI_TOOLS, PLATAFORMAS, TIPOS_POST } from '../domain/schema';
import { LID_BRAND, LID_PILARES, LID_PROPIEDADES, LID_FUNNEL, LID_AUDIENCIAS, LID_CANAL } from '../domain/brand';
import { baseDigest } from '../data/digest';

export interface PromptOptions {
  country: string;
  regionLabel: string;
  zonaNota: string;
  estados: string[];
  form: any;
  days: number[];
  prevPosts: Post[];
  totalPosts: number;
  esGeneral: boolean;
  esLid: boolean;
  plataformas: string[];
  temas: string[];
  hashtags: any[];
  base?: any[];
  demanda?: any[];
}

export function buildPrompt({ country, regionLabel, zonaNota, estados, form, days, prevPosts, totalPosts, esGeneral, esLid, plataformas, temas, hashtags, base, demanda }: PromptOptions): string {
  const focus = form.focus.join(', ') || 'Branding';
  const brandBlock = form.brandContext && form.brandContext.trim()
    ? 'Contexto de marca aportado por el usuario (MANUAL DE VOZ Y TONO):\\n' + form.brandContext.trim()
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
    ? \`CONTINUIDAD (este es un bloque intermedio de una parrilla de \${totalPosts} publicaciones)
- Ya existen \${prevPosts.length} publicaciones. NO repitas estas ideas ni sus ángulos: \${prevPosts.slice(-12).map((p) => 'Día ' + p.dia + ' (' + (p.plataforma || p.estadoFoco || '') + '): ' + p.ideaPrincipal).join(' | ')}
- Balance de formatos hasta ahora: \${prevImgs} Imagen / \${prevVids} Video. Compensa para que el total quede equilibrado según "\${form.formats}".
\${esLid ? '- Rota las plataformas y los tipos de post; no repitas la misma combinación dos veces seguidas.' : (esGeneral ? '- Mantén la variedad temática cubriendo distintos momentos de consumo y audiencias del país.' : (pendientes.length ? '- Estados aún SIN publicación (dales prioridad): ' + pendientes.join(', ') + '.' : '- Todos los estados ya tienen al menos una publicación; alterna entre ellos.'))}
\` : (esLid ? \`- Reparte las publicaciones entre las plataformas seleccionadas y varía los tipos de post.\` : (esGeneral ? \`- Cubre distintos momentos de consumo, audiencias y ocasiones relevantes a nivel nacional.\` : \`- Distribuye las publicaciones entre los estados seleccionados de forma representativa.\`));

  const tarea = esLid
    ? \`TAREA: genera \${days.length} publicaciones (bloque de una parrilla de \${totalPosts}) para las redes sociales propias de \${form.client}, organizadas por plataforma, tipo de post y tema/campaña.\`
    : (esGeneral
      ? \`TAREA: genera \${days.length} publicaciones (bloque de una parrilla de \${totalPosts}) GENERALES para TODO \${country} (parrilla nacional), en español neutro y con apego estricto al manual de voz y tono de la marca.\`
      : \`TAREA: genera \${days.length} publicaciones (bloque de una parrilla de \${totalPosts}) para la ZONA \${regionLabel.toUpperCase()} de \${country}, adaptadas a los estados seleccionados y, sobre todo, a su forma de hablar.\`);

  const tallyPilar: Record<string, number> = {};
  (prevPosts || []).forEach((x) => { if (x.pilar) tallyPilar[x.pilar] = (tallyPilar[x.pilar] || 0) + 1; });
  const tallyTxt = Object.keys(tallyPilar).length ? Object.keys(tallyPilar).map((k) => k + ': ' + tallyPilar[k]).join(' · ') : 'ninguno todavía';
  const canales = (plataformas || PLATAFORMAS);

  const bloqueBase = (esLid && base && base.length) ? '\\n\\n' + baseDigest(base) : '';
  const adaptacionLid = \`\${LID_BRAND}\${bloqueBase}

CANALES SELECCIONADOS — una idea estratégica, expresiones nativas distintas
Nunca repartas el mismo copy entre redes. Una misma tesis se reinterpreta según el canal:
\${canales.map((pl) => '· ' + pl + ': ' + (LID_CANAL[pl] || 'usa el formato y el tono nativos de la plataforma.')).join('\\n')}

- "redesSociales": arreglo con los canales donde vive la pieza. Agrupa varios SOLO cuando el contenido funcione igual en todos (por ejemplo Facebook + Instagram); separa cuando el formato o la audiencia lo exijan (un hilo solo en X, un artículo solo en SEO / Blog, un análisis ejecutivo solo en LinkedIn). Si agrupas, el copy debe leerse natural en todos.
- "tipoPost": formato nativo del canal, entre: \${TIPOS_POST.join(' | ')}.
- "audiencia": el decisor concreto al que le habla la pieza.
- "insight": la verdad de negocio o del consumidor que justifica la publicación, en UNA frase de máximo 20 palabras. Observación real y específica, jamás un lugar común ni el resumen del post.
- "pilar": elige entre \${LID_PILARES.join(' | ')}. Respeta esa distribución a lo largo del mes; no acumules piezas del mismo pilar. Pilares ya usados en esta parrilla: \${tallyTxt}.
- "propiedad": marco editorial recurrente, entre \${LID_PROPIEDADES.join(' | ')}. No hace falta nombrarla en el copy: orienta el enfoque.
- "etapaFunnel": \${LID_FUNNEL.join(' | ')}. Reparte la parrilla entre las etapas; no la llenes de Conversion.
- "fichaCanal": especificación técnica propia del canal, en una línea compacta. SEO / Blog: keyword primaria, secundarias, intención, title, slug, meta description y H2 sugeridos. YouTube: título, concepto de thumbnail, capítulos y Shorts derivados. X: estructura del hilo si aplica. LinkedIn: qué voz firma (marca, dirección, especialista o equipo). Meta y TikTok: hook visual y beats. Deja "" si el canal no lo requiere.
- "repurposing": en máximo 20 palabras, cómo reutilizar esta misma tesis en otro canal con una expresión distinta.
\${(demanda && demanda.length) ? \`- DEMANDA DE BÚSQUEDA REAL (Google Trends). Para las piezas de SEO / Blog, elige la keyword primaria y el ángulo a partir de estos términos con demanda comprobada, y regístralos en "fichaCanal". Criterio obligatorio: DESCARTA los términos que no tengan relación con marketing — en estos datos se cuelan homónimos y ruido (nombres de personas, bolsa, productos ajenos). Descarta también los de intención básica o de estudiante ("qué es", "curso", "maestría") salvo que puedas elevarlos a una pregunta de negocio, según la regla de originalidad de la marca. Si ninguno sirve para la pieza, usa tu criterio y no fuerces la keyword. Estos términos NO deben influir en las piezas de otros canales.
\${demanda.map((d) => '  · ' + d.termino + (d.semilla ? ' [semilla: ' + d.semilla + ']' : '') + (d.variacion ? ' · ' + d.variacion : '') + (d.tipo ? ' · ' + d.tipo : '')).join('\\n')}\` : ''}
- "temaCampana": el tema o campaña al que pertenece la pieza, tomado de la lista del mes; reutiliza los nombres para que el mes se lea como campañas con hilo conductor. Temas de este mes: \${temas.length ? temas.join(' | ') : 'elige un tema libre'}.
- "hashtags": incluye MÁXIMO 3 hashtags por publicación. Usa los hashtags proporcionados SOLO SI el subtema de la pieza coincide EXACTAMENTE con el tema del hashtag. Si ninguno coincide de forma natural, devuelve un arreglo vacío []. NUNCA uses hashtags en piezas destinadas a X (Twitter).
  Hashtags disponibles este mes: \${hashtags.length ? hashtags.map((h) => h.tag + (h.tema ? ' (para temas de ' + h.tema + ')' : '')).join(' ') : 'ninguno'}\`;

  const adaptacionCliente = \`\${brandBlock}
\${filesNote}
- Mes: \${form.month}
- Enfoque general de la parrilla: \${focus}
- Oferta/promoción (opcional): \${form.offer || 'Ninguna. Evita mensajes puramente de venta.'}
\${form.comments ? '- Instrucciones adicionales del usuario: ' + form.comments : ''}

\${esGeneral ? \`Estilo y voz: ESPAÑOL NEUTRO. Evita por completo los regionalismos (nada de chido, parce, wey, bacán, etc.). El texto debe ser natural y correcto para cualquier país de habla hispana, apegándose únicamente a las instrucciones de voz de la marca.\` : \`ZONA \${regionLabel.toUpperCase()} — REGLA PRINCIPAL
ESTADOS: \${estados.join(', ')}
NOTA LINGÜÍSTICA: \${zonaNota}
- Es OBLIGATORIO que el copy use los modismos de la zona y que el "pasoAPaso" tenga detalles visuales que encajen con los estados (ej. playas, desierto, ciudades específicas, clima, comida local).
- Si el manual de voz de la marca (arriba) prohíbe el uso de regionalismos, respeta el manual por sobre la zona.\`}

- "estadoFoco": \${esGeneral ? '"Nacional"' : 'elige uno distinto para cada pieza entre: ' + estados.join(' | ')}.
- "tecnicismosRegionales": arreglo con \${esGeneral ? '1' : '1 a 3'} modismos de la zona o de la marca usados en el texto.
- "etapaFunnel": elige entre TOFU, MOFU, BOFU o Fidelización.\`;

  return \`\${tarea}
\${esLid ? adaptacionLid : adaptacionCliente}

DÍAS A CUBRIR (1 pieza por día): \${days.join(', ')}

\${continuidad}

REGLAS DE PRODUCCIÓN Y FORMATO
- formatoArte: elige entre Imagen o Video. (Balance global esperado: \${form.formats}).
- masterPromptMidjourney: prompt en INGLÉS para generar el arte en Midjourney (estilo, sujeto, luz, cámara).
- Si es Video, incluye "videoDetails" con:
  - numEscenas: cantidad de escenas o tomas (2 a 4).
  - videoAITool: elige UNA de esta lista escribiendo el nombre EXACTO: \${VIDEO_AI_TOOLS.map((t) => t.name).join(' | ')}.
  - promptsEscenasMidjourney: arreglo de prompts en inglés, uno por escena, para generar las imágenes base.
  - promptsVideoAI: arreglo de prompts en inglés, uno por escena, indicando el movimiento de cámara y acción para animar la imagen en la herramienta de video.
- pasoAPaso: instrucciones detalladas y breves para el diseñador/editor.

\${esLid ? '' : \`- Máximo \${esGeneral ? 2 : 3} tecnicismosRegionales por post.\`}

FORMATO DE SALIDA (OBLIGATORIO)
Responde ÚNICAMENTE con un objeto JSON válido y COMPACTO (una sola línea, sin markdown, sin comillas triples, sin texto antes ni después), con esta forma exacta:
{"posts":[{"dia":0,"hora":"HH:MM",\${esLid ? '"redesSociales":["..."],"audiencia":"...","insight":"...","pilar":"...","propiedad":"...","tipoPost":"...","temaCampana":"...","fichaCanal":"...","repurposing":"...","hashtags":["..."],' : ''}"estadoFoco":"...","ideaPrincipal":"...","enfoquePublicacion":"Atraer|Convertir|Cerrar|Deleitar","etapaFunnel":"\${esLid ? LID_FUNNEL.join('|') : 'TOFU|MOFU|BOFU|Fidelización'}","copyIn":"...","copyOut":"...","tecnicismosRegionales":[{"termino":"...","significado":"..."}],"explicacionArte":"...","formatoArte":"Imagen|Video","masterPromptMidjourney":"...","videoDetails":{"numEscenas":0,"videoAITool":"...","promptsEscenasMidjourney":["..."],"promptsVideoAI":["..."]},"pasoAPaso":"..."}]}
Si un post es "Imagen", usa "videoDetails": null.\`;
}
