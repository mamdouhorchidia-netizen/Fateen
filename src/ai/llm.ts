import OpenAI from "openai";
import { config } from "../config";

export interface ChatCompletionClient {
  complete(system: string, user: string): Promise<string>;
}

export class OpenAIChatClient implements ChatCompletionClient {
  private client: OpenAI;
  constructor() {
    this.client = new OpenAI({ apiKey: config.openaiApiKey });
  }
  async complete(system: string, user: string): Promise<string> {
    const resp = await this.client.chat.completions.create({
      model: config.openaiModel,
      temperature: 0,
      messages: [
        { role: "system", content: system },
        { role: "user", content: user },
      ],
    });
    const text = resp.choices?.[0]?.message?.content ?? "";
    return text;
  }
}

/**
 * Adapter interface so a Gemini client could be swapped in later:
 * - Implement ChatCompletionClient.complete(system, user)
 */
