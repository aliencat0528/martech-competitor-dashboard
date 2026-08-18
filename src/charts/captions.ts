/**
 * 圖說第 1 塊「怎麼讀」——人寫、隨圖不隨資料（← MC-008）。
 *
 * 放在常數裡而不是寫在元件內，是因為它同時要當圖表的 `aria-describedby`：
 * 寫兩份，改一份忘另一份，兩邊就會開始講不同的話。
 */

export interface HowToRead {
  /** 圖表的識別碼，同時是 aria-describedby 指向的 DOM id */
  id: string;
  title: string;
  body: string;
}

export const HOW_TO_READ: Record<string, HowToRead> = {
  pricingBar: {
    id: 'caption-pricing-bar',
    title: '怎麼讀',
    body:
      '每條橫槓是一個產品的計價透明度，愈右愈透明。滿分代表官網看得到級距、刷卡即用；' +
      '中段是成效計價（單價未公開，但計費基準公開且可驗證）；' +
      '零分代表企業報價制——買方在簽約前算不出要付多少。' +
      '灰段代表該欄位無公開資料，不是 0 分。',
  },
  growthCompare: {
    id: 'caption-growth-compare',
    title: '怎麼讀',
    body:
      '每根長條是一家廠商的營收年增率，愈長成長愈快。軸的上限固定在 +40%，不隨資料伸縮——' +
      '會動的軸沒辦法跨快照比較。' +
      '長條下方的期間各自不同時，兩根長條並不對齊——一季與半年的成長率不能直接畫上等號，' +
      '看的是量級而不是名次。這裡比的是成長率而非營收金額，因為兩家幣別不同，' +
      '而匯率不在資料層裡——換算出來的數字沒有來源可追。',
  },
  availabilityMatrix: {
    id: 'caption-availability',
    title: '怎麼讀',
    body:
      '每一格是「這個欄位，這家廠商，查不查得到」。實心●代表有第三方或財報可佐證；' +
      '半實心◐代表只有廠商自己說；四分之一◔代表由公開資訊推論；空心○代表查不到，欄位留空不編。' +
      '符號與顏色各標一次，不只靠顏色分辨。' +
      '這張圖比的不是產品好壞，是誰願意讓你查得到——對一份強調來源的報告來說，' +
      '留白的分布本身就是情報。',
  },
  positioning: {
    id: 'caption-positioning',
    title: '怎麼讀',
    body:
      '橫軸是能力覆蓋率——能力字典中這個產品涵蓋幾項（含僅宣稱的），愈右面向愈廣。' +
      '縱軸是計價透明度，愈上代表買方在簽約前愈算得出要付多少。' +
      '分隔線畫在兩軸的中點，切出四個象限：右上「廣而好買」、右下「廣且要談價」、' +
      '左上「窄而好買」、左下「窄且要談價」。' +
      '圓點大小映射該產品在產品線中的策略權重，愈大代表對廠商愈重要。' +
      '橫軸受上方滑桿影響：把「僅宣稱」的採計權重拉低，只靠官方說法撐起來的產品會往左縮。' +
      '覆蓋率把「僅宣稱」也算進去，所以它衡量的是面向廣度而不是實力——' +
      '有多少項拿得出第三方證據，要看能力矩陣。',
  },
};

/**
 * 圖說第 2 塊的 `summary`——**句型模板 ＋ L2 算出的數字填空**，不是 LLM 生成的
 * （← MC-008 硬規則 2、CLAUDE.md 資料層硬規則 6）。句型是人寫死的，模型不參與。
 */
export function pricingBarSummary(input: {
  productCount: number;
  transparentCount: number;
  unknownCount: number;
  vendorName: string;
}): string {
  const { vendorName, productCount, transparentCount, unknownCount } = input;
  const share = Math.round((transparentCount / productCount) * 100);
  return (
    `${vendorName} 的 ${productCount} 個產品中，${transparentCount} 個公開得出價格（${share}%）；` +
    `其餘為企業報價制或抽成。${unknownCount} 個產品的計價模式本身查不到公開來源。`
  );
}

export function growthCompareSummary(input: {
  points: { vendorName: string; yoy: number; period: string }[];
  aligned: boolean;
}): string {
  const parts = input.points.map(
    (p) => `${p.vendorName} 年增 ${(p.yoy * 100).toFixed(1)}%（${p.period}）`,
  );
  const alignment = input.aligned
    ? '兩者期間相同，可直接比較。'
    : '兩者期間不同，不可直接比名次，只看得出量級接近。';
  return `${parts.join('、')}。${alignment}`;
}

export function availabilitySummary(input: {
  metricCount: number;
  perVendor: { vendorName: string; available: number }[];
  bothMissing: string[];
}): string {
  const parts = input.perVendor.map(
    (v) => `${v.vendorName} ${v.available} / ${input.metricCount}`,
  );
  const missing =
    input.bothMissing.length > 0
      ? `${input.bothMissing.join('、')} 兩家都查不到。`
      : '沒有兩家皆缺的欄位。';
  return `${input.metricCount} 個對照欄位中，查得到的分別是 ${parts.join('、')}。${missing}`;
}

export function positioningSummary(input: {
  productCount: number;
  widestName: string;
  widestPct: number;
  narrowestName: string;
  narrowestPct: number;
  buyableCount: number;
  claimWeightPct: number;
}): string {
  return (
    `在「僅宣稱」採計 ${input.claimWeightPct}% 的設定下，圖上 ${input.productCount} 個產品：` +
    `覆蓋最廣的是 ${input.widestName}（${input.widestPct}%），` +
    `最窄的是 ${input.narrowestName}（${input.narrowestPct}%）。` +
    `計價透明度達 0.5 以上的有 ${input.buyableCount} 個，其餘都要談價才知道價格。`
  );
}

/**
 * 收錄範圍不足時照講，不硬擠結論（← MC-008 硬規則 4、MC-011）。
 * M1 只有 Appier 一家有產品層資料，91APP 僅收到廠商層。
 */
export const COVERAGE_CAVEAT =
  '兩家的產品層都已入庫，能力字典已擴充零售側 6 項（← MC-015）。' +
  '91APP 無 G2 規模的評論樣本，其 22 個有能力的格子全部是「僅宣稱」——' +
  '這代表查不到第三方證據，不代表產品沒有評價。四群對照組仍於 M2 加入。';
