import { useCallback, useEffect, useMemo, useRef, useState, type FormEvent } from 'react';
import { createAuthedApi, type Menu, type Session, type Spin } from './api';
import Wheel from './Wheel';

type Props = {
  session: Session;
  onSession: (s: Session | null) => void;
};

function timeAgo(iso: string) {
  const diff = (Date.now() - new Date(iso).getTime()) / 1000;
  if (diff < 60) return '방금';
  if (diff < 3600) return `${Math.floor(diff / 60)}분 전`;
  if (diff < 86400) return `${Math.floor(diff / 3600)}시간 전`;
  return `${Math.floor(diff / 86400)}일 전`;
}

export default function RoulettePage({ session, onSession }: Props) {
  const sessionRef = useRef(session);
  sessionRef.current = session;
  const api = useMemo(() => createAuthedApi(() => sessionRef.current, onSession), [onSession]);

  const [menus, setMenus] = useState<Menu[]>([]);
  const [spins, setSpins] = useState<Spin[]>([]);
  const [newMenu, setNewMenu] = useState('');
  const [rotation, setRotation] = useState(0);
  const [spinning, setSpinning] = useState(false);
  const [result, setResult] = useState<string | null>(null);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(true);
  const pendingResult = useRef<string | null>(null);

  const fail = (e: unknown) => setError(e instanceof Error ? e.message : '문제가 생겼어요.');

  useEffect(() => {
    Promise.all([api.menus(), api.spins()])
      .then(([m, s]) => (setMenus(m), setSpins(s)))
      .catch(fail)
      .finally(() => setLoading(false));
  }, [api]);

  function spin() {
    if (spinning || menus.length < 2) return;
    setResult(null);
    setError('');
    const n = menus.length;
    const index = Math.floor(Math.random() * n);
    // 포인터는 12시 방향. 선택된 조각의 중앙(약간 랜덤)이 12시에 오도록 회전시킨다.
    const sliceDeg = 360 / n;
    const jitter = (Math.random() - 0.5) * sliceDeg * 0.7;
    const target = 360 - (index + 0.5) * sliceDeg + jitter;
    const base = rotation - (rotation % 360);
    setRotation(base + 360 * 6 + ((target % 360) + 360) % 360);
    pendingResult.current = menus[index].name;
    setSpinning(true);
  }

  const onSpinEnd = useCallback(() => {
    setSpinning(false);
    const picked = pendingResult.current;
    if (!picked) return;
    pendingResult.current = null;
    setResult(picked);
    api
      .addSpin(picked)
      .then((s) => setSpins((prev) => [s, ...prev].slice(0, 10)))
      .catch(fail);
  }, [api]);

  async function addMenu(e: FormEvent) {
    e.preventDefault();
    const name = newMenu.trim();
    if (!name) return;
    if (menus.some((m) => m.name === name)) return setError('이미 있는 메뉴예요.');
    setError('');
    try {
      const created = await api.addMenu(name);
      setMenus((prev) => [...prev, created]);
      setNewMenu('');
    } catch (err) {
      fail(err);
    }
  }

  async function removeMenu(id: string) {
    const prev = menus;
    setMenus((m) => m.filter((x) => x.id !== id));
    try {
      await api.removeMenu(id);
    } catch (err) {
      setMenus(prev);
      fail(err);
    }
  }

  return (
    <div className="app">
      <header className="topbar">
        <div className="brand">
          <span aria-hidden>🍱</span> 오늘 뭐 먹지?
        </div>
        <div className="user">
          <span className="muted">{session.user.nickname}님</span>
          <button className="ghost" onClick={() => onSession(null)}>
            로그아웃
          </button>
        </div>
      </header>

      <main className="layout">
        <section className="stage">
          <Wheel
            items={menus.map((m) => m.name)}
            rotation={rotation}
            spinning={spinning}
            onSpinEnd={onSpinEnd}
          />
          <button
            className="primary spin-btn"
            onClick={spin}
            disabled={spinning || menus.length < 2 || loading}
          >
            {spinning ? '두근두근…' : '돌려돌려 돌림판!'}
          </button>
          {menus.length < 2 && !loading && (
            <p className="muted">메뉴를 2개 이상 등록하면 돌릴 수 있어요.</p>
          )}
          <div className={`result ${result ? 'show' : ''}`} aria-live="polite">
            {result && (
              <>
                오늘 점심은 <strong>{result}</strong> 어때요? 🎉
              </>
            )}
          </div>
        </section>

        <aside className="side">
          <div className="panel">
            <h2>메뉴 목록 <span className="count">{menus.length}</span></h2>
            <form onSubmit={addMenu} className="add-form">
              <input
                value={newMenu}
                onChange={(e) => setNewMenu(e.target.value)}
                placeholder="메뉴 추가 (예: 마라탕)"
                maxLength={30}
                disabled={spinning}
              />
              <button className="primary" disabled={spinning || !newMenu.trim()}>
                추가
              </button>
            </form>
            {error && <p className="error">{error}</p>}
            {loading ? (
              <p className="muted">불러오는 중…</p>
            ) : (
              <ul className="chips">
                {menus.map((m) => (
                  <li key={m.id}>
                    {m.name}
                    <button
                      aria-label={`${m.name} 삭제`}
                      onClick={() => removeMenu(m.id)}
                      disabled={spinning}
                    >
                      ×
                    </button>
                  </li>
                ))}
              </ul>
            )}
          </div>

          <div className="panel">
            <h2>최근 결과</h2>
            {spins.length === 0 ? (
              <p className="muted">아직 돌린 기록이 없어요.</p>
            ) : (
              <ol className="history">
                {spins.map((s) => (
                  <li key={s.id}>
                    <span>{s.menu_name}</span>
                    <span className="muted">{timeAgo(s.created_at)}</span>
                  </li>
                ))}
              </ol>
            )}
          </div>
        </aside>
      </main>
    </div>
  );
}
