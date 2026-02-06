import { config, Role } from "../config";

export type DemoUser = { username: string; password: string; role: Role; userId: string };

const users: DemoUser[] = [
  { username: config.adminUser, password: config.adminPass, role: "admin", userId: "admin" },
  { username: config.userUser, password: config.userPass, role: "user", userId: "user" },
];

export function validateBasicAuth(username: string, password: string): DemoUser | null {
  const u = users.find(x => x.username === username && x.password === password);
  return u ?? null;
}
