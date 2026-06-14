# Codex work order — 백오피스 백엔드 (OhmySelect Back-office API)

> 이 문서는 Codex가 **추가 질문 없이** 백오피스 **백엔드(API·DB·권한·정산)**를 끝까지
> 구현하도록 작성된 작업지시서입니다. **UI는 만들지 마세요** — 기존 `/admin` 웹사이트(Claude)가
> 이 API를 소비/확장합니다(분업 유지). 끝나면 엔드포인트 목록 + 스펙 갱신을 한 줄로 회신.

## 0) 컨텍스트
- 제품: **OhmySelect by Ohmyhotel** — 엄선된 호텔 멤버십 혜택 플랫폼.
- 스택: 백엔드 `backend/`(Node, DB=SQLite/Postgres), 프론트 React/Vite(별개).
- 라이브: 프론트 GitHub Pages(`/StayEasy/`, `/StayEasy/admin/`), 백엔드 Render
  `https://stayeasy-backend-g3z0.onrender.com`, prefix `/api/v1`.
- 계약 원문: [`docs/BACKEND_API_SPEC.md`](BACKEND_API_SPEC.md), 스키마 [`DATABASE_SCHEMA.md`](DATABASE_SCHEMA.md).
- 분업: **Claude=프론트(+admin UI), Codex=백엔드.** 이번 작업은 **백엔드만**.

## 1) 절대 깨지면 안 되는 것 (기존 자산 보호)
- 기존 admin 엔드포인트/응답 모양 **유지**(추가만, 변경 금지):
  `GET /admin/orders`, `PATCH /admin/orders/:id/status`, `GET /admin/reservations`,
  `PATCH /admin/reservations/:id/status`, `GET /admin/assistance-requests`,
  `PATCH /admin/assistance-requests/:id`, `GET /admin/settlements/summary`.
- 소비자 공개 read 응답 모양(멤버십/바우처) 유지 — 프론트가 동일 shape 기대.
- **localStorage 키 `stayeasy.*`**, **Pages base `/StayEasy/`**, **데모 stable subject
  `demo-google-user`** 변경 금지.
- **CORS 프리플라이트 유지**: 모든 `/api/v1/*` OPTIONS 응답에
  `Access-Control-Allow-Methods: GET,POST,PATCH,DELETE,OPTIONS` +
  `Access-Control-Allow-Headers: Authorization, Content-Type` 포함(인증요청 필수).

## 2) 공통 규약
- 응답은 **envelope** `{ data, meta, error }`, 필드는 **camelCase**.
- 인증: Bearer accessToken. 비로그인 → **401 `AUTH_REQUIRED`**, 관리자 아님 → **403 `ADMIN_REQUIRED`**.
- 에러: `{ error: { code, message, details } }`. 신규 코드: `DATE_NOT_AVAILABLE`,
  `VALIDATION_ERROR`, `NOT_FOUND` 등 일관되게.
- **목록은 페이지네이션**: 쿼리 `?page=1&pageSize=20`(또는 limit/offset), 응답
  `meta: { page, pageSize, total }`. 필터: `?status=&q=&from=&to=&brand=`.
- 모든 **변경(mutation) admin 액션은 audit log** 1건 기록.

## 3) 권한/역할 + 감사로그
- 역할: `admin`(전권) / `operator`(읽기 + 예약·CS 처리, 카탈로그·정산쓰기 불가).
  - MVP: `users.role` 컬럼(기본 'operator', `ADMIN_EMAILS`는 'admin'로 승격) 또는
    `ADMIN_EMAILS`/`OPERATOR_EMAILS` 환경변수. 게이트는 라우트별 최소권한 검사.
- `GET /admin/me` → `{ user, role, permissions }`.
- 감사로그: `GET /admin/audit-logs?from=&to=&actor=` →
  `[{ id, actorEmail, action, targetType, targetId, before, after, createdAt }]`.
  주문/예약/카탈로그/가용일/문의 변경 시 자동 적재.

## 4) 대시보드/KPI
- `GET /admin/dashboard?from=&to=` →
  ```json
  { "currency":"VND", "gmv":0, "commission":0,
    "orders":{"total":0,"byStatus":{"requested":0,"invoiced":0,"paid":0,"activated":0,"cancelled":0}},
    "reservations":{"total":0,"byStatus":{"requested":0,"confirmed":0,"completed":0,"cancelled":0}},
    "assistance":{"open":0,"handled":0},
    "activeMemberships":0,
    "expiringVouchers":0 }
  ```
  (expiringVouchers = 잔여>0 & 만료 30일 이내, 전 사용자 합산)

## 5) 카탈로그 관리 (멤버십·바우처·가격·수수료·재고)
DB가 카탈로그의 source of truth가 되도록. **시드는 `src/data/{memberships,voucherPacks,cities}.js`
에서, id 동일**하게.
- 멤버십:
  - `GET /admin/memberships`(비활성 포함) · `POST /admin/memberships`
  - `GET /admin/memberships/:id` · `PATCH /admin/memberships/:id` · `DELETE /admin/memberships/:id`(소프트 삭제=`active:false`)
  - 필드: `src/data/memberships.js` 그대로(id,name,brand,country,cities,hotels,annualFee,currency,
    benefits,diningDiscount,roomDiscount,freeNight,spaBenefit,bestFor,notes,officialUrl,
    estimatedSavings,scores) + 판매: `salePrice`, `commissionRate`.
- 바우처 템플릿:
  - `GET /admin/memberships/:id/vouchers` · `POST /admin/memberships/:id/vouchers`
  - `PATCH /admin/vouchers/:templateId` · `DELETE /admin/vouchers/:templateId`
  - 필드: `src/data/voucherPacks.js` template 그대로(templateId,category,title,description,
    quantity,validUntil,hotels,city,transferable,note).
- 재고 오버사이트: 위 목록/상세에 `issued/used/held/available` 집계 포함(또는
  `GET /admin/vouchers/:templateId/usage`).
- **공개 read 유지**: `GET /memberships`, `GET /memberships/:id`(+vouchers)는 DB 기반으로
  같은 shape 반환(프론트 마이그레이션은 Claude가 이어받음).

## 6) 예약 가용일 관리
- 바우처별 규칙:
  - `GET /admin/vouchers/:templateId/availability` →
    `{ daysOfWeek:[0..6], minLeadDays, maxAdvanceDays, blackouts:[{from,to,key,label}] }`
  - `PUT /admin/vouchers/:templateId/availability`(전체 교체)
- 국가 공휴일 프리셋(블랙아웃):
  - `GET /admin/holidays` · `POST /admin/holidays` · `PATCH /admin/holidays/:id` · `DELETE /admin/holidays/:id`
    `{ country, from, to, key, label }` (예: vn-tet, kr-seollal, kr-chuseok, th-songkran)
- 공개 read: `GET /vouchers/:templateId/availability`(소비자 달력용, Claude 소비).
- **예약 생성 검증**: `POST /reservations`가 가용일 규칙 위반 시 **409 `DATE_NOT_AVAILABLE`**
  `{ reason: 'weekend'|'blackout'|'leadTime'|'tooFar'|'expired'|'closed', holidayKey? }`.
  (프론트 규칙 참고: `src/data/availability.js` — 동일 의미로 서버 권위화)

## 7) 회원 / 정산·리포트
- 회원:
  - `GET /admin/users?q=&page=` → `[{ id, email, name, createdAt, membershipsCount }]`
  - `GET /admin/users/:id` → 프로필 + 지갑(`memberships, vouchers(available/used), reservations, orders, transfers`)
- 정산:
  - `GET /admin/settlements/summary?from=&to=&brand=` →
    기존 `{ gmv, commission, activatedOrderCount, currency }` + `byBrand:[{membershipId,gmv,commission,orders}]`
    (+ 가능하면 `byPeriod:[{date,gmv,commission}]`)
- CSV 내보내기:
  - `GET /admin/reports/orders.csv?from=&to=&status=` → `text/csv` (Content-Disposition filename)
  - `GET /admin/reports/settlements.csv?from=&to=` → `text/csv`
- CS 인박스: 기존 `GET /admin/assistance-requests`에 필터(`?status=open|handled&q=`) + 페이지네이션 추가.

## 8) 마이그레이션 / 시드
- `DATABASE_SCHEMA.md` 확장(neededtables: memberships+자식, voucher_templates, voucher_availability,
  holidays, audit_logs, users.role). 부팅 시 idempotent 마이그레이션.
- 시드: `src/data/*`에서 카탈로그/가용일/공휴일 로드, **id 동일**. SQLite 기본 + `DATABASE_URL` 시 Postgres.

## 9) 문서/계약 갱신
- `docs/BACKEND_API_SPEC.md`에 위 신규 엔드포인트(경로·요청·응답·상태코드·권한) 추가.
- 변경/주의점은 `docs/INTEGRATION_STATUS.md`에 기록(프론트가 읽음).

## 10) 완료 기준 (DoD) — 직접 검증 후 push
- [ ] 기존 `/admin/*` + 소비자 read **무변경**(회귀 없음), 신규 엔드포인트 동작.
- [ ] `npm run e2e:api` 통과(가능하면 백오피스 API 가드/CRUD/가용일/CSV 스모크 추가).
- [ ] CORS 프리플라이트(OPTIONS) 신규 라우트도 `Allow-Headers: Authorization` 포함.
- [ ] `npm ci` 정상(`package.json`+lock 동기화), 인증 401/403 일관.
- [ ] 카탈로그/가용일 id가 `src/data/*`와 동일, 변경은 audit log 기록.
- [ ] Render 재배포까지 반영(라이브에서 신규 admin 엔드포인트 200/403 확인).

## 11) 끝낸 뒤
- push 후 회신: **"백오피스 백엔드 1차 완료 — 신규 엔드포인트 목록 + BACKEND_API_SPEC 갱신"**.
- 그러면 **Claude가 `/admin` 웹사이트에 대시보드/카탈로그/가용일/회원·정산 탭 UI를 붙여**
  이 API를 연결하고 라이브 검증합니다.
- 프론트/계약을 바꿔야 할 일이 보이면 멋대로 바꾸지 말고 `INTEGRATION_STATUS.md`에 적어 둘 것.

---

## 12) [추가] 바우처 다국어(i18n) 영속화 — 2026-06-14 (Claude)

**왜:** 어드민이 새로 만든 바우처는 지금 단일 언어 텍스트만 저장돼, 소비자 앱 5개국어에서 영어(원문) 폴백만 노출됨. 프론트는 이미 언어별 입력 UI(VoucherForm "다국어" 섹션)와 inline `i18n` 우선 로컬라이즈(`localizeVoucher`)를 구현해 두 통신만 붙이면 됨.

**계약 (프론트가 이미 보냄):**
- `POST /admin/memberships/:id/vouchers` 와 `PATCH /admin/vouchers/:templateId` 요청 body에 선택적 필드 `i18n` 포함:
  ```json
  "i18n": {
    "ko": { "title": "...", "description": "...", "note": "..." },
    "vi": { "title": "...", "description": "...", "note": "..." },
    "zh": { ... }, "ja": { ... }
  }
  ```
  - 키는 언어코드(ko/vi/zh/ja). en은 보내지 않음(원문이 곧 영어).
  - 비어있는 언어는 프론트가 제거하고 보냄(빈 객체 `{}` 가능).

**해야 할 일:**
1. `voucher_templates`에 `i18n` 컬럼(JSON/TEXT) 추가. idempotent 마이그레이션.
2. create/update 시 `i18n`을 그대로 저장(JSON 직렬화). PATCH는 부분 병합 또는 전체 교체(프론트는 항상 전체 i18n을 보냄 → 전체 교체 OK).
3. **두 경로 모두에서 `i18n`을 응답에 echo**:
   - 어드민: `GET /admin/memberships/:id/vouchers`
   - **소비자 카탈로그**: `GET /memberships/:id` 의 `vouchers[]` (이게 핵심 — 소비자 앱이 여기서 hydrate).
4. 값이 없으면 `i18n` 생략 또는 `{}` — 프론트는 둘 다 안전.

**DoD:** create(i18n 포함) → `GET /memberships/:id` 응답 voucher에 동일 `i18n` 라운드트립. e2e:api 가드 추가 권장(생성→조회→i18n.ko.title 일치→삭제).

회신 시 **"바우처 i18n 영속화 완료"** 한 줄이면 Claude가 e2e:api 라운드트립 가드를 켜고 라이브 검증함.
