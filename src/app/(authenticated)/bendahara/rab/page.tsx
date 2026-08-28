// src/app/(dashboard)/rab/page.tsx
import { createClient } from '@/lib/supabase/server';
import RABBuilder from './RabBuilder';

export default async function RABPage() {
  const supabase = await createClient();
  
  const { data: items, error } = await supabase
    .from('rab_items')
    .select('*')
    .order('created_at', { ascending: false });

  return (
    <RABBuilder 
      initialItems={items || []} 
      hasError={!!error} 
    />
  );
}