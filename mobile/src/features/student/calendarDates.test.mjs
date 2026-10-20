import assert from 'node:assert/strict';
import test from 'node:test';
import { localDay, monthRows, sameDay, weekFrom } from './calendarDates.ts';

test('October 2026 keeps Monday to Sunday in seven fixed columns', () => {
  const rows = monthRows(2026, 9);
  assert.ok(rows.every((row) => row.length === 7));
  assert.deepEqual(rows[0].map((day) => day?.getDate() ?? null), [null, null, null, 1, 2, 3, 4]);
  assert.equal(rows.at(-1)?.[5]?.getDate(), 31);
  assert.equal(rows.at(-1)?.[6], null);
  rows.forEach((row) => row.forEach((day, column) => {
    if (day) assert.equal((day.getDay() + 6) % 7, column);
  }));
});

test('weekly view includes Sunday after Saturday across a month boundary', () => {
  const week = weekFrom(localDay(2026, 9, 30));
  assert.deepEqual(week.map((day) => [day.getMonth(), day.getDate()]), [[9, 26], [9, 27], [9, 28], [9, 29], [9, 30], [9, 31], [10, 1]]);
  assert.equal(week[6].getDay(), 0);
});

test('leap February and same-day comparison remain correct', () => {
  const rows = monthRows(2024, 1);
  assert.equal(rows.flat().filter(Boolean).length, 29);
  assert.ok(sameDay(rows[4][3], localDay(2024, 1, 29)));
  assert.equal(sameDay(localDay(2024, 1, 29), localDay(2024, 2, 1)), false);
});
