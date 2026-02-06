import { TabName, LoadedSheetData, Settings, GlossaryRow } from "./types";
import { config } from "../config";

function toNumber(v: unknown): number | null {
  if (v === null || v === undefined) return null;
  const s = String(v).trim();
  if (!s) return null;
  const n = Number(s.replace(/,/g, ""));
  return Number.isFinite(n) ? n : null;
}

function toBool(v: unknown): boolean | null {
  if (v === null || v === undefined) return null;
  const s = String(v).trim().toLowerCase();
  if (!s) return null;
  if (["true","yes","y","1"].includes(s)) return true;
  if (["false","no","n","0"].includes(s)) return false;
  return null;
}

function normStr(v: unknown): string {
  return String(v ?? "").trim();
}

export function buildCanonicalMap(glossary: GlossaryRow[]) {
  const map = new Map<string, string>();
  for (const row of glossary) {
    const canonical = normStr(row.canonical || row.term);
    const term = normStr(row.term);
    if (term) map.set(term.toLowerCase(), canonical);
    const syns = normStr(row.synonyms)
      .split(",")
      .map(x => x.trim())
      .filter(Boolean);
    for (const s of syns) map.set(s.toLowerCase(), canonical);
  }
  return map;
}

export function canonicalize(value: string, canonMap: Map<string,string>): string {
  const v = value.trim();
  if (!v) return v;
  return canonMap.get(v.toLowerCase()) ?? v;
}

export function normalizeLoadedData(raw: LoadedSheetData): LoadedSheetData {
  const canonMap = buildCanonicalMap(raw.glossary);

  const stock = raw.stock.map(r => ({
    ...r,
    distributor: canonicalize(r.distributor, canonMap),
    product: canonicalize(r.product, canonMap),
    sku: normStr(r.sku),
    quantity: toNumber(r.quantity),
    last_updated: normStr(r.last_updated),
  }));

  const sales = raw.sales.map(r => ({
    ...r,
    month: normStr(r.month),
    territory: canonicalize(r.territory, canonMap),
    brick: canonicalize(r.brick, canonMap),
    rep: canonicalize(r.rep, canonMap),
    product: canonicalize(r.product, canonMap),
    target: toNumber(r.target),
    achieved: toNumber(r.achieved),
  }));

  const crm = raw.crm.map(r => ({
    ...r,
    week: normStr(r.week),
    territory: canonicalize(r.territory, canonMap),
    rep: canonicalize(r.rep, canonMap),
    doctor: canonicalize(r.doctor, canonMap),
    specialty: canonicalize(r.specialty, canonMap),
    visits: toNumber(r.visits),
    coverage_flag: toBool(r.coverage_flag),
  }));

  return { ...raw, stock, sales, crm };
}

export function parseSettings(settingsRows: {key:string; value:string}[]): Settings {
  const kv = new Map(settingsRows.map(r => [r.key, r.value]));
  const num = (k: string, d: number) => {
    const v = kv.get(k);
    const n = v ? Number(String(v).trim()) : NaN;
    return Number.isFinite(n) ? n : d;
  };
  const str = (k: string, d: string) => (kv.get(k)?.trim() || d);

  return {
    meta_prompt: str("meta_prompt", "You are a grounded assistant."),
    assistant_name: str("assistant_name", "Fateen"),
    grounding_mode: (str("grounding_mode", "strict") as "strict"),
    cache_ttl_seconds: num("cache_ttl_seconds", config.defaults.cacheTtlSeconds),
    max_rows_context: num("max_rows_context", config.defaults.maxRowsContext),
    min_retrieval_score: num("min_retrieval_score", config.defaults.minRetrievalScore),
    answer_language: (str("answer_language", "en") as "en"),
  };
}

export function validateTabName(name: string): TabName | null {
  const n = name as TabName;
  return ["settings","stock","sales","crm","glossary"].includes(n) ? n : null;
}
