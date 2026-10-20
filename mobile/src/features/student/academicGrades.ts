import type { ApiCourseUnit, ApiEnrollment } from './studentApi.ts';

export type GradeInput = { courseUnitCode: string; grade: string; academicYear: string; attempt: string };
export type NewEnrollment = { courseUnitCode: string; grade: number; academicYear: number; attempt: number };
export type CourseHistory = { code: string; name: string; unit: ApiCourseUnit | null; attempts: ApiEnrollment[]; latestGraded: ApiEnrollment | null };
export type GradeGroup = { key: string; title: string; courses: CourseHistory[] };

const byNewest = (a: ApiEnrollment, b: ApiEnrollment) => b.attempt - a.attempt || b.academicYear - a.academicYear || b.id - a.id;

export function histories(enrollments: ApiEnrollment[], catalog: ApiCourseUnit[]): CourseHistory[] {
  const units = new Map(catalog.map((unit) => [unit.code.toUpperCase(), unit]));
  const rows = new Map<string, ApiEnrollment[]>();
  for (const enrollment of enrollments) {
    const code = enrollment.courseUnitCode.toUpperCase();
    rows.set(code, [...(rows.get(code) ?? []), enrollment]);
  }
  return [...rows.entries()].map(([code, attempts]) => {
    const sorted = [...attempts].sort(byNewest);
    return {
      code, name: units.get(code)?.name ?? sorted[0].courseUnitName,
      unit: units.get(code) ?? null, attempts: sorted,
      latestGraded: sorted.find((item) => item.grade !== null) ?? null,
    };
  }).sort((a, b) => a.name.localeCompare(b.name, 'pt-PT'));
}

export function gradeSummary(enrollments: ApiEnrollment[]) {
  const graded = histories(enrollments, []).flatMap((course) => course.latestGraded ? [course.latestGraded.grade!] : []);
  return { count: graded.length, mean: graded.length ? graded.reduce((sum, value) => sum + value, 0) / graded.length : null };
}

export function groupHistories(enrollments: ApiEnrollment[], catalog: ApiCourseUnit[]): GradeGroup[] {
  const groups = new Map<string, GradeGroup>();
  for (const course of histories(enrollments, catalog)) {
    const unit = course.unit;
    const key = unit ? `${unit.curricularYear}-${unit.semester}` : 'unknown';
    const title = unit ? `${unit.curricularYear}.º ano · ${unit.semester}.º semestre` : 'Sem organização no catálogo';
    if (!groups.has(key)) groups.set(key, { key, title, courses: [] });
    groups.get(key)!.courses.push(course);
  }
  return [...groups.values()].sort((a, b) => a.key === 'unknown' ? 1 : b.key === 'unknown' ? -1 : a.key.localeCompare(b.key));
}

export function searchCourseUnits(catalog: ApiCourseUnit[], query: string): ApiCourseUnit[] {
  const needle = query.trim().toLocaleLowerCase('pt-PT');
  if (!needle) return [];
  return catalog.filter((unit) => `${unit.code} ${unit.name}`.toLocaleLowerCase('pt-PT').includes(needle)).slice(0, 8);
}

export function suggestedAttempt(code: string, enrollments: ApiEnrollment[]): number {
  const attempts = enrollments.filter((item) => item.courseUnitCode.toUpperCase() === code.toUpperCase()).map((item) => item.attempt);
  return attempts.length ? Math.max(...attempts) + 1 : 1;
}

export function validateGradeInput(input: GradeInput, catalog: ApiCourseUnit[], enrollments: ApiEnrollment[]): NewEnrollment {
  const unit = catalog.find((item) => item.code === input.courseUnitCode);
  if (!unit) throw new Error('Seleciona uma unidade curricular existente no catálogo.');

  const gradeText = input.grade.trim();
  if (!/^\d{1,2}(?:[,.]\d{1,2})?$/.test(gradeText)) throw new Error('Introduz uma nota de 0 a 20, com até duas casas decimais.');
  const grade = Number(gradeText.replace(',', '.'));
  if (grade < 0 || grade > 20) throw new Error('A nota deve estar entre 0 e 20.');

  const yearText = input.academicYear.trim();
  const academicYear = Number(yearText);
  if (!/^\d{4}$/.test(yearText) || academicYear < 2000 || academicYear > 2100) throw new Error('Introduz o ano inicial do ano letivo, entre 2000 e 2100.');

  const attemptText = input.attempt.trim();
  const attempt = Number(attemptText);
  if (!/^\d{1,2}$/.test(attemptText) || attempt < 1 || attempt > 20) throw new Error('A tentativa deve ser um número de 1 a 20.');
  if (enrollments.some((item) => item.courseUnitCode.toUpperCase() === unit.code.toUpperCase() && item.attempt === attempt)) {
    throw new Error('Esta tentativa da cadeira já existe no histórico do aluno.');
  }
  return { courseUnitCode: unit.code, grade, academicYear, attempt };
}

export function formatGrade(value: number): string {
  return value.toLocaleString('pt-PT', { minimumFractionDigits: 0, maximumFractionDigits: 2 });
}
