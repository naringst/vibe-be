# 🍱 오늘 뭐 먹지? — 점심 메뉴 돌림판

로그인한 사용자별로 메뉴 목록을 관리하고, 돌림판을 돌려 점심 메뉴를 정하는 앱입니다.

| 영역 | 기술 | 위치 |
| --- | --- | --- |
| 프론트엔드 | React 19 + Vite + TypeScript | [`frontend/`](frontend) |
| 백엔드 | NestJS 12 | [`backend/`](backend) |
| DB / 인증 | Supabase (Postgres + Auth) | [`supabase/migrations/`](supabase/migrations) |
| 배포 | Vercel (프론트·백엔드 각각 프로젝트) | |

## 기능
- 이메일 회원가입 / 로그인 / 로그아웃 (Supabase Auth, 이메일 인증 없이 바로 가입)
- 가입 시 기본 메뉴 8개 자동 등록, 메뉴 추가·삭제 (최대 16개)
- 돌림판 돌리기 + 최근 결과 10개 기록

## API (backend)
| Method | Path | 설명 |
| --- | --- | --- |
| POST | `/auth/signup` | `{ email, password, nickname? }` → 토큰 + 사용자 |
| POST | `/auth/login` | `{ email, password }` → 토큰 + 사용자 |
| POST | `/auth/refresh` | `{ refreshToken }` → 새 토큰 |
| GET | `/auth/me` | 내 정보 🔒 |
| GET/POST | `/menus` | 내 메뉴 목록 / 추가 `{ name }` 🔒 |
| DELETE | `/menus/:id` | 메뉴 삭제 🔒 |
| GET/POST | `/spins` | 최근 결과 / 결과 저장 `{ menuName }` 🔒 |

🔒 = `Authorization: Bearer <accessToken>` 필요

## 로컬 실행
```bash
# 백엔드 (http://localhost:3000)
cd backend && cp .env.example .env   # SUPABASE_URL, SUPABASE_SECRET_KEY 채우기
npm install && npm run start:dev

# 프론트엔드 (http://localhost:5173)
cd frontend && cp .env.example .env.local
npm install && npm run dev
```

## 환경 변수
- backend: `SUPABASE_URL`, `SUPABASE_SECRET_KEY`(service_role 키, 서버 전용), `CORS_ORIGIN`(쉼표 구분, 기본 `*`)
- frontend: `VITE_API_URL`(백엔드 주소)
