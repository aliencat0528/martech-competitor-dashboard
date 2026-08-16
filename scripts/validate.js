#!/usr/bin/env node
/**
 * 資料契約檢查。
 *
 * 兩件事這支腳本必須做對，否則它比沒有還糟：
 * 1. **實作就近繼承**（← MC-013）。不實作會誤報 115 筆，而一支狼來了的檢查沒有人會理。
 * 2. **只對 latest 快照 fail**（← MC-012 規則 7）。歷史快照不可修，讓它擋 CI 只會逼人改歷史。
 */

import { readFileSync, readdirSync, statSync } from 'node:fs';
import { join } from 'node:path';

const DATA_DIR = 'data';
const CONFIDENCE_VALUES = ['verified', 'claimed', 'inferred', 'none'];
const DATE_DIR = /^\d{4}-\d{2}-\d{2}$/;

function readJson(path) {
  return JSON.parse(readFileSync(path, 'utf8'));
}

/**
 * 沿著祖層走一遍，帶著已經看到的 source_url / captured_at 往下傳。
 * 這就是繼承鏈本身——子節點沒帶就用上面傳下來的。
 */
function walk(node, path, inherited, findings) {
  if (Array.isArray(node)) {
    node.forEach((item, index) => walk(item, `${path}[${index}]`, inherited, findings));
    return;
  }
  if (node === null || typeof node !== 'object') return;

  const sourceUrl = node.source_url ?? inherited.sourceUrl;
  const capturedAt = node.captured_at ?? inherited.capturedAt;

  if ('confidence' in node) {
    if (!CONFIDENCE_VALUES.includes(node.confidence)) {
      findings.push({ path, rule: 2, message: `confidence 為四態外的值：${node.confidence}` });
    }
    if (!capturedAt) {
      findings.push({ path, rule: 1, message: '繼承鏈上取不到 captured_at' });
    }
    if (!sourceUrl && node.confidence !== 'none') {
      findings.push({
        path,
        rule: 1,
        message: `繼承鏈上取不到 source_url，且 confidence 為 ${node.confidence}（非 none）`,
      });
    }
    if (sourceUrl && node.confidence === 'none' && node.value !== null) {
      // 不擋，只是提醒：none 通常應該搭配 null 值
      findings.push({ path, rule: 3, message: 'confidence 為 none 但值不是 null', warn: true });
    }
  }

  for (const [key, value] of Object.entries(node)) {
    walk(value, `${path}.${key}`, { sourceUrl, capturedAt }, findings);
  }
}

function checkSnapshot(date) {
  const dir = join(DATA_DIR, date);
  const findings = [];
  for (const file of readdirSync(dir).filter((f) => f.endsWith('.json'))) {
    const json = readJson(join(dir, file));
    walk(json, `${date}/${file}`, { sourceUrl: json.source_url, capturedAt: json.captured_at }, findings);
  }
  return findings;
}

function main() {
  const manifest = readJson(join(DATA_DIR, 'manifest.json'));
  const dates = readdirSync(DATA_DIR)
    .filter((name) => DATE_DIR.test(name) && statSync(join(DATA_DIR, name)).isDirectory())
    .sort();

  const declared = manifest.snapshots.map((s) => s.date).sort();
  if (JSON.stringify(dates) !== JSON.stringify(declared)) {
    console.error(`✗ manifest 與實際目錄不符\n  manifest: ${declared}\n  實際:     ${dates}`);
    process.exit(1);
  }

  let failed = false;
  for (const date of dates) {
    const isLatest = date === manifest.latest;
    const findings = checkSnapshot(date);
    const errors = findings.filter((f) => !f.warn);

    if (errors.length === 0) {
      console.log(`✓ ${date}${isLatest ? '（latest）' : '（歷史）'} — 契約無違規`);
      continue;
    }

    if (isLatest) {
      failed = true;
      console.error(`✗ ${date}（latest）— ${errors.length} 筆違規：`);
      for (const f of errors.slice(0, 20)) console.error(`    規則 ${f.rule} · ${f.path} — ${f.message}`);
      if (errors.length > 20) console.error(`    …另有 ${errors.length - 20} 筆`);
    } else {
      // 歷史快照不可修，列報告不列失敗（← 資料層硬規則 7）
      console.log(`· ${date}（歷史，不可修）— ${errors.length} 筆早於 MC-013 的資料，列為報告`);
    }
  }

  if (failed) {
    console.error('\n契約檢查失敗：latest 快照有違規。');
    process.exit(1);
  }
  console.log('\n契約檢查通過。');
}

main();
