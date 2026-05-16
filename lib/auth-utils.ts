import { Pool } from "pg"

let pool: Pool | null = null

function getPool(): Pool {
  if (!pool) {
    const connectionString = process.env.DATABASE_URL
    if (!connectionString) {
      throw new Error("Missing DATABASE_URL environment variable")
    }

    const poolConfig: any = { connectionString }
    if (connectionString.includes("supabase.co")) {
      poolConfig.ssl = { rejectUnauthorized: false }
    }

    pool = new Pool(poolConfig)
  }
  return pool
}

async function ensureUsersTable() {
  const pool = getPool()
  await pool.query(`
    CREATE TABLE IF NOT EXISTS users (
      id TEXT PRIMARY KEY,
      name TEXT NOT NULL,
      email TEXT UNIQUE NOT NULL,
      password_hash TEXT NOT NULL,
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    )
  `)
}

// Simple hash function using Node's crypto
// In production, use bcrypt for better security
async function hashPassword(password: string): Promise<string> {
  // Create a consistent salt from environment or use a default
  const salt = process.env.PASSWORD_SALT || "due-default-salt-2024"
  
  // Hash the password with salt using SHA-256
  const encoder = new TextEncoder()
  const data = encoder.encode(password + salt)
  const hashBuffer = await crypto.subtle.digest("SHA-256", data)
  const hashArray = Array.from(new Uint8Array(hashBuffer))
  return hashArray.map((b) => b.toString(16).padStart(2, "0")).join("")
}

async function verifyPassword(password: string, hash: string): Promise<boolean> {
  const newHash = await hashPassword(password)
  return newHash === hash
}

export async function registerUser(name: string, email: string, password: string) {
  const pool = getPool()
  await ensureUsersTable()

  const existingUser = await pool.query("SELECT id FROM users WHERE email = $1", [email])
  if (existingUser.rows.length > 0) {
    throw new Error("Este correo ya está registrado")
  }

  const id = crypto.randomUUID()
  const passwordHash = await hashPassword(password)

  await pool.query(
    "INSERT INTO users (id, name, email, password_hash) VALUES ($1, $2, $3, $4)",
    [id, name, email, passwordHash]
  )

  return { id, name, email }
}

export async function loginUser(email: string, password: string) {
  const pool = getPool()
  await ensureUsersTable()

  const result = await pool.query("SELECT id, name, email, password_hash FROM users WHERE email = $1", [email])

  if (result.rows.length === 0) {
    throw new Error("Usuario no encontrado")
  }

  const user = result.rows[0]
  const isValid = await verifyPassword(password, user.password_hash)

  if (!isValid) {
    throw new Error("Contraseña incorrecta")
  }

  return { id: user.id, name: user.name, email: user.email }
}
