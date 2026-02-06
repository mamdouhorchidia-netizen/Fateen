import { tokenize } from "./tokenize";

export function tokenOverlapScore(query: string, doc: string): number {
  const q = new Set(tokenize(query));
  if (q.size === 0) return 0;
  const d = tokenize(doc);
  let score = 0;
  for (const t of d) if (q.has(t)) score += 1;
  return score;
}
