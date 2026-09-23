-- ============================================================
-- Brand Conversations with BNM - Supabase Schema
-- ============================================================
-- 1. Paste the ENTIRE script below
-- 2. Click "Run" in the Supabase SQL Editor:
--    https://app.supabase.com/project/qlqbkjnnewaihrbpsiqw/sql
-- ============================================================

-- ============================================================
-- 1. Create the registrations table
--    Matches the Registration type in src/types/registration.ts
-- ============================================================
CREATE TABLE IF NOT EXISTS public.registrations (
  id                  UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  first_name          TEXT NOT NULL,
  second_name         TEXT NOT NULL,
  email               TEXT NOT NULL,
  phone               TEXT NOT NULL,
  country             TEXT NOT NULL,
  business_profession TEXT NOT NULL,
  has_challenge       TEXT NOT NULL CHECK (has_challenge IN ('yes', 'no')),
  challenge_description TEXT,
  created_at          TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- ============================================================
-- 2. Realtime: make the table available for live subscriptions
--    (required for the /request-answers admin dashboard)
-- ============================================================
ALTER TABLE public.registrations REPLICA IDENTITY FULL;
ALTER PUBLICATION supabase_realtime ADD TABLE public.registrations;

-- ============================================================
-- 3. Index: speed up date-ordered fetches
-- ============================================================
CREATE INDEX IF NOT EXISTS idx_registrations_created_at
  ON public.registrations (created_at DESC);