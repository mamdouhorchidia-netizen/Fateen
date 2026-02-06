import dotenv from "dotenv";
dotenv.config();

export type Role = "admin" | "user";

function must(name: string): string {
  const v = process.env[name];
  if (!v) throw new Error(`Missing env var ${name}`);
  return v;
}

export const config = {
  port: Number(process.env.PORT ?? 8080),
  nodeEnv: process.env.NODE_ENV ?? "development",
  frontendOrigin: process.env.FRONTEND_ORIGIN ?? "http://localhost:3000",

  adminUser: must("ADMIN_USER"),
  adminPass: must("ADMIN_PASS"),
  userUser: must("USER_USER"),
  userPass: must("USER_PASS"),

  sheetId: must("GOOGLE_SHEET_ID"),
  // Service account JSON pasted as a single-line JSON string in env
  serviceAccountJson: must("GOOGLE_SERVICE_ACCOUNT_JSON"),

  openaiApiKey: must("OPENAI_API_KEY"),
  openaiModel: process.env.OPENAI_MODEL ?? "gpt-4.1-mini",

  defaults: {
    cacheTtlSeconds: Number(process.env.DEFAULT_CACHE_TTL_SECONDS ?? 120),
    maxRowsContext: Number(process.env.DEFAULT_MAX_ROWS_CONTEXT ?? 12),
    minRetrievalScore: Number(process.env.DEFAULT_MIN_RETRIEVAL_SCORE ?? 2),
  },
};
