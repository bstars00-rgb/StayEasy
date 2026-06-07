# Claude Frontend Integration Guide

작성일: 2026-06-07

이 문서는 Claude가 프론트엔드를 작업할 때 백엔드와 충돌하지 않도록 지켜야 할 연결 기준이다.

## 1. 현재 프론트 상태

현재 OhmySelect는 React 18, Vite, React Router, Tailwind 기반이다. 주요 상태는 다음 파일에 있다.

- `src/context/AppContext.jsx`: 언어, 도시, 지갑, 비교, 예약, 주문, 선물 상태
- `src/context/AuthContext.jsx`: 로그인 상태, 로그인 후 원래 액션 재개
- `src/utils/storage.js`: `localStorage` 저장소
- `src/data/memberships.js`: 멤버십 mock catalog
- `src/data/voucherPacks.js`: 바우처 템플릿 mock catalog
- `src/utils/vouchers.js`: 바우처 재고 계산

백엔드 연동 시 화면 컴포넌트를 크게 바꾸기보다 `storage/data/context` 경계를 API client로 교체하는 방향이 가장 안전하다.

## 2. Claude가 유지해야 할 화면 계약

라우트:

- `/`
- `/explore`
- `/membership/:id`
- `/compare`
- `/my-benefits`
- `/quiz`
- `/help`
- `/partner`

하단 내비게이션:

- 홈
- 탐색
- 비교
- 내 혜택
- 도움

로그인 게이팅:

- 탐색, 상세, 비교, 추천 퀴즈 조회는 게스트 허용
- 저장, 무료 가입, 구매, 예약, 선물, 내 혜택 저장성 액션은 로그인 필요
- 미로그인 상태에서 액션을 누르면 로그인 후 원래 액션을 이어가야 한다.

## 3. API Client 권장 구조

Claude가 프론트를 수정할 경우 다음 파일을 새로 두는 방식을 권장한다.

```text
src/api/client.js
src/api/auth.js
src/api/catalog.js
src/api/wallet.js
src/api/orders.js
src/api/reservations.js
src/api/transfers.js
src/api/assistance.js
src/api/recommendations.js
```

초기에는 `VITE_API_BASE_URL`이 없으면 mock/localStorage를 사용하고, 있으면 API를 호출하는 하이브리드 방식으로 전환한다.

```js
const API_BASE_URL = import.meta.env.VITE_API_BASE_URL
```

## 4. 프론트 상태 전환 기준

기존 `localStorage` 키와 서버 API 매핑:

| 현재 상태 | 서버 API |
| --- | --- |
| `stayeasy.lang` | 클라이언트 preference 유지 가능 |
| `stayeasy.city` | 클라이언트 preference 유지 가능 |
| `stayeasy.savedMemberships` | `GET /wallet`, `POST /wallet/memberships` |
| `stayeasy.compare` | 클라이언트 preference 유지 가능 |
| `stayeasy.voucherUsage` | `GET /wallet/vouchers` |
| `stayeasy.reservations` | `GET/POST/PATCH /reservations` |
| `stayeasy.orders` | `GET/POST/PATCH /orders` |
| `stayeasy.transfers` | `GET/POST /transfers` |
| `stayeasy.auth` | `/auth/google`, `/me`, `/auth/logout` |

언어, 도시, 비교 목록은 서버 저장 없이 브라우저 preference로 남겨도 된다. 계정 간 동기화가 필요해지면 `/me/preferences`를 추가한다.

## 5. Claude가 백엔드에 기대하면 안 되는 것

- 결제 PG 처리: MVP는 호텔 브랜드 인보이스 결제다.
- 예약 즉시 확정: 앱은 요청을 만들고 운영자가 호텔과 조율한다.
- Google ID token 클라이언트 검증만으로 운영 인증 완료 처리: 운영에서는 서버 검증이 필요하다.
- 클라이언트의 바우처 재고 계산 신뢰: 최종 재고 판단은 서버가 한다.

## 6. UI에서 필요한 로딩/오류 상태

Claude는 API 연동 화면에 다음 상태를 반드시 둔다.

- 목록 로딩
- 빈 상태
- 로그인 필요
- 네트워크 실패
- 바우처 재고 없음
- 잘못된 상태 전이
- 주문/예약 상태 변경 중

## 7. Mock에서 API로 바꿀 때 우선순위

1. Auth: `/auth/google`, `/me`
2. Catalog: `/memberships`, `/memberships/:id`
3. Wallet: `/wallet`, `/wallet/vouchers`
4. Reservation: `/reservations`
5. Order: `/orders`
6. Transfer: `/transfers`
7. Assistance/Quiz

## 8. Claude 작업 요청 예시

Claude에게 넘길 수 있는 지시:

```text
OhmySelect 프론트는 현재 localStorage 기반입니다.
docs/BACKEND_API_SPEC.md의 API 계약을 기준으로 src/api/* client 레이어를 만들고,
기존 AppContext/AuthContext의 외부 계약은 최대한 유지하면서 API_BASE_URL이 있으면 백엔드를 호출하게 바꿔주세요.
화면 컴포넌트의 props와 라우트는 유지해주세요.
```
