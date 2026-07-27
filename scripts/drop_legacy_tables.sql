-- =============================================================================
-- NAENRA SUPABASE MIGRATION: DROP LEGACY / UNUSED TABLES
-- Run this script in the Supabase SQL Editor to delete the 4 unused tables.
-- =============================================================================

BEGIN;

-- 1. Drop round results table (replaced by game_sessions + matchStore)
DROP TABLE IF EXISTS round_results CASCADE;
DROP TABLE IF EXISTS "round_results" CASCADE;
DROP TABLE IF EXISTS "round-result" CASCADE;

-- 2. Drop player inventory table (replaced by dynamic core family tree queries)
DROP TABLE IF EXISTS player_inventory CASCADE;
DROP TABLE IF EXISTS "player_inventory" CASCADE;
DROP TABLE IF EXISTS "player-inventory" CASCADE;

-- 3. Drop pending registrations table (handled in-memory via Node backend OTP TTL)
DROP TABLE IF EXISTS pending_registrations CASCADE;
DROP TABLE IF EXISTS "pending_registrations" CASCADE;
DROP TABLE IF EXISTS "pending-registrations" CASCADE;

-- 4. Drop legacy matches table (replaced by game_sessions & Colyseus MatchRoom)
DROP TABLE IF EXISTS matches CASCADE;
DROP TABLE IF EXISTS "matches" CASCADE;

COMMIT;
