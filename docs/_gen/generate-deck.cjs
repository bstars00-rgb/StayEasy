/* Generates StayEasy 사업계획서 (Business Plan) as .pptx */
const path = require('path')
const pptxgen = require('pptxgenjs')

const OUT = path.join(__dirname, '..', 'StayEasy_사업계획서.pptx')
const FONT = 'Malgun Gothic'

// Palette (teal — matches the app brand)
const DARK = '0B3B40'
const DARK2 = '12545B'
const TEAL = '13838A'
const TEAL2 = '1EA4A8'
const MINT = '3FC1C2'
const LIGHT = 'F2FAFA'
const CARD = 'FFFFFF'
const INK = '15323A'
const MUTE = '6A8A90'
const WHITE = 'FFFFFF'
const GOLD = 'E0A33A'

const W = 13.33
const H = 7.5
const MX = 0.7

const pres = new pptxgen()
pres.defineLayout({ name: 'WIDE', width: W, height: H })
pres.layout = 'WIDE'
pres.author = 'StayEasy'
pres.title = 'StayEasy 사업계획서'

const shadow = () => ({ type: 'outer', color: '0B3B40', blur: 8, offset: 3, angle: 135, opacity: 0.12 })

// page number + brand footer on light slides
function footer(slide, n) {
  slide.addText('StayEasy · 사업계획서', { x: MX, y: H - 0.5, w: 6, h: 0.3, fontFace: FONT, fontSize: 9, color: MUTE })
  slide.addText(String(n), { x: W - 1.1, y: H - 0.5, w: 0.5, h: 0.3, fontFace: FONT, fontSize: 9, color: MUTE, align: 'right' })
}

// section header (light slides): teal chip number + title
function header(slide, num, title, kicker) {
  slide.addShape(pres.shapes.OVAL, { x: MX, y: 0.62, w: 0.5, h: 0.5, fill: { color: TEAL } })
  slide.addText(num, { x: MX, y: 0.62, w: 0.5, h: 0.5, align: 'center', valign: 'middle', fontFace: FONT, fontSize: 16, bold: true, color: WHITE })
  if (kicker) slide.addText(kicker, { x: MX + 0.7, y: 0.6, w: 10, h: 0.3, fontFace: FONT, fontSize: 11, bold: true, color: TEAL, charSpacing: 2 })
  slide.addText(title, { x: MX + 0.7, y: kicker ? 0.88 : 0.7, w: 11.4, h: 0.7, fontFace: FONT, fontSize: 30, bold: true, color: INK, margin: 0 })
}

function card(slide, x, y, w, h, fill = CARD) {
  slide.addShape(pres.shapes.ROUNDED_RECTANGLE, { x, y, w, h, fill: { color: fill }, rectRadius: 0.08, shadow: shadow() })
}

// ---------------- Slide 1: Title ----------------
{
  const s = pres.addSlide()
  s.background = { color: DARK }
  s.addShape(pres.shapes.OVAL, { x: 10.6, y: -1.6, w: 4.8, h: 4.8, fill: { color: DARK2 } })
  s.addShape(pres.shapes.OVAL, { x: 12.3, y: 0.4, w: 1.4, h: 1.4, fill: { color: TEAL } })
  s.addText([{ text: 'Stay', options: { color: WHITE } }, { text: 'Easy', options: { color: MINT } }],
    { x: MX, y: 2.2, w: 9, h: 1.1, fontFace: FONT, fontSize: 60, bold: true })
  s.addText('호텔 멤버십 혜택, 더 쉽게', { x: MX, y: 3.35, w: 10, h: 0.6, fontFace: FONT, fontSize: 22, color: 'CFEAEA' })
  s.addText('발견 · 비교 · 보관 · 예약을 한 곳에서. 멤버십 중개로 수익을 만드는 모바일 우선 플랫폼.',
    { x: MX, y: 3.95, w: 10.5, h: 0.6, fontFace: FONT, fontSize: 14, color: '9CC4C6' })
  s.addText('사업계획서 (Business Plan)', { x: MX, y: 5.0, w: 8, h: 0.4, fontFace: FONT, fontSize: 13, bold: true, color: MINT, charSpacing: 2 })
  s.addShape(pres.shapes.LINE, { x: MX, y: 5.5, w: 3.2, h: 0, line: { color: TEAL2, width: 2 } })
  s.addText('2026-06-07   ·   github.com/bstars00-rgb/StayEasy   ·   bstars00-rgb.github.io/StayEasy',
    { x: MX, y: 6.55, w: 12, h: 0.4, fontFace: FONT, fontSize: 11, color: '8FB6B8' })
}

// ---------------- Slide 2: Problem ----------------
{
  const s = pres.addSlide()
  s.background = { color: LIGHT }
  header(s, '1', '고객은 멤버십 혜택을 잘 못 쓴다', 'PROBLEM')
  const items = [
    ['브랜드마다 앱이 따로', '메리어트·아코르·힐튼… 혜택과 바우처가 여러 앱에 흩어져 한눈에 안 보인다.'],
    ['예약은 전화·이메일로만', '바우처가 있어도 앱에서 바로 예약이 안 돼, 매번 전화·메일로 따로 요청해야 한다.'],
    ['만료를 놓친다', '유효기간·잔여 수량을 추적하기 어려워 쓰지 못하고 소멸되는 혜택이 많다.'],
    ['현장 추가요금 혼선', '무료 석식인데 와인은 별도 등 조건이 제각각이라 사용 시 혼란이 크다.'],
  ]
  const cw = 5.75, ch = 2.15, gx = 0.5, gy = 0.4
  items.forEach((it, i) => {
    const x = MX + (i % 2) * (cw + gx)
    const y = 2.0 + Math.floor(i / 2) * (ch + gy)
    card(s, x, y, cw, ch)
    s.addShape(pres.shapes.RECTANGLE, { x, y, w: 0.09, h: ch, fill: { color: TEAL } })
    s.addText(it[0], { x: x + 0.35, y: y + 0.3, w: cw - 0.6, h: 0.5, fontFace: FONT, fontSize: 18, bold: true, color: INK })
    s.addText(it[1], { x: x + 0.35, y: y + 0.85, w: cw - 0.6, h: 1.1, fontFace: FONT, fontSize: 13, color: '47666C', valign: 'top' })
  })
  footer(s, 2)
}

// ---------------- Slide 3: Solution ----------------
{
  const s = pres.addSlide()
  s.background = { color: LIGHT }
  header(s, '2', '흩어진 멤버십을 하나로, 예약까지 대행', 'SOLUTION')
  const items = [
    ['통합', '여러 브랜드 멤버십을 한 앱에서 발견·비교·관리'],
    ['바우처 지갑', '내 혜택을 카테고리별로 보관 — 잔여·유효기간 추적'],
    ['예약 대행', '앱에서 요청하면 StayEasy가 호텔과 예약을 조율'],
    ['스마트 알림', '만료 임박·진행 중 예약을 자동으로 알려줌'],
  ]
  const cw = 2.83, ch = 3.0, g = 0.18
  items.forEach((it, i) => {
    const x = MX + i * (cw + g)
    const y = 2.2
    card(s, x, y, cw, ch)
    s.addShape(pres.shapes.OVAL, { x: x + cw / 2 - 0.45, y: y + 0.45, w: 0.9, h: 0.9, fill: { color: i % 2 ? MINT : TEAL } })
    s.addText(String(i + 1), { x: x + cw / 2 - 0.45, y: y + 0.45, w: 0.9, h: 0.9, align: 'center', valign: 'middle', fontFace: FONT, fontSize: 26, bold: true, color: WHITE })
    s.addText(it[0], { x: x + 0.2, y: y + 1.55, w: cw - 0.4, h: 0.5, align: 'center', fontFace: FONT, fontSize: 18, bold: true, color: INK })
    s.addText(it[1], { x: x + 0.25, y: y + 2.05, w: cw - 0.5, h: 0.85, align: 'center', valign: 'top', fontFace: FONT, fontSize: 12, color: '47666C' })
  })
  s.addText('“브랜드 앱은 \'무엇을 가졌는지\'만 보여준다. StayEasy는 그것을 \'쓰게\' 만든다.”',
    { x: MX, y: 5.6, w: 12, h: 0.5, align: 'center', italic: true, fontFace: FONT, fontSize: 15, color: TEAL })
  footer(s, 3)
}

// ---------------- Slide 4: Product ----------------
{
  const s = pres.addSlide()
  s.background = { color: LIGHT }
  header(s, '3', '핵심 기능', 'PRODUCT')
  const feats = [
    ['도시 기반 탐색', '도시·혜택유형으로 멤버십 발견'],
    ['멤버십 비교', '최대 3개 나란히 비교'],
    ['바우처 지갑', '카테고리별 잔여·유효기간 관리'],
    ['예약 요청', '성인/소아·나이까지 입력해 요청'],
    ['구매 + 수수료', '브랜드 결제 연계, 수수료 정산'],
    ['추천 퀴즈', '5문항으로 맞춤 추천'],
    ['간편 로그인', 'Google 한 번으로 가입(게스트 허용)'],
    ['5개 언어', '한·영·베트남·중·일'],
  ]
  const cw = 2.83, ch = 1.7, gx = 0.18, gy = 0.25
  feats.forEach((f, i) => {
    const x = MX + (i % 4) * (cw + gx)
    const y = 2.0 + Math.floor(i / 4) * (ch + gy)
    card(s, x, y, cw, ch)
    s.addShape(pres.shapes.OVAL, { x: x + 0.25, y: y + 0.28, w: 0.34, h: 0.34, fill: { color: TEAL2 } })
    s.addText(f[0], { x: x + 0.72, y: y + 0.22, w: cw - 0.85, h: 0.5, fontFace: FONT, fontSize: 13.5, bold: true, color: INK, valign: 'middle' })
    s.addText(f[1], { x: x + 0.25, y: y + 0.78, w: cw - 0.45, h: 0.8, fontFace: FONT, fontSize: 11, color: '47666C', valign: 'top' })
  })
  footer(s, 4)
}

// ---------------- Slide 5: How it works ----------------
{
  const s = pres.addSlide()
  s.background = { color: LIGHT }
  header(s, '4', '작동 방식', 'HOW IT WORKS')
  const steps = [
    ['발견', '도시·혜택으로 탐색하고 비교'],
    ['구매', '구매 신청 → 브랜드 인보이스 → 결제'],
    ['지갑 지급', '바우처가 디지털 지갑에 등록'],
    ['예약·사용', '앱에서 예약 요청 → 사용 시 잔여 차감'],
  ]
  const cw = 2.7, ch = 2.6, g = 0.45
  steps.forEach((st, i) => {
    const x = MX + i * (cw + g)
    const y = 2.5
    card(s, x, y, cw, ch)
    s.addText('STEP ' + (i + 1), { x: x + 0.3, y: y + 0.3, w: cw - 0.6, h: 0.3, fontFace: FONT, fontSize: 10, bold: true, color: TEAL, charSpacing: 2 })
    s.addText(st[0], { x: x + 0.3, y: y + 0.65, w: cw - 0.6, h: 0.6, fontFace: FONT, fontSize: 22, bold: true, color: INK })
    s.addText(st[1], { x: x + 0.3, y: y + 1.35, w: cw - 0.6, h: 1.1, fontFace: FONT, fontSize: 12.5, color: '47666C', valign: 'top' })
    if (i < steps.length - 1)
      s.addText('→', { x: x + cw + 0.02, y: y + ch / 2 - 0.3, w: g, h: 0.6, align: 'center', valign: 'middle', fontFace: FONT, fontSize: 24, bold: true, color: MINT })
  })
  footer(s, 5)
}

// ---------------- Slide 6: Market ----------------
{
  const s = pres.addSlide()
  s.background = { color: LIGHT }
  header(s, '5', '시장: 베트남에서 시작, 아시아로 확장', 'MARKET')
  // left: stat callouts
  const stats = [
    ['3', '핵심 도시', '호치민 · 다낭 · 하노이'],
    ['6', '서비스 도시', '+ 서울 · 방콕 · 도쿄'],
    ['8', '초기 멤버십', '메리어트·아코르·힐튼 등'],
  ]
  stats.forEach((st, i) => {
    const y = 2.1 + i * 1.55
    card(s, MX, y, 5.4, 1.35)
    s.addText(st[0], { x: MX + 0.25, y: y + 0.2, w: 1.4, h: 0.95, fontFace: FONT, fontSize: 44, bold: true, color: TEAL, align: 'center', valign: 'middle' })
    s.addText(st[1], { x: MX + 1.8, y: y + 0.28, w: 3.4, h: 0.45, fontFace: FONT, fontSize: 17, bold: true, color: INK })
    s.addText(st[2], { x: MX + 1.8, y: y + 0.73, w: 3.4, h: 0.4, fontFace: FONT, fontSize: 12, color: MUTE })
  })
  // right: rationale card (dark)
  const rx = 6.6, rw = 6.0
  s.addShape(pres.shapes.ROUNDED_RECTANGLE, { x: rx, y: 2.1, w: rw, h: 4.35, fill: { color: DARK }, rectRadius: 0.08, shadow: shadow() })
  s.addText('왜 베트남인가', { x: rx + 0.4, y: 2.4, w: rw - 0.8, h: 0.45, fontFace: FONT, fontSize: 18, bold: true, color: MINT })
  const pts = [
    '관광·비즈니스 수요 급성장, 국제 호텔 브랜드 집중 진출',
    '멤버십·다이닝 클럽 판매가 활발하나 관리·예약 경험은 분절적',
    '한국·일본·중화권 인바운드 다수 → 다국어 앱 적합',
    '브랜드 영업과 연계한 중개 수수료 모델 실현 용이',
  ]
  s.addText(pts.map((t, i) => ({ text: t, options: { bullet: { code: '2022', indent: 14 }, breakLine: true, paraSpaceAfter: 10 } })),
    { x: rx + 0.4, y: 2.95, w: rw - 0.8, h: 3.2, fontFace: FONT, fontSize: 13.5, color: 'D5EAEA', valign: 'top' })
  s.addText('* 도시/멤버십 수는 MVP 기준, 확장 계획 포함.', { x: 6.6, y: 6.55, w: 6, h: 0.3, fontFace: FONT, fontSize: 9, color: MUTE })
  footer(s, 6)
}

// ---------------- Slide 7: Business Model ----------------
{
  const s = pres.addSlide()
  s.background = { color: LIGHT }
  header(s, '6', '비즈니스 모델: 멤버십 중개 수수료', 'BUSINESS MODEL')
  // flow: 고객 -> StayEasy -> 브랜드
  const boxes = [['고객', '멤버십 구매 신청'], ['StayEasy', '구매·예약 중개'], ['호텔 브랜드', '인보이스 발행·결제 수취']]
  const bw = 3.2, bh = 1.5, g = 1.0
  const startX = (W - (bw * 3 + g * 2)) / 2
  boxes.forEach((b, i) => {
    const x = startX + i * (bw + g)
    const y = 2.2
    const fill = i === 1 ? TEAL : CARD
    s.addShape(pres.shapes.ROUNDED_RECTANGLE, { x, y, w: bw, h: bh, fill: { color: fill }, rectRadius: 0.08, shadow: shadow() })
    s.addText(b[0], { x, y: y + 0.32, w: bw, h: 0.5, align: 'center', fontFace: FONT, fontSize: 20, bold: true, color: i === 1 ? WHITE : INK })
    s.addText(b[1], { x, y: y + 0.85, w: bw, h: 0.5, align: 'center', fontFace: FONT, fontSize: 12.5, color: i === 1 ? 'E2F4F4' : MUTE })
    if (i < 2) s.addText('→', { x: x + bw, y: y + bh / 2 - 0.3, w: g, h: 0.6, align: 'center', valign: 'middle', fontFace: FONT, fontSize: 28, bold: true, color: MINT })
  })
  s.addText('결제는 호텔 브랜드가 수취 · StayEasy는 결제액의 일정 %를 수수료로 수취',
    { x: MX, y: 4.0, w: 12, h: 0.4, align: 'center', fontFace: FONT, fontSize: 14, bold: true, color: INK })
  // example calc + revenue streams
  card(s, MX, 4.6, 5.9, 2.0)
  s.addText('예시 계산', { x: MX + 0.35, y: 4.8, w: 5, h: 0.4, fontFace: FONT, fontSize: 14, bold: true, color: TEAL })
  s.addText([
    { text: '결제액 ₫4,200,000', options: { breakLine: true, paraSpaceAfter: 6 } },
    { text: '× 수수료율 12%', options: { breakLine: true, paraSpaceAfter: 6 } },
    { text: '= 건당 수수료 ₫504,000', options: { bold: true, color: TEAL } },
  ], { x: MX + 0.35, y: 5.25, w: 5.2, h: 1.2, fontFace: FONT, fontSize: 15, color: INK, valign: 'top' })
  card(s, 6.8, 4.6, 5.8, 2.0)
  s.addText('수익원', { x: 7.15, y: 4.8, w: 5, h: 0.4, fontFace: FONT, fontSize: 14, bold: true, color: TEAL })
  s.addText([
    { text: '판매 중개 수수료 (현재)', options: { bullet: { code: '2022', indent: 14 }, breakLine: true, paraSpaceAfter: 6 } },
    { text: '예약 대행·프리미엄 (확장)', options: { bullet: { code: '2022', indent: 14 }, breakLine: true, paraSpaceAfter: 6 } },
    { text: '브랜드 광고·제휴 (확장)', options: { bullet: { code: '2022', indent: 14 } } },
  ], { x: 7.15, y: 5.25, w: 5.2, h: 1.2, fontFace: FONT, fontSize: 13.5, color: INK, valign: 'top' })
  footer(s, 7)
}

// ---------------- Slide 8: Revenue simulation ----------------
{
  const s = pres.addSlide()
  s.background = { color: LIGHT }
  header(s, '7', '수익 시뮬레이션 (예시 가정)', 'PROJECTION')
  s.addChart(pres.charts.BAR, [{
    name: '연간 수수료(백만 VND)',
    labels: ['1년차', '2년차', '3년차'],
    values: [600, 2160, 6480],
  }], {
    x: MX, y: 2.0, w: 7.2, h: 4.6, barDir: 'col',
    chartColors: [TEAL],
    chartArea: { fill: { color: 'FFFFFF' } },
    catAxisLabelColor: '64748B', valAxisLabelColor: '64748B', catAxisLabelFontFace: FONT, valAxisLabelFontFace: FONT,
    valGridLine: { color: 'E2E8F0', size: 0.5 }, catGridLine: { style: 'none' },
    showValue: true, dataLabelPosition: 'outEnd', dataLabelColor: '1E293B', dataLabelFontFace: FONT, dataLabelFontSize: 11,
    showLegend: false, showTitle: false,
  })
  // assumptions card
  card(s, 8.3, 2.0, 4.3, 4.6, DARK)
  s.addText('주요 가정', { x: 8.65, y: 2.3, w: 3.7, h: 0.4, fontFace: FONT, fontSize: 16, bold: true, color: MINT })
  s.addText([
    { text: '유료 결제 회원 1년차 1,000명', options: { bullet: { code: '2022', indent: 14 }, breakLine: true, paraSpaceAfter: 9 } },
    { text: '평균 결제액 ₫5,000,000', options: { bullet: { code: '2022', indent: 14 }, breakLine: true, paraSpaceAfter: 9 } },
    { text: '평균 수수료율 12%', options: { bullet: { code: '2022', indent: 14 }, breakLine: true, paraSpaceAfter: 9 } },
    { text: '회원 수 연 +3.6배 가정', options: { bullet: { code: '2022', indent: 14 }, breakLine: true, paraSpaceAfter: 9 } },
    { text: '예약 대행 등 부가수익 제외', options: { bullet: { code: '2022', indent: 14 } } },
  ], { x: 8.65, y: 2.85, w: 3.7, h: 3.4, fontFace: FONT, fontSize: 12.5, color: 'D5EAEA', valign: 'top' })
  s.addText('* 본 수치는 설명용 예시 가정이며 실제 실적·전망이 아님.', { x: MX, y: 6.68, w: 9, h: 0.28, fontFace: FONT, fontSize: 9, color: MUTE })
  footer(s, 8)
}

// ---------------- Slide 9: Competitive ----------------
{
  const s = pres.addSlide()
  s.background = { color: LIGHT }
  header(s, '8', '차별점', 'WHY STAYEASY')
  const rows = [
    [{ text: '항목', options: { bold: true, color: WHITE, fill: { color: TEAL }, align: 'left' } },
     { text: '브랜드 자체 앱', options: { bold: true, color: WHITE, fill: { color: TEAL }, align: 'center' } },
     { text: '일반 OTA', options: { bold: true, color: WHITE, fill: { color: TEAL }, align: 'center' } },
     { text: 'StayEasy', options: { bold: true, color: WHITE, fill: { color: DARK }, align: 'center' } }],
  ]
  const data = [
    ['멀티브랜드 통합', '—', '부분', 'O'],
    ['바우처 잔여·만료 관리', 'O', '—', 'O'],
    ['인앱 예약 대행', '—', '부분', 'O'],
    ['만료·예약 알림', '부분', '—', 'O'],
    ['다국어(5개)', '부분', 'O', 'O'],
    ['중개 수수료 BM', '—', 'O', 'O'],
  ]
  data.forEach((r) => {
    rows.push([
      { text: r[0], options: { align: 'left', color: INK } },
      { text: r[1], options: { align: 'center', color: r[1] === 'O' ? TEAL : MUTE, bold: r[1] === 'O' } },
      { text: r[2], options: { align: 'center', color: r[2] === 'O' ? TEAL : MUTE, bold: r[2] === 'O' } },
      { text: r[3], options: { align: 'center', color: TEAL, bold: true, fill: { color: 'E8F6F6' } } },
    ])
  })
  s.addTable(rows, {
    x: MX, y: 2.1, w: 12.0, colW: [4.5, 2.5, 2.5, 2.5],
    rowH: 0.6, fontFace: FONT, fontSize: 14, valign: 'middle',
    border: { type: 'solid', pt: 1, color: 'D8E6E6' }, margin: [4, 8, 4, 8],
  })
  footer(s, 9)
}

// ---------------- Slide 10: Traction / Status ----------------
{
  const s = pres.addSlide()
  s.background = { color: LIGHT }
  header(s, '9', '진행 현황: 작동하는 MVP 완성', 'STATUS')
  const stats = [['8', '멤버십'], ['30', '바우처'], ['5', '언어'], ['33', '자동화 테스트']]
  const cw = 2.83, g = 0.18
  stats.forEach((st, i) => {
    const x = MX + i * (cw + g)
    card(s, x, 2.0, cw, 1.7)
    s.addText(st[0], { x, y: 2.15, w: cw, h: 0.9, align: 'center', fontFace: FONT, fontSize: 40, bold: true, color: TEAL })
    s.addText(st[1], { x, y: 3.05, w: cw, h: 0.4, align: 'center', fontFace: FONT, fontSize: 13, color: MUTE })
  })
  card(s, MX, 4.0, 12.0, 2.4, DARK)
  s.addText('이미 구현된 것', { x: MX + 0.4, y: 4.25, w: 11, h: 0.4, fontFace: FONT, fontSize: 16, bold: true, color: MINT })
  const done = [
    '발견·비교·상세·바우처 지갑·예약 요청(성인/소아·나이)',
    '구매 플로우 + 수수료 정산 + 바우처 상세 설명',
    'Google 간편 로그인(하이브리드) + 게스트 게이팅',
    '유닛 29 + E2E 4 통과, CI 게이트, GitHub Pages 자동 배포',
  ]
  s.addText(done.map((t) => ({ text: t, options: { bullet: { code: '2022', indent: 14 }, breakLine: true, paraSpaceAfter: 7 } })),
    { x: MX + 0.4, y: 4.7, w: 11.2, h: 1.6, fontFace: FONT, fontSize: 13.5, color: 'D5EAEA', valign: 'top' })
  footer(s, 10)
}

// ---------------- Slide 11: Roadmap ----------------
{
  const s = pres.addSlide()
  s.background = { color: LIGHT }
  header(s, '10', '로드맵', 'ROADMAP')
  const phases = [
    ['지금', 'MVP', '프론트엔드 전체 기능·테스트·배포 완료'],
    ['다음', '백엔드·결제 연동', '주문/정산 API, 실 OAuth 검증, 브랜드 연동'],
    ['확장', '양도·계정·파트너', '바우처 선물, 계정별 데이터, 파트너 대시보드'],
    ['성장', '지역 확장', '도시·브랜드 확대, 부가 수익원'],
  ]
  const y = 3.0
  s.addShape(pres.shapes.LINE, { x: MX + 0.2, y: y + 0.0, w: 12.0, h: 0, line: { color: MINT, width: 2 } })
  const cw = 2.9, g = 0.13
  phases.forEach((p, i) => {
    const x = MX + i * (cw + g)
    s.addShape(pres.shapes.OVAL, { x: x + cw / 2 - 0.16, y: y - 0.16, w: 0.32, h: 0.32, fill: { color: i === 0 ? TEAL : WHITE }, line: { color: TEAL, width: 2 } })
    card(s, x, y + 0.5, cw, 2.4)
    s.addText(p[0], { x, y: y + 0.7, w: cw, h: 0.35, align: 'center', fontFace: FONT, fontSize: 11, bold: true, color: TEAL, charSpacing: 2 })
    s.addText(p[1], { x: x + 0.2, y: y + 1.05, w: cw - 0.4, h: 0.6, align: 'center', fontFace: FONT, fontSize: 16, bold: true, color: INK })
    s.addText(p[2], { x: x + 0.25, y: y + 1.65, w: cw - 0.5, h: 1.1, align: 'center', valign: 'top', fontFace: FONT, fontSize: 11.5, color: '47666C' })
  })
  footer(s, 11)
}

// ---------------- Slide 12: Closing / Ask ----------------
{
  const s = pres.addSlide()
  s.background = { color: DARK }
  s.addShape(pres.shapes.OVAL, { x: -1.3, y: 4.8, w: 4.2, h: 4.2, fill: { color: DARK2 } })
  s.addText('함께 만들 파트너를 찾습니다', { x: MX, y: 1.7, w: 11.5, h: 0.9, fontFace: FONT, fontSize: 34, bold: true, color: WHITE })
  s.addText('호텔 브랜드 제휴 · 파일럿 운영 · 초기 투자', { x: MX, y: 2.7, w: 11.5, h: 0.5, fontFace: FONT, fontSize: 18, color: MINT })
  const asks = [
    ['브랜드 제휴', '멤버십 판매·정산 연동 파트너'],
    ['파일럿', '호치민/다낭/하노이 현장 검증'],
    ['투자', '백엔드·운영·마케팅 가속'],
  ]
  const cw = 3.7, g = 0.3
  const startX = (W - (cw * 3 + g * 2)) / 2
  asks.forEach((a, i) => {
    const x = startX + i * (cw + g)
    const y = 3.7
    s.addShape(pres.shapes.ROUNDED_RECTANGLE, { x, y, w: cw, h: 1.7, fill: { color: DARK2 }, rectRadius: 0.08 })
    s.addText(a[0], { x, y: y + 0.3, w: cw, h: 0.5, align: 'center', fontFace: FONT, fontSize: 18, bold: true, color: MINT })
    s.addText(a[1], { x: x + 0.25, y: y + 0.85, w: cw - 0.5, h: 0.7, align: 'center', valign: 'top', fontFace: FONT, fontSize: 12.5, color: 'CFE6E6' })
  })
  s.addText([
    { text: 'Live  ', options: { color: MINT, bold: true } },
    { text: 'bstars00-rgb.github.io/StayEasy', options: { color: 'CFE6E6' } },
    { text: '     Code  ', options: { color: MINT, bold: true } },
    { text: 'github.com/bstars00-rgb/StayEasy', options: { color: 'CFE6E6' } },
  ], { x: MX, y: 6.3, w: 12, h: 0.5, align: 'center', fontFace: FONT, fontSize: 13 })
}

pres.writeFile({ fileName: OUT }).then(() => console.log('Created:', OUT))
