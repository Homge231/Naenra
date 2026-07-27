-- =============================================================================
-- NAENRA SUPABASE MIGRATION: UPDATE PHOENIX CORE DESCRIPTIONS (HYBRID REBIRTH MECHANIC)
-- Run this script in the Supabase SQL Editor to update Phoenix descriptions.
-- =============================================================================

BEGIN;

UPDATE cores 
SET description = 'Accumulates all lost penalty points from skipped/wrong answers into a debt pool. Answering the next question correctly refunds 100% of accumulated debt + base points.'
WHERE LOWER(name) = 'phoenix';

UPDATE cores 
SET description = 'Refunds 100% of accumulated penalty debt + 30% extra debt bonus + 50 flat rebirth points on next correct answer.'
WHERE LOWER(name) = 'phoenix flame';

UPDATE cores 
SET description = 'Refunds 100% of accumulated penalty debt + 75 flat rebirth points + grants 1 protective Aegis Shield upon rebirth.'
WHERE LOWER(name) = 'rebirth';

UPDATE cores 
SET description = 'Refunds 100% of accumulated penalty debt + gains +0.4x score multiplier per miss (Max 2.6x).'
WHERE LOWER(name) = 'ashes to ashes';

UPDATE cores 
SET description = 'Refunds 100% of accumulated penalty debt + 50% extra debt bonus + 150 flat rebirth points on next correct answer.'
WHERE LOWER(name) = 'immortal phoenix';

UPDATE cores 
SET description = 'Refunds 100% of accumulated penalty debt + 25% extra debt bonus + 150 flat rebirth points + grants 2 protective Aegis Shields upon rebirth.'
WHERE LOWER(name) = 'eternal rebirth';

UPDATE cores 
SET description = 'Refunds 100% of accumulated penalty debt + 25% extra debt bonus + gains +0.8x score multiplier per miss (Max 4.2x) + 100 flat rebirth points.'
WHERE LOWER(name) = 'supernova ashes';

COMMIT;
