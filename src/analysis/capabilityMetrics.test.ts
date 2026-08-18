import { describe, expect, it } from 'vitest';
import { loadLatest } from '../data/loader';
import {
  capabilityCoverage,
  cellsFor,
  densestClaimedGroup,
  cellsForProducts,
  tallyStates,
} from './capabilityMetrics';

const snapshot = loadLatest();
const matrix = snapshot.matrix!;
const products = snapshot.products;
const capabilities = snapshot.capabilities;

describe('矩陣資料完整性', () => {
  it('每個產品 × 每個能力都有一格，不留空洞', () => {
    expect(matrix.cells).toHaveLength(products.length * capabilities.length);
    for (const product of products) {
      expect(cellsFor(matrix, product.id)).toHaveLength(capabilities.length);
    }
  });

  it('尚未人工覆核——AI 整理的草稿不得當定案', () => {
    expect(matrix.reviewed).toBe(false);
  });

  it('none 的格子不帶來源，其餘一定帶', () => {
    for (const cell of matrix.cells) {
      if (cell.state === 'none') expect(cell.source_url).toBeNull();
      else expect(cell.source_url).toBeTruthy();
    }
  });
});

describe('capabilityCoverage', () => {
  it('兩家全部產品都算得出覆蓋率', () => {
    const scores = capabilityCoverage(matrix, products, capabilities.length);
    expect(scores).toHaveLength(products.length);
    for (const score of scores) {
      expect(score.coverage).toBeGreaterThanOrEqual(0);
      expect(score.coverage).toBeLessThanOrEqual(1);
    }
  });

  it('有第三方證據的格子數不會超過有能力的格子數', () => {
    for (const score of capabilityCoverage(matrix, products, capabilities.length)) {
      expect(score.evidenced).toBeLessThanOrEqual(score.covered);
    }
  });

  it('AIQUA 的覆蓋率高於 AdCreative.ai——主力產品面向較廣', () => {
    const scores = capabilityCoverage(matrix, products, capabilities.length);
    const aiqua = scores.find((s) => s.productId === 'aiqua')!;
    const adcreative = scores.find((s) => s.productId === 'adcreative_ai')!;
    expect(aiqua.coverage).toBeGreaterThan(adcreative.coverage);
  });
});

describe('tallyStates', () => {
  it('四態相加等於格子總數', () => {
    const tally = tallyStates(matrix.cells);
    const sum = tally.full + tally.partial + tally.claimed_only + tally.none;
    expect(sum).toBe(matrix.cells.length);
  });

  it('僅宣稱的格子數明顯多於有第三方證據的格子數', () => {
    const tally = tallyStates(matrix.cells);
    expect(tally.claimed_only).toBeGreaterThan(tally.full);
  });
});

describe('權重滑桿（← MC-010「權重公開且可調」）', () => {
  const app91 = products.filter((p) => p.vendor_id === '91app');

  it('把「僅宣稱」權重歸零，91APP 的覆蓋率全部變成 0——它沒有任何一格有第三方證據', () => {
    for (const score of capabilityCoverage(matrix, app91, capabilities.length, 0)) {
      expect(score.coverage).toBe(0);
    }
  });

  it('Appier 在權重歸零後仍有覆蓋率——它有 full 與 partial 的格子', () => {
    const appier = products.filter((p) => p.vendor_id === 'appier');
    const total = capabilityCoverage(matrix, appier, capabilities.length, 0).reduce(
      (sum, s) => sum + s.coverage,
      0,
    );
    expect(total).toBeGreaterThan(0);
  });

  it('權重愈高覆蓋率不會下降', () => {
    const low = capabilityCoverage(matrix, products, capabilities.length, 0);
    const high = capabilityCoverage(matrix, products, capabilities.length, 1);
    low.forEach((score, index) => {
      expect(high[index].coverage).toBeGreaterThanOrEqual(score.coverage);
    });
  });
});

describe('densestClaimedGroup', () => {
  it('找得出僅宣稱最密集的能力群', () => {
    const densest = densestClaimedGroup(matrix.cells, capabilities)!;
    expect(densest.count).toBeGreaterThan(0);
    expect(capabilities.some((cap) => cap.group === densest.group)).toBe(true);
  });
});

describe('cellsForProducts', () => {
  it('限縮產品清單後格子數跟著變少，summary 才不會數到看不見的東西', () => {
    const all = cellsForProducts(matrix, products);
    const appier = cellsForProducts(
      matrix,
      products.filter((p) => p.vendor_id === 'appier'),
    );
    expect(all).toHaveLength(products.length * capabilities.length);
    expect(appier).toHaveLength(9 * capabilities.length);
    expect(appier.length).toBeLessThan(all.length);
  });

  it('切到單一廠商時，格子只剩那一家的', () => {
    const app91 = products.filter((p) => p.vendor_id === '91app');
    const cells = cellsForProducts(matrix, app91);
    const ids = new Set(app91.map((p) => p.id));
    expect(cells.every((cell) => ids.has(cell.product_id))).toBe(true);
  });
});
