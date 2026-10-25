const { Client } = require('pg');
const fs = require('fs');
const path = require('path');

function loadEnv() {
  const envPath = path.resolve(__dirname, '..', '.env');
  if (fs.existsSync(envPath)) {
    const lines = fs.readFileSync(envPath, 'utf-8').split('\n');
    for (const line of lines) {
      const trimmed = line.trim();
      if (!trimmed || trimmed.startsWith('#')) continue;
      const eqIdx = trimmed.indexOf('=');
      if (eqIdx !== -1) {
        const key = trimmed.slice(0, eqIdx).trim();
        const val = trimmed.slice(eqIdx + 1).trim();
        if (!process.env[key]) {
          process.env[key] = val;
        }
      }
    }
  }
}

loadEnv();

async function migrate() {
  const connectionString = process.env.DATABASE_URL;
  const clientConfig = connectionString
    ? { connectionString, ssl: { rejectUnauthorized: false } }
    : {
        host: 'db.dwxdhgtknxswalugwioi.supabase.co',
        port: 5432,
        user: 'postgres',
        password: 'DiwaliParty@2026',
        database: 'postgres',
        ssl: { rejectUnauthorized: false }
      };

  const client = new Client(clientConfig);

  console.log('Connecting to Supabase PostgreSQL database...');
  await client.connect();
  console.log('Connected successfully!');

  const sql = `
    -- 1. Create registrations table if not exists
    CREATE TABLE IF NOT EXISTS registrations (
      id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
      name TEXT NOT NULL,
      contact TEXT,
      attendance_status TEXT NOT NULL CHECK (attendance_status IN ('yes', 'maybe', 'no')),
      selected_role TEXT NOT NULL CHECK (selected_role IN (
        'photographer', 'house_host', 'games_maniac', 'food_commander',
        'dj', 'dance_activator', 'chaos_manager', 'decoration_master',
        'snack_supplier', 'strategy_master'
      )),
      contribution TEXT NOT NULL DEFAULT 'myself',
      timestamp TIMESTAMPTZ DEFAULT NOW() NOT NULL,
      created_at TIMESTAMPTZ DEFAULT NOW()
    );

    -- 2. Add payment columns if they do not exist
    ALTER TABLE registrations
      ADD COLUMN IF NOT EXISTS payment_method TEXT CHECK (payment_method IN ('online', 'cash')),
      ADD COLUMN IF NOT EXISTS payment_amount NUMERIC DEFAULT 500,
      ADD COLUMN IF NOT EXISTS payment_status TEXT DEFAULT 'pending' CHECK (payment_status IN ('pending', 'verified', 'rejected')),
      ADD COLUMN IF NOT EXISTS payment_screenshot_url TEXT,
      ADD COLUMN IF NOT EXISTS payment_submitted_at TIMESTAMPTZ;

    -- 3. Row Level Security policies
    ALTER TABLE registrations ENABLE ROW LEVEL SECURITY;

    DROP POLICY IF EXISTS "Allow public inserts" ON registrations;
    CREATE POLICY "Allow public inserts" ON registrations
      FOR INSERT TO anon
      WITH CHECK (true);

    DROP POLICY IF EXISTS "Allow public reads" ON registrations;
    CREATE POLICY "Allow public reads" ON registrations
      FOR SELECT TO anon
      USING (true);

    DROP POLICY IF EXISTS "Allow public update" ON registrations;
    CREATE POLICY "Allow public update" ON registrations
      FOR UPDATE TO anon
      USING (true)
      WITH CHECK (true);

    DROP POLICY IF EXISTS "Allow public delete" ON registrations;
    CREATE POLICY "Allow public delete" ON registrations
      FOR DELETE TO anon
      USING (true);

    -- 4. Performance indexes
    CREATE INDEX IF NOT EXISTS idx_registrations_timestamp ON registrations(timestamp DESC);
    CREATE INDEX IF NOT EXISTS idx_registrations_role ON registrations(selected_role);
    CREATE INDEX IF NOT EXISTS idx_registrations_status ON registrations(attendance_status);
    CREATE INDEX IF NOT EXISTS idx_registrations_payment_status ON registrations(payment_status);
    CREATE INDEX IF NOT EXISTS idx_registrations_payment_submitted_at ON registrations(payment_submitted_at);

    -- 5. Setup Storage bucket for payment-screenshots
    INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
    VALUES (
      'payment-screenshots',
      'payment-screenshots',
      true,
      5242880,
      ARRAY['image/png', 'image/jpeg', 'image/jpg', 'image/webp']
    )
    ON CONFLICT (id) DO UPDATE SET
      public = true,
      file_size_limit = 5242880,
      allowed_mime_types = ARRAY['image/png', 'image/jpeg', 'image/jpg', 'image/webp'];

    DROP POLICY IF EXISTS "Allow anon upload to payment-screenshots" ON storage.objects;
    CREATE POLICY "Allow anon upload to payment-screenshots"
      ON storage.objects FOR INSERT TO anon
      WITH CHECK (bucket_id = 'payment-screenshots');

    DROP POLICY IF EXISTS "Allow public view payment-screenshots" ON storage.objects;
    CREATE POLICY "Allow public view payment-screenshots"
      ON storage.objects FOR SELECT TO anon, authenticated
      USING (bucket_id = 'payment-screenshots');

    DROP POLICY IF EXISTS "Allow anon update to payment-screenshots" ON storage.objects;
    CREATE POLICY "Allow anon update to payment-screenshots"
      ON storage.objects FOR UPDATE TO anon
      USING (bucket_id = 'payment-screenshots');
  `;

  console.log('Applying table updates, payment fields, RLS policies, and storage bucket...');
  await client.query(sql);
  console.log('All migrations and storage setups succeeded!');

  try {
    await client.query('ALTER PUBLICATION supabase_realtime ADD TABLE registrations;');
    console.log('Realtime publication enabled for registrations.');
  } catch (err) {
    console.log('Realtime publication notice:', err.message);
  }

  const cols = await client.query(`
    SELECT column_name, data_type 
    FROM information_schema.columns 
    WHERE table_name = 'registrations';
  `);
  console.log('Current registrations columns:', cols.rows.map(r => `${r.column_name} (${r.data_type})`));

  await client.end();
  console.log('Database and storage setup complete!');
}

migrate().catch(err => {
  console.error('Migration failed:', err);
  process.exit(1);
});
