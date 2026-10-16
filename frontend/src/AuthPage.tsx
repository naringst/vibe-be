import { useState, type FormEvent } from 'react';
import { authApi, type Session } from './api';

export default function AuthPage({ onLogin }: { onLogin: (s: Session) => void }) {
  const [mode, setMode] = useState<'login' | 'signup'>('login');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [nickname, setNickname] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  async function submit(e: FormEvent) {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      const session =
        mode === 'login'
          ? await authApi.login(email, password)
          : await authApi.signup(email, password, nickname);
      onLogin(session);
    } catch (err) {
      setError(err instanceof Error ? err.message : '문제가 생겼어요.');
    } finally {
      setLoading(false);
    }
  }

  return (
    <main className="auth">
      <div className="auth-card">
        <div className="auth-logo" aria-hidden>
          🍱
        </div>
        <h1>오늘 뭐 먹지?</h1>
        <p className="muted">점심 메뉴 고민은 돌림판에 맡기세요</p>

        <div className="tabs" role="tablist">
          <button
            role="tab"
            aria-selected={mode === 'login'}
            className={mode === 'login' ? 'active' : ''}
            onClick={() => (setMode('login'), setError(''))}
          >
            로그인
          </button>
          <button
            role="tab"
            aria-selected={mode === 'signup'}
            className={mode === 'signup' ? 'active' : ''}
            onClick={() => (setMode('signup'), setError(''))}
          >
            회원가입
          </button>
        </div>

        <form onSubmit={submit} className="form">
          <label>
            이메일
            <input
              type="email"
              autoComplete="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="lunch@example.com"
            />
          </label>
          <label>
            비밀번호
            <input
              type="password"
              autoComplete={mode === 'login' ? 'current-password' : 'new-password'}
              required
              minLength={6}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="6자 이상"
            />
          </label>
          {mode === 'signup' && (
            <label>
              닉네임 <span className="muted">(선택)</span>
              <input
                maxLength={20}
                value={nickname}
                onChange={(e) => setNickname(e.target.value)}
                placeholder="배고픈 개발자"
              />
            </label>
          )}
          {error && <p className="error">{error}</p>}
          <button className="primary" disabled={loading}>
            {loading ? '잠시만요…' : mode === 'login' ? '로그인' : '가입하고 시작하기'}
          </button>
        </form>
      </div>
    </main>
  );
}
