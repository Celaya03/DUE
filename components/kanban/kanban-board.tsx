"use client"

import { useState } from "react"
import {
  DndContext,
  DragOverlay,
  closestCorners,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
  type DragEndEvent,
  type DragStartEvent,
} from "@dnd-kit/core"
import { arrayMove, sortableKeyboardCoordinates } from "@dnd-kit/sortable"
import { KanbanColumn } from "./kanban-column"
import { KanbanCard } from "./kanban-card"
import { TaskFilters } from "./task-filters"
import { TaskEditModal } from "./task-edit-modal"
import type { Task, TaskStatus, TaskPriority } from "@/lib/types"
import { Button } from "@/components/ui/button"
import { Plus } from "lucide-react"

interface KanbanBoardProps {
  tasks: Task[]
  onTasksChange: (tasks: Task[]) => void
}

const columns: { id: TaskStatus; title: string; color: string }[] = [
  { id: "pendiente", title: "Pendiente", color: "bg-warning" },
  { id: "en-proceso", title: "En Proceso", color: "bg-info" },
  { id: "completado", title: "Completado", color: "bg-success" },
]

export function KanbanBoard({ tasks, onTasksChange }: KanbanBoardProps) {
  const [activeTask, setActiveTask] = useState<Task | null>(null)
  const [filterStatus, setFilterStatus] = useState<TaskStatus | "all">("all")
  const [filterPriority, setFilterPriority] = useState<TaskPriority | "all">("all")
  const [sortBy, setSortBy] = useState<"date" | "priority">("date")
  const [editingTask, setEditingTask] = useState<Task | null>(null)
  const [isModalOpen, setIsModalOpen] = useState(false)

  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 5 } }),
    useSensor(KeyboardSensor, { coordinateGetter: sortableKeyboardCoordinates })
  )

  const filteredTasks = tasks.filter((task) => {
    if (filterStatus !== "all" && task.status !== filterStatus) return false
    if (filterPriority !== "all" && task.priority !== filterPriority) return false
    return true
  })

  const sortedTasks = [...filteredTasks].sort((a, b) => {
    if (sortBy === "priority") {
      const priorityOrder = { alta: 0, media: 1, baja: 2 }
      return priorityOrder[a.priority] - priorityOrder[b.priority]
    }
    return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
  })

  const handleDragStart = (event: DragStartEvent) => {
    const task = tasks.find((t) => t.id === event.active.id)
    if (task) setActiveTask(task)
  }

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event
    setActiveTask(null)

    if (!over) return

    const activeTaskId = active.id as string
    const overId = over.id as string

    // Si se suelta en una columna
    const targetColumn = columns.find((c) => c.id === overId)
    if (targetColumn) {
      const updatedTasks = tasks.map((task) =>
        task.id === activeTaskId ? { ...task, status: targetColumn.id } : task
      )
      onTasksChange(updatedTasks)
      return
    }

    // Si se suelta sobre otra tarea
    const overTask = tasks.find((t) => t.id === overId)
    if (overTask) {
      const activeTask = tasks.find((t) => t.id === activeTaskId)
      if (activeTask && activeTask.status !== overTask.status) {
        const updatedTasks = tasks.map((task) =>
          task.id === activeTaskId ? { ...task, status: overTask.status } : task
        )
        onTasksChange(updatedTasks)
      } else {
        const oldIndex = tasks.findIndex((t) => t.id === activeTaskId)
        const newIndex = tasks.findIndex((t) => t.id === overId)
        onTasksChange(arrayMove(tasks, oldIndex, newIndex))
      }
    }
  }

  const handleAddTask = (status: TaskStatus, title: string) => {
    const newTask: Task = {
      id: crypto.randomUUID(),
      title,
      status,
      priority: "media",
      createdAt: new Date().toISOString(),
    }
    onTasksChange([newTask, ...tasks])
  }

  const handleDeleteTask = (taskId: string) => {
    onTasksChange(tasks.filter((t) => t.id !== taskId))
  }

  const handleUpdateTask = (taskId: string, updates: Partial<Task>) => {
    onTasksChange(tasks.map((t) => (t.id === taskId ? { ...t, ...updates } : t)))
  }

  const handleEditTask = (task: Task) => {
    setEditingTask(task)
    setIsModalOpen(true)
  }

  const handleSaveTask = (task: Task) => {
    const exists = tasks.find((t) => t.id === task.id)
    if (exists) {
      onTasksChange(tasks.map((t) => (t.id === task.id ? task : t)))
    } else {
      onTasksChange([task, ...tasks])
    }
  }

  const handleNewTask = () => {
    setEditingTask(null)
    setIsModalOpen(true)
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-foreground">Tablero de Tareas</h1>
          <p className="text-muted-foreground">Organiza tus tareas de forma visual</p>
        </div>
        <Button onClick={handleNewTask}>
          <Plus className="h-4 w-4 mr-2" />
          Nueva Tarea
        </Button>
      </div>

      {/* Filters */}
      <TaskFilters
        filterStatus={filterStatus}
        filterPriority={filterPriority}
        sortBy={sortBy}
        onFilterStatusChange={setFilterStatus}
        onFilterPriorityChange={setFilterPriority}
        onSortByChange={setSortBy}
        totalTasks={tasks.length}
        filteredTasks={filteredTasks.length}
      />

      {/* Kanban Board */}
      <DndContext
        sensors={sensors}
        collisionDetection={closestCorners}
        onDragStart={handleDragStart}
        onDragEnd={handleDragEnd}
      >
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 min-h-[600px]">
          {columns.map((column) => (
            <KanbanColumn
              key={column.id}
              id={column.id}
              title={column.title}
              color={column.color}
              tasks={sortedTasks.filter((t) => t.status === column.id)}
              onAddTask={(title) => handleAddTask(column.id, title)}
              onDeleteTask={handleDeleteTask}
              onUpdateTask={handleUpdateTask}
              onEditTask={handleEditTask}
            />
          ))}
        </div>

        <DragOverlay>
          {activeTask && <KanbanCard task={activeTask} isDragging />}
        </DragOverlay>
      </DndContext>

      <TaskEditModal
        task={editingTask}
        isOpen={isModalOpen}
        onClose={() => {
          setIsModalOpen(false)
          setEditingTask(null)
        }}
        onSave={handleSaveTask}
        onDelete={handleDeleteTask}
      />
    </div>
  )
}
