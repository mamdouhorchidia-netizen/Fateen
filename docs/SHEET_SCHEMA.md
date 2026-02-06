# Google Sheet schema (case-sensitive)

Create tabs and headers exactly as below.

## Tab: settings

Headers:
- `key`
- `value`

Required keys:
- `meta_prompt`
- `assistant_name` (default `Fateen`)
- `grounding_mode` (must be `strict`)
- `cache_ttl_seconds` (number, default 120)
- `max_rows_context` (number, default 12)
- `min_retrieval_score` (number, default 2)
- `answer_language` (must be `en`)

Example rows:
| key | value |
|---|---|
| meta_prompt | You are Fateen, Orchidia’s strictly grounded analytics assistant. Be concise. |
| assistant_name | Fateen |
| grounding_mode | strict |
| cache_ttl_seconds | 120 |
| max_rows_context | 12 |
| min_retrieval_score | 2 |
| answer_language | en |

## Tab: stock

Headers:
- `distributor`
- `product`
- `sku`
- `quantity`
- `last_updated`

Example:
| distributor | product | sku | quantity | last_updated |
|---|---|---|---:|---|
| Delta | Amaryl | AMY-10 | 120 | 2026-02-01 |
| Delta | Amaryl | AMY-20 | 80 | 2026-02-01 |
| Nile | Concor | CON-05 | 40 | 2026-02-02 |

## Tab: sales

Headers:
- `month` (prefer `YYYY-MM`)
- `territory`
- `brick`
- `rep`
- `product`
- `target`
- `achieved`

Example:
| month | territory | brick | rep | product | target | achieved |
|---|---|---|---|---|---:|---:|
| 2025-01 | Giza | BR-12 | Rana | Amaryl | 100 | 92 |
| 2025-01 | Giza | BR-13 | Rana | Concor | 70 | 55 |
| 2025-02 | Cairo | BR-01 | Omar | Amaryl | 120 | 130 |

## Tab: crm

Headers:
- `week` (prefer `YYYY-W##`)
- `territory`
- `rep`
- `doctor`
- `specialty`
- `visits`
- `coverage_flag` (true/false)

Example:
| week | territory | rep | doctor | specialty | visits | coverage_flag |
|---|---|---|---|---|---:|---|
| 2025-W03 | Giza | Rana | Dr. Ali | Cardio | 2 | true |
| 2025-W03 | Giza | Rana | Dr. Mona | GP | 1 | false |
| 2025-W03 | Cairo | Omar | Dr. Hany | Neuro | 3 | true |

## Tab: glossary (optional but supported)

Headers:
- `term`
- `synonyms` (comma-separated)
- `canonical`

Example:
| term | synonyms | canonical |
|---|---|---|
| Amaryl | AMY, amaril | Amaryl |
| Rana | rna | Rana |
| Giza | giza gov | Giza |
