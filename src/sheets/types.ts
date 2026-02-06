export type TabName = "settings" | "stock" | "sales" | "crm" | "glossary";

export type RowRef = { tab: TabName; rowNumber: number };

export type BaseRow = { __tab: TabName; __rowNumber: number };

export type SettingsRow = BaseRow & { key: string; value: string };

export type StockRow = BaseRow & {
  distributor: string;
  product: string;
  sku: string;
  quantity: number | null;
  last_updated: string;
};

export type SalesRow = BaseRow & {
  month: string;
  territory: string;
  brick: string;
  rep: string;
  product: string;
  target: number | null;
  achieved: number | null;
};

export type CrmRow = BaseRow & {
  week: string;
  territory: string;
  rep: string;
  doctor: string;
  specialty: string;
  visits: number | null;
  coverage_flag: boolean | null;
};

export type GlossaryRow = BaseRow & {
  term: string;
  synonyms: string;
  canonical: string;
};

export type LoadedSheetData = {
  settings: SettingsRow[];
  stock: StockRow[];
  sales: SalesRow[];
  crm: CrmRow[];
  glossary: GlossaryRow[];
};

export type Settings = {
  meta_prompt: string;
  assistant_name: string;
  grounding_mode: "strict";
  cache_ttl_seconds: number;
  max_rows_context: number;
  min_retrieval_score: number;
  answer_language: "en";
};
