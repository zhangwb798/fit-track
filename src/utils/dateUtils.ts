import { loadRecords, type WorkoutRecord } from '../data/storage';
import { loadConfig } from '../data/config';
import type { BodyPart } from '../types/bodyPart';

export function formatDate(d: Date): string {
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  return `${y}-${m}-${day}`;
}

export function parseDate(s: string): Date {
  const [y, m, d] = s.split('-').map(Number);
  return new Date(y, m - 1, d);
}

export function todayStr(): string {
  return formatDate(new Date());
}

// 获取周一为一周第一天
export function startOfWeek(d: Date): Date {
  const date = new Date(d);
  const day = date.getDay(); // 0=周日
  const diff = day === 0 ? -6 : 1 - day;
  date.setDate(date.getDate() + diff);
  date.setHours(0, 0, 0, 0);
  return date;
}

export function endOfWeek(d: Date): Date {
  const start = startOfWeek(d);
  const end = new Date(start);
  end.setDate(start.getDate() + 6);
  end.setHours(23, 59, 59, 999);
  return end;
}

export function startOfMonth(d: Date): Date {
  return new Date(d.getFullYear(), d.getMonth(), 1);
}

export function endOfMonth(d: Date): Date {
  return new Date(d.getFullYear(), d.getMonth() + 1, 0, 23, 59, 59, 999);
}

export function startOfYear(d: Date): Date {
  return new Date(d.getFullYear(), 0, 1);
}

export function endOfYear(d: Date): Date {
  return new Date(d.getFullYear(), 11, 31, 23, 59, 59, 999);
}

export function daysBetween(a: Date, b: Date): number {
  const ms = Math.abs(b.getTime() - a.getTime());
  return Math.floor(ms / (1000 * 60 * 60 * 24));
}

export function getWeekDates(ref: Date): Date[] {
  const start = startOfWeek(ref);
  const dates: Date[] = [];
  for (let i = 0; i < 7; i++) {
    const d = new Date(start);
    d.setDate(start.getDate() + i);
    dates.push(d);
  }
  return dates;
}

export function getMonthDates(ref: Date): Date[] {
  const start = startOfMonth(ref);
  const end = endOfMonth(ref);
  const dates: Date[] = [];
  let d = new Date(start);
  while (d <= end) {
    dates.push(new Date(d));
    d.setDate(d.getDate() + 1);
  }
  return dates;
}

export function isSameDay(a: Date, b: Date): boolean {
  return (
    a.getFullYear() === b.getFullYear() &&
    a.getMonth() === b.getMonth() &&
    a.getDate() === b.getDate()
  );
}

// 在范围内的打卡日期集合（去重）
function uniqueDatesInRange(records: WorkoutRecord[], start: Date, end: Date): Set<string> {
  const set = new Set<string>();
  const s = start.getTime();
  const e = end.getTime();
  for (const r of records) {
    const t = parseDate(r.date).getTime();
    if (t >= s && t <= e) set.add(r.date);
  }
  return set;
}

// 出勤率 = 打卡天数 / 总天数
export function attendanceRate(start: Date, end: Date): { rate: number; checked: number; total: number } {
  const records = loadRecords();
  const checkedSet = uniqueDatesInRange(records, start, end);
  const total = daysBetween(start, end) + 1;
  const rate = total === 0 ? 0 : checkedSet.size / total;
  return { rate, checked: checkedSet.size, total };
}

// 今日之前的出勤（用于本周/本月截止今日）
export function attendanceRateToToday(start: Date): { rate: number; checked: number; total: number } {
  const today = new Date();
  today.setHours(23, 59, 59, 999);
  const end = today < endOfYear(today) ? today : endOfYear(today);
  return attendanceRate(start, end);
}

// 部位统计
export function partsStats(start: Date, end: Date): { part: BodyPart; count: number }[] {
  const records = loadRecords();
  const s = start.getTime();
  const e = end.getTime();
  const map = new Map<BodyPart, number>();
  for (const r of records) {
    const t = parseDate(r.date).getTime();
    if (t < s || t > e) continue;
    for (const p of r.parts) {
      map.set(p, (map.get(p) ?? 0) + 1);
    }
  }
  return Array.from(map.entries())
    .map(([part, count]) => ({ part, count }))
    .sort((a, b) => b.count - a.count);
}

// 原始打卡次数（不包含历史初始值）
export function rawWorkoutCount(): number {
  return loadRecords().length;
}

// 累计健身次数 = 历史初始次数 + 实际打卡次数
export function totalWorkouts(): number {
  const config = loadConfig();
  const base = config.historicalCount ?? 0;
  return base + loadRecords().length;
}

// 原始第一次健身日期（从打卡记录推算）
export function rawFirstWorkoutDate(): string | null {
  const records = loadRecords();
  if (records.length === 0) return null;
  let min = records[0].date;
  for (const r of records) {
    if (r.date < min) min = r.date;
  }
  return min;
}

// 第一次健身日期：优先取用户设置，否则从打卡记录推算
export function firstWorkoutDate(): string | null {
  const config = loadConfig();
  if (config.firstWorkoutDate) return config.firstWorkoutDate;
  return rawFirstWorkoutDate();
}

// 历史初始次数
export function historicalCount(): number {
  const config = loadConfig();
  return config.historicalCount ?? 0;
}

// 总打卡天数（去重，仅来自本地打卡记录）
export function totalDays(): number {
  const records = loadRecords();
  const set = new Set(records.map((r) => r.date));
  return set.size;
}

// 坚持天数：从第一次健身到今天的天数（含首尾）
export function streakDays(): number {
  const first = firstWorkoutDate();
  if (!first) return 0;
  return daysBetween(parseDate(first), new Date()) + 1;
}
