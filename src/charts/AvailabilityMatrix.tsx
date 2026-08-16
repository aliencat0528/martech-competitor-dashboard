import type { AvailabilityRow } from '../analysis/vendorMetrics';
import type { Confidence } from '../types/data';
import type { HowToRead } from './captions';

/**
 * 資料可得性熱力矩陣。
 *
 * 用 `<table>` 而不是 SVG：這張圖的每一格都是「欄位 × 廠商」的查詢結果，
 * 表格本身就是它的語意，螢幕閱讀器讀得出行列關係，print 樣式也不必另外處理。
 * 手寫 SVG 的約束是為了不引入圖表套件，不是為了避開 HTML。
 *
 * **四態靠顏色與符號各標一次**，不只靠顏色（← FEATURES Zone C 的規定）。
 */

const GLYPH: Record<Confidence, string> = {
  verified: '●',
  claimed: '◐',
  inferred: '◔',
  none: '○',
};

const LABEL: Record<Confidence, string> = {
  verified: '已查證',
  claimed: '官方宣稱',
  inferred: '推測',
  none: '無公開',
};

export function AvailabilityMatrix({
  rows,
  vendorNames,
  summary,
  howToRead,
  takeaway,
}: {
  rows: AvailabilityRow[];
  vendorNames: string[];
  summary: string;
  howToRead: HowToRead;
  takeaway?: { text: string; evidenceIds: string[] };
}) {
  return (
    <figure className="chart">
      <figcaption className="chart-title">資料可得性 — 同一組欄位，兩家廠商</figcaption>

      <div className="table-scroll">
        <table className="matrix" aria-describedby={howToRead.id}>
          <thead>
            <tr>
              <th scope="col">欄位</th>
              {vendorNames.map((name) => (
                <th key={name} scope="col">
                  {name}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {rows.map((row) => (
              <tr key={row.key}>
                <th scope="row">{row.label}</th>
                {row.cells.map((cell) => (
                  <td key={cell.vendorId} className={`cell cell-${cell.confidence}`}>
                    <span className="cell-glyph" aria-hidden="true">
                      {GLYPH[cell.confidence]}
                    </span>
                    <span className="cell-text">
                      {cell.hasValue ? LABEL[cell.confidence] : '無公開資料'}
                    </span>
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <div className="caption-blocks">
        <div className="caption" id={howToRead.id}>
          <span className="caption-label">{howToRead.title}</span>
          <p>{howToRead.body}</p>
        </div>
        <div className="caption">
          <span className="caption-label">這張圖現在說什麼</span>
          <p>{summary}</p>
          {takeaway ? (
            <p className="takeaway">
              {takeaway.text}
              <span className="evidence">（{takeaway.evidenceIds.join('、')}）</span>
            </p>
          ) : null}
        </div>
      </div>
    </figure>
  );
}
