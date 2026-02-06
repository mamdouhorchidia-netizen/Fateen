export type Role = "admin" | "user";

export type Source = { tab: string; rowNumbers: number[] };

export type ChatResponse = {
  answer: string;
  sources: Source[];
  analysis?: any;
  auditId: string;
  settings?: { meta_prompt: string; assistant_name: string };
};

export type AuditEntry = {
  id: string;
  timestamp: string;
  userId: string;
  role: Role;
  question: string;
  selectedTabs: string[];
  retrievedRowRefs: Array<{ tab: string; rowNumber: number }>;
  analysis: any | null;
  response: string;
  refusalFlag: boolean;
};
