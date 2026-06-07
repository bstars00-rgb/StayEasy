# StayEasy Claude + Codex Collaboration Plan

작성일: 2026-06-07

## 1. 목표

Claude는 프론트엔드 화면과 사용자 경험을 맡고, Codex는 백엔드/API/DB/QA 기준을 맡는다. 두 작업은 문서화된 API 계약을 기준으로 연결한다.

## 2. 역할 분담

### Claude

- 모바일 우선 UI/UX
- React 화면/컴포넌트 구현
- 로딩, 빈 상태, 오류 상태 표현
- 다국어 문구 반영
- API client 연결부 적용

### Codex

- 백엔드 API 설계/구현
- DB schema/migration
- Google 인증 서버 검증
- 주문/예약/바우처 재고 상태 전이
- 정산/파트너 API
- API 테스트와 QA 시나리오

## 3. 공유 기준 문서

- `docs/BACKEND_API_SPEC.md`: 프론트와 백엔드가 맞출 API 계약
- `docs/DATABASE_SCHEMA.md`: DB 모델 초안
- `docs/CLAUDE_FRONTEND_INTEGRATION_GUIDE.md`: Claude 프론트 연동 기준
- `docs/BACKEND_TASKS.md`: 백엔드 구현 순서
- `docs/QA_CHECKLIST.md`: QA 체크리스트

## 4. 협업 순서

1. Codex가 API 계약과 DB schema를 확정한다.
2. Claude가 API client 계층을 만들고 기존 `localStorage` 호출부를 감싼다.
3. Codex가 mock 데이터와 같은 shape로 catalog API를 먼저 제공한다.
4. Claude가 `VITE_API_BASE_URL` 기준으로 mock mode/API mode를 전환한다.
5. Codex가 auth, wallet, reservation, order API를 순서대로 구현한다.
6. Claude와 Codex가 E2E 흐름을 staging 기준으로 검증한다.

## 5. 우선 구현 범위

### 1차

- Google 로그인 서버 검증
- 멤버십 목록/상세 조회
- 지갑 조회
- 무료 멤버십 가입
- 예약 요청 생성

### 2차

- 유료 주문 생성
- 주문 상태 운영자 변경
- 주문 활성화 시 바우처 지급
- 정산 요약

### 3차

- 바우처 선물
- 도움 요청 저장
- 파트너/운영자 권한
- 다기기 동기화 QA

## 6. 중요한 결정

- 상태 전이와 바우처 재고는 서버가 최종 권한을 가진다.
- 가격과 수수료는 서버가 계산한다.
- 주문 상태 변경은 일반 사용자가 아니라 운영자/파트너 권한으로 제한한다.
- 예약 요청은 즉시 확정이 아니라 운영자가 호텔과 조율하는 비동기 흐름이다.
- 프론트는 API 실패 가능성을 항상 UI에 표현해야 한다.
