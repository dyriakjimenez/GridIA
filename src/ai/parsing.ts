export function tryParse(t: string): any | null {
  try { return JSON.parse(t); } catch (e) { return null; }
}

export function pendingClosers(prefix: string): string | null {
  const stack: string[] = [];
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

export function repairTruncatedJSON(t: string): any | null {
  const cuts: number[] = [];
  for (let i = t.length - 1; i >= 0 && cuts.length < 60; i--) {
    if (t[i] === '}') cuts.push(i);
  }
  for (const i of cuts) {
    const prefix = t.slice(0, i + 1);
    const closers = pendingClosers(prefix);
    if (closers === null) continue;
    const candidate = (prefix + closers).replace(/,(\\s*[}\\]])/g, '$1');
    const parsed = tryParse(candidate);
    if (parsed && Array.isArray(parsed.posts) && parsed.posts.length) return parsed;
  }
  return null;
}

export function parseGridJSON(text: string): any {
  let t = String(text).trim();
  const fence = t.match(/```(?:json)?\\s*([\\s\\S]*?)```/i);
  if (fence) t = fence[1].trim();
  const first = t.indexOf('{');
  if (first > 0) t = t.slice(first);
  const direct = tryParse(t.replace(/,(\\s*[}\\]])/g, '$1'));
  if (direct) return direct;
  const last = t.lastIndexOf('}');
  if (last !== -1) {
    const sliced = t.slice(0, last + 1).replace(/,(\\s*[}\\]])/g, '$1');
    const p2 = tryParse(sliced);
    if (p2) return p2;
  }
  const repaired = repairTruncatedJSON(t);
  if (repaired) { repaired._recuperado = true; return repaired; }
  throw new Error('JSON ilegible');
}

export function parseLista(text: string): any {
  let t = String(text).trim();
  const fence = t.match(/```(?:json)?\\s*([\\s\\S]*?)```/i);
  if (fence) t = fence[1].trim();
  const i = t.indexOf('[');
  const j = t.lastIndexOf(']');
  if (i === -1 || j === -1 || j < i) throw new Error('Sin lista');
  return JSON.parse(t.slice(i, j + 1).replace(/,(\\s*[}\\]])/g, '$1'));
}
