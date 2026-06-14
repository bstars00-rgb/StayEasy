// Localized voucher copy (title / description / note) for ko, vi, zh, ja.
//
// English is the source of truth and lives in voucherPacks.js; it is used as
// the fallback whenever a translation is missing. Keyed by the same
// `templateId` so the catalog ids stay identical (backend seeds from the
// English catalog, so do NOT add ids here that don't exist there).
//
// Use localizeVoucher(template, lang) to get a template with localized
// title/description/note merged in.

export const voucherI18n = {
  // ── Club Marriott Vietnam ─────────────────────────────────────────────
  'cm-stay2': {
    ko: { title: '무료 2박 숙박', description: '호치민 메리어트 계열 호텔에서 2박 무료 — 주말 스테이케이션에 안성맞춤입니다. 객실 타입과 날짜는 잔여 상황 및 사전 예약에 따라 달라집니다.', note: '호치민 메리어트 계열 호텔. 잔여 상황에 따라 다르며, 예약이 필요합니다.' },
    vi: { title: 'Miễn phí 2 đêm nghỉ', description: 'Hai đêm nghỉ miễn phí tại khách sạn thương hiệu Marriott ở TP. Hồ Chí Minh — lý tưởng cho kỳ nghỉ cuối tuần. Loại phòng và ngày tùy thuộc tình trạng phòng trống và đặt trước.', note: 'Khách sạn thương hiệu Marriott tại TP. Hồ Chí Minh. Tùy tình trạng phòng; cần đặt trước.' },
    zh: { title: '免费住宿2晚', description: '在胡志明市万豪旗下酒店免费入住两晚 — 周末度假的理想之选。房型与日期视供应情况而定，需提前预订。', note: '胡志明市万豪旗下酒店。视供应情况而定，需预订。' },
    ja: { title: '2泊無料宿泊', description: 'ホーチミンのマリオット系列ホテルで2泊無料 — 週末のステイケーションに最適です。客室タイプと日程は空室状況および事前予約によります。', note: 'ホーチミンのマリオット系列ホテル。空室状況により異なり、予約が必要です。' },
  },
  'cm-upgrade': {
    ko: { title: '무료 객실 업그레이드', description: '체크인 시 예약하신 객실에서 한 단계 상위 타입으로 무료 업그레이드해 드립니다. 도착 시점의 잔여 상황에 따릅니다.', note: '한 단계 업그레이드, 체크인 시 잔여 상황에 따릅니다.' },
    vi: { title: 'Nâng hạng phòng miễn phí', description: 'Nâng hạng phòng miễn phí một bậc khi nhận phòng, từ phòng đã đặt lên loại cao hơn kế tiếp, tùy tình trạng phòng lúc đến.', note: 'Nâng một bậc hạng phòng, tùy tình trạng phòng khi nhận phòng.' },
    zh: { title: '免费客房升级', description: '入住时免费升级一个房型等级，从所订房型升至上一级，视抵店时供应情况而定。', note: '升级一个等级，视入住时供应情况而定。' },
    ja: { title: '無料客室アップグレード', description: 'チェックイン時に、ご予約の客室から一つ上のタイプへ無料アップグレード。到着時の空室状況によります。', note: '1ランクアップグレード、チェックイン時の空室状況によります。' },
  },
  'cm-breakfast': {
    ko: { title: '무료 조식 쿠폰', description: '호텔 올데이 다이닝 레스토랑에서 1인 무료 조식. 1회 방문 시 1인당 쿠폰 1매를 사용합니다.', note: '쿠폰 1매당 1인.' },
    vi: { title: 'Phiếu ăn sáng miễn phí', description: 'Bữa sáng miễn phí cho một người tại nhà hàng all-day dining của khách sạn. Dùng một phiếu cho mỗi khách, mỗi lần.', note: 'Một người cho mỗi phiếu.' },
    zh: { title: '免费早餐券', description: '在酒店全日餐厅享一人免费早餐。每位客人每次使用一张餐券。', note: '每张餐券限一人。' },
    ja: { title: '無料朝食クーポン', description: 'ホテルのオールデイダイニングで1名様分の朝食が無料。1回のご利用につき1名様あたりクーポン1枚をご利用ください。', note: 'クーポン1枚につき1名様。' },
  },
  'cm-dinner': {
    ko: { title: '무료 디너 쿠폰', description: '참여 레스토랑에서 1인 세트 디너 무료. 단품 추가, 와인 및 프리미엄 음료는 현장에서 별도 청구됩니다.', note: '세트 메뉴 한정. 와인 및 추가 단품은 현장 청구됩니다.' },
    vi: { title: 'Phiếu ăn tối miễn phí', description: 'Bữa tối set miễn phí cho một người tại các nhà hàng tham gia. Món gọi thêm, rượu vang và đồ uống cao cấp tính phí riêng tại chỗ.', note: 'Chỉ áp dụng set menu. Rượu vang và món gọi thêm tính phí tại chỗ.' },
    zh: { title: '免费晚餐券', description: '在参与餐厅享一人套餐晚宴免费。单点加项、葡萄酒及高级饮品于现场另行收费。', note: '仅限套餐。葡萄酒及额外单点于现场收费。' },
    ja: { title: '無料ディナークーポン', description: '対象レストランで1名様分のセットディナーが無料。アラカルトの追加、ワインやプレミアム飲料は現地で別途料金がかかります。', note: 'セットメニューのみ。ワインや追加のアラカルトは現地払い。' },
  },
  'cm-fnb50': {
    ko: { title: '식음료 50% 할인', description: '최대 4인까지 식음료 총액 50% 할인 — 점심과 저녁에 유용한 일상 혜택입니다. 일부 프리미엄 음료는 제외될 수 있습니다.', note: '최대 4인. 일부 음료 제외될 수 있음.' },
    vi: { title: 'Giảm 50% ẩm thực', description: 'Giảm 50% tổng hóa đơn ẩm thực cho tối đa bốn người — ưu đãi tuyệt vời cho bữa trưa và tối hằng ngày. Một số đồ uống cao cấp có thể không áp dụng.', note: 'Tối đa 4 khách. Có thể loại trừ một số đồ uống.' },
    zh: { title: '餐饮 50% 折扣', description: '餐饮总额五折，最多4位用餐 — 午餐与晚餐的日常好礼。部分高级饮品可能不适用。', note: '最多4位。部分饮品可能不适用。' },
    ja: { title: '飲食50%オフ', description: '最大4名様まで飲食合計が50%オフ — ランチやディナーに嬉しい日常特典です。一部のプレミアム飲料は対象外の場合があります。', note: '最大4名様。一部飲料は対象外の場合あり。' },
  },
  'cm-spa': {
    ko: { title: '무료 스파 트리트먼트', description: '60분 시그니처 스파 트리트먼트 1회 무료. 사전 예약이 필요하며, 주말 시간대는 빠르게 마감됩니다.', note: '60분 시그니처 트리트먼트. 예약 필수.' },
    vi: { title: 'Liệu trình spa miễn phí', description: 'Một liệu trình spa signature 60 phút miễn phí. Cần đặt trước; khung giờ cuối tuần nhanh hết chỗ.', note: 'Liệu trình signature 60 phút. Cần đặt trước.' },
    zh: { title: '免费水疗护理', description: '免费享一次60分钟招牌水疗护理。需提前预订；周末时段很快约满。', note: '60分钟招牌护理。需预订。' },
    ja: { title: '無料スパトリートメント', description: '60分のシグネチャースパトリートメントが1回無料。事前予約が必要で、週末の枠は早く埋まります。', note: '60分シグネチャートリートメント。予約必須。' },
  },
  'cm-nhatrang40': {
    ko: { title: '쉐라톤 나트랑 40% 할인', description: '쉐라톤 나트랑 리조트 베스트 어베일러블 요금 40% 할인, 최대 3박 연속 이용 가능 — 해변 휴가에 안성맞춤입니다.', note: '최대 3박 연속 이용 가능.' },
    vi: { title: 'Giảm 40% — Sheraton Nha Trang', description: 'Giảm 40% giá phòng tốt nhất hiện có tại Sheraton Nha Trang Resort, áp dụng tối đa ba đêm liên tiếp — lý tưởng cho kỳ nghỉ biển.', note: 'Áp dụng tối đa 3 đêm liên tiếp.' },
    zh: { title: '芽庄喜来登 40% 折扣', description: '芽庄喜来登度假酒店最优房价减40%，最多可连住三晚 — 海滨度假的理想之选。', note: '最多可连住3晚。' },
    ja: { title: 'シェラトン・ニャチャン40%オフ', description: 'シェラトン・ニャチャン・リゾートのベストアベイラブルレートが40%オフ、最大3連泊まで利用可能 — ビーチでの休暇に最適です。', note: '最大3連泊まで利用可能。' },
  },
  'cm-cake': {
    ko: { title: '생일 케이크 선물', description: '특별한 날을 축하하는 무료 생일 케이크. 최소 48시간 전 사전 주문해 주세요.', note: '48시간 전 사전 주문.' },
    vi: { title: 'Quà bánh sinh nhật', description: 'Một chiếc bánh sinh nhật miễn phí để mừng ngày đặc biệt của bạn. Vui lòng đặt trước ít nhất 48 giờ.', note: 'Đặt trước 48 giờ.' },
    zh: { title: '生日蛋糕礼物', description: '免费生日蛋糕，为您的特别日子庆祝。请至少提前48小时预订。', note: '提前48小时预订。' },
    ja: { title: 'バースデーケーキギフト', description: '特別な日をお祝いする無料のバースデーケーキ。48時間前までにご予約ください。', note: '48時間前までに予約。' },
  },

  // ── Accor Plus Vietnam ────────────────────────────────────────────────
  'ap-stay1': {
    ko: { title: '무료 숙박 1박', description: '멤버십 연도당 베트남 내 참여 아코르 호텔에서 1박 무료. 예약이 필요하고 잔여 상황에 따르며, 블랙아웃 일자가 적용될 수 있습니다.', note: '연 1박 무료. 예약 필요, 잔여 상황에 따름.' },
    vi: { title: 'Một đêm nghỉ miễn phí', description: 'Một đêm nghỉ miễn phí mỗi năm thành viên tại khách sạn Accor tham gia ở Việt Nam. Cần đặt trước và tùy tình trạng phòng; có thể áp dụng ngày hạn chế.', note: 'Một đêm miễn phí mỗi năm. Cần đặt trước, tùy tình trạng phòng.' },
    zh: { title: '免费住宿一晚', description: '每个会员年度可在越南参与的雅高酒店免费入住一晚。需预订并视供应情况而定；可能适用不可用日期。', note: '每年免费一晚。需预订，视供应情况而定。' },
    ja: { title: '無料宿泊1泊', description: '会員年度ごとに、ベトナム内の対象アコーホテルで1泊無料。予約が必要で空室状況により、ブラックアウト日が適用される場合があります。', note: '年1泊無料。予約必要、空室状況による。' },
  },
  'ap-dining50': {
    ko: { title: '다이닝 50% 할인', description: '참여 아코르 레스토랑에서 회원 본인과 동반 최대 3인까지 다이닝 50% 할인. 음료 및 세트 프로모션은 제외될 수 있습니다.', note: '회원 + 최대 3인. 음료 제외될 수 있음.' },
    vi: { title: 'Giảm 50% ẩm thực', description: 'Giảm 50% cho hội viên cùng tối đa ba khách tại các nhà hàng Accor tham gia. Đồ uống và các set khuyến mãi có thể không áp dụng.', note: 'Hội viên + tối đa 3 khách. Có thể loại trừ đồ uống.' },
    zh: { title: '餐饮 50% 折扣', description: '会员本人及最多三位同行宾客在参与雅高餐厅享餐饮五折。饮品及套餐促销可能不适用。', note: '会员 + 最多3位宾客。饮品可能不适用。' },
    ja: { title: 'ダイニング50%オフ', description: '対象アコーレストランで、会員ご本人と同伴最大3名様までダイニングが50%オフ。飲料やセットプロモーションは対象外の場合があります。', note: '会員＋最大3名様。飲料は対象外の場合あり。' },
  },
  'ap-breakfast': {
    ko: { title: '2인 무료 조식', description: '2인 무료 조식. 참여 호텔의 유료 숙박에 추가 시 유효합니다.', note: '유료 숙박 시 유효.' },
    vi: { title: 'Ăn sáng miễn phí cho 2 người', description: 'Bữa sáng miễn phí cho hai người, áp dụng khi thêm vào kỳ nghỉ có trả phí tại khách sạn tham gia.', note: 'Áp dụng khi có lưu trú trả phí.' },
    zh: { title: '双人免费早餐', description: '双人免费早餐，在参与酒店的付费住宿基础上添加时有效。', note: '付费住宿时有效。' },
    ja: { title: '2名様無料朝食', description: '2名様分の無料朝食。対象ホテルの有料宿泊に追加する場合に有効です。', note: '有料宿泊時に有効。' },
  },
  'ap-upgrade': {
    ko: { title: '객실 업그레이드', description: '체크인 시 한 단계 무료 객실 업그레이드, 잔여 상황에 따릅니다.', note: '체크인 시 잔여 상황에 따름.' },
    vi: { title: 'Nâng hạng phòng', description: 'Nâng hạng phòng miễn phí một bậc khi nhận phòng, tùy tình trạng phòng.', note: 'Tùy tình trạng phòng khi nhận phòng.' },
    zh: { title: '客房升级', description: '入住时免费升级一个房型等级，视供应情况而定。', note: '视入住时供应情况而定。' },
    ja: { title: '客室アップグレード', description: 'チェックイン時に1ランクの無料客室アップグレード、空室状況によります。', note: 'チェックイン時の空室状況による。' },
  },

  // ── Hilton Honors Vietnam ─────────────────────────────────────────────
  'hh-lateco': {
    ko: { title: '레이트 체크아웃 (오후 4시)', description: '출발일 오후 4시까지 레이트 체크아웃, 잔여 상황에 따릅니다 — 아침을 서두를 필요가 없습니다.', note: '잔여 상황에 따름.' },
    vi: { title: 'Trả phòng muộn (16:00)', description: 'Trả phòng muộn đến 16:00 ngày khởi hành, tùy tình trạng phòng — không cần vội vã buổi sáng.', note: 'Tùy tình trạng phòng.' },
    zh: { title: '延迟退房（下午4点）', description: '离店当天可延至下午4点退房，视供应情况而定 — 早晨无需匆忙。', note: '视供应情况而定。' },
    ja: { title: 'レイトチェックアウト（午後4時）', description: 'ご出発日の午後4時までレイトチェックアウト、空室状況によります — 朝を急ぐ必要はありません。', note: '空室状況による。' },
  },
  'hh-fnb15': {
    ko: { title: '식음료 15% 할인', description: '베트남 전역 참여 힐튼 매장에서 식음료 15% 할인.', note: '참여 힐튼 매장 한정.' },
    vi: { title: 'Giảm 15% ẩm thực', description: 'Giảm 15% hóa đơn ẩm thực tại các điểm Hilton tham gia trên khắp Việt Nam.', note: 'Tại các điểm Hilton tham gia.' },
    zh: { title: '餐饮 15% 折扣', description: '在越南各地参与的希尔顿餐饮门店享餐饮账单立减15%。', note: '限参与的希尔顿门店。' },
    ja: { title: '飲食15%オフ', description: 'ベトナム各地の対象ヒルトン店舗で飲食代が15%オフ。', note: '対象ヒルトン店舗にて。' },
  },
  'hh-welcome': {
    ko: { title: '웰컴 어메니티', description: '조건 충족 숙박 시 객실로 전달되는 웰컴 어메니티 — 여행을 시작하는 작은 정성입니다.', note: '조건 충족 숙박 시 객실 제공.' },
    vi: { title: 'Quà chào mừng', description: 'Quà chào mừng được mang đến phòng khi lưu trú đủ điều kiện — một điểm chạm nhỏ mở đầu chuyến đi.', note: 'Mang đến phòng khi lưu trú đủ điều kiện.' },
    zh: { title: '欢迎礼遇', description: '符合条件的住宿可享送至客房的欢迎礼遇 — 为旅程开启的小小心意。', note: '符合条件住宿送至客房。' },
    ja: { title: 'ウェルカムアメニティ', description: '対象の宿泊で客室にお届けするウェルカムアメニティ — 旅の始まりに添えるささやかなおもてなしです。', note: '対象宿泊時に客室へお届け。' },
  },

  // ── IHG One Rewards Vietnam ───────────────────────────────────────────
  'ihg-4thnight': {
    ko: { title: '4박째 무료', description: '4박 리워드 숙박 시 4박째가 무료 — 장기 여행에 큰 가치입니다.', note: '4박 리워드 숙박 시.' },
    vi: { title: 'Đêm thứ tư miễn phí', description: 'Với kỳ nghỉ thưởng bốn đêm, đêm thứ tư miễn phí — rất đáng giá cho chuyến đi dài.', note: 'Áp dụng cho kỳ nghỉ thưởng 4 đêm.' },
    zh: { title: '第四晚免费', description: '在四晚奖励住宿中，第四晚免费 — 长途旅行的超值之选。', note: '适用于4晚奖励住宿。' },
    ja: { title: '4泊目無料', description: '4泊のリワード宿泊で4泊目が無料 — 長期の旅に嬉しい価値です。', note: '4泊のリワード宿泊にて。' },
  },
  'ihg-dining20': {
    ko: { title: '다이닝 20% 할인', description: '일부 IHG 호텔 레스토랑에서 다이닝 20% 할인. 일부 매장 및 프로모션은 제외될 수 있습니다.', note: '일부 호텔 한정.' },
    vi: { title: 'Giảm 20% ẩm thực', description: 'Giảm 20% ẩm thực tại các nhà hàng khách sạn IHG chọn lọc. Một số điểm và khuyến mãi có thể không áp dụng.', note: 'Tại các khách sạn chọn lọc.' },
    zh: { title: '餐饮 20% 折扣', description: '在指定洲际旗下酒店餐厅享餐饮八折。部分门店及促销可能不适用。', note: '限指定酒店。' },
    ja: { title: 'ダイニング20%オフ', description: '一部のIHGホテルレストランでダイニングが20%オフ。一部の店舗やプロモーションは対象外の場合があります。', note: '一部ホテルにて。' },
  },
  'ihg-welcomedrink': {
    ko: { title: '웰컴 드링크', description: '도착 시 로비 바에서 쿠폰당 웰컴 드링크 1잔 무료.', note: '로비 바에서 쿠폰당 1잔.' },
    vi: { title: 'Đồ uống chào mừng', description: 'Một đồ uống chào mừng miễn phí mỗi phiếu tại quầy bar sảnh khi đến.', note: 'Một ly mỗi phiếu tại bar sảnh.' },
    zh: { title: '欢迎饮品', description: '抵店时在大堂吧每张券享一杯免费欢迎饮品。', note: '大堂吧每券一杯。' },
    ja: { title: 'ウェルカムドリンク', description: 'ご到着時、ロビーバーでクーポン1枚につきウェルカムドリンク1杯が無料。', note: 'ロビーバーでクーポン1枚につき1杯。' },
  },

  // ── Shangri-La Circle ─────────────────────────────────────────────────
  'slc-dining30': {
    ko: { title: '다이닝 30% 할인', description: '참여 샹그릴라 레스토랑에서 다이닝 30% 할인. 음료는 제외될 수 있습니다.', note: '음료 제외될 수 있음.' },
    vi: { title: 'Giảm 30% ẩm thực', description: 'Giảm 30% hóa đơn ẩm thực tại các nhà hàng Shangri-La tham gia. Có thể loại trừ đồ uống.', note: 'Có thể loại trừ đồ uống.' },
    zh: { title: '餐饮 30% 折扣', description: '在参与的香格里拉餐厅享餐饮七折。饮品可能不适用。', note: '饮品可能不适用。' },
    ja: { title: 'ダイニング30%オフ', description: '対象シャングリ・ラのレストランでダイニングが30%オフ。飲料は対象外の場合があります。', note: '飲料は対象外の場合あり。' },
  },
  'slc-spa': {
    ko: { title: '스파 트리트먼트 할인', description: 'CHI, The Spa의 트리트먼트에 대한 회원 전용 할인. 사전 예약이 필요합니다.', note: '예약 필수.' },
    vi: { title: 'Ưu đãi liệu trình spa', description: 'Ưu đãi dành riêng cho hội viên cho các liệu trình tại CHI, The Spa. Cần đặt trước.', note: 'Cần đặt trước.' },
    zh: { title: '水疗护理折扣', description: 'CHI, The Spa 护理项目的会员专属折扣。需提前预订。', note: '需预订。' },
    ja: { title: 'スパトリートメント割引', description: 'CHI, The Spa のトリートメントに対する会員限定割引。事前予約が必要です。', note: '予約必須。' },
  },
  'slc-upgrade': {
    ko: { title: '객실 업그레이드', description: '자격 등급 대상 체크인 시 무료 객실 업그레이드, 잔여 상황에 따릅니다.', note: '잔여 상황에 따름.' },
    vi: { title: 'Nâng hạng phòng', description: 'Nâng hạng phòng miễn phí khi nhận phòng cho các hạng hội viên đủ điều kiện, tùy tình trạng phòng.', note: 'Tùy tình trạng phòng.' },
    zh: { title: '客房升级', description: '符合资格的会员等级入住时享免费客房升级，视供应情况而定。', note: '视供应情况而定。' },
    ja: { title: '客室アップグレード', description: '対象会員ランクの方は、チェックイン時に無料客室アップグレード、空室状況によります。', note: '空室状況による。' },
  },

  // ── Hotel Nikko Saigon Dining Club ────────────────────────────────────
  'nk-buffet25': {
    ko: { title: '뷔페 25% 할인', description: '호텔 닛코 사이공에서 런치 또는 디너 뷔페 25% 할인 — 가족 및 단체에게 인기입니다.', note: '런치 또는 디너 뷔페.' },
    vi: { title: 'Giảm 25% buffet', description: 'Giảm 25% buffet trưa hoặc tối tại Hotel Nikko Saigon — được các gia đình và nhóm yêu thích.', note: 'Buffet trưa hoặc tối.' },
    zh: { title: '自助餐 25% 折扣', description: '在西贡日航酒店享午餐或晚餐自助餐七五折 — 深受家庭与团体喜爱。', note: '午餐或晚餐自助餐。' },
    ja: { title: 'ビュッフェ25%オフ', description: 'ホテル日航サイゴンでランチまたはディナービュッフェが25%オフ — ご家族やグループに人気です。', note: 'ランチまたはディナービュッフェ。' },
  },
  'nk-cake': {
    ko: { title: '생일 케이크', description: '호텔 닛코 사이공에서 무료 생일 케이크. 최소 48시간 전 사전 주문해 주세요.', note: '48시간 전 사전 주문.' },
    vi: { title: 'Bánh sinh nhật', description: 'Một chiếc bánh sinh nhật miễn phí tại Hotel Nikko Saigon. Vui lòng đặt trước ít nhất 48 giờ.', note: 'Đặt trước 48 giờ.' },
    zh: { title: '生日蛋糕', description: '西贡日航酒店免费生日蛋糕。请至少提前48小时预订。', note: '提前48小时预订。' },
    ja: { title: 'バースデーケーキ', description: 'ホテル日航サイゴンで無料のバースデーケーキ。48時間前までにご予約ください。', note: '48時間前までに予約。' },
  },
  'nk-welcome': {
    ko: { title: '웰컴 드링크', description: '로비 라운지에서 무료 웰컴 드링크 — 도착 후 휴식하기에 완벽합니다.', note: '로비 라운지에서.' },
    vi: { title: 'Đồ uống chào mừng', description: 'Một đồ uống chào mừng miễn phí tại sảnh chờ — hoàn hảo để thư giãn sau khi đến.', note: 'Tại sảnh chờ.' },
    zh: { title: '欢迎饮品', description: '在大堂酒廊享免费欢迎饮品 — 抵店后放松身心的完美选择。', note: '于大堂酒廊。' },
    ja: { title: 'ウェルカムドリンク', description: 'ロビーラウンジで無料のウェルカムドリンク — ご到着後のひと息に最適です。', note: 'ロビーラウンジにて。' },
  },

  // ── World of Hyatt ────────────────────────────────────────────────────
  'woh-upgrade': {
    ko: { title: '객실 업그레이드', description: '자격 회원 대상 체크인 시 무료 업그레이드, 잔여 시 스탠다드 스위트 포함.', note: '스탠다드 스위트 포함, 잔여 상황에 따름.' },
    vi: { title: 'Nâng hạng phòng', description: 'Nâng hạng miễn phí khi nhận phòng, bao gồm suite tiêu chuẩn nếu còn trống, cho hội viên đủ điều kiện.', note: 'Gồm suite tiêu chuẩn, tùy tình trạng phòng.' },
    zh: { title: '客房升级', description: '符合资格的会员入住时享免费升级，如有空房含标准套房。', note: '含标准套房，视供应情况而定。' },
    ja: { title: '客室アップグレード', description: '対象会員の方は、チェックイン時に無料アップグレード、空室があればスタンダードスイートを含みます。', note: 'スタンダードスイートを含む、空室状況による。' },
  },
  'woh-lateco': {
    ko: { title: '레이트 체크아웃', description: '출발일 레이트 체크아웃, 잔여 상황에 따릅니다 — 늦은 항공편에 안성맞춤입니다.', note: '잔여 상황에 따름.' },
    vi: { title: 'Trả phòng muộn', description: 'Trả phòng muộn ngày khởi hành, tùy tình trạng phòng — lý tưởng cho chuyến bay muộn.', note: 'Tùy tình trạng phòng.' },
    zh: { title: '延迟退房', description: '离店当天延迟退房，视供应情况而定 — 适合晚班航班。', note: '视供应情况而定。' },
    ja: { title: 'レイトチェックアウト', description: 'ご出発日のレイトチェックアウト、空室状況によります — 遅い便に最適です。', note: '空室状況による。' },
  },
  'woh-spa': {
    ko: { title: '스파 크레딧', description: '참여 하얏트 스파의 트리트먼트에 사용 가능한 스파 크레딧. 예약이 필요합니다.', note: '예약 필수.' },
    vi: { title: 'Tín dụng spa', description: 'Tín dụng spa dùng cho các liệu trình tại spa Hyatt tham gia. Cần đặt trước.', note: 'Cần đặt trước.' },
    zh: { title: '水疗抵用金', description: '可用于参与凯悦水疗中心护理项目的水疗抵用金。需预订。', note: '需预订。' },
    ja: { title: 'スパクレジット', description: '対象ハイアットスパのトリートメントに利用できるスパクレジット。予約が必要です。', note: '予約必須。' },
  },

  // ── Lotte Hotel Rewards ───────────────────────────────────────────────
  'lh-dining15': {
    ko: { title: '다이닝 15% 할인', description: '한국과 베트남의 참여 롯데호텔 레스토랑에서 다이닝 15% 할인.', note: '참여 롯데호텔 매장 한정.' },
    vi: { title: 'Giảm 15% ẩm thực', description: 'Giảm 15% ẩm thực tại các nhà hàng Lotte Hotel tham gia ở Hàn Quốc và Việt Nam.', note: 'Tại các điểm Lotte Hotel tham gia.' },
    zh: { title: '餐饮 15% 折扣', description: '在韩国与越南参与的乐天酒店餐厅享餐饮立减15%。', note: '限参与的乐天酒店门店。' },
    ja: { title: 'ダイニング15%オフ', description: '韓国とベトナムの対象ロッテホテルレストランでダイニングが15%オフ。', note: '対象ロッテホテル店舗にて。' },
  },
  'lh-earlyci': {
    ko: { title: '얼리 체크인', description: '도착일 얼리 체크인, 잔여 상황에 따릅니다 — 일정 시작 전 여유롭게 짐을 푸세요.', note: '잔여 상황에 따름.' },
    vi: { title: 'Nhận phòng sớm', description: 'Nhận phòng sớm ngày đến, tùy tình trạng phòng — ổn định trước khi bắt đầu lịch trình.', note: 'Tùy tình trạng phòng.' },
    zh: { title: '提前入住', description: '抵店当天提前入住，视供应情况而定 — 在行程开始前从容安顿。', note: '视供应情况而定。' },
    ja: { title: 'アーリーチェックイン', description: 'ご到着日のアーリーチェックイン、空室状況によります — ご予定の前にゆっくり落ち着けます。', note: '空室状況による。' },
  },
  'lh-spa': {
    ko: { title: '스파 할인', description: '스파 서비스에 대한 회원 전용 할인. 사전 예약을 권장합니다.', note: '예약 필수.' },
    vi: { title: 'Ưu đãi spa', description: 'Ưu đãi dành riêng cho hội viên cho dịch vụ spa. Khuyến nghị đặt trước.', note: 'Cần đặt trước.' },
    zh: { title: '水疗折扣', description: '水疗服务的会员专属折扣。建议提前预订。', note: '需预订。' },
    ja: { title: 'スパ割引', description: 'スパサービスに対する会員限定割引。事前予約をおすすめします。', note: '予約必須。' },
  },
}

/**
 * Return a template with localized title/description/note for `lang`.
 *
 * Translation precedence (per field, independently):
 *   1. inline `template.i18n[lang]` — admin-authored, comes from the backend
 *      for catalog-managed vouchers, so new vouchers can be multilingual too;
 *   2. the static `voucherI18n` map above (built-in English catalog);
 *   3. English (the values already on the template).
 *
 * Other fields are passed through untouched.
 */
export function localizeVoucher(template, lang) {
  if (!template) return template
  if (!lang || lang === 'en') return template
  const inline = template.i18n?.[lang]
  const tr = voucherI18n[template.templateId]?.[lang]
  if (!inline && !tr) return template
  const pick = (field) => inline?.[field] || tr?.[field] || template[field]
  return {
    ...template,
    title: pick('title'),
    description: pick('description'),
    note: pick('note'),
  }
}
