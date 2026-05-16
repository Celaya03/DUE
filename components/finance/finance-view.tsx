"use client"

import { useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
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
import { FieldGroup, Field, FieldLabel } from "@/components/ui/field"
import { DatePicker } from "@/components/ui/date-picker"
import type { Transaction } from "@/lib/types"
import {
  Plus,
  TrendingUp,
  TrendingDown,
  Wallet,
  ArrowUpRight,
  ArrowDownRight,
  MoreHorizontal,
  Pencil,
  Trash2,
} from "lucide-react"
import { cn } from "@/lib/utils"

interface FinanceViewProps {
  transactions: Transaction[]
  onTransactionsChange: (transactions: Transaction[]) => void
}

const categories = [
  "Trabajo",
  "Alimentación",
  "Transporte",
  "Entretenimiento",
  "Salud",
  "Educación",
  "Otros",
]

const emptyTransaction = {
  description: "",
  amount: "",
  type: "gasto" as "ingreso" | "gasto",
  category: "Otros",
  date: new Date(),
}

export function FinanceView({ transactions, onTransactionsChange }: FinanceViewProps) {
  const [isDialogOpen, setIsDialogOpen] = useState(false)
  const [editingTransaction, setEditingTransaction] = useState<Transaction | null>(null)
  const [formData, setFormData] = useState(emptyTransaction)

  const totalIncome = transactions
    .filter((t) => t.type === "ingreso")
    .reduce((a, b) => a + b.amount, 0)
  const totalExpenses = transactions
    .filter((t) => t.type === "gasto")
    .reduce((a, b) => a + b.amount, 0)
  const balance = totalIncome - totalExpenses

  const openNewDialog = () => {
    setEditingTransaction(null)
    setFormData(emptyTransaction)
    setIsDialogOpen(true)
  }

  const openEditDialog = (transaction: Transaction) => {
    setEditingTransaction(transaction)
    setFormData({
      description: transaction.description,
      amount: transaction.amount.toString(),
      type: transaction.type,
      category: transaction.category,
      date: new Date(transaction.date),
    })
    setIsDialogOpen(true)
  }

  const handleSave = () => {
    if (formData.description && formData.amount) {
      if (editingTransaction) {
        // Editar existente
        onTransactionsChange(
          transactions.map((t) =>
            t.id === editingTransaction.id
              ? {
                  ...t,
                  description: formData.description,
                  amount: parseFloat(formData.amount),
                  type: formData.type,
                  category: formData.category,
                  date: formData.date.toISOString().split("T")[0],
                }
              : t
          )
        )
      } else {
        // Crear nueva
        const transaction: Transaction = {
          id: crypto.randomUUID(),
          description: formData.description,
          amount: parseFloat(formData.amount),
          type: formData.type,
          date: formData.date.toISOString().split("T")[0],
          category: formData.category,
        }
        onTransactionsChange([transaction, ...transactions])
      }
      setIsDialogOpen(false)
      setFormData(emptyTransaction)
      setEditingTransaction(null)
    }
  }

  const handleDelete = (id: string) => {
    onTransactionsChange(transactions.filter((t) => t.id !== id))
  }

  const groupedByCategory = transactions
    .filter((t) => t.type === "gasto")
    .reduce(
      (acc, t) => {
        acc[t.category] = (acc[t.category] || 0) + t.amount
        return acc
      },
      {} as Record<string, number>
    )


  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-foreground">Finanzas</h1>
          <p className="text-muted-foreground">Controla tus ingresos y gastos</p>
        </div>
        <Button onClick={openNewDialog}>
          <Plus className="h-4 w-4 mr-2" />
          Nueva Transaccion
        </Button>
      </div>

      {/* Dialog para crear/editar */}
      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>
              {editingTransaction ? "Editar Transaccion" : "Nueva Transaccion"}
            </DialogTitle>
            <DialogDescription>
              {editingTransaction
                ? "Modifica los datos de la transaccion"
                : "Agrega una nueva transaccion a tu registro"}
            </DialogDescription>
          </DialogHeader>
          <FieldGroup className="mt-4">
            <Field>
              <FieldLabel>Tipo</FieldLabel>
              <Select
                value={formData.type}
                onValueChange={(v) =>
                  setFormData({ ...formData, type: v as "ingreso" | "gasto" })
                }
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="ingreso">Ingreso</SelectItem>
                  <SelectItem value="gasto">Gasto</SelectItem>
                </SelectContent>
              </Select>
            </Field>

            <Field>
              <FieldLabel>Descripcion</FieldLabel>
              <Input
                value={formData.description}
                onChange={(e) =>
                  setFormData({ ...formData, description: e.target.value })
                }
                placeholder="Ej: Supermercado"
              />
            </Field>

            <Field>
              <FieldLabel>Monto</FieldLabel>
              <Input
                type="number"
                value={formData.amount}
                onChange={(e) =>
                  setFormData({ ...formData, amount: e.target.value })
                }
                placeholder="0.00"
              />
            </Field>

            <Field>
              <FieldLabel>Fecha</FieldLabel>
              <DatePicker
                date={formData.date}
                onDateChange={(date) => setFormData({ ...formData, date: date || new Date() })}
                placeholder="Selecciona una fecha"
              />
            </Field>

            <Field>
              <FieldLabel>Categoria</FieldLabel>
              <Select
                value={formData.category}
                onValueChange={(v) => setFormData({ ...formData, category: v })}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {categories.map((cat) => (
                    <SelectItem key={cat} value={cat}>
                      {cat}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </Field>
          </FieldGroup>

          <div className="flex gap-2 mt-4">
            {editingTransaction && (
              <Button
                variant="destructive"
                onClick={() => {
                  handleDelete(editingTransaction.id)
                  setIsDialogOpen(false)
                }}
                className="flex-1"
              >
                <Trash2 className="h-4 w-4 mr-2" />
                Eliminar
              </Button>
            )}
            <Button onClick={handleSave} className="flex-1">
              {editingTransaction ? "Guardar Cambios" : "Agregar"}
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card className="bg-success/5 border-success/20">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Ingresos</p>
                <p className="text-2xl font-bold text-success">${totalIncome.toLocaleString()}</p>
              </div>
              <div className="p-3 rounded-xl bg-success/20">
                <TrendingUp className="h-6 w-6 text-success" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-destructive/5 border-destructive/20">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Gastos</p>
                <p className="text-2xl font-bold text-destructive">
                  ${totalExpenses.toLocaleString()}
                </p>
              </div>
              <div className="p-3 rounded-xl bg-destructive/20">
                <TrendingDown className="h-6 w-6 text-destructive" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card
          className={cn(
            balance >= 0
              ? "bg-primary/5 border-primary/20"
              : "bg-destructive/5 border-destructive/20"
          )}
        >
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Balance</p>
                <p
                  className={cn(
                    "text-2xl font-bold",
                    balance >= 0 ? "text-primary" : "text-destructive"
                  )}
                >
                  ${balance.toLocaleString()}
                </p>
              </div>
              <div
                className={cn(
                  "p-3 rounded-xl",
                  balance >= 0 ? "bg-primary/20" : "bg-destructive/20"
                )}
              >
                <Wallet
                  className={cn("h-6 w-6", balance >= 0 ? "text-primary" : "text-destructive")}
                />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Gastos por categoría</CardTitle>
        </CardHeader>
        <CardContent>
          {Object.keys(groupedByCategory).length === 0 ? (
            <p className="text-muted-foreground text-center py-8">
              Registra gastos para ver el desglose.
            </p>
          ) : (
            <div className="space-y-2">
              {Object.entries(groupedByCategory)
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

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Recent Transactions */}
        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle className="text-lg">Transacciones Recientes</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {transactions.length === 0 ? (
              <p className="text-muted-foreground text-center py-8">
                No hay transacciones. Agrega tu primera transaccion.
              </p>
            ) : (
              transactions.slice(0, 10).map((t) => (
                <div
                  key={t.id}
                  className="flex items-center justify-between p-3 rounded-lg bg-muted/50 hover:bg-muted transition-colors group"
                >
                  <div className="flex items-center gap-3">
                    <div
                      className={cn(
                        "p-2 rounded-lg",
                        t.type === "ingreso" ? "bg-success/20" : "bg-destructive/20"
                      )}
                    >
                      {t.type === "ingreso" ? (
                        <ArrowUpRight className="h-4 w-4 text-success" />
                      ) : (
                        <ArrowDownRight className="h-4 w-4 text-destructive" />
                      )}
                    </div>
                    <div>
                      <p className="font-medium text-foreground">{t.description}</p>
                      <p className="text-xs text-muted-foreground">
                        {t.category} - {new Date(t.date).toLocaleDateString("es-ES")}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <span
                      className={cn(
                        "font-semibold",
                        t.type === "ingreso" ? "text-success" : "text-destructive"
                      )}
                    >
                      {t.type === "ingreso" ? "+" : "-"}${t.amount.toLocaleString()}
                    </span>
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
                        <DropdownMenuItem onClick={() => openEditDialog(t)}>
                          <Pencil className="h-4 w-4 mr-2" />
                          Editar
                        </DropdownMenuItem>
                        <DropdownMenuItem
                          onClick={() => handleDelete(t.id)}
                          className="text-destructive"
                        >
                          <Trash2 className="h-4 w-4 mr-2" />
                          Eliminar
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </div>
                </div>
              ))
            )}
          </CardContent>
        </Card>

        {/* Expenses by Category */}
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Top Gastos</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {Object.keys(groupedByCategory).length === 0 ? (
              <p className="text-muted-foreground text-center py-4">Sin gastos registrados</p>
            ) : (
              Object.entries(groupedByCategory)
                .sort(([, a], [, b]) => b - a)
                .slice(0, 5)
                .map(([category, amount]) => (
                  <div key={category} className="flex items-center justify-between">
                    <span className="text-sm text-foreground">{category}</span>
                    <Badge variant="outline">${amount.toLocaleString()}</Badge>
                  </div>
                ))
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
