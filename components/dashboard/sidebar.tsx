"use client"

import { useAuth } from "@/lib/auth-context"
import { Button } from "@/components/ui/button"
import { cn } from "@/lib/utils"
import {
  LayoutDashboard,
  KanbanSquare,
  Wallet,
  Target,
  LogOut,
  ChevronLeft,
  ChevronRight,
} from "lucide-react"

type View = "dashboard" | "kanban" | "finance" | "habits"

interface SidebarProps {
  currentView: View
  onViewChange: (view: View) => void
  collapsed: boolean
  onCollapsedChange: (collapsed: boolean) => void
}

const navItems = [
  { id: "dashboard" as View, label: "Dashboard", icon: LayoutDashboard },
  { id: "kanban" as View, label: "Tareas", icon: KanbanSquare },
  { id: "finance" as View, label: "Finanzas", icon: Wallet },
  { id: "habits" as View, label: "Hábitos", icon: Target },
]

export function Sidebar({ currentView, onViewChange, collapsed, onCollapsedChange }: SidebarProps) {
  const { user, logout } = useAuth()

  return (
    <aside
      className={cn(
        "fixed left-0 top-0 z-40 h-screen bg-sidebar border-r border-sidebar-border transition-all duration-300",
        collapsed ? "w-16" : "w-64"
      )}
    >
      <div className="flex flex-col h-full">
        {/* Logo */}
        <div className="flex items-center justify-between h-16 px-4 border-b border-sidebar-border">
          {!collapsed && (
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center">
                <span className="text-lg font-bold text-primary">D</span>
              </div>
              <span className="font-semibold text-sidebar-foreground">DUE</span>
            </div>
          )}
          <Button
            variant="ghost"
            size="icon"
            onClick={() => onCollapsedChange(!collapsed)}
            className="text-sidebar-foreground hover:bg-sidebar-accent"
          >
            {collapsed ? <ChevronRight className="h-4 w-4" /> : <ChevronLeft className="h-4 w-4" />}
          </Button>
        </div>

        {/* Navigation */}
        <nav className="flex-1 p-3 space-y-1">
          {navItems.map((item) => {
            const Icon = item.icon
            const isActive = currentView === item.id
            return (
              <button
                key={item.id}
                onClick={() => onViewChange(item.id)}
                className={cn(
                  "w-full flex items-center gap-3 px-3 py-2.5 rounded-lg transition-colors text-left",
                  isActive
                    ? "bg-sidebar-primary text-sidebar-primary-foreground"
                    : "text-sidebar-foreground hover:bg-sidebar-accent"
                )}
              >
                <Icon className="h-5 w-5 shrink-0" />
                {!collapsed && <span className="font-medium">{item.label}</span>}
              </button>
            )
          })}
        </nav>

        {/* User & Logout */}
        <div className="p-3 border-t border-sidebar-border space-y-2">
          {!collapsed && user && (
            <div className="px-3 py-2 rounded-lg bg-sidebar-accent/50">
              <p className="text-sm font-medium text-sidebar-foreground truncate">
                {user.name}
              </p>
              <p className="text-xs text-muted-foreground truncate">{user.email}</p>
            </div>
          )}
          <Button
            variant="outline"
            onClick={logout}
            className={cn(
              "w-full justify-start border-destructive/30 text-destructive hover:bg-destructive hover:text-destructive-foreground",
              collapsed && "justify-center px-2"
            )}
          >
            <LogOut className="h-4 w-4" />
            {!collapsed && <span className="ml-2">Cerrar Sesion</span>}
          </Button>
        </div>
      </div>
    </aside>
  )
}
