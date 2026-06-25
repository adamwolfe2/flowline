-- Reconcile teams.custom_dashboard_domain unique constraint naming on the
-- legacy, `drizzle-kit push`-built production database.
--
-- Context: fresh, migrate-built databases now get the column AND the unique
-- constraint with its canonical name ("teams_custom_dashboard_domain_unique")
-- directly from migration 0004. The live production database, however, was
-- built via `drizzle-kit push` before migrations existed, so its constraint
-- carries Postgres's default auto-name ("teams_custom_dashboard_domain_key").
-- The Drizzle schema's `.unique()` expects the "_unique" name, which causes
-- `drizzle-kit push` to repeatedly offer to ADD a (redundant) constraint and
-- prompt to truncate the (non-empty) teams table.
--
-- This migration ONLY renames the EXISTING constraint when the legacy "_key"
-- name is present and the canonical "_unique" name is absent. It is a
-- catalog-only operation: no rows are read, written, locked for rewrite, or
-- truncated, and uniqueness enforcement is never dropped. It is idempotent and
-- safe to run on any DB state:
--   * legacy "_key" constraint present, "_unique" absent -> rename it (prod).
--   * "_unique" already present (e.g. a fresh migrate-built DB) -> no-op.
--   * neither present (unexpected/malformed DB) -> no-op.
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
