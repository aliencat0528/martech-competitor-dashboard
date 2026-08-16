import { describe, expect, it } from 'vitest';
import { loadLatest } from '../data/loader';
import {
  availabilityMatrix,
  availabilityScore,
  growthComparison,
  periodsAligned,
  revenueGrowth,
} from './vendorMetrics';

const vendors = loadLatest().vendors;
const appier = vendors.find((v) => v.id === 'appier')!;
const app91 = vendors.find((v) => v.id === '91app')!;

describe('availabilityMatrix', () => {
  it('六個對照欄位，每列都涵蓋所有廠商', () => {
    const matrix = availabilityMatrix(vendors);
    expect(matrix).toHaveLength(6);
    for (const row of matrix) {
      expect(row.cells).toHaveLength(vendors.length);
    }
  });

  it('員工數兩家都查不到——公開資料衝突，依硬規則 3 留 null', () => {
    const employees = availabilityMatrix(vendors).find((row) => row.key === 'employees')!;
    expect(employees.cells.every((cell) => cell.confidence === 'none')).toBe(true);
  });

  it('評論評分只有 Appier 查得到，91APP 無足量樣本', () => {
    const rating = availabilityMatrix(vendors).find((row) => row.key === 'g2_rating')!;
    const byVendor = Object.fromEntries(rating.cells.map((c) => [c.vendorId, c.hasValue]));
    expect(byVendor.appier).toBe(true);
    expect(byVendor['91app']).toBe(false);
  });
});

describe('availabilityScore', () => {
  it('Appier 查得到的欄位多於 91APP', () => {
    expect(availabilityScore(appier)).toBeGreaterThan(availabilityScore(app91));
  });
});

describe('revenueGrowth', () => {
  it('Appier 取 revenue 本身的年增率', () => {
    const point = revenueGrowth(appier)!;
    expect(point.metricKey).toBe('revenue');
    expect(point.yoy).toBeCloseTo(0.294, 4);
  });

  it('91APP 的季營收未附年增率，退用累計那筆並保留期間標示', () => {
    const point = revenueGrowth(app91)!;
    expect(point.metricKey).not.toBe('revenue');
    expect(point.period).toContain('2026');
    expect(point.yoy).toBeCloseTo(0.3173, 4);
  });
});

describe('periodsAligned', () => {
  it('兩家期間不同——圖說必須講明，不能假裝軸對齊', () => {
    expect(periodsAligned(growthComparison(vendors))).toBe(false);
  });
});
