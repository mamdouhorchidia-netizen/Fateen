import Database from "better-sqlite3";
import path from "path";
import fs from "fs";
import { AuditEntry } from "./types";

const dataDir = path.join(process.cwd(), "data");
if (!fs.existsSync(dataDir)) fs.mkdirSync(dataDir, { recursive: true });

const dbPath = path.join(dataDir, "audit.sqlite");
const db = new Database(dbPath);

db.exec(`
CREATE TABLE IF NOT EXISTS audit (
  id TEXT PRIMARY KEY,
  timestamp TEXT NOT NULL,
  userId TEXT NOT NULL,
  role TEXT NOT NULL,
  question TEXT NOT NULL,
  selectedTabs TEXT NOT NULL,
  retrievedRowRefs TEXT NOT NULL,
  analysis TEXT,
  response TEXT NOT NULL,
  refusalFlag INTEGER NOT NULL
);
`);

export function insertAudit(entry: AuditEntry): void {
  const stmt = db.prepare(`
    INSERT INTO audit (id, timestamp, userId, role, question, selectedTabs, retrievedRowRefs, analysis, response, refusalFlag)
    VALUES (@id, @timestamp, @userId, @role, @question, @selectedTabs, @retrievedRowRefs, @analysis, @response, @refusalFlag)
  `);
  stmt.run({
    ...entry,
    selectedTabs: JSON.stringify(entry.selectedTabs),
    retrievedRowRefs: JSON.stringify(entry.retrievedRowRefs),
    analysis: entry.analysis ? JSON.stringify(entry.analysis) : null,
    refusalFlag: entry.refusalFlag ? 1 : 0,
  });
}

export function listAudit(limit = 50): AuditEntry[] {
  const stmt = db.prepare(`SELECT * FROM audit ORDER BY timestamp DESC LIMIT ?`);
  const rows = stmt.all(limit) as any[];
  return rows.map(r => ({
    id: r.id,
    timestamp: r.timestamp,
    userId: r.userId,
    role: r.role,
    question: r.question,
    selectedTabs: JSON.parse(r.selectedTabs),
    retrievedRowRefs: JSON.parse(r.retrievedRowRefs),
    analysis: r.analysis ? JSON.parse(r.analysis) : null,
    response: r.response,
    refusalFlag: !!r.refusalFlag,
  }));
}
