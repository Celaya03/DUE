/**
 * Initialize Supabase database with proper schema and Row Level Security
 * Run this once: npx tsx lib/init-db.ts
 */

import { Pool } from "pg"

const connectionString = process.env.POSTGRES_URL_NON_POOLING
if (!connectionString) {
  throw new Error("Missing POSTGRES_URL_NON_POOLING environment variable")
}

const pool = new Pool({ connectionString })

async function initializeDatabase() {
  const client = await pool.connect()

  try {
    console.log("Starting database initialization...")

    // Ensure users table has correct structure
    await client.query(`
      ALTER TABLE IF EXISTS public.users 
      ADD COLUMN IF NOT EXISTS id TEXT PRIMARY KEY,
      ADD COLUMN IF NOT EXISTS name TEXT NOT NULL,
      ADD COLUMN IF NOT EXISTS email TEXT UNIQUE NOT NULL,
      ADD COLUMN IF NOT EXISTS password_hash TEXT NOT NULL,
      ADD COLUMN IF NOT EXISTS created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    `)

    // Ensure tasks table has correct structure with user_id
    await client.query(`
      ALTER TABLE IF EXISTS public.tasks 
      ADD COLUMN IF NOT EXISTS id TEXT PRIMARY KEY,
      ADD COLUMN IF NOT EXISTS user_id TEXT NOT NULL REFERENCES public.users(id),
      ADD COLUMN IF NOT EXISTS title TEXT NOT NULL,
      ADD COLUMN IF NOT EXISTS description TEXT,
      ADD COLUMN IF NOT EXISTS status TEXT NOT NULL,
      ADD COLUMN IF NOT EXISTS priority TEXT NOT NULL,
      ADD COLUMN IF NOT EXISTS due_date TEXT,
      ADD COLUMN IF NOT EXISTS created_at TEXT NOT NULL
    `)

    // Ensure habits table has correct structure with user_id
    await client.query(`
      ALTER TABLE IF EXISTS public.habits 
      ADD COLUMN IF NOT EXISTS id TEXT PRIMARY KEY,
      ADD COLUMN IF NOT EXISTS user_id TEXT NOT NULL REFERENCES public.users(id),
      ADD COLUMN IF NOT EXISTS name TEXT NOT NULL,
      ADD COLUMN IF NOT EXISTS completed BOOLEAN NOT NULL,
      ADD COLUMN IF NOT EXISTS streak INTEGER NOT NULL,
      ADD COLUMN IF NOT EXISTS icon TEXT NOT NULL
    `)

    // Ensure transactions table has correct structure with user_id
    await client.query(`
      ALTER TABLE IF EXISTS public.transactions 
      ADD COLUMN IF NOT EXISTS id TEXT PRIMARY KEY,
      ADD COLUMN IF NOT EXISTS user_id TEXT NOT NULL REFERENCES public.users(id),
      ADD COLUMN IF NOT EXISTS description TEXT NOT NULL,
      ADD COLUMN IF NOT EXISTS amount NUMERIC NOT NULL,
      ADD COLUMN IF NOT EXISTS type TEXT NOT NULL,
      ADD COLUMN IF NOT EXISTS date TEXT NOT NULL,
      ADD COLUMN IF NOT EXISTS category TEXT NOT NULL
    `)

    console.log("✓ Table structures validated")

    // Enable Row Level Security
    await client.query("ALTER TABLE public.users ENABLE ROW LEVEL SECURITY")
    await client.query("ALTER TABLE public.tasks ENABLE ROW LEVEL SECURITY")
    await client.query("ALTER TABLE public.habits ENABLE ROW LEVEL SECURITY")
    await client.query("ALTER TABLE public.transactions ENABLE ROW LEVEL SECURITY")

    console.log("✓ Row Level Security enabled")

    // Create policies for users table (users can only see their own record)
    await client.query(`
      DROP POLICY IF EXISTS "users_select_own" ON public.users;
      CREATE POLICY "users_select_own" ON public.users
      FOR SELECT USING (id = current_user_id()::text)
    `)

    // Create policies for tasks table (users can only see their own tasks)
    await client.query(`
      DROP POLICY IF EXISTS "tasks_select_own" ON public.tasks;
      CREATE POLICY "tasks_select_own" ON public.tasks
      FOR SELECT USING (user_id = current_user_id()::text)
    `)

    await client.query(`
      DROP POLICY IF EXISTS "tasks_insert_own" ON public.tasks;
      CREATE POLICY "tasks_insert_own" ON public.tasks
      FOR INSERT WITH CHECK (user_id = current_user_id()::text)
    `)

    await client.query(`
      DROP POLICY IF EXISTS "tasks_update_own" ON public.tasks;
      CREATE POLICY "tasks_update_own" ON public.tasks
      FOR UPDATE USING (user_id = current_user_id()::text)
    `)

    await client.query(`
      DROP POLICY IF EXISTS "tasks_delete_own" ON public.tasks;
      CREATE POLICY "tasks_delete_own" ON public.tasks
      FOR DELETE USING (user_id = current_user_id()::text)
    `)

    // Create policies for habits table
    await client.query(`
      DROP POLICY IF EXISTS "habits_select_own" ON public.habits;
      CREATE POLICY "habits_select_own" ON public.habits
      FOR SELECT USING (user_id = current_user_id()::text)
    `)

    await client.query(`
      DROP POLICY IF EXISTS "habits_insert_own" ON public.habits;
      CREATE POLICY "habits_insert_own" ON public.habits
      FOR INSERT WITH CHECK (user_id = current_user_id()::text)
    `)

    await client.query(`
      DROP POLICY IF EXISTS "habits_update_own" ON public.habits;
      CREATE POLICY "habits_update_own" ON public.habits
      FOR UPDATE USING (user_id = current_user_id()::text)
    `)

    await client.query(`
      DROP POLICY IF EXISTS "habits_delete_own" ON public.habits;
      CREATE POLICY "habits_delete_own" ON public.habits
      FOR DELETE USING (user_id = current_user_id()::text)
    `)

    // Create policies for transactions table
    await client.query(`
      DROP POLICY IF EXISTS "transactions_select_own" ON public.transactions;
      CREATE POLICY "transactions_select_own" ON public.transactions
      FOR SELECT USING (user_id = current_user_id()::text)
    `)

    await client.query(`
      DROP POLICY IF EXISTS "transactions_insert_own" ON public.transactions;
      CREATE POLICY "transactions_insert_own" ON public.transactions
      FOR INSERT WITH CHECK (user_id = current_user_id()::text)
    `)

    await client.query(`
      DROP POLICY IF EXISTS "transactions_update_own" ON public.transactions;
      CREATE POLICY "transactions_update_own" ON public.transactions
      FOR UPDATE USING (user_id = current_user_id()::text)
    `)

    await client.query(`
      DROP POLICY IF EXISTS "transactions_delete_own" ON public.transactions;
      CREATE POLICY "transactions_delete_own" ON public.transactions
      FOR DELETE USING (user_id = current_user_id()::text)
    `)

    console.log("✓ Row Level Security policies created")
    console.log("\n✅ Database initialization complete!")
  } catch (error) {
    console.error("Error initializing database:", error)
    process.exit(1)
  } finally {
    client.release()
    await pool.end()
  }
}

initializeDatabase()
