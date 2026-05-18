-- ============================================================
-- ManageX — Complete Production Schema
-- Run this entirely in: Supabase Dashboard → SQL Editor
-- Project: CodeAutomationManageX (PROD)
-- ============================================================

-- ──────────────────────────────────────────────────────────
-- 1. PROFILES  (mirrors auth.users, created automatically on sign-up)
-- ──────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS public.profiles (
    id          UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
    full_name   TEXT,
    company_name TEXT,
    email       TEXT,
    phone       TEXT,
    address     TEXT,
    created_at  TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc', now()) NOT NULL
);

ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view their own profile"
    ON public.profiles FOR SELECT
    USING (auth.uid() = id);

CREATE POLICY "Users can insert their own profile"
    ON public.profiles FOR INSERT
    WITH CHECK (auth.uid() = id);

CREATE POLICY "Users can update their own profile"
    ON public.profiles FOR UPDATE
    USING (auth.uid() = id);

-- Auto-create a profile row whenever a new user signs up
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
    INSERT INTO public.profiles (id, email)
    VALUES (NEW.id, NEW.email)
    ON CONFLICT (id) DO NOTHING;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
    AFTER INSERT ON auth.users
    FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();


-- ──────────────────────────────────────────────────────────
-- 2. CLIENTS
-- ──────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS public.clients (
    id               UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id          UUID REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL,
    name             TEXT NOT NULL,
    first_name       TEXT,
    last_name        TEXT,
    company_name     TEXT,
    email            TEXT,
    phone            TEXT,
    address          TEXT,
    address_line_1   TEXT,
    address_line_2   TEXT,
    city             TEXT,
    postal_code      TEXT,
    country          TEXT,
    website          TEXT,
    invoice_currency TEXT,
    additional_info  TEXT,
    custom_fields    JSONB DEFAULT '{}',
    created_at       TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc', now()) NOT NULL
);

ALTER TABLE public.clients ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view their own clients"
    ON public.clients FOR SELECT
    USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own clients"
    ON public.clients FOR INSERT
    WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own clients"
    ON public.clients FOR UPDATE
    USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own clients"
    ON public.clients FOR DELETE
    USING (auth.uid() = user_id);


-- ──────────────────────────────────────────────────────────
-- 3. INVOICES
-- ──────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS public.invoices (
    id             UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id        UUID REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL,
    client_id      UUID REFERENCES public.clients(id) ON DELETE SET NULL,
    invoice_number TEXT NOT NULL,
    status         TEXT DEFAULT 'draft' CHECK (status IN ('draft', 'sent', 'paid', 'overdue')),
    issue_date     DATE NOT NULL,
    due_date       DATE,
    subtotal       NUMERIC(10,2) DEFAULT 0,
    tax_rate       NUMERIC(5,2)  DEFAULT 0,
    total          NUMERIC(10,2) DEFAULT 0,
    notes          TEXT,
    created_at     TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc', now()) NOT NULL
);

ALTER TABLE public.invoices ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view their own invoices"
    ON public.invoices FOR SELECT
    USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own invoices"
    ON public.invoices FOR INSERT
    WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own invoices"
    ON public.invoices FOR UPDATE
    USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own invoices"
    ON public.invoices FOR DELETE
    USING (auth.uid() = user_id);


-- ──────────────────────────────────────────────────────────
-- 4. INVOICE ITEMS
-- ──────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS public.invoice_items (
    id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    invoice_id  UUID REFERENCES public.invoices(id) ON DELETE CASCADE NOT NULL,
    description TEXT NOT NULL,
    quantity    NUMERIC(10,2) DEFAULT 1,
    unit_price  NUMERIC(10,2) DEFAULT 0,
    amount      NUMERIC(10,2) DEFAULT 0
);

ALTER TABLE public.invoice_items ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view their own invoice items"
    ON public.invoice_items FOR SELECT
    USING (
        EXISTS (
            SELECT 1 FROM public.invoices
            WHERE invoices.id = invoice_items.invoice_id
            AND invoices.user_id = auth.uid()
        )
    );

CREATE POLICY "Users can insert their own invoice items"
    ON public.invoice_items FOR INSERT
    WITH CHECK (
        EXISTS (
            SELECT 1 FROM public.invoices
            WHERE invoices.id = invoice_id
            AND invoices.user_id = auth.uid()
        )
    );

CREATE POLICY "Users can update their own invoice items"
    ON public.invoice_items FOR UPDATE
    USING (
        EXISTS (
            SELECT 1 FROM public.invoices
            WHERE invoices.id = invoice_items.invoice_id
            AND invoices.user_id = auth.uid()
        )
    );

CREATE POLICY "Users can delete their own invoice items"
    ON public.invoice_items FOR DELETE
    USING (
        EXISTS (
            SELECT 1 FROM public.invoices
            WHERE invoices.id = invoice_items.invoice_id
            AND invoices.user_id = auth.uid()
        )
    );


-- ──────────────────────────────────────────────────────────
-- 5. EMPLOYEES
-- ──────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS public.employees (
    id           UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id      UUID REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL,
    full_name    TEXT NOT NULL,
    email        TEXT,
    phone_number TEXT,
    address      TEXT,
    city         TEXT,
    postal_code  TEXT,
    country      TEXT,
    job_title    TEXT,
    salary       NUMERIC,
    joining_date DATE,
    status       TEXT DEFAULT 'active',
    created_at   TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc', now()) NOT NULL,
    updated_at   TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc', now()) NOT NULL
);

ALTER TABLE public.employees ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view their own employees"
    ON public.employees FOR SELECT
    USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own employees"
    ON public.employees FOR INSERT
    WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own employees"
    ON public.employees FOR UPDATE
    USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own employees"
    ON public.employees FOR DELETE
    USING (auth.uid() = user_id);

CREATE OR REPLACE FUNCTION update_employees_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = timezone('utc', now());
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS update_employees_updated_at ON public.employees;
CREATE TRIGGER update_employees_updated_at
    BEFORE UPDATE ON public.employees
    FOR EACH ROW EXECUTE FUNCTION update_employees_updated_at();


-- ──────────────────────────────────────────────────────────
-- 6. DOCUMENTS
-- ──────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS public.documents (
    id           UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id      UUID REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL,
    name         TEXT NOT NULL,
    storage_path TEXT NOT NULL,
    file_type    TEXT,
    file_size    BIGINT,
    category     TEXT DEFAULT 'General',
    metadata     JSONB DEFAULT '{}',
    created_at   TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc', now()) NOT NULL,
    updated_at   TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc', now()) NOT NULL
);

ALTER TABLE public.documents ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view their own documents"
    ON public.documents FOR SELECT
    USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own documents metadata"
    ON public.documents FOR INSERT
    WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own documents metadata"
    ON public.documents FOR UPDATE
    USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own documents metadata"
    ON public.documents FOR DELETE
    USING (auth.uid() = user_id);


-- ──────────────────────────────────────────────────────────
-- 7. PROJECTS
-- ──────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS public.projects (
    id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id     UUID REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL,
    client_id   UUID REFERENCES public.clients(id) ON DELETE SET NULL,
    name        TEXT NOT NULL,
    description TEXT,
    start_date  DATE,
    end_date    DATE,
    budget      NUMERIC DEFAULT 0,
    status      TEXT DEFAULT 'todo' CHECK (status IN ('todo', 'in_progress', 'on_hold', 'completed')),
    priority    TEXT DEFAULT 'medium' CHECK (priority IN ('low', 'medium', 'high')),
    created_at  TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc', now()) NOT NULL,
    updated_at  TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc', now()) NOT NULL
);

ALTER TABLE public.projects ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view their own projects"
    ON public.projects FOR SELECT
    USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own projects"
    ON public.projects FOR INSERT
    WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own projects"
    ON public.projects FOR UPDATE
    USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own projects"
    ON public.projects FOR DELETE
    USING (auth.uid() = user_id);

CREATE OR REPLACE FUNCTION update_projects_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = timezone('utc', now());
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS update_projects_updated_at ON public.projects;
CREATE TRIGGER update_projects_updated_at
    BEFORE UPDATE ON public.projects
    FOR EACH ROW EXECUTE FUNCTION update_projects_updated_at();


-- ──────────────────────────────────────────────────────────
-- 8. SALARY STUBS
-- ──────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS public.salary_stubs (
    id           UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    employee_id  UUID REFERENCES public.employees(id) ON DELETE CASCADE,
    month        TEXT NOT NULL,
    basic_salary NUMERIC(10,2),
    allowances   NUMERIC(10,2) DEFAULT 0,
    deductions   NUMERIC(10,2) DEFAULT 0,
    net_salary   NUMERIC(10,2),
    paid_on      DATE,
    created_at   TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc', now()) NOT NULL
);

ALTER TABLE public.salary_stubs ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view their own salary stubs"
    ON public.salary_stubs FOR SELECT
    USING (
        EXISTS (
            SELECT 1 FROM public.employees
            WHERE employees.id = salary_stubs.employee_id
            AND employees.user_id = auth.uid()
        )
    );

CREATE POLICY "Users can insert their own salary stubs"
    ON public.salary_stubs FOR INSERT
    WITH CHECK (
        EXISTS (
            SELECT 1 FROM public.employees
            WHERE employees.id = employee_id
            AND employees.user_id = auth.uid()
        )
    );

CREATE POLICY "Users can update their own salary stubs"
    ON public.salary_stubs FOR UPDATE
    USING (
        EXISTS (
            SELECT 1 FROM public.employees
            WHERE employees.id = salary_stubs.employee_id
            AND employees.user_id = auth.uid()
        )
    );

CREATE POLICY "Users can delete their own salary stubs"
    ON public.salary_stubs FOR DELETE
    USING (
        EXISTS (
            SELECT 1 FROM public.employees
            WHERE employees.id = salary_stubs.employee_id
            AND employees.user_id = auth.uid()
        )
    );


-- ──────────────────────────────────────────────────────────
-- 9. STORAGE BUCKET for documents
-- ──────────────────────────────────────────────────────────
INSERT INTO storage.buckets (id, name, public)
VALUES ('documents', 'documents', false)
ON CONFLICT (id) DO NOTHING;

-- Allow authenticated users to upload to their own folder
CREATE POLICY "Users can upload their own documents"
    ON storage.objects FOR INSERT
    TO authenticated
    WITH CHECK (
        bucket_id = 'documents'
        AND (storage.foldername(name))[1] = auth.uid()::text
    );

CREATE POLICY "Users can read their own documents"
    ON storage.objects FOR SELECT
    TO authenticated
    USING (
        bucket_id = 'documents'
        AND (storage.foldername(name))[1] = auth.uid()::text
    );

CREATE POLICY "Users can delete their own documents"
    ON storage.objects FOR DELETE
    TO authenticated
    USING (
        bucket_id = 'documents'
        AND (storage.foldername(name))[1] = auth.uid()::text
    );
