import { Router } from "express";
import { z } from "zod";
import { getCachedSheet } from "./sharedCache";
import { retrieveEvidence } from "../retrieval/retrieve";
import { detectIntent } from "../analytics/intent";
import { normalizeScope } from "../analytics/filters";
import {
  stockLookup, stockSummary, targetVsAchieved, topUnderTarget, coveragePercent, avgVisits, trendMoM
} from "../analytics/aggregations";
import { Analysis } from "../analytics/schema";
import { buildSystemPrompt, buildUserPrompt } from "../ai/promptBuilder";
import { OpenAIChatClient } from "../ai/llm";
import { needsRefusal, REFUSAL, postValidateResponse } from "../ai/guardrails";
import { insertAudit } from "../audit/store";
import crypto from "crypto";
import { writeSettingValue } from "../sheets/loader";
import { requireAdmin } from "../auth/middleware";

export const chatRouter = Router();

const ChatBody = z.object({
  question: z.string().min(1).max(1000),
  userId: z.string().min(1).max(100),
  role: z.enum(["admin","user"]),
});

function computeAnalysis(intent: string, data: any, scope: any): Analysis | null {
  switch (intent) {
    case "stock_lookup": return stockLookup(data, scope);
    case "stock_summary": return stockSummary(data);
    case "target_vs_achieved": return targetVsAchieved(data, scope);
    case "top_under_target": return topUnderTarget(data, scope);
    case "coverage_percent": return coveragePercent(data, scope);
    case "avg_visits": return avgVisits(data, scope);
    case "trend_mom": return trendMoM(data, scope);
    default: return null;
  }
}

chatRouter.post("/", async (req, res) => {
  const parsed = ChatBody.safeParse(req.body);
  if (!parsed.success) return res.status(400).json({ error: "Invalid body", details: parsed.error.flatten() });

  // Trust middleware for role/user; but keep body for demo parity
  const user = req.user!;
  const { question } = parsed.data;

  const { data, settings } = await getCachedSheet();

  const intent = detectIntent(question);
  const { rows: evidence, selectedTabs, filters } = retrieveEvidence({
    question,
    data,
    maxRows: settings.max_rows_context,
    minScore: settings.min_retrieval_score,
  });

  const scope = normalizeScope(filters);
  // Add small analytics knobs from question (top K / group by)
  if (question.toLowerCase().includes("top ")) {
    const m = question.match(/top\s+(\d+)/i);
    if (m) scope.top_k = Number(m[1]);
  }
  if (question.toLowerCase().includes("by product")) scope.group_by = "product";
  if (question.toLowerCase().includes("by brick")) scope.group_by = "brick";
  if (question.toLowerCase().includes("by territory")) scope.group_by = "territory";
  if (question.toLowerCase().includes("by rep")) scope.group_by = "rep";

  const analysis = computeAnalysis(intent, data, scope);

  const hasEvidence = evidence.length > 0;
  const hasAnalysis = !!analysis;

  const refusalExpected = needsRefusal(hasEvidence, hasAnalysis);

  let responseText = "";
  if (refusalExpected) {
    responseText = REFUSAL;
  } else {
    const llm = new OpenAIChatClient();
    const system = buildSystemPrompt(settings);
    const userPrompt = buildUserPrompt({
      question,
      evidenceRows: evidence.map(e => e.row),
      analysis: analysis,
    });
    responseText = await llm.complete(system, userPrompt);
  }

  const sources = Array.from(new Map(
    [...evidence.map(e => e.ref), ...(analysis?.sources ?? [])].map(s => [`${s.tab}:${s.rowNumber}`, s])
  ).values());

  const validated = postValidateResponse({ responseText, refusalExpected, sources });

  const id = crypto.randomUUID();
  insertAudit({
    id,
    timestamp: new Date().toISOString(),
    userId: user.userId,
    role: user.role,
    question,
    selectedTabs,
    retrievedRowRefs: evidence.map(e => e.ref),
    analysis: analysis,
    response: validated.safeText,
    refusalFlag: validated.refusalFlag,
  });

  res.json({
    answer: validated.safeText,
    sources: groupSources(sources),
    analysis: analysis,
    auditId: id,
    settings: user.role === "admin" ? { meta_prompt: settings.meta_prompt, assistant_name: settings.assistant_name } : undefined,
  });
});

function groupSources(sources: Array<{tab:any; rowNumber:number}>): Array<{tab:string; rowNumbers:number[]}> {
  const m = new Map<string, Set<number>>();
  for (const s of sources) {
    const set = m.get(s.tab) ?? new Set<number>();
    set.add(s.rowNumber);
    m.set(s.tab, set);
  }
  return Array.from(m.entries()).map(([tab,set]) => ({ tab, rowNumbers: Array.from(set).sort((a,b)=>a-b) }));
}

// Admin-only endpoint to update meta_prompt in the Google Sheet settings tab.
chatRouter.post("/settings/meta_prompt", requireAdmin, async (req, res) => {
  const Body = z.object({ meta_prompt: z.string().min(1).max(10000) });
  const parsed = Body.safeParse(req.body);
  if (!parsed.success) return res.status(400).json({ error: "Invalid body", details: parsed.error.flatten() });

  await writeSettingValue("meta_prompt", parsed.data.meta_prompt);
  res.json({ ok: true });
});
