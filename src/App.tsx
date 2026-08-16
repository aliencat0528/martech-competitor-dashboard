import { getManifest, loadLatest } from './data/loader';
import { ZoneA } from './zones/ZoneA';
import { ZoneB } from './zones/ZoneB';
import { ZoneE } from './zones/ZoneE';
import { ZoneF } from './zones/ZoneF';

/**
 * 單頁、報告在最上方（← MC-002）。
 *
 * Zone C 能力矩陣（M2）與 Zone D 定位圖（M1 產品層級軸）尚未實作，
 * 骨架階段不放空殼區塊——放了會看起來像做壞了，而不是像還沒做。
 */
export function App() {
  const snapshot = loadLatest();
  const manifest = getManifest();
  const appierProducts = snapshot.products.filter((p) => p.vendor_id === 'appier');

  return (
    <div className="page">
      <header className="masthead">
        <p className="kicker">MarTech 競品情報 Dashboard · M1 骨架</p>
        <h1>把廠商產品線拆成可比較、可追溯、可匯出的一份分析報告</h1>
        <p className="standfirst">
          指標全部由公開資料算出，不做主觀評分；觀點放在人寫的關鍵發現，每條帶證據。
        </p>
      </header>

      <ZoneA snapshot={snapshot} manifest={manifest} />
      <ZoneB snapshot={snapshot} />
      <ZoneE products={appierProducts} />
      <ZoneF snapshot={snapshot} />

      <footer className="page-foot">
        快照 {snapshot.date} · 更新節奏 {manifest.snapshot_cadence}
      </footer>
    </div>
  );
}
