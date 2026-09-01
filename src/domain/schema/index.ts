export interface Tecnicismo {
  termino: string;
  significado: string;
}

export interface VideoDetails {
  numEscenas?: number | string;
  videoAITool?: string;
  promptsEscenasMidjourney?: string[];
  promptsVideoAI?: string[];
}

export interface Post {
  dia: number;
  fecha?: string;
  diaSemana?: string;
  hora?: string;
  status?: string;
  enfoquePublicacion?: string;
  etapaFunnel?: string;
  ideaPrincipal?: string;
  copyIn?: string;
  copyOut?: string;
  explicacionArte?: string;
  formatoArte?: string;
  masterPromptMidjourney?: string;
  videoDetails?: VideoDetails | null;
  pasoAPaso?: string;
  
  // Cliente
  estadoFoco?: string;
  tecnicismosRegionales?: Tecnicismo[];
  _zona?: string; // Appended by UI
  
  // LID Marketing
  redesSociales?: string[];
  plataforma?: string;
  audiencia?: string;
  insight?: string;
  pilar?: string;
  propiedad?: string;
  tipoPost?: string;
  temaCampana?: string;
  fichaCanal?: string;
  repurposing?: string;
  hashtags?: string[];
}

export const STATUS_OPTIONS = ['Pendiente', 'En diseño', 'Aprobado', 'Programado', 'Publicado'];
export const LABEL_TO_KEY: Record<string, string> = { Norte: 'norte', Centro: 'centro', Sur: 'sur', General: 'general' };
export const PLATAFORMAS = ['LinkedIn', 'Instagram', 'Facebook', 'X', 'TikTok', 'YouTube', 'SEO / Blog'];
export const TIPOS_POST = ['Text post', 'Documento/Carrusel', 'Carrusel', 'Reel', 'Video', 'Video largo', 'Short', 'Hilo', 'Post estático', 'Historia', 'Artículo SEO', 'Encuesta'];

export const MONTHS = ['Enero', 'Febrero', 'Marzo', 'Abril', 'Mayo', 'Junio', 'Julio', 'Agosto', 'Septiembre', 'Octubre', 'Noviembre', 'Diciembre'];
export const POST_COUNTS = [4, 6, 8, 10, 12, 16];
export const FOCUS_OPTIONS = ['Ventas', 'Branding', 'Alcance', 'Reconocimiento de Marca', 'Posicionamiento de Marca'];
export const FORMAT_OPTIONS = ['Imagen', 'Video', 'Ambas'];

export const VIDEO_AI_TOOLS = [
  { name: 'Seedance 1.0 Pro', credits: 250 }, { name: 'Seedance 1.0 Lite', credits: 200 },
  { name: 'Kling 2.1 Master', credits: 1400 }, { name: 'Kling 2.1', credits: 300 },
  { name: 'Kling 1.6 Pro', credits: 500 }, { name: 'Kling 1.6 Standard', credits: 300 },
  { name: 'MiniMax Hailuo 02', credits: 300 }, { name: 'MiniMax', credits: 500 },
  { name: 'Google Veo 3', credits: 12000 }, { name: 'Google Veo 3 Fast', credits: 6400 },
  { name: 'Google Veo 2', credits: 1000 }, { name: 'Runway Gen 4', credits: 500 },
  { name: 'PixVerse 4.5', credits: 825 },
];

export const TPL_PARAMS = ['Fecha', 'Hora', 'Status', 'Enfoque (Inbound)', 'Etapa del funnel', 'Idea principal', 'Copy in', 'Copy out', 'Formato del arte', 'Arte'];
export const EXTRA_PARAMS = ['Estado foco', 'Modismos usados', 'Master Prompt', 'Video', 'Paso a paso'];
export const LID_PARAMS = ['Red social', 'Fecha', 'Hora', 'Status', 'Enfoque (Inbound)', 'Etapa del funnel', 'INSIGHT', 'Idea principal', 'Copy in', 'Copy out', 'Arte'];
export const LID_EXTRAS = ['Día', 'Audiencia', 'Pilar', 'Propiedad editorial', 'Tema/Campaña', 'Ficha de canal', 'Repurposing', 'Hashtags', 'Tipo de post', 'Formato del arte', 'Master Prompt', 'Video', 'Paso a paso'];
