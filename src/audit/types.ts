import { RowRef } from "../sheets/types";

export type AuditEntry = {
  id: string;
  timestamp: string;
  userId: string;
  role: "admin" | "user";
  question: string;
  selectedTabs: string[];
  retrievedRowRefs: RowRef[];
  analysis: any | null;
  response: string;
  refusalFlag: boolean;
};
