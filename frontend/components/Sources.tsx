"use client";

import React, { useState } from "react";
import { Source } from "../lib/types";

export function Sources({ sources }: { sources: Source[] }) {
  const [open, setOpen] = useState(false);
  if (!sources || sources.length === 0) return null;

  return (
    <div style={{ marginTop: 10 }}>
      <button onClick={() => setOpen(!open)} style={btn}>
        {open ? "Hide sources" : "Show sources"}
      </button>
      {open && (
        <div style={panel}>
          {sources.map((s, idx) => (
            <div key={idx} style={{ marginBottom: 6 }}>
              <b>{s.tab}</b>: rows {s.rowNumbers.join(", ")}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

const btn: React.CSSProperties = {
  padding: "8px 10px",
  borderRadius: 10,
  border: "1px solid #1f2937",
  background: "#0b1220",
  color: "#e5e7eb",
  cursor: "pointer",
};

const panel: React.CSSProperties = {
  marginTop: 8,
  padding: 10,
  borderRadius: 10,
  border: "1px solid #1f2937",
  background: "#0b1220",
  color: "#e5e7eb",
};
