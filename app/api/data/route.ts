import { NextResponse } from "next/server"
import { getAppData, saveAppData } from "@/lib/db"
import { getAuthenticatedUserId } from "@/lib/auth-server"

export async function GET(request: Request) {
  // Obtener userId desde la sesión segura, NO del cliente
  const userId = await getAuthenticatedUserId()
  
  if (!userId) {
    return NextResponse.json({ error: "No autenticado" }, { status: 401 })
  }

  const data = await getAppData(userId)
  return NextResponse.json(data)
}

export async function PUT(request: Request) {
  // Obtener userId desde la sesión segura, NO del cliente
  const userId = await getAuthenticatedUserId()
  
  if (!userId) {
    return NextResponse.json({ error: "No autenticado" }, { status: 401 })
  }

  const payload = await request.json()

  if (
    !payload ||
    !Array.isArray(payload.tasks) ||
    !Array.isArray(payload.habits) ||
    !Array.isArray(payload.transactions)
  ) {
    return NextResponse.json({ error: "Payload inválido" }, { status: 400 })
  }

  await saveAppData(userId, {
    tasks: payload.tasks,
    habits: payload.habits,
    transactions: payload.transactions,
  })

  return NextResponse.json({ success: true })
}

