# StayEasy Backend Prototype

작성일: 2026-06-07

프론트 API client(`src/api/stayeasyApi.js`)에 맞춘 로컬 백엔드 프로토타입이다. 실제 DB 없이 메모리에 데이터를 저장하므로 서버를 재시작하면 사용자 지갑, 주문, 예약, 선물 데이터는 초기화된다.

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
- 데이터는 메모리에만 저장된다.
- 주문/예약 상태 변경 권한은 프로토타입 편의를 위해 열려 있다.
- 실제 운영 버전에서는 DB transaction, row lock, 운영자 권한, Google ID token 서버 검증이 필요하다.
