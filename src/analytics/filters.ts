import { RetrievalFilters } from "../retrieval/retrieve";

export function normalizeScope(filters: RetrievalFilters): Record<string, any> {
  const scope: Record<string, any> = {};
  for (const [k,v] of Object.entries(filters)) {
    if (v !== undefined && v !== null && String(v).trim() !== "") scope[k] = v;
  }
  return scope;
}
