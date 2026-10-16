const API_URL = (import.meta.env.VITE_API_URL ?? 'http://localhost:3000').replace(/\/$/, '');
const SESSION_KEY = 'lunch-roulette.session';

export type User = { id: string; email: string; nickname: string };
export type Session = {
  accessToken: string;
  refreshToken: string;
  expiresAt: number;
  user: User;
};
export type Menu = { id: string; name: string; created_at: string };
export type Spin = { id: string; menu_name: string; created_at: string };

export class ApiError extends Error {
  readonly status: number;
  constructor(message: string, status: number) {
    super(message);
    this.status = status;
  }
}

export function loadSession(): Session | null {
  try {
    const raw = localStorage.getItem(SESSION_KEY);
    return raw ? (JSON.parse(raw) as Session) : null;
  } catch {
    return null;
  }
}

export function saveSession(session: Session | null) {
  try {
    if (session) localStorage.setItem(SESSION_KEY, JSON.stringify(session));
    else localStorage.removeItem(SESSION_KEY);
  } catch {
    /* 저장소를 쓸 수 없는 환경이면 메모리에만 유지 */
  }
}

async function request<T>(path: string, init: RequestInit = {}, token?: string): Promise<T> {
  const res = await fetch(`${API_URL}${path}`, {
    ...init,
    headers: {
      'content-type': 'application/json',
      ...(token ? { authorization: `Bearer ${token}` } : {}),
      ...init.headers,
    },
  });
  if (res.status === 204) return undefined as T;
  const body = await res.json().catch(() => ({}));
  if (!res.ok) {
    const msg = Array.isArray(body.message) ? body.message[0] : body.message;
    throw new ApiError(msg ?? '요청에 실패했어요.', res.status);
  }
  return body as T;
}

export const authApi = {
  signup: (email: string, password: string, nickname: string) =>
    request<Session>('/auth/signup', {
      method: 'POST',
      body: JSON.stringify({ email, password, nickname }),
    }),
  login: (email: string, password: string) =>
    request<Session>('/auth/login', { method: 'POST', body: JSON.stringify({ email, password }) }),
  refresh: (refreshToken: string) =>
    request<Session>('/auth/refresh', { method: 'POST', body: JSON.stringify({ refreshToken }) }),
};

/** 토큰이 만료되면 한 번 갱신해서 다시 시도하는 인증 요청 클라이언트 */
export function createAuthedApi(getSession: () => Session | null, onSession: (s: Session | null) => void) {
  async function authed<T>(path: string, init?: RequestInit): Promise<T> {
    let session = getSession();
    if (!session) throw new ApiError('로그인이 필요해요.', 401);
    if (session.expiresAt * 1000 - Date.now() < 60_000) {
      session = await authApi.refresh(session.refreshToken).catch(() => null);
      onSession(session);
      if (!session) throw new ApiError('세션이 만료됐어요. 다시 로그인해주세요.', 401);
    }
    try {
      return await request<T>(path, init, session.accessToken);
    } catch (e) {
      if (e instanceof ApiError && e.status === 401) onSession(null);
      throw e;
    }
  }

  return {
    menus: () => authed<Menu[]>('/menus'),
    addMenu: (name: string) => authed<Menu>('/menus', { method: 'POST', body: JSON.stringify({ name }) }),
    removeMenu: (id: string) => authed<void>(`/menus/${id}`, { method: 'DELETE' }),
    spins: () => authed<Spin[]>('/spins'),
    addSpin: (menuName: string) =>
      authed<Spin>('/spins', { method: 'POST', body: JSON.stringify({ menuName }) }),
  };
}
