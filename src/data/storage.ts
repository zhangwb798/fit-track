import type { BodyPart } from '../types/bodyPart';

export interface WorkoutRecord {
  id: string;
  date: string; // YYYY-MM-DD
  parts: BodyPart[];
  createdAt: number; // timestamp
  note?: string;
}

const STORAGE_KEY = 'fitness_records_v1';

export function loadRecords(): WorkoutRecord[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return [];
    const data = JSON.parse(raw) as WorkoutRecord[];
    return Array.isArray(data) ? data : [];
  } catch {
    return [];
  }
}

export function saveRecords(records: WorkoutRecord[]): void {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(records));
}

export function addRecord(date: string, parts: BodyPart[], note?: string): WorkoutRecord {
  const records = loadRecords();
  const record: WorkoutRecord = {
    id: `${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
    date,
    parts,
    createdAt: Date.now(),
    note,
  };
  records.push(record);
  saveRecords(records);
  return record;
}

export function deleteRecord(id: string): void {
  const records = loadRecords();
  const next = records.filter(r => r.id !== id);
  saveRecords(next);
}

export function getRecordsByDate(date: string): WorkoutRecord[] {
  return loadRecords().filter(r => r.date === date);
}

export function hasCheckedIn(date: string): boolean {
  return loadRecords().some(r => r.date === date);
}
