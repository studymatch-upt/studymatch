import assert from 'node:assert/strict';
import test from 'node:test';
import { aggregateAnswers, competencies, emptyAnswers } from './questionnaire.ts';

test('all six competencies aggregate three answers and keep API keys', () => {
  const answers = [4, 5, 3, 1, 1, 1, 5, 5, 5, 2, 3, 4, 3, 3, 3, 1, 2, 3];
  assert.deepEqual(aggregateAnswers(answers), {
    PROGRAMMING: 4,
    MATHEMATICS_AND_LOGIC: 1,
    DATABASES: 5,
    DESIGN_AND_UX: 3,
    COMMUNICATION: 3,
    ORGANISATION_AND_LEADERSHIP: 2,
  });
  assert.equal(competencies.flatMap((group) => group.questions).length, 18);
});

test('rounds to the nearest integer within 1–5', () => {
  const answers = Array(18).fill(1);
  answers.splice(0, 3, 1, 1, 2);
  answers.splice(3, 3, 4, 5, 5);
  const result = aggregateAnswers(answers);
  assert.equal(result.PROGRAMMING, 1);
  assert.equal(result.MATHEMATICS_AND_LOGIC, 5);
  assert.ok(Object.values(result).every((value) => value >= 1 && value <= 5));
});

test('rejects missing, short, and out-of-range answers', () => {
  assert.throws(() => aggregateAnswers(emptyAnswers()));
  assert.throws(() => aggregateAnswers(Array(17).fill(3)));
  assert.throws(() => aggregateAnswers([...Array(17).fill(3), 6]));
});
