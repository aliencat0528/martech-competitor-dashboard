/**
 * L2 分析層：廠商層的對照指標。
 *
 * 這組函式存在的理由：91APP 進來之後，資料有了但沒有任何一張圖在比較兩家
 * ——因為 MC-011 只收廠商層、MC-010 把 M1 的比較單位放在產品，
 * 兩個決定疊起來讓它沒有視覺容身之處。
 *
 * **不做幣別換算**：匯率不在資料層裡，換算出來的數字沒有 `source_url`，
 * 違反資料層硬規則 3。所以能比的是成長率（免換算）與資料可得性本身。
 */

import type { Confidence, Vendor } from '../types/data';

export interface ComparableMetric {
  key: string;
  label: string;
}

/**
 * 固定的對照欄位。**刻意寫死而不是取兩家欄位的聯集**——
 * 聯集會讓表格隨資料變形，比較基準就不穩定了。
 */
export const COMPARABLE_METRICS: readonly ComparableMetric[] = [
  { key: 'revenue', label: '營收' },
  { key: 'gross_margin', label: '毛利率' },
  { key: 'customers', label: '客戶數' },
  { key: 'offices', label: '據點數' },
  { key: 'g2_rating', label: '評論評分' },
  { key: 'employees', label: '員工數' },
] as const;

export interface AvailabilityCell {
  vendorId: string;
  vendorName: string;
  confidence: Confidence;
  hasValue: boolean;
}

export interface AvailabilityRow {
  key: string;
  label: string;
  cells: AvailabilityCell[];
}

/**
 * 資料可得性矩陣。這張表比的不是產品，是**誰願意讓你查得到**——
 * 對一份強調來源的競品報告來說，留白的分布本身就是情報。
 */
export function availabilityMatrix(vendors: Vendor[]): AvailabilityRow[] {
  return COMPARABLE_METRICS.map((metric) => ({
    key: metric.key,
    label: metric.label,
    cells: vendors.map((vendor) => {
      const entry = vendor.metrics[metric.key];
      return {
        vendorId: vendor.id,
        vendorName: vendor.name,
        confidence: entry?.confidence ?? 'none',
        hasValue: entry !== undefined && entry.value !== null,
      };
    }),
  }));
}

/** 該廠商在對照欄位中有幾格查得到（`confidence` 不是 `none` 且有值） */
export function availabilityScore(vendor: Vendor): number {
  return COMPARABLE_METRICS.filter((metric) => {
    const entry = vendor.metrics[metric.key];
    return entry !== undefined && entry.value !== null && entry.confidence !== 'none';
  }).length;
}

export interface GrowthPoint {
  vendorId: string;
  vendorName: string;
  /** 年增率，例：0.294 代表 +29.4% */
  yoy: number;
  /** 期間必須跟著走。兩家的期間不同時，圖上不能假裝它們對齊 */
  period: string;
  confidence: Confidence;
  metricKey: string;
}

/**
 * 營收年增率。**唯一不需要換算幣別就能並排的軸**。
 *
 * 優先取 `revenue` 本身；它沒有 `yoy` 時退而取其他 `revenue*` 欄位
 * （91APP 的季營收未附年增率，年增率記在半年累計那筆）。
 * 退用哪一筆會被記在 `metricKey` 與 `period` 裡，呈現層必須把它顯示出來。
 */
export function revenueGrowth(vendor: Vendor): GrowthPoint | null {
  const candidates = Object.entries(vendor.metrics)
    .filter(([key, metric]) => key.startsWith('revenue') && typeof metric.yoy === 'number')
    .sort(([a], [b]) => (a === 'revenue' ? -1 : b === 'revenue' ? 1 : a.localeCompare(b)));

  const found = candidates[0];
  if (!found) return null;

  const [metricKey, metric] = found;
  return {
    vendorId: vendor.id,
    vendorName: vendor.name,
    yoy: metric.yoy as number,
    period: metric.period ?? metricKey,
    confidence: metric.confidence,
    metricKey,
  };
}

export function growthComparison(vendors: Vendor[]): GrowthPoint[] {
  return vendors.map(revenueGrowth).filter((point): point is GrowthPoint => point !== null);
}

/** 兩家的期間是否一致。不一致時圖說必須講明，不能讓讀者以為軸對齊了 */
export function periodsAligned(points: GrowthPoint[]): boolean {
  if (points.length < 2) return true;
  return points.every((point) => point.period === points[0].period);
}
