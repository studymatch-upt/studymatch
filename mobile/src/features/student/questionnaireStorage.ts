import AsyncStorage from '@react-native-async-storage/async-storage';
import { emptyAnswers, isAnswer, type Answers } from './questionnaire';

export type QuestionnaireRecord = {
  version: 1;
  answers: Answers;
  step: number;
  completed: boolean;
};

export const freshRecord = (): QuestionnaireRecord => ({ version: 1, answers: emptyAnswers(), step: 0, completed: false });
export const normalizeEmail = (email: string) => email.trim().toLowerCase();
const keyFor = (email: string) => `studymatch.questionnaire.v1:${normalizeEmail(email)}`;

export function parseRecord(value: string | null): QuestionnaireRecord {
  if (!value) return freshRecord();
  try {
    const parsed: unknown = JSON.parse(value);
    if (!parsed || typeof parsed !== 'object') return freshRecord();
    const record = parsed as Partial<QuestionnaireRecord>;
    if (record.version !== 1 || !Array.isArray(record.answers) || record.answers.length !== 18 ||
      record.answers.some((answer) => answer !== null && !isAnswer(answer)) ||
      !Number.isInteger(record.step) || typeof record.step !== 'number' || record.step < 0 || record.step > 5 ||
      typeof record.completed !== 'boolean' || (record.completed && record.answers.some((answer) => !isAnswer(answer)))) {
      return freshRecord();
    }
    return { version: 1, answers: record.answers, step: record.step, completed: record.completed };
  } catch {
    return freshRecord();
  }
}

export async function readQuestionnaire(email: string): Promise<QuestionnaireRecord> {
  return parseRecord(await AsyncStorage.getItem(keyFor(email)));
}

export async function writeQuestionnaire(email: string, record: QuestionnaireRecord): Promise<void> {
  await AsyncStorage.setItem(keyFor(email), JSON.stringify(record));
}
