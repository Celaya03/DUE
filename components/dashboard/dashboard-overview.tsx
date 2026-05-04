"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { StatCard } from "./stat-card"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import type { Task, Habit, Transaction } from "@/lib/types"
import {
  ListTodo,
  Clock,
  CheckCircle2,
  Wallet,
  TrendingUp,
  TrendingDown,
  Target,
  Dumbbell,
  BookOpen,
  Brain,
  Droplet,
} from "lucide-react"
import { cn } from "@/lib/utils"

interface DashboardOverviewProps {
  tasks: Task[]
  habits: Habit[]
  transactions: Transaction[]
}

const habitIcons: Record<string, React.ComponentType<{ className?: string }>> = {
  dumbbell: Dumbbell,
  book: BookOpen,
  brain: Brain,
  droplet: Droplet,
}

export function DashboardOverview({ tasks, habits, transactions }: DashboardOverviewProps) {
  const pendingTasks = tasks.filter((t) => t.status === "pendiente").length
  const inProgressTasks = tasks.filter((t) => t.status === "en-proceso").length
  const completedTasks = tasks.filter((t) => t.status === "completado").length
  const completedHabits = habits.filter((h) => h.completed).length
  const totalIncome = transactions.filter((t) => t.type === "ingreso").reduce((a, b) => a + b.amount, 0)
  const totalExpenses = transactions.filter((t) => t.type === "gasto").reduce((a, b) => a + b.amount, 0)
  const balance = totalIncome - totalExpenses

  const urgentTasks = tasks
    .filter((t) => t.status !== "completado" && t.priority === "alta")
    .slice(0, 3)

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-foreground">Dashboard</h1>
        <p className="text-muted-foreground">Resumen de tu día - {new Date().toLocaleDateString("es-ES", { weekday: "long", day: "numeric", month: "long" })}</p>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard
          title="Tareas Pendientes"
          value={pendingTasks}
          subtitle={`${completedTasks} completadas hoy`}
          icon={ListTodo}
          variant="primary"
        />
        <StatCard
          title="En Proceso"
          value={inProgressTasks}
          icon={Clock}
          variant="warning"
        />
        <StatCard
          title="Hábitos Completados"
          value={`${completedHabits}/${habits.length}`}
          subtitle={`${Math.round((completedHabits / habits.length) * 100)}% del día`}
          icon={Target}
          variant="success"
        />
        <StatCard
          title="Saldo Actual"
          value={`$${balance.toLocaleString()}`}
          icon={Wallet}
          trend={{ value: 12, isPositive: balance > 0 }}
          variant={balance >= 0 ? "success" : "destructive"}
        />
      </div>

      {/* Content Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Urgent Tasks */}
        <Card className="lg:col-span-2">
          <CardHeader className="flex flex-row items-center justify-between">
            <CardTitle className="text-lg">Tareas Urgentes</CardTitle>
            <Badge variant="destructive">{urgentTasks.length} pendientes</Badge>
          </CardHeader>
          <CardContent className="space-y-3">
            {urgentTasks.length === 0 ? (
              <div className="text-center py-8 text-muted-foreground">
                <CheckCircle2 className="h-12 w-12 mx-auto mb-2 text-success" />
                <p>No hay tareas urgentes pendientes</p>
              </div>
            ) : (
              urgentTasks.map((task) => (
                <div
                  key={task.id}
                  className="flex items-center justify-between p-3 rounded-lg bg-muted/50 hover:bg-muted transition-colors"
                >
                  <div className="flex items-center gap-3">
                    <div className="w-2 h-2 rounded-full bg-destructive" />
                    <div>
                      <p className="font-medium text-foreground">{task.title}</p>
                      {task.dueDate && (
                        <p className="text-xs text-muted-foreground">
                          Vence: {new Date(task.dueDate).toLocaleDateString("es-ES")}
                        </p>
                      )}
                    </div>
                  </div>
                  <Badge variant="outline" className={cn(
                    task.status === "pendiente" && "border-warning text-warning",
                    task.status === "en-proceso" && "border-info text-info"
                  )}>
                    {task.status === "pendiente" ? "Pendiente" : "En proceso"}
                  </Badge>
                </div>
              ))
            )}
          </CardContent>
        </Card>

        {/* Habits Progress */}
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Hábitos del Día</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {habits.map((habit) => {
              const IconComponent = habitIcons[habit.icon] || Target
              return (
                <div key={habit.id} className="flex items-center gap-3">
                  <div
                    className={cn(
                      "p-2 rounded-lg",
                      habit.completed ? "bg-success/20 text-success" : "bg-muted text-muted-foreground"
                    )}
                  >
                    <IconComponent className="h-4 w-4" />
                  </div>
                  <div className="flex-1">
                    <div className="flex items-center justify-between">
                      <p className={cn("text-sm font-medium", habit.completed && "line-through text-muted-foreground")}>
                        {habit.name}
                      </p>
                      <span className="text-xs text-muted-foreground">{habit.streak} días</span>
                    </div>
                    <Progress value={habit.completed ? 100 : 0} className="h-1.5 mt-1" />
                  </div>
                </div>
              )
            })}
          </CardContent>
        </Card>
      </div>

      {/* Finance Summary */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Card>
          <CardHeader className="flex flex-row items-center gap-2">
            <TrendingUp className="h-5 w-5 text-success" />
            <CardTitle className="text-lg">Ingresos</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-3xl font-bold text-success">${totalIncome.toLocaleString()}</p>
            <div className="mt-4 space-y-2">
              {transactions
                .filter((t) => t.type === "ingreso")
                .slice(0, 3)
                .map((t) => (
                  <div key={t.id} className="flex justify-between text-sm">
                    <span className="text-muted-foreground">{t.description}</span>
                    <span className="text-success">+${t.amount}</span>
                  </div>
                ))}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center gap-2">
            <TrendingDown className="h-5 w-5 text-destructive" />
            <CardTitle className="text-lg">Gastos</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-3xl font-bold text-destructive">${totalExpenses.toLocaleString()}</p>
            <div className="mt-4 space-y-2">
              {transactions
                .filter((t) => t.type === "gasto")
                .slice(0, 3)
                .map((t) => (
                  <div key={t.id} className="flex justify-between text-sm">
                    <span className="text-muted-foreground">{t.description}</span>
                    <span className="text-destructive">-${t.amount}</span>
                  </div>
                ))}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
