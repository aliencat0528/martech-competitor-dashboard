import { useState } from 'react';
import { DEFAULT_CLAIM_WEIGHT, capabilityCoverage } from '../analysis/capabilityMetrics';
import { scoreProducts } from '../analysis/productMetrics';
import { PositioningScatter, toScatterPoints } from '../charts/PositioningScatter';
import { HOW_TO_READ, positioningSummary } from '../charts/captions';
import type { Product, Snapshot } from '../types/data';

/**
 * Zone D 定位圖。M1 走產品層級軸（← MC-010）；
 * 廠商層級的 G2 Grid 式四象限要到 M2 對照組進來才成立。
 *
 * **權重滑桿是 MC-010 的落地**：主觀的不是分數，是「你信廠商說法幾分」，
 * 所以把它交給讀者調，而不是我替他決定。滑桿一動 summary 跟著重算。
 */
export function ZoneD({
  snapshot,
  products,
  scope,
}: {
  snapshot: Snapshot;
  products: Product[];
  scope: string | null;
}) {
  const [claimWeight, setClaimWeight] = useState(DEFAULT_CLAIM_WEIGHT);
  const matrix = snapshot.matrix;

  if (!matrix) {
    return (
      <section id="zone-d" className="zone">
        <header className="zone-head">
          <span className="zone-num">Zone D</span>
          <h2>定位圖</h2>
        </header>
        <p className="caveat">本快照尚無矩陣資料，覆蓋率軸算不出來。</p>
      </section>
    );
  }

  const coverage = capabilityCoverage(
    matrix,
    products,
    snapshot.capabilities.length,
    claimWeight,
  );
  const scores = scoreProducts(products);
  const weights = new Map(products.map((p) => [p.id, p.strategic_weight ?? 3]));
  const points = toScatterPoints(coverage, scores, weights);

  const sorted = [...coverage].sort((a, b) => b.coverage - a.coverage);
  const widest = sorted[0];
  const narrowest = sorted[sorted.length - 1];
  const buyable = points.filter((p) => p.transparency >= 0.5).length;

  const summary = widest
    ? positioningSummary({
      productCount: points.length,
      widestName: widest.productName,
      widestPct: Math.round(widest.coverage * 100),
      narrowestName: narrowest.productName,
      narrowestPct: Math.round(narrowest.coverage * 100),
      buyableCount: buyable,
      claimWeightPct: Math.round(claimWeight * 100),
    })
    : '目前檢視範圍內沒有產品。';

  return (
    <section id="zone-d" className="zone">
      <header className="zone-head">
        <span className="zone-num">Zone D</span>
        <h2>定位圖</h2>
        <p className="zone-note">
          M1 用產品層級的兩軸；廠商層級的「市場影響力 × 產品覆蓋度」四象限要到 M2
          對照組進來才成立（← MC-010）。
        </p>
      </header>

      <div className="weight-control">
        <label htmlFor="claim-weight">
          「僅宣稱」的採計權重 <strong>{Math.round(claimWeight * 100)}%</strong>
        </label>
        <input
          id="claim-weight"
          type="range"
          min={0}
          max={100}
          step={5}
          value={Math.round(claimWeight * 100)}
          onChange={(event) => setClaimWeight(Number(event.target.value) / 100)}
        />
        <div className="weight-ends">
          <span>0% 只認第三方查得到的</span>
          <span>100% 完全採信廠商說法</span>
        </div>
        <p className="weight-note">
          權重是公開且可調的——這份報告裡唯一主觀的東西不是分數，是<strong>你願意信廠商說法幾分</strong>，
          所以把它交給你，而不是我替你決定（← Forrester Wave 的做法）。拉動滑桿，橫軸與下方描述都會重算。
        </p>
      </div>

      <PositioningScatter
        points={points}
        capabilityCount={snapshot.capabilities.length}
        summary={summary}
        howToRead={HOW_TO_READ.positioning}
        takeaway={
          scope === null
            ? {
              text:
                  '把權重拉到 0%，91APP 的七個產品會全部縮到最左邊——它沒有任何一格拿得出第三方證據。' +
                  'Appier 則還剩下 16 格（7 full ＋ 9 partial），這是兩家目前最大的結構差異。',
              evidenceIds: ['matrix.cells', '91app.metrics.g2_rating'],
            }
            : undefined
        }
      />
    </section>
  );
}
