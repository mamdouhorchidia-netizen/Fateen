"use client";

import React from "react";

export function Message({ role, text }: { role: "user" | "assistant"; text: string }) {
  return (
    <div style={{
      padding: 12,
      borderRadius: 10,
      marginBottom: 10,
      background: role === "user" ? "#0b1220" : "#111827",
      border: "1px solid #1f2937",
      color: "#e5e7eb",
      whiteSpace: "pre-wrap"
    }}>
      <div style={{ fontSize: 12, opacity: 0.7, marginBottom: 6 }}>{role}</div>
      <div>{text}</div>
    </div>
  );
}
