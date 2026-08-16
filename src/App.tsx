import { useMemo, useState } from 'react';
import { getManifest, loadLatest } from './data/loader';
import { ZoneA } from './zones/ZoneA';
import { ZoneB } from './zones/ZoneB';
import { ZoneC } from './zones/ZoneC';
import { ZoneD } from './zones/ZoneD';
import { ZoneE } from './zones/ZoneE';
import { ZoneF } from './zones/ZoneF';
import { VendorPicker, type VendorScope } from './zones/VendorPicker';

/**
 * 單頁、報告在最上方（← MC-002）。
 *
 * 廠商下拉選單是全頁共用的檢視範圍：Zone C／D／E 跟著它切換，
 * Zone B 永遠兩家一起畫——那一區的存在意義就是比較。
 */
export function App() {
  const snapshot = loadLatest();
  const manifest = getManifest();
  const [scope, setScope] = useState<VendorScope>(null);

  const productCounts = useMemo(() => {
    const counts = new Map<string, number>();
    for (const product of snapshot.products) {
      counts.set(product.vendor_id, (counts.get(product.vendor_id) ?? 0) + 1);
    }
    return counts;
  }, [snapshot.products]);

  const scopedProducts = useMemo(
    () => (scope ? snapshot.products.filter((p) => p.vendor_id === scope) : snapshot.products),
    [snapshot.products, scope],
  );

  return (
    <div className="page">
      <header className="masthead">
        <p className="kicker">MarTech 競品情報 Dashboard</p>
        <h1>把廠商產品線拆成可比較、可追溯、可匯出的一份分析報告</h1>
        <p className="standfirst">
          指標全部由公開資料算出，不做主觀評分；觀點放在人寫的關鍵發現，每條帶證據。
        </p>
      </header>

      <ZoneA snapshot={snapshot} manifest={manifest} />

      <VendorPicker
        vendors={snapshot.vendors}
        value={scope}
        onChange={setScope}
        productCounts={productCounts}
      />

      <ZoneB snapshot={snapshot} />
      <ZoneC snapshot={snapshot} products={scopedProducts} scope={scope} />
      <ZoneD snapshot={snapshot} products={scopedProducts} scope={scope} />
      <ZoneE products={scopedProducts} />
      <ZoneF snapshot={snapshot} />

      <footer className="page-foot">
        快照 {snapshot.date} · 更新節奏 {manifest.snapshot_cadence}
      </footer>
    </div>
  );
}
