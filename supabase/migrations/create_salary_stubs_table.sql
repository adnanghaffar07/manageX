-- Salary stubs (Matching your exact schema)
CREATE TABLE IF NOT EXISTS public.salary_stubs (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  employee_id UUID REFERENCES public.employees(id) ON DELETE CASCADE,
  month TEXT NOT NULL, -- e.g. '2025-01'
  basic_salary NUMERIC(10,2),
  allowances NUMERIC(10,2) DEFAULT 0,
  deductions NUMERIC(10,2) DEFAULT 0,
  net_salary NUMERIC(10,2),
  paid_on DATE,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Enable RLS
ALTER TABLE public.salary_stubs ENABLE ROW LEVEL SECURITY;

-- Drop existing policies if they exist so you can run this safely
DROP POLICY IF EXISTS "Users can view their own salary stubs" ON public.salary_stubs;
DROP POLICY IF EXISTS "Users can insert their own salary stubs" ON public.salary_stubs;
DROP POLICY IF EXISTS "Users can update their own salary stubs" ON public.salary_stubs;
DROP POLICY IF EXISTS "Users can delete their own salary stubs" ON public.salary_stubs;

-- Create policies based on the related employee's user_id since salary_stubs doesn't have a user_id column
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
