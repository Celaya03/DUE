import { NextResponse } from "next/server"
import { recreateTables } from "@/lib/db"

export async function POST() {
  try {
    await recreateTables()
    
    return NextResponse.json({
      success: true,
      message: "Tables recreated successfully with composite primary keys (id, user_id)",
    })
  } catch (error) {
    console.error("Migration error:", error)
    return NextResponse.json(
      { success: false, error: error instanceof Error ? error.message : "Unknown error" },
      { status: 500 }
    )
  }
}
