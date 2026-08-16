/**
 * L2 分析層：能力矩陣的統計。
 *
 * 這組函式是 Zone C 圖說與 Zone D 覆蓋率軸的共同來源——
 * 兩處用同一份數字，圖改了描述一定跟著改。
 */

import type { Capability, CellState, Matrix, MatrixCell, Product } from '../types/data';

export interface CoverageScore {
  productId: string;
  productName: string;
  line: string;
  /** 有能力的格子數（full + partial + claimed_only） */
  covered: number;
  /** 有第三方證據的格子數（full） */
  evidenced: number;
  total: number;
  /** 0–1，covered / total */
  coverage: number;
}

const COVERED_STATES: CellState[] = ['full', 'partial', 'claimed_only'];

export function cellsFor(matrix: Matrix, productId: string): MatrixCell[] {
  return matrix.cells.filter((cell) => cell.product_id === productId);
}

/**
 * 「僅宣稱」的採計權重。1 代表完全採信廠商說法，0 代表只認第三方查得到的。
 *
 * 這個參數就是 MC-010 說的「權重公開且可調」——**主觀的不是分數，是你信幾分**，
 * 所以把它交給讀者，而不是我替他決定。L2 是純函式，權重只是參數。
 */
export const DEFAULT_CLAIM_WEIGHT = 1;

export function capabilityCoverage(
  matrix: Matrix,
  products: Product[],
  capabilityCount: number,
  claimWeight: number = DEFAULT_CLAIM_WEIGHT,
): CoverageScore[] {
  return products.map((product) => {
    const cells = cellsFor(matrix, product.id);
    const covered = cells.filter((cell) => COVERED_STATES.includes(cell.state)).length;
    const evidenced = cells.filter((cell) => cell.state === 'full').length;
    // full 與 partial 全額計入，claimed_only 依權重折算
    const weighted = cells.reduce((sum, cell) => {
      if (cell.state === 'full' || cell.state === 'partial') return sum + 1;
      if (cell.state === 'claimed_only') return sum + claimWeight;
      return sum;
    }, 0);
    return {
      productId: product.id,
      productName: product.name,
      line: product.line,
      covered,
      evidenced,
      total: capabilityCount,
      coverage: capabilityCount === 0 ? 0 : weighted / capabilityCount,
    };
  });
}

export type StateTally = Record<CellState, number>;

export function tallyStates(cells: MatrixCell[]): StateTally {
  const tally: StateTally = { full: 0, partial: 0, claimed_only: 0, none: 0 };
  for (const cell of cells) tally[cell.state] += 1;
  return tally;
}

/**
 * `claimed_only` 最密集的能力群。
 * 這是矩陣裡最值得指出來的一個數字——宣稱密集的地方，往往就是證據最薄的地方。
 */
export function densestClaimedGroup(
  cells: MatrixCell[],
  capabilities: Capability[],
): { group: string; count: number } | null {
  const groupOf = new Map(capabilities.map((cap) => [cap.id, cap.group]));
  const counts = new Map<string, number>();
  for (const cell of cells) {
    if (cell.state !== 'claimed_only') continue;
    const group = groupOf.get(cell.capability_id);
    if (!group) continue;
    counts.set(group, (counts.get(group) ?? 0) + 1);
  }
  let best: { group: string; count: number } | null = null;
  for (const [group, count] of counts) {
    if (!best || count > best.count) best = { group, count };
  }
  return best;
}

/**
 * 取出這批產品的格子。**一律依傳入的產品清單過濾**——
 * 之前的版本在沒有產品線篩選時直接回傳全集，導致切換廠商後
 * 圖說的 summary 仍在數全部 448 格，描述講的不是眼前看到的東西。
 */
export function cellsForProducts(matrix: Matrix, products: Product[]): MatrixCell[] {
  const ids = new Set(products.map((p) => p.id));
  return matrix.cells.filter((cell) => ids.has(cell.product_id));
}
