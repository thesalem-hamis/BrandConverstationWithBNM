-- ============================================================
-- OPTIONAL: Auto-send confirmation emails via database trigger
-- ============================================================
-- Only run this AFTER:
--   1. The registrations table exists (run 001_create_registrations.sql first)
--   2. The send-confirmation-email edge function is deployed
--
-- If you prefer, the app already sends emails via a direct frontend
-- call after insert — so this trigger is optional.
-- ============================================================

CREATE EXTENSION IF NOT EXISTS pg_net;

CREATE OR REPLACE FUNCTION notify_registration_email()
RETURNS TRIGGER AS $$
DECLARE
  function_url TEXT := 'https://qlqbkjnnewaihrbpsiqw.supabase.co/functions/v1/send-confirmation-email';
  anon_key TEXT := 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InFscWJram5uZXdhaWhyYnBzaXF3Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODgyMDY4NDYsImV4cCI6MjEwMzc4Mjg0Nn0.bgihWabgoaoiZAitiERovhBgyOVXkm2fZjIZ47NWXXA';
BEGIN
  PERFORM net.http_post(
    function_url,
    'application/json',
    jsonb_build_object(
      'email', NEW.email,
      'first_name', NEW.first_name,
      'second_name', NEW.second_name
    )::text,
    jsonb_build_object('Authorization', 'Bearer ' || anon_key)::text
  );
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trg_registration_email ON public.registrations;
CREATE TRIGGER trg_registration_email
AFTER INSERT ON public.registrations
FOR EACH ROW EXECUTE FUNCTION notify_registration_email();