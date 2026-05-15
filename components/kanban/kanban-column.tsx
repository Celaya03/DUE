"use client"

import { useState } from "react"
import { useDroppable } from "@dnd-kit/core"
import { SortableContext, verticalListSortingStrategy } from "@dnd-kit/sortable"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { KanbanCard } from "./kanban-card"
import type { Task, TaskStatus } from "@/lib/types"
import { Plus, X } from "lucide-react"
import { cn } from "@/lib/utils"

interface KanbanColumnProps {
  id: TaskStatus
  title: string
  color: string
  tasks: Task[]
  selectedTasks?: Set<string>
  onToggleSelect?: (taskId: string) => void
  onAddTask: (title: string) => void
  onDeleteTask: (taskId: string) => void
  onUpdateTask: (taskId: string, updates: Partial<Task>) => void
  onEditTask: (task: Task) => void
}

export function KanbanColumn({
  id,
  title,
  color,
  tasks,
  selectedTasks,
  onToggleSelect,
  onAddTask,
  onDeleteTask,
  onUpdateTask,
  onEditTask,
}: KanbanColumnProps) {
  const [isAdding, setIsAdding] = useState(false)
  const [newTaskTitle, setNewTaskTitle] = useState("")

  const { setNodeRef, isOver } = useDroppable({ id })

  const handleAddTask = () => {
    if (newTaskTitle.trim()) {
      onAddTask(newTaskTitle.trim())
      setNewTaskTitle("")
      setIsAdding(false)
    }
  }

  return (
    <Card
      ref={setNodeRef}
      className={cn(
        "flex flex-col h-full transition-colors",
        isOver && "ring-2 ring-primary bg-primary/5"
      )}
    >
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className={cn("w-3 h-3 rounded-full", color)} />
            <CardTitle className="text-base">{title}</CardTitle>
          </div>
          <span className="text-sm text-muted-foreground bg-muted px-2 py-0.5 rounded-full">
            {tasks.length}
          </span>
        </div>
      </CardHeader>
      <CardContent className="flex-1 overflow-y-auto space-y-3 pb-4">
        <SortableContext items={tasks.map((t) => t.id)} strategy={verticalListSortingStrategy}>
          {tasks.map((task) => (
            <KanbanCard
              key={task.id}
              task={task}
              isSelected={selectedTasks?.has(task.id)}
              onToggleSelect={onToggleSelect ? () => onToggleSelect(task.id) : undefined}
              onDelete={() => onDeleteTask(task.id)}
              onUpdate={(updates) => onUpdateTask(task.id, updates)}
              onEdit={() => onEditTask(task)}
            />
          ))}
        </SortableContext>

        {isAdding ? (
          <div className="space-y-2 p-2 rounded-lg bg-muted/50">
            <Input
              value={newTaskTitle}
              onChange={(e) => setNewTaskTitle(e.target.value)}
              placeholder="Título de la tarea..."
              autoFocus
              onKeyDown={(e) => {
                if (e.key === "Enter") handleAddTask()
                if (e.key === "Escape") {
                  setIsAdding(false)
                  setNewTaskTitle("")
                }
              }}
            />
            <div className="flex gap-2">
              <Button size="sm" onClick={handleAddTask} className="flex-1">
                Agregar
              </Button>
              <Button
                size="sm"
                variant="ghost"
                onClick={() => {
                  setIsAdding(false)
                  setNewTaskTitle("")
                }}
              >
                <X className="h-4 w-4" />
              </Button>
            </div>
          </div>
        ) : (
          <Button
            variant="ghost"
            className="w-full justify-start text-muted-foreground hover:text-foreground"
            onClick={() => setIsAdding(true)}
          >
            <Plus className="h-4 w-4 mr-2" />
            Agregar tarea
          </Button>
        )}
      </CardContent>
    </Card>
  )
}
