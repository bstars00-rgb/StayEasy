# Codex work order — DB 영속화 (인메모리 → PostgreSQL/SQLite)

> 이 문서는 Codex가 **추가 질문 없이 끝까지 실행**할 수 있도록 작성된 작업지시서입니다.
> 끝나면 커밋 후 push 하고, 한 줄로 "완료, e2e:api 통과" 라고만 알려주면 됩니다.
> 참고: 계약은 [`BACKEND_API_SPEC.md`](BACKEND_API_SPEC.md), 스키마는 [`DATABASE_SCHEMA.md`](DATABASE_SCHEMA.md),
> 배경/제약은 [`PERSISTENCE_HANDOFF.md`](PERSISTENCE_HANDOFF.md).

## 목표
`backend/server.js`의 인메모리 저장소를 **영속 DB**로 교체한다.
프론트엔드는 **변경 금지** — API JSON 모양만 그대로면 프론트는 자동으로 동작한다.

## 결정사항 (되묻지 말 것)
- **DB 엔진: 듀얼 모드.**
  - `DATABASE_URL` **미설정** → **SQLite**(`better-sqlite3` 또는 `node:sqlite`)로 무설정 구동. 파일 경로 기본값 `backend/.data/stayeasy.sqlite`, 환경변수 `SQLITE_PATH`로 변경 가능. 테스트/CI는 이 경로로 동작.
  - `DATABASE_URL` **설정**(`postgres://...`) → **PostgreSQL**(`pg`) 사용. Supabase도 이 URL로 연결.
  - → 이렇게 하면 CI(`e2e:api`)가 **외부 서비스 없이** 그대로 통과한다. 이게 가장 중요한 제약.
- 마이그레이션/시드는 **서버 부팅 시 자동 실행**(idempotent). 별도 수동 명령 불필요.
- 인증은 현행 유지: `POST /auth/google`은 dev/test에서 비검증 토큰 허용(실제 Google `sub` 검증은 prod 한정, 환경변수 게이트).

## 반드시 지킬 계약 (프론트 무변경 조건)
- 응답은 **camelCase JSON** 유지 (DB 컬럼이 snake_case여도 API에서 매핑):
  `paidAmount, commissionAmount, currency, membershipId, templateId, childAges, createdAt` 등.
- `GET /wallet` → `{ summary, memberships[], vouchers[], reservations[], orders[], transfers[] }`,
  각 voucher는 `{ quantity, used, held, transferred, available }`.
- **카탈로그 id 동일**: `src/data/{memberships,voucherPacks,cities}.js`에서 시드하고 id를 그대로 사용
  (`club-marriott-vietnam`, `cm-dinner` 등). 새 id 생성 금지.
- `available = quantity − used − held − transferred`
  (`held` = `requested`/`confirmed` 예약). **트랜잭션 + row lock**으로 원자적 보장.
- 상태 머신 유지: 잘못된 전이는 `409 INVALID_STATUS_TRANSITION`.
- 모든 `/me|/wallet|/reservations|/orders|/transfers`는 Bearer 사용자 스코프.

## 데이터 모델
`DATABASE_SCHEMA.md`의 테이블을 그대로 구현:
users, cities, memberships(+membership_cities/hotels/tags/scores), voucher_templates(+hotels),
user_memberships(활성 unique (user_id,membership_id)), voucher_usage, reservations(child_ages),
orders(invoice_url nullable), transfers, assistance_requests.

## 산출물 체크리스트
- [ ] 마이그레이션(테이블 생성) — SQLite + Postgres 양쪽 호환 SQL.
- [ ] 시드 스크립트 — `src/data/*`에서 카탈로그 로드, id 동일.
- [ ] `backend/server.js`가 인메모리 대신 DB 레이어 사용. 핸들러 시그니처/응답 모양 불변.
- [ ] 예약 생성/취소/완료, 양도, 주문 활성화에서 트랜잭션 + 재고 락.
- [ ] `npm run backend`가 DATABASE_URL 유무에 따라 SQLite/Postgres 자동 선택.
- [ ] 로컬 실행법을 `BACKEND_PROTOTYPE.md`에 추가(SQLite 기본 / DATABASE_URL로 Postgres·Supabase).
- [ ] 의존성 추가 시 `package.json` 반영(가능하면 `node:sqlite` 우선해 네이티브 빌드 회피).

## 완료 기준 (DoD) — 직접 검증 후 push
- [ ] `npm run backend` 가 SQLite로 무설정 구동된다.
- [ ] `npm run e2e:api` 가 **로컬에서 통과**한다 (DB 백엔드 상대로).
- [ ] 서버 재시작 후에도 가입/주문/예약 데이터가 **유지**된다(영속성 확인).
- [ ] API JSON 모양 불변 — `INTEGRATION_STATUS.md`의 스모크 흐름으로 스팟체크.
- [ ] (Postgres 경로) `DATABASE_URL` 지정 시 동일하게 동작.

## 끝난 뒤
- 커밋 후 push. 한 줄 회신: "DB 영속화 완료 / e2e:api 통과 / 엔진=SQLite+PG".
- 그러면 Claude(프론트)가 `e2e:api`를 재검증하고, 필요 시 CI 워크플로를 마무리한다.
- **프론트/계약을 바꿔야 할 일이 생기면 멋대로 바꾸지 말고** `INTEGRATION_STATUS.md`에 적어 둘 것.
