// Quiz definition for the recommendation engine.
// Each option carries a machine value used by the scoring logic in
// pages/Quiz.jsx; labels are resolved through i18n (labelKey).

export const quizQuestions = [
  {
    id: 'city',
    labelKey: 'quiz.q1',
    options: [
      { value: 'ho-chi-minh', labelKey: 'cities.ho-chi-minh' },
      { value: 'da-nang', labelKey: 'cities.da-nang' },
      { value: 'hanoi', labelKey: 'cities.hanoi' },
      { value: 'seoul', labelKey: 'cities.seoul' },
      { value: 'bangkok', labelKey: 'cities.bangkok' },
      { value: 'tokyo', labelKey: 'cities.tokyo' },
    ],
  },
  {
    id: 'benefit',
    labelKey: 'quiz.q2',
    options: [
      { value: 'hotelBuffet', labelKey: 'tags.hotelBuffet' },
      { value: 'familyDining', labelKey: 'tags.familyDining' },
      { value: 'staycation', labelKey: 'tags.staycation' },
      { value: 'businessTravel', labelKey: 'tags.businessTravel' },
      { value: 'spa', labelKey: 'tags.spa' },
      { value: 'barLounge', labelKey: 'tags.barLounge' },
      { value: 'freeNight', labelKey: 'tags.freeNight' },
    ],
  },
  {
    id: 'frequency',
    labelKey: 'quiz.q3',
    options: [
      { value: 0, labelKey: 'quiz.freq0' },
      { value: 1, labelKey: 'quiz.freq1' },
      { value: 2.5, labelKey: 'quiz.freq23' },
      { value: 4, labelKey: 'quiz.freq4' },
    ],
  },
  {
    id: 'companion',
    labelKey: 'quiz.q4',
    options: [
      { value: 'single', labelKey: 'quiz.single' },
      { value: 'couple', labelKey: 'quiz.couple' },
      { value: 'family', labelKey: 'quiz.family' },
      { value: 'business', labelKey: 'quiz.business' },
    ],
  },
  {
    id: 'fee',
    labelKey: 'quiz.q5',
    options: [
      { value: 0, labelKey: 'quiz.feeNo' },
      { value: 100, labelKey: 'quiz.feeUnder100' },
      { value: 300, labelKey: 'quiz.fee100to300' },
      { value: 9999, labelKey: 'quiz.fee300plus' },
    ],
  },
]
