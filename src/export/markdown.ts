import type { Snapshot } from '../types/data';

/**
 * L4 匯出層：Markdown 報告全文，可直接貼進 Notion（← MC-006）。
 * **圖說兩塊隨對應圖表章節輸出**——Markdown 無圖，圖說即該圖唯一的文字化身（← MC-008）。
 */
export function snapshotToMarkdown(
  snapshot: Snapshot,
  captions: { title: string; howToRead: string; summary: string }[],
): string {
  const lines: string[] = [];

  lines.push('# MarTech 競品情報 Dashboard');
  lines.push('');
  lines.push(`> 快照日期：${snapshot.date}`);
  lines.push('');
  lines.push('## 收錄範圍');
  for (const vendor of snapshot.vendors) {
    const scope = vendor.record_scope?.level === 'vendor_only' ? '僅廠商層' : '完整';
    lines.push(`- **${vendor.name}**（${scope}）— ${vendor.positioning}`);
  }

  lines.push('');
  lines.push('## 圖表與圖說');
  for (const caption of captions) {
    lines.push('');
    lines.push(`### ${caption.title}`);
    lines.push('');
    lines.push(`**怎麼讀**：${caption.howToRead}`);
    lines.push('');
    lines.push(`**這張圖現在說什麼**：${caption.summary}`);
  }

  return lines.join('\n');
}
