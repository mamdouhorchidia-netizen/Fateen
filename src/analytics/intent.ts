export type Intent =
  | "stock_lookup"
  | "stock_summary"
  | "target_vs_achieved"
  | "top_under_target"
  | "coverage_percent"
  | "avg_visits"
  | "trend_mom"
  | "unknown";

export function detectIntent(question: string): Intent {
  const q = question.toLowerCase();

  const has = (...k: string[]) => k.some(x => q.includes(x));

  if (has("stock", "inventory", "quantity", "sku")) {
    if (has("summary", "total", "by distributor", "by product")) return "stock_summary";
    return "stock_lookup";
  }

  if (has("target", "achieved", "achievement")) {
    if (has("top", "worst", "under", "below")) return "top_under_target";
    return "target_vs_achieved";
  }

  if (has("coverage", "coverage_flag")) return "coverage_percent";
  if (has("average visits", "avg visits", "visits per")) return "avg_visits";
  if (has("trend", "month over month", "mom")) return "trend_mom";

  return "unknown";
}
