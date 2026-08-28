-- supabase/migrations/20260125000000_create_cashbook_entries.sql
-- Migration: Create cashbook_entries table for Buku Kas Digital
-- Timestamp: 2026-01-25

CREATE TABLE IF NOT EXISTS public.cashbook_entries (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    transaction_date DATE NOT NULL,
    type TEXT NOT NULL CHECK (type IN ('income', 'expense')),
    category TEXT NOT NULL,
    description TEXT NOT NULL,
    division TEXT NOT NULL CHECK (division IN (
        'Badan Pengurus Harian',
        'Divisi Acara',
        'Divisi Pendataan',
        'Divisi Media',
        'Divisi Humas',
        'Divisi Logistik'
    )),
    amount NUMERIC(15, 2) NOT NULL CHECK (amount > 0),
    currency TEXT NOT NULL CHECK (currency IN ('EGP', 'IDR')),
    payment_method TEXT NOT NULL DEFAULT 'Tidak dicatat',
    pic TEXT,
    attachment_url TEXT,
    created_by UUID REFERENCES auth.users(id),
    updated_by UUID REFERENCES auth.users(id),
    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.cashbook_entries ENABLE ROW LEVEL SECURITY;

-- RLS Policies: Only bendahara can access
-- Policy: SELECT
CREATE POLICY cashbook_entries_select_policy ON public.cashbook_entries
    FOR SELECT
    USING (
        EXISTS (
            SELECT 1 FROM public.user_roles
            WHERE user_roles.user_id = auth.uid()
            AND user_roles.role = 'bendahara'
        )
    );

-- Policy: INSERT
CREATE POLICY cashbook_entries_insert_policy ON public.cashbook_entries
    FOR INSERT
    WITH CHECK (
        EXISTS (
            SELECT 1 FROM public.user_roles
            WHERE user_roles.user_id = auth.uid()
            AND user_roles.role = 'bendahara'
        )
    );

-- Policy: DELETE
CREATE POLICY cashbook_entries_delete_policy ON public.cashbook_entries
    FOR DELETE
    USING (
        EXISTS (
            SELECT 1 FROM public.user_roles
            WHERE user_roles.user_id = auth.uid()
            AND user_roles.role = 'bendahara'
        )
    );

-- Policy: UPDATE (if needed in the future)
CREATE POLICY cashbook_entries_update_policy ON public.cashbook_entries
    FOR UPDATE
    USING (
        EXISTS (
            SELECT 1 FROM public.user_roles
            WHERE user_roles.user_id = auth.uid()
            AND user_roles.role = 'bendahara'
        )
    )
    WITH CHECK (
        EXISTS (
            SELECT 1 FROM public.user_roles
            WHERE user_roles.user_id = auth.uid()
            AND user_roles.role = 'bendahara'
        )
    );

-- Triggers for updated_at
CREATE OR REPLACE FUNCTION public.update_cashbook_entries_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = now();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_cashbook_entries_updated_at
    BEFORE UPDATE ON public.cashbook_entries
    FOR EACH ROW
    EXECUTE FUNCTION public.update_cashbook_entries_updated_at();

-- Indexes for performance
CREATE INDEX idx_cashbook_entries_transaction_date ON public.cashbook_entries(transaction_date);
CREATE INDEX idx_cashbook_entries_division ON public.cashbook_entries(division);
CREATE INDEX idx_cashbook_entries_type ON public.cashbook_entries(type);
CREATE INDEX idx_cashbook_entries_currency ON public.cashbook_entries(currency);
CREATE INDEX idx_cashbook_entries_created_at ON public.cashbook_entries(created_at);