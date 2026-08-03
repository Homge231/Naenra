-- =============================================================================
-- NAENRA UNLOCK MISSIONS & USER PROGRESS SCHEMA MIGRATION
-- =============================================================================

BEGIN;

-- 1. Create `core_missions` table defining unlock requirements for Upgrade Cores
CREATE TABLE IF NOT EXISTS core_missions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  core_id UUID NOT NULL REFERENCES cores(id) ON DELETE CASCADE,
  mission_type VARCHAR(50) NOT NULL, -- e.g. 'max_combo', 'shields_used', 'matches_played', 'words_typed', 'elo_threshold'
  target_value INT NOT NULL DEFAULT 1,
  description TEXT NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  CONSTRAINT unique_core_mission UNIQUE(core_id)
);

-- 2. Create `user_core_progress` table tracking per-user progress and unlock state
CREATE TABLE IF NOT EXISTS user_core_progress (
  user_id UUID NOT NULL REFERENCES players(id) ON DELETE CASCADE,
  core_id UUID NOT NULL REFERENCES cores(id) ON DELETE CASCADE,
  current_progress INT DEFAULT 0,
  is_unlocked BOOLEAN DEFAULT false,
  unlocked_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  PRIMARY KEY (user_id, core_id)
);

-- 3. Indexes for fast query performance
CREATE INDEX IF NOT EXISTS idx_user_core_progress_user_id ON user_core_progress(user_id);
CREATE INDEX IF NOT EXISTS idx_user_core_progress_unlocked ON user_core_progress(user_id, is_unlocked);
CREATE INDEX IF NOT EXISTS idx_core_missions_core_id ON core_missions(core_id);

-- 4. Attach updated_at triggers
DROP TRIGGER IF EXISTS set_core_missions_updated_at ON core_missions;
CREATE TRIGGER set_core_missions_updated_at
BEFORE UPDATE ON core_missions
FOR EACH ROW EXECUTE FUNCTION update_timestamp_column();

DROP TRIGGER IF EXISTS set_user_core_progress_updated_at ON user_core_progress;
CREATE TRIGGER set_user_core_progress_updated_at
BEFORE UPDATE ON user_core_progress
FOR EACH ROW EXECUTE FUNCTION update_timestamp_column();

COMMIT;
