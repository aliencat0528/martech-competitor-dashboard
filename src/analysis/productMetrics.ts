/**
 * L2 分析層：產品層級的客觀指標（← MC-009 撤銷落差分後的替代指標組、MC-010 比較單位下移）。
 *
 * 純函式：吃資料吐數字，不讀檔、不碰 DOM、不呼叫 API、不呼叫 LLM。
 * 面試會被問「這個分數怎麼來的」，這裡每一條都要能逐行講出來。
 */

import type { Confidence, Product } from '../types/data';

export interface ProductScore {
  id: string;
  name: string;
  line: string;
  /** 0–1。公開定價得滿分，成效計價次之，純報價制 0 分 */
  pricingTransparency: number;
  pricingConfidence: Confidence;
  channelCount: number;
  verticalCount: number;
  firstPartyDependency: number;
  /** M1 無資料——九個產品的 adoption.rating 全為 null，G2 僅公開全產品加總 */
  reputation: null;
}

/**
 * 計價透明度分。**不是**「便宜與否」，是「買方在簽約前能不能自己算出要付多少」。
 *
 * - 1.0 公開自助訂閱：官網看得到級距，刷卡即用
 * - 0.6 成效計價：單價未公開，但計費基準公開且可驗證（按實際轉換）
 * - 0.3 抽成：抽成比例未公開，但計費基準（media spend）買方自己看得到
 * - 0.0 企業報價：簽約前算不出來
 */
export function pricingTransparency(product: Product): number {
  switch (product.pricing.model) {
    case 'public_self_serve_tiers':
      return 1;
    case 'performance_based':
      return 0.6;
    case 'media_spend_share':
      return 0.3;
    case 'enterprise_quote':
      return 0;
  }
}

export function scoreProduct(product: Product): ProductScore {
  return {
    id: product.id,
    name: product.name,
    line: product.line,
    pricingTransparency: pricingTransparency(product),
    pricingConfidence: product.pricing.confidence,
    channelCount: product.channels?.length ?? 0,
    verticalCount: product.verticals?.length ?? 0,
    firstPartyDependency: product.first_party_data_dependency,
    reputation: null,
  };
}

export function scoreProducts(products: Product[]): ProductScore[] {
  return products.map(scoreProduct);
}

/** 有多少比例的產品公開得出價格。Zone B 圖說的 summary 會用到這個數字 */
export function transparentPricingShare(products: Product[]): number {
  if (products.length === 0) return 0;
  const transparent = products.filter((p) => p.pricing.public).length;
  return transparent / products.length;
}

/**
 * 統計某個欄位有多少筆是查不到的。
 * 這個數字要放進圖說——留白的多寡本身就是情報（← 資料層硬規則 3）。
 */
export function countUnknown(
  products: Product[],
  pick: (p: Product) => { confidence: Confidence },
): number {
  return products.filter((p) => pick(p).confidence === 'none').length;
}
