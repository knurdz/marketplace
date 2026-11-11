/** Short axis label for daily `YYYY-MM-DD` buckets. */
export function formatDayBucketLabel(bucket: string): string {
  try {
    const [year, month, day] = bucket.split("-").map(Number);
    if (!year || !month || !day) return bucket;
    return new Intl.DateTimeFormat(undefined, {
      month: "short",
      day: "numeric",
      timeZone: "UTC",
    }).format(new Date(Date.UTC(year, month - 1, day)));
  } catch {
    return bucket;
  }
}

/** Short axis label for monthly `YYYY-MM` buckets. */
export function formatMonthBucketLabel(bucket: string): string {
  const [year, month] = bucket.split("-");
  if (!year || !month) return bucket;
  try {
    return new Intl.DateTimeFormat(undefined, {
      month: "short",
      year: "2-digit",
      timeZone: "UTC",
    }).format(new Date(Date.UTC(Number(year), Number(month) - 1, 1)));
  } catch {
    return bucket;
  }
}
