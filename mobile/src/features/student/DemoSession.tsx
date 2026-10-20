import { createContext, useContext, useRef, useState, type PropsWithChildren } from 'react';
import { aggregateAnswers, type AggregatedAnswers, type Answer } from './questionnaire';
import { freshRecord, normalizeEmail, readQuestionnaire, writeQuestionnaire, type QuestionnaireRecord } from './questionnaireStorage';

type StudentIdentity = { email: string; name?: string; curricularYear?: 1 | 2 | 3 };
type Session = {
  studentActive: boolean;
  setStudentActive: (active: boolean) => void;
  identity: StudentIdentity | null;
  record: QuestionnaireRecord;
  storageError: string | null;
  startStudentSession: (email: string, details?: Omit<StudentIdentity, 'email'>) => Promise<void>;
  answerQuestion: (index: number, answer: Answer) => void;
  goToStep: (step: number) => void;
  finishQuestionnaire: () => Promise<AggregatedAnswers>;
};
const DemoSession = createContext<Session | null>(null);

export function DemoSessionProvider({ children }: PropsWithChildren) {
  const [studentActive, setStudentActive] = useState(false);
  const [identity, setIdentity] = useState<StudentIdentity | null>(null);
  const [record, setRecord] = useState<QuestionnaireRecord>(freshRecord);
  const [storageError, setStorageError] = useState<string | null>(null);
  const current = useRef(record);
  const writes = useRef<Promise<void>>(Promise.resolve());
  const emailRef = useRef('');

  function save(next: QuestionnaireRecord) {
    current.current = next;
    setRecord(next);
    const email = emailRef.current;
    writes.current = writes.current.catch(() => undefined).then(() => writeQuestionnaire(email, next));
    writes.current.catch(() => setStorageError('Não foi possível guardar o progresso neste dispositivo.'));
  }

  async function startStudentSession(email: string, details?: Omit<StudentIdentity, 'email'>) {
    await writes.current.catch(() => undefined);
    const normalized = normalizeEmail(email);
    let next: QuestionnaireRecord;
    try {
      next = await readQuestionnaire(normalized);
      setStorageError(null);
    } catch {
      next = freshRecord();
      setStorageError('Não foi possível recuperar o questionário guardado neste dispositivo.');
    }
    emailRef.current = normalized;
    current.current = next;
    setRecord(next);
    setIdentity({ email: normalized, ...details });
    setStudentActive(true);
  }

  function answerQuestion(index: number, answer: Answer) {
    if (index < 0 || index >= 18) return;
    const answers = [...current.current.answers];
    answers[index] = answer;
    save({ ...current.current, answers, completed: false });
  }

  function goToStep(step: number) {
    if (!Number.isInteger(step) || step < 0 || step > 5) return;
    save({ ...current.current, step });
  }

  async function finishQuestionnaire() {
    const result = aggregateAnswers(current.current.answers);
    const next = { ...current.current, completed: true, step: 5 };
    await writes.current.catch(() => undefined);
    await writeQuestionnaire(emailRef.current, next);
    current.current = next;
    setRecord(next);
    setStorageError(null);
    return result;
  }

  return <DemoSession.Provider value={{ studentActive, setStudentActive, identity, record, storageError, startStudentSession, answerQuestion, goToStep, finishQuestionnaire }}>{children}</DemoSession.Provider>;
}

export function useDemoSession() {
  const session = useContext(DemoSession);
  if (!session) throw new Error('DemoSessionProvider is missing');
  return session;
}
