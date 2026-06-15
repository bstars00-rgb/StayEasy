// Localized membership copy (benefits + notes) for ko, vi, zh, ja.
//
// English is the source of truth (src/data/memberships.js) and the per-field
// fallback. Keyed by membership id. Each `benefits` array MUST keep the same
// length and order as the English one; a length mismatch falls back to English
// for that membership's benefits (so the UI never shows a partial list).
//
// Use localizeMembership(membership, lang) to merge localized benefits/notes.

export const membershipI18n = {
  'club-marriott-vietnam': {
    ko: { benefits: ['최대 4인까지 식음료 50% 할인', '베스트 어베일러블 객실 요금 최대 20% 할인', '스파 트리트먼트 20% 할인', '생일 다이닝 혜택'], notes: '베트남에서 호텔 다이닝이 잦은 분께 가장 강력한 선택 — 인원이 많을수록 식음료 할인 효과가 커집니다.' },
    vi: { benefits: ['Giảm đến 50% ẩm thực cho tối đa 4 khách', 'Giảm đến 20% giá phòng tốt nhất hiện có', 'Giảm 20% liệu trình spa', 'Ưu đãi ẩm thực sinh nhật'], notes: 'Lựa chọn mạnh nhất cho người thường xuyên ăn uống tại khách sạn ở Việt Nam; mức giảm tăng theo số khách.' },
    zh: { benefits: ['餐饮最高五折，最多4人', '最优房价最高减20%', '水疗护理八折', '生日餐饮礼遇'], notes: '在越南经常在酒店用餐的最佳之选；用餐人数越多，餐饮折扣越划算。' },
    ja: { benefits: ['最大4名様まで飲食50%オフ', 'ベストアベイラブルレート最大20%オフ', 'スパトリートメント20%オフ', '誕生日ダイニング特典'], notes: 'ベトナムでホテルダイニングが多い方に最適。人数が増えるほど割引メリットが拡大します。' },
  },
  'accor-plus-vietnam': {
    ko: { benefits: ['매년 무료 숙박 1박 제공', '회원 및 동반객 다이닝 최대 50% 할인', '회원 전용 객실 요금', '엘리트 등급 빠른 달성'], notes: '연 1회 무료 숙박만으로도 연회비 대부분을 상쇄할 수 있습니다.' },
    vi: { benefits: ['Một đêm nghỉ miễn phí mỗi năm', 'Giảm đến 50% ẩm thực cho hội viên và khách đi cùng', 'Giá phòng dành riêng cho hội viên', 'Lên hạng elite nhanh hơn'], notes: 'Bao gồm một đêm nghỉ miễn phí có thể bù lại phần lớn phí thường niên.' },
    zh: { benefits: ['每年赠送一晚免费住宿', '会员及同行宾客餐饮最高五折', '会员专属房价', '更快升级精英会籍'], notes: '每年一晚免费住宿即可抵消大部分年费。' },
    ja: { benefits: ['毎年1泊の無料宿泊', '会員と同伴者のダイニング最大50%オフ', '会員限定の客室料金', 'エリート会員資格を早く達成'], notes: '年1泊の無料宿泊だけで年会費の大部分を相殺できます。' },
  },
  'hilton-honors-vietnam': {
    ko: { benefits: ['무료 가입', '숙박 및 다이닝 포인트 적립', '회원 전용 객실 요금', '무료 Wi-Fi 및 디지털 체크인'], notes: '무료 로열티 프로그램 — 고정 할인보다 포인트 사용에서 가치가 나옵니다.' },
    vi: { benefits: ['Miễn phí tham gia', 'Tích điểm khi lưu trú và ăn uống', 'Giá phòng dành riêng cho hội viên', 'Wi-Fi miễn phí và nhận phòng kỹ thuật số'], notes: 'Chương trình khách hàng thân thiết miễn phí; giá trị đến từ việc đổi điểm hơn là giảm giá cố định.' },
    zh: { benefits: ['免费加入', '住宿与餐饮均可积分', '会员专属房价', '免费 Wi-Fi 及数字入住'], notes: '免费会员计划；价值来自积分兑换，而非固定折扣。' },
    ja: { benefits: ['無料で入会', '宿泊とダイニングでポイント獲得', '会員限定の客室料金', '無料Wi-Fiとデジタルチェックイン'], notes: '無料のロイヤルティプログラム。固定割引よりポイント交換で価値が生まれます。' },
  },
  'ihg-one-rewards-vietnam': {
    ko: { benefits: ['무료 가입', '4박째 리워드 숙박 무료', '일부 호텔 다이닝 최대 20% 할인', '마일스톤 리워드'], notes: '균형 잡힌 올라운더 — 긴 리워드 숙박일수록 4박째 무료 혜택이 쌓입니다.' },
    vi: { benefits: ['Miễn phí tham gia', 'Đêm thưởng thứ tư miễn phí', 'Giảm đến 20% ẩm thực tại các khách sạn chọn lọc', 'Phần thưởng cột mốc'], notes: 'Lựa chọn cân bằng; đêm thứ tư miễn phí càng có lợi với kỳ nghỉ thưởng dài.' },
    zh: { benefits: ['免费加入', '第四晚奖励住宿免费', '指定酒店餐饮最高减20%', '里程碑奖励'], notes: '均衡的全能之选；奖励住宿越长，第四晚免费越划算。' },
    ja: { benefits: ['無料で入会', '4泊目のリワード宿泊が無料', '対象ホテルのダイニング最大20%オフ', 'マイルストーン特典'], notes: 'バランスの取れたオールラウンダー。長いリワード宿泊ほど4泊目無料が効いてきます。' },
  },
  'shangri-la-circle': {
    ko: { benefits: ['무료 가입', '객실 또는 다이닝에 쓰는 유연한 포인트', '상위 등급 객실 업그레이드', '스파 및 다이닝 특전'], notes: '포인트를 객실과 다이닝에 자유롭게 쓸 수 있어 다양한 여행 유형에 잘 맞습니다.' },
    vi: { benefits: ['Miễn phí tham gia', 'Điểm linh hoạt dùng cho phòng hoặc ẩm thực', 'Nâng hạng phòng cho hạng cao hơn', 'Ưu đãi spa và ẩm thực'], notes: 'Điểm dùng linh hoạt cho phòng và ẩm thực, phù hợp với nhiều kiểu chuyến đi.' },
    zh: { benefits: ['免费加入', '积分灵活用于客房或餐饮', '高等级会员客房升级', '水疗与餐饮礼遇'], notes: '积分可灵活用于客房与餐饮，适合多种出行类型。' },
    ja: { benefits: ['無料で入会', '客室にもダイニングにも使える柔軟なポイント', '上位ランクの客室アップグレード', 'スパ・ダイニング特典'], notes: 'ポイントを客室とダイニングに柔軟に使え、さまざまな旅のスタイルに合います。' },
  },
  'hotel-nikko-saigon-dining-club': {
    ko: { benefits: ['레스토랑 및 뷔페 최대 25% 할인', '생일 케이크 및 디저트', '도착 시 웰컴 드링크', '회원 전용 다이닝 이벤트'], notes: '단일 호텔 다이닝 클럽 — 호텔 닛코 사이공에서 자주 식사하는 분께 최적입니다.' },
    vi: { benefits: ['Giảm đến 25% nhà hàng và buffet', 'Bánh sinh nhật và quà ngọt', 'Đồ uống chào mừng khi đến', 'Sự kiện ẩm thực dành riêng cho hội viên'], notes: 'Câu lạc bộ ẩm thực một khách sạn; tốt nhất nếu bạn thường dùng bữa tại Hotel Nikko Saigon.' },
    zh: { benefits: ['餐厅及自助餐最高减25%', '生日蛋糕与甜点', '抵店欢迎饮品', '会员专属餐饮活动'], notes: '单一酒店餐饮俱乐部；若常在西贡日航酒店用餐则最为合适。' },
    ja: { benefits: ['レストランとビュッフェ最大25%オフ', 'バースデーケーキとスイーツ', '到着時のウェルカムドリンク', '会員限定ダイニングイベント'], notes: '単一ホテルのダイニングクラブ。ホテル日航サイゴンで頻繁に食事する方に最適です。' },
  },
  'world-of-hyatt': {
    ko: { benefits: ['무료 가입', '높은 가치의 포인트 사용', '객실 업그레이드 및 레이트 체크아웃', '포인트로 무료 숙박'], notes: '규모는 작지만 특히 파크 하얏트에서 일관되게 높은 포인트 가치를 제공합니다.' },
    vi: { benefits: ['Miễn phí tham gia', 'Đổi điểm giá trị cao', 'Nâng hạng phòng và trả phòng muộn', 'Đêm miễn phí bằng điểm'], notes: 'Quy mô nhỏ hơn nhưng giá trị đổi điểm luôn cao, đặc biệt tại Park Hyatt.' },
    zh: { benefits: ['免费加入', '高价值积分兑换', '客房升级与延迟退房', '用积分兑换免费住宿'], notes: '规模较小，但兑换价值始终很高，尤其在柏悦酒店。' },
    ja: { benefits: ['無料で入会', '高価値なポイント交換', '客室アップグレードとレイトチェックアウト', 'ポイントで無料宿泊'], notes: '規模は小さめですが、特にパークハイアットで安定して高い交換価値を提供します。' },
  },
  'lotte-hotel-rewards': {
    ko: { benefits: ['무료 가입', '숙박 및 다이닝 포인트 적립', '회원 다이닝 할인', '가능 시 얼리 체크인'], notes: '세련된 한국식 호스피탈리티 — 한국과 베트남 모두에서 유용하게 이용할 수 있습니다.' },
    vi: { benefits: ['Miễn phí tham gia', 'Tích điểm khi lưu trú và ăn uống', 'Giảm giá ẩm thực cho hội viên', 'Nhận phòng sớm khi có thể'], notes: 'Sự hiếu khách Hàn Quốc tinh tế, hiện diện hữu ích ở cả Hàn Quốc và Việt Nam.' },
    zh: { benefits: ['免费加入', '住宿与餐饮均可积分', '会员餐饮折扣', '视情况提前入住'], notes: '精致的韩式待客之道，在韩国与越南均有便利布局。' },
    ja: { benefits: ['無料で入会', '宿泊とダイニングでポイント獲得', '会員向けダイニング割引', '可能な場合のアーリーチェックイン'], notes: '洗練された韓国式ホスピタリティ。韓国とベトナムの両方で便利に使えます。' },
  },
}

/**
 * Return a membership with localized `benefits` + `notes` for `lang`.
 * English (the values already on the membership) is the fallback for any
 * missing language/field. `benefits` only swaps in when the localized array
 * matches the English length (so the list never renders partially).
 */
export function localizeMembership(membership, lang) {
  if (!membership) return membership
  if (!lang || lang === 'en') return membership
  const tr = membershipI18n[membership.id]?.[lang]
  if (!tr) return membership
  const benefits =
    Array.isArray(tr.benefits) && tr.benefits.length === (membership.benefits?.length || 0) ? tr.benefits : membership.benefits
  return { ...membership, benefits, notes: tr.notes || membership.notes }
}
