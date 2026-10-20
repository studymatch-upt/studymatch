// Calendar days are created at local midday so DST changes do not shift a date.
export function localDay(year: number, month: number, day: number): Date {
  return new Date(year, month, day, 12);
}

export function mondayIndex(date: Date): number {
  return (date.getDay() + 6) % 7;
}

export function weekFrom(date: Date): Date[] {
  const start = localDay(date.getFullYear(), date.getMonth(), date.getDate() - mondayIndex(date));
  return Array.from({ length: 7 }, (_, i) => localDay(start.getFullYear(), start.getMonth(), start.getDate() + i));
}

export function monthRows(year: number, month: number): (Date | null)[][] {
  const first = localDay(year, month, 1);
  const offset = mondayIndex(first);
  const dayCount = localDay(year, month + 1, 0).getDate();
  const cells = Math.ceil((offset + dayCount) / 7) * 7;
  return Array.from({ length: cells / 7 }, (_, row) =>
    Array.from({ length: 7 }, (_, column) => {
      const day = row * 7 + column - offset + 1;
      return day >= 1 && day <= dayCount ? localDay(year, month, day) : null;
    }),
  );
}

export function sameDay(a: Date, b: Date): boolean {
  return a.getFullYear() === b.getFullYear() && a.getMonth() === b.getMonth() && a.getDate() === b.getDate();
}
