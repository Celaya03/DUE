/**
 * Initialize Supabase database with proper schema
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

    // Create users table
    await client.query(`
      CREATE TABLE IF NOT EXISTS public.users (
        id TEXT PRIMARY KEY,
        name TEXT NOT NULL,
        email TEXT UNIQUE NOT NULL,
        password_hash TEXT NOT NULL,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `)

    // Create tasks table
    await client.query(`
      CREATE TABLE IF NOT EXISTS public.tasks (
        id TEXT PRIMARY KEY,
        user_id TEXT NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
        title TEXT NOT NULL,
        description TEXT,
        status TEXT NOT NULL,
        priority TEXT NOT NULL,
        due_date TEXT,
        created_at TEXT NOT NULL
      )
    `)

    // Create habits table
    await client.query(`
      CREATE TABLE IF NOT EXISTS public.habits (
        id TEXT PRIMARY KEY,
        user_id TEXT NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
        name TEXT NOT NULL,
        completed BOOLEAN NOT NULL,
        streak INTEGER NOT NULL,
        icon TEXT NOT NULL
      )
    `)

    // Create transactions table
    await client.query(`
      CREATE TABLE IF NOT EXISTS public.transactions (
        id TEXT PRIMARY KEY,
        user_id TEXT NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
        description TEXT NOT NULL,
        amount NUMERIC NOT NULL,
        type TEXT NOT NULL,
        date TEXT NOT NULL,
        category TEXT NOT NULL
      )
    `)

    console.log("✓ Table structures created successfully")

    // Create indexes for better performance
    await client.query(`
      CREATE INDEX IF NOT EXISTS idx_tasks_user_id ON public.tasks(user_id)
    `)

    await client.query(`
      CREATE INDEX IF NOT EXISTS idx_habits_user_id ON public.habits(user_id)
    `)

    await client.query(`
      CREATE INDEX IF NOT EXISTS idx_transactions_user_id ON public.transactions(user_id)
    `)

    console.log("✓ Indexes created for performance")
    console.log("\n✅ Database initialization complete!")
    console.log("\nNote: Security is enforced at the application level via server-side session validation.")
    console.log("Each user can only access their own data through authenticated API endpoints.\n")
  } catch (error: any) {
    // Ignore "already exists" errors
    if (error?.code === "42P07" || error?.message?.includes("already exists")) {
      console.log("✓ Tables already exist - skipping creation")
      console.log("✅ Database initialization complete!")
    } else {
      console.error("Error initializing database:", error)
      process.exit(1)
    }
  } finally {
    client.release()
    await pool.end()
  }
}

initializeDatabase()

