"use client"

import { useEffect, useState } from "react"
import { Sidebar } from "./dashboard/sidebar"
import { DashboardOverview } from "./dashboard/dashboard-overview"
import { KanbanBoard } from "./kanban/kanban-board"
import { HabitsView } from "./habits/habits-view"
import { FinanceView } from "./finance/finance-view"
import type { Task, Habit, Transaction } from "@/lib/types"
import { useAuth } from "@/lib/auth-context"
import { cn } from "@/lib/utils"
import { toast } from "@/hooks/use-toast"

type View = "dashboard" | "kanban" | "finance" | "habits"

export function AppShell() {
  const { user } = useAuth()
  const [currentView, setCurrentView] = useState<View>("dashboard")
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false)
  const [reminderSent, setReminderSent] = useState(false)
  const [dataLoaded, setDataLoaded] = useState(false)

  const [tasks, setTasks] = useState<Task[]>([])
  const [habits, setHabits] = useState<Habit[]>([])
  const [transactions, setTransactions] = useState<Transaction[]>([])

  useEffect(() => {
    if (!user) return

    let active = true

    const loadData = async () => {
      try {
        const response = await fetch(`/api/data`)
        if (!response.ok) return
        const data = (await response.json()) as {
          tasks: Task[]
          habits: Habit[]
          transactions: Transaction[]
        }

        if (!active) return
        setTasks(data.tasks ?? [])
        setHabits(data.habits ?? [])
        setTransactions(data.transactions ?? [])
      } catch (error) {
        console.error("Error loading app data:", error)
      } finally {
        if (active) setDataLoaded(true)
      }
    }

    loadData()
    return () => {
      active = false
    }
  }, [user])

  useEffect(() => {
    if (!user || !dataLoaded) return

    const saveData = async () => {
      try {
        await fetch(`/api/data`, {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ tasks, habits, transactions }),
        })
      } catch (error) {
        console.error("Error saving app data:", error)
      }
    }

    saveData()
  }, [user, dataLoaded, tasks, habits, transactions])

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

  if (!user) {
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
