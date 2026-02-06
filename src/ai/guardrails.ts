import { RowRef } from "../sheets/types";

export const REFUSAL = "Not available in the current Google Sheet data.";

export function needsRefusal(hasEvidence: boolean, hasAnalysis: boolean): boolean {
  return !hasEvidence && !hasAnalysis;
}

export function buildGuardrailSystemPrompt(): string {
  return [
    "You are a strictly grounded assistant.",
    `You MUST answer ONLY using the provided Evidence JSON rows and/or the provided Analysis JSON. No external knowledge.`,
    `If the answer cannot be derived, respond EXACTLY with: "${REFUSAL}"`,
    "Output format MUST be exactly:",
    "1. Answer (short)",
    "2. Key numbers (bullets)",
    '3. Sources (bullets: "tab: <name>, rows: <comma-separated row numbers>")',
    "If refusing, output ONLY the refusal sentence and nothing else.",
  ].join("\n");
}

export function postValidateResponse(params: {
  responseText: string;
  refusalExpected: boolean;
  sources: RowRef[];
}): { safeText: string; refusalFlag: boolean } {
  const t = params.responseText.trim();
  const hasRefusal = t === REFUSAL;
  if (params.refusalExpected) {
    return { safeText: REFUSAL, refusalFlag: true };
  }

  // Must include Sources section if not refusing
  const hasSources = /\n\s*Sources\s*\n/i.test(t) || /\n\s*Sources\s*:/i.test(t);
  if (!hasSources) {
    // Safe fallback: deterministic response listing sources and no extra claims
    const grouped = groupSources(params.sources);
    const srcLines = grouped.map(g => `- tab: ${g.tab}, rows: ${g.rowNumbers.join(", ")}`);
    const safe = [
      "Answer",
      "I can answer using the provided Google Sheet evidence and computed analysis.",
      "",
      "Key numbers",
      "- (see Analysis JSON in UI)",
      "",
      "Sources",
      ...srcLines,
    ].join("\n");
    return { safeText: safe, refusalFlag: false };
  }

  // If model outputs refusal unexpectedly, keep it (safe)
  if (hasRefusal) return { safeText: REFUSAL, refusalFlag: true };

  return { safeText: t, refusalFlag: false };
}

function groupSources(sources: RowRef[]): Array<{tab:string; rowNumbers:number[]}> {
  const m = new Map<string, Set<number>>();
  for (const s of sources) {
    const set = m.get(s.tab) ?? new Set<number>();
    set.add(s.rowNumber);
    m.set(s.tab, set);
  }
  return Array.from(m.entries()).map(([tab,set]) => ({ tab, rowNumbers: Array.from(set).sort((a,b)=>a-b) }));
}
