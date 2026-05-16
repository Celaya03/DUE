import { NextResponse } from "next/server"
import { loginUser } from "@/lib/auth-utils"

export async function POST(request: Request) {
  try {
    const { email, password } = await request.json()

    if (!email || !password) {
      return NextResponse.json(
        { error: "Email y contraseña requeridos" },
        { status: 400 }
      )
    }

    const user = await loginUser(email, password)

    // Crear cookie de sesión segura (HTTP-only)
    const response = NextResponse.json(
      { user, message: "Login exitoso" },
      { status: 200 }
    )

    // Guardar sesión en cookie HTTP-only
    response.cookies.set("due_auth_session", JSON.stringify(user), {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      maxAge: 60 * 60 * 24 * 7, // 7 días
    })

    return response
  } catch (error: any) {
    return NextResponse.json(
      { error: error.message || "Error en el login" },
      { status: 401 }
    )
  }
}
