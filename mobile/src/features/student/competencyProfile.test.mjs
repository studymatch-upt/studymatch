import assert from 'node:assert/strict';
import test from 'node:test';
import { selectCompetencyProfile } from './competencyProfile.ts';

const answers = [1, 1, 1, 2, 2, 2, 3, 3, 3, 4, 4, 4, 5, 5, 5, 1, 3, 5];
const record = { version: 1, answers, step: 5, completed: true };

test('local profile normalizes six questionnaire aggregates to backend 0–100 scale', () => {
  const profile = selectCompetencyProfile(record);
  assert.equal(profile.source, 'local');
  assert.deepEqual(Object.values(profile.scores), [0, 25, 50, 75, 100, 50]);
  assert.equal(profile.questionnaireWeight, null);
  assert.equal(profile.academicWeight, null);
  assert.equal(profile.overallScore, null);
});

test('edited answers update the selected scores and incomplete records have no profile', () => {
  const updated = selectCompetencyProfile({ ...record, answers: [5, 5, 5, ...answers.slice(3)] });
  assert.equal(updated.scores.PROGRAMMING, 100);
  assert.equal(selectCompetencyProfile({ ...record, completed: false }), null);
});

test('an official profile preserves API scores, unknowns, and weights', () => {
  const api = { studentId: 42, scores: { PROGRAMMING: 82 }, questionnaireWeight: 0.6, academicWeight: 0.4, completedCourseUnits: 4, unknownCompetencies: ['DESIGN_AND_UX'] };
  const profile = selectCompetencyProfile(record, api, 42);
  assert.equal(profile.source, 'official');
  assert.equal(profile.scores.PROGRAMMING, 82);
  assert.equal(profile.academicWeight, 0.4);
  assert.equal(profile.completedCourseUnits, 4);
  assert.equal(profile.overallScore, null);
  assert.deepEqual(profile.unknownCompetencies, ['DESIGN_AND_UX']);
  const changedWeights = selectCompetencyProfile(record, { ...api, questionnaireWeight: 0.3, academicWeight: 0.7 }, 42);
  assert.equal(changedWeights.questionnaireWeight, 0.3);
  assert.equal(changedWeights.academicWeight, 0.7);
  assert.equal(selectCompetencyProfile(record, api)?.source, 'local');
  assert.equal(selectCompetencyProfile(record, api, 43)?.source, 'local');
});
