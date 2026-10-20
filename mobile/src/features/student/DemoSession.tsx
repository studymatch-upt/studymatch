import { createContext, useContext, useState, type PropsWithChildren } from 'react';

// Only controls the demonstration flow. No credentials or personal data are stored.
const DemoSession = createContext<{
  studentActive: boolean;
  setStudentActive: (active: boolean) => void;
} | null>(null);

export function DemoSessionProvider({ children }: PropsWithChildren) {
  const [studentActive, setStudentActive] = useState(false);
  return <DemoSession.Provider value={{ studentActive, setStudentActive }}>{children}</DemoSession.Provider>;
}

export function useDemoSession() {
  const session = useContext(DemoSession);
  if (!session) throw new Error('DemoSessionProvider is missing');
  return session;
}
