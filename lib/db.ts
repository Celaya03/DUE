import { Pool, type PoolConfig } from "pg"
import type { Task, Habit, Transaction } from "./types"
// import { initialHabits, initialTasks, initialTransactions } from "./store"

type DbData = {
  tasks: Task[]
  habits: Habit[]
  transactions: Transaction[]
}

let pool: Pool | null = null

function getPool(): Pool {
  if (!pool) {
    const connectionString = process.env.DATABASE_URL
    if (!connectionString) {
      throw new Error("Missing DATABASE_URL environment variable. Configure DATABASE_URL with your managed database credentials.")
    }

    const poolConfig: PoolConfig = { connectionString }

    if (connectionString.includes("supabase.co")) {
      poolConfig.ssl = { rejectUnauthorized: false }
    }

    pool = new Pool(poolConfig)
  }
  return pool
}

async function ensureTables() {
  const pool = getPool()
  await pool.query(`
    CREATE TABLE IF NOT EXISTS tasks (
      id TEXT PRIMARY KEY,
      user_id TEXT NOT NULL,
      title TEXT NOT NULL,
      description TEXT,
      status TEXT NOT NULL,
      priority TEXT NOT NULL,
      due_date TEXT,
      created_at TEXT NOT NULL
    )
  `)

  await pool.query(`
    CREATE TABLE IF NOT EXISTS habits (
      id TEXT PRIMARY KEY,
      user_id TEXT NOT NULL,
      name TEXT NOT NULL,
      completed BOOLEAN NOT NULL,
      streak INTEGER NOT NULL,
      icon TEXT NOT NULL
    )
  `)

  await pool.query(`
    CREATE TABLE IF NOT EXISTS transactions (
      id TEXT PRIMARY KEY,
      user_id TEXT NOT NULL,
      description TEXT NOT NULL,
      amount NUMERIC NOT NULL,
      type TEXT NOT NULL,
      date TEXT NOT NULL,
      category TEXT NOT NULL
    )
  `)
}

async function seedDataIfEmpty(userId: string) {
  const pool = getPool()
  const result = await pool.query("SELECT COUNT(*)::int AS count FROM tasks WHERE user_id = $1", [userId])
  if (result.rows[0]?.count === 0) {
    // await saveAppData(userId, {
    //   tasks: initialTasks,
    //   habits: initialHabits,
    //   transactions: initialTransactions,
    // })
  }
}

function mapTaskRow(row: any): Task {
  return {
    id: row.id,
    title: row.title,
    description: row.description ?? undefined,
    status: row.status,
    priority: row.priority,
    dueDate: row.due_date ?? undefined,
    createdAt: row.created_at,
  }
}

function mapHabitRow(row: any): Habit {
  return {
    id: row.id,
    name: row.name,
    completed: row.completed,
    streak: row.streak,
    icon: row.icon,
  }
}

function mapTransactionRow(row: any): Transaction {
  return {
    id: row.id,
    description: row.description,
    amount: Number(row.amount),
    type: row.type,
    date: row.date,
    category: row.category,
  }
}

export async function getAppData(userId: string): Promise<DbData> {
  const pool = getPool()
  await ensureTables()

  const tasksResult = await pool.query(
    "SELECT * FROM tasks WHERE user_id = $1 ORDER BY created_at DESC",
    [userId]
  )
  const habitsResult = await pool.query("SELECT * FROM habits WHERE user_id = $1", [userId])
  const transactionsResult = await pool.query(
    "SELECT * FROM transactions WHERE user_id = $1 ORDER BY date DESC",
    [userId]
  )

  // Si el usuario no tiene datos, inicializa con datos por defecto
  if (tasksResult.rows.length === 0 && habitsResult.rows.length === 0 && transactionsResult.rows.length === 0) {
    await seedDataIfEmpty(userId)
    
    // Vuelve a traer los datos iniciales
    const retryTasks = await pool.query(
      "SELECT * FROM tasks WHERE user_id = $1 ORDER BY created_at DESC",
      [userId]
    )
    const retryHabits = await pool.query("SELECT * FROM habits WHERE user_id = $1", [userId])
    const retryTransactions = await pool.query(
      "SELECT * FROM transactions WHERE user_id = $1 ORDER BY date DESC",
      [userId]
    )
    
    return {
      tasks: retryTasks.rows.map(mapTaskRow),
      habits: retryHabits.rows.map(mapHabitRow),
      transactions: retryTransactions.rows.map(mapTransactionRow),
    }
  }

  return {
    tasks: tasksResult.rows.map(mapTaskRow),
    habits: habitsResult.rows.map(mapHabitRow),
    transactions: transactionsResult.rows.map(mapTransactionRow),
  }
}

export async function saveAppData(userId: string, data: DbData): Promise<void> {
  const pool = getPool()
  await ensureTables()

  const client = await pool.connect()
  try {
    await client.query("BEGIN")
    await client.query("DELETE FROM tasks WHERE user_id = $1", [userId])
    await client.query("DELETE FROM habits WHERE user_id = $1", [userId])
    await client.query("DELETE FROM transactions WHERE user_id = $1", [userId])

    for (const task of data.tasks) {
      await client.query(
        `INSERT INTO tasks (id, user_id, title, description, status, priority, due_date, created_at) VALUES ($1, $2, $3, $4, $5, $6, $7, $8)`,
        [task.id, userId, task.title, task.description ?? null, task.status, task.priority, task.dueDate ?? null, task.createdAt]
      )
    }

    for (const habit of data.habits) {
      await client.query(
        `INSERT INTO habits (id, user_id, name, completed, streak, icon) VALUES ($1, $2, $3, $4, $5, $6)`,
        [habit.id, userId, habit.name, habit.completed, habit.streak, habit.icon]
      )
    }

    for (const transaction of data.transactions) {
      await client.query(
        `INSERT INTO transactions (id, user_id, description, amount, type, date, category) VALUES ($1, $2, $3, $4, $5, $6, $7)`,
        [transaction.id, userId, transaction.description, transaction.amount, transaction.type, transaction.date, transaction.category]
      )
    }

    await client.query("COMMIT")
  } catch (error) {
    await client.query("ROLLBACK")
    throw error
  } finally {
    client.release()
  }
}
