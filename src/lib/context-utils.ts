import type { ContextEntry } from '../types';

export function parseMultiValue(input?: string): string[] {
  if (!input) {
    return [];
  }

  return input
    .split(';;')
    .map((value) => value.trim())
    .filter((value) => value.length > 0);
}

export function sortByTimestampAsc(entries: ContextEntry[]): ContextEntry[] {
  return [...entries].sort((a, b) => a.timestamp.localeCompare(b.timestamp));
}

export function sortByTimestampDesc(entries: ContextEntry[]): ContextEntry[] {
  return [...entries].sort((a, b) => b.timestamp.localeCompare(a.timestamp));
}

export function clampCount(value: number, min = 1, max = 100): number {
  if (!Number.isFinite(value)) {
    return min;
  }

  return Math.min(max, Math.max(min, Math.trunc(value)));
}
