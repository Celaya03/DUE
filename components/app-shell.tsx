"use client"

import { useEffect, useState } from "react"
import { Sidebar } from "./dashboard/sidebar"
import { DashboardOverview } from "./dashboard/dashboard-overview"
import { KanbanBoard } from "./kanban/kanban-board"
import { HabitsView } from "./habits/habits-view"
import { FinanceView } from "./finance/finance-view"
import type { Task, Habit, Transaction } from "@/lib/types"
import { useAuth } from "@/lib/auth-context"
import { getUserStorageKeys, loadFromStorage, saveToStorage } from "@/lib/store"
import { cn } from "@/lib/utils"
import { toast } from "@/hooks/use-toast"

type View = "dashboard" | "kanban" | "finance" | "habits"

export function AppShell() {
  const { user } = useAuth()
  const [currentView, setCurrentView] = useState<View>("dashboard")
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false)
  const [reminderSent, setReminderSent] = useState(false)
  const storageKeys = user ? getUserStorageKeys(user.id) : null

  const [tasks, setTasks] = useState<Task[]>(() =>
    storageKeys ? loadFromStorage(storageKeys.tasks, []) : []
  )
  const [habits, setHabits] = useState<Habit[]>(() =>
    storageKeys ? loadFromStorage(storageKeys.habits, []) : []
  )
  const [transactions, setTransactions] = useState<Transaction[]>(() =>
    storageKeys ? loadFromStorage(storageKeys.transactions, []) : []
  )

  useEffect(() => {
    if (!storageKeys) return
    saveToStorage(storageKeys.tasks, tasks)
  }, [storageKeys, tasks])

  useEffect(() => {
    if (!storageKeys) return
    saveToStorage(storageKeys.habits, habits)
  }, [storageKeys, habits])

  useEffect(() => {
    if (!storageKeys) return
    saveToStorage(storageKeys.transactions, transactions)
  }, [storageKeys, transactions])

  useEffect(() => {
    if (reminderSent || !tasks.length) return

    const today = new Date().toISOString().split("T")[0]
    const dueTasks = tasks.filter(
      (task) => task.dueDate && task.dueDate <= today && task.status !== "completado"
    )

    if (dueTasks.length > 0) {
      toast({
        title: "Recordatorio de tareas",
        description: `Tienes ${dueTasks.length} tarea(s) con fecha de hoy o atrasadas.`,
      })
      setReminderSent(true)
      return
    }

    const pendingCount = tasks.filter((task) => task.status === "pendiente").length
    if (pendingCount > 0) {
      toast({
        title: "Tareas pendientes",
        description: `Aún tienes ${pendingCount} tareas pendientes. Organiza tu día.`,
      })
      setReminderSent(true)
    }
  }, [reminderSent, tasks])

  if (!user || !storageKeys) {
    return null
  }

  const renderView = () => {
    switch (currentView) {
      case "dashboard":
        return (
          <DashboardOverview
            userName={user.name}
            tasks={tasks}
            habits={habits}
            transactions={transactions}
          />
        )
      case "kanban":
        return <KanbanBoard tasks={tasks} onTasksChange={setTasks} />
      case "habits":
        return <HabitsView habits={habits} onHabitsChange={setHabits} />
      case "finance":
        return (
          <FinanceView transactions={transactions} onTransactionsChange={setTransactions} />
        )
      default:
        return null
    }
  }

  return (
    <div className="min-h-screen bg-background">
      <Sidebar
        currentView={currentView}
        onViewChange={setCurrentView}
        collapsed={sidebarCollapsed}
        onCollapsedChange={setSidebarCollapsed}
      />
      <main
        className={cn(
          "transition-all duration-300 min-h-screen",
          sidebarCollapsed ? "ml-16" : "ml-64"
        )}
      >
        <div className="p-6 max-w-7xl mx-auto">{renderView()}</div>
      </main>
    </div>
  )
}
