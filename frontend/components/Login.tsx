"use client";

import React, { useState } from "react";
import { Role } from "../lib/types";
import { saveAuth } from "../lib/auth";

export function Login({ onLoggedIn }: { onLoggedIn: () => void }) {
  const [username, setUsername] = useState("user");
  const [password, setPassword] = useState("userpass");
  const [role, setRole] = useState<Role>("user");

  return (
    <div style={card}>
      <h2 style={{ marginTop: 0 }}>Login (demo Basic auth)</h2>
      <div style={row}>
        <label style={label}>Username</label>
        <input style={input} value={username} onChange={(e) => setUsername(e.target.value)} />
      </div>
      <div style={row}>
        <label style={label}>Password</label>
        <input style={input} type="password" value={password} onChange={(e) => setPassword(e.target.value)} />
      </div>
      <div style={row}>
        <label style={label}>Role</label>
        <select style={input} value={role} onChange={(e) => setRole(e.target.value as Role)}>
          <option value="user">user</option>
          <option value="admin">admin</option>
        </select>
      </div>
      <button
        style={btn}
        onClick={() => {
          saveAuth({ username, password, role });
          onLoggedIn();
        }}
      >
        Enter
      </button>
      <div style={{ marginTop: 10, fontSize: 12, opacity: 0.8 }}>
        Credentials must match backend env vars.
      </div>
    </div>
  );
}

const card: React.CSSProperties = {
  border: "1px solid #1f2937",
  background: "#0b1220",
  padding: 16,
  borderRadius: 14,
  color: "#e5e7eb",
  maxWidth: 420,
};

const row: React.CSSProperties = { display: "flex", flexDirection: "column", gap: 6, marginBottom: 10 };
const label: React.CSSProperties = { fontSize: 12, opacity: 0.85 };

const input: React.CSSProperties = {
  padding: 10,
  borderRadius: 10,
  border: "1px solid #1f2937",
  background: "#111827",
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
