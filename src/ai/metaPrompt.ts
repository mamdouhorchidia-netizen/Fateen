import { Settings } from "../sheets/types";

export function getMetaPrompt(settings: Settings): string {
  return settings.meta_prompt?.trim() || "You are a grounded assistant.";
}
