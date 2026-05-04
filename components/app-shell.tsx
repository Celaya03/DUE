"use client"

import { useState } from "react"
import { Sidebar } from "./dashboard/sidebar"
import { DashboardOverview } from "./dashboard/dashboard-overview"
import { KanbanBoard } from "./kanban/kanban-board"
import { HabitsView } from "./habits/habits-view"
import { FinanceView } from "./finance/finance-view"
import type { Task, Habit, Transaction } from "@/lib/types"
import { initialTasks, initialHabits, initialTransactions } from "@/lib/store"
import { cn } from "@/lib/utils"

type View = "dashboard" | "kanban" | "finance" | "habits"

export function AppShell() {
  const [currentView, setCurrentView] = useState<View>("dashboard")
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false)
  const [tasks, setTasks] = useState<Task[]>(initialTasks)
  const [habits, setHabits] = useState<Habit[]>(initialHabits)
  const [transactions, setTransactions] = useState<Transaction[]>(initialTransactions)

  const renderView = () => {
    switch (currentView) {
      case "dashboard":
        return (
          <DashboardOverview tasks={tasks} habits={habits} transactions={transactions} />
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
