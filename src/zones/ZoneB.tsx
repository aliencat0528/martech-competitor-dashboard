import { scoreProducts, transparentPricingShare } from '../analysis/productMetrics';
import { COVERAGE_CAVEAT, HOW_TO_READ, pricingBarSummary } from '../charts/captions';
import { PricingBar } from '../charts/PricingBar';
import type { Snapshot } from '../types/data';

/**
 * Zone B 廠商快照列 ＋ M1 的產品層級橫向比（← MC-010）。
 *
 * 廠商只有兩家且收錄深度不同，廠商層級的圖在 M1 撐不起來；
 * 產品層級則有九筆可比。
 */
export function ZoneB({ snapshot }: { snapshot: Snapshot }) {
  const appierProducts = snapshot.products.filter((p) => p.vendor_id === 'appier');
  const scores = scoreProducts(appierProducts);
  const unknownPricing = appierProducts.filter((p) => p.pricing.confidence === 'none').length;

  const summary = pricingBarSummary({
    productCount: appierProducts.length,
    transparentCount: Math.round(transparentPricingShare(appierProducts) * appierProducts.length),
    unknownCount: unknownPricing,
    vendorName: 'Appier',
  });

  return (
    <section id="zone-b" className="zone">
      <header className="zone-head">
        <span className="zone-num">Zone B</span>
        <h2>廠商快照與產品橫向比</h2>
      </header>

      <div className="vendor-row">
        {snapshot.vendors.map((vendor) => (
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

      <PricingBar scores={scores} summary={summary} howToRead={HOW_TO_READ.pricingBar} />

      <p className="caveat">{COVERAGE_CAVEAT}</p>
    </section>
  );
}
