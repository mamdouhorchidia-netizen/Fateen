import { LoadedSheetData, RowRef, TabName } from "../sheets/types";
import { tokenOverlapScore } from "./scorer";
import { tokenize } from "./tokenize";
import { canonicalize, buildCanonicalMap } from "../sheets/normalize";

export type RetrievalFilters = Partial<{
  month: string;
  week: string;
  territory: string;
  brick: string;
  rep: string;
  product: string;
  distributor: string;
}>;

export type RetrievedRow = { ref: RowRef; score: number; row: any };

function guessFilters(question: string, canonMap: Map<string,string>): RetrievalFilters {
  const q = question.toLowerCase();

  const pickAfter = (label: string): string | null => {
    const re = new RegExp(`${label}[:\s]+([a-z0-9\-_/ ]{2,40})`, "i");
    const m = question.match(re);
    return m ? m[1].trim() : null;
  };

  const month = pickAfter("month");
  const week = pickAfter("week");
  const territory = pickAfter("territory");
  const brick = pickAfter("brick");
  const rep = pickAfter("rep");
  const product = pickAfter("product");
  const distributor = pickAfter("distributor");

  const out: RetrievalFilters = {};
  if (month) out.month = month;
  if (week) out.week = week;
  if (territory) out.territory = canonicalize(territory, canonMap);
  if (brick) out.brick = canonicalize(brick, canonMap);
  if (rep) out.rep = canonicalize(rep, canonMap);
  if (product) out.product = canonicalize(product, canonMap);
  if (distributor) out.distributor = canonicalize(distributor, canonMap);

  // heuristic: if question includes a single token that matches canonical entries
  const toks = tokenize(question);
  for (const t of toks) {
    const c = canonMap.get(t);
    if (c && !out.product) out.product = c;
  }

  return out;
}

function rowToText(row: any): string {
  return Object.entries(row)
    .filter(([k]) => !k.startsWith("__"))
    .map(([, v]) => String(v ?? ""))
    .join(" ");
}

function tabCandidates(question: string): TabName[] {
  const q = question.toLowerCase();
  const tabs: TabName[] = [];
  const has = (s: string) => q.includes(s);

  if (has("stock") || has("quantity") || has("sku") || has("inventory")) tabs.push("stock");
  if (has("target") || has("achieved") || has("sales") || has("month") || has("brick") || has("territory")) tabs.push("sales");
  if (has("crm") || has("visit") || has("coverage") || has("doctor") || has("week")) tabs.push("crm");

  // fallback: if none, search across business tabs
  if (tabs.length === 0) return ["stock","sales","crm"];
  return Array.from(new Set(tabs));
}

function applyFilters(rows: any[], filters: RetrievalFilters, tab: TabName): any[] {
  const f = filters;
  return rows.filter(r => {
    if (tab === "sales") {
      if (f.month && String(r.month).toLowerCase() !== f.month.toLowerCase()) return false;
      if (f.territory && r.territory !== f.territory) return false;
      if (f.brick && r.brick !== f.brick) return false;
      if (f.rep && r.rep !== f.rep) return false;
      if (f.product && r.product !== f.product) return false;
    }
    if (tab === "crm") {
      if (f.week && String(r.week).toLowerCase() !== f.week.toLowerCase()) return false;
      if (f.territory && r.territory !== f.territory) return false;
      if (f.rep && r.rep !== f.rep) return false;
    }
    if (tab === "stock") {
      if (f.distributor && r.distributor !== f.distributor) return false;
      if (f.product && r.product !== f.product) return false;
    }
    return true;
  });
}

export function retrieveEvidence(params: {
  question: string;
  data: LoadedSheetData;
  maxRows: number;
  minScore: number;
}): { rows: RetrievedRow[]; selectedTabs: TabName[]; filters: RetrievalFilters } {
  const canonMap = buildCanonicalMap(params.data.glossary);
  const filters = guessFilters(params.question, canonMap);
  const selectedTabs = tabCandidates(params.question);

  const all: RetrievedRow[] = [];
  for (const tab of selectedTabs) {
    const rows = applyFilters((params.data as any)[tab] as any[], filters, tab);
    for (const r of rows) {
      const score = tokenOverlapScore(params.question, rowToText(r));
      all.push({ ref: { tab, rowNumber: r.__rowNumber }, score, row: r });
    }
  }

  const kept = all
    .filter(x => x.score >= params.minScore)
    .sort((a,b) => b.score - a.score || a.ref.rowNumber - b.ref.rowNumber)
    .slice(0, params.maxRows);

  return { rows: kept, selectedTabs, filters };
}
