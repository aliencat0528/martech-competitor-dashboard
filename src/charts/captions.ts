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
  productScatter: {
    id: 'caption-product-scatter',
    title: '怎麼讀',
    body:
      '橫軸是計價透明度（愈右愈透明），縱軸是第一方資料依賴度（愈上代表愈需要品牌自己的數據才跑得動）。' +
      '右下角是「好買又好上手」，左上角是「要簽約談價、還要先把數據接進來」。' +
      '圓點大小映射該產品在產品線中的策略權重。',
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

export function productScatterSummary(input: {
  productCount: number;
  highDependencyCount: number;
  mostTransparent: string;
}): string {
  return (
    `目前收錄 ${input.productCount} 個產品，其中 ${input.highDependencyCount} 個的第一方資料依賴度為 4 以上——` +
    `這些產品要先接得到品牌自己的數據才發揮得出來。計價最透明者為 ${input.mostTransparent}。`
  );
}

/**
 * 收錄範圍不足時照講，不硬擠結論（← MC-008 硬規則 4、MC-011）。
 * M1 只有 Appier 一家有產品層資料，91APP 僅收到廠商層。
 */
export const COVERAGE_CAVEAT =
  '目前產品層僅收錄 Appier 一家；91APP 只收到廠商層（財報與產品線名稱），' +
  '其核心能力不在現有能力字典內，尚無法與 Appier 併表比較。對照組於 M2 加入。';
