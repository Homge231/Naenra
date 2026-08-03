-- =============================================================================
-- NAENRA NEW BALANCED UPGRADE CORES INSERTION SCRIPT
-- =============================================================================

BEGIN;

-- 1. Phoenix Family New Upgrades
INSERT INTO cores (id, name, description, flat_buff, multiplier_buff, tier, core_type, classification, icon_url)
VALUES 
  ('11111111-1111-1111-1111-888888888888', 'Solar Ember', 'Consumes 1 mistake penalty and converts it into +100 flat bonus points on next correct answer.', 100, 1.0, 2, 'upgrade', 'effect', 'https://zowxktrpfqwpzckpnytu.supabase.co/storage/v1/object/public/core-icons/phoenix/phoenix-flame.svg'),
  ('11111111-1111-1111-1111-999999999999', 'Feather Shield', 'Recovering from a mistake grants 1 protective Aegis Shield stack.', 0, 1.0, 2, 'upgrade', 'effect', 'https://zowxktrpfqwpzckpnytu.supabase.co/storage/v1/object/public/core-icons/phoenix/rebirth.svg'),
  ('11111111-1111-1111-1111-aaaaaaaaaaaa', 'Blazing Resurrection', 'Refunds 100% of mistake debt + grants 2.0x score multiplier on the next 3 consecutive correct answers.', 150, 2.0, 3, 'upgrade', 'effect', 'https://zowxktrpfqwpzckpnytu.supabase.co/storage/v1/object/public/core-icons/phoenix/immortal-phoenix.svg'),
  ('11111111-1111-1111-1111-bbbbbbbbbbbb', 'Phoenix Overlord', 'Restores full score momentum on mistake recovery and extends match timer by +3 seconds.', 200, 1.5, 3, 'upgrade', 'effect', 'https://zowxktrpfqwpzckpnytu.supabase.co/storage/v1/object/public/core-icons/phoenix/supernova-ashes.svg')
ON CONFLICT (id) DO UPDATE SET 
  name = EXCLUDED.name, description = EXCLUDED.description, flat_buff = EXCLUDED.flat_buff, multiplier_buff = EXCLUDED.multiplier_buff, icon_url = EXCLUDED.icon_url;

-- 2. High Roller Family New Upgrades
INSERT INTO cores (id, name, description, flat_buff, multiplier_buff, tier, core_type, classification, icon_url)
VALUES 
  ('22222222-2222-2222-2222-888888888888', 'Lucky Seven', 'Every 7th correct answer triggers a guaranteed 3.0x score multiplier.', 100, 1.5, 2, 'upgrade', 'effect', 'https://zowxktrpfqwpzckpnytu.supabase.co/storage/v1/object/public/core-icons/highroller/jackpot.svg'),
  ('22222222-2222-2222-2222-999999999999', 'High Stakes', '60% chance to grant 2.5x points, 40% chance to deduct 20 points on wrong answer.', 0, 2.0, 2, 'upgrade', 'effect', 'https://zowxktrpfqwpzckpnytu.supabase.co/storage/v1/object/public/core-icons/highroller/safe-bet.svg'),
  ('22222222-2222-2222-2222-aaaaaaaaaaaa', 'Royal Flush', 'Maintaining a 5-streak in gamble mode triggers a massive +2000 flat jackpot!', 2000, 1.0, 3, 'upgrade', 'effect', 'https://zowxktrpfqwpzckpnytu.supabase.co/storage/v1/object/public/core-icons/highroller/all-in.svg'),
  ('22222222-2222-2222-2222-bbbbbbbbbbbb', 'Casino Empire', '80% chance for 2.0x multiplier and immunizes gamble losses on streak.', 300, 2.0, 3, 'upgrade', 'effect', 'https://zowxktrpfqwpzckpnytu.supabase.co/storage/v1/object/public/core-icons/highroller/house-advantage.svg')
ON CONFLICT (id) DO UPDATE SET 
  name = EXCLUDED.name, description = EXCLUDED.description, flat_buff = EXCLUDED.flat_buff, multiplier_buff = EXCLUDED.multiplier_buff, icon_url = EXCLUDED.icon_url;

-- 3. Pandora Family New Upgrades
INSERT INTO cores (id, name, description, flat_buff, multiplier_buff, tier, core_type, classification, icon_url)
VALUES 
  ('33333333-3333-3333-3333-888888888888', 'Wild Card', 'Shape-shifts every 15s. 50% chance to grant +200 flat points per answer.', 200, 1.0, 2, 'upgrade', 'effect', 'https://zowxktrpfqwpzckpnytu.supabase.co/storage/v1/object/public/core-icons/pandora/tricksters-glass.svg'),
  ('33333333-3333-3333-3333-999999999999', 'Pandora Overdrive', 'Shape-shifts every 10s. Every correct answer triggers a random multiplier between 1.5x and 3.5x.', 0, 2.5, 3, 'upgrade', 'effect', 'https://zowxktrpfqwpzckpnytu.supabase.co/storage/v1/object/public/core-icons/pandora/chaos-theory.svg')
ON CONFLICT (id) DO UPDATE SET 
  name = EXCLUDED.name, description = EXCLUDED.description, flat_buff = EXCLUDED.flat_buff, multiplier_buff = EXCLUDED.multiplier_buff, icon_url = EXCLUDED.icon_url;

-- 4. Combo Family New Upgrades
INSERT INTO cores (id, name, description, flat_buff, multiplier_buff, tier, core_type, classification, icon_url)
VALUES 
  ('44444444-4444-4444-4444-888888888888', 'Combo Burst', 'Reaching a 5-streak releases a point burst of +300 points.', 300, 1.2, 2, 'upgrade', 'power', 'https://zowxktrpfqwpzckpnytu.supabase.co/storage/v1/object/public/core-icons/combo/radiant-combo.svg'),
  ('44444444-4444-4444-4444-999999999999', 'Hyper Combo', 'Maintaining a 10-streak doubles all streak bonus points (Max +600 PTS).', 600, 2.0, 3, 'upgrade', 'power', 'https://zowxktrpfqwpzckpnytu.supabase.co/storage/v1/object/public/core-icons/combo/prismatic-combo.svg')
ON CONFLICT (id) DO UPDATE SET 
  name = EXCLUDED.name, description = EXCLUDED.description, flat_buff = EXCLUDED.flat_buff, multiplier_buff = EXCLUDED.multiplier_buff, icon_url = EXCLUDED.icon_url;

-- 5. Aegis Family New Upgrades
INSERT INTO cores (id, name, description, flat_buff, multiplier_buff, tier, core_type, classification, icon_url)
VALUES 
  ('55555555-5555-5555-5555-888888888888', 'Reflective Barrier', 'Consuming a shield reflects mistake penalties and grants +100 bonus points.', 100, 1.2, 2, 'upgrade', 'effect', 'https://zowxktrpfqwpzckpnytu.supabase.co/storage/v1/object/public/core-icons/aegis/reflective-aegis.svg'),
  ('55555555-5555-5555-5555-999999999999', 'Aegis Sanctuary', 'Generates 1 free Aegis Shield every 3 correct answers (Max 5 shields).', 0, 1.5, 3, 'upgrade', 'effect', 'https://zowxktrpfqwpzckpnytu.supabase.co/storage/v1/object/public/core-icons/aegis/bastion-of-light.svg')
ON CONFLICT (id) DO UPDATE SET 
  name = EXCLUDED.name, description = EXCLUDED.description, flat_buff = EXCLUDED.flat_buff, multiplier_buff = EXCLUDED.multiplier_buff, icon_url = EXCLUDED.icon_url;

-- 6. Power Family New Upgrades
INSERT INTO cores (id, name, description, flat_buff, multiplier_buff, tier, core_type, classification, icon_url)
VALUES 
  ('66666666-6666-6666-6666-888888888888', 'Overcharge', 'Pushes score multiplier to 2.2x on sub-3-second answers.', 0, 2.2, 2, 'upgrade', 'power', 'https://zowxktrpfqwpzckpnytu.supabase.co/storage/v1/object/public/core-icons/power/overclock-core.svg'),
  ('66666666-6666-6666-6666-999999999999', 'Cataclysm', 'Cataclysmic power granting 3.5x multiplier on correct answers.', 0, 3.5, 3, 'upgrade', 'power', 'https://zowxktrpfqwpzckpnytu.supabase.co/storage/v1/object/public/core-icons/power/supernova-core.svg')
ON CONFLICT (id) DO UPDATE SET 
  name = EXCLUDED.name, description = EXCLUDED.description, flat_buff = EXCLUDED.flat_buff, multiplier_buff = EXCLUDED.multiplier_buff, icon_url = EXCLUDED.icon_url;

-- 7. Speedster Family New Upgrades
INSERT INTO cores (id, name, description, flat_buff, multiplier_buff, tier, core_type, classification, icon_url)
VALUES 
  ('77777777-7777-7777-7777-888888888888', 'Velocity Shield', 'Answering in under 2.5s generates 1 protective shield stack.', 0, 1.2, 2, 'upgrade', 'power', 'https://zowxktrpfqwpzckpnytu.supabase.co/storage/v1/object/public/core-icons/speedster/speed-shield.svg'),
  ('77777777-7777-7777-7777-999999999999', 'Hyperdrive', 'Hyperspeed typing quadruples time-taken speed bonus points.', 0, 2.5, 3, 'upgrade', 'power', 'https://zowxktrpfqwpzckpnytu.supabase.co/storage/v1/object/public/core-icons/speedster/mach-speed.svg')
ON CONFLICT (id) DO UPDATE SET 
  name = EXCLUDED.name, description = EXCLUDED.description, flat_buff = EXCLUDED.flat_buff, multiplier_buff = EXCLUDED.multiplier_buff, icon_url = EXCLUDED.icon_url;

-- 8. Oracle Family New Upgrades
INSERT INTO cores (id, name, description, flat_buff, multiplier_buff, tier, core_type, classification, icon_url)
VALUES 
  ('88888888-8888-8888-8888-888888888888', 'Inner Eye', 'Oracle hints are free and automatically reveal target word length.', 0, 1.0, 2, 'upgrade', 'effect', 'https://zowxktrpfqwpzckpnytu.supabase.co/storage/v1/object/public/core-icons/oracle/third-eye.svg'),
  ('88888888-8888-8888-8888-999999999999', 'Prophecy', 'Oracle prophecy reveals target word category and first letter.', 0, 1.5, 3, 'upgrade', 'effect', 'https://zowxktrpfqwpzckpnytu.supabase.co/storage/v1/object/public/core-icons/oracle/omniscience.svg')
ON CONFLICT (id) DO UPDATE SET 
  name = EXCLUDED.name, description = EXCLUDED.description, flat_buff = EXCLUDED.flat_buff, multiplier_buff = EXCLUDED.multiplier_buff, icon_url = EXCLUDED.icon_url;

-- 9. Mission Family New Upgrades
INSERT INTO cores (id, name, description, flat_buff, multiplier_buff, tier, core_type, classification, icon_url)
VALUES 
  ('99999999-9999-9999-9999-888888888888', 'Contract Hunter', 'Completing a 4-streak target mission awards +800 flat bonus points.', 800, 1.0, 2, 'upgrade', 'effect', 'https://zowxktrpfqwpzckpnytu.supabase.co/storage/v1/object/public/core-icons/mission/bounty-hunter.svg'),
  ('99999999-9999-9999-9999-999999999999', 'Mission Legend', 'Completing an 8-streak mission awards a massive +4000 flat bonus points.', 4000, 1.0, 3, 'upgrade', 'effect', 'https://zowxktrpfqwpzckpnytu.supabase.co/storage/v1/object/public/core-icons/mission/mission-specialist.svg')
ON CONFLICT (id) DO UPDATE SET 
  name = EXCLUDED.name, description = EXCLUDED.description, flat_buff = EXCLUDED.flat_buff, multiplier_buff = EXCLUDED.multiplier_buff, icon_url = EXCLUDED.icon_url;

-- 10. Balanced Family New Upgrades
INSERT INTO cores (id, name, description, flat_buff, multiplier_buff, tier, core_type, classification, icon_url)
VALUES 
  ('aaaaaaaa-aaaa-aaaa-aaaa-888888888888', 'Zen Momentum', 'Steady pace increases score multiplier by +0.1x per correct answer (Max 1.8x).', 0, 1.4, 2, 'upgrade', 'power', 'https://zowxktrpfqwpzckpnytu.supabase.co/storage/v1/object/public/core-icons/balanced/harmony-core.svg'),
  ('aaaaaaaa-aaaa-aaaa-aaaa-999999999999', 'Serenity', 'Complete immunity to mistake penalties + awards +100 flat points per answer.', 100, 1.5, 3, 'upgrade', 'power', 'https://zowxktrpfqwpzckpnytu.supabase.co/storage/v1/object/public/core-icons/balanced/perfect-harmony.svg')
ON CONFLICT (id) DO UPDATE SET 
  name = EXCLUDED.name, description = EXCLUDED.description, flat_buff = EXCLUDED.flat_buff, multiplier_buff = EXCLUDED.multiplier_buff, icon_url = EXCLUDED.icon_url;

COMMIT;
