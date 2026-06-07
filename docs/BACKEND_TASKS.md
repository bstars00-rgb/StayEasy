# OhmySelect Backend Tasks

작성일: 2026-06-07

## Phase 0. 결정 필요

- 백엔드 런타임: Node.js/NestJS, Express, Fastify 중 선택
- DB: PostgreSQL 권장
- 배포: Railway, Render, Fly.io, AWS, Supabase 중 선택
- 인증: Google OAuth ID token 서버 검증 + 자체 JWT
- 운영자 기능 범위: 주문 상태 변경, 예약 상태 변경, 정산 조회

## Phase 1. MVP API Foundation

- 프로젝트 초기화
- 환경변수 구성
- 공통 JSON 응답/오류 포맷
- 요청 validation
- 인증 middleware
- DB migration 구조
- seed 데이터: memberships, cities, voucher templates
- 테스트 환경 구성

완료 기준:

- `/api/v1/health` 응답
- 테스트 DB migration 실행 가능
- seed 후 catalog 조회 가능

## Phase 2. Auth

- Google ID token 검증
- 사용자 upsert
- access/refresh token 발급
- `/me`
- logout/refresh

완료 기준:

- 프론트 Google 로그인 후 서버 세션 생성
- 토큰 없이 보호 API 호출 시 `AUTH_REQUIRED`

## Phase 3. Catalog

- 도시 목록
- 멤버십 목록 필터
- 멤버십 상세 + 바우처 템플릿
- 비교 API
- 추천 퀴즈 API

완료 기준:

- 현재 mock 데이터와 같은 화면을 API 응답만으로 렌더링 가능

## Phase 4. Wallet

- 무료 멤버십 가입
- 지갑 조회
- 바우처 재고 계산
- 멤버십 제거 시 예약/사용/선물 정리

완료 기준:

- 무료 멤버십 가입 후 `/wallet`에 바우처 표시
- 만료 임박, 사용 가능 수량, 진행 중 예약 수 계산

## Phase 5. Reservations

- 예약 생성
- 재고 hold 처리
- 예약 상태 변경
- 완료 시 used_count 증가
- 취소 시 hold 해제

완료 기준:

- 마지막 1장 바우처에 중복 예약 생성 불가
- `completed` 처리 후 available 감소

## Phase 6. Orders and Settlement

- 유료 멤버십 주문 생성
- 가격/수수료 서버 계산
- 상태 전이
- activated 시 지갑 지급
- 정산 요약

완료 기준:

- 프론트 구매 플로우가 서버 주문으로 동작
- 활성화 주문만 GMV/수수료 집계

## Phase 7. Transfers and Assistance

- 양도 가능 바우처 선물
- 선물 재고 차감
- 도움 요청 저장
- 운영 알림 연동 후보: email, Slack, WhatsApp deep link

완료 기준:

- transferable=false 바우처는 선물 불가
- 선물된 수량은 available에서 제외

## Phase 8. QA and Release

- 단위 테스트
- API 통합 테스트
- 프론트 E2E 테스트의 API mode 실행
- seed/staging 환경 구성
- 운영 로그/에러 추적

완료 기준:

- 주요 사용자 흐름이 staging에서 통과
- Claude 프론트와 Codex 백엔드 API 계약 불일치 없음
