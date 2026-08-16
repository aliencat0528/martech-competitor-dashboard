/**
 * 快照載入器。日期目錄的第一個消費者（← MC-012）。
 *
 * 用 `import.meta.glob` 讓快照在建置期併入 bundle——靜態部署沒有後端可以列目錄，
 * 執行期 fetch 得先知道有哪些檔案，而那份清單就是 manifest 本身，會變成雞生蛋。
 */

import manifestJson from '../../data/manifest.json';
import type {
  Capability,
  CellStateDef,
  Manifest,
  Matrix,
  Product,
  Snapshot,
  Vendor,
} from '../types/data';

const manifest = manifestJson as Manifest;

type JsonModule = Record<string, unknown>;

const snapshotFiles = import.meta.glob<JsonModule>('../../data/*/*.json', { eager: true });

/** 從 glob 的路徑鍵取出日期，例：'../../data/2026-08-14/vendors.json' → '2026-08-14' */
function parsePath(path: string): { date: string; file: string } | null {
  const match = /\/data\/([0-9]{4}-[0-9]{2}-[0-9]{2})\/([a-z]+)\.json$/.exec(path);
  if (!match) return null;
  return { date: match[1], file: match[2] };
}

function findFile(date: string, file: string): JsonModule | null {
  for (const [path, mod] of Object.entries(snapshotFiles)) {
    const parsed = parsePath(path);
    if (parsed && parsed.date === date && parsed.file === file) {
      // Vite 的 JSON 匯入會包在 default 底下
      return ((mod as { default?: JsonModule }).default ?? mod) as JsonModule;
    }
  }
  return null;
}

function readFile(date: string, file: string): JsonModule {
  const found = findFile(date, file);
  if (!found) throw new Error(`快照缺檔：data/${date}/${file}.json`);
  return found;
}

export function listSnapshotDates(): string[] {
  return manifest.snapshots.map((s) => s.date);
}

export function getManifest(): Manifest {
  return manifest;
}

export function loadSnapshot(date: string): Snapshot {
  const capabilitiesFile = readFile(date, 'capabilities');
  // 較早的快照沒有 matrix.json——這是合法狀態，不是缺檔錯誤
  const matrixFile = findFile(date, 'matrix');

  return {
    date,
    vendors: readFile(date, 'vendors').vendors as Vendor[],
    products: readFile(date, 'products').products as Product[],
    capabilities: capabilitiesFile.capabilities as Capability[],
    cellStates: capabilitiesFile.cell_states as CellStateDef[],
    agents: readFile(date, 'agents').agents as unknown[],
    matrix: matrixFile ? (matrixFile as unknown as Matrix) : null,
  };
}

export function loadLatest(): Snapshot {
  return loadSnapshot(manifest.latest);
}

/** 前一版快照。首版時為 `null`，呼叫端要處理這個情況，不要假設一定有前版 */
export function loadPrevious(): Snapshot | null {
  return manifest.previous ? loadSnapshot(manifest.previous) : null;
}
