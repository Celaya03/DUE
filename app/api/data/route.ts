import { NextResponse } from "next/server"
import { getAppData, saveAppData } from "@/lib/db"

export async function GET() {
  const data = await getAppData()
  return NextResponse.json(data)
}

export async function PUT(request: Request) {
  const payload = await request.json()

  if (
    !payload ||
    !Array.isArray(payload.tasks) ||
    !Array.isArray(payload.habits) ||
    !Array.isArray(payload.transactions)
  ) {
    return NextResponse.json({ error: "Invalid payload" }, { status: 400 })
  }

  await saveAppData({
    tasks: payload.tasks,
    habits: payload.habits,
    transactions: payload.transactions,
  })

  return NextResponse.json({ success: true })
}
