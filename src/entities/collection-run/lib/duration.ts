import { dayjs } from '@/shared/lib';

export function durationSeconds(startISO: string, endISO: string | null): number | null {
  if (!endISO) return null;
  const diff = dayjs(endISO).diff(dayjs(startISO), 'second');
  return diff >= 0 ? diff : null;
}

export function formatDuration(startISO: string, endISO: string | null): string {
  const seconds = durationSeconds(startISO, endISO);
  if (seconds == null) return '—';
  if (seconds < 60) return `${seconds} сек`;
  const minutes = Math.floor(seconds / 60);
  const restSec = seconds % 60;
  if (minutes < 60) return restSec === 0 ? `${minutes} мин` : `${minutes} мин ${restSec} сек`;
  const hours = Math.floor(minutes / 60);
  const restMin = minutes % 60;
  return restMin === 0 ? `${hours} ч` : `${hours} ч ${restMin} мин`;
}
