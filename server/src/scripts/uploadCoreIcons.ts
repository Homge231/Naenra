/**
 * uploadCoreIcons.ts
 *
 * 1. Creates Supabase Storage bucket `core-icons` (if not exists)
 * 2. Uploads all icon SVGs from client/public/icons/cores/{family}/
 * 3. Adds `icon_url` column to `cores` table (if not exists)
 * 4. Updates each core row with the public URL of its icon
 */
import dotenv from 'dotenv'
import path from 'path'
import fs from 'fs'

dotenv.config({ path: path.resolve(__dirname, '../../.env') })

import { createClient } from '@supabase/supabase-js'

const supabase = createClient(
  process.env.SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_KEY!
)

const BUCKET_NAME = 'core-icons'
const ICONS_DIR = path.resolve(__dirname, '../../../client/public/icons/cores')

/** Convert core name to the slug used in filenames */
function toSlug(name: string): string {
  const overrides: Record<string, string> = {
    'harmony': 'harmony-core',
    'zenith': 'zenith-core',
    'overclock': 'overclock-core',
    'supernova': 'supernova-core',
    'gigawatt': 'gigawatt-core',
    'supermassive': 'supermassive-core',
    'aegis shield': 'aegis-shield',
    'oracle': 'oracle-core',
    'mission impossible': 'mission-core',
    'perfect combo': 'combo-core',
    'balance': 'balanced-core',
    'speedster': 'speedster',
    "pandora's box": 'pandoras-box',
    'high roller': 'high-roller'
  }
  const key = name.toLowerCase()
  if (overrides[key]) return overrides[key]
  return key
    .replace(/['']/g, '')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
}

async function ensureBucket() {
  const { data: buckets } = await supabase.storage.listBuckets()
  const exists = buckets?.some(b => b.name === BUCKET_NAME)
  
  if (!exists) {
    const { error } = await supabase.storage.createBucket(BUCKET_NAME, {
      public: true,
      fileSizeLimit: 1024 * 1024, // 1MB per icon
    })
    if (error) {
      console.error('Failed to create bucket:', error)
      return false
    }
    console.log(`✅ Created bucket: ${BUCKET_NAME}`)
  } else {
    console.log(`✓ Bucket already exists: ${BUCKET_NAME}`)
  }
  return true
}

async function uploadAndUpdateCores() {
  const { data: cores, error: fetchErr } = await supabase
    .from('cores')
    .select('id, name')
  
  if (fetchErr || !cores) {
    console.error('Failed to fetch cores:', fetchErr)
    return
  }

  const families = fs.readdirSync(ICONS_DIR).filter(f => 
    fs.statSync(path.join(ICONS_DIR, f)).isDirectory()
  )

  let uploaded = 0
  let updated = 0
  let missing = 0

  for (const core of cores) {
    const slug = toSlug(core.name)
    
    let iconPath: string | null = null
    let family: string | null = null
    
    for (const fam of families) {
      const candidate = path.join(ICONS_DIR, fam, `${slug}.svg`)
      if (fs.existsSync(candidate)) {
        iconPath = candidate
        family = fam
        break
      }
    }

    if (!iconPath || !family) {
      console.warn(`⚠️  No icon file for: "${core.name}" (expected slug: ${slug})`)
      missing++
      continue
    }

    const storagePath = `${family}/${slug}.svg`
    const fileBuffer = fs.readFileSync(iconPath)
    
    const { error: uploadErr } = await supabase.storage
      .from(BUCKET_NAME)
      .upload(storagePath, fileBuffer, {
        contentType: 'image/svg+xml',
        upsert: true
      })

    if (uploadErr) {
      console.error(`❌ Upload failed for ${core.name}:`, uploadErr.message)
      continue
    }
    uploaded++

    const { data: urlData } = supabase.storage
      .from(BUCKET_NAME)
      .getPublicUrl(storagePath)
    
    const publicUrl = urlData.publicUrl

    const { error: updateErr } = await supabase
      .from('cores')
      .update({ icon_url: publicUrl })
      .eq('id', core.id)

    if (updateErr) {
      console.error(`❌ DB update failed for ${core.name}:`, updateErr.message)
    } else {
      console.log(`✅ ${core.name} → ${publicUrl}`)
      updated++
    }
  }

  console.log(`\n📊 Done. Uploaded: ${uploaded}, DB updated: ${updated}, Missing icons: ${missing}`)
}

async function run() {
  console.log('🔧 Uploading all custom SVG icons to Supabase Storage...\n')
  const bucketOk = await ensureBucket()
  if (!bucketOk) return
  await uploadAndUpdateCores()
}

run()
