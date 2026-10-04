"use client";

import { useState } from "react";
import { useApp } from "@/lib/store";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import type { ExpenseCategory } from "@/lib/types";
import { EXPENSE_CATEGORY_LABELS, EXPENSE_CATEGORY_COLORS } from "@/lib/types";
import { EditExpenseDialog } from "@/components/dialogs";
import { Edit2, Trash } from "lucide-react";

function formatCurrency(amount: number): string {
  return new Intl.NumberFormat("tr-TR", {
    style: "currency",
    currency: "TRY",
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(amount);
}

export function ExpenseTable() {
  const { expenses, vehicles, selectedVehicleId, selectedProjectId, deleteExpense, getFilteredExpenses } = useApp();
  const [searchQuery, setSearchQuery] = useState("");
  const [categoryFilter, setCategoryFilter] = useState<string>("all");
  const [sortBy, setSortBy] = useState<"date" | "amount">("date");
  const [sortDir, setSortDir] = useState<"asc" | "desc">("desc");

  let filtered = getFilteredExpenses(selectedVehicleId, selectedProjectId);

  // Apply category filter
  if (categoryFilter !== "all") {
    filtered = filtered.filter((e) => e.category === categoryFilter);
  }

  // Apply search
  if (searchQuery) {
    const q = searchQuery.toLowerCase();
    filtered = filtered.filter(
      (e) =>
        e.description.toLowerCase().includes(q) ||
        EXPENSE_CATEGORY_LABELS[e.category].toLowerCase().includes(q) ||
        vehicles.find((v) => v.id === e.vehicleId)?.plate.toLowerCase().includes(q)
    );
  }

  // Sort
  filtered.sort((a, b) => {
    if (sortBy === "date") {
      const diff = new Date(a.date).getTime() - new Date(b.date).getTime();
      return sortDir === "desc" ? -diff : diff;
    } else {
      const diff = a.amount - b.amount;
      return sortDir === "desc" ? -diff : diff;
    }
  });

  const totalFiltered = filtered.reduce((sum, e) => sum + e.amount, 0);

  return (
    <Card className="border-border/50 bg-card/50 backdrop-blur-sm">
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between flex-wrap gap-3">
          <CardTitle className="text-base font-semibold flex items-center gap-2">
            Gider Listesi
            <Badge variant="secondary" className="text-xs ml-1">
              {filtered.length} kayıt
            </Badge>
          </CardTitle>
          <span className="text-sm font-semibold text-primary">
            Toplam: {formatCurrency(totalFiltered)}
          </span>
        </div>

        {/* Filters */}
        <div className="flex gap-2 mt-3 flex-wrap">
          <Input
            placeholder="Ara..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full sm:w-48 h-8 text-sm bg-input/50"
          />
          <Select value={categoryFilter} onValueChange={(val) => setCategoryFilter(val as string)}>
            <SelectTrigger className="w-full sm:w-[180px] h-8 text-sm bg-input/40 border-border/40 hover:bg-input/60 transition-colors">
              <SelectValue placeholder="Kategori">
                {categoryFilter === "all" ? (
                  <span className="flex items-center gap-2">
                    Tüm Kategoriler
                  </span>
                ) : (
                  <span className="flex items-center gap-2">

                    {EXPENSE_CATEGORY_LABELS[categoryFilter as ExpenseCategory]}
                  </span>
                )}
              </SelectValue>
            </SelectTrigger>
            <SelectContent className="border-border/50 bg-card/95 backdrop-blur-md shadow-xl rounded-xl overflow-hidden p-1">
              <SelectItem value="all" className="cursor-pointer rounded-lg px-3 py-2 text-sm transition-colors hover:bg-primary/10 focus:bg-primary/10 focus:text-primary mb-1">
                <span className="flex items-center gap-2 font-medium">
                  Tüm Kategoriler
                </span>
              </SelectItem>
              <div className="h-px bg-border/40 my-1 mx-2" />
              {(Object.keys(EXPENSE_CATEGORY_LABELS) as ExpenseCategory[]).map((cat) => (
                <SelectItem key={cat} value={cat} className="cursor-pointer rounded-lg px-3 py-2 text-sm transition-colors hover:bg-accent focus:bg-accent">
                  <span className="flex items-center gap-2">

                    <span>{EXPENSE_CATEGORY_LABELS[cat]}</span>
                  </span>
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          <div className="flex gap-1">
            <Button
              variant={sortBy === "date" ? "default" : "outline"}
              size="sm"
              className="h-8 text-xs"
              onClick={() => {
                if (sortBy === "date") {
                  setSortDir((d) => (d === "asc" ? "desc" : "asc"));
                } else {
                  setSortBy("date");
                  setSortDir("desc");
                }
              }}
            >
              Tarih {sortBy === "date" ? (sortDir === "desc" ? "↓" : "↑") : ""}
            </Button>
            <Button
              variant={sortBy === "amount" ? "default" : "outline"}
              size="sm"
              className="h-8 text-xs"
              onClick={() => {
                if (sortBy === "amount") {
                  setSortDir((d) => (d === "asc" ? "desc" : "asc"));
                } else {
                  setSortBy("amount");
                  setSortDir("desc");
                }
              }}
            >
              Tutar {sortBy === "amount" ? (sortDir === "desc" ? "↓" : "↑") : ""}
            </Button>
          </div>
        </div>
      </CardHeader>
      <CardContent className="px-0">
        <div className="overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow className="border-border/30 hover:bg-transparent">
                <TableHead className="text-xs text-muted-foreground font-medium pl-6">Kategori</TableHead>
                {!selectedVehicleId && (
                  <TableHead className="text-xs text-muted-foreground font-medium">Araç</TableHead>
                )}
                <TableHead className="text-xs text-muted-foreground font-medium">Açıklama</TableHead>
                <TableHead className="text-xs text-muted-foreground font-medium">Tarih</TableHead>
                <TableHead className="text-xs text-muted-foreground font-medium text-right">Tutar</TableHead>
                <TableHead className="text-xs text-muted-foreground font-medium text-right pr-6">İşlem</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filtered.map((expense, i) => {
                const vehicle = vehicles.find((v) => v.id === expense.vehicleId);
                return (
                  <TableRow
                    key={expense.id}
                    className="group border-border/20 hover:bg-accent/40 transition-colors animate-fade-in"
                    style={{ animationDelay: `${i * 30}ms` }}
                  >
                    <TableCell className="pl-6">
                      <div className="flex items-center gap-2">

                        <Badge
                          variant="secondary"
                          className="text-[10px] font-medium"
                          style={{
                            backgroundColor: `color-mix(in oklch, ${EXPENSE_CATEGORY_COLORS[expense.category]} 15%, transparent)`,
                            color: EXPENSE_CATEGORY_COLORS[expense.category],
                          }}
                        >
                          {EXPENSE_CATEGORY_LABELS[expense.category]}
                        </Badge>
                      </div>
                    </TableCell>
                    {!selectedVehicleId && (
                      <TableCell>
                        <div className="flex items-center gap-1.5">
                          <span
                            className="w-2 h-2 rounded-full"
                            style={{ backgroundColor: vehicle?.color }}
                          />
                          <span className="text-xs text-muted-foreground">
                            {vehicle?.plate}
                          </span>
                        </div>
                      </TableCell>
                    )}
                    <TableCell>
                      <div>
                        <p className="text-sm">{expense.description}</p>
                        {expense.liters && (
                          <p className="text-[10px] text-muted-foreground">
                            {expense.liters} lt · ₺{expense.pricePerLiter?.toFixed(2)}/lt
                          </p>
                        )}
                      </div>
                    </TableCell>
                    <TableCell>
                      <span className="text-xs text-muted-foreground">
                        {new Date(expense.date).toLocaleDateString("tr-TR", {
                          day: "numeric",
                          month: "short",
                          year: "numeric",
                        })}
                      </span>
                    </TableCell>
                    <TableCell className="text-right">
                      <span className="text-sm font-semibold tabular-nums">
                        {formatCurrency(expense.amount)}
                      </span>
                    </TableCell>
                    <TableCell className="text-right pr-6">
                      <div className="flex items-center justify-end gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                        <EditExpenseDialog expense={expense}>
                          <Button
                            variant="ghost"
                            size="sm"
                            className="h-7 w-7 p-0 text-muted-foreground hover:text-primary hover:bg-primary/10"
                            title="Düzenle"
                          >
                            <Edit2 className="w-3.5 h-3.5" />
                          </Button>
                        </EditExpenseDialog>
                        <Button
                          variant="ghost"
                          size="sm"
                          className="h-7 w-7 p-0 text-muted-foreground hover:text-destructive hover:bg-destructive/10"
                          title="Sil"
                          onClick={() => {
                            if (confirm(`'${expense.description}' giderini silmek istediğinize emin misiniz?`)) {
                              deleteExpense(expense.id);
                            }
                          }}
                        >
                          <Trash className="w-3.5 h-3.5" />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                );
              })}
              {filtered.length === 0 && (
                <TableRow>
                  <TableCell
                    colSpan={selectedVehicleId ? 5 : 6}
                    className="text-center py-12 text-muted-foreground"
                  >
                    <div className="flex flex-col items-center gap-2">
                      <p className="text-sm">Henüz gider kaydı bulunamadı</p>
                    </div>
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </div>
      </CardContent>
    </Card>
  );
}
