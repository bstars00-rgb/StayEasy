# Codex Session Handoff

작성일: 2026-06-07

## 오늘 완료한 내용

### 1. 백엔드 프로토타입 구성

- 프론트 API 연동 확인용 백엔드 프로토타입을 구성했다.
- 주요 API 흐름:
  - Google demo auth
  - memberships/cities catalog
  - wallet
  - reservations
  - orders
  - transfers
  - assistance requests
  - settlements summary
  - recommendations quiz
- 프론트는 `VITE_API_BASE_URL`이 있으면 백엔드 API를 호출하고, 없으면 오프라인 데모 모드로 동작한다.

### 2. DB persistence 전환

- 기존 인메모리 프로토타입을 SQLite/PostgreSQL 대응 구조로 전환했다.
- `DATABASE_URL`이 있으면 PostgreSQL/Supabase 계열 연결을 사용한다.
- `DATABASE_URL`이 없으면 기본 SQLite 파일을 사용한다.
- seed/migration은 서버 시작 시 자동 실행된다.
- GitHub Actions에서 `e2e:api`가 통과했다.

### 3. 배포 구성

- 백엔드는 Render 배포 기준으로 연결 확인했다.
- 현재 Render 백엔드 주소:
  - `https://stayeasy-backend-g3z0.onrender.com`
- 프론트 GitHub Pages 주소:
  - `https://bstars00-rgb.github.io/StayEasy`
- 프론트 GitHub Actions/Vite 변수:
  - `VITE_API_BASE_URL`
  - 값은 Render 백엔드 주소를 넣는다.

### 4. 리브랜딩

- 백엔드/백엔드 문서 브랜드명을 `StayEasy`에서 `OhmySelect`로 변경했다.
- 적용된 브랜드:
  - 영문: `OhmySelect`
  - 한글: `오마이셀렉트`
  - 연결 문구: `OhmySelect by Ohmyhotel`
- 변경한 주요 항목:
  - `StayEasyStore` -> `OhmySelectStore`
  - `StayEasy Demo User` -> `OhmySelect Demo User`
  - `@stayeasy.local` -> `@ohmyselect.local`
  - `package.json`/`package-lock.json` name -> `ohmyselect`
  - 백엔드 문서 내 브랜드 표기
- 유지한 호환성 항목:
  - `localStorage` 키 `stayeasy.*`
  - Vite base path `/StayEasy/`
  - GitHub repo 이름 `StayEasy`
  - demo stable subject `demo-google-user`
  - API 응답 shape/field names

### 5. CI 검증

- 최종 원격 커밋:
  - `e02707a`
- GitHub Actions 결과:
  - `Tests`: success
  - `npm run e2e:api`: success
  - `Deploy to GitHub Pages`: success

## 현재 운영 상태

- 프론트와 백엔드 연결은 성공 상태다.
- Chrome DevTools Network에서 요청이 아래 형태로 나가면 연결 성공이다.
  - `https://stayeasy-backend-g3z0.onrender.com/api/v1/...`
- Render free instance는 inactivity 후 cold start가 있어 첫 요청이 50초 이상 지연될 수 있다.
- Render 로그에 `Your service is live`가 보이면 백엔드 서비스는 정상이다.

## 내일 시작할 작업

### 목표: 어드민 MVP 설계 및 구현

앱을 실제 운영하려면 관리자 화면과 관리자 API가 필요하다. 우선 아래 4개 기능부터 만든다.

1. 주문 관리
   - 주문 목록 조회
   - 주문 상태 변경
   - 상태 흐름: `requested -> invoiced -> paid -> activated`

2. 예약 관리
   - 예약 목록 조회
   - 예약 상태 변경
   - 상태 흐름: `requested -> confirmed -> completed/cancelled`

3. 도움 요청 관리
   - assistance request 목록 조회
   - 처리 상태 변경
   - 운영 메모 또는 응대 상태 저장

4. 정산 요약
   - GMV
   - 수수료
   - 활성화 주문 수

## 내일 Codex 작업 초안

```text
docs/CODEX_SESSION_HANDOFF.md를 읽고 이어서 진행해.
OhmySelect 운영용 Admin MVP를 백엔드부터 구현해.
우선 ADMIN_EMAILS 기반 관리자 권한 체크를 추가하고,
/api/v1/admin/orders, /api/v1/admin/reservations,
/api/v1/admin/assistance-requests, /api/v1/admin/settlements/summary를 만들어.
기존 사용자 API 응답 shape와 프론트 호환성은 깨지지 않게 유지하고,
끝나면 e2e:api에 관리자 테스트를 추가해서 통과 확인 후 push해.
```

## 내일 Claude에게 전달할 작업 초안

```text
프론트에 /admin 라우트를 추가해 주세요.
관리자 계정만 접근 가능하게 하고 백엔드의 /api/v1/admin/* API를 호출합니다.
우선 주문 관리, 예약 관리, 도움 요청 관리, 정산 요약 화면을 만들어 주세요.
기존 사용자 화면, localStorage 키, Vite base path는 변경하지 마세요.
```

## 주의사항

- 프론트 repo path `/StayEasy/`는 그대로 둔다.
- `stayeasy.*` localStorage 키는 그대로 둔다.
- 백엔드 API field name은 camelCase 계약을 유지한다.
- 일반 사용자 API와 관리자 API를 분리한다.
- 첫 admin 인증은 간단하게 `ADMIN_EMAILS` 환경변수 기반으로 시작한다.
- 이후 실제 운영 전에는 Google ID token 검증, admin role DB 저장, audit log가 필요하다.
