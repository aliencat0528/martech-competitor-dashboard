/**
 * 資料層型別。`confidence` 四態封閉是這裡最重要的一件事——
 * 用 union type 讓填錯值在編譯期就被擋下來，不是執行期才發現（← MC-003、MC-004）。
 */

/** 四態封閉，不得新增第五種（← CLAUDE.md 資料層硬規則 2） */
export type Confidence = 'verified' | 'claimed' | 'inferred' | 'none';

export const CONFIDENCE_VALUES: readonly Confidence[] = [
  'verified',
  'claimed',
  'inferred',
  'none',
] as const;

/**
 * 三個中繼欄位。`source_url` 與 `captured_at` 是選填，因為允許就近繼承
 * （← MC-013）：項目沒帶就沿祖層取，繼承鏈上完全取不到才算違規。
 */
export interface Meta {
  source_url?: string | null;
  confidence: Confidence;
  captured_at?: string;
  note?: string;
}

/** 帶信度的文字項目，products/agents 裡到處都是這個形狀 */
export interface TextFact extends Meta {
  text: string;
}

export type PricingModel =
  | 'enterprise_quote'
  | 'public_self_serve_tiers'
  | 'media_spend_share'
  | 'performance_based';

export interface Pricing extends Meta {
  model: PricingModel;
  public: boolean;
  value: number | null;
}

export interface Adoption extends Meta {
  customers: number | null;
  reviews_count: number | null;
  rating: number | null;
  arr_usd?: number;
}

export type AcquisitionDifficulty = 'low' | 'medium' | 'high';

export interface Product {
  id: string;
  vendor_id: string;
  name: string;
  aka?: string;
  line: string;
  category: string;
  buyer_role: string;
  channels?: string[];
  verticals?: string[];
  features: TextFact[];
  claimed_strengths: TextFact[];
  evidence_reviews: TextFact[];
  pain_points: TextFact[];
  competitors: string[];
  pricing: Pricing;
  adoption: Adoption;
  first_party_data_dependency: number;
  acquisition_difficulty: AcquisitionDifficulty;
  strategic_weight?: number;
  moat?: string;
  source_url?: string | null;
}

export interface ProductLine extends Partial<Meta> {
  id: string;
  label: string;
  label_zh?: string;
  launched_at?: string;
  quantified_results_disclosed?: boolean;
}

export interface Metric extends Meta {
  value: number | null;
  currency?: string;
  period?: string;
  yoy?: number | null;
  [key: string]: unknown;
}

export interface Vendor {
  id: string;
  name: string;
  name_zh?: string;
  ticker?: string;
  hq: string;
  founded: number;
  positioning: string;
  /** 只有部分廠商收錄到廠商層（← MC-011），這個欄位標明收錄深度 */
  record_scope?: {
    level: 'vendor_only' | 'full';
    reason: string;
    captured_at: string;
  };
  product_lines: ProductLine[];
  metrics: Record<string, Metric>;
  growth_drivers?: TextFact[];
}

export interface Capability {
  id: string;
  label: string;
  group: string;
  definition: string;
}

/** 格子四態。`claimed_only` 是信度標記，不是指控（← MC-009） */
export type CellState = 'full' | 'partial' | 'claimed_only' | 'none';

export interface Snapshot {
  date: string;
  vendors: Vendor[];
  products: Product[];
  capabilities: Capability[];
  agents: unknown[];
}

export interface SnapshotIndexEntry {
  date: string;
  trigger: string;
  vendors: string[];
  changes: string;
  files: string[];
}

export interface Manifest {
  schema_version: string;
  latest: string;
  previous: string | null;
  snapshot_cadence: string;
  snapshots: SnapshotIndexEntry[];
}
