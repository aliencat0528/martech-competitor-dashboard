import type { Vendor } from '../types/data';

/** `null` 代表兩家一起看（比較模式） */
export type VendorScope = string | null;

/**
 * 廠商下拉選單。切到單一廠商時，Zone C／D／E 只呈現那一家的產品；
 * 選「兩家比較」則全部一起畫。
 *
 * 收錄深度不同的廠商要在選項裡就標出來——切過去之後才發現資料少，
 * 會被讀成系統壞了而不是資料就是這樣。
 */
export function VendorPicker({
  vendors,
  value,
  onChange,
  productCounts,
}: {
  vendors: Vendor[];
  value: VendorScope;
  onChange: (next: VendorScope) => void;
  productCounts: Map<string, number>;
}) {
  return (
    <div className="vendor-picker">
      <label htmlFor="vendor-scope">檢視範圍</label>
      <select
        id="vendor-scope"
        value={value ?? '__all__'}
        onChange={(event) => onChange(event.target.value === '__all__' ? null : event.target.value)}
      >
        <option value="__all__">
          兩家比較（{vendors.map((v) => v.name).join(' × ')}）
        </option>
        {vendors.map((vendor) => (
          <option key={vendor.id} value={vendor.id}>
            {vendor.name} 單獨檢視（{productCounts.get(vendor.id) ?? 0} 個產品）
          </option>
        ))}
      </select>
      <span className="picker-hint">
        {value === null
          ? '同時呈現兩家，能力矩陣與定位圖都是跨廠商的'
          : '只呈現這一家的產品資訊與分析'}
      </span>
    </div>
  );
}
