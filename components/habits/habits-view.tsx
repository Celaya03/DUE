"use client"

import { useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Progress } from "@/components/ui/progress"
import { Badge } from "@/components/ui/badge"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { FieldGroup, Field, FieldLabel } from "@/components/ui/field"
import type { Habit } from "@/lib/types"
import {
  Check,
  Flame,
  Target,
  Dumbbell,
  BookOpen,
  Brain,
  Droplet,
  Plus,
  MoreHorizontal,
  Pencil,
  Trash2,
} from "lucide-react"
import { cn } from "@/lib/utils"

interface HabitsViewProps {
  habits: Habit[]
  onHabitsChange: (habits: Habit[]) => void
}

const habitIcons: Record<string, React.ComponentType<{ className?: string }>> = {
  dumbbell: Dumbbell,
  book: BookOpen,
  brain: Brain,
  droplet: Droplet,
  target: Target,
}

const iconOptions = [
  { value: "dumbbell", label: "Ejercicio", Icon: Dumbbell },
  { value: "book", label: "Lectura", Icon: BookOpen },
  { value: "brain", label: "Mente", Icon: Brain },
  { value: "droplet", label: "Agua", Icon: Droplet },
  { value: "target", label: "Meta", Icon: Target },
]

const emptyHabit = {
  name: "",
  icon: "target",
}

export function HabitsView({ habits, onHabitsChange }: HabitsViewProps) {
  const [isDialogOpen, setIsDialogOpen] = useState(false)
  const [editingHabit, setEditingHabit] = useState<Habit | null>(null)
  const [formData, setFormData] = useState(emptyHabit)

  const completedCount = habits.filter((h) => h.completed).length
  const completionPercentage = habits.length > 0 ? Math.round((completedCount / habits.length) * 100) : 0

  const openNewDialog = () => {
    setEditingHabit(null)
    setFormData(emptyHabit)
    setIsDialogOpen(true)
  }

  const openEditDialog = (habit: Habit) => {
    setEditingHabit(habit)
    setFormData({
      name: habit.name,
      icon: habit.icon,
    })
    setIsDialogOpen(true)
  }

  const handleSave = () => {
    if (formData.name.trim()) {
      if (editingHabit) {
        // Editar existente
        onHabitsChange(
          habits.map((h) =>
            h.id === editingHabit.id
              ? {
                  ...h,
                  name: formData.name,
                  icon: formData.icon,
                }
              : h
          )
        )
      } else {
        // Crear nuevo
        const newHabit: Habit = {
          id: crypto.randomUUID(),
          name: formData.name,
          icon: formData.icon,
          completed: false,
          streak: 0,
        }
        onHabitsChange([...habits, newHabit])
      }
      setIsDialogOpen(false)
      setFormData(emptyHabit)
      setEditingHabit(null)
    }
  }

  const handleDelete = (id: string) => {
    onHabitsChange(habits.filter((h) => h.id !== id))
  }

  const toggleHabit = (habitId: string) => {
    onHabitsChange(
      habits.map((h) =>
        h.id === habitId
          ? {
              ...h,
              completed: !h.completed,
              streak: !h.completed ? h.streak + 1 : Math.max(0, h.streak - 1),
            }
          : h
      )
    )
  }

  const resetAllHabits = () => {
    onHabitsChange(habits.map((h) => ({ ...h, completed: false })))
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-foreground">Mis Habitos</h1>
          <p className="text-muted-foreground">Manten tu racha y alcanza tus metas</p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" onClick={resetAllHabits}>
            Reiniciar Dia
          </Button>
          <Button onClick={openNewDialog}>
            <Plus className="h-4 w-4 mr-2" />
            Nuevo Habito
          </Button>
        </div>
      </div>

      {/* Dialog para crear/editar */}
      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>
              {editingHabit ? "Editar Habito" : "Nuevo Habito"}
            </DialogTitle>
            <DialogDescription>
              {editingHabit
                ? "Modifica el nombre o icono de tu habito"
                : "Crea un nuevo habito para tu rutina diaria"}
            </DialogDescription>
          </DialogHeader>
          <FieldGroup className="mt-4">
            <Field>
              <FieldLabel>Nombre del Habito</FieldLabel>
              <Input
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                placeholder="Ej: Hacer ejercicio 30 min"
              />
            </Field>

            <Field>
              <FieldLabel>Icono</FieldLabel>
              <Select
                value={formData.icon}
                onValueChange={(v) => setFormData({ ...formData, icon: v })}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {iconOptions.map((option) => {
                    const IconComp = option.Icon
                    return (
                      <SelectItem key={option.value} value={option.value}>
                        <div className="flex items-center gap-2">
                          <IconComp className="h-4 w-4" />
                          <span>{option.label}</span>
                        </div>
                      </SelectItem>
                    )
                  })}
                </SelectContent>
              </Select>
            </Field>
          </FieldGroup>

          <div className="flex gap-2 mt-4">
            {editingHabit && (
              <Button
                variant="destructive"
                onClick={() => {
                  handleDelete(editingHabit.id)
                  setIsDialogOpen(false)
                }}
                className="flex-1"
              >
                <Trash2 className="h-4 w-4 mr-2" />
                Eliminar
              </Button>
            )}
            <Button onClick={handleSave} className="flex-1">
              {editingHabit ? "Guardar Cambios" : "Crear Habito"}
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      {/* Progress Overview */}
      <Card className="bg-gradient-to-r from-primary/10 to-success/10 border-primary/20">
        <CardContent className="p-6">
          <div className="flex items-center justify-between mb-4">
            <div>
              <p className="text-sm text-muted-foreground">Progreso de Hoy</p>
              <p className="text-3xl font-bold text-foreground">
                {completedCount}/{habits.length}
              </p>
            </div>
            <div className="w-20 h-20 rounded-full bg-background flex items-center justify-center">
              <div className="text-center">
                <span className="text-2xl font-bold text-primary">{completionPercentage}%</span>
              </div>
            </div>
          </div>
          <Progress value={completionPercentage} className="h-3" />
          <p className="text-sm text-muted-foreground mt-2">
            {habits.length === 0
              ? "Agrega tu primer habito para comenzar"
              : completionPercentage === 100
                ? "Excelente! Completaste todos tus habitos de hoy"
                : `Te faltan ${habits.length - completedCount} habitos por completar`}
          </p>
        </CardContent>
      </Card>

      {/* Habits Grid */}
      {habits.length === 0 ? (
        <Card>
          <CardContent className="p-12 text-center">
            <Target className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
            <h3 className="text-lg font-semibold text-foreground mb-2">Sin habitos</h3>
            <p className="text-muted-foreground mb-4">
              Comienza agregando tu primer habito para hacer seguimiento
            </p>
            <Button onClick={openNewDialog}>
              <Plus className="h-4 w-4 mr-2" />
              Agregar Habito
            </Button>
          </CardContent>
        </Card>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {habits.map((habit) => {
            const IconComponent = habitIcons[habit.icon] || Target
            return (
              <Card
                key={habit.id}
                className={cn(
                  "transition-all hover:shadow-lg group",
                  habit.completed && "bg-success/5 border-success/30"
                )}
              >
                <CardContent className="p-6">
                  <div className="flex items-start justify-between">
                    <div
                      className="flex items-center gap-4 cursor-pointer flex-1"
                      onClick={() => toggleHabit(habit.id)}
                    >
                      <div
                        className={cn(
                          "p-3 rounded-xl transition-colors",
                          habit.completed
                            ? "bg-success/20 text-success"
                            : "bg-muted text-muted-foreground"
                        )}
                      >
                        <IconComponent className="h-6 w-6" />
                      </div>
                      <div>
                        <h3
                          className={cn(
                            "font-semibold text-foreground",
                            habit.completed && "line-through text-muted-foreground"
                          )}
                        >
                          {habit.name}
                        </h3>
                        <div className="flex items-center gap-2 mt-1">
                          <Flame className="h-4 w-4 text-accent" />
                          <span className="text-sm text-muted-foreground">
                            {habit.streak} dias de racha
                          </span>
                        </div>
                      </div>
                    </div>

                    <div className="flex items-center gap-2">
                      <div
                        onClick={() => toggleHabit(habit.id)}
                        className={cn(
                          "w-8 h-8 rounded-full border-2 flex items-center justify-center transition-all cursor-pointer",
                          habit.completed
                            ? "bg-success border-success text-success-foreground"
                            : "border-border hover:border-primary"
                        )}
                      >
                        {habit.completed && <Check className="h-5 w-5 text-primary-foreground" />}
                      </div>

                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button
                            variant="ghost"
                            size="icon"
                            className="h-8 w-8 opacity-0 group-hover:opacity-100 transition-opacity"
                          >
                            <MoreHorizontal className="h-4 w-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          <DropdownMenuItem onClick={() => openEditDialog(habit)}>
                            <Pencil className="h-4 w-4 mr-2" />
                            Editar
                          </DropdownMenuItem>
                          <DropdownMenuItem
                            onClick={() => handleDelete(habit.id)}
                            className="text-destructive"
                          >
                            <Trash2 className="h-4 w-4 mr-2" />
                            Eliminar
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </div>
                  </div>
                </CardContent>
              </Card>
            )
          })}
        </div>
      )}

      {/* Streaks Summary */}
      {habits.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="text-lg flex items-center gap-2">
              <Flame className="h-5 w-5 text-accent" />
              Mejores Rachas
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {[...habits]
                .sort((a, b) => b.streak - a.streak)
                .map((habit, index) => {
                  const IconComponent = habitIcons[habit.icon] || Target
                  return (
                    <div key={habit.id} className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <span className="text-muted-foreground text-sm w-6">#{index + 1}</span>
                        <IconComponent className="h-4 w-4 text-muted-foreground" />
                        <span className="font-medium">{habit.name}</span>
                      </div>
                      <Badge variant={index === 0 ? "default" : "secondary"}>
                        {habit.streak} dias
                      </Badge>
                    </div>
                  )
                })}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  )
}
