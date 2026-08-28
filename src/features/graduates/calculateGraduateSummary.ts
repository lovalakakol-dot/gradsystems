import { getCountryNameAr } from './countries';
import type { CountryCount, GraduateEntry, GraduateSummary } from './types';

/**
 * Always computed from the COMPLETE dataset passed in, regardless of
 * whatever search/filter/sort the table currently applies — same
 * convention as Cashbook's summary. Callers must pass the full
 * unfiltered list, not the displayed subset.
 *
 * Only countries with at least one graduate appear in byCountry,
 * sorted by count descending (ties broken alphabetically by Arabic
 * name) — never a zero-count row for every possible country.
 */
export function calculateGraduateSummary(entries: GraduateEntry[]): GraduateSummary {
  const countryCounts = new Map<string, number>();
  let totalLarge = 0;
  let totalSmall = 0;

  for (const entry of entries) {
    if (entry.country_code) {
      countryCounts.set(entry.country_code, (countryCounts.get(entry.country_code) ?? 0) + 1);
    }
    if (entry.shirt_size === 'large') totalLarge += 1;
    if (entry.shirt_size === 'small') totalSmall += 1;
  }

  const byCountry: CountryCount[] = Array.from(countryCounts.entries())
    .map(([countryCode, count]) => ({
      countryCode,
      countryNameAr: getCountryNameAr(countryCode),
      count,
    }))
    .sort((a, b) => b.count - a.count || a.countryNameAr.localeCompare(b.countryNameAr, 'ar'));

  return {
    totalParticipants: entries.length,
    byCountry,
    totalLarge,
    totalSmall,
  };
}
