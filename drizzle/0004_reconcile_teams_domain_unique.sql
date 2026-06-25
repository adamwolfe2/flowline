-- Reconcile teams.custom_dashboard_domain unique constraint naming.
--
-- Context: the live database already enforces uniqueness on
-- teams.custom_dashboard_domain, but the constraint was created via
-- `drizzle-kit push` under Postgres's default auto-name
-- ("teams_custom_dashboard_domain_key"). The Drizzle schema's `.unique()`
-- now expects the constraint to be named
-- "teams_custom_dashboard_domain_unique". This causes `drizzle-kit push`
-- to repeatedly offer to ADD a (redundant) constraint and prompt to
-- truncate the (non-empty) teams table.
--
-- This migration ONLY renames the EXISTING constraint. It is a catalog-only
-- operation: no rows are read, written, locked for rewrite, or truncated,
-- and uniqueness enforcement is never dropped. It is idempotent and safe to
-- run on any DB state:
--   * old "_key" constraint present, "_unique" absent -> rename it.
--   * "_unique" already present (e.g. a fresh DB built via push) -> no-op.
--   * neither present (unexpected/malformed DB) -> no-op here; the constraint
--     is then (re)created by the normal `drizzle-kit push` flow, not by a
--     table-locking ADD inside this reconciliation migration.
DO $$
BEGIN
  IF EXISTS (
    SELECT 1 FROM pg_constraint
    WHERE conname = 'teams_custom_dashboard_domain_key'
      AND conrelid = 'public.teams'::regclass
  ) AND NOT EXISTS (
    SELECT 1 FROM pg_constraint
    WHERE conname = 'teams_custom_dashboard_domain_unique'
      AND conrelid = 'public.teams'::regclass
  ) THEN
    ALTER TABLE "teams"
      RENAME CONSTRAINT "teams_custom_dashboard_domain_key"
      TO "teams_custom_dashboard_domain_unique";
  END IF;
END $$;
