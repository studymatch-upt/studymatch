import { createContext, useContext, useRef, useState, type PropsWithChildren } from 'react';
import { aggregateAnswers, type AggregatedAnswers, type Answer } from './questionnaire';
import { freshRecord, normalizeEmail, readQuestionnaire, writeQuestionnaire, type QuestionnaireRecord } from './questionnaireStorage';
import { getOfficialStudentData, type ApiStudent, type OfficialStudentData } from './studentApi';

type StudentIdentity = { email: string; name?: string; studentNumber?: string; curricularYear?: 1 | 2 | 3 };
type Session = {
  studentActive: boolean;
  setStudentActive: (active: boolean) => void;
  identity: StudentIdentity | null;
  official: OfficialStudentData | null;
  officialLoading: boolean;
  officialError: string | null;
  record: QuestionnaireRecord;
  storageError: string | null;
  startStudentSession: (email: string, details?: Omit<StudentIdentity, 'email'>) => Promise<void>;
  startOfficialStudentSession: (student: ApiStudent) => Promise<void>;
  refreshOfficial: () => Promise<boolean>;
  answerQuestion: (index: number, answer: Answer) => void;
  goToStep: (step: number) => void;
  finishQuestionnaire: () => Promise<AggregatedAnswers>;
};
const DemoSession = createContext<Session | null>(null);

export function DemoSessionProvider({ children }: PropsWithChildren) {
  const [studentActive, setStudentActive] = useState(false);
  const [identity, setIdentity] = useState<StudentIdentity | null>(null);
  const [official, setOfficial] = useState<OfficialStudentData | null>(null);
  const [officialLoading, setOfficialLoading] = useState(false);
  const [officialError, setOfficialError] = useState<string | null>(null);
  const [record, setRecord] = useState<QuestionnaireRecord>(freshRecord);
  const [storageError, setStorageError] = useState<string | null>(null);
  const current = useRef(record);
  const writes = useRef<Promise<void>>(Promise.resolve());
  const emailRef = useRef('');
  const officialId = useRef<number | null>(null);
  const requestVersion = useRef(0);

  function setStudentActiveSession(active: boolean) {
    setStudentActive(active);
    if (!active) {
      requestVersion.current += 1;
      officialId.current = null;
      setOfficial(null);
      setOfficialError(null);
      setOfficialLoading(false);
      setIdentity(null);
    }
  }

  async function startOfficialStudentSession(student: ApiStudent) {
    if (!__DEV__) throw new Error('Os alunos de teste estão disponíveis apenas em desenvolvimento.');
    const version = ++requestVersion.current;
    setOfficialLoading(true);
    setOfficialError(null);
    try {
      const data = await getOfficialStudentData(student.id);
      if (data.student.name !== student.name || data.student.studentNumber !== student.studentNumber) {
        throw new Error('Os dados do aluno mudaram no backend. Atualiza a lista e volta a selecionar.');
      }
      if (version !== requestVersion.current) return;
      officialId.current = student.id;
      setOfficial(data);
      setIdentity(null);
      setStudentActive(true);
    } catch (error) {
      if (version === requestVersion.current) setOfficialError(error instanceof Error ? error.message : 'Não foi possível carregar o aluno.');
      throw error;
    } finally {
      if (version === requestVersion.current) setOfficialLoading(false);
    }
  }

  async function refreshOfficial() {
    const id = officialId.current;
    if (id === null) return false;
    const version = ++requestVersion.current;
    setOfficialLoading(true);
    setOfficialError(null);
    try {
      const data = await getOfficialStudentData(id);
      if (version === requestVersion.current) {
        setOfficial(data);
        return true;
      }
      return false;
    } catch (error) {
      if (version === requestVersion.current) setOfficialError(error instanceof Error ? error.message : 'Não foi possível atualizar os dados.');
      return false;
    } finally {
      if (version === requestVersion.current) setOfficialLoading(false);
    }
  }

  function save(next: QuestionnaireRecord) {
    current.current = next;
    setRecord(next);
    const email = emailRef.current;
    writes.current = writes.current.catch(() => undefined).then(() => writeQuestionnaire(email, next));
    writes.current.catch(() => setStorageError('Não foi possível guardar o progresso neste dispositivo.'));
  }

  async function startStudentSession(email: string, details?: Omit<StudentIdentity, 'email'>) {
    requestVersion.current += 1;
    officialId.current = null;
    setOfficial(null);
    setOfficialError(null);
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

  return <DemoSession.Provider value={{ studentActive, setStudentActive: setStudentActiveSession, identity, official, officialLoading, officialError, record, storageError, startStudentSession, startOfficialStudentSession, refreshOfficial, answerQuestion, goToStep, finishQuestionnaire }}>{children}</DemoSession.Provider>;
}

export function useDemoSession() {
  const session = useContext(DemoSession);
  if (!session) throw new Error('DemoSessionProvider is missing');
  return session;
}
