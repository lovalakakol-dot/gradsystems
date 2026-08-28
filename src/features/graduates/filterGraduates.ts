import { getCountryNameAr } from './countries';
import {
  ALL_COUNTRIES,
  ALL_SHIRT_SIZES,
  ALL_VERIFICATION_STATUSES,
  type GraduateEntry,
  type GraduateFiltersState,
  type SortOption,
} from './types';

function normalize(value: string): string {
  return value.trim().toLowerCase();
}

/**
 * Client-side search + filter, matching Section 8/9's requirement:
 * search looks at full_name_ar AND the Arabic country name derived
 * from country_code — never the raw code. Dataset is assumed
 * small/medium (loaded once, no server-side search).
 */
export function filterGraduates(
  entries: GraduateEntry[],
  filters: GraduateFiltersState
): GraduateEntry[] {
  const search = normalize(filters.search);

  return entries.filter((entry) => {
    if (filters.country !== ALL_COUNTRIES && entry.country_code !== filters.country) {
      return false;
    }
    if (filters.shirtSize !== ALL_SHIRT_SIZES && entry.shirt_size !== filters.shirtSize) {
      return false;
    }
    if (
      filters.verificationStatus !== ALL_VERIFICATION_STATUSES &&
      entry.verification_status !== filters.verificationStatus
    ) {
      return false;
    }

    if (search) {
      const nameMatch = normalize(entry.full_name_ar ?? '').includes(search);
      const countryMatch = normalize(getCountryNameAr(entry.country_code)).includes(search);
      if (!nameMatch && !countryMatch) return false;
    }

    return true;
  });
}

/**
 * A-Z / Z-A on full_name_ar, per Section 10 (only these two options
 * are offered — country sort was deliberately left out to avoid
 * over-adding filters/sorts beyond what was requested).
 */
export function sortGraduates(entries: GraduateEntry[], sort: SortOption): GraduateEntry[] {
  const sorted = [...entries].sort((a, b) =>
    (a.full_name_ar ?? '').localeCompare(b.full_name_ar ?? '', 'ar')
  );
  return sort === 'name_desc' ? sorted.reverse() : sorted;
}
