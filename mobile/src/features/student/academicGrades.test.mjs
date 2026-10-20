import assert from 'node:assert/strict';
import test from 'node:test';
import { formatGrade, gradeSummary, groupHistories, searchCourseUnits, suggestedAttempt, validateGradeInput } from './academicGrades.ts';

const catalog = [
  { id: 1, code: 'AM', name: 'Análise Matemática', curricularYear: 1, semester: 1 },
  { id: 2, code: 'AED', name: 'Algoritmos e Estruturas de Dados', curricularYear: 1, semester: 2 },
  { id: 3, code: 'BD', name: 'Bases de Dados', curricularYear: 2, semester: 1 },
];
const enrollment = (id, courseUnitCode, grade, attempt, academicYear = 2024) => ({
  id, courseUnitCode, courseUnitName: catalog.find((unit) => unit.code === courseUnitCode)?.name ?? 'Outra cadeira',
  grade, attempt, academicYear, academicYearLabel: `${academicYear}/${String((academicYear + 1) % 100).padStart(2, '0')}`,
});
const carla = [enrollment(1, 'AM', 14, 1), enrollment(2, 'AED', 8, 1), enrollment(3, 'AED', 16, 2, 2025), enrollment(4, 'BD', 17, 1)];

test('simple mean uses one latest graded attempt per unit, retaining the full history', () => {
  const summary = gradeSummary(carla);
  assert.equal(summary.count, 3);
  assert.ok(Math.abs(summary.mean - 47 / 3) < 0.00001);
  const groups = groupHistories(carla, catalog);
  assert.deepEqual(groups.map(({ title }) => title), ['1.º ano · 1.º semestre', '1.º ano · 2.º semestre', '2.º ano · 1.º semestre']);
  assert.deepEqual(groups[1].courses[0].attempts.map(({ grade }) => grade), [16, 8]);
  assert.equal(gradeSummary([]).mean, null);
  assert.deepEqual(gradeSummary([enrollment(5, 'AM', null, 1)]), { count: 0, mean: null });
  assert.equal(formatGrade(summary.mean), '15,67');
});

test('catalog search, next attempt and grade validation use existing course codes', () => {
  assert.deepEqual(searchCourseUnits(catalog, 'algoritmos').map(({ code }) => code), ['AED']);
  assert.deepEqual(searchCourseUnits(catalog, 'bd').map(({ code }) => code), ['BD']);
  assert.equal(suggestedAttempt('AED', carla), 3);
  assert.equal(suggestedAttempt('BD', []), 1);
  assert.deepEqual(validateGradeInput({ courseUnitCode: 'AED', grade: '14,25', academicYear: '2026', attempt: '3' }, catalog, carla), {
    courseUnitCode: 'AED', grade: 14.25, academicYear: 2026, attempt: 3,
  });
  for (const input of [
    { courseUnitCode: 'FAKE', grade: '14', academicYear: '2025', attempt: '1' },
    { courseUnitCode: 'AED', grade: '20,01', academicYear: '2025', attempt: '3' },
    { courseUnitCode: 'AED', grade: '14,123', academicYear: '2025', attempt: '3' },
    { courseUnitCode: 'AED', grade: '14', academicYear: '1999', attempt: '3' },
    { courseUnitCode: 'AED', grade: '14', academicYear: '2025', attempt: '21' },
    { courseUnitCode: 'AED', grade: '14', academicYear: '2026', attempt: '2' },
  ]) assert.throws(() => validateGradeInput(input, catalog, carla));
});
