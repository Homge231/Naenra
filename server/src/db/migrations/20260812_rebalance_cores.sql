-- ============================================================================
-- NAENRA (ARENA.ENG) — Support Core Balance, Stats & Upgrade Path Parity
-- Date: 2026-08-12
-- Description: Updates descriptions, flat_buff, multiplier_buff, and upgrade paths
--              for Phoenix, High Roller, Aegis, Pandora, and all 10 Core Families
--              to enforce the +250 PTS Phoenix Debt Refund Cap & Tier Upgrade Links.
-- ============================================================================

BEGIN;

-- 1. Phoenix Family (Nerf Debt Refund Cap to +250 PTS Max & Link Upgrades)
UPDATE cores SET
  description = 'Accumulates all lost penalty points from skipped/wrong answers into a debt pool. Answering the next question correctly refunds 50% of accumulated debt (capped at +250 PTS max) + base points.',
  flat_buff = 0,
  multiplier_buff = 1.0,
  upgrades_to = '11111111-1111-1111-1111-444444444444'
WHERE id = '11111111-1111-1111-1111-111111111111' OR name ILIKE 'Phoenix';

UPDATE cores SET
  description = 'Refunds 10% debt (capped at +250 PTS) + 15 flat rebirth points.',
  flat_buff = 15,
  multiplier_buff = 1.0
WHERE name ILIKE 'Phoenix Flame';

UPDATE cores SET
  description = 'Refunds debt (capped at +250 PTS) + 20 flat rebirth points + grants 1 Aegis Shield upon rebirth.',
  flat_buff = 20,
  multiplier_buff = 1.0,
  upgrades_to = '11111111-1111-1111-1111-666666666666'
WHERE name ILIKE 'Rebirth';

UPDATE cores SET
  description = 'Refunds accumulated penalty debt (capped at +250 PTS) + gains +0.15x score multiplier per miss (Max 1.6x).',
  flat_buff = 0,
  multiplier_buff = 1.0,
  upgrades_to = '11111111-1111-1111-1111-777777777777'
WHERE id = '11111111-1111-1111-1111-444444444444' OR name ILIKE 'Ashes to Ashes';

UPDATE cores SET
  description = 'Refunds 50% of accumulated penalty debt (capped at +250 PTS) + 20% extra debt bonus + 40 flat rebirth points on next correct answer.',
  flat_buff = 40,
  multiplier_buff = 1.0
WHERE id = '11111111-1111-1111-1111-555555555555' OR name ILIKE 'Immortal Phoenix';

UPDATE cores SET
  description = 'Refunds accumulated penalty debt (capped at +250 PTS) + 10% extra debt bonus + 40 flat rebirth points + grants 2 protective Aegis Shields upon rebirth.',
  flat_buff = 40,
  multiplier_buff = 1.0
WHERE id = '11111111-1111-1111-1111-666666666666' OR name ILIKE 'Eternal Rebirth';

UPDATE cores SET
  description = 'Refunds accumulated penalty debt (capped at +250 PTS) + 10% extra debt bonus + gains +0.30x score multiplier per miss (Max 2.2x) + 30 flat rebirth points.',
  flat_buff = 30,
  multiplier_buff = 1.0
WHERE id = '11111111-1111-1111-1111-777777777777' OR name ILIKE 'Supernova Ashes';

UPDATE cores SET
  description = 'Consumes 1 mistake penalty and converts it into +15 flat bonus points on next correct answer.',
  flat_buff = 15,
  multiplier_buff = 1.0,
  upgrades_to = '11111111-1111-1111-1111-aaaaaaaaaaaa'
WHERE id = '11111111-1111-1111-1111-888888888888' OR name ILIKE 'Solar Ember';

UPDATE cores SET
  description = 'Recovering from a mistake grants 1 protective Aegis Shield stack.',
  flat_buff = 10,
  multiplier_buff = 1.0,
  upgrades_to = '11111111-1111-1111-1111-bbbbbbbbbbbb'
WHERE id = '11111111-1111-1111-1111-999999999999' OR name ILIKE 'Feather Shield';

UPDATE cores SET
  description = 'Refunds mistake debt (capped at +250 PTS) + 15% debt bonus + 30 flat rebirth points.',
  flat_buff = 30,
  multiplier_buff = 1.8
WHERE id = '11111111-1111-1111-1111-aaaaaaaaaaaa' OR name ILIKE 'Blazing Resurrection';

UPDATE cores SET
  description = 'Restores full score momentum on mistake recovery (capped at +250 PTS) + extends match timer by +3 seconds (+50 flat bonus).',
  flat_buff = 50,
  multiplier_buff = 2.0
WHERE id = '11111111-1111-1111-1111-bbbbbbbbbbbb' OR name ILIKE 'Phoenix Overlord';


-- 2. High Roller Family (Upgrade Path Linking)
UPDATE cores SET upgrades_to = '22222222-2222-2222-2222-111111111111' WHERE id = '22222222-2222-2222-2222-222222222222' OR name ILIKE 'High Roller';
UPDATE cores SET upgrades_to = '22222222-2222-2222-2222-555555555555' WHERE id = '22222222-2222-2222-2222-111111111111' OR name ILIKE 'Jackpot';
UPDATE cores SET upgrades_to = '22222222-2222-2222-2222-666666666666' WHERE id = '22222222-2222-2222-2222-333333333333' OR name ILIKE 'Safe Bet';
UPDATE cores SET upgrades_to = '22222222-2222-2222-2222-777777777777' WHERE id = '22222222-2222-2222-2222-444444444444' OR name ILIKE 'Double or Nothing';
UPDATE cores SET upgrades_to = '22222222-2222-2222-2222-aaaaaaaaaaaa' WHERE id = '22222222-2222-2222-2222-888888888888' OR name ILIKE 'Lucky Seven';
UPDATE cores SET upgrades_to = '22222222-2222-2222-2222-bbbbbbbbbbbb' WHERE id = '22222222-2222-2222-2222-999999999999' OR name ILIKE 'High Stakes';


-- 3. Aegis Shield Family (Balance Defense, Shield Reflection & Upgrade Links)
UPDATE cores SET
  description = 'Safety net. Correct answers stack shields (Max 3). Mistakes consume 1 shield instead of losing points.',
  flat_buff = 0,
  multiplier_buff = 1.0,
  upgrades_to = 'a368a054-1cd4-4334-b047-8745b35d0bbc'
WHERE id = '00000000-0000-0000-0000-000000000011' OR name ILIKE 'Aegis Shield';

UPDATE cores SET
  description = 'Stacks shields (Max 3). Mistakes consume 1 shield and grant +50 points instead of losing points.',
  flat_buff = 50,
  multiplier_buff = 1.0,
  upgrades_to = '938574d6-9710-424f-8132-dae1eb0cf978'
WHERE id = 'a368a054-1cd4-4334-b047-8745b35d0bbc' OR name ILIKE 'Reflective Aegis';

UPDATE cores SET
  description = 'Consuming a shield reflects mistake penalties and grants +100 bonus points (1.2x multiplier).',
  flat_buff = 100,
  multiplier_buff = 1.2,
  upgrades_to = '55555555-5555-5555-5555-999999999999'
WHERE id = '55555555-5555-5555-5555-888888888888' OR name ILIKE 'Reflective Barrier';

UPDATE cores SET
  description = 'Generates 1 free Aegis Shield every 3 correct answers (Max 6 shields, 1.5x multiplier).',
  flat_buff = 0,
  multiplier_buff = 1.5
WHERE id = '55555555-5555-5555-5555-999999999999' OR name ILIKE 'Aegis Sanctuary';

UPDATE cores SET
  description = 'Stacks shields (Max 5). When at maximum shields, all points earned are doubled (2.0x multiplier).',
  flat_buff = 0,
  multiplier_buff = 2.0
WHERE id = '938574d6-9710-424f-8132-dae1eb0cf978' OR name ILIKE 'Bastion of Light';


-- 4. Pandora's Box Family (Chaotic Shape-shifting Balance & Upgrade Links)
UPDATE cores SET
  description = 'Shape-shifts every 25 seconds into Main (Tier 1) cores. Correct answers yield +150 to +350 chaos bonus points.',
  flat_buff = 150,
  multiplier_buff = 1.0,
  upgrades_to = '71f142d9-403f-4754-a03c-b05a5e3c9104'
WHERE id = '00000000-0000-0000-0000-000000000010' OR name ILIKE 'Pandora''s Box';

UPDATE cores SET
  description = 'Shape-shifts every 20s. Skips & wrong answers incur 0 penalty, correct answers grant 1.5x score multiplier.',
  flat_buff = 0,
  multiplier_buff = 1.5,
  upgrades_to = '498ce817-d442-47fa-a8b1-e90ca6516202'
WHERE id = '71f142d9-403f-4754-a03c-b05a5e3c9104' OR name ILIKE 'Trickster''s Glass';

UPDATE cores SET
  description = 'Shape-shifts every 15s. 50% chance to grant +100~+500 flat points per answer, 50% chance to forgive wrong answers.',
  flat_buff = 200,
  multiplier_buff = 1.0,
  upgrades_to = '33333333-3333-3333-3333-999999999999'
WHERE id = '33333333-3333-3333-3333-888888888888' OR name ILIKE 'Wild Card';

UPDATE cores SET
  description = 'Shape-shifts every 15s. Every correct answer grants a random bonus between +200 and +800 points.',
  flat_buff = 200,
  multiplier_buff = 1.0
WHERE id = '498ce817-d442-47fa-a8b1-e90ca6516202' OR name ILIKE 'Chaos Theory';

UPDATE cores SET
  description = 'Shape-shifts every 15s into Main cores. Correct answers give +800 flat bonus points, wrong answers cost 0 penalty.',
  flat_buff = 800,
  multiplier_buff = 1.0
WHERE id = '57d76088-82ff-4ef1-99d5-2234d319df6f' OR name ILIKE 'Pandora''s Wrath';

UPDATE cores SET
  description = 'Shape-shifts every 10s. Correct answers trigger 1.5x~4.0x random multiplier, wrong answers are 100% forgiven.',
  flat_buff = 0,
  multiplier_buff = 2.5
WHERE id = '33333333-3333-3333-3333-999999999999' OR name ILIKE 'Pandora Overdrive';


-- 5. Remaining Families Upgrade Path Links
UPDATE cores SET upgrades_to = '99999999-9999-9999-9999-999999999999' WHERE id = '99999999-9999-9999-9999-888888888888'; -- Contract Hunter -> Mission Legend
UPDATE cores SET upgrades_to = 'aaaaaaaa-aaaa-aaaa-aaaa-999999999999' WHERE id = 'aaaaaaaa-aaaa-aaaa-aaaa-888888888888'; -- Zen Momentum -> Serenity
UPDATE cores SET upgrades_to = '66666666-6666-6666-6666-999999999999' WHERE id = '66666666-6666-6666-6666-888888888888'; -- Overcharge -> Cataclysm
UPDATE cores SET upgrades_to = '77777777-7777-7777-7777-999999999999' WHERE id = '77777777-7777-7777-7777-888888888888'; -- Velocity Shield -> Hyperdrive
UPDATE cores SET upgrades_to = '88888888-8888-8888-8888-999999999999' WHERE id = '88888888-8888-8888-8888-888888888888'; -- Inner Eye -> Prophecy
UPDATE cores SET upgrades_to = '44444444-4444-4444-4444-999999999999' WHERE id = '44444444-4444-4444-4444-888888888888'; -- Combo Burst -> Hyper Combo

COMMIT;
