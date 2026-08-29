import { createClient } from '../../lib/supabase/server';
import type { GraduateEntry } from './types';

/**
 * Fetches the full graduates list. RLS (graduates_select_pendataan)
 * scopes this to an active pendataan user automatically — no
 * additional role check needed here. Ordered by created_at so the
 * result is deterministic; the UI applies its own A-Z/Z-A/No. Peserta
 * sort on top of this regardless (see utils/filterGraduates.ts).
 *
 * `.returns<GraduateEntry[]>()` overrides the inferred row type for
 * THIS query only. We use it instead of the old
 * `.from<'graduates', GraduateTable>('graduates')` override because
 * that pattern requires 'graduates' to already be a known key in the
 * generated `Database` type (database.types.ts) — since that file
 * hasn't been regenerated since participant_number/whatsapp_number
 * were added, TypeScript can't match 'graduates' there, so the
 * generic collapses to `never` and breaks both the `.from()` call and
 * the `entries` return type below.
 *
 * TODO: once database.types.ts is regenerated to include the current
 * graduates schema, this `.returns<GraduateEntry[]>()` override (and
 * the GraduateTable type it replaces) becomes unnecessary — a plain
 * `.from('graduates').select('*')` will infer correctly on its own.
 */
export async function getGraduates(): Promise<{
  entries: GraduateEntry[];
  hasError: boolean;
}> {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from('graduates')
    .select('*')
    .order('created_at', { ascending: true })
    .returns<GraduateEntry[]>();

  if (error) {
    console.error('Failed to load graduates', error);
    return { entries: [], hasError: true };
  }
  return { entries: data ?? [], hasError: false };
}