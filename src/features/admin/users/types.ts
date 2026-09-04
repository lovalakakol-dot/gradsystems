export type UserRole = 'admin' | 'bendahara' | 'pendataan' | 'acara';

export const ROLE_LABELS: Record<UserRole, string> = {
  admin: 'Admin',
  bendahara: 'Bendahara',
  pendataan: 'Pendataan',
  acara: 'Acara',
};

export const ROLE_ORDER: UserRole[] = ['admin', 'bendahara', 'pendataan', 'acara'];

export interface UserProfile {
  id: string;
  username: string;
  full_name: string | null;
  role: UserRole;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

export type RoleFilterValue = 'all' | UserRole;
export type StatusFilterValue = 'all' | 'active' | 'inactive';

export interface UserFiltersState {
  search: string;
  role: RoleFilterValue;
  status: StatusFilterValue;
}

export const DEFAULT_USER_FILTERS: UserFiltersState = {
  search: '',
  role: 'all',
  status: 'all',
};

export interface CreateUserFormData {
  full_name: string;
  username: string;
  role: UserRole;
  password: string;
  confirm_password: string;
}

export interface CreateUserFormErrors {
  full_name?: string;
  username?: string;
  role?: string;
  password?: string;
  confirm_password?: string;
  form?: string;
}

export const EMPTY_CREATE_USER_FORM: CreateUserFormData = {
  full_name: '',
  username: '',
  role: 'acara',
  password: '',
  confirm_password: '',
};

/**
 * Client-side mirror of the create-user validation described in the
 * spec (required fields + password match). The server endpoint still
 * re-validates and is the actual source of truth — this only gives
 * fast feedback before a round trip.
 */
export function validateCreateUserForm(form: CreateUserFormData): CreateUserFormErrors {
  const errors: CreateUserFormErrors = {};

  if (!form.username.trim()) {
    errors.username = 'Username wajib diisi.';
  }

  if (!form.role) {
    errors.role = 'Role wajib dipilih.';
  }

  if (!form.password) {
    errors.password = 'Password wajib diisi.';
  } else if (form.password.length < 6) {
    errors.password = 'Password minimal 6 karakter.';
  }

  if (!form.confirm_password) {
    errors.confirm_password = 'Konfirmasi password wajib diisi.';
  } else if (form.password !== form.confirm_password) {
    errors.confirm_password = 'Konfirmasi password tidak cocok.';
  }

  return errors;
}
