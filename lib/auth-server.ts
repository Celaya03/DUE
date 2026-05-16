import { cookies } from "next/headers"

export async function getAuthenticatedUserId(): Promise<string | null> {
  try {
    const cookieStore = await cookies()
    const sessionCookie = cookieStore.get("due_auth_session")
    
    if (!sessionCookie) {
      return null
    }

    const user = JSON.parse(sessionCookie.value)
    return user?.id || null
  } catch {
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

    const user = JSON.parse(sessionCookie.value)
    return user || null
  } catch {
    return null
  }
}
