-- =============================================================================
-- UPDATE UNIQUE ICON URLS FOR ALL 24 NEW UPGRADE CORES IN SUPABASE DATABASE
-- =============================================================================

BEGIN;

UPDATE cores SET icon_url = 'https://zowxktrpfqwpzckpnytu.supabase.co/storage/v1/object/public/core-icons/phoenix/solar-ember.svg' WHERE name = 'Solar Ember';
UPDATE cores SET icon_url = 'https://zowxktrpfqwpzckpnytu.supabase.co/storage/v1/object/public/core-icons/phoenix/feather-shield.svg' WHERE name = 'Feather Shield';
UPDATE cores SET icon_url = 'https://zowxktrpfqwpzckpnytu.supabase.co/storage/v1/object/public/core-icons/phoenix/blazing-resurrection.svg' WHERE name = 'Blazing Resurrection';
UPDATE cores SET icon_url = 'https://zowxktrpfqwpzckpnytu.supabase.co/storage/v1/object/public/core-icons/phoenix/phoenix-overlord.svg' WHERE name = 'Phoenix Overlord';

UPDATE cores SET icon_url = 'https://zowxktrpfqwpzckpnytu.supabase.co/storage/v1/object/public/core-icons/highroller/lucky-seven.svg' WHERE name = 'Lucky Seven';
UPDATE cores SET icon_url = 'https://zowxktrpfqwpzckpnytu.supabase.co/storage/v1/object/public/core-icons/highroller/high-stakes.svg' WHERE name = 'High Stakes';
UPDATE cores SET icon_url = 'https://zowxktrpfqwpzckpnytu.supabase.co/storage/v1/object/public/core-icons/highroller/royal-flush.svg' WHERE name = 'Royal Flush';
UPDATE cores SET icon_url = 'https://zowxktrpfqwpzckpnytu.supabase.co/storage/v1/object/public/core-icons/highroller/casino-empire.svg' WHERE name = 'Casino Empire';

UPDATE cores SET icon_url = 'https://zowxktrpfqwpzckpnytu.supabase.co/storage/v1/object/public/core-icons/pandora/wild-card.svg' WHERE name = 'Wild Card';
UPDATE cores SET icon_url = 'https://zowxktrpfqwpzckpnytu.supabase.co/storage/v1/object/public/core-icons/pandora/pandora-overdrive.svg' WHERE name = 'Pandora Overdrive';

UPDATE cores SET icon_url = 'https://zowxktrpfqwpzckpnytu.supabase.co/storage/v1/object/public/core-icons/combo/combo-burst.svg' WHERE name = 'Combo Burst';
UPDATE cores SET icon_url = 'https://zowxktrpfqwpzckpnytu.supabase.co/storage/v1/object/public/core-icons/combo/hyper-combo.svg' WHERE name = 'Hyper Combo';

UPDATE cores SET icon_url = 'https://zowxktrpfqwpzckpnytu.supabase.co/storage/v1/object/public/core-icons/aegis/reflective-barrier.svg' WHERE name = 'Reflective Barrier';
UPDATE cores SET icon_url = 'https://zowxktrpfqwpzckpnytu.supabase.co/storage/v1/object/public/core-icons/aegis/aegis-sanctuary.svg' WHERE name = 'Aegis Sanctuary';

UPDATE cores SET icon_url = 'https://zowxktrpfqwpzckpnytu.supabase.co/storage/v1/object/public/core-icons/power/overcharge.svg' WHERE name = 'Overcharge';
UPDATE cores SET icon_url = 'https://zowxktrpfqwpzckpnytu.supabase.co/storage/v1/object/public/core-icons/power/cataclysm.svg' WHERE name = 'Cataclysm';

UPDATE cores SET icon_url = 'https://zowxktrpfqwpzckpnytu.supabase.co/storage/v1/object/public/core-icons/speedster/velocity-shield.svg' WHERE name = 'Velocity Shield';
UPDATE cores SET icon_url = 'https://zowxktrpfqwpzckpnytu.supabase.co/storage/v1/object/public/core-icons/speedster/hyperdrive.svg' WHERE name = 'Hyperdrive';

UPDATE cores SET icon_url = 'https://zowxktrpfqwpzckpnytu.supabase.co/storage/v1/object/public/core-icons/oracle/inner-eye.svg' WHERE name = 'Inner Eye';
UPDATE cores SET icon_url = 'https://zowxktrpfqwpzckpnytu.supabase.co/storage/v1/object/public/core-icons/oracle/prophecy.svg' WHERE name = 'Prophecy';

UPDATE cores SET icon_url = 'https://zowxktrpfqwpzckpnytu.supabase.co/storage/v1/object/public/core-icons/mission/contract-hunter.svg' WHERE name = 'Contract Hunter';
UPDATE cores SET icon_url = 'https://zowxktrpfqwpzckpnytu.supabase.co/storage/v1/object/public/core-icons/mission/mission-legend.svg' WHERE name = 'Mission Legend';

UPDATE cores SET icon_url = 'https://zowxktrpfqwpzckpnytu.supabase.co/storage/v1/object/public/core-icons/balanced/zen-momentum.svg' WHERE name = 'Zen Momentum';
UPDATE cores SET icon_url = 'https://zowxktrpfqwpzckpnytu.supabase.co/storage/v1/object/public/core-icons/balanced/serenity.svg' WHERE name = 'Serenity';

COMMIT;
