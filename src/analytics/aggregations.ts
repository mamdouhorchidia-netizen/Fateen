import { LoadedSheetData, SalesRow, StockRow, CrmRow, RowRef } from "../sheets/types";
import { Analysis } from "./schema";
import { sum, pct, rowRefs } from "./kpis";

export function stockLookup(data: LoadedSheetData, scope: any): Analysis | null {
  const rows = data.stock.filter(r => {
    if (scope.distributor && r.distributor !== scope.distributor) return false;
    if (scope.product && r.product !== scope.product) return false;
    if (scope.sku && r.sku !== scope.sku) return false;
    return true;
  });
  if (rows.length === 0) return null;

  const totalQty = sum(rows.map(r => r.quantity));
  return {
    type: "stock_lookup",
    scope,
    metrics: { total_quantity: totalQty, rows: rows.length },
    table: rows.slice(0, 50).map(r => ({
      distributor: r.distributor, product: r.product, sku: r.sku, quantity: r.quantity, last_updated: r.last_updated
    })),
    notes: ["Stock rows are listed; totals are sum(quantity) over matched rows."],
    sources: rowRefs(rows),
  };
}

export function stockSummary(data: LoadedSheetData): Analysis | null {
  if (data.stock.length === 0) return null;
  const byKey = new Map<string, {distributor:string; product:string; total:number; sources:RowRef[]}>();
  for (const r of data.stock) {
    const key = `${r.distributor}||${r.product}`;
    const cur = byKey.get(key) ?? { distributor: r.distributor, product: r.product, total: 0, sources: [] };
    cur.total += (typeof r.quantity === "number" ? r.quantity : 0);
    cur.sources.push({ tab: "stock", rowNumber: r.__rowNumber });
    byKey.set(key, cur);
  }
  const table = Array.from(byKey.values()).sort((a,b) => b.total - a.total).slice(0, 50);
  return {
    type: "stock_summary",
    scope: {},
    metrics: { unique_pairs: byKey.size },
    table: table.map(x => ({ distributor: x.distributor, product: x.product, total_quantity: x.total })),
    notes: ["Summary is aggregated by (distributor, product)."],
    sources: Array.from(new Set(table.flatMap(x => x.sources.map(s => `${s.tab}:${s.rowNumber}`)))).map(s=>{
      const [tab,row]=s.split(":"); return {tab:tab as any,rowNumber:Number(row)};
    }),
  };
}

export function targetVsAchieved(data: LoadedSheetData, scope: any): Analysis | null {
  const rows = data.sales.filter(r => {
    if (scope.month && r.month.toLowerCase() !== String(scope.month).toLowerCase()) return false;
    if (scope.territory && r.territory !== scope.territory) return false;
    if (scope.brick && r.brick !== scope.brick) return false;
    if (scope.rep && r.rep !== scope.rep) return false;
    if (scope.product && r.product !== scope.product) return false;
    return true;
  });
  if (rows.length === 0) return null;

  const totalTarget = sum(rows.map(r => r.target));
  const totalAchieved = sum(rows.map(r => r.achieved));
  const achievementPct = pct(totalAchieved, totalTarget);

  return {
    type: "target_vs_achieved",
    scope,
    metrics: { target: totalTarget, achieved: totalAchieved, achievement_pct: achievementPct },
    table: rows.slice(0, 50).map(r => ({
      month: r.month, territory: r.territory, brick: r.brick, rep: r.rep, product: r.product,
      target: r.target, achieved: r.achieved
    })),
    notes: ["Totals are summed across matched sales rows."],
    sources: rowRefs(rows),
  };
}

export function topUnderTarget(data: LoadedSheetData, scope: any): Analysis | null {
  const month = scope.month;
  const rows = data.sales.filter(r => !month || r.month.toLowerCase() === String(month).toLowerCase());
  if (rows.length === 0) return null;

  const groupBy = (scope.group_by as string) || (scope.territory ? "brick" : "territory"); // heuristic
  const keyOf = (r: SalesRow) => {
    if (groupBy === "product") return r.product;
    if (groupBy === "brick") return r.brick;
    return r.territory;
  };

  const by = new Map<string, {key:string; target:number; achieved:number; sources:RowRef[]}>();
  for (const r of rows) {
    const key = keyOf(r) || "(blank)";
    const cur = by.get(key) ?? { key, target: 0, achieved: 0, sources: [] };
    cur.target += (typeof r.target === "number" ? r.target : 0);
    cur.achieved += (typeof r.achieved === "number" ? r.achieved : 0);
    cur.sources.push({ tab: "sales", rowNumber: r.__rowNumber });
    by.set(key, cur);
  }

  const table = Array.from(by.values())
    .map(x => ({ ...x, achievement_pct: pct(x.achieved, x.target), gap: x.target - x.achieved }))
    .sort((a,b) => (b.gap - a.gap));

  const topK = Number(scope.top_k ?? 5);
  const top = table.slice(0, topK);

  return {
    type: "top_under_target",
    scope: { month: month ?? null, group_by: groupBy, top_k: topK },
    metrics: { groups: by.size },
    table: top.map(x => ({ group: x.key, target: x.target, achieved: x.achieved, gap: x.gap, achievement_pct: x.achievement_pct })),
    notes: ["Gap = target - achieved. Sorted by largest gap."],
    sources: Array.from(new Set(top.flatMap(x => x.sources.map(s => `${s.tab}:${s.rowNumber}`)))).map(s=>{
      const [tab,row]=s.split(":"); return {tab:tab as any,rowNumber:Number(row)};
    }),
  };
}

export function coveragePercent(data: LoadedSheetData, scope: any): Analysis | null {
  const rows = data.crm.filter(r => {
    if (scope.week && r.week.toLowerCase() !== String(scope.week).toLowerCase()) return false;
    if (scope.territory && r.territory !== scope.territory) return false;
    if (scope.rep && r.rep !== scope.rep) return false;
    return true;
  });
  if (rows.length === 0) return null;

  const groupBy = (scope.group_by as string) || (scope.rep ? "rep" : "territory");
  const keyOf = (r: CrmRow) => groupBy === "rep" ? r.rep : r.territory;

  const by = new Map<string, {key:string; covered:number; total:number; sources:RowRef[]}>();
  for (const r of rows) {
    const key = keyOf(r) || "(blank)";
    const cur = by.get(key) ?? { key, covered: 0, total: 0, sources: [] };
    cur.total += 1;
    if (r.coverage_flag === true) cur.covered += 1;
    cur.sources.push({ tab: "crm", rowNumber: r.__rowNumber });
    by.set(key, cur);
  }

  const table = Array.from(by.values())
    .map(x => ({ group: x.key, coverage_pct: pct(x.covered, x.total), covered: x.covered, total: x.total, sources: x.sources }))
    .sort((a,b) => (b.coverage_pct ?? 0) - (a.coverage_pct ?? 0))
    .slice(0, 50);

  return {
    type: "coverage_percent",
    scope: { ...scope, group_by: groupBy },
    metrics: { groups: by.size },
    table: table.map(x => ({ group: x.group, coverage_pct: x.coverage_pct, covered: x.covered, total: x.total })),
    notes: ["Coverage% = covered / total (rows where coverage_flag is true)."],
    sources: Array.from(new Set(table.flatMap(x => x.sources.map(s => `${s.tab}:${s.rowNumber}`)))).map(s=>{
      const [tab,row]=s.split(":"); return {tab:tab as any,rowNumber:Number(row)};
    }),
  };
}

export function avgVisits(data: LoadedSheetData, scope: any): Analysis | null {
  const rows = data.crm.filter(r => {
    if (scope.week && r.week.toLowerCase() !== String(scope.week).toLowerCase()) return false;
    if (scope.territory && r.territory !== scope.territory) return false;
    if (scope.rep && r.rep !== scope.rep) return false;
    return true;
  });
  if (rows.length === 0) return null;

  const valid = rows.filter(r => typeof r.visits === "number");
  const totalVisits = sum(valid.map(r => r.visits));

  const uniqueDoctors = new Set(valid.map(r => r.doctor)).size;
  const uniqueReps = new Set(valid.map(r => r.rep)).size;

  const avgPerDoctor = uniqueDoctors ? totalVisits / uniqueDoctors : null;
  const avgPerRep = uniqueReps ? totalVisits / uniqueReps : null;

  return {
    type: "avg_visits",
    scope,
    metrics: { total_visits: totalVisits, unique_doctors: uniqueDoctors, unique_reps: uniqueReps, avg_visits_per_doctor: avgPerDoctor, avg_visits_per_rep: avgPerRep },
    table: [],
    notes: ["Averages are based on rows with numeric visits."],
    sources: rowRefs(rows),
  };
}

export function trendMoM(data: LoadedSheetData, scope: any): Analysis | null {
  const rows = data.sales.filter(r => {
    if (scope.territory && r.territory !== scope.territory) return false;
    if (scope.brick && r.brick !== scope.brick) return false;
    if (scope.rep && r.rep !== scope.rep) return false;
    if (scope.product && r.product !== scope.product) return false;
    return true;
  });
  if (rows.length === 0) return null;

  const byMonth = new Map<string, {month:string; target:number; achieved:number; sources:RowRef[]}>();
  for (const r of rows) {
    const m = r.month || "(blank)";
    const cur = byMonth.get(m) ?? { month: m, target: 0, achieved: 0, sources: [] };
    cur.target += (typeof r.target === "number" ? r.target : 0);
    cur.achieved += (typeof r.achieved === "number" ? r.achieved : 0);
    cur.sources.push({ tab: "sales", rowNumber: r.__rowNumber });
    byMonth.set(m, cur);
  }

  const table = Array.from(byMonth.values())
    .map(x => ({ ...x, achievement_pct: pct(x.achieved, x.target) }))
    .sort((a,b) => a.month.localeCompare(b.month)); // tolerant, assumes sortable labels like 2025-01

  return {
    type: "trend_mom",
    scope,
    metrics: { months: byMonth.size },
    table: table.map(x => ({ month: x.month, target: x.target, achieved: x.achieved, achievement_pct: x.achievement_pct })),
    notes: ["Sorted by month string; prefer ISO-like months (e.g., 2025-01)."],
    sources: Array.from(new Set(table.flatMap(x => x.sources.map(s => `${s.tab}:${s.rowNumber}`)))).map(s=>{
      const [tab,row]=s.split(":"); return {tab:tab as any,rowNumber:Number(row)};
    }),
  };
}
