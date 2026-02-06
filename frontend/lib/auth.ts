import { Role } from "./types";

const KEY = "sgai_demo_basic_auth";

export type StoredAuth = { username: string; password: string; role: Role };

export function saveAuth(a: StoredAuth) {
  localStorage.setItem(KEY, JSON.stringify(a));
}

export function loadAuth(): StoredAuth | null {
  const raw = localStorage.getItem(KEY);
  if (!raw) return null;
  try { return JSON.parse(raw) as StoredAuth; } catch { return null; }
}

export function clearAuth() {
  localStorage.removeItem(KEY);
}

export function basicAuthHeader(a: StoredAuth): string {
  const token = btoa(`${a.username}:${a.password}`);
  return `Basic ${token}`;
}
