# OhmySelect Database Schema Draft

작성일: 2026-06-07

MVP 백엔드는 관계형 데이터베이스(PostgreSQL 권장)를 기준으로 설계한다. 바우처 재고, 주문 상태, 예약 상태는 동시성 문제가 생기기 쉬우므로 서버에서 원자적으로 처리해야 한다.

## 1. 핵심 엔터티

### users

| 컬럼 | 타입 | 설명 |
| --- | --- | --- |
| id | uuid / text | 사용자 ID |
| provider | text | `google` |
| provider_subject | text | Google sub |
| name | text | 표시 이름 |
| email | text | 이메일, unique 권장 |
| picture_url | text | 프로필 이미지 |
| created_at | timestamptz | 생성일 |
| updated_at | timestamptz | 수정일 |

### cities

| 컬럼 | 타입 | 설명 |
| --- | --- | --- |
| id | text | `ho-chi-minh` |
| country_id | text | 국가 |
| name_en | text | 영문명 |
| sort_order | int | 표시 순서 |
| active | boolean | 서비스 여부 |

### memberships

| 컬럼 | 타입 | 설명 |
| --- | --- | --- |
| id | text | 현재 mock id와 동일하게 유지 |
| name | text | 프로그램명 |
| brand | text | 브랜드 |
| country_id | text | 국가 |
| annual_fee | numeric | 정가 |
| currency | text | `VND`, `USD`, `KRW` |
| sale_price | numeric | OhmySelect 할인가 |
| commission_rate | numeric | 예: `0.12` |
| dining_discount | int | null 허용 |
| room_discount | int | null 허용 |
| free_night | boolean | 무료숙박 혜택 |
| spa_benefit | boolean | 스파 혜택 |
| estimated_savings | numeric | 예상 절약 |
| notes | text | 유의사항 |
| official_url | text | 공식 사이트 |
| active | boolean | 노출 여부 |

### membership_cities

| 컬럼 | 타입 | 설명 |
| --- | --- | --- |
| membership_id | text | FK |
| city_id | text | FK |

### membership_hotels

| 컬럼 | 타입 | 설명 |
| --- | --- | --- |
| id | uuid | 호텔 ID |
| membership_id | text | FK |
| city_id | text | nullable |
| name | text | 호텔명 |

### membership_tags

| 컬럼 | 타입 | 설명 |
| --- | --- | --- |
| membership_id | text | FK |
| tag | text | `familyDining`, `freeNight` 등 |

### membership_scores

| 컬럼 | 타입 | 설명 |
| --- | --- | --- |
| membership_id | text | FK |
| family_dining | int | 0-100 |
| staycation | int | 0-100 |
| business_travel | int | 0-100 |
| ease_of_use | int | 0-100 |
| overall | int | 0-100 |

### voucher_templates

| 컬럼 | 타입 | 설명 |
| --- | --- | --- |
| id | uuid | 내부 ID |
| membership_id | text | FK |
| template_id | text | 현재 `cm-dinner` 같은 stable id |
| category | text | `dining`, `room`, `spa`, `discount`, `gift`, `other` |
| title | text | 제목 |
| description | text | 상세 설명 |
| quantity | int | 제공 수량 |
| valid_until | date | 만료일 |
| city_id | text | nullable |
| transferable | boolean | 선물 가능 여부 |
| note | text | 현장 조건 |

Unique: `(membership_id, template_id)`

### voucher_template_hotels

| 컬럼 | 타입 | 설명 |
| --- | --- | --- |
| voucher_template_id | uuid | FK |
| hotel_name | text | 이용 가능 호텔 |

## 2. 사용자 소유/운영 데이터

### user_memberships

사용자 지갑에 지급된 멤버십.

| 컬럼 | 타입 | 설명 |
| --- | --- | --- |
| id | uuid | ID |
| user_id | uuid/text | FK |
| membership_id | text | FK |
| source | text | `free_join`, `order_activation`, `admin_grant` |
| status | text | `active`, `removed` |
| activated_at | timestamptz | 지급일 |
| removed_at | timestamptz | 제거일 |

Unique active constraint: `(user_id, membership_id)` where status = `active`

### voucher_usage

완료된 사용 수량.

| 컬럼 | 타입 | 설명 |
| --- | --- | --- |
| user_id | uuid/text | FK |
| membership_id | text | FK |
| template_id | text | stable id |
| used_count | int | 사용완료 수량 |
| updated_at | timestamptz | 수정일 |

### reservations

| 컬럼 | 타입 | 설명 |
| --- | --- | --- |
| id | uuid | 예약 ID |
| user_id | uuid/text | FK |
| membership_id | text | FK |
| template_id | text | 바우처 템플릿 |
| date | date | 요청일 |
| adults | int | 성인 수 |
| children | int | 소아 수 |
| child_ages | jsonb | 예: `["6", "12m"]` |
| hotel | text | 요청 호텔 |
| note | text | 요청사항 |
| status | text | `requested`, `confirmed`, `completed`, `cancelled` |
| created_at | timestamptz | 생성일 |
| updated_at | timestamptz | 수정일 |

### orders

| 컬럼 | 타입 | 설명 |
| --- | --- | --- |
| id | uuid | 주문 ID |
| user_id | uuid/text | FK |
| membership_id | text | FK |
| buyer_name | text | 구매자 |
| buyer_email | text | 이메일 |
| buyer_phone | text | 전화 |
| city_id | text | 도시 |
| list_price | numeric | 정가 |
| sale_price | numeric | 할인가 |
| paid_amount | numeric | 결제 기준 금액 |
| currency | text | 통화 |
| commission_rate | numeric | 수수료율 |
| commission_amount | numeric | 수수료 |
| status | text | `requested`, `invoiced`, `paid`, `activated`, `cancelled` |
| invoice_url | text | 호텔 인보이스 링크, nullable |
| created_at | timestamptz | 생성일 |
| updated_at | timestamptz | 수정일 |

### transfers

| 컬럼 | 타입 | 설명 |
| --- | --- | --- |
| id | uuid | 선물 ID |
| user_id | uuid/text | 보낸 사용자 |
| membership_id | text | FK |
| template_id | text | 바우처 템플릿 |
| recipient_name | text | 받는 사람 |
| recipient_contact | text | 연락처 |
| message | text | 메시지 |
| created_at | timestamptz | 생성일 |

### assistance_requests

| 컬럼 | 타입 | 설명 |
| --- | --- | --- |
| id | uuid | 요청 ID |
| user_id | uuid/text | nullable |
| name | text | 이름 |
| contact | text | 연락처 |
| city_id | text | 도시 |
| membership_id | text | nullable |
| preferred_date | date | 희망일 |
| adults | int | 성인 |
| children | int | 소아 |
| request_type | text | `booking`, `purchase`, `general` |
| message | text | 내용 |
| status | text | `new`, `in_progress`, `resolved`, `cancelled` |
| created_at | timestamptz | 생성일 |

## 3. 재고 계산 규칙

바우처 재고:

```text
available = quantity - used_count - open_reservations - transfers
```

`open_reservations`는 `requested`, `confirmed` 상태 예약 수다.

재고가 필요한 작업:

- 예약 생성
- 바우처 선물 생성
- 예약 완료 처리

서버 구현 시 같은 사용자/멤버십/바우처 조합에 대해 transaction과 row lock을 사용한다.

## 4. 상태 전이 제약

주문:

- `requested -> invoiced`
- `invoiced -> paid`
- `paid -> activated`
- `requested|invoiced|paid -> cancelled`

예약:

- `requested -> confirmed`
- `confirmed -> completed`
- `requested|confirmed -> cancelled`

잘못된 전이는 `INVALID_STATUS_TRANSITION`으로 거절한다.

## 5. 인덱스

- `users(email)`
- `memberships(active, brand)`
- `membership_cities(city_id, membership_id)`
- `voucher_templates(membership_id, template_id)`
- `user_memberships(user_id, status)`
- `reservations(user_id, status, date)`
- `reservations(user_id, membership_id, template_id, status)`
- `orders(user_id, status, created_at)`
- `transfers(user_id, membership_id, template_id)`
