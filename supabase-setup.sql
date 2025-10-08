-- SQL Script to create tetraccess table in Supabase
-- Run this in your Supabase SQL Editor

-- Create the tetraccess table
CREATE TABLE IF NOT EXISTS public.tetraccess (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    email TEXT NOT NULL UNIQUE,
    access_token TEXT,
    refresh_token TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Create an index on email for faster lookups
CREATE INDEX IF NOT EXISTS tetraccess_email_idx ON public.tetraccess(email);

-- IMPORTANT: We're using the Service Role Key on the server side
-- which bypasses RLS, so RLS policies are optional for this setup.
-- Keeping RLS disabled for simplicity since all operations are server-side.

-- If you want to enable RLS for additional security:
-- ALTER TABLE public.tetraccess ENABLE ROW LEVEL SECURITY;

-- Example RLS policies (optional - only if you enable RLS above):
-- CREATE POLICY "Service role can do everything" ON public.tetraccess
--     FOR ALL
--     USING (true)
--     WITH CHECK (true);

-- Create a function to automatically update the updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = timezone('utc'::text, now());
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Create a trigger to call the function on updates
CREATE TRIGGER update_tetraccess_updated_at BEFORE UPDATE
    ON public.tetraccess
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

-- Grant permissions (adjust as needed for your use case)
-- Note: If you're using service role key in your backend, you may not need these
-- GRANT ALL ON public.tetraccess TO authenticated;
-- GRANT SELECT ON public.tetraccess TO anon;

