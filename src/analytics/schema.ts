import { RowRef } from "../sheets/types";

export type Analysis = {
  type: string;
  scope: Record<string, any>;
  metrics: Record<string, any>;
  table: Array<Record<string, any>>;
  notes: string[];
  sources: RowRef[];
};
