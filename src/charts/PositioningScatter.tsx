import type { CoverageScore } from '../analysis/capabilityMetrics';
import type { ProductScore } from '../analysis/productMetrics';
import type { HowToRead } from './captions';

/**
 * Zone D 定位圖。手寫 SVG 散佈圖，帶四象限分隔線與象限標籤。
 *
 * M1 走**產品層級軸**：能力覆蓋率 × 計價透明度（← MC-010）。
 * 廠商層級的 G2 Grid 式四象限要到 M2 對照組進來才成立。
 */

const W = 520;
const H = 380;
const PAD_L = 58;
const PAD_R = 20;
const PAD_T = 28;
const PAD_B = 46;

export interface ScatterPoint {
  id: string;
  name: string;
  /** 橫軸 0–1 */
  coverage: number;
  /** 縱軸 0–1 */
  transparency: number;
  /** 圓點大小映射的權重 1–5 */
  weight: number;
  evidenced: number;
}

export function toScatterPoints(
  coverage: CoverageScore[],
  scores: ProductScore[],
  weights: Map<string, number>,
): ScatterPoint[] {
  const byId = new Map(scores.map((s) => [s.id, s]));
  return coverage.map((c) => ({
    id: c.productId,
    name: c.productName,
    coverage: c.coverage,
    transparency: byId.get(c.productId)?.pricingTransparency ?? 0,
    weight: weights.get(c.productId) ?? 3,
    evidenced: c.evidenced,
  }));
}

/**
 * 標籤避讓。計價透明度為 0 的產品全部擠在底部同一條水平線上，
 * 標籤直接畫在圓點上方會疊成一團看不懂——實測九個產品有五個落在那裡。
 *
 * 作法是由左而右掃過，遇到與已放置標籤在水平方向重疊的，就往上疊一層。
 */
const LABEL_LINE_HEIGHT = 16;

/**
 * 估算標籤半寬。CJK 約 11px、拉丁與數字約 6px，另加緩衝——
 * SVG 會被 CSS 放大約 1.4 倍，實際字框比 viewBox 單位大，寧可高估也不要讓標籤疊在一起。
 */
function halfWidthOf(name: string): number {
  const width = [...name].reduce((sum, ch) => sum + (/[\u4e00-\u9fff]/.test(ch) ? 11 : 6), 0);
  return width / 2 + 8;
}

function placeLabels(
  points: ScatterPoint[],
  x: (v: number) => number,
  y: (v: number) => number,
  r: (weight: number) => number,
): { point: ScatterPoint; labelY: number }[] {
  const placed: { cx: number; cy: number; half: number }[] = [];
  return [...points]
    .sort((a, b) => x(a.coverage) - x(b.coverage))
    .map((point) => {
      const cx = x(point.coverage);
      const half = halfWidthOf(point.name);
      let labelY = y(point.transparency) - r(point.weight) - 5;
      let guard = 0;
      while (
        guard < 16 &&
        placed.some(
          (other) =>
            Math.abs(other.cx - cx) < other.half + half &&
            Math.abs(other.cy - labelY) < LABEL_LINE_HEIGHT,
        )
      ) {
        labelY -= LABEL_LINE_HEIGHT;
        guard += 1;
      }
      placed.push({ cx, cy: labelY, half });
      return { point, labelY };
    });
}

export function PositioningScatter({
  points,
  capabilityCount,
  summary,
  howToRead,
  takeaway,
}: {
  points: ScatterPoint[];
  capabilityCount: number;
  summary: string;
  howToRead: HowToRead;
  takeaway?: { text: string; evidenceIds: string[] };
}) {
  const plotW = W - PAD_L - PAD_R;
  const plotH = H - PAD_T - PAD_B;
  const x = (v: number) => PAD_L + v * plotW;
  const y = (v: number) => PAD_T + (1 - v) * plotH;
  const r = (weight: number) => 5 + weight * 1.6;

  return (
    <figure className="chart">
      <figcaption className="chart-title">定位圖 — 能力覆蓋率 × 計價透明度</figcaption>

      <div className="chart-scroll">
        <svg
          role="img"
          aria-describedby={howToRead.id}
          viewBox={`0 0 ${W} ${H}`}
          preserveAspectRatio="xMinYMin meet"
        >
          {/* 象限分隔線放在中位，先畫，讓資料點蓋在上面 */}
          <line x1={x(0.5)} y1={PAD_T} x2={x(0.5)} y2={PAD_T + plotH} className="axis-grid" />
          <line x1={PAD_L} y1={y(0.5)} x2={PAD_L + plotW} y2={y(0.5)} className="axis-grid" />

          {/* 象限標籤貼四角，並讓下半部兩個停在中線下方——
              計價透明度 0 的產品全擠在底部，標籤放那裡會被蓋掉 */}
          <text x={x(0.02)} y={y(0.97)} className="quadrant" textAnchor="start">
            窄而好買
          </text>
          <text x={x(0.98)} y={y(0.97)} className="quadrant" textAnchor="end">
            廣而好買
          </text>
          <text x={x(0.02)} y={y(0.44)} className="quadrant" textAnchor="start">
            窄且要談價
          </text>
          <text x={x(0.98)} y={y(0.44)} className="quadrant" textAnchor="end">
            廣且要談價
          </text>

          {/* 座標軸 */}
          <line x1={PAD_L} y1={PAD_T + plotH} x2={PAD_L + plotW} y2={PAD_T + plotH} className="axis-baseline" />
          <line x1={PAD_L} y1={PAD_T} x2={PAD_L} y2={PAD_T + plotH} className="axis-baseline" />

          {[0, 0.25, 0.5, 0.75, 1].map((tick) => (
            <text key={`x${tick}`} x={x(tick)} y={H - 24} className="axis-tick" textAnchor="middle">
              {`${Math.round(tick * 100)}%`}
            </text>
          ))}
          {[0, 0.5, 1].map((tick) => (
            <text key={`y${tick}`} x={PAD_L - 8} y={y(tick) + 3} className="axis-tick" textAnchor="end">
              {tick.toFixed(1)}
            </text>
          ))}

          <text x={PAD_L + plotW / 2} y={H - 6} className="axis-title" textAnchor="middle">
            {`能力覆蓋率（${capabilityCount} 項中涵蓋幾項）→`}
          </text>
          <text
            x={-(PAD_T + plotH / 2)}
            y={14}
            className="axis-title"
            textAnchor="middle"
            transform="rotate(-90)"
          >
            計價透明度 →
          </text>

          {placeLabels(points, x, y, r).map(({ point, labelY }) => (
            <g key={point.id}>
              <circle
                cx={x(point.coverage)}
                cy={y(point.transparency)}
                r={r(point.weight)}
                className="dot"
              >
                <title>
                  {`${point.name}：覆蓋 ${Math.round(point.coverage * 100)}%` +
                    `（其中 ${point.evidenced} 項有第三方證據）、` +
                    `計價透明度 ${point.transparency.toFixed(1)}`}
                </title>
              </circle>
              <text
                x={x(point.coverage)}
                y={labelY}
                className="dot-label"
                textAnchor="middle"
              >
                {point.name}
              </text>
            </g>
          ))}
        </svg>
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
