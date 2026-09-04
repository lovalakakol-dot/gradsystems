/**
 * Deterministic Arabic-alphabet comparator (sections 20-24).
 *
 * Ordering follows the abjad sequence given in the spec exactly:
 *   ا ب ت ث ج ح خ د ذ ر ز س ش ص ض ط ظ ع غ ف ق ك ل م ن ه و ي
 *
 * Normalization, so hamzah/alif variants never produce inconsistent
 * or non-deterministic ordering (section 23):
 * - أ / إ / آ / ٱ  -> ا  (all alif variants sort at the ا position)
 * - ى             -> ي  (alif maqsura sorts as ya)
 * - ة             -> ه  (taa marbuta sorts as ha)
 * - Arabic diacritics (tashkeel: fatha, damma, kasra, sukun,
 *   shadda, tanwin) are stripped before comparing — they carry no
 *   ordering information and must not perturb the result.
 * - Any other character (ء standalone hamza, ؤ, ئ, digits, Latin
 *   letters, punctuation, spaces) is NOT in the given 28-letter list.
 *   These are placed after all 28 known letters, in their own
 *   Unicode order, so the comparator never throws or falls back to
 *   an undefined/locale-dependent order for real Arabic names.
 * - Ties after normalization fall back to plain codepoint
 *   comparison of the normalized string, so equal-weight names still
 *   sort deterministically instead of preserving arbitrary input
 *   order.
 */

const ARABIC_ALPHABET_ORDER = [
  'ا', 'ب', 'ت', 'ث', 'ج', 'ح', 'خ', 'د', 'ذ', 'ر', 'ز', 'س', 'ش',
  'ص', 'ض', 'ط', 'ظ', 'ع', 'غ', 'ف', 'ق', 'ك', 'ل', 'م', 'ن', 'ه',
  'و', 'ي',
];

const LETTER_WEIGHT = new Map<string, number>(
  ARABIC_ALPHABET_ORDER.map((letter, index) => [letter, index])
);

const UNKNOWN_LETTER_WEIGHT = ARABIC_ALPHABET_ORDER.length;

const TASHKEEL_PATTERN = /[\u064B-\u0652\u0670\u06D6-\u06ED]/g;

/** Exported so search (Graduates.tsx) can match text using the same
 * alif/hamzah/tashkeel normalization as sorting — a search for "احمد"
 * (plain alif) should still find "أحمد" (hamza-on-alif). */
export function normalizeArabic(value: string): string {
  return value
    .replace(TASHKEEL_PATTERN, '')
    .replace(/[أإآٱ]/g, 'ا')
    .replace(/ى/g, 'ي')
    .replace(/ة/g, 'ه')
    .trim();
}

function weightOf(char: string): number {
  return LETTER_WEIGHT.get(char) ?? UNKNOWN_LETTER_WEIGHT;
}

/**
 * Ascending Arabic comparator: negative if `a` sorts before `b`.
 * Compares letter-by-letter using ARABIC_ALPHABET_ORDER; falls back
 * to plain codepoint comparison of the normalized strings once
 * alphabet position alone can't distinguish two names (e.g. a
 * shorter prefix of a longer name, or letters outside the 28-letter
 * list).
 */
export function compareArabic(a: string, b: string): number {
  const normA = normalizeArabic(a);
  const normB = normalizeArabic(b);

  const length = Math.min(normA.length, normB.length);
  for (let i = 0; i < length; i++) {
    const diff = weightOf(normA[i]) - weightOf(normB[i]);
    if (diff !== 0) return diff;
  }
  if (normA.length !== normB.length) return normA.length - normB.length;
  return normA < normB ? -1 : normA > normB ? 1 : 0;
}

export function compareArabicDescending(a: string, b: string): number {
  return -compareArabic(a, b);
}
