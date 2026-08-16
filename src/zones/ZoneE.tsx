import type { Confidence, Product } from '../types/data';

/**
 * Zone E 產品明細。每個欄位旁顯示信度標記，
 * `confidence: none` 顯示「無公開資料」而非留白——留白會被讀成「還沒做」。
 */

function ConfidenceBadge({ value }: { value: Confidence }) {
  const label: Record<Confidence, string> = {
    verified: '已查證',
    claimed: '官方宣稱',
    inferred: '推測',
    none: '無公開',
  };
  return <span className={`chip chip-${value}`}>{label[value]}</span>;
}

export function ZoneE({ products }: { products: Product[] }) {
  return (
    <section id="zone-e" className="zone">
      <header className="zone-head">
        <span className="zone-num">Zone E</span>
        <h2>產品明細</h2>
      </header>

      <div className="product-list">
        {products.map((product) => (
          <article key={product.id} className="product-card">
            <div className="product-head">
              <h3>{product.name}</h3>
              <span className="product-tag">{product.category}</span>
            </div>
            <dl className="product-fields">
              <dt>產品線</dt>
              <dd>{product.line}</dd>
              <dt>買方角色</dt>
              <dd>{product.buyer_role}</dd>
              <dt>計價</dt>
              <dd>
                {product.pricing.model} <ConfidenceBadge value={product.pricing.confidence} />
              </dd>
              <dt>採用情形</dt>
              <dd>
                {product.adoption.rating === null ? (
                  <span className="unknown">無公開資料</span>
                ) : (
                  product.adoption.rating
                )}{' '}
                <ConfidenceBadge value={product.adoption.confidence} />
              </dd>
              <dt>第一方資料依賴</dt>
              <dd>{product.first_party_data_dependency} / 5</dd>
              <dt>直接競品</dt>
              <dd>{product.competitors.join('、')}</dd>
            </dl>
          </article>
        ))}
      </div>
    </section>
  );
}
