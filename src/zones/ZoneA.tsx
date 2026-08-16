import type { Manifest, Snapshot } from '../types/data';

/**
 * Zone A 競品分析報告。先給結論，再給資料（← MC-002）。
 *
 * 骨架階段只放結構與抓取日期；執行摘要與關鍵發現是**人寫**的，不由模型生成
 * （← CLAUDE.md 資料層硬規則 6），因此留空位而不是先塞佔位文字。
 */
export function ZoneA({ snapshot, manifest }: { snapshot: Snapshot; manifest: Manifest }) {
  const vendorCount = snapshot.vendors.length;
  const productCount = snapshot.products.length;

  return (
    <section id="zone-a" className="zone">
      <header className="zone-head">
        <span className="zone-num">Zone A</span>
        <h2>競品分析報告</h2>
        <p className="capture-date">
          快照日期 <strong>{snapshot.date}</strong>
          {manifest.previous ? `（前一版 ${manifest.previous}）` : '（首版，無前版可比）'}
        </p>
      </header>

      <div className="stat-row">
        <div className="stat">
          <span className="stat-label">收錄廠商</span>
          <span className="stat-value">{vendorCount}</span>
        </div>
        <div className="stat">
          <span className="stat-label">產品層明細</span>
          <span className="stat-value">{productCount}</span>
        </div>
        <div className="stat">
          <span className="stat-label">能力字典</span>
          <span className="stat-value">{snapshot.capabilities.length}</span>
        </div>
      </div>

      <div className="placeholder">
        執行摘要與關鍵發現待人工撰寫。每條發現必須帶 <code>evidence_ids</code>，
        沒有證據的發現不准出現在此區——即使它「看起來很對」。
      </div>
    </section>
  );
}
