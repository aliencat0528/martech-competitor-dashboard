import type { Product } from '../types/data';

/**
 * L4 匯出層：CSV。前端字串組裝，零依賴（← MC-006）。
 * CSV 是資料表不是圖，**不含圖說**——圖說在此無對應物。
 */

function escapeCell(value: string | number | null): string {
  if (value === null) return '';
  const text = String(value);
  return /[",\n]/.test(text) ? `"${text.replace(/"/g, '""')}"` : text;
}

const HEADERS = [
  '產品',
  '產品線',
  '分類',
  '買方角色',
  '計價模式',
  '定價公開',
  '定價信度',
  '第一方資料依賴',
  '取得難度',
  '擷取日',
] as const;

export function productsToCsv(products: Product[], capturedAt: string): string {
  const rows = products.map((p) =>
    [
      p.name,
      p.line,
      p.category,
      p.buyer_role,
      p.pricing.model,
      p.pricing.public ? 'true' : 'false',
      p.pricing.confidence,
      p.first_party_data_dependency,
      p.acquisition_difficulty,
      p.pricing.captured_at ?? capturedAt,
    ]
      .map(escapeCell)
      .join(','),
  );
  return [HEADERS.join(','), ...rows].join('\n');
}
