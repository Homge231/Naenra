# /scripts — Migration & Utility Scripts

These scripts are utility & database management scripts for Supabase and asset generation.  
Run TypeScript scripts manually with `npx ts-node scripts/<script_name>` from the project root (ensure `.env` is loaded).

| File | Purpose | Status |
|---|---|---|
| `crossCheckCores.ts` | Validates DB core names vs codebase strategy registries | 🔁 Reusable Utility |
| `drop_legacy_tables.sql` | SQL migration to drop 4 legacy unused tables | 📜 SQL Migration |
| `generateAllSvgs.ts` | Generates SVG core icons for all support cores | 🎨 Asset Utility |
| `generateInitialQuestions.ts` | Seeds/generates questions in DB via Gemini AI API | 🔁 Reusable Utility |
| `standardize_cores.sql` | SQL migration standardizing core classifications in Supabase | 📜 SQL Migration |
| `supabase_audit_and_migration.sql` | Supabase schema audit and single-session migration | 📜 SQL Migration |
| `update_phoenix_descriptions.sql` | SQL migration updating Phoenix descriptions in Supabase | 📜 SQL Migration |
| `uploadCoreIcons.ts` | Uploads local SVG icons to Supabase Storage bucket | 🔁 Asset Utility |
