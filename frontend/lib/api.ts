import { ChatResponse, AuditEntry } from "./types";
import { StoredAuth, basicAuthHeader } from "./auth";

const BASE = process.env.NEXT_PUBLIC_BACKEND_URL ?? "http://localhost:8080";

async function apiFetch(path: string, auth: StoredAuth, init?: RequestInit) {
  const res = await fetch(`${BASE}${path}`, {
    ...init,
    headers: {
      "Content-Type": "application/json",
      "Authorization": basicAuthHeader(auth),
      ...(init?.headers || {}),
    },
    cache: "no-store",
  });
  if (!res.ok) {
    const text = await res.text();
    throw new Error(text || `HTTP ${res.status}`);
  }
  return res;
}

export async function chat(question: string, auth: StoredAuth): Promise<ChatResponse> {
  const res = await apiFetch("/api/chat", auth, {
    method: "POST",
    body: JSON.stringify({ question, userId: auth.username, role: auth.role }),
  });
  return res.json();
}

export async function refresh(auth: StoredAuth): Promise<void> {
  await apiFetch("/api/refresh", auth, { method: "POST", body: "{}" });
}

export async function getAudit(auth: StoredAuth): Promise<AuditEntry[]> {
  const res = await apiFetch("/api/audit", auth, { method: "GET" });
  const j = await res.json();
  return j.entries as AuditEntry[];
}

export async function updateMetaPrompt(meta_prompt: string, auth: StoredAuth): Promise<void> {
  await apiFetch("/api/chat/settings/meta_prompt", auth, {
    method: "POST",
    body: JSON.stringify({ meta_prompt }),
  });
}
