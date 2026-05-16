"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { StatCard } from "./stat-card"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import { ChartContainer, ChartTooltip } from "@/components/ui/chart"
import type { Task, Habit, Transaction } from "@/lib/types"
import * as Recharts from "recharts"
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
  userName: string
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

export function DashboardOverview({ userName, tasks, habits, transactions }: DashboardOverviewProps) {
  const pendingTasks = tasks.filter((t) => t.status === "pendiente").length
  const inProgressTasks = tasks.filter((t) => t.status === "en-proceso").length
  const completedTasks = tasks.filter((t) => t.status === "completado").length
  const completedHabits = habits.filter((h) => h.completed).length
  const totalIncome = transactions.filter((t) => t.type === "ingreso").reduce((a, b) => a + b.amount, 0)
  const totalExpenses = transactions.filter((t) => t.type === "gasto").reduce((a, b) => a + b.amount, 0)
  const balance = totalIncome - totalExpenses

  const taskCompletionPercent = tasks.length > 0 ? Math.round((completedTasks / tasks.length) * 100) : 0
  const habitCompletionPercent = habits.length > 0 ? Math.round((completedHabits / habits.length) * 100) : 0
  const productivityScore = Math.round(
    tasks.length > 0 && habits.length > 0
      ? (taskCompletionPercent + habitCompletionPercent) / 2
      : tasks.length > 0
      ? taskCompletionPercent
      : habitCompletionPercent
  )

  const urgentTasks = tasks
    .filter((t) => t.status !== "completado" && t.priority === "alta")
    .slice(0, 3)

  const cashFlowData = Object.values(
    transactions
      .slice()
      .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime())
      .reduce<Record<string, { date: string; amount: number }>>((acc, transaction) => {
        const date = transaction.date
        if (!acc[date]) {
          acc[date] = { date, amount: 0 }
        }
        acc[date].amount += transaction.type === "ingreso" ? transaction.amount : -transaction.amount
        return acc
      }, {})
  )
    .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime())
    .reduce(
      (acc, current) => {
        const previousBalance = acc.length > 0 ? acc[acc.length - 1].balance : 0
        acc.push({
          date: current.date,
          balance: previousBalance + current.amount,
          formattedDate: new Date(current.date).toLocaleDateString("es-ES", {
            day: "numeric",
            month: "short",
          }),
        })
        return acc
      },
      [] as Array<{ date: string; balance: number; formattedDate: string }>
    )

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-foreground">Bienvenido, {userName}</h1>
        <p className="text-muted-foreground">Resumen de tu día - {new Date().toLocaleDateString("es-ES", { weekday: "long", day: "numeric", month: "long" })}</p>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
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
          title="Saldo Actual"
          value={`$${balance.toLocaleString()}`}
          icon={Wallet}
          variant={balance >= 0 ? "success" : "destructive"}
        />
        <StatCard
          title="Hábitos Completados"
          value={habits.length > 0 ? `${completedHabits}/${habits.length}` : "0/0"}
          subtitle={
            habits.length > 0
              ? `${Math.round((completedHabits / habits.length) * 100)}% del día`
              : "0% del día"
          }
          icon={Target}
          variant="success"
        />
        <StatCard
          title="Productividad"
          value={`${productivityScore}%`}
          subtitle={`${taskCompletionPercent}% tareas • ${habitCompletionPercent}% hábitos`}
          icon={TrendingUp}
          variant="primary"
        />
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle>Resumen Financiero</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="rounded-2xl border border-border/50 bg-muted/50 p-4">
                <p className="text-sm text-muted-foreground">Ingresos</p>
                <p className="text-2xl font-bold text-success">${totalIncome.toLocaleString()}</p>
              </div>
              <div className="rounded-2xl border border-border/50 bg-muted/50 p-4">
                <p className="text-sm text-muted-foreground">Gastos</p>
                <p className="text-2xl font-bold text-destructive">-${totalExpenses.toLocaleString()}</p>
              </div>
            </div>
            <div className="mt-4 rounded-2xl border border-border/50 bg-muted/50 p-4">
              <p className="text-sm text-muted-foreground">Balance</p>
              <p className={cn("text-3xl font-bold", balance >= 0 ? "text-primary" : "text-destructive")}>${balance.toLocaleString()}</p>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Gastos por categoría</CardTitle>
          </CardHeader>
          <CardContent>
            {transactions.filter((t) => t.type === "gasto").length === 0 ? (
              <p className="text-sm text-muted-foreground">Registra gastos para ver el desglose.</p>
            ) : (
              <div className="space-y-2">
                {Object.entries(
                  transactions.reduce<Record<string, number>>((acc, transaction) => {
                    if (transaction.type === "gasto") {
                      acc[transaction.category] = (acc[transaction.category] || 0) + transaction.amount
                    }
                    return acc
                  }, {})
                )
                  .sort(([, a], [, b]) => b - a)
                  .slice(0, 5)
                  .map(([category, amount]) => (
                    <div key={category} className="flex items-center justify-between">
                      <span className="text-sm text-foreground">{category}</span>
                      <span className="text-sm font-semibold">${amount.toLocaleString()}</span>
                    </div>
                  ))}
              </div>
            )}
          </CardContent>
        </Card>
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
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader className="flex flex-row items-center gap-2">
            <TrendingUp className="h-5 w-5 text-success" />
            <CardTitle className="text-lg">Ingresos</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-3xl font-bold text-success">${totalIncome.toLocaleString()}</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center gap-2">
            <TrendingDown className="h-5 w-5 text-destructive" />
            <CardTitle className="text-lg">Gastos</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-3xl font-bold text-destructive">${totalExpenses.toLocaleString()}</p>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Flujo de caja</CardTitle>
        </CardHeader>
        <CardContent className="p-4">
          {cashFlowData.length === 0 ? (
            <p className="text-muted-foreground text-center py-8">
              Registra transacciones para ver el flujo de caja.
            </p>
          ) : (
            <div className="h-56">
              <ChartContainer
                id="dashboard-cash-flow"
                className="h-full"
                config={{ balance: { label: "Balance", color: "#0ea5e9" } }}
              >
                <Recharts.LineChart data={cashFlowData} margin={{ top: 8, right: 10, left: 0, bottom: 0 }}>
                  <Recharts.CartesianGrid strokeDasharray="3 3" stroke="var(--border)" />
                  <Recharts.XAxis dataKey="formattedDate" stroke="var(--muted-foreground)" tickLine={false} axisLine={false} />
                  <Recharts.YAxis stroke="var(--muted-foreground)" tickLine={false} axisLine={false} />
                  <ChartTooltip />
                  <Recharts.Line type="monotone" dataKey="balance" stroke="#0ea5e9" strokeWidth={3} dot={false} />
                </Recharts.LineChart>
              </ChartContainer>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
