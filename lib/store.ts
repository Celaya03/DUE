import type { Task, Habit, Transaction } from "./types"

export const storageKeys = {
  tasks: "due_tasks",
  habits: "due_habits",
  transactions: "due_transactions",
}

export const loadFromStorage = <T,>(key: string, fallback: T): T => {
  if (globalThis.window === undefined) return fallback

  try {
    const raw = globalThis.window.localStorage.getItem(key)
    return raw ? (JSON.parse(raw) as T) : fallback
  } catch {
    return fallback
  }
}

export const saveToStorage = <T,>(key: string, data: T) => {
  if (globalThis.window === undefined) return
  globalThis.window.localStorage.setItem(key, JSON.stringify(data))
}

// Datos iniciales de demo
export const initialTasks: Task[] = [
  {
    id: "1",
    title: "Revisar propuesta del cliente",
    description: "Analizar y aprobar la propuesta de diseño",
    status: "pendiente",
    priority: "alta",
    dueDate: "2026-05-04",
    createdAt: "2026-05-01",
  },
  {
    id: "2",
    title: "Llamada con el equipo de desarrollo",
    description: "Reunión semanal de sincronización",
    status: "en-proceso",
    priority: "media",
    dueDate: "2026-05-03",
    createdAt: "2026-05-01",
  },
  {
    id: "3",
    title: "Actualizar documentación",
    description: "Completar la documentación del API",
    status: "completado",
    priority: "baja",
    dueDate: "2026-05-02",
    createdAt: "2026-04-28",
  },
  {
    id: "4",
    title: "Preparar presentación trimestral",
    description: "Crear slides para la junta directiva",
    status: "pendiente",
    priority: "alta",
    dueDate: "2026-05-05",
    createdAt: "2026-05-01",
  },
  {
    id: "5",
    title: "Revisar código del sprint",
    description: "Code review pendiente",
    status: "en-proceso",
    priority: "media",
    dueDate: "2026-05-03",
    createdAt: "2026-05-02",
  },
]

export const initialHabits: Habit[] = [
  { id: "1", name: "Ejercicio matutino", completed: true, streak: 12, icon: "dumbbell" },
  { id: "2", name: "Lectura 30 min", completed: false, streak: 5, icon: "book" },
  { id: "3", name: "Meditación", completed: true, streak: 8, icon: "brain" },
  { id: "4", name: "Agua 2L", completed: false, streak: 3, icon: "droplet" },
]

export const initialTransactions: Transaction[] = [
  { id: "1", description: "Salario", amount: 3500, type: "ingreso", date: "2026-05-01", category: "Trabajo" },
  { id: "2", description: "Supermercado", amount: 120, type: "gasto", date: "2026-05-02", category: "Alimentación" },
  { id: "3", description: "Netflix", amount: 15, type: "gasto", date: "2026-05-01", category: "Entretenimiento" },
  { id: "4", description: "Freelance", amount: 500, type: "ingreso", date: "2026-04-30", category: "Trabajo" },
  { id: "5", description: "Gasolina", amount: 60, type: "gasto", date: "2026-05-03", category: "Transporte" },
]
