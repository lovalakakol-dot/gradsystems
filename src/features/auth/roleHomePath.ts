import type { UserRole } from '../../types/database.types';

/** No generic dashboard — every role redirects to its own home. */
export function roleHomePath(role: UserRole): string {
  switch (role) {
    case 'admin':
      return '/admin';
    case 'bendahara':
      return '/bendahara';
    case 'pendataan':
      return '/pendataan';
    case 'acara':
      return '/acara';
  }
}