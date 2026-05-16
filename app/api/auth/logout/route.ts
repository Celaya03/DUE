import { NextResponse } from "next/server"

export async function POST() {
  const response = NextResponse.json(
    { message: "Logout exitoso" },
    { status: 200 }
  )

  // Eliminar cookie de sesión
  response.cookies.delete("due_auth_session")

  return response
}
