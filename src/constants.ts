export const TourTypes = {
  transfer_only: 'Проезд',
  transfer_and_hotel: 'Проезд + Проживание',
  transfer_and_hotel_optional: 'Проезд + Проживание (по желанию)',
} as const

export const FoodTypes = {
  pension: 'Полный пансион',
  half_pension: 'Полупансион',
  breakfast: 'Завтрак',
  all_inclusive: 'Всё включено',
} as Record<string, string>

export const PlaceTypes = {
  single: 'Одноместный',
  double: 'Двухместный',
  double_with_extra: 'Двухместный + дополнительное место',
  triple: 'Трехместный',
  child_without_place: 'Ребенок без места',
} as Record<string, string>

export const ApproveTypes = {
  need_request: 'Под запрос',
  auto_approve: 'Моментальное подтверждение',
  no_approve: 'Без подтверждения',
} as Record<string, string>
