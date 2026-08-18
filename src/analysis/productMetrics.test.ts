import { describe, expect, it } from 'vitest';
import { loadLatest } from '../data/loader';
import {
  countUnknown,
  pricingTransparency,
  scoreProducts,
  transparentPricingShare,
} from './productMetrics';

const snapshot = loadLatest();
// 這一組斷言講的是 Appier 的九個產品，91APP 入庫後要明確限定範圍，
// 否則測試會在資料擴充時失敗於「數字變了」而不是「規則被違反」
const products = snapshot.products.filter((p) => p.vendor_id === 'appier');
const app91Products = snapshot.products.filter((p) => p.vendor_id === '91app');

describe('pricingTransparency', () => {
  it('公開自助訂閱得滿分', () => {
    const adcreative = products.find((p) => p.id === 'adcreative_ai');
    expect(adcreative).toBeDefined();
    expect(pricingTransparency(adcreative!)).toBe(1);
  });

  it('成效計價介於公開與報價制之間', () => {
    const aideal = products.find((p) => p.id === 'aideal');
    expect(aideal).toBeDefined();
    expect(pricingTransparency(aideal!)).toBe(0.6);
  });

  it('企業報價制為 0——簽約前算不出來', () => {
    const aiqua = products.find((p) => p.id === 'aiqua');
    expect(aiqua).toBeDefined();
    expect(pricingTransparency(aiqua!)).toBe(0);
  });
});

describe('scoreProducts', () => {
  it('九個產品全部算得出分數', () => {
    expect(scoreProducts(products)).toHaveLength(9);
  });

  it('口碑分在 M1 一律為 null，不以 0 分冒充無資料', () => {
    for (const score of scoreProducts(snapshot.products)) {
      expect(score.reputation).toBeNull();
    }
  });

  it('91APP 七個產品也都算得出分數', () => {
    expect(scoreProducts(app91Products)).toHaveLength(7);
  });
});

describe('資料層硬規則的迴歸測試', () => {
  it('兩家所有產品的 adoption.rating 全為 null——口碑軸沒有資料可畫', () => {
    expect(snapshot.products.every((p) => p.adoption.rating === null)).toBe(true);
  });

  it('91APP 的產品全部無公開定價', () => {
    expect(app91Products.every((p) => p.pricing.public === false)).toBe(true);
  });

  it('公開得出價格的產品只有兩個', () => {
    expect(transparentPricingShare(products)).toBeCloseTo(2 / 9, 5);
  });

  it('countUnknown 數得出定價查不到的產品數', () => {
    expect(countUnknown(products, (p) => p.pricing)).toBeGreaterThan(0);
  });
});
