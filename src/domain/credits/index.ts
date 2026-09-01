import { Post } from '../schema';
import { VIDEO_AI_TOOLS } from '../schema';

export interface CreditsResult {
  min: number;
  max: number;
  summary: string;
}

export function computeCredits(posts: Post[]): CreditsResult {
  let imgs = 0, vids = 0, total = 0;
  const porTool: Record<string, number> = {};
  
  posts.forEach((p) => {
    if (p.formatoArte === 'Video' && p.videoDetails) {
      vids++;
      const toolName = String(p.videoDetails.videoAITool || '').trim();
      const tool = VIDEO_AI_TOOLS.find((t) => t.name === toolName);
      
      const numEscenasParsed = parseInt(String(p.videoDetails.numEscenas)) || 1;
      const esc = Math.max(1, numEscenasParsed);
      const c = (tool ? tool.credits : 300) * esc;
      
      total += c;
      const nm = tool ? tool.name : (toolName || 'Video AI');
      porTool[nm] = (porTool[nm] || 0) + c;
    } else {
      imgs++;
      total += 1;
    }
  });
  
  const min = total;
  const max = Math.round(total * 1.4);
  const det = Object.keys(porTool).map((k) => k + ': ' + porTool[k]).join(' · ');
  const summary = 'Estimación: ' + min.toLocaleString() + '–' + max.toLocaleString() + ' créditos · ' + imgs + ' imágenes (1 c/u) y ' + vids + ' videos' + (det ? ' (' + det + ')' : '') + '. El rango superior contempla retomas.';
  
  return { min, max, summary };
}
