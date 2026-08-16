import type { ProductScore } from '../analysis/productMetrics';
import type { HowToRead } from './captions';

/**
 * 計價透明度長條圖。手寫 SVG，不引入圖表套件（← MC-003）。
 *
 * 單一量值、單一序列，所以用單一色相、不需要圖例——標題已經說明了畫的是什麼。
 * 圖說兩塊固定跟在下方，沒有圖說的圖不准上線（← MC-008 硬規則 1）。
 */

const ROW_HEIGHT = 30;
const BAR_HEIGHT = 14;
const LABEL_WIDTH = 118;
const CHART_WIDTH = 360;
const PADDING_RIGHT = 52;

export function PricingBar({
  scores,
  summary,
  howToRead,
  takeaway,
}: {
  scores: ProductScore[];
  summary: string;
  howToRead: HowToRead;
  takeaway?: { text: string; evidenceIds: string[] };
}) {
  const height = scores.length * ROW_HEIGHT + 28;
  const totalWidth = LABEL_WIDTH + CHART_WIDTH + PADDING_RIGHT;

  return (
    <figure className="chart">
      <figcaption className="chart-title">計價透明度 — Appier 九個產品</figcaption>

      <div className="chart-scroll">
        <svg
          role="img"
          aria-describedby={howToRead.id}
          viewBox={`0 0 ${totalWidth} ${height}`}
          preserveAspectRatio="xMinYMin meet"
        >
          {/* 座標軸刻度，視覺上要退後，不與資料爭注意力 */}
          {[0, 0.5, 1].map((tick) => {
            const x = LABEL_WIDTH + tick * CHART_WIDTH;
            return (
              <g key={tick}>
                <line
                  x1={x}
                  y1={16}
                  x2={x}
                  y2={height - 12}
                  className={tick === 0 ? 'axis-baseline' : 'axis-grid'}
                />
                <text x={x} y={10} className="axis-tick" textAnchor="middle">
                  {tick === 0 ? '報價制' : tick === 1 ? '公開' : ''}
                </text>
              </g>
            );
          })}

          {scores.map((score, index) => {
            const y = 22 + index * ROW_HEIGHT;
            const width = Math.max(score.pricingTransparency * CHART_WIDTH, 0);
            const isUnknown = score.pricingConfidence === 'none';
            return (
              <g key={score.id}>
                <text x={LABEL_WIDTH - 10} y={y + BAR_HEIGHT - 3} className="bar-label" textAnchor="end">
                  {score.name}
                </text>
                {/* 零值也要看得見一個起點，否則會被讀成「沒有這筆資料」 */}
                <rect
                  x={LABEL_WIDTH}
                  y={y}
                  width={Math.max(width, 2)}
                  height={BAR_HEIGHT}
                  rx={4}
                  className={isUnknown ? 'bar bar-unknown' : 'bar'}
                >
                  <title>
                    {`${score.name}：計價透明度 ${score.pricingTransparency.toFixed(1)}` +
                      `（信度 ${score.pricingConfidence}）`}
                  </title>
                </rect>
                <text
                  x={LABEL_WIDTH + Math.max(width, 2) + 8}
                  y={y + BAR_HEIGHT - 3}
                  className="bar-value"
                >
                  {score.pricingTransparency.toFixed(1)}
                </text>
              </g>
            );
          })}
        </svg>
      </div>

      {/* 圖說兩塊 —— 第 1 塊人寫且隨圖不隨資料，第 2 塊由 L2 算出來 */}
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
