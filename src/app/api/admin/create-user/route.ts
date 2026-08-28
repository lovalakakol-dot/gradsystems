import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { createAdminClient } from '@/lib/supabase/admin';
import {
  isValidUsernameFormat,
  normalizeUsername,
  usernameToAuthEmail,
} from '@/features/auth/authEmail';

const ALLOWED_ROLES = ['admin', 'bendahara', 'pendataan', 'acara'] as const;
type Role = (typeof ALLOWED_ROLES)[number];

interface CreateUserBody {
  username: string;
  full_name: string;
  role: Role;
  password: string;
}

export async function POST(request: NextRequest) {
  // ------------------------------------------------------------
  // Step 1+2 — identify and authorize the caller.
  //
  // Regular cookie-aware server client, NOT the admin client.
  // profiles_select_own lets an authenticated user read their own
  // row regardless of is_active, so checking "is this caller an
  // active admin" needs no elevated privilege at all — the same
  // pattern established in the Desain Teknis stage.
  // ------------------------------------------------------------
  const supabase = await createClient();
  const {
    data: { user: callerUser },
  } = await supabase.auth.getUser();

  if (!callerUser) {
    return NextResponse.json({ error: 'Not authenticated' }, { status: 401 });
  }

  const { data: callerProfile } = await supabase
    .from('profiles')
    .select('role, is_active')
    .eq('id', callerUser.id)
    .maybeSingle();

  if (!callerProfile || callerProfile.role !== 'admin' || !callerProfile.is_active) {
    return NextResponse.json(
      { error: 'Only an active admin can create users' },
      { status: 403 }
    );
  }

  // ------------------------------------------------------------
  // Step 3 — validate input. The caller is already confirmed
  // admin above — `role` here is only "which of the 4 roles to
  // assign to the new user", never trusted as a privilege claim
  // about the CALLER.
  // ------------------------------------------------------------
  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: 'Invalid JSON body' }, { status: 400 });
  }

  if (typeof body !== 'object' || body === null) {
    return NextResponse.json({ error: 'Invalid input' }, { status: 400 });
  }

  const { username: rawUsername, full_name: rawFullName, role, password } =
    body as Partial<CreateUserBody>;

  if (
    typeof rawUsername !== 'string' ||
    typeof rawFullName !== 'string' ||
    typeof password !== 'string'
  ) {
    return NextResponse.json({ error: 'Invalid input' }, { status: 400 });
  }

  const username = normalizeUsername(rawUsername);
  if (!isValidUsernameFormat(username)) {
    return NextResponse.json(
      { error: 'Username harus 3-32 karakter, huruf kecil/angka/titik/underscore saja.' },
      { status: 400 }
    );
  }

  const fullName = rawFullName.trim();
  if (fullName.length === 0) {
    return NextResponse.json({ error: 'Nama lengkap wajib diisi.' }, { status: 400 });
  }

  if (!role || !ALLOWED_ROLES.includes(role)) {
    return NextResponse.json({ error: 'Role tidak valid.' }, { status: 400 });
  }

  if (password.length < 8) {
    return NextResponse.json({ error: 'Password minimal 8 karakter.' }, { status: 400 });
  }

  // ------------------------------------------------------------
  // Step 4 — privileged operations. Service role only from here.
  // ------------------------------------------------------------
  const adminClient = createAdminClient();
  const email = usernameToAuthEmail(username);

  const { data: created, error: createAuthError } = await adminClient.auth.admin.createUser({
    email,
    password,
    email_confirm: true, // synthetic address — never a real confirmation flow
  });

  if (createAuthError || !created?.user) {
    // auth.users.email is unique — this is how a duplicate
    // username surfaces first (email is derived 1:1 from
    // username).
    const message = createAuthError?.message?.toLowerCase() ?? '';
    if (message.includes('already') || message.includes('registered')) {
      return NextResponse.json({ error: 'Username sudah digunakan.' }, { status: 409 });
    }
    return NextResponse.json({ error: 'Gagal membuat akun.' }, { status: 500 });
  }

  const { data: profileRow, error: insertProfileError } = await adminClient
    .from('profiles')
    .insert({ id: created.user.id, username, full_name: fullName, role })
    .select('*')
    .single();

  if (insertProfileError) {
    // profiles.username is also UNIQUE — the second, authoritative
    // guard against a race between two concurrent provisioning
    // requests. Roll back the orphaned auth.users row on ANY
    // profile-insert failure — not just unique violations — so a
    // failed provisioning attempt never leaves a dangling
    // auth.users account with no matching profile.
    await adminClient.auth.admin.deleteUser(created.user.id);

    if (insertProfileError.code === '23505') {
      // PostgreSQL unique_violation. This is the only
      // profile-insert failure whose cause is safe to summarize
      // back to the client — and only as this fixed, generic
      // message, never the raw constraint/column name from the
      // database error.
      return NextResponse.json({ error: 'Username sudah digunakan.' }, { status: 409 });
    }

    // Any other failure — do not leak database internals to the
    // client, just log it server-side.
    console.error('Failed to insert profile after auth user creation', insertProfileError);
    return NextResponse.json({ error: 'Gagal membuat akun.' }, { status: 500 });
  }

  // audit_logs has zero INSERT policy for `authenticated` — this
  // only succeeds because adminClient carries the service role,
  // exactly as designed. actor_id comes from the caller verified
  // in Step 1, never from the request body.
  //
  // A failed audit log entry is NOT a reason to roll back the
  // auth user or profile that were already created successfully
  // above — provisioning itself succeeded. Logged server-side
  // only; the client never sees this detail either way.
  const { error: auditLogError } = await adminClient.from('audit_logs').insert({
    actor_id: callerUser.id,
    action: 'user.created',
    entity_type: 'profile',
    entity_id: created.user.id,
    metadata: { username, role },
  });

  if (auditLogError) {
    console.error('Failed to write audit log for user.created', auditLogError);
  }

  // Password is never included in the response — the admin who
  // called this already knows it, since they typed it.
  return NextResponse.json({ user: profileRow }, { status: 201 });
}