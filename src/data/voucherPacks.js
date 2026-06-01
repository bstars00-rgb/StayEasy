// Voucher packs that come with each membership.
//
// When a user adds a membership to "My Benefits", these templates are
// instantiated into their e-voucher wallet. Per-voucher usage (how many of
// the `quantity` have been consumed) is tracked separately in storage, so
// these definitions stay read-only — like a product catalog.
//
// Template fields:
//  templateId   stable id (unique within a pack)
//  category     dining | room | spa | discount | gift | other  (i18n: voucherCat.<id>)
//  title        short English label (mock data; OK to stay English)
//  quantity     how many are granted
//  validUntil   ISO date the voucher expires
//  hotels       eligible properties ([] = any participating hotel)
//  city         optional city id the voucher is tied to
//  transferable whether it can be gifted/transferred to someone else
//  note         on-site conditions / extra-charge warning (English mock)
//
// Reference: modeled on the real Club Marriott Vietnam e-voucher wallet
// (categories, per-voucher quantity / available / used, expiry dates).

export const voucherCategories = ['dining', 'room', 'spa', 'discount', 'gift', 'other']

export const voucherPacks = {
  'club-marriott-vietnam': [
    {
      templateId: 'cm-stay2',
      category: 'room',
      title: 'Free 2-Night Stay',
      quantity: 1,
      validUntil: '2026-11-30',
      hotels: ['Sheraton Saigon Grand Opera Hotel', 'Le Méridien Saigon'],
      city: 'ho-chi-minh',
      transferable: false,
      note: 'Ho Chi Minh Marriott-brand hotels. Subject to availability; reservation required.',
    },
    {
      templateId: 'cm-upgrade',
      category: 'room',
      title: 'Free Room Upgrade',
      quantity: 1,
      validUntil: '2026-11-30',
      hotels: [],
      transferable: false,
      note: 'One category upgrade, subject to availability at check-in.',
    },
    {
      templateId: 'cm-breakfast',
      category: 'dining',
      title: 'Free Breakfast Coupon',
      quantity: 3,
      validUntil: '2026-11-30',
      hotels: [],
      transferable: true,
      note: 'One person per coupon.',
    },
    {
      templateId: 'cm-dinner',
      category: 'dining',
      title: 'Free Dinner Coupon',
      quantity: 2,
      validUntil: '2026-11-30',
      hotels: [],
      transferable: true,
      note: 'Set menu only. Wine and extra à la carte orders are charged on site.',
    },
    {
      templateId: 'cm-fnb50',
      category: 'discount',
      title: '50% Off Food & Beverage',
      quantity: 3,
      validUntil: '2026-06-20',
      hotels: [],
      transferable: true,
      note: 'Up to 4 diners. Beverages may be excluded.',
    },
    {
      templateId: 'cm-spa',
      category: 'spa',
      title: 'Free Spa Treatment',
      quantity: 1,
      validUntil: '2026-11-30',
      hotels: [],
      transferable: true,
      note: '60-minute signature treatment. Reservation required.',
    },
    {
      templateId: 'cm-nhatrang40',
      category: 'discount',
      title: '40% Off — Sheraton Nha Trang',
      quantity: 3,
      validUntil: '2026-11-30',
      hotels: ['Sheraton Nha Trang Resort'],
      transferable: true,
      note: 'Usable for up to 3 consecutive nights.',
    },
    {
      templateId: 'cm-cake',
      category: 'gift',
      title: 'Birthday Cake Gift',
      quantity: 1,
      validUntil: '2026-11-30',
      hotels: [],
      transferable: false,
      note: 'Pre-order 48 hours in advance.',
    },
  ],

  'accor-plus-vietnam': [
    {
      templateId: 'ap-stay1',
      category: 'room',
      title: 'Complimentary Stay Night',
      quantity: 1,
      validUntil: '2026-12-31',
      hotels: ['Sofitel Saigon Plaza', 'Pullman Saigon Centre'],
      transferable: false,
      note: 'One free night per year. Reservation required, subject to availability.',
    },
    {
      templateId: 'ap-dining50',
      category: 'discount',
      title: '50% Off Dining',
      quantity: 4,
      validUntil: '2026-12-31',
      hotels: [],
      transferable: true,
      note: 'Member + up to 3 guests. Beverages may be excluded.',
    },
    {
      templateId: 'ap-breakfast',
      category: 'dining',
      title: 'Free Breakfast for Two',
      quantity: 2,
      validUntil: '2026-07-15',
      hotels: [],
      transferable: true,
      note: 'Valid with a paid stay.',
    },
    {
      templateId: 'ap-upgrade',
      category: 'room',
      title: 'Room Upgrade',
      quantity: 1,
      validUntil: '2026-12-31',
      hotels: [],
      transferable: false,
      note: 'Subject to availability at check-in.',
    },
  ],

  'hilton-honors-vietnam': [
    {
      templateId: 'hh-lateco',
      category: 'room',
      title: 'Late Check-out (4pm)',
      quantity: 3,
      validUntil: '2026-12-31',
      hotels: [],
      transferable: false,
      note: 'Subject to availability.',
    },
    {
      templateId: 'hh-fnb15',
      category: 'discount',
      title: '15% Off Food & Beverage',
      quantity: 5,
      validUntil: '2026-12-31',
      hotels: [],
      transferable: true,
      note: 'At participating Hilton outlets.',
    },
    {
      templateId: 'hh-welcome',
      category: 'gift',
      title: 'Welcome Amenity',
      quantity: 2,
      validUntil: '2026-12-31',
      hotels: [],
      transferable: false,
      note: 'Delivered to room on a qualifying stay.',
    },
  ],

  'ihg-one-rewards-vietnam': [
    {
      templateId: 'ihg-4thnight',
      category: 'room',
      title: 'Fourth Night Free',
      quantity: 1,
      validUntil: '2026-12-31',
      hotels: [],
      transferable: false,
      note: 'On a 4-night reward stay.',
    },
    {
      templateId: 'ihg-dining20',
      category: 'discount',
      title: '20% Off Dining',
      quantity: 3,
      validUntil: '2026-12-31',
      hotels: [],
      transferable: true,
      note: 'At select hotels.',
    },
    {
      templateId: 'ihg-welcomedrink',
      category: 'dining',
      title: 'Welcome Drink',
      quantity: 2,
      validUntil: '2026-08-31',
      hotels: [],
      transferable: true,
      note: 'One drink per coupon at the lobby bar.',
    },
  ],

  'shangri-la-circle': [
    {
      templateId: 'slc-dining30',
      category: 'discount',
      title: '30% Off Dining',
      quantity: 3,
      validUntil: '2026-12-31',
      hotels: [],
      transferable: true,
      note: 'Beverages may be excluded.',
    },
    {
      templateId: 'slc-spa',
      category: 'spa',
      title: 'Spa Treatment Discount',
      quantity: 2,
      validUntil: '2026-12-31',
      hotels: [],
      transferable: true,
      note: 'Reservation required.',
    },
    {
      templateId: 'slc-upgrade',
      category: 'room',
      title: 'Room Upgrade',
      quantity: 1,
      validUntil: '2026-12-31',
      hotels: [],
      transferable: false,
      note: 'Subject to availability.',
    },
  ],

  'hotel-nikko-saigon-dining-club': [
    {
      templateId: 'nk-buffet25',
      category: 'discount',
      title: '25% Off Buffet',
      quantity: 4,
      validUntil: '2026-09-30',
      hotels: ['Hotel Nikko Saigon'],
      city: 'ho-chi-minh',
      transferable: true,
      note: 'Lunch or dinner buffet.',
    },
    {
      templateId: 'nk-cake',
      category: 'gift',
      title: 'Birthday Cake',
      quantity: 1,
      validUntil: '2026-11-30',
      hotels: ['Hotel Nikko Saigon'],
      transferable: false,
      note: 'Pre-order 48 hours in advance.',
    },
    {
      templateId: 'nk-welcome',
      category: 'dining',
      title: 'Welcome Drink',
      quantity: 2,
      validUntil: '2026-11-30',
      hotels: ['Hotel Nikko Saigon'],
      transferable: true,
      note: 'At the lobby lounge.',
    },
  ],

  'world-of-hyatt': [
    {
      templateId: 'woh-upgrade',
      category: 'room',
      title: 'Room Upgrade',
      quantity: 2,
      validUntil: '2026-12-31',
      hotels: [],
      transferable: false,
      note: 'Including standard suites, subject to availability.',
    },
    {
      templateId: 'woh-lateco',
      category: 'room',
      title: 'Late Check-out',
      quantity: 2,
      validUntil: '2026-12-31',
      hotels: [],
      transferable: false,
      note: 'Subject to availability.',
    },
    {
      templateId: 'woh-spa',
      category: 'spa',
      title: 'Spa Credit',
      quantity: 1,
      validUntil: '2026-12-31',
      hotels: [],
      transferable: true,
      note: 'Reservation required.',
    },
  ],

  'lotte-hotel-rewards': [
    {
      templateId: 'lh-dining15',
      category: 'discount',
      title: '15% Off Dining',
      quantity: 4,
      validUntil: '2026-12-31',
      hotels: [],
      transferable: true,
      note: 'At participating Lotte Hotel outlets.',
    },
    {
      templateId: 'lh-earlyci',
      category: 'room',
      title: 'Early Check-in',
      quantity: 2,
      validUntil: '2026-12-31',
      hotels: [],
      transferable: false,
      note: 'Subject to availability.',
    },
    {
      templateId: 'lh-spa',
      category: 'spa',
      title: 'Spa Discount',
      quantity: 1,
      validUntil: '2026-10-31',
      hotels: [],
      transferable: true,
      note: 'Reservation required.',
    },
  ],
}

export function getVoucherPack(membershipId) {
  return voucherPacks[membershipId] || []
}

export function getVoucherTemplate(membershipId, templateId) {
  return getVoucherPack(membershipId).find((v) => v.templateId === templateId)
}
