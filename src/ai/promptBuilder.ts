import { Settings } from "../sheets/types";
import { getMetaPrompt } from "./metaPrompt";
import { buildGuardrailSystemPrompt } from "./guardrails";

export function buildSystemPrompt(settings: Settings): string {
  return [
    getMetaPrompt(settings),
    "",
    buildGuardrailSystemPrompt(),
  ].join("\n");
}

export function buildUserPrompt(params: {
  question: string;
  evidenceRows: any[];
  analysis: any | null;
}): string {
  return [
    `User question:\n${params.question}`,
    "",
    `Evidence JSON rows (may be empty):\n${JSON.stringify(params.evidenceRows, null, 2)}`,
    "",
    `Analysis JSON (may be null):\n${JSON.stringify(params.analysis, null, 2)}`,
  ].join("\n");
}
