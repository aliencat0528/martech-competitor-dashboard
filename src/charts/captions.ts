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
