import { useMemo, useState } from 'react';
import { cellsForProducts, densestClaimedGroup, tallyStates } from '../analysis/capabilityMetrics';
import type { Capability, CellState, Matrix, Product, Snapshot } from '../types/data';

/**
 * Zone C 能力矩陣。產品 × 能力的交叉表，欄位定義來自 capabilities.json。
 *
 * 三件規格上的硬要求：
 * 1. 四態**顏色與圖形都要區分**，不只靠顏色
 * 2. 「怎麼讀」直接引用 `cell_states[].definition` 原文，不另寫一套說法——
 *    同一組定義同時餵給圖說與 Zone F 方法論頁，改判定標準時只有一個地方要改
 * 3. **篩選後 summary 要跟著重算**：描述講的必須是眼前看到的那些格子，不是全集
 */

const GLYPH: Record<CellState, string> = {
  full: '●',
  partial: '◑',
  claimed_only: '○',
  none: '·',
};

function stateSummary(input: {
  cells: ReturnType<typeof cellsForProducts>;
  capabilities: Capability[];
  scopeLabel: string;
}): string {
  const tally = tallyStates(input.cells);
  const total = input.cells.length;
  const claimedShare = total === 0 ? 0 : Math.round((tally.claimed_only / total) * 100);
  const densest = densestClaimedGroup(input.cells, input.capabilities);
  const groupPart = densest
    ? `僅宣稱最密集的是「${densest.group}」群（${densest.count} 格）。`
    : '沒有任何僅宣稱的格子。';
  return (
    `${input.scopeLabel}共 ${total} 格：有第三方證據 ${tally.full} 格、` +
    `部分支援 ${tally.partial} 格、僅宣稱 ${tally.claimed_only} 格（${claimedShare}%）、` +
    `查不到 ${tally.none} 格。${groupPart}`
  );
}

export function ZoneC({
  snapshot,
  products,
  scope,
}: {
  snapshot: Snapshot;
  products: Product[];
  scope: string | null;
}) {
  const [line, setLine] = useState<string | null>(null);
  const matrix = snapshot.matrix;

  const lines = useMemo(() => Array.from(new Set(products.map((p) => p.line))), [products]);

  const visibleProducts: Product[] = useMemo(
    () => (line && lines.includes(line) ? products.filter((p) => p.line === line) : products),
    [products, line, lines],
  );

  if (!matrix) {
    return (
      <section id="zone-c" className="zone">
        <header className="zone-head">
          <span className="zone-num">Zone C</span>
          <h2>能力矩陣</h2>
        </header>
        <p className="caveat">本快照尚無矩陣資料。</p>
      </section>
    );
  }

  const cells = cellsForProducts(matrix as Matrix, visibleProducts);
  const lookup = new Map(cells.map((cell) => [`${cell.product_id}|${cell.capability_id}`, cell]));
  // 用廠商顯示名而不是 id——圖說是給人看的，不該漏出資料層的鍵值
  const scopeName = snapshot.vendors.find((v) => v.id === scope)?.name ?? scope;
  const scopeLabel = line
    ? `${line} 產品線`
    : scopeName
      ? `${scopeName} 的產品`
      : '兩家全部產品';
  const summary = stateSummary({ cells, capabilities: snapshot.capabilities, scopeLabel });

  return (
    <section id="zone-c" className="zone">
      <header className="zone-head">
        <span className="zone-num">Zone C</span>
        <h2>能力矩陣</h2>
        <p className="zone-note">
          {products.length} 個產品 × {snapshot.capabilities.length} 項能力。
          能力的判定標準來自 <code>capabilities.json</code>，不散落在元件裡。
        </p>
      </header>

      {!matrix.reviewed ? (
        <p className="caveat">
          ⚠️ 這份矩陣是<strong>依既有欄位整理出的草稿，尚未經人工覆核</strong>
          （<code>reviewed: false</code>）。依資料層硬規則 6，判定每一格屬於分析主張，
          必須人工覆核後才算定案。
        </p>
      ) : null}

      <div className="filter-row">
        <span className="filter-label">依產品線篩選</span>
        <button
          type="button"
          className={line === null ? 'filter-chip is-on' : 'filter-chip'}
          onClick={() => setLine(null)}
        >
          全部（{products.length}）
        </button>
        {lines.map((value) => (
          <button
            key={value}
            type="button"
            className={line === value ? 'filter-chip is-on' : 'filter-chip'}
            onClick={() => setLine(value)}
          >
            {value}（{products.filter((p) => p.line === value).length}）
          </button>
        ))}
      </div>

      <figure className="chart">
        <div className="table-scroll">
          <table className="capability-matrix" aria-describedby="caption-capability-matrix">
            <thead>
              <tr>
                <th scope="col">能力</th>
                {visibleProducts.map((product) => (
                  <th key={product.id} scope="col" className="matrix-col">
                    {product.name}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {snapshot.capabilities.map((capability) => (
                <tr key={capability.id}>
                  <th scope="row" title={capability.definition}>
                    <span className="cap-group">{capability.group}</span>
                    {capability.label}
                  </th>
                  {visibleProducts.map((product) => {
                    const cell = lookup.get(`${product.id}|${capability.id}`);
                    const state = cell?.state ?? 'none';
                    return (
                      <td key={product.id} className={`mcell mcell-${state}`}>
                        <abbr title={cell?.note ?? '查不到任何相關描述'}>{GLYPH[state]}</abbr>
                      </td>
                    );
                  })}
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        <div className="caption-blocks">
          <div className="caption" id="caption-capability-matrix">
            <span className="caption-label">怎麼讀</span>
            {/* 直接引用 cell_states[].definition 原文，不另寫一套說法 */}
            <ul className="state-legend">
              {snapshot.cellStates.map((state) => (
                <li key={state.id}>
                  <span className={`mcell-inline mcell-${state.id}`}>{GLYPH[state.id]}</span>
                  <strong>{state.label}</strong>
                  <span className="state-def">{state.definition}</span>
                </li>
              ))}
            </ul>
          </div>
          <div className="caption">
            <span className="caption-label">這張圖現在說什麼</span>
            <p>{summary}</p>
            <p className="takeaway">
              整張矩陣裡拿得出第三方證據的格子是少數，其餘幾乎都是官方單方說法——
              而僅宣稱最密集的一群，恰好是第三方評論樣本最少的資料層產品。
              <span className="evidence">（matrix.cells、airis.evidence_reviews）</span>
            </p>
          </div>
        </div>
      </figure>
    </section>
  );
}
