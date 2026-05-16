export async function verifySession(): Promise<boolean> {
  try {
    const response = await fetch("/api/auth/verify", {
      method: "GET",
    })
    return response.ok
  } catch {
    return false
  }
}

export async function logout(): Promise<void> {
  try {
    await fetch("/api/auth/logout", { method: "POST" })
  } catch (error) {
    console.error("Error during logout:", error)
  }
}
