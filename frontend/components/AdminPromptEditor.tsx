"use client";

import React, { useEffect, useState } from "react";
import { StoredAuth } from "../lib/auth";
import { updateMetaPrompt, getAudit } from "../lib/api";
import { AuditEntry } from "../lib/types";

export function AdminPromptEditor({ auth, initialMetaPrompt }: { auth: StoredAuth; initialMetaPrompt: string }) {
  const [meta, setMeta] = useState(initialMetaPrompt);
  const [saving, setSaving] = useState(false);
  const [audit, setAudit] = useState<AuditEntry[]>([]);
  const [loadingAudit, setLoadingAudit] = useState(false);

  useEffect(() => { setMeta(initialMetaPrompt); }, [initialMetaPrompt]);

  return (
    <div style={card}>
      <h3 style={{ marginTop: 0 }}>Admin</h3>

      <div style={{ marginBottom: 8, fontWeight: 600 }}>META PROMPT (stored in Sheets → settings.meta_prompt)</div>
      <textarea
        value={meta}
        onChange={(e) => setMeta(e.target.value)}
        rows={8}
        style={textarea}
      />

      <div style={{ display: "flex", gap: 10, marginTop: 10 }}>
        <button
          style={btn}
          disabled={saving}
          onClick={async () => {
            setSaving(true);
            try {
              await updateMetaPrompt(meta, auth);
              alert("Saved to Google Sheet. Use Refresh to reload cache if needed.");
            } catch (e: any) {
              alert(e.message ?? String(e));
            } finally {
              setSaving(false);
            }
          }}
        >
          {saving ? "Saving…" : "Save meta_prompt"}
        </button>

        <button
          style={btn}
          disabled={loadingAudit}
          onClick={async () => {
            setLoadingAudit(true);
            try {
              const entries = await getAudit(auth);
              setAudit(entries);
            } catch (e: any) {
              alert(e.message ?? String(e));
            } finally {
              setLoadingAudit(false);
            }
          }}
        >
          {loadingAudit ? "Loading…" : "Load audit (last 50)"}
        </button>
      </div>

      {audit.length > 0 && (
        <div style={{ marginTop: 12 }}>
          <div style={{ fontWeight: 600, marginBottom: 6 }}>Audit</div>
          <div style={{ maxHeight: 260, overflow: "auto", border: "1px solid #1f2937", borderRadius: 10 }}>
            {audit.map((a) => (
              <div key={a.id} style={{ padding: 10, borderBottom: "1px solid #1f2937" }}>
                <div style={{ fontSize: 12, opacity: 0.8 }}>{a.timestamp} — {a.userId} ({a.role})</div>
                <div style={{ marginTop: 6 }}><b>Q:</b> {a.question}</div>
                <div style={{ marginTop: 6, whiteSpace: "pre-wrap" }}><b>A:</b> {a.response}</div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

const card: React.CSSProperties = {
  border: "1px solid #1f2937",
  background: "#0b1220",
  padding: 14,
  borderRadius: 14,
  color: "#e5e7eb",
};

const textarea: React.CSSProperties = {
  width: "100%",
  borderRadius: 10,
  border: "1px solid #1f2937",
  background: "#111827",
  color: "#e5e7eb",
  padding: 10,
  fontFamily: "ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, monospace",
};

const btn: React.CSSProperties = {
  padding: "10px 12px",
  borderRadius: 10,
  border: "1px solid #1f2937",
  background: "#111827",
  color: "#e5e7eb",
  cursor: "pointer",
};
