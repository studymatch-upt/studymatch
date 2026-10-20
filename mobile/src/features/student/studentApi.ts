import type { ApiProfile } from './competencyProfile.ts';
import { competencies, type Competency } from './questionnaire.ts';
import { validateGradeInput, type GradeInput } from './academicGrades.ts';

export type ApiStudent = {
  id: number;
  name: string;
  email: string;
  studentNumber: string | null;
  curricularYear: number | null;
};

export type ApiQuestionnaire = { answers: Partial<Record<Competency, number>> };
export type ApiEnrollment = {
  id: number;
  courseUnitCode: string;
  courseUnitName: string;
  academicYear: number;
  academicYearLabel: string;
  attempt: number;
  grade: number | null;
};

export type ApiCourseUnit = {
  id: number;
  code: string;
  name: string;
  curricularYear: number;
  semester: number;
};

export type OfficialStudentData = {
  student: ApiStudent;
  questionnaire: ApiQuestionnaire;
  enrollments: ApiEnrollment[];
  profile: ApiProfile;
};

export const demoStudentEmails = ['carla@school.test', 'diogo@school.test'] as const;
export type DemoStudentEmail = typeof demoStudentEmails[number];
const competencyKeys = new Set<string>(competencies.map(({ key }) => key));

function apiBase() {
  const value = process.env.EXPO_PUBLIC_STUDYMATCH_API_URL?.trim().replace(/\/+$/, '');
  if (!value || !/^https?:\/\/[^/]+/i.test(value)) {
    throw new Error('Configura EXPO_PUBLIC_STUDYMATCH_API_URL com o endereço do backend acessível pelo iPhone.');
  }
  return value;
}

async function getJson(path: string): Promise<unknown> {
  return requestJson(path, { method: 'GET' });
}

async function requestJson(path: string, options: RequestInit): Promise<unknown> {
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), 10000);
  try {
    const response = await fetch(`${apiBase()}${path}`, { ...options, signal: controller.signal });
    if (!response.ok) throw new Error(`O servidor respondeu ${response.status}.`);
    return await response.json();
  } catch (error) {
    if (error instanceof Error && error.name === 'AbortError') throw new Error('O servidor demorou demasiado a responder.');
    if (error instanceof TypeError) throw new Error('Sem ligação ao backend. Confirma o endereço da API e a rede do iPhone.');
    throw error;
  } finally {
    clearTimeout(timeout);
  }
}

function courseUnit(value: unknown): ApiCourseUnit {
  const data = object(value);
  if (typeof data.code !== 'string' || typeof data.name !== 'string') throw new Error('Dados de unidade curricular inválidos no backend.');
  return {
    id: number(data.id), code: data.code, name: data.name,
    curricularYear: number(data.curricularYear), semester: number(data.semester),
  };
}

function object(value: unknown): Record<string, unknown> {
  if (!value || typeof value !== 'object' || Array.isArray(value)) throw new Error('Resposta inesperada do backend.');
  return value as Record<string, unknown>;
}

function number(value: unknown): number {
  if (typeof value !== 'number' || !Number.isFinite(value)) throw new Error('Resposta numérica inválida do backend.');
  return value;
}

function student(value: unknown): ApiStudent {
  const data = object(value);
  if (typeof data.name !== 'string' || typeof data.email !== 'string' || (data.studentNumber !== null && typeof data.studentNumber !== 'string')) {
    throw new Error('Dados de aluno inválidos no backend.');
  }
  return {
    id: number(data.id), name: data.name, email: data.email, studentNumber: data.studentNumber,
    curricularYear: data.curricularYear == null ? null : number(data.curricularYear),
  };
}

function scores(value: unknown): Partial<Record<Competency, number>> {
  const data = object(value);
  const result: Partial<Record<Competency, number>> = {};
  for (const [key, score] of Object.entries(data)) {
    if (competencyKeys.has(key)) {
      const parsed = number(score);
      if (parsed < 0 || parsed > 100) throw new Error('Pontuação de competência inválida.');
      result[key as Competency] = parsed;
    }
  }
  return result;
}

function profile(value: unknown, studentId: number): ApiProfile {
  const data = object(value);
  if (number(data.studentId) !== studentId || !Array.isArray(data.unknownCompetencies)) {
    throw new Error('O perfil recebido não pertence ao aluno selecionado.');
  }
  const questionnaireWeight = number(data.questionnaireWeight);
  const academicWeight = number(data.academicWeight);
  if (questionnaireWeight < 0 || questionnaireWeight > 1 || academicWeight < 0 || academicWeight > 1) {
    throw new Error('Ponderação inválida no perfil recebido.');
  }
  return {
    studentId, scores: scores(data.scores), questionnaireWeight, academicWeight,
    completedCourseUnits: number(data.completedCourseUnits),
    unknownCompetencies: data.unknownCompetencies.filter((key): key is Competency => typeof key === 'string' && competencyKeys.has(key)),
  };
}

function questionnaire(value: unknown): ApiQuestionnaire {
  const data = object(value);
  return { answers: scoresFromAnswers(data.answers) };
}

function scoresFromAnswers(value: unknown): Partial<Record<Competency, number>> {
  const data = object(value);
  const answers: Partial<Record<Competency, number>> = {};
  for (const [key, answer] of Object.entries(data)) {
    if (competencyKeys.has(key)) {
      const parsed = number(answer);
      if (!Number.isInteger(parsed) || parsed < 1 || parsed > 5) throw new Error('Resposta de questionário inválida.');
      answers[key as Competency] = parsed;
    }
  }
  return answers;
}

function enrollment(value: unknown): ApiEnrollment {
  const data = object(value);
  if (typeof data.courseUnitCode !== 'string' || typeof data.courseUnitName !== 'string' || typeof data.academicYearLabel !== 'string') {
    throw new Error('Dados de inscrição inválidos no backend.');
  }
  return {
    id: number(data.id), courseUnitCode: data.courseUnitCode, courseUnitName: data.courseUnitName,
    academicYear: number(data.academicYear), academicYearLabel: data.academicYearLabel,
    attempt: number(data.attempt), grade: data.grade == null ? null : number(data.grade),
  };
}

export async function getDemoStudents(): Promise<ApiStudent[]> {
  const data = await getJson('/api/students');
  if (!Array.isArray(data)) throw new Error('Lista de alunos inválida no backend.');
  const students = data.map(student);
  return demoStudentEmails.flatMap((email) => students.filter((item) => item.email.toLowerCase() === email));
}

export async function getDemoStudentByEmail(email: DemoStudentEmail): Promise<ApiStudent> {
  const students = await getDemoStudents();
  const selected = students.find((item) => item.email.toLowerCase() === email);
  if (!selected) throw new Error(`A conta de teste ${email} não foi encontrada no backend.`);
  return selected;
}

export async function getCourseUnits(): Promise<ApiCourseUnit[]> {
  const data = await getJson('/api/course-units');
  if (!Array.isArray(data)) throw new Error('Catálogo de unidades curriculares inválido no backend.');
  return data.map(courseUnit);
}

export async function getStudentEnrollments(studentId: number): Promise<ApiEnrollment[]> {
  if (!Number.isSafeInteger(studentId) || studentId <= 0) throw new Error('Identificador de aluno inválido.');
  const data = await getJson(`/api/students/${studentId}/enrollments`);
  if (!Array.isArray(data)) throw new Error('Lista de inscrições inválida no backend.');
  return data.map(enrollment);
}

export async function addStudentGrade(studentId: number, input: GradeInput, catalog: ApiCourseUnit[], knownEnrollments: ApiEnrollment[]): Promise<ApiEnrollment> {
  if (!__DEV__) throw new Error('Adicionar notas está disponível apenas em desenvolvimento.');
  if (!Number.isSafeInteger(studentId) || studentId <= 0) throw new Error('Identificador de aluno inválido.');
  validateGradeInput(input, catalog, knownEnrollments);
  // Recheck the server immediately before writing; its attempt key excludes academicYear.
  const current = await getStudentEnrollments(studentId);
  const body = validateGradeInput(input, catalog, current);
  const created = await requestJson(`/api/students/${studentId}/enrollments`, {
    method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(body),
  });
  return enrollment(created);
}

export async function getOfficialStudentData(studentId: number): Promise<OfficialStudentData> {
  if (!Number.isSafeInteger(studentId) || studentId <= 0) throw new Error('Identificador de aluno inválido.');
  const path = `/api/students/${studentId}`;
  const [rawStudent, rawQuestionnaire, enrollments, rawProfile] = await Promise.all([
    getJson(path), getJson(`${path}/questionnaire`), getStudentEnrollments(studentId), getJson(`${path}/profile`),
  ]);
  const selected = student(rawStudent);
  if (selected.id !== studentId || !demoStudentEmails.some((email) => email === selected.email.toLowerCase())) {
    throw new Error('O aluno selecionado já não corresponde ao catálogo demonstrativo.');
  }
  return {
    student: selected, questionnaire: questionnaire(rawQuestionnaire),
    enrollments, profile: profile(rawProfile, studentId),
  };
}
