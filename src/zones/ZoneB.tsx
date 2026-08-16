import { scoreProducts, transparentPricingShare } from '../analysis/productMetrics';
import {
  COMPARABLE_METRICS,
  availabilityMatrix,
  availabilityScore,
  growthComparison,
  periodsAligned,
} from '../analysis/vendorMetrics';
import { AvailabilityMatrix } from '../charts/AvailabilityMatrix';
import { GrowthCompare } from '../charts/GrowthCompare';
import { PricingBar } from '../charts/PricingBar';
import {
  COVERAGE_CAVEAT,
  HOW_TO_READ,
  availabilitySummary,
  growthCompareSummary,
  pricingBarSummary,
} from '../charts/captions';
import type { Snapshot } from '../types/data';

/**
 * Zone B 廠商快照列。三張圖，各自回答一個問題：
 *
 * 1. **營收年增率** — 兩家唯一能直接並排的軸（成長率免換算幣別）
 * 2. **資料可得性** — 同一組欄位誰查得到，留白的分布本身就是情報
 * 3. **計價透明度** — 產品層級橫向比（← MC-010），目前僅 Appier 有產品層資料
 */
export function ZoneB({ snapshot }: { snapshot: Snapshot }) {
  const vendors = snapshot.vendors;
  const appierProducts = snapshot.products.filter((p) => p.vendor_id === 'appier');

  // --- 圖 1：成長率 ---
  const growthPoints = growthComparison(vendors);
  const growthSummary = growthCompareSummary({
    points: growthPoints,
    aligned: periodsAligned(growthPoints),
  });

  // --- 圖 2：資料可得性 ---
  const matrix = availabilityMatrix(vendors);
  const bothMissing = matrix
    .filter((row) => row.cells.every((cell) => cell.confidence === 'none'))
    .map((row) => row.label);
  const availability = availabilitySummary({
    metricCount: COMPARABLE_METRICS.length,
    perVendor: vendors.map((v) => ({ vendorName: v.name, available: availabilityScore(v) })),
    bothMissing,
  });

  // --- 圖 3：計價透明度 ---
  const scores = scoreProducts(appierProducts);
  const unknownPricing = appierProducts.filter((p) => p.pricing.confidence === 'none').length;
  const pricingSummary = pricingBarSummary({
    productCount: appierProducts.length,
    transparentCount: Math.round(transparentPricingShare(appierProducts) * appierProducts.length),
    unknownCount: unknownPricing,
    vendorName: 'Appier',
  });

  return (
    <section id="zone-b" className="zone">
      <header className="zone-head">
        <span className="zone-num">Zone B</span>
        <h2>廠商對照與產品橫向比</h2>
        <p className="zone-note">
          兩家的幣別不同，<strong>營收金額不並排</strong>——匯率不在資料層裡，換算出來的數字沒有來源可追。
          能直接比的是成長率與資料可得性。
        </p>
      </header>

      <div className="vendor-row">
        {vendors.map((vendor) => (
          <article key={vendor.id} className="vendor-card">
            <h3>{vendor.name}</h3>
            <p className="vendor-positioning">{vendor.positioning}</p>
            <dl className="vendor-fields">
              <dt>總部</dt>
              <dd>{vendor.hq}</dd>
              <dt>成立</dt>
              <dd>{vendor.founded}</dd>
              <dt>產品線</dt>
              <dd>{vendor.product_lines.length}</dd>
              <dt>查得到的欄位</dt>
              <dd>
                {availabilityScore(vendor)} / {COMPARABLE_METRICS.length}
              </dd>
              <dt>收錄深度</dt>
              <dd>
                {vendor.record_scope?.level === 'vendor_only' ? (
                  <span className="badge badge-partial">僅廠商層</span>
                ) : (
                  <span className="badge">完整</span>
                )}
              </dd>
            </dl>
          </article>
        ))}
      </div>

      <GrowthCompare
        points={growthPoints}
        summary={growthSummary}
        howToRead={HOW_TO_READ.growthCompare}
        takeaway={{
          text:
            '兩家的成長量級接近，但揭露密度差很多——91APP 的季營收沒有附年增率，' +
            '要退到半年累計那筆才拿得到。',
          evidenceIds: ['appier.metrics.revenue', '91app.metrics.revenue_1h2026'],
        }}
      />

      <AvailabilityMatrix
        rows={matrix}
        vendorNames={vendors.map((v) => v.name)}
        summary={availability}
        howToRead={HOW_TO_READ.availabilityMatrix}
        takeaway={{
          text:
            '91APP 有完整財報卻沒有評論樣本，Appier 兩邊都有——' +
            '這正是之後定位圖走「市場影響力 × 產品覆蓋度」時會遇到的問題提前現形：' +
            '市場影響力軸在 91APP 身上只有財報側撐得住。',
          evidenceIds: ['91app.metrics.g2_rating', 'appier.metrics.g2_rating'],
        }}
      />

      <PricingBar scores={scores} summary={pricingSummary} howToRead={HOW_TO_READ.pricingBar} />

      <p className="caveat">{COVERAGE_CAVEAT}</p>
    </section>
  );
}
