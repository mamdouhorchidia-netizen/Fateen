"use client";

import React, { useState } from "react";
import { StoredAuth } from "../lib/auth";
import { refresh } from "../lib/api";

export function RefreshButton({ auth, onRefreshed }: { auth: StoredAuth; onRefreshed?: () => void }) {
  const [loading, setLoading] = useState(false);

  return (
    <button
      style={btn}
      disabled={loading}
      onClick={async () => {
        setLoading(true);
        try {
          await refresh(auth);
          onRefreshed?.();
          alert("Data refreshed from Google Sheets.");
        } catch (e: any) {
          alert(e.message ?? String(e));
        } finally {
          setLoading(false);
        }
      }}
    >
      {loading ? "Refreshing…" : "Refresh data"}
    </button>
  );
}

const btn: React.CSSProperties = {
  padding: "10px 12px",
  borderRadius: 10,
  border: "1px solid #1f2937",
  background: "#0b1220",
  color: "#e5e7eb",
  cursor: "pointer",
};
