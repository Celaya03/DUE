"use client"

import { Button } from "@/components/ui/button"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { Badge } from "@/components/ui/badge"
import type { TaskStatus, TaskPriority } from "@/lib/types"
import { Filter, SortAsc } from "lucide-react"

interface TaskFiltersProps {
  filterStatus: TaskStatus | "all"
  filterPriority: TaskPriority | "all"
  sortBy: "date" | "priority"
  onFilterStatusChange: (value: TaskStatus | "all") => void
  onFilterPriorityChange: (value: TaskPriority | "all") => void
  onSortByChange: (value: "date" | "priority") => void
  totalTasks: number
  filteredTasks: number
}

export function TaskFilters({
  filterStatus,
  filterPriority,
  sortBy,
  onFilterStatusChange,
  onFilterPriorityChange,
  onSortByChange,
  totalTasks,
  filteredTasks,
}: TaskFiltersProps) {
  const hasActiveFilters = filterStatus !== "all" || filterPriority !== "all"

  return (
    <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between p-4 bg-card rounded-lg border">
      <div className="flex flex-wrap items-center gap-3">
        <div className="flex items-center gap-2 text-muted-foreground">
          <Filter className="h-4 w-4" />
          <span className="text-sm font-medium">Filtrar:</span>
        </div>

        <Select value={filterStatus} onValueChange={onFilterStatusChange}>
          <SelectTrigger className="w-[140px] h-9">
            <SelectValue placeholder="Estado" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Todos</SelectItem>
            <SelectItem value="pendiente">Pendiente</SelectItem>
            <SelectItem value="en-proceso">En Proceso</SelectItem>
            <SelectItem value="completado">Completado</SelectItem>
          </SelectContent>
        </Select>

        <Select value={filterPriority} onValueChange={onFilterPriorityChange}>
          <SelectTrigger className="w-[140px] h-9">
            <SelectValue placeholder="Prioridad" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Todas</SelectItem>
            <SelectItem value="alta">Alta</SelectItem>
            <SelectItem value="media">Media</SelectItem>
            <SelectItem value="baja">Baja</SelectItem>
          </SelectContent>
        </Select>

        <div className="flex items-center gap-2 text-muted-foreground">
          <SortAsc className="h-4 w-4" />
          <span className="text-sm font-medium">Ordenar:</span>
        </div>

        <Select value={sortBy} onValueChange={onSortByChange}>
          <SelectTrigger className="w-[140px] h-9">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="date">Por Fecha</SelectItem>
            <SelectItem value="priority">Por Prioridad</SelectItem>
          </SelectContent>
        </Select>

        {hasActiveFilters && (
          <Button
            variant="ghost"
            size="sm"
            onClick={() => {
              onFilterStatusChange("all")
              onFilterPriorityChange("all")
            }}
            className="text-muted-foreground"
          >
            Limpiar filtros
          </Button>
        )}
      </div>

      <div className="flex items-center gap-2">
        <Badge variant="secondary">
          {filteredTasks === totalTasks
            ? `${totalTasks} tareas`
            : `${filteredTasks} de ${totalTasks}`}
        </Badge>
      </div>
    </div>
  )
}
