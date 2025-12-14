// utils/formatters.ts
export function formatTime(seconds: number): string {
  if (!seconds || seconds <= 0) return '00:00';

  const m = Math.floor(seconds / 60);
  const s = seconds % 60;

  return `${m.toString().padStart(2, '0')}:${s
    .toString()
    .padStart(2, '0')}`;
}

export function formatFileSize(bytes: number): string {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 ** 2)
    return `${(bytes / 1024).toFixed(1)} KB`;
  if (bytes < 1024 ** 3)
    return `${(bytes / 1024 ** 2).toFixed(1)} MB`;

  return `${(bytes / 1024 ** 3).toFixed(1)} GB`;
}
