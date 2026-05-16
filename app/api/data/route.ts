import { NextResponse } from "next/server"
import { getAppData, saveAppData } from "@/lib/db"

const getUserId = (request: Request) => {
  const url = new URL(request.url)
  return url.searchParams.get("userId") || null
}

export async function GET(request: Request) {
  const userId = getUserId(request)
  if (!userId) {
    return NextResponse.json({ error: "Missing userId" }, { status: 400 })
  }

  const data = await getAppData(userId)
  return NextResponse.json(data)
}

export async function PUT(request: Request) {
  const payload = await request.json()
  const userId = payload?.userId || getUserId(request)

  if (
    !userId ||
    !payload ||
    !Array.isArray(payload.tasks) ||
    !Array.isArray(payload.habits) ||
    !Array.isArray(payload.transactions)
  ) {
    return NextResponse.json({ error: "Invalid payload or missing userId" }, { status: 400 })
  }

  await saveAppData(userId, {
    tasks: payload.tasks,
    habits: payload.habits,
    transactions: payload.transactions,
  })

  return NextResponse.json({ success: true })
}
