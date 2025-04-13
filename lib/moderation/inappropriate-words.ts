/**
 * Egyptian Arabic inappropriate words and phrases
 * Store them in a separate file for easier maintenance and updates
 */

export const EGYPTIAN_INAPPROPRIATE_WORDS = [
  // General negative words often used inappropriately
  'وسخ',
  'زبالة',
  'قرف',
  'قذارة',
  'نجاسة',
  'حقير',
  'خرا',

  // Violent or threatening terms
  'قتل',
  'دم',
  'موت',
  'اموت',
  'هموت',
  'يموت',

  // Common Egyptian insults
  'حمار',
  'غبي',
  'جاهل',
  'جزمة',
  'كلب',
  'عرص',
  'خول',

  // Negative terms in food context
  'مقرف',
  'مقزز',
  'عفن',
  'فاسد',
  'سم',
  'مسمم',

  // Strong Egyptian profanity (censored versions)
  'نيك',
  'متناك',
  'كس',
  'طيز',
  'خول',
  'كسم',
  'زب',
  'ابن متناكة',
  'ابن الكلب',
  'ابن الشرموطة',
  'يا خول',
  'شرموط',
  'شرموطة',
  'عرص',
  'ابن العرص',
  'متناك',
  'متناكة',
  'منيوك',
  'منيوكة',

  // Common phrases with profanity
  'ابن ال*',
  'كس *',
  'يلعن',
  'يا ابن ال',

  // Common variations and derivative forms with prefixes/suffixes
  'بالمتناكة',
  'ومتناك',
  'المتناك',
  'متناكين',
  'كسمك',
  'كسمه',
  'كسمها',
  'كسمهم',
  'نيكك',
  'نيكه',
  'نيكها',
  'نيكهم',
  'هنيك',
  'بنيك',
  'خولات',
  'يا خول',
  'متناكين',
  'المنيوك',
  'شراميط',
  'الشرموطة',
  'شرموطتك',

  // Phonetic spelling variations (Franco-Arabic)
  'weskh',
  'zebala',
  'klab',
  '5ara',
  '7omar',
  '3ars',
  '5awal',
  'kos',
  'kosom',
  'kosomak',
  'kosomk',
  'neek',
  'metnakah',
  'ibn metnaka',
  'ebn el metnaka',
  'metnaken',
  'sharmoot',
  'sharmoota',
  'shrameet',

  // User-provided specific examples and phrases
  'دة مدرس ابن متناكة',
  'مدرس ابن متناكة',
  'مدرس متناك',
  'دة ابن متناكة',
  'ابن متناكة',
  'مدرس ابن',
];

/**
 * Educational-related inappropriate phrases
 * Specifically for detecting abuse toward educators
 */
export const EDUCATION_INAPPROPRIATE_PHRASES = [
  'مدرس متناك',
  'مدرس ابن متناكة',
  'دة مدرس ابن متناكة',
  'المدرس ابن الكلب',
  'مدرس كس',
  'المدرس خول',
  'المدرس عرص',
  'مدرس حمار',
  'المدرس غبي',
  'مدرسة متناكة',
  'مدرسة شرموطة',
  'المدرسة بنت متناكة',
];

/**
 * General inappropriate words that should be filtered regardless of context
 */
export const GENERAL_INAPPROPRIATE_WORDS = [
  'كس',
  'طيز',
  'زب',
  'كسم',
  'نيك',
  'متناك',
  'متناكة',
  'خول',
  'عرص',
  'شرموط',
  'شرموطة',
];

/**
 * Combined inappropriate words for easier search
 */
export const ALL_INAPPROPRIATE_WORDS = [
  ...EGYPTIAN_INAPPROPRIATE_WORDS,
  ...EDUCATION_INAPPROPRIATE_PHRASES,
  ...GENERAL_INAPPROPRIATE_WORDS,
];
