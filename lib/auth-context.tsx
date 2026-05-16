"use client"

import { createContext, useContext, useState, useEffect, type ReactNode } from "react"
import type { User } from "./types"

interface StoredUser extends User {
  password: string
}

interface AuthContextType {
  user: User | null
  isLoading: boolean
  login: (email: string, password: string) => Promise<{ success: boolean; error?: string }>
  register: (name: string, email: string, password: string) => Promise<{ success: boolean; error?: string }>
  logout: () => void
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

// Funciones para manejar usuarios registrados
const getStoredUsers = (): StoredUser[] => {
  if (typeof window === "undefined") return []
  const users = localStorage.getItem("due_users")
  return users ? JSON.parse(users) : []
}

const saveStoredUsers = (users: StoredUser[]) => {
  localStorage.setItem("due_users", JSON.stringify(users))
}

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null)
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    // Verificar sesión activa
    const savedSession = typeof window !== "undefined" ? localStorage.getItem("due_session") : null
    if (savedSession) {
      const sessionUser = JSON.parse(savedSession)
      setUser(sessionUser)
    }
    setIsLoading(false)
  }, [])

  const login = async (email: string, password: string): Promise<{ success: boolean; error?: string }> => {
    await new Promise((resolve) => setTimeout(resolve, 600))
    
    if (!email || password.length < 6) {
      return { success: false, error: "Email y contraseña (min. 6 caracteres) requeridos" }
    }

    try {
      const response = await fetch("/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
      })

      const data = await response.json()
      
      if (!response.ok) {
        return { success: false, error: data.error || "Error en el login" }
      }

      const sessionUser: User = {
        id: data.user.id,
        name: data.user.name,
        email: data.user.email,
      }
      
      setUser(sessionUser)
      localStorage.setItem("due_session", JSON.stringify(sessionUser))
      return { success: true }
    } catch (error) {
      return { success: false, error: "Error al conectar con el servidor" }
    }
  }

  const register = async (name: string, email: string, password: string): Promise<{ success: boolean; error?: string }> => {
    await new Promise((resolve) => setTimeout(resolve, 600))
    
    if (!name || !email || password.length < 6) {
      return { success: false, error: "Todos los campos son requeridos (contraseña min. 6 caracteres)" }
    }

    try {
      const response = await fetch("/api/auth/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name, email, password }),
      })

      const data = await response.json()
      
      if (!response.ok) {
        return { success: false, error: data.error || "Error en el registro" }
      }

      const sessionUser: User = {
        id: data.user.id,
        name: data.user.name,
        email: data.user.email,
      }
      
      setUser(sessionUser)
      localStorage.setItem("due_session", JSON.stringify(sessionUser))
      return { success: true }
    } catch (error) {
      return { success: false, error: "Error al conectar con el servidor" }
    }
  }

  const logout = () => {
    setUser(null)
    localStorage.removeItem("due_session")
    
    // Notificar al servidor para limpiar la sesión
    fetch("/api/auth/logout", { method: "POST" }).catch((error) => {
      console.error("Error al hacer logout:", error)
    })
  }

  return (
    <AuthContext.Provider value={{ user, isLoading, login, register, logout }}>
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  const context = useContext(AuthContext)
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider")
  }
  return context
}
