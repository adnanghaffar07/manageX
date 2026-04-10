-- Create documents table
CREATE TABLE IF NOT EXISTS public.documents (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL,
    name TEXT NOT NULL,
    storage_path TEXT NOT NULL,
    file_type TEXT,
    file_size BIGINT,
    category TEXT DEFAULT 'General',
    metadata JSONB DEFAULT '{}',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Enable RLS for table
ALTER TABLE public.documents ENABLE ROW LEVEL SECURITY;

-- Table Policies
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

-- Storage bucket setup (Optional: depends on Supabase internal permissions)
-- INSERT INTO storage.buckets (id, name, public) VALUES ('documents', 'documents', false);

-- Storage Policies (Enable these in Supabase UI or if database is permitted)
-- POLICY: Users can upload their own files
-- bucket_id = 'documents' AND (role = 'authenticated') AND (auth.uid()::text = (storage.foldername(name))[1])

-- POLICY: Users can access their own files
-- bucket_id = 'documents' AND (role = 'authenticated') AND (auth.uid()::text = (storage.foldername(name))[1])
