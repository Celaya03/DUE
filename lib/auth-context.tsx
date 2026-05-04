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

    const users = getStoredUsers()
    const existingUser = users.find((u) => u.email.toLowerCase() === email.toLowerCase())
    
    if (!existingUser) {
      return { success: false, error: "Usuario no encontrado. Por favor regístrate primero." }
    }
    
    if (existingUser.password !== password) {
      return { success: false, error: "Contraseña incorrecta" }
    }

    const sessionUser: User = {
      id: existingUser.id,
      name: existingUser.name,
      email: existingUser.email,
    }
    
    setUser(sessionUser)
    localStorage.setItem("due_session", JSON.stringify(sessionUser))
    return { success: true }
  }

  const register = async (name: string, email: string, password: string): Promise<{ success: boolean; error?: string }> => {
    await new Promise((resolve) => setTimeout(resolve, 600))
    
    if (!name || !email || password.length < 6) {
      return { success: false, error: "Todos los campos son requeridos (contraseña min. 6 caracteres)" }
    }

    const users = getStoredUsers()
    const existingUser = users.find((u) => u.email.toLowerCase() === email.toLowerCase())
    
    if (existingUser) {
      return { success: false, error: "Este correo ya está registrado. Inicia sesión." }
    }

    const newUser: StoredUser = {
      id: crypto.randomUUID(),
      name,
      email,
      password,
    }
    
    users.push(newUser)
    saveStoredUsers(users)

    const sessionUser: User = {
      id: newUser.id,
      name: newUser.name,
      email: newUser.email,
    }
    
    setUser(sessionUser)
    localStorage.setItem("due_session", JSON.stringify(sessionUser))
    return { success: true }
  }

  const logout = () => {
    setUser(null)
    localStorage.removeItem("due_session")
    // No eliminamos due_users para que pueda volver a ingresar
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
