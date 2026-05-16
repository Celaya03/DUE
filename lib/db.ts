import { Pool } from "pg"
import type { Task, Habit, Transaction } from "./types"
import { initialHabits, initialTasks, initialTransactions } from "./store"

type DbData = {
  tasks: Task[]
  habits: Habit[]
  transactions: Transaction[]
}

const connectionString = process.env.DATABASE_URL
if (!connectionString) {
  throw new Error("Missing DATABASE_URL environment variable. Configure DATABASE_URL with your managed database credentials.")
}

const pool = new Pool({ connectionString })

async function ensureTables() {
  await pool.query(`
    CREATE TABLE IF NOT EXISTS tasks (
      id TEXT PRIMARY KEY,
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
      name TEXT NOT NULL,
      completed BOOLEAN NOT NULL,
      streak INTEGER NOT NULL,
      icon TEXT NOT NULL
    )
  `)

  await pool.query(`
    CREATE TABLE IF NOT EXISTS transactions (
      id TEXT PRIMARY KEY,
      description TEXT NOT NULL,
      amount NUMERIC NOT NULL,
      type TEXT NOT NULL,
      date TEXT NOT NULL,
      category TEXT NOT NULL
    )
  `)
}

async function seedDataIfEmpty() {
  const result = await pool.query("SELECT COUNT(*)::int AS count FROM tasks")
  if (result.rows[0]?.count === 0) {
    await saveAppData({
      tasks: initialTasks,
      habits: initialHabits,
      transactions: initialTransactions,
    })
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

export async function getAppData(): Promise<DbData> {
  await ensureTables()
  await seedDataIfEmpty()

  const tasksResult = await pool.query("SELECT * FROM tasks ORDER BY created_at DESC")
  const habitsResult = await pool.query("SELECT * FROM habits")
  const transactionsResult = await pool.query("SELECT * FROM transactions ORDER BY date DESC")

  return {
    tasks: tasksResult.rows.map(mapTaskRow),
    habits: habitsResult.rows.map(mapHabitRow),
    transactions: transactionsResult.rows.map(mapTransactionRow),
  }
}

export async function saveAppData(data: DbData): Promise<void> {
  await ensureTables()

  const client = await pool.connect()
  try {
    await client.query("BEGIN")
    await client.query("DELETE FROM tasks")
    await client.query("DELETE FROM habits")
    await client.query("DELETE FROM transactions")

    for (const task of data.tasks) {
      await client.query(
        `INSERT INTO tasks (id, title, description, status, priority, due_date, created_at) VALUES ($1, $2, $3, $4, $5, $6, $7)`,
        [task.id, task.title, task.description ?? null, task.status, task.priority, task.dueDate ?? null, task.createdAt]
      )
    }

    for (const habit of data.habits) {
      await client.query(
        `INSERT INTO habits (id, name, completed, streak, icon) VALUES ($1, $2, $3, $4, $5)`,
        [habit.id, habit.name, habit.completed, habit.streak, habit.icon]
      )
    }

    for (const transaction of data.transactions) {
      await client.query(
        `INSERT INTO transactions (id, description, amount, type, date, category) VALUES ($1, $2, $3, $4, $5, $6)`,
        [transaction.id, transaction.description, transaction.amount, transaction.type, transaction.date, transaction.category]
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
