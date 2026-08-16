import type { Snapshot } from '../types/data';

interface SourceRow {
  scope: string;
  url: string;
  confidence: string;
  capturedAt: string;
}

/**
 * Zone F 來源清單。決定整份報告可不可信的一區。
 *
 * 這裡刻意**沿著繼承鏈**收集來源（← MC-013）：項目沒自帶就往上找，
 * 找不到才算真的沒有。不實作繼承的話這張表會漏掉大半資料的出處。
 */
function collectSources(node: unknown, scope: string, inherited: string | null, out: SourceRow[]) {
  if (Array.isArray(node)) {
    for (const item of node) collectSources(item, scope, inherited, out);
    return;
  }
  if (node === null || typeof node !== 'object') return;

  const record = node as Record<string, unknown>;
  const own = typeof record.source_url === 'string' ? record.source_url : null;
  const effective = own ?? inherited;

  if (typeof record.confidence === 'string' && effective) {
    out.push({
      scope,
      url: effective,
      confidence: record.confidence,
      capturedAt: typeof record.captured_at === 'string' ? record.captured_at : '（繼承）',
    });
  }
  for (const value of Object.values(record)) collectSources(value, scope, effective, out);
}

export function ZoneF({ snapshot }: { snapshot: Snapshot }) {
  const rows: SourceRow[] = [];
  collectSources(snapshot.vendors, 'vendors', null, rows);
  collectSources(snapshot.products, 'products', null, rows);

  const unique = Array.from(new Map(rows.map((r) => [r.url, r])).values());

  return (
    <section id="zone-f" className="zone">
      <header className="zone-head">
        <span className="zone-num">Zone F</span>
        <h2>來源與方法論</h2>
        <p className="zone-note">
          共 {rows.length} 筆帶信度的事實，指向 {unique.length} 個不重複來源。
          方法論頁（每個分數怎麼算）於 M3 補上。
        </p>
      </header>

      <div className="table-scroll">
        <table className="source-table">
          <thead>
            <tr>
              <th>範圍</th>
              <th>信度</th>
              <th>擷取日</th>
              <th>來源</th>
            </tr>
          </thead>
          <tbody>
            {unique.map((row) => (
              <tr key={row.url}>
                <td>{row.scope}</td>
                <td>{row.confidence}</td>
                <td>{row.capturedAt}</td>
                <td className="source-url">
                  <a href={row.url} target="_blank" rel="noreferrer">
                    {row.url.replace(/^https?:\/\//, '').slice(0, 64)}
                  </a>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </section>
  );
}
