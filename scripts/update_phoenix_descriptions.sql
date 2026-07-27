-- =============================================================================
-- NAENRA SUPABASE MIGRATION: UPDATE PHOENIX CORE DESCRIPTIONS (NEW REBIRTH MECHANIC)
-- Run this script in the Supabase SQL Editor to update Phoenix descriptions.
-- =============================================================================

BEGIN;

UPDATE cores 
SET description = 'Accumulates all lost penalty points from skipped/wrong answers. Answering the next question correctly refunds 100% of accumulated debt + base points.'
WHERE LOWER(name) = 'phoenix';

UPDATE cores 
SET description = 'Refunds 100% of accumulated penalty debt + 25% debt bonus + 50 flat rebirth points on next correct answer.'
WHERE LOWER(name) = 'phoenix flame';

UPDATE cores 
SET description = 'Refunds 100% of accumulated penalty debt + reduces wrong answer penalties by 50%.'
WHERE LOWER(name) = 'rebirth';

UPDATE cores 
SET description = 'Refunds 100% of accumulated penalty debt + gains +0.5x score multiplier per miss (Max 3.0x).'
WHERE LOWER(name) = 'ashes to ashes';

UPDATE cores 
SET description = 'Refunds 100% of accumulated penalty debt + 50% debt bonus + 150 flat rebirth points on next correct answer.'
WHERE LOWER(name) = 'immortal phoenix';

UPDATE cores 
SET description = 'Refunds 100% of accumulated penalty debt + 100% debt bonus + 100% wrong penalty immunity (0 pts lost on miss).'
WHERE LOWER(name) = 'eternal rebirth';

UPDATE cores 
SET description = 'Refunds 100% of accumulated penalty debt + 50% debt bonus + gains +1.0x score multiplier per miss (Max 5.0x) + 100 flat rebirth points.'
WHERE LOWER(name) = 'supernova ashes';

COMMIT;
