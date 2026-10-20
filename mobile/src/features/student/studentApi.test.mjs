import assert from 'node:assert/strict';
import test from 'node:test';
import { getDemoStudentByEmail, getDemoStudents, getOfficialStudentData } from './studentApi.ts';

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
        { id: 71, name: 'Carla Mendes', email: 'carla@school.test', studentNumber: '20240001', curricularYear: 2 },
        { id: 92, name: 'Diogo Ferreira', email: 'diogo@school.test', studentNumber: '20240002', curricularYear: 3 },
      ],
      '/api/students/71': { id: 71, name: 'Carla Mendes', email: 'carla@school.test', studentNumber: '20240001', curricularYear: 2 },
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
