# Codex work order — 백엔드 브랜드 교체 (StayEasy → OhmySelect)

> 프론트엔드는 이미 OhmySelect로 리브랜딩 완료(커밋 `628c43a` 계열).
> 백엔드/백엔드 문서는 Codex 영역이라 손대지 않고 남겨뒀습니다. 아래만 정리해 주세요.
> 추가 질문 없이 끝내고, 끝나면 한 줄로 "백엔드 리브랜딩 완료" 알려주면 됩니다.

## 배경 — 새 브랜드
- 영문: **OhmySelect** / 한글: **오마이셀렉트** / 연결: **OhmySelect by Ohmyhotel**
- 의미: 오마이호텔이 엄선한 호텔 멤버십·바우처·다이닝·스파·객실 혜택 플랫폼

## 바꿀 것 (백엔드/문서)
1. **코드 문자열**: `backend/*.js` 안의 "StayEasy" 표기
   - 예: `server.js`의 로그 `StayEasy backend listening...` → `OhmySelect backend listening...`
   - `db.js`의 `class StayEasyStore` → `OhmySelectStore` (그리고 `server.js`의 import/사용처도 함께)
   - 데모 유저 이름 `'StayEasy Demo User'` → `'OhmySelect Demo User'`
2. **데모 인증 이메일 도메인**: `demo-demo@stayeasy.local` 등 `@stayeasy.local` → `@ohmyselect.local`
   - ⚠️ 단, 데모 유저의 **stable subject/id(`demo-google-user`)는 변경 금지**(프론트·E2E가 의존). 이메일 도메인만 교체.
3. **백엔드 문서**: `docs/BACKEND_API_SPEC.md`, `BACKEND_PROTOTYPE.md`, `BACKEND_TASKS.md`,
   `COLLABORATION_PLAN.md`, `DATABASE_SCHEMA.md`, `QA_CHECKLIST.md`,
   `CLAUDE_FRONTEND_INTEGRATION_GUIDE.md`의 "StayEasy" 표기 → "OhmySelect"

## 같이 처리하면 좋은 것 (lock 충돌 방지)
4. **`package.json` name**: 지금 `"stayeasy"`. 프론트에서 바꾸면 Codex가 방금 바꾼
   `package-lock.json`과 `npm ci`가 깨질 수 있어 **그대로 뒀습니다.**
   - Codex가 lock을 갱신하는 김에 `package.json` `name`을 `"ohmyselect"`로 바꾸고
     **`package-lock.json`의 루트 name도 함께** 갱신(`npm install`로 동기화) 후 커밋해 주세요.

## 바꾸지 말 것 (호환성)
- **localStorage 키** `stayeasy.*` (프론트 호환성)
- **Vite base path** `/StayEasy/` (GitHub Pages, repo명 미변경)
- **GitHub repo 이름** (별도 결정)
- **데모 유저 stable subject** `demo-google-user`
- **API 응답 모양/필드명**(camelCase 계약) — 브랜드 교체가 계약을 바꾸면 안 됨

## 완료 기준 (DoD)
- [ ] `backend/`·백엔드 문서에 "StayEasy" 0건 (위 호환성 항목 제외)
- [ ] `npm run backend` 정상 구동, `npm run e2e:api` 통과 (계약 불변)
- [ ] `package.json`+`package-lock.json` name 동기화로 `npm ci` 정상
- [ ] 데모 stable subject/localStorage 키/base path 미변경 확인

끝나면 push 후 한 줄 회신. 그러면 프론트(Claude)가 `e2e:api`로 계약 재검증합니다.

---

# 라이브 어드민 연결 (후속 · 우선)

어드민을 **독립 웹사이트**로 분리해 배포 완료했습니다.
- 라이브: `https://bstars00-rgb.github.io/StayEasy/admin/` (정상 200, 쉘 로딩 OK)
- 기존 `VITE_API_BASE_URL`(=`https://stayeasy-backend-g3z0.onrender.com`) + `/api/v1/admin/*`
  계약 그대로 사용, **프론트 무변경**.

## 막힌 지점 (Render 백엔드)
1. **admin 라우트가 라이브에 미반영** — 라이브 백엔드 직접 호출 시
   `GET /api/v1/admin/orders → 404 {"error":{"code":"NOT_FOUND",...}}`.
   admin API가 포함된 최신 백엔드가 **Render에 재배포되지 않음** → **Render 재배포 필요**.
2. **`ADMIN_EMAILS` 환경변수 설정** — 라이브 데모 로그인의 `user.email`이
   **`demo-gle-user@stayeasy.local`** 로 내려옵니다(라이브 백엔드 파생값).
   Render `ADMIN_EMAILS`에 이 값(데모 검증용) + 실제 운영자 이메일을 콤마로 추가.
   (로컬 e2e는 `ADMIN_EMAILS=demo.user@gmail.com` 으로 통과 중)

## 프론트가 사용하는 admin 엔드포인트 (계약 확인)
- `GET /admin/orders` · `PATCH /admin/orders/:id/status {status}`
- `GET /admin/reservations` · `PATCH /admin/reservations/:id/status {status}`
- `GET /admin/assistance-requests` · `PATCH /admin/assistance-requests/:id {status, adminNote}`
- `GET /admin/settlements/summary` → `{ gmv, commission, activatedOrderCount, currency }`
- 권한 없으면 **403 `ADMIN_REQUIRED`** (프론트 전용 안내화면). envelope/bare 둘 다 프론트가
  처리하므로 응답 형식은 그대로 두어도 됩니다.

## 완료 기준 (DoD)
- [ ] 라이브 `https://.../StayEasy/admin/` 로그인 → 주문·예약·문의·정산 로드(404 사라짐)
- [ ] 비관리자 계정 → 403 → "관리자 권한이 필요합니다" 화면
- [ ] `npm run e2e:api` 그대로 통과(계약 불변)

끝나면 "어드민 라이브 연결 완료" 한 줄 회신 → 프론트가 라이브 `/admin/` 로그인까지 재검증.

---

# 🚨 라이브 차단 원인 = CORS 프리플라이트 (Render 백엔드 수정 필요)

admin API 라이브 반영은 확인됐습니다(서버-서버 호출 200/401/403 정상). 하지만
**브라우저에서 인증 요청이 CORS로 막혀** 라이브 `/admin/`이 데이터 로드를 못 합니다.
이건 admin뿐 아니라 **인증 토큰을 보내는 모든 엔드포인트(소비자 wallet/orders 포함)** 에 영향.

## 진단 (실측)
- 브라우저(`https://bstars00-rgb.github.io` origin)에서:
  - `GET /api/v1/memberships` (인증 없음, simple) → **200 OK**
  - `GET /api/v1/admin/orders` (Authorization 헤더) → **`Failed to fetch` (CORS 차단)**
- 프리플라이트 응답 실측:
  - `OPTIONS /api/v1/admin/orders` → **204**, `Access-Control-Allow-Origin: https://bstars00-rgb.github.io` ✅
  - 그러나 **`Access-Control-Allow-Headers` 없음**, **`Access-Control-Allow-Methods` 없음** ❌
- 즉 `Authorization` 헤더가 붙는 요청은 프리플라이트가 필요한데, 응답에
  허용 헤더/메서드가 없어서 브라우저가 본 요청을 막습니다.
  (로컬 `e2e:api`는 OPTIONS에 허용 헤더가 있어 통과 — 라이브 빌드/설정만 누락)

## 고칠 것 (백엔드 OPTIONS/프리플라이트 응답)
모든 `/api/v1/*`(특히 인증 필요 라우트)의 **OPTIONS 응답에** 다음을 포함:
```
Access-Control-Allow-Origin: https://bstars00-rgb.github.io   (또는 요청 Origin 반영)
Access-Control-Allow-Methods: GET, POST, PATCH, DELETE, OPTIONS
Access-Control-Allow-Headers: Authorization, Content-Type
Access-Control-Max-Age: 600
```
가능하면 실제 응답(GET/POST/PATCH)에도 `Access-Control-Allow-Origin`을 계속 echo.

## 검증 기준
- [ ] 브라우저에서 `OPTIONS /api/v1/admin/orders` → `Allow-Headers: Authorization` 포함
- [ ] 라이브 `https://.../StayEasy/admin/` 데모 로그인 → 4개 탭 데이터 로드(빈 상태 OK)
- [ ] 비관리자 → 403 → "관리자 권한이 필요합니다" 화면
- [ ] 주문/예약 상태 변경(PATCH) 동작

> 프론트는 계약 변경 없이 이미 대응 완료: `Promise.allSettled`로 부분 실패에도
> 콘솔이 죽지 않고, 어느 호출이든 403이면 권한 화면을 띄웁니다. CORS만 풀리면 통과.
