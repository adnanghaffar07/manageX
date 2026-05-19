-- ──────────────────────────────────────────────────────────
-- SENDERS
-- ──────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS public.senders (
    id               UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id          UUID REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL,
    name             TEXT NOT NULL,
    email            TEXT,
    phone            TEXT,
    address          TEXT,
    company_name     TEXT,
    website          TEXT,
    created_at       TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc', now()) NOT NULL
);

ALTER TABLE public.senders ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view their own senders"
    ON public.senders FOR SELECT
    USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own senders"
    ON public.senders FOR INSERT
    WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own senders"
    ON public.senders FOR UPDATE
    USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own senders"
    ON public.senders FOR DELETE
    USING (auth.uid() = user_id);

-- Add sender_id to invoices
ALTER TABLE public.invoices ADD COLUMN IF NOT EXISTS sender_id UUID REFERENCES public.senders(id) ON DELETE SET NULL;
