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
  const [selectedTasks, setSelectedTasks] = useState<Set<string>>(new Set())

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

  const handleToggleTaskSelection = (taskId: string) => {
    const newSelected = new Set(selectedTasks)
    if (newSelected.has(taskId)) {
      newSelected.delete(taskId)
    } else {
      newSelected.add(taskId)
    }
    setSelectedTasks(newSelected)
  }

  const handleSelectAll = () => {
    const allTaskIds = new Set(filteredTasks.map(t => t.id))
    setSelectedTasks(allTaskIds)
  }

  const handleDeselectAll = () => {
    setSelectedTasks(new Set())
  }

  const handleMoveSelectedTasks = (newStatus: TaskStatus) => {
    const updatedTasks = tasks.map(task =>
      selectedTasks.has(task.id) ? { ...task, status: newStatus } : task
    )
    onTasksChange(updatedTasks)
    setSelectedTasks(new Set())
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-foreground">Tablero de Tareas</h1>
          <p className="text-muted-foreground">Organiza tus tareas de forma visual</p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" size="sm" onClick={handleSelectAll}>
            Seleccionar Todas
          </Button>
          <Button variant="outline" size="sm" onClick={handleDeselectAll}>
            Deseleccionar
          </Button>
          <Button onClick={handleNewTask}>
            <Plus className="h-4 w-4 mr-2" />
            Nueva Tarea
          </Button>
        </div>
      </div>

      {/* Bulk Actions */}
      {selectedTasks.size > 0 && (
        <div className="flex flex-wrap gap-2 p-4 bg-muted rounded-lg">
          <span className="text-sm font-medium">
            {selectedTasks.size} tarea{selectedTasks.size > 1 ? 's' : ''} seleccionada{selectedTasks.size > 1 ? 's' : ''}
          </span>
          <Button size="sm" onClick={() => handleMoveSelectedTasks("pendiente")}>
            Mover a Pendiente
          </Button>
          <Button size="sm" onClick={() => handleMoveSelectedTasks("en-proceso")}>
            Mover a En Proceso
          </Button>
          <Button size="sm" onClick={() => handleMoveSelectedTasks("completado")}>
            Mover a Completado
          </Button>
          <Button size="sm" variant="outline" onClick={handleDeselectAll}>
            Deseleccionar
          </Button>
        </div>
      )}

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
              selectedTasks={selectedTasks}
              onToggleSelect={handleToggleTaskSelection}
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
