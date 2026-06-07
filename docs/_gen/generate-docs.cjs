/* Generates 명세서(기능 명세서) and 스펙설명서(기술 명세서) as .docx */
const fs = require('fs')
const path = require('path')
const {
  Document, Packer, Paragraph, TextRun, Table, TableRow, TableCell,
  AlignmentType, LevelFormat, HeadingLevel, BorderStyle, WidthType, ShadingType,
  TableOfContents, PageBreak, Header, Footer, PageNumber,
} = require('docx')

const OUT = path.join(__dirname, '..')
const FONT = 'Malgun Gothic'
const ACCENT = '13838A'
const CONTENT_W = 9026 // A4, 1" margins

// ---------- helpers ----------
const P = (text, opts = {}) =>
  new Paragraph({ spacing: { after: 120, line: 276 }, children: [new TextRun({ text, ...opts })] })
const H1 = (text) => new Paragraph({ heading: HeadingLevel.HEADING_1, children: [new TextRun(text)] })
const H2 = (text) => new Paragraph({ heading: HeadingLevel.HEADING_2, children: [new TextRun(text)] })
const H3 = (text) => new Paragraph({ heading: HeadingLevel.HEADING_3, children: [new TextRun(text)] })
const BUL = (text, level = 0) =>
  new Paragraph({ numbering: { reference: 'b', level }, spacing: { after: 60 }, children: [new TextRun(text)] })
const NUM = (text) =>
  new Paragraph({ numbering: { reference: 'n', level: 0 }, spacing: { after: 60 }, children: [new TextRun(text)] })
const SPACER = () => new Paragraph({ spacing: { after: 80 }, children: [] })

const border = { style: BorderStyle.SINGLE, size: 1, color: 'CCCCCC' }
const borders = { top: border, bottom: border, left: border, right: border }
const cell = (text, w, { head = false, bold = false } = {}) =>
  new TableCell({
    borders,
    width: { size: w, type: WidthType.DXA },
    shading: { fill: head ? 'D6EAEC' : 'FFFFFF', type: ShadingType.CLEAR },
    margins: { top: 60, bottom: 60, left: 120, right: 120 },
    children: [new Paragraph({ children: [new TextRun({ text, bold: head || bold, size: head ? 20 : 20 })] })],
  })
function table(widths, rows) {
  return new Table({
    width: { size: CONTENT_W, type: WidthType.DXA },
    columnWidths: widths,
    rows: rows.map((r, ri) =>
      new TableRow({ children: r.map((c, ci) => cell(String(c), widths[ci], { head: ri === 0 })) })
    ),
  })
}

function titlePage(title, subtitle, meta) {
  return [
    new Paragraph({ spacing: { before: 2600, after: 0 }, alignment: AlignmentType.CENTER,
      children: [new TextRun({ text: 'StayEasy', bold: true, size: 64, color: ACCENT })] }),
    new Paragraph({ alignment: AlignmentType.CENTER, spacing: { after: 600 },
      children: [new TextRun({ text: '호텔 멤버십 혜택 발견·관리 앱', size: 24, color: '666666' })] }),
    new Paragraph({ alignment: AlignmentType.CENTER, spacing: { after: 120 },
      children: [new TextRun({ text: title, bold: true, size: 40 })] }),
    new Paragraph({ alignment: AlignmentType.CENTER, spacing: { after: 800 },
      children: [new TextRun({ text: subtitle, size: 24, color: '666666' })] }),
    ...meta.map((m) => new Paragraph({ alignment: AlignmentType.CENTER, spacing: { after: 40 },
      children: [new TextRun({ text: m, size: 20, color: '888888' })] })),
    new Paragraph({ children: [new PageBreak()] }),
  ]
}

const styles = {
  default: { document: { run: { font: FONT, size: 22 } } },
  paragraphStyles: [
    { id: 'Heading1', name: 'Heading 1', basedOn: 'Normal', next: 'Normal', quickFormat: true,
      run: { size: 30, bold: true, font: FONT, color: ACCENT },
      paragraph: { spacing: { before: 320, after: 160 }, outlineLevel: 0 } },
    { id: 'Heading2', name: 'Heading 2', basedOn: 'Normal', next: 'Normal', quickFormat: true,
      run: { size: 25, bold: true, font: FONT, color: '1A1A1A' },
      paragraph: { spacing: { before: 220, after: 120 }, outlineLevel: 1 } },
    { id: 'Heading3', name: 'Heading 3', basedOn: 'Normal', next: 'Normal', quickFormat: true,
      run: { size: 22, bold: true, font: FONT, color: '333333' },
      paragraph: { spacing: { before: 160, after: 80 }, outlineLevel: 2 } },
  ],
}
const numbering = {
  config: [
    { reference: 'b', levels: [
      { level: 0, format: LevelFormat.BULLET, text: '•', alignment: AlignmentType.LEFT,
        style: { paragraph: { indent: { left: 480, hanging: 240 } } } },
      { level: 1, format: LevelFormat.BULLET, text: '–', alignment: AlignmentType.LEFT,
        style: { paragraph: { indent: { left: 960, hanging: 240 } } } },
    ] },
    { reference: 'n', levels: [
      { level: 0, format: LevelFormat.DECIMAL, text: '%1.', alignment: AlignmentType.LEFT,
        style: { paragraph: { indent: { left: 480, hanging: 240 } } } },
    ] },
  ],
}
function sectionWrap(children, docTitle) {
  return {
    properties: { page: { size: { width: 11906, height: 16838 }, margin: { top: 1440, right: 1440, bottom: 1440, left: 1440 } } },
    headers: { default: new Header({ children: [new Paragraph({ alignment: AlignmentType.RIGHT,
      children: [new TextRun({ text: `StayEasy · ${docTitle}`, size: 16, color: '999999' })] })] }) },
    footers: { default: new Footer({ children: [new Paragraph({ alignment: AlignmentType.CENTER,
      children: [new TextRun({ text: '', size: 16, color: '999999' }), new TextRun({ children: [PageNumber.CURRENT], size: 16, color: '999999' })] })] }) },
    children,
  }
}

// =====================================================================
// DOC 1 — 기능 명세서 (Functional Specification)
// =====================================================================
function buildFunctionalSpec() {
  const c = []
  c.push(...titlePage('기능 명세서', 'Functional Specification', ['버전 1.0', '작성일: 2026-06-07', 'github.com/bstars00-rgb/StayEasy']))
  c.push(new Paragraph({ children: [new TableOfContents('목차', { hyperlink: true, headingStyleRange: '1-2' })] }))
  c.push(new Paragraph({ children: [new PageBreak()] }))

  c.push(H1('1. 개요'))
  c.push(P('StayEasy는 도시 기반으로 호텔 멤버십 혜택을 발견·비교하고, 구매한 멤버십의 바우처를 한 곳에서 관리하며, 번거로운 예약 과정을 대행해 주는 모바일 우선(Mobile-first) 웹 앱이다.'))
  c.push(P('사용자는 여러 브랜드(메리어트, 아코르, 힐튼 등)의 멤버십을 통합 관리하고, 바우처 잔여·유효기간을 추적하며, 앱을 통해 예약을 요청한다. StayEasy는 멤버십 판매를 중개하고 결제액의 일정 비율을 수수료로 받는 구조를 가진다.'))
  c.push(H2('1.1 목적'))
  c.push(BUL('브랜드별로 흩어진 멤버십 혜택을 한 앱에서 발견·비교'))
  c.push(BUL('구매한 멤버십의 바우처(혜택)를 디지털 지갑으로 관리 — 잔여 수량·유효기간·만료 알림'))
  c.push(BUL('전화/이메일로만 가능하던 예약을 앱 내 요청으로 간소화 (핵심 가치)'))
  c.push(BUL('멤버십 판매 중개를 통한 수수료 수익(BM) 실현'))
  c.push(H2('1.2 대상 사용자'))
  c.push(BUL('베트남 거주/방문 여행자 및 현지 직장인(다이닝·스테이케이션 수요)'))
  c.push(BUL('호텔 멤버십을 보유했으나 혜택을 제때 활용하지 못하는 사용자'))
  c.push(BUL('멤버십 가입을 고민 중이며 가성비를 비교하려는 잠재 고객'))

  c.push(H1('2. 범위 및 제약'))
  c.push(P('본 문서는 프론트엔드 MVP 범위를 정의한다.'))
  c.push(H2('2.1 포함(In scope)'))
  c.push(BUL('멤버십 발견/탐색/비교/상세, 바우처 지갑, 예약 요청, 구매 플로우, 추천 퀴즈, 도움 요청, 간편 로그인, 5개 언어'))
  c.push(H2('2.2 제외(Out of scope, MVP 기준)'))
  c.push(BUL('백엔드 서버, 데이터베이스, 실결제(PG) — 결제는 호텔 브랜드 인보이스로 진행'))
  c.push(BUL('운영용 인증/세션(토큰 검증), 관리자 백오피스'))
  c.push(P('모든 사용자 데이터(보유 멤버십, 바우처 사용, 예약, 주문, 로그인 프로필)는 브라우저 localStorage에 저장된다. 멤버십 데이터는 샘플(mock) 데이터다.'))

  c.push(H1('3. 대상 시장'))
  c.push(table([3009, 3009, 3008], [
    ['구분', '도시', '비고'],
    ['1차(핵심)', '호치민, 다낭, 하노이', '베트남 — 초기 타깃'],
    ['확장', '서울, 방콕, 도쿄', '브랜드 글로벌 자산 연계'],
  ]))

  c.push(H1('4. 사용자 시나리오'))
  c.push(NUM('발견: 지인/SNS/호텔 현장에서 멤버십을 알게 됨 → StayEasy에서 도시·혜택으로 탐색·비교'))
  c.push(NUM('구매: 유료 멤버십을 StayEasy를 통해 구매 신청 → 브랜드가 인보이스 발행 → 고객이 브랜드에 결제 → 바우처가 지갑에 지급'))
  c.push(NUM('활용: 지갑에서 바우처 선택 → 날짜·인원(성인/소아)·호텔 입력 → 예약 요청 → 사용 완료 시 잔여 차감'))
  c.push(NUM('관리: 만료 임박/진행 중 예약을 홈 알림으로 확인'))

  c.push(H1('5. 기능 요구사항'))

  c.push(H2('5.1 멤버십 발견·탐색'))
  c.push(BUL('홈: 선택 도시의 인기 멤버십, 빠른 진입 CTA(찾기/내 혜택/추천 퀴즈), 만료·예약 알림'))
  c.push(BUL('탐색: 도시 필터 + 혜택유형 필터(다이닝/객실/스파/비즈니스/free night 등) + 추천점수 정렬'))
  c.push(BUL('멤버십 카드: 브랜드, 국가, 도시, 대표 혜택, 연회비/예상 절약, 추천 점수, 액션 버튼'))

  c.push(H2('5.2 비교'))
  c.push(BUL('최대 3개 멤버십을 나란히 비교(연회비·예상절약·무료숙박·스파·할인율·도시수·점수 바)'))
  c.push(BUL('기본값으로 Club Marriott · Accor Plus 표시, localStorage에 비교 목록 유지'))

  c.push(H2('5.3 멤버십 상세 · 바우처'))
  c.push(BUL('상세: 핵심 혜택, 참여 호텔, 추천 점수 바, 유의사항, 가치 요약(ROI), 공식 사이트'))
  c.push(BUL('포함 혜택(바우처 팩): 멤버십이 제공하는 바우처 목록(카테고리·수량·유효기간)'))
  c.push(BUL('바우처 상세: 항목 탭 시 설명·이용 가능 호텔·현장 조건·이용 약관 표시'))

  c.push(H2('5.4 구매 플로우 · 수수료(BM)'))
  c.push(BUL('무료 멤버십: "무료 가입" → 즉시 지갑에 바우처 지급'))
  c.push(BUL('유료 멤버십: "구매하기"(정가/할인가) → 구매 신청서 → 주문 생성'))
  c.push(BUL('주문 상태: 신청됨 → 인보이스 발급 → 결제 완료 → 바우처 지급(활성화)'))
  c.push(BUL('결제는 호텔 브랜드 인보이스로 진행(인앱 결제 없음). 활성화 시 멤버십이 지갑에 등록'))
  c.push(BUL('수수료 = 결제액 × 멤버십별 수수료율. "구매" 탭에 내부·데모용 정산 요약(GMV/수수료)'))

  c.push(H2('5.5 바우처 지갑'))
  c.push(BUL('보유 멤버십의 바우처를 카테고리 탭으로 관리(전체/다이닝/객실/스파/할인/선물/기타)'))
  c.push(BUL('바우처별 전체/사용가능/사용완료 카운트, 유효기간, 현장 조건 표시'))
  c.push(BUL('요약: 보유 멤버십 수, 사용 가능 바우처, 30일 내 만료, 진행 중 예약'))

  c.push(H2('5.6 예약 요청'))
  c.push(BUL('바우처에서 예약 요청 → 날짜, 인원(성인/소아), 호텔, 요청사항 입력'))
  c.push(BUL('인원: 성인 수 + 소아 수, 소아는 각각 나이를 드롭다운(12개월 미만~17세)으로 선택'))
  c.push(BUL('생성 시 예약 기록 + WhatsApp/이메일로 요청 전송'))
  c.push(BUL('예약 상태: 요청됨 → 확정됨 → 사용완료/취소. 사용완료 시 바우처 1매 차감'))

  c.push(H2('5.7 추천 퀴즈'))
  c.push(BUL('5문항(도시/관심 혜택/이용 빈도/동반자/연회비 의향) → 상위 3개 추천'))
  c.push(BUL('추천 사유 칩(도시 일치/혜택 강점/예산 적합 등), 예상 절약, 바로 추가/문의'))

  c.push(H2('5.8 도움 요청'))
  c.push(BUL('이름/연락처/도시/멤버십/희망일/인원/요청유형/메시지 → WhatsApp·이메일 링크 생성'))
  c.push(BUL('초안 localStorage 저장'))

  c.push(H2('5.9 간편 로그인 · 게스트'))
  c.push(BUL('"Google로 계속" 한 번으로 가입(하이브리드: 기본 데모, Client ID 설정 시 실제 GIS)'))
  c.push(BUL('게스트는 탐색·비교 가능, 저장/구매/예약 시 로그인 유도 후 동작 이어가기'))
  c.push(BUL('프로필 localStorage 저장, 헤더 아바타·로그아웃'))

  c.push(H2('5.10 다국어'))
  c.push(BUL('한국어/English/Tiếng Việt/中文/日本語, 누락 시 영어 폴백, 선택 언어 localStorage 저장'))

  c.push(H1('6. 화면 구성 (IA)'))
  c.push(table([2400, 4226, 2400], [
    ['화면', '설명', '경로'],
    ['홈', '도시 인기 멤버십·알림·CTA', '/'],
    ['탐색', '도시/혜택 필터·목록', '/explore'],
    ['멤버십 상세', '혜택·바우처 팩·구매', '/membership/:id'],
    ['비교', '최대 3개 비교', '/compare'],
    ['내 혜택', '지갑·예약·구매(주문)', '/my-benefits'],
    ['추천 퀴즈', '5문항·추천', '/quiz'],
    ['도움', '문의(WhatsApp/이메일)', '/help'],
  ]))
  c.push(P('하단 탭 내비게이션(홈/탐색/비교/내 혜택/도움) + 상단 헤더(로고·도시·언어·계정).'))

  c.push(H1('7. 데이터 정의'))
  c.push(H2('7.1 멤버십'))
  c.push(table([2600, 6426], [
    ['필드', '설명'],
    ['id / name / brand / country', '식별자, 프로그램명, 브랜드, 국가'],
    ['cities / hotels', '이용 도시, 대표 호텔'],
    ['annualFee / currency / salePrice', '연회비, 통화, 할인가(유료)'],
    ['commissionRate', '수수료율(유료)'],
    ['diningDiscount / roomDiscount / freeNight / spaBenefit', '핵심 혜택'],
    ['bestFor / scores', '추천 태그, 점수(가족다이닝/스테이케이션/비즈니스/사용편의/종합)'],
    ['estimatedSavings / notes / officialUrl', '예상 절약, 유의사항, 공식 사이트'],
  ]))
  c.push(H2('7.2 바우처(템플릿)'))
  c.push(table([2600, 6426], [
    ['필드', '설명'],
    ['templateId / category / title', '식별자, 카테고리, 제목'],
    ['description / note', '상세 설명, 현장 조건'],
    ['quantity / validUntil', '제공 수량, 유효기간'],
    ['hotels / city / transferable', '이용 가능 호텔, 도시, 양도 가능 여부'],
  ]))
  c.push(H2('7.3 주문 / 예약'))
  c.push(table([2600, 6426], [
    ['엔터티', '주요 필드'],
    ['주문(Order)', 'membershipId, 구매자정보, paidAmount, commissionRate/Amount, status, createdAt'],
    ['예약(Reservation)', 'membershipId, templateId, date, adults, children, childAges, hotel, note, status'],
  ]))

  c.push(H1('8. 비즈니스 규칙'))
  c.push(BUL('잔여 수량 = 제공 수량 − 사용완료 − 진행중 예약(홀드). 중복 예약 방지'))
  c.push(BUL('예약 사용완료 시 바우처 1매 소비(수량 상한 초과 불가)'))
  c.push(BUL('수수료 = 결제액 × 수수료율, 결제완료/활성화 주문만 정산 집계'))
  c.push(BUL('멤버십을 지갑에서 제거하면 해당 바우처 사용기록·예약 정리(주문은 이력 보존)'))
  c.push(BUL('유효기간 30일 이내 + 잔여 있음 → 만료 임박으로 홈 알림'))

  c.push(H1('9. 비기능 요구사항'))
  c.push(BUL('모바일 우선 반응형, 프리미엄 호텔/트래블 톤, 큰 탭 영역'))
  c.push(BUL('오프라인/스토리지 비활성 환경에서도 안전(try/catch 폴백)'))
  c.push(BUL('i18n 영어 폴백, 통화·날짜 로케일 포맷'))
  c.push(BUL('정적 사이트로 배포 가능(Vercel/Netlify/GitHub Pages)'))

  c.push(H1('10. 향후 확장'))
  c.push(BUL('백엔드 연동(주문/정산/인증), 실제 OAuth 토큰 검증'))
  c.push(BUL('바우처 양도(선물), 계정별 데이터 분리, 파트너/관리자 대시보드'))
  c.push(BUL('소아 나이 기반 정책 자동 안내(예: 만 12세 미만 조식 무료)'))

  return new Document({ styles, numbering, sections: [sectionWrap(c, '기능 명세서')] })
}

// =====================================================================
// DOC 2 — 기술 명세서 / 스펙설명서 (Technical Specification)
// =====================================================================
function buildTechSpec() {
  const c = []
  c.push(...titlePage('스펙 설명서', 'Technical Specification', ['버전 1.0', '작성일: 2026-06-07', 'github.com/bstars00-rgb/StayEasy']))
  c.push(new Paragraph({ children: [new TableOfContents('목차', { hyperlink: true, headingStyleRange: '1-2' })] }))
  c.push(new Paragraph({ children: [new PageBreak()] }))

  c.push(H1('1. 기술 스택'))
  c.push(table([3009, 6017], [
    ['영역', '기술'],
    ['프레임워크', 'React 18 + React Router 6'],
    ['빌드 도구', 'Vite 5'],
    ['스타일', 'Tailwind CSS 3'],
    ['상태/저장', 'React Context + localStorage'],
    ['테스트', 'Vitest(유닛) + Playwright(E2E)'],
    ['배포', 'GitHub Actions → GitHub Pages'],
    ['외부 의존성', '없음(아이콘 인라인 SVG). 선택: Google Identity Services'],
  ]))

  c.push(H1('2. 아키텍처 개요'))
  c.push(P('관심사 분리(layered) 구조로, UI는 데이터·상태 계층에만 의존한다. 백엔드 도입 시 data/storage/context만 교체하면 화면은 그대로 재사용된다.'))
  c.push(BUL('data: 중앙 mock 데이터(멤버십, 바우처 팩, 도시, 퀴즈, 연락처)'))
  c.push(BUL('i18n: 5개 언어 사전 + translate() 폴백/치환'))
  c.push(BUL('utils: localStorage 접근, 포맷(통화/날짜), 순수 로직(바우처 재고)'))
  c.push(BUL('context: AppContext(앱 상태)·AuthContext(인증) 단일 소스'))
  c.push(BUL('components / pages: 재사용 컴포넌트와 라우트 페이지'))

  c.push(H1('3. 디렉터리 구조'))
  c.push(table([3009, 6017], [
    ['경로', '내용'],
    ['src/data/', 'memberships.js, voucherPacks.js, cities.js, quiz.js, contact.js'],
    ['src/i18n/', 'translations.js, useTranslation.js, index.js'],
    ['src/utils/', 'storage.js, format.js, vouchers.js (+ *.test.js)'],
    ['src/context/', 'AppContext.jsx, AuthContext.jsx'],
    ['src/auth/', 'google.js (+ google.test.js)'],
    ['src/components/', 'AppHeader, BottomNavigation, Layout, MembershipCard, VoucherCard, VoucherDetailModal, BookingRequestModal, PurchaseModal, OrderCard, ReservationCard, SignInModal, AccountMenu, CTAButton, EmptyState, ScoreBadge, Icon, ui.jsx 등'],
    ['src/pages/', 'Home, Explore, MembershipDetail, Compare, MyBenefits, Quiz, RequestAssistance'],
    ['e2e/', 'purchase, booking, auth, voucher-detail 스펙'],
  ]))

  c.push(H1('4. 상태 관리'))
  c.push(H2('4.1 AppContext'))
  c.push(BUL('lang, city, savedIds(보유 멤버십), compareIds, usage(바우처 사용), reservations, orders, toast'))
  c.push(BUL('주요 액션: setLang/setCity, addSaved/removeSaved, toggleCompare, createReservation/setReservationStatus, createOrder/setOrderStatus, getVoucherStats, showToast'))
  c.push(H2('4.2 AuthContext'))
  c.push(BUL('user, isAuthed, openSignIn/completeSignIn/signOut'))
  c.push(BUL('requireAuth(fn): 미로그인 시 로그인 유도 후 원래 동작 재개(게이팅)'))

  c.push(H1('5. 데이터 모델 / 스토리지 스키마'))
  c.push(table([3400, 5626], [
    ['localStorage 키', '값'],
    ['stayeasy.lang / stayeasy.city', '선택 언어 / 도시'],
    ['stayeasy.savedMemberships', '보유 멤버십 id 배열'],
    ['stayeasy.compare', '비교 멤버십 id 배열(최대 3)'],
    ['stayeasy.voucherUsage', '{ "membershipId:templateId": 사용수 }'],
    ['stayeasy.reservations', '예약 객체 배열'],
    ['stayeasy.orders', '주문 객체 배열'],
    ['stayeasy.auth', '로그인 프로필 { id, provider, name, email, picture }'],
  ]))

  c.push(H1('6. i18n 시스템'))
  c.push(BUL('translations[lang][group][key] 구조, 그룹: common/nav/home/explore/detail/compare/scores/myBenefits/quiz/assistance/status/form/tags/voucher/voucherCat/reservation/wallet/order/purchase/auth/alerts/cities/countries'))
  c.push(BUL('translate(lang, "group.key", vars): 점경로 해석 → 영어 폴백 → 원본 키. {var} 치환'))
  c.push(BUL('useTranslation(): 활성 언어에 바인딩된 t(), 언어 목록 제공'))

  c.push(H1('7. 핵심 로직'))
  c.push(H2('7.1 가격·수수료 (data/memberships.js)'))
  c.push(BUL('getPricing(m): { listPrice, salePrice, paidAmount, commissionRate, commissionAmount }'))
  c.push(BUL('paidAmount = salePrice ?? annualFee, commissionAmount = round(paidAmount × rate)'))
  c.push(H2('7.2 바우처 재고 (utils/vouchers.js)'))
  c.push(BUL('voucherStats(quantity, used, held) → available = max(0, quantity − used − held)'))
  c.push(BUL('held = 진행중(요청/확정) 예약 수 → 중복 예약 방지'))
  c.push(H2('7.3 상태 머신'))
  c.push(BUL('주문: requested → invoiced → paid → activated(지갑 지급) / cancelled'))
  c.push(BUL('예약: requested → confirmed → completed(차감) / cancelled'))

  c.push(H1('8. 인증 (하이브리드 Google)'))
  c.push(BUL('VITE_GOOGLE_CLIENT_ID 미설정: 데모 로그인(로컬 프로필 생성) — 백엔드/외부 스크립트 불필요'))
  c.push(BUL('설정 시: Google Identity Services 버튼 렌더 + ID 토큰(JWT) 클라이언트 디코드'))
  c.push(BUL('보안 한계: 운영에서는 백엔드 토큰 검증 필요(현재 표시 목적의 디코드)'))
  c.push(BUL('게이팅: 저장/구매/예약 액션은 requireAuth로 감싸 로그인 후 재개'))

  c.push(H1('9. 라우팅'))
  c.push(BUL('BrowserRouter + basename=import.meta.env.BASE_URL (Pages 하위 경로 대응)'))
  c.push(BUL('SPA 폴백: 빌드 시 index.html → 404.html 복사'))

  c.push(H1('10. 테스트'))
  c.push(H2('10.1 유닛(Vitest) — 29개'))
  c.push(BUL('vouchers: 재고 계산·진행중 예약 카운트'))
  c.push(BUL('memberships: getPricing(커미션)·isPaid'))
  c.push(BUL('translate: 폴백·치환·미존재 키'))
  c.push(BUL('format: 통화·daysUntil'))
  c.push(BUL('auth/google: JWT(UTF-8) 디코드·데모유저·client id 판정'))
  c.push(H2('10.2 E2E(Playwright) — 4개'))
  c.push(BUL('purchase: 구매→활성화→지갑 지급→커미션 표시'))
  c.push(BUL('booking: 무료가입→예약(성인/소아 나이)→사용완료'))
  c.push(BUL('auth: 게스트 게이팅→데모 로그인→재개→세션 유지'))
  c.push(BUL('voucher-detail: 포함 혜택 탭→설명·약관 노출'))
  c.push(H2('10.3 CI'))
  c.push(BUL('배포 전 npm run test(유닛) 게이트 → 통과 시에만 Pages 배포'))

  c.push(H1('11. 빌드 · 실행 · 배포'))
  c.push(table([3009, 6017], [
    ['명령', '설명'],
    ['npm install', '의존성 설치'],
    ['npm run dev', '개발 서버(http://localhost:5173)'],
    ['npm run build', '프로덕션 빌드(dist/)'],
    ['npm run test', '유닛 테스트'],
    ['npm run e2e', 'E2E (최초 1회 npx playwright install chromium)'],
  ]))
  c.push(P('배포: main 푸시 → GitHub Actions(test → build → Pages). 실제 구글 로그인 시 VITE_GOOGLE_CLIENT_ID 환경변수로 빌드.'))

  c.push(H1('12. 확장 가이드'))
  c.push(BUL('데이터: src/data/* 정적 export를 동일 형태의 fetch로 교체'))
  c.push(BUL('영속화: src/utils/storage.js만 API 호출로 교체(화면 변경 없음)'))
  c.push(BUL('인증: 백엔드 토큰 검증·세션 추가, src/auth/google.js 확장'))
  c.push(BUL('판매/수수료: src/data/memberships.js의 sales 맵에서 한 곳 관리'))

  return new Document({ styles, numbering, sections: [sectionWrap(c, '스펙 설명서')] })
}

async function main() {
  const f = await Packer.toBuffer(buildFunctionalSpec())
  fs.writeFileSync(path.join(OUT, 'StayEasy_기능명세서.docx'), f)
  const t = await Packer.toBuffer(buildTechSpec())
  fs.writeFileSync(path.join(OUT, 'StayEasy_스펙설명서.docx'), t)
  console.log('Created: StayEasy_기능명세서.docx, StayEasy_스펙설명서.docx')
}
main()
