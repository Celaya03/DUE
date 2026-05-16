import { NextResponse } from "next/server"
import { Pool, type PoolConfig } from "pg"

const connectionString = process.env.DATABASE_URL

const poolConfig: PoolConfig = { connectionString: connectionString ?? "" }
if (connectionString?.includes("supabase.co")) {
  poolConfig.ssl = { rejectUnauthorized: false }
}

const pool = connectionString ? new Pool(poolConfig) : null

export async function POST() {
  if (!connectionString || !pool) {
    return NextResponse.json(
      { success: false, error: "Missing DATABASE_URL" },
      { status: 500 }
    )
  }
  
  try {
    // Drop existing tables and recreate with composite primary keys
    // This ensures proper data isolation per user
    await pool.query(`
      DROP TABLE IF EXISTS tasks;
      DROP TABLE IF EXISTS habits;
      DROP TABLE IF EXISTS transactions;
    `)

    await pool.query(`
      CREATE TABLE tasks (
        id TEXT NOT NULL,
        user_id TEXT NOT NULL,
        title TEXT NOT NULL,
        description TEXT,
        status TEXT NOT NULL,
        priority TEXT NOT NULL,
        due_date TEXT,
        created_at TEXT NOT NULL,
        PRIMARY KEY (id, user_id)
      )
    `)

    await pool.query(`
      CREATE TABLE habits (
        id TEXT NOT NULL,
        user_id TEXT NOT NULL,
        name TEXT NOT NULL,
        completed BOOLEAN NOT NULL,
        streak INTEGER NOT NULL,
        icon TEXT NOT NULL,
        PRIMARY KEY (id, user_id)
      )
    `)

    await pool.query(`
      CREATE TABLE transactions (
        id TEXT NOT NULL,
        user_id TEXT NOT NULL,
        description TEXT NOT NULL,
        amount NUMERIC NOT NULL,
        type TEXT NOT NULL,
        date TEXT NOT NULL,
        category TEXT NOT NULL,
        PRIMARY KEY (id, user_id)
      )
    `)

    return NextResponse.json({ 
      success: true, 
      message: "Database tables migrated successfully with composite primary keys" 
    })
  } catch (error) {
    console.error("Migration error:", error)
    return NextResponse.json(
      { success: false, error: String(error) },
      { status: 500 }
    )
  }
}
