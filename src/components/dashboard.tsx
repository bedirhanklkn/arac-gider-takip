"use client";

import { useApp } from "@/lib/store";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { X, Plus, Trash, Edit2 } from "lucide-react";
import { EXPENSE_CATEGORY_COLORS, VEHICLE_STATUS_LABELS, VEHICLE_STATUS_COLORS } from "@/lib/types";
import { AddVehicleToProjectDialog, EditProjectDialog } from "@/components/dialogs";
import { Bar, BarChart, XAxis, YAxis, Tooltip, ResponsiveContainer, Cell, Pie, PieChart } from "recharts";

function formatCurrency(amount: number): string {
  return new Intl.NumberFormat("tr-TR", {
    style: "currency",
    currency: "TRY",
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(amount);
}

const PIE_COLORS = [
  "oklch(0.65 0.2 260)", "oklch(0.7 0.18 170)", "oklch(0.65 0.2 310)",
  "oklch(0.75 0.15 60)", "oklch(0.6 0.22 25)", "oklch(0.7 0.15 200)",
  "oklch(0.65 0.18 140)", "oklch(0.7 0.2 40)", "oklch(0.6 0.15 280)",
  "oklch(0.55 0.1 260)",
];

export function Dashboard() {
  const {
    vehicles, expenses, projects, getTotalExpense, getFilteredExpenses,
    getCategoryData, getMonthlyData, selectedVehicleId, selectedProjectId, getFleetStats, removeVehicleFromProject, deleteProject
  } = useApp();

  const totalExpense = getTotalExpense(selectedVehicleId, selectedProjectId);
  const categoryData = getCategoryData(selectedVehicleId, selectedProjectId);
  const monthlyData = getMonthlyData(selectedVehicleId, selectedProjectId);
  const fleetStats = getFleetStats();

  const filteredExpenses = getFilteredExpenses(selectedVehicleId, selectedProjectId);

  const displayedProjects = selectedProjectId
    ? projects.filter((p) => p.id === selectedProjectId)
    : selectedVehicleId
      ? projects.filter((p) => p.vehicleIds.includes(selectedVehicleId) && p.status === "aktif")
      : projects.filter((p) => p.status === "aktif");

  const stats = [
    {
      title: "Toplam Gider",
      value: formatCurrency(totalExpense),
      subtitle: `${filteredExpenses.length} işlem`,
      gradient: "from-rose-500/20 to-red-500/20",
      valueColor: "text-rose-400",
    },
    {
      title: "Filo Durumu",
      value: `${fleetStats.kirada}/${fleetStats.toplam}`,
      subtitle: `${fleetStats.musait} müsait · ${fleetStats.bakimda} bakımda`,
      gradient: "from-cyan-500/20 to-blue-500/20",
      valueColor: "text-cyan-400",
    },
  ];

  if (vehicles.length === 0 && projects.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-20 px-4 text-center">
        <div className="w-20 h-20 bg-primary/10 rounded-full flex items-center justify-center mb-6">
          <Plus className="w-10 h-10 text-primary" />
        </div>
        <h2 className="text-2xl font-bold mb-2">Filo Yönetimine Hoş Geldiniz</h2>
        <p className="text-muted-foreground max-w-md mb-8">
          Henüz hiç araç veya projeniz bulunmuyor. Başlamak için sol menüden yeni bir araç ekleyebilir veya yeni bir proje oluşturabilirsiniz.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Stats Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        {stats.map((stat, i) => (
          <Card
            key={stat.title}
            className={`card-hover border-border/50 bg-gradient-to-br ${stat.gradient} animate-fade-in`}
            style={{ animationDelay: `${i * 100}ms` }}
          >
            <CardContent className="p-5">
              <div className="flex items-center justify-between mb-3">
                <span className="text-xs text-muted-foreground font-medium uppercase tracking-wider">
                  {stat.title}
                </span>
              </div>
              <div className={`text-2xl font-bold tracking-tight animate-count ${stat.valueColor}`} style={{ animationDelay: `${i * 100 + 200}ms` }}>
                {stat.value}
              </div>
              <p className="text-xs text-muted-foreground mt-1">{stat.subtitle}</p>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Fleet Status Bar (only when no vehicle and no project selected) */}
      {!selectedVehicleId && !selectedProjectId && (
        <Card className="border-border/50 bg-card/50 backdrop-blur-sm animate-fade-in" style={{ animationDelay: "350ms" }}>
          <CardContent className="p-4">
            <div className="flex items-center gap-3 mb-3">
              <span className="text-sm font-semibold">Filo Durumu</span>
            </div>
            {/* Status bar */}
            <div className="h-3 rounded-full overflow-hidden flex bg-muted/30 mb-3">
              {fleetStats.kirada > 0 && (
                <div
                  className="h-full transition-all duration-500"
                  style={{
                    width: `${(fleetStats.kirada / fleetStats.toplam) * 100}%`,
                    backgroundColor: VEHICLE_STATUS_COLORS.kirada.text,
                  }}
                />
              )}
              {fleetStats.musait > 0 && (
                <div
                  className="h-full transition-all duration-500"
                  style={{
                    width: `${(fleetStats.musait / fleetStats.toplam) * 100}%`,
                    backgroundColor: VEHICLE_STATUS_COLORS.musait.text,
                  }}
                />
              )}
              {fleetStats.rezerve > 0 && (
                <div
                  className="h-full transition-all duration-500"
                  style={{
                    width: `${(fleetStats.rezerve / fleetStats.toplam) * 100}%`,
                    backgroundColor: VEHICLE_STATUS_COLORS.rezerve.text,
                  }}
                />
              )}
              {fleetStats.bakimda > 0 && (
                <div
                  className="h-full transition-all duration-500"
                  style={{
                    width: `${(fleetStats.bakimda / fleetStats.toplam) * 100}%`,
                    backgroundColor: VEHICLE_STATUS_COLORS.bakimda.text,
                  }}
                />
              )}
            </div>
            <div className="flex items-center gap-4 flex-wrap">
              {(["kirada", "musait"] as const).map((status) => (
                <div key={status} className="flex items-center gap-1.5">
                  <div
                    className="w-2.5 h-2.5 rounded-full"
                    style={{ backgroundColor: VEHICLE_STATUS_COLORS[status].text }}
                  />
                  <span className="text-xs text-muted-foreground">
                    {VEHICLE_STATUS_LABELS[status]}: <strong className="text-foreground">{fleetStats[status]}</strong>
                  </span>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Displayed Projects */}
      {displayedProjects.length > 0 && (
        <Card className="border-border/50 bg-card/50 backdrop-blur-sm animate-fade-in" style={{ animationDelay: "400ms" }}>
          <CardHeader className="pb-2">
            <CardTitle className="text-base font-semibold flex items-center gap-2">
              {selectedProjectId ? "Proje Detayı" : "Aktif Projeler"}
              <Badge variant="secondary" className="text-xs">{displayedProjects.length}</Badge>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex flex-col gap-2">
              {displayedProjects.map((project, i) => {
                const endDate = new Date(project.endDate);
                const today = new Date();
                const daysLeft = Math.ceil((endDate.getTime() - today.getTime()) / (1000 * 60 * 60 * 24));

                return (
                  <details
                    key={project.id}
                    className="group border border-border/30 bg-accent/10 hover:bg-accent/20 rounded-lg transition-colors overflow-hidden animate-slide-in"
                    style={{ animationDelay: `${400 + i * 60}ms` }}
                  >
                    <summary className="flex items-center justify-between p-3 sm:p-4 cursor-pointer list-none select-none">
                      {/* Left: Info */}
                      <div className="flex items-center gap-3 flex-1 min-w-0">
                        <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0 group-open:bg-primary/20 group-open:text-primary transition-colors">
                          <svg className="w-4 h-4 text-primary transition-transform group-open:rotate-90" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" /></svg>
                        </div>
                        <div className="min-w-0">
                          <p className="text-sm font-semibold truncate">{project.projectName}</p>
                          <p className="text-xs text-muted-foreground">{project.vehicleIds.length} Araç Mevcut</p>
                        </div>
                      </div>

                      {/* Right: Actions & Status */}
                      <div className="flex items-center gap-3 sm:gap-6 flex-shrink-0 ml-3">
                        <Badge
                          className="text-[10px] sm:text-xs hidden sm:inline-flex"
                          style={{
                            backgroundColor: daysLeft <= 1 ? "oklch(0.5 0.2 25 / 20%)" : "oklch(0.45 0.15 145 / 20%)",
                            color: daysLeft <= 1 ? "oklch(0.7 0.2 25)" : "oklch(0.7 0.18 145)",
                          }}
                        >
                          {daysLeft <= 0 ? "Bugün bitiyor" : `${daysLeft} gün kaldı`}
                        </Badge>
                        <div className="flex items-center gap-1" onClick={(e) => e.preventDefault()}>
                          <EditProjectDialog project={project}>
                            <button className="p-1.5 rounded-md text-muted-foreground hover:bg-primary/20 hover:text-primary transition-colors" title="Projeyi Düzenle">
                              <Edit2 className="w-4 h-4" />
                            </button>
                          </EditProjectDialog>
                          <button 
                            onClick={(e) => {
                              if (confirm(`'${project.projectName}' projesini silmek istediğinize emin misiniz? Bu işlem geri alınamaz.`)) {
                                deleteProject(project.id);
                              }
                            }}
                            className="p-1.5 rounded-md text-muted-foreground hover:bg-destructive/20 hover:text-destructive transition-colors" title="Projeyi Sil"
                          >
                            <Trash className="w-4 h-4" />
                          </button>
                        </div>
                      </div>
                    </summary>

                    {/* Expanded Content */}
                    <div className="p-3 sm:p-4 pt-0 border-t border-border/30 bg-background/50">
                      <div className="flex items-center justify-between mb-3 mt-2">
                        <span className="text-xs font-medium text-muted-foreground uppercase tracking-wider">Projeye Ait Araçlar</span>
                        <AddVehicleToProjectDialog projectId={project.id}>
                          <button className="flex items-center gap-1 bg-primary/10 hover:bg-primary/20 text-primary border border-primary/30 rounded px-2.5 py-1 transition-colors shadow-sm font-medium text-[11px]" title="Araç Ekle">
                            <Plus className="w-3.5 h-3.5" /> Ekle
                          </button>
                        </AddVehicleToProjectDialog>
                      </div>
                      <div className="flex flex-wrap gap-1.5 max-h-48 overflow-y-auto custom-scrollbar pr-1">
                        {project.vehicleIds.map(vId => {
                          const v = vehicles.find(x => x.id === vId);
                          if (!v) return null;
                          return (
                            <div key={vId} className="flex items-center gap-1.5 bg-card border border-border/60 rounded-md px-2 py-1 text-xs font-medium shadow-sm hover:border-primary/40 transition-colors">
                              <span>{v.plate}</span>
                              <button 
                                onClick={(e) => {
                                  e.preventDefault();
                                  if (confirm(`${v.plate} plakalı aracı bu projeden çıkarmak istediğinize emin misiniz?`)) {
                                    removeVehicleFromProject(project.id, vId);
                                  }
                                }}
                                className="text-muted-foreground hover:text-destructive transition-colors"
                                title="Projeden Çıkar"
                              >
                                <X className="w-3.5 h-3.5" />
                              </button>
                            </div>
                          );
                        })}
                        {project.vehicleIds.length === 0 && (
                          <div className="text-xs text-muted-foreground py-2 italic">
                            Bu projede henüz araç bulunmuyor.
                          </div>
                        )}
                      </div>
                    </div>
                  </details>
                );
              })}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Monthly Chart */}
        <Card className="border-border/50 bg-card/50 backdrop-blur-sm animate-fade-in" style={{ animationDelay: "500ms" }}>
          <CardHeader className="pb-2">
            <CardTitle className="text-base font-semibold flex items-center gap-2">
              Aylık Gider Trendi
            </CardTitle>
          </CardHeader>
          <CardContent>
            {monthlyData.length > 0 ? (
              <div className="h-[260px] w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={monthlyData} margin={{ top: 5, right: 5, bottom: 5, left: 5 }}>
                    <XAxis dataKey="month" tick={{ fill: "oklch(0.6 0.02 260)", fontSize: 11 }} axisLine={false} tickLine={false} />
                    <YAxis tick={{ fill: "oklch(0.6 0.02 260)", fontSize: 11 }} axisLine={false} tickLine={false} tickFormatter={(v) => `₺${(v / 1000).toFixed(0)}k`} />
                    <Tooltip
                      cursor={{ fill: 'rgba(255, 255, 255, 0.05)' }}
                      contentStyle={{ backgroundColor: "rgba(17, 24, 39, 0.95)", border: "1px solid rgba(75, 85, 99, 0.4)", borderRadius: "8px", boxShadow: "0 10px 15px -3px rgba(0, 0, 0, 0.5)", fontSize: "13px" }}
                      itemStyle={{ color: "#f3f4f6", fontWeight: 600 }}
                      labelStyle={{ color: "#9ca3af", fontWeight: 500, marginBottom: "4px" }}
                      formatter={(value: any) => [formatCurrency(value as number), "Toplam"]}
                    />
                    <Bar dataKey="total" radius={[6, 6, 0, 0]} maxBarSize={40}>
                      {monthlyData.map((_, index) => (
                        <Cell key={`cell-${index}`} fill={`oklch(${0.55 + (index % 3) * 0.08} 0.2 ${250 + index * 15})`} />
                      ))}
                    </Bar>
                  </BarChart>
                </ResponsiveContainer>
              </div>
            ) : (
              <div className="h-[260px] flex items-center justify-center text-muted-foreground">Henüz veri yok</div>
            )}
          </CardContent>
        </Card>

        {/* Category Chart */}
        <Card className="border-border/50 bg-card/50 backdrop-blur-sm animate-fade-in" style={{ animationDelay: "600ms" }}>
          <CardHeader className="pb-2">
            <CardTitle className="text-base font-semibold flex items-center gap-2">
              Gider Dağılımı
            </CardTitle>
          </CardHeader>
          <CardContent>
            {categoryData.length > 0 ? (
              <div className="flex items-center gap-4">
                <div className="h-[260px] w-[200px] flex-shrink-0">
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie data={categoryData} dataKey="total" nameKey="label" cx="50%" cy="50%" outerRadius={90} innerRadius={50} strokeWidth={2} stroke="oklch(0.17 0.015 260)">
                        {categoryData.map((_, index) => (
                          <Cell key={`cell-${index}`} fill={PIE_COLORS[index % PIE_COLORS.length]} />
                        ))}
                      </Pie>
                      <Tooltip
                        contentStyle={{ backgroundColor: "rgba(17, 24, 39, 0.95)", border: "1px solid rgba(75, 85, 99, 0.4)", borderRadius: "8px", boxShadow: "0 10px 15px -3px rgba(0, 0, 0, 0.5)", fontSize: "13px" }}
                        itemStyle={{ color: "#f3f4f6", fontWeight: 600 }}
                        formatter={(value: any) => [formatCurrency(value as number), ""]}
                      />
                    </PieChart>
                  </ResponsiveContainer>
                </div>
                <div className="flex-1 space-y-2 overflow-y-auto max-h-[260px]">
                  {categoryData.map((cat, i) => (
                    <div key={cat.category} className="flex items-center gap-2 text-sm">
                      <div className="w-3 h-3 rounded-full flex-shrink-0" style={{ backgroundColor: PIE_COLORS[i % PIE_COLORS.length] }} />
                      <span className="flex-1 truncate">{cat.label}</span>
                      <span className="font-medium tabular-nums">{formatCurrency(cat.total)}</span>
                    </div>
                  ))}
                </div>
              </div>
            ) : (
              <div className="h-[260px] flex items-center justify-center text-muted-foreground">Henüz veri yok</div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Recent Expenses */}
      <Card className="border-border/50 bg-card/50 backdrop-blur-sm animate-fade-in" style={{ animationDelay: "700ms" }}>
        <CardHeader className="pb-2">
          <CardTitle className="text-base font-semibold flex items-center gap-2">
            Son Gider İşlemleri
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {filteredExpenses
              .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
              .slice(0, 8)
              .map((expense, i) => {
                const vehicle = vehicles.find((v) => v.id === expense.vehicleId);
                return (
                  <div
                    key={expense.id}
                    className="flex items-center gap-3 p-3 rounded-lg hover:bg-accent/50 transition-colors animate-slide-in"
                    style={{ animationDelay: `${700 + i * 50}ms` }}
                  >
                    <div
                      className="w-10 h-10 rounded-lg flex items-center justify-center text-lg flex-shrink-0"
                      style={{ backgroundColor: `color-mix(in oklch, ${EXPENSE_CATEGORY_COLORS[expense.category]} 20%, transparent)` }}
                    >
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium truncate">{expense.description}</p>
                      <p className="text-xs text-muted-foreground">
                        {vehicle && !selectedVehicleId && (
                          <span className="inline-flex items-center gap-1 mr-2">
                            <span className="w-2 h-2 rounded-full inline-block" style={{ backgroundColor: vehicle.color }} />
                            {vehicle.plate} · {vehicle.brand} {vehicle.model}
                          </span>
                        )}
                        {new Date(expense.date).toLocaleDateString("tr-TR", { day: "numeric", month: "short", year: "numeric" })}
                      </p>
                    </div>
                    <div className="text-right flex-shrink-0">
                      <p className="text-sm font-semibold text-destructive">-{formatCurrency(expense.amount)}</p>
                      {expense.liters && <p className="text-xs text-muted-foreground">{expense.liters} lt</p>}
                    </div>
                  </div>
                );
              })}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
