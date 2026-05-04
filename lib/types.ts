export type TaskStatus = "pendiente" | "en-proceso" | "completado"
export type TaskPriority = "alta" | "media" | "baja"

export interface Task {
  id: string
  title: string
  description?: string
  status: TaskStatus
  priority: TaskPriority
  dueDate?: string
  createdAt: string
}

export interface Habit {
  id: string
  name: string
  completed: boolean
  streak: number
  icon: string
}

export interface Transaction {
  id: string
  description: string
  amount: number
  type: "ingreso" | "gasto"
  date: string
  category: string
}

export interface User {
  id: string
  name: string
  email: string
}
