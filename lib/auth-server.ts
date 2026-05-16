import { cookies } from "next/headers"

export async function getAuthenticatedUserId(): Promise<string | null> {
  try {
    const cookieStore = await cookies()
    const sessionCookie = cookieStore.get("due_auth_session")
    
    if (!sessionCookie) {
      return null
    }

    // Decodificar la cookie si es necesario
    let cookieValue = sessionCookie.value
    try {
      cookieValue = decodeURIComponent(cookieValue)
    } catch {
      // Si no se puede decodificar, usar el valor original
    }

    const user = JSON.parse(cookieValue)
    return user?.id || null
  } catch (error) {
    console.error("[v0] Error getting authenticated user ID:", error)
    return null
  }
}

export async function getAuthenticatedUser(): Promise<{ id: string; name: string; email: string } | null> {
  try {
    const cookieStore = await cookies()
    const sessionCookie = cookieStore.get("due_auth_session")
    
    if (!sessionCookie) {
      return null
    }

    // Decodificar la cookie si es necesario
    let cookieValue = sessionCookie.value
    try {
      cookieValue = decodeURIComponent(cookieValue)
    } catch {
      // Si no se puede decodificar, usar el valor original
    }

    const user = JSON.parse(cookieValue)
    return user || null
  } catch (error) {
    console.error("[v0] Error getting authenticated user:", error)
    return null
  }
}
