"use client"

import { useSortable } from "@dnd-kit/sortable"
import { CSS } from "@dnd-kit/utilities"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import type { Task, TaskPriority } from "@/lib/types"
import { GripVertical, MoreHorizontal, Trash2, Calendar, Flag, Pencil } from "lucide-react"
import { cn } from "@/lib/utils"

interface KanbanCardProps {
  task: Task
  isDragging?: boolean
  onDelete?: () => void
  onUpdate?: (updates: Partial<Task>) => void
  onEdit?: () => void
}

const priorityColors: Record<TaskPriority, string> = {
  alta: "bg-destructive/20 text-destructive border-destructive/30",
  media: "bg-warning/20 text-warning border-warning/30",
  baja: "bg-success/20 text-success border-success/30",
}

const priorityLabels: Record<TaskPriority, string> = {
  alta: "Alta",
  media: "Media",
  baja: "Baja",
}

export function KanbanCard({ task, isDragging, onDelete, onUpdate, onEdit }: KanbanCardProps) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging: isSortableDragging,
  } = useSortable({ id: task.id })

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
  }

  const isBeingDragged = isDragging || isSortableDragging

  return (
    <Card
      ref={setNodeRef}
      style={style}
      className={cn(
        "cursor-grab active:cursor-grabbing transition-all",
        isBeingDragged && "opacity-50 scale-105 shadow-xl rotate-2"
      )}
    >
      <CardContent className="p-3">
        <div className="flex items-start gap-2">
          <button
            {...attributes}
            {...listeners}
            className="mt-0.5 text-muted-foreground hover:text-foreground cursor-grab"
          >
            <GripVertical className="h-4 w-4" />
          </button>

          <div className="flex-1 min-w-0">
            <div className="flex items-start justify-between gap-2">
              <p className="font-medium text-sm text-foreground line-clamp-2">{task.title}</p>
              {onDelete && onUpdate && (
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="ghost" size="icon" className="h-6 w-6 shrink-0">
                      <MoreHorizontal className="h-3 w-3" />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end">
                    {onEdit && (
                      <DropdownMenuItem onClick={onEdit} className="gap-2">
                        <Pencil className="h-4 w-4" />
                        Editar tarea
                      </DropdownMenuItem>
                    )}
                    <DropdownMenuItem
                      onClick={() => onUpdate?.({ priority: "alta" })}
                      className="gap-2"
                    >
                      <Flag className="h-4 w-4 text-destructive" />
                      Prioridad Alta
                    </DropdownMenuItem>
                    <DropdownMenuItem
                      onClick={() => onUpdate?.({ priority: "media" })}
                      className="gap-2"
                    >
                      <Flag className="h-4 w-4 text-warning" />
                      Prioridad Media
                    </DropdownMenuItem>
                    <DropdownMenuItem
                      onClick={() => onUpdate?.({ priority: "baja" })}
                      className="gap-2"
                    >
                      <Flag className="h-4 w-4 text-success" />
                      Prioridad Baja
                    </DropdownMenuItem>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem onClick={onDelete} className="text-destructive gap-2">
                      <Trash2 className="h-4 w-4" />
                      Eliminar
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              )}
            </div>

            {task.description && (
              <p className="text-xs text-muted-foreground mt-1 line-clamp-2">{task.description}</p>
            )}

            <div className="flex items-center gap-2 mt-3 flex-wrap">
              <Badge variant="outline" className={cn("text-xs", priorityColors[task.priority])}>
                {priorityLabels[task.priority]}
              </Badge>
              {task.dueDate && (
                <span className="text-xs text-muted-foreground flex items-center gap-1">
                  <Calendar className="h-3 w-3" />
                  {new Date(task.dueDate).toLocaleDateString("es-ES", {
                    day: "numeric",
                    month: "short",
                  })}
                </span>
              )}
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
