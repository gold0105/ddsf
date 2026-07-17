// 사용자 활동 기록 저장소 (localStorage 기반, 서버 불필요)

export interface ScannerRecord {
  id: string;
  date: number; // epoch ms
  text: string;
  spamScore: number;
  isSpam: boolean;
  reasoning: string;
  actionGuide: string;
}

export interface QuizRecord {
  id: string;
  date: number;
  difficulty: "easy" | "medium" | "hard";
  playerScore: number;
  aiScore: number;
  total: number;
  aiName: string;
}

const SCANNER_KEY = "spam-guardian:scannerRecords";
const QUIZ_KEY = "spam-guardian:quizRecords";
const MAX_ITEMS = 100;

function read<T>(key: string): T[] {
  try {
    const raw = localStorage.getItem(key);
    if (!raw) return [];
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? (parsed as T[]) : [];
  } catch {
    return [];
  }
}

function write<T>(key: string, items: T[]): void {
  try {
    localStorage.setItem(key, JSON.stringify(items.slice(0, MAX_ITEMS)));
  } catch {
    // storage full or unavailable — 무시
  }
}

function makeId(): string {
  return `${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;
}

// ── Scanner ──

export function getScannerRecords(): ScannerRecord[] {
  return read<ScannerRecord>(SCANNER_KEY);
}

export function addScannerRecord(rec: Omit<ScannerRecord, "id" | "date">): void {
  const records = getScannerRecords();
  write(SCANNER_KEY, [{ ...rec, id: makeId(), date: Date.now() }, ...records]);
}

// ── Quiz ──

export function getQuizRecords(): QuizRecord[] {
  return read<QuizRecord>(QUIZ_KEY);
}

export function addQuizRecord(rec: Omit<QuizRecord, "id" | "date">): void {
  const records = getQuizRecords();
  write(QUIZ_KEY, [{ ...rec, id: makeId(), date: Date.now() }, ...records]);
}

// ── 요약/정리 ──

export function getBestScore(): number {
  return getQuizRecords().reduce((best, r) => Math.max(best, r.playerScore), 0);
}

export function clearScannerRecords(): void {
  write<ScannerRecord>(SCANNER_KEY, []);
}

export function clearQuizRecords(): void {
  write<QuizRecord>(QUIZ_KEY, []);
}

export function formatDate(ts: number): string {
  const d = new Date(ts);
  const pad = (n: number) => String(n).padStart(2, "0");
  return `${d.getFullYear()}.${pad(d.getMonth() + 1)}.${pad(d.getDate())} ${pad(d.getHours())}:${pad(d.getMinutes())}`;
}
