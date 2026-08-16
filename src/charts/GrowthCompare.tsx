import type { GrowthPoint } from '../analysis/vendorMetrics';
import type { HowToRead } from './captions';

/**
 * 營收年增率對照。手寫 SVG 長條圖。
 *
 * 這是兩家唯一能直接並排的軸——**成長率免換算幣別**，
 * 絕對值不行（日圓 vs 台幣，匯率不在資料層裡，換算出來的數字沒有 source_url）。
 *
 * 期間不一致時，每根長條下方各自標出自己的期間，且圖說要講明。
 * 不標的話讀者會以為軸是對齊的，那是這張圖最容易造成的誤讀。
 */

const ROW_HEIGHT = 52;
const BAR_HEIGHT = 16;
const LABEL_WIDTH = 96;
const CHART_WIDTH = 340;
const PADDING_RIGHT = 64;
/** 軸上限固定 40%，不隨資料伸縮——會動的軸沒辦法跨快照比較 */
const AXIS_MAX = 0.4;

export function GrowthCompare({
  points,
  summary,
  howToRead,
  takeaway,
}: {
  points: GrowthPoint[];
  summary: string;
  howToRead: HowToRead;
  takeaway?: { text: string; evidenceIds: string[] };
}) {
  const height = points.length * ROW_HEIGHT + 30;
  const totalWidth = LABEL_WIDTH + CHART_WIDTH + PADDING_RIGHT;

  return (
    <figure className="chart">
      <figcaption className="chart-title">營收年增率 — 兩家並排</figcaption>

      <div className="chart-scroll">
        <svg
          role="img"
          aria-describedby={howToRead.id}
          viewBox={`0 0 ${totalWidth} ${height}`}
          preserveAspectRatio="xMinYMin meet"
        >
          {[0, 0.1, 0.2, 0.3, 0.4].map((tick) => {
            const x = LABEL_WIDTH + (tick / AXIS_MAX) * CHART_WIDTH;
            return (
              <g key={tick}>
                <line
                  x1={x}
                  y1={18}
                  x2={x}
                  y2={height - 10}
                  className={tick === 0 ? 'axis-baseline' : 'axis-grid'}
                />
                <text x={x} y={11} className="axis-tick" textAnchor="middle">
                  {`+${Math.round(tick * 100)}%`}
                </text>
              </g>
            );
          })}

          {points.map((point, index) => {
            const y = 26 + index * ROW_HEIGHT;
            const width = Math.min(point.yoy / AXIS_MAX, 1) * CHART_WIDTH;
            return (
              <g key={point.vendorId}>
                <text
                  x={LABEL_WIDTH - 10}
                  y={y + BAR_HEIGHT - 3}
                  className="bar-label"
                  textAnchor="end"
                >
                  {point.vendorName}
                </text>
                <rect x={LABEL_WIDTH} y={y} width={width} height={BAR_HEIGHT} rx={4} className="bar">
                  <title>
                    {`${point.vendorName}：年增 ${(point.yoy * 100).toFixed(1)}%（${point.period}）`}
                  </title>
                </rect>
                <text x={LABEL_WIDTH + width + 8} y={y + BAR_HEIGHT - 3} className="bar-value">
                  {`+${(point.yoy * 100).toFixed(1)}%`}
                </text>
                {/* 期間跟著每根長條走——兩家不同期時，這行字是唯一防止誤讀的東西 */}
                <text x={LABEL_WIDTH} y={y + BAR_HEIGHT + 16} className="bar-period">
                  {point.period}
                </text>
              </g>
            );
          })}
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
