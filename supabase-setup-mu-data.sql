-- SQL Script to setup MU_data table in Supabase
-- This matches the user's actual schema
-- Run this in your Supabase SQL Editor

-- Create the MU_data table if it doesn't exist
CREATE TABLE IF NOT EXISTS public."MU_data" (
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  email text NOT NULL,
  access_token text NULL,
  refresh_token text NULL,
  created_at timestamp with time zone NOT NULL DEFAULT timezone('utc'::text, now()),
  updated_at timestamp with time zone NOT NULL DEFAULT timezone('utc'::text, now()),
  CONSTRAINT tetraccess_pkey PRIMARY KEY (id),
  CONSTRAINT tetraccess_email_key UNIQUE (email)
) TABLESPACE pg_default;

-- Create index on email
CREATE INDEX IF NOT EXISTS tetraccess_email_idx ON public."MU_data" USING btree (email) TABLESPACE pg_default;

-- Create or replace the update trigger function
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = timezone('utc'::text, now());
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Create the trigger
DROP TRIGGER IF EXISTS update_tetraccess_updated_at ON public."MU_data";
CREATE TRIGGER update_tetraccess_updated_at BEFORE UPDATE
    ON public."MU_data"
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

-- IMPORTANT: Disable RLS for MU_data table since we're using Service Role Key
-- This allows the backend to insert/update records without RLS blocking
ALTER TABLE public."MU_data" DISABLE ROW LEVEL SECURITY;

-- Optional: If you want to enable RLS, uncomment the line below
-- and create appropriate policies
-- ALTER TABLE public."MU_data" ENABLE ROW LEVEL SECURITY;

