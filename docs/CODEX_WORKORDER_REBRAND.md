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
