# OhmySelect Backend Prototype

작성일: 2026-06-07

프론트 API client에 맞춘 로컬 백엔드다. 기본값은 SQLite 파일 DB를 사용하며, `DATABASE_URL`이 있으면 PostgreSQL/Supabase로 연결한다.

## 실행

```bash
npm run backend
```

기본 주소:

```text
http://localhost:8787
```

프론트 API client 기본 prefix:

```text
http://localhost:8787/api/v1
```

상태 확인:

```text
GET /api/v1/health
```

## DB 모드

기본 SQLite:

```text
backend/.data/stayeasy.sqlite
```

SQLite 파일 위치 변경:

```bash
SQLITE_PATH=backend/.data/dev.sqlite npm run backend
```

PostgreSQL/Supabase 연결:

```bash
DATABASE_URL=postgres://USER:PASSWORD@HOST:5432/DB npm run backend
```

서버 부팅 시 migration과 catalog seed가 자동으로 실행된다.

## 프론트 연결

프론트에서 API 모드를 켤 때 사용할 값:

```text
VITE_USE_API=true
VITE_API_BASE_URL=http://localhost:8787
```

## 구현된 엔드포인트

- `POST /api/v1/auth/google`
- `GET /api/v1/me`
- `POST /api/v1/auth/logout`
- `GET /api/v1/cities`
- `GET /api/v1/memberships`
- `GET /api/v1/memberships/compare`
- `GET /api/v1/memberships/:id`
- `GET /api/v1/memberships/:id/vouchers`
- `GET /api/v1/wallet`
- `POST /api/v1/wallet/memberships`
- `DELETE /api/v1/wallet/memberships/:membershipId`
- `GET /api/v1/wallet/vouchers`
- `GET /api/v1/reservations`
- `POST /api/v1/reservations`
- `PATCH /api/v1/reservations/:id/status`
- `DELETE /api/v1/reservations/:id`
- `GET /api/v1/orders`
- `POST /api/v1/orders`
- `PATCH /api/v1/orders/:id/status`
- `GET /api/v1/transfers`
- `POST /api/v1/transfers`
- `GET /api/v1/settlements/summary`
- `POST /api/v1/assistance-requests`
- `POST /api/v1/recommendations/quiz`

## 프로토타입 제약

- Google token은 실제 검증하지 않고 데모 사용자로 교환한다.
- 주문/예약 상태 변경 권한은 프로토타입 편의를 위해 열려 있다.
- 실제 운영 버전에서는 운영자 권한과 Google ID token 서버 검증이 필요하다.
