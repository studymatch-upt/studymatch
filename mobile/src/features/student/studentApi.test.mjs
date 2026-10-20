import assert from 'node:assert/strict';
import test from 'node:test';
import { addStudentGrade, getCourseUnits, getDemoStudentByEmail, getDemoStudents, getOfficialStudentData } from './studentApi.ts';

const previousUrl = process.env.EXPO_PUBLIC_STUDYMATCH_API_URL;
const previousFetch = globalThis.fetch;

test('discovers real IDs and loads the four read-only resources for the selected student', async () => {
  process.env.EXPO_PUBLIC_STUDYMATCH_API_URL = 'http://example.test:8080/';
  const calls = [];
  globalThis.fetch = async (url, options) => {
    const path = new URL(url).pathname;
    calls.push({ path, method: options.method });
    const responses = {
      '/api/students': [
        { id: 71, name: 'Carla Mendes', email: 'carla@school.test', studentNumber: null, curricularYear: null },
        { id: 92, name: 'Diogo Ferreira', email: 'diogo@school.test', studentNumber: null, curricularYear: null },
      ],
      '/api/students/71': { id: 71, name: 'Carla Mendes', email: 'carla@school.test', studentNumber: null, curricularYear: null },
      '/api/students/71/questionnaire': { answers: { PROGRAMMING: 4 } },
      '/api/students/71/enrollments': [{ id: 9, courseUnitCode: 'AM', courseUnitName: 'Análise Matemática', academicYear: 2024, academicYearLabel: '2024/25', attempt: 1, grade: 14 }],
      '/api/students/71/profile': { studentId: 71, scores: { PROGRAMMING: 82 }, questionnaireWeight: 0.7, academicWeight: 0.3, completedCourseUnits: 1, unknownCompetencies: ['DATABASES'] },
    };
    assert.ok(path in responses, `unexpected request ${path}`);
    return { ok: true, json: async () => responses[path] };
  };
  try {
    const students = await getDemoStudents();
    assert.deepEqual(students.map(({ id }) => id), [71, 92]);
    assert.equal((await getDemoStudentByEmail('diogo@school.test')).id, 92);
    const data = await getOfficialStudentData(students[0].id);
    assert.equal(data.student.name, 'Carla Mendes');
    assert.equal(data.student.studentNumber, null);
    assert.equal(data.questionnaire.answers.PROGRAMMING, 4);
    assert.equal(data.enrollments[0].grade, 14);
    assert.equal(data.profile.scores.PROGRAMMING, 82);
    assert.equal(data.profile.questionnaireWeight, 0.7);
    assert.deepEqual(calls.map(({ path }) => path), ['/api/students', '/api/students', '/api/students/71', '/api/students/71/questionnaire', '/api/students/71/enrollments', '/api/students/71/profile']);
    assert.ok(calls.every(({ method }) => method === 'GET'));
  } finally {
    globalThis.fetch = previousFetch;
    if (previousUrl === undefined) delete process.env.EXPO_PUBLIC_STUDYMATCH_API_URL;
    else process.env.EXPO_PUBLIC_STUDYMATCH_API_URL = previousUrl;
  }
});

test('requires a configured API URL', async () => {
  delete process.env.EXPO_PUBLIC_STUDYMATCH_API_URL;
  try {
    await assert.rejects(getDemoStudents(), /EXPO_PUBLIC_STUDYMATCH_API_URL/);
  } finally {
    if (previousUrl !== undefined) process.env.EXPO_PUBLIC_STUDYMATCH_API_URL = previousUrl;
  }
});

test('catalog comes from GET and a mocked confirmed POST can be followed by refreshed profile data', async () => {
  process.env.EXPO_PUBLIC_STUDYMATCH_API_URL = 'http://example.test:8080';
  globalThis.__DEV__ = true;
  const calls = [];
  let saved = false;
  const student = { id: 92, name: 'Diogo Ferreira', email: 'diogo@school.test', studentNumber: '20240002', curricularYear: 2 };
  const created = { id: 12, courseUnitCode: 'AED', courseUnitName: 'Algoritmos e Estruturas de Dados', academicYear: 2025, academicYearLabel: '2025/26', attempt: 1, grade: 14 };
  globalThis.fetch = async (url, options) => {
    const path = new URL(url).pathname;
    calls.push({ path, method: options.method, body: options.body });
    const responses = {
      '/api/course-units': [{ id: 2, code: 'AED', name: 'Algoritmos e Estruturas de Dados', curricularYear: 1, semester: 2 }],
      '/api/students/92': student,
      '/api/students/92/questionnaire': { answers: { PROGRAMMING: 4 } },
      '/api/students/92/enrollments': saved ? [created] : [],
      '/api/students/92/profile': { studentId: 92, scores: { PROGRAMMING: saved ? 79 : 75 }, questionnaireWeight: saved ? 0.9 : 1, academicWeight: saved ? 0.1 : 0, completedCourseUnits: saved ? 1 : 0, unknownCompetencies: [] },
    };
    if (options.method === 'POST') {
      assert.equal(path, '/api/students/92/enrollments');
      assert.deepEqual(JSON.parse(options.body), { courseUnitCode: 'AED', grade: 14, academicYear: 2025, attempt: 1 });
      saved = true;
      return { ok: true, json: async () => created };
    }
    assert.ok(path in responses, `unexpected request ${path}`);
    return { ok: true, json: async () => responses[path] };
  };
  try {
    const catalog = await getCourseUnits();
    const result = await addStudentGrade(92, { courseUnitCode: 'AED', grade: '14', academicYear: '2025', attempt: '1' }, catalog, []);
    assert.equal(result.grade, 14);
    const updated = await getOfficialStudentData(92);
    assert.equal(updated.enrollments.length, 1);
    assert.equal(updated.profile.questionnaireWeight, 0.9);
    assert.equal(updated.profile.academicWeight, 0.1);
    assert.equal(calls.filter(({ method }) => method === 'POST').length, 1);
  } finally {
    globalThis.fetch = previousFetch;
    delete globalThis.__DEV__;
    if (previousUrl === undefined) delete process.env.EXPO_PUBLIC_STUDYMATCH_API_URL;
    else process.env.EXPO_PUBLIC_STUDYMATCH_API_URL = previousUrl;
  }
});

test('a fresh server history blocks duplicate attempts before POST', async () => {
  process.env.EXPO_PUBLIC_STUDYMATCH_API_URL = 'http://example.test:8080';
  globalThis.__DEV__ = true;
  const catalog = [{ id: 2, code: 'AED', name: 'Algoritmos e Estruturas de Dados', curricularYear: 1, semester: 2 }];
  let postCount = 0;
  globalThis.fetch = async (_, options) => {
    if (options.method === 'POST') postCount += 1;
    return { ok: true, json: async () => [{ id: 5, courseUnitCode: 'AED', courseUnitName: 'Algoritmos e Estruturas de Dados', academicYear: 2025, academicYearLabel: '2025/26', attempt: 1, grade: 14 }] };
  };
  try {
    await assert.rejects(addStudentGrade(92, { courseUnitCode: 'AED', grade: '14', academicYear: '2025', attempt: '1' }, catalog, []), /já existe/);
    assert.equal(postCount, 0);
  } finally {
    globalThis.fetch = previousFetch;
    delete globalThis.__DEV__;
    if (previousUrl === undefined) delete process.env.EXPO_PUBLIC_STUDYMATCH_API_URL;
    else process.env.EXPO_PUBLIC_STUDYMATCH_API_URL = previousUrl;
  }
});
