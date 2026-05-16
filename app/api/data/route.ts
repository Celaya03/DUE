import { NextResponse } from "next/server"
import { getAppData, saveAppData } from "@/lib/db"

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url)

    const userId = searchParams.get("userId")

    if (!userId) {
      return NextResponse.json(
        { error: "Usuario no autenticado" },
        { status: 401 }
      )
    }

    const data = await getAppData(userId)

    return NextResponse.json(data)
  } catch (error) {
    console.error("GET /api/data error:", error)

    return NextResponse.json(
      { error: "Error cargando datos" },
      { status: 500 }
    )
  }
}

export async function PUT(request: Request) {
  try {
    const { searchParams } = new URL(request.url)

    const userId = searchParams.get("userId")

    if (!userId) {
      return NextResponse.json(
        { error: "Usuario no autenticado" },
        { status: 401 }
      )
    }

    const payload = await request.json()

    await saveAppData(userId, {
      tasks: payload.tasks || [],
      habits: payload.habits || [],
      transactions: payload.transactions || [],
    })

    return NextResponse.json({
      success: true,
    })
  } catch (error) {
    console.error("PUT /api/data error:", error)

    return NextResponse.json(
      { error: "Error guardando datos" },
      { status: 500 }
    )
  }
}