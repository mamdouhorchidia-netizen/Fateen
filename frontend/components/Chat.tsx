"use client";

import React, { useEffect, useMemo, useState } from "react";
import { Message } from "./Message";
import { Sources } from "./Sources";
import { RefreshButton } from "./RefreshButton";
import { StoredAuth, clearAuth } from "../lib/auth";
import { chat } from "../lib/api";
import { AdminPromptEditor } from "./AdminPromptEditor";

type Msg = { role: "user" | "assistant"; text: string; sources?: any; analysis?: any };

export function Chat({ auth }: { auth: StoredAuth }) {
  const [msgs, setMsgs] = useState<Msg[]>([]);
  const [q, setQ] = useState("");
  const [loading, setLoading] = useState(false);
  const [lastSources, setLastSources] = useState<any[]>([]);
  const [lastAnalysis, setLastAnalysis] = useState<any>(null);
  const [metaPrompt, setMetaPrompt] = useState<string>("");

  const assistantName = useMemo(() => "Fateen", []);

  useEffect(() => {
    setMsgs([{ role: "assistant", text: `Hi — I’m ${assistantName}. Ask questions grounded ONLY in the connected Google Sheet.` }]);
  }, [assistantName]);

  async function send() {
    const question = q.trim();
    if (!question) return;
    setQ("");
    setLoading(true);
    setMsgs(m => [...m, { role: "user", text: question }]);
    try {
      const resp = await chat(question, auth);
      setLastSources(resp.sources || []);
      setLastAnalysis(resp.analysis ?? null);
      if (resp.settings?.meta_prompt) setMetaPrompt(resp.settings.meta_prompt);
      setMsgs(m => [...m, { role: "assistant", text: resp.answer, sources: resp.sources, analysis: resp.analysis }]);
    } catch (e: any) {
      setMsgs(m => [...m, { role: "assistant", text: `Error: ${e.message ?? String(e)}` }]);
    } finally {
      setLoading(false);
    }
  }

  return (
    <div style={layout}>
      <div style={topbar}>
        <div style={{ fontWeight: 700 }}>Sheets-grounded AI assistant demo</div>
        <div style={{ display: "flex", gap: 10, alignItems: "center" }}>
          <RefreshButton auth={auth} />
          <button style={btn} onClick={() => { clearAuth(); location.reload(); }}>Logout</button>
        </div>
      </div>

      <div style={content}>
        <div style={chatCol}>
          <div style={chatBox}>
            {msgs.map((m, idx) => <Message key={idx} role={m.role} text={m.text} />)}
            {loading && <div style={{ opacity: 0.8 }}>Thinking…</div>}
          </div>

          <div style={composer}>
            <input
              value={q}
              onChange={(e) => setQ(e.target.value)}
              onKeyDown={(e) => { if (e.key === "Enter") send(); }}
              placeholder="Ask about stock, sales targets, CRM coverage, trends…"
              style={input}
              disabled={loading}
            />
            <button style={btn} onClick={send} disabled={loading}>Send</button>
          </div>

          <Sources sources={lastSources} />

          {lastAnalysis && (
            <details style={{ marginTop: 10 }}>
              <summary style={{ cursor: "pointer", color: "#e5e7eb" }}>Show analysis JSON</summary>
              <pre style={pre}>{JSON.stringify(lastAnalysis, null, 2)}</pre>
            </details>
          )}
        </div>

        {auth.role === "admin" && (
          <div style={adminCol}>
            <AdminPromptEditor auth={auth} initialMetaPrompt={metaPrompt || "Run one chat request to load meta_prompt."} />
          </div>
        )}
      </div>
    </div>
  );
}

const layout: React.CSSProperties = { minHeight: "100vh", background: "#030712", color: "#e5e7eb" };
const topbar: React.CSSProperties = { display: "flex", justifyContent: "space-between", padding: 14, borderBottom: "1px solid #1f2937" };
const content: React.CSSProperties = { display: "grid", gridTemplateColumns: "1fr", gap: 14, padding: 14 };
const chatCol: React.CSSProperties = { maxWidth: 900 };
const adminCol: React.CSSProperties = { maxWidth: 900 };

const chatBox: React.CSSProperties = {
  border: "1px solid #1f2937",
  background: "#060b18",
  padding: 14,
  borderRadius: 14,
  minHeight: 420,
};

const composer: React.CSSProperties = { display: "flex", gap: 10, marginTop: 10 };

const input: React.CSSProperties = {
  flex: 1,
  padding: 12,
  borderRadius: 10,
  border: "1px solid #1f2937",
  background: "#0b1220",
  color: "#e5e7eb",
};

const btn: React.CSSProperties = {
  padding: "10px 12px",
  borderRadius: 10,
  border: "1px solid #1f2937",
  background: "#111827",
  color: "#e5e7eb",
  cursor: "pointer",
};

const pre: React.CSSProperties = {
  marginTop: 10,
  padding: 12,
  borderRadius: 10,
  border: "1px solid #1f2937",
  background: "#0b1220",
  color: "#e5e7eb",
  overflow: "auto",
  maxHeight: 320,
};
