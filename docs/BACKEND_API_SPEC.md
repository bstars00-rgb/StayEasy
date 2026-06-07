# OhmySelect Backend API Spec

작성일: 2026-06-07

이 문서는 Claude가 만드는 프론트엔드와 Codex가 만드는 백엔드가 공유할 API 계약 초안이다. 현재 MVP의 `localStorage` 기반 상태를 서버 API로 이전하는 것을 기준으로 한다.

## 1. 기본 원칙

- API prefix: `/api/v1`
- 응답 포맷: JSON
- 인증: `Authorization: Bearer <accessToken>`
- 게스트 사용자는 탐색, 상세, 비교, 추천 퀴즈 조회만 가능하다.
- 저장, 구매, 예약, 선물, 계정 데이터 조회는 로그인 필요.
- 날짜/시간은 ISO 8601 문자열을 사용한다.
- 통화는 ISO currency code(`VND`, `USD`, `KRW`)를 사용한다.

## 2. 공통 응답

```json
{
  "data": {},
  "meta": {},
  "error": null
}
```

오류 응답:

```json
{
  "data": null,
  "meta": {},
  "error": {
    "code": "VOUCHER_NOT_AVAILABLE",
    "message": "No available voucher remains.",
    "details": {}
  }
}
```

## 3. Auth

### POST `/auth/google`

Google ID token을 검증하고 OhmySelect 세션을 발급한다.

Request:

```json
{
  "idToken": "google-id-token"
}
```

Response:

```json
{
  "data": {
    "accessToken": "jwt",
    "refreshToken": "jwt",
    "user": {
      "id": "usr_123",
      "provider": "google",
      "name": "Jane Kim",
      "email": "jane@example.com",
      "picture": "https://example.com/avatar.jpg"
    }
  },
  "meta": {},
  "error": null
}
```

### GET `/me`

현재 로그인 사용자의 프로필을 반환한다.

### POST `/auth/logout`

서버 세션 또는 refresh token을 무효화한다.

## 4. Catalog

### GET `/cities`

서비스 도시 목록.

### GET `/memberships`

도시, 혜택, 브랜드 필터와 추천 점수 정렬을 지원한다.

Query:

- `city`: `ho-chi-minh`, `da-nang`, `hanoi`, `seoul`, `bangkok`, `tokyo`
- `benefit`: `dining`, `room`, `spa`, `discount`, `gift`, `freeNight`
- `sort`: `recommended`, `priceAsc`, `savingsDesc`

Response item:

```json
{
  "id": "club-marriott-vietnam",
  "name": "Club Marriott Vietnam",
  "brand": "Marriott",
  "country": "vietnam",
  "cities": ["ho-chi-minh", "da-nang", "hanoi"],
  "hotels": ["Sheraton Saigon Grand Opera Hotel"],
  "annualFee": 4500000,
  "currency": "VND",
  "salePrice": 4200000,
  "commissionRate": 0.12,
  "benefits": ["Up to 50% off food"],
  "diningDiscount": 50,
  "roomDiscount": 20,
  "freeNight": false,
  "spaBenefit": true,
  "bestFor": ["familyDining", "hotelBuffet"],
  "estimatedSavings": 12000000,
  "scores": {
    "familyDining": 95,
    "staycation": 80,
    "businessTravel": 60,
    "easeOfUse": 85,
    "overall": 90
  }
}
```

### GET `/memberships/:membershipId`

멤버십 상세와 포함 바우처 템플릿을 함께 반환한다.

### GET `/memberships/compare?ids=a,b,c`

최대 3개 멤버십 비교 데이터를 반환한다.

## 5. Wallet

### GET `/wallet`

사용자가 보유한 멤버십, 바우처 상태, 예약/주문 요약을 반환한다.

Response:

```json
{
  "data": {
    "summary": {
      "membershipCount": 2,
      "availableVoucherCount": 8,
      "expiringSoonCount": 1,
      "openReservationCount": 2
    },
    "memberships": [],
    "vouchers": [],
    "reservations": [],
    "orders": [],
    "transfers": []
  },
  "meta": {},
  "error": null
}
```

### POST `/wallet/memberships`

무료 멤버십 가입 또는 운영자가 활성화한 유료 멤버십을 지갑에 추가한다.

Request:

```json
{
  "membershipId": "hilton-honors-vietnam",
  "source": "free_join"
}
```

### DELETE `/wallet/memberships/:membershipId`

지갑에서 멤버십을 제거한다. 바우처 사용 기록, 예약, 선물 기록은 함께 정리하고 주문 이력은 보존한다.

### GET `/wallet/vouchers`

카테고리별 바우처 목록을 반환한다.

Query:

- `category`: `all`, `dining`, `room`, `spa`, `discount`, `gift`, `other`
- `membershipId`

Voucher item:

```json
{
  "membershipId": "club-marriott-vietnam",
  "templateId": "cm-dinner",
  "title": "Free Dinner Coupon",
  "category": "dining",
  "quantity": 2,
  "used": 0,
  "held": 1,
  "transferred": 0,
  "available": 1,
  "validUntil": "2026-11-30",
  "hotels": [],
  "transferable": true,
  "note": "Set menu only. Wine and extra orders are charged on site."
}
```

## 6. Reservations

### POST `/reservations`

바우처 예약 요청을 생성한다. 서버는 바우처 재고를 원자적으로 확인하고 `requested` 상태로 hold를 잡는다.

Request:

```json
{
  "membershipId": "club-marriott-vietnam",
  "templateId": "cm-dinner",
  "date": "2026-07-03",
  "adults": 2,
  "children": 1,
  "childAges": ["6"],
  "hotel": "Sheraton Saigon Grand Opera Hotel",
  "note": "Window seat if possible"
}
```

Status flow:

`requested -> confirmed -> completed`

Cancel path:

`requested|confirmed -> cancelled`

### GET `/reservations`

사용자의 예약 목록을 반환한다.

### PATCH `/reservations/:reservationId/status`

예약 상태를 변경한다. `completed`가 되면 바우처 사용 수량을 1 증가시키고 hold를 해제한다.

Request:

```json
{
  "status": "confirmed"
}
```

### DELETE `/reservations/:reservationId`

예약 기록을 삭제한다. 운영 정책상 MVP에서는 `cancelled` 변경을 우선 사용한다.

## 7. Orders

### POST `/orders`

유료 멤버십 구매 신청을 만든다. 실제 결제는 호텔 브랜드 인보이스로 진행한다.

Request:

```json
{
  "membershipId": "club-marriott-vietnam",
  "buyerName": "Jane Kim",
  "buyerEmail": "jane@example.com",
  "buyerPhone": "+84901234567",
  "city": "ho-chi-minh"
}
```

Response에는 `paidAmount`, `commissionRate`, `commissionAmount`가 포함된다.

Status flow:

`requested -> invoiced -> paid -> activated`

Cancel path:

`requested|invoiced|paid -> cancelled`

### GET `/orders`

사용자 주문 목록.

### PATCH `/orders/:orderId/status`

주문 상태를 변경한다. `activated`가 되면 해당 멤버십을 지갑에 지급한다.

운영자/파트너 권한에서만 사용 가능하게 설계한다.

### GET `/settlements/summary`

데모 및 운영 정산용 집계.

Response:

```json
{
  "data": {
    "gmv": 8700000,
    "commission": 1044000,
    "currency": "VND",
    "activatedOrderCount": 2
  },
  "meta": {},
  "error": null
}
```

## 8. Transfers

### POST `/transfers`

양도 가능한 바우처를 다른 사람에게 선물한다. 서버는 재고를 원자적으로 확인하고 `transferred` 수량을 증가시킨다.

Request:

```json
{
  "membershipId": "club-marriott-vietnam",
  "templateId": "cm-breakfast",
  "recipientName": "Min Lee",
  "recipientContact": "min@example.com",
  "message": "Enjoy breakfast"
}
```

### GET `/transfers`

사용자 선물 기록.

## 9. Assistance

### POST `/assistance-requests`

도움 요청을 저장하고 운영 채널로 전달한다.

Request:

```json
{
  "name": "Jane Kim",
  "contact": "jane@example.com",
  "city": "da-nang",
  "membershipId": "accor-plus-vietnam",
  "preferredDate": "2026-08-10",
  "adults": 2,
  "children": 0,
  "requestType": "booking",
  "message": "Need help booking a free night."
}
```

## 10. Quiz

### POST `/recommendations/quiz`

5문항 답변을 받아 상위 3개 멤버십 추천을 반환한다.

Request:

```json
{
  "city": "ho-chi-minh",
  "benefits": ["familyDining", "freeNight"],
  "frequency": "monthly",
  "companions": "family",
  "budget": "paid_ok"
}
```

## 11. 주요 오류 코드

- `AUTH_REQUIRED`
- `FORBIDDEN`
- `MEMBERSHIP_NOT_FOUND`
- `VOUCHER_NOT_FOUND`
- `VOUCHER_NOT_AVAILABLE`
- `VOUCHER_NOT_TRANSFERABLE`
- `INVALID_STATUS_TRANSITION`
- `ORDER_NOT_ACTIVATABLE`
- `VALIDATION_ERROR`
