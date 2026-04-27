-- Fix Supabase Security Linter Warnings
-- Safe changes only: revoke public execute on SECURITY DEFINER functions
-- and add basic RLS policies for tables with RLS enabled but no policies.

-- 1. Revoke EXECUTE on SECURITY DEFINER functions from anon and authenticated
REVOKE EXECUTE ON FUNCTION public.get_user_role() FROM anon, authenticated;
REVOKE EXECUTE ON FUNCTION public.rls_auto_enable() FROM anon, authenticated;

-- 2. Add basic RLS policies for tables that have RLS enabled but no policies
-- These are restrictive "deny all via API" policies since Prisma uses the service role
-- which bypasses RLS entirely. This just locks down the Supabase REST API.

-- BlockedIP: only service role (backend) should access
CREATE POLICY "Service role only" ON public."BlockedIP"
  FOR ALL USING (false);

-- Inquiry: only service role (backend) should access
CREATE POLICY "Service role only" ON public."Inquiry"
  FOR ALL USING (false);

-- SecurityLog: only service role (backend) should access
CREATE POLICY "Service role only" ON public."SecurityLog"
  FOR ALL USING (false);
