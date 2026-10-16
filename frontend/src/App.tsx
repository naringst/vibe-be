import { useCallback, useState } from 'react';
import { loadSession, saveSession, type Session } from './api';
import AuthPage from './AuthPage';
import RoulettePage from './RoulettePage';

export default function App() {
  const [session, setSession] = useState<Session | null>(loadSession);

  const updateSession = useCallback((s: Session | null) => {
    saveSession(s);
    setSession(s);
  }, []);

  return session ? (
    <RoulettePage key={session.user.id} session={session} onSession={updateSession} />
  ) : (
    <AuthPage onLogin={updateSession} />
  );
}
