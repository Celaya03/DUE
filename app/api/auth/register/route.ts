import { NextResponse } from "next/server"
import { registerUser } from "@/lib/auth-utils"

export async function POST(request: Request) {
  try {
    const { name, email, password } = await request.json()

    if (!name || !email || !password) {
      return NextResponse.json(
        { error: "Nombre, email y contraseña requeridos" },
        { status: 400 }
      )
    }

    if (password.length < 6) {
      return NextResponse.json(
        { error: "La contraseña debe tener al menos 6 caracteres" },
        { status: 400 }
      )
    }

    const user = await registerUser(name, email, password)

    // Crear cookie de sesión segura (HTTP-only)
    const response = NextResponse.json(
      { user, message: "Registro exitoso" },
      { status: 201 }
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
      { error: error.message || "Error en el registro" },
      { status: 400 }
    )
  }
}
