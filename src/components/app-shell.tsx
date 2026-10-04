"use client";

import { useState } from "react";
import { AppProvider, useApp } from "@/lib/store";
import { Dashboard } from "@/components/dashboard";
import { VehicleList } from "@/components/vehicle-list";
import { ProjectList } from "@/components/project-list";
import { ExpenseTable } from "@/components/expense-table";
import { AddExpenseDialog, AddVehicleDialog, AddBulkVehicleDialog, AddProjectDialog, ExportExpensesDialog } from "@/components/dialogs";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Separator } from "@/components/ui/separator";
import { Button } from "@/components/ui/button";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import { Badge } from "@/components/ui/badge";
import {
  VEHICLE_STATUS_LABELS, VEHICLE_STATUS_COLORS,
  FUEL_TYPE_LABELS,
} from "@/lib/types";
import Login from "./login";
import { LogOut, User as UserIcon, Home, ArrowLeft } from "lucide-react";

function AppContent() {
  const { selectedVehicleId, selectedProjectId, setSelectedVehicleId, setSelectedProjectId, vehicles, projects, getFleetStats, loading, user, signOut } = useApp();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const fleetStats = getFleetStats();

  if (!user) {
    return <Login />;
  }

  const selectedVehicle = selectedVehicleId
    ? vehicles.find((v) => v.id === selectedVehicleId)
    : null;

  const selectedProject = selectedProjectId
    ? projects.find((p) => p.id === selectedProjectId)
    : null;

  const pageTitle = selectedVehicle
    ? `${selectedVehicle.brand} ${selectedVehicle.model}`
    : selectedProject
      ? selectedProject.projectName
      : "Filo Genel Bakış";

  const pageSubtitle = selectedVehicle
    ? `${selectedVehicle.plate} · ${FUEL_TYPE_LABELS[selectedVehicle.fuelType]} · ${selectedVehicle.currentKm.toLocaleString("tr-TR")} km`
    : selectedProject
      ? `${selectedProject.vehicleIds.length} araç · Bitiş: ${new Date(selectedProject.endDate).toLocaleDateString("tr-TR")}`
      : `${fleetStats.toplam} araç · ${fleetStats.kirada} kirada · ${fleetStats.musait} müsait`;



  return (
    <div className="flex h-screen overflow-hidden bg-background">
      {/* Desktop Sidebar */}
      <aside className="hidden lg:flex flex-col w-[320px] border-r border-border/40 bg-card/30 backdrop-blur-sm">
        <div className="p-5 pb-3">
          <div className="flex items-center gap-3 mb-1">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-primary to-purple-500 flex items-center justify-center shadow-lg shadow-primary/20">
              <span className="text-xl font-bold text-white">FT</span>
            </div>
            <div>
              <h1 className="text-base font-bold tracking-tight gradient-text">FiloTakip</h1>
              <p className="text-[10px] text-muted-foreground">Filo Kiralama Yönetimi</p>
            </div>
          </div>
        </div>
        <Separator className="bg-border/30" />
        <div className="flex-1 overflow-y-auto p-3">
          {/* Genel Bakış Butonu */}
          <button
            onClick={() => { setSelectedVehicleId(null); setSelectedProjectId(null); }}
            className={`w-full flex items-center gap-2.5 px-3 py-2.5 rounded-lg mb-2 text-sm font-medium transition-all ${
              !selectedVehicleId && !selectedProjectId
                ? 'bg-primary/15 text-primary shadow-sm border border-primary/20'
                : 'text-muted-foreground hover:bg-accent/50 hover:text-foreground border border-transparent'
            }`}
          >
            <Home className="w-4 h-4" />
            Filo Genel Bakış
          </button>
          <Separator className="bg-border/30 mb-2" />
          <Tabs defaultValue="vehicles" className="w-full">
            <TabsList className="w-full bg-card/50 border border-border/30 p-1 mb-2">
              <TabsTrigger value="vehicles" className="flex-1 text-xs data-[state=active]:bg-primary/15 data-[state=active]:text-primary">Araçlar</TabsTrigger>
              <TabsTrigger value="projects" className="flex-1 text-xs data-[state=active]:bg-primary/15 data-[state=active]:text-primary">Projeler</TabsTrigger>
            </TabsList>
            <TabsContent value="vehicles" className="mt-0 border-none p-0 outline-none">
              <div className="flex items-center justify-between mb-2 px-1">
                <span className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Araç Filosu</span>
                <div className="flex gap-1">
                  <AddBulkVehicleDialog />
                  <AddVehicleDialog />
                </div>
              </div>
              <VehicleList />
            </TabsContent>
            <TabsContent value="projects" className="mt-0 border-none p-0 outline-none">
              <div className="flex items-center justify-between mb-2 px-1">
                <span className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Tüm Projeler</span>
              </div>
              <ProjectList />
            </TabsContent>
          </Tabs>
        </div>
        <Separator className="bg-border/30" />
        <div className="p-4 bg-gradient-to-t from-background to-card/10 border-t border-border/20 backdrop-blur-md">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-primary/20 to-purple-500/20 flex items-center justify-center border border-primary/20 shadow-inner">
              <UserIcon className="w-5 h-5 text-primary" />
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-semibold truncate text-foreground">{user?.email}</p>
              <p className="text-[11px] font-medium text-emerald-500/90 tracking-wider uppercase mt-0.5 flex items-center gap-1.5">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse"></span>
                Yönetici Hesabı
              </p>
            </div>
            <Button variant="ghost" size="icon" onClick={signOut} className="h-9 w-9 text-muted-foreground hover:text-red-400 hover:bg-red-500/10 transition-colors" title="Güvenli Çıkış">
              <LogOut className="h-4.5 w-4.5" />
            </Button>
          </div>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 flex flex-col overflow-hidden">
        {/* Top Bar */}
        <header className="h-16 border-b border-border/40 bg-card/20 backdrop-blur-sm flex items-center justify-between px-4 lg:px-6 flex-shrink-0">
          <div className="flex items-center gap-3">
            <Sheet open={sidebarOpen} onOpenChange={setSidebarOpen}>
              <SheetTrigger render={<Button variant="ghost" size="sm" className="lg:hidden h-8 w-8 p-0" />}>
                <span className="text-xs">Menü</span>
              </SheetTrigger>
              <SheetContent side="left" className="w-[320px] p-0 bg-card">
                <div className="p-5 pb-3">
                  <div className="flex items-center gap-3 mb-1">
                    <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-primary to-purple-500 flex items-center justify-center">
                    </div>
                    <div>
                      <h1 className="text-base font-bold tracking-tight gradient-text">FiloTakip</h1>
                      <p className="text-[10px] text-muted-foreground">Filo Kiralama Yönetimi</p>
                    </div>
                  </div>
                </div>
                <Separator className="bg-border/30" />
                <div className="p-3 overflow-y-auto" style={{ height: "calc(100vh - 80px)" }}>
                  {/* Genel Bakış Butonu - Mobil */}
                  <button
                    onClick={() => { setSelectedVehicleId(null); setSelectedProjectId(null); setSidebarOpen(false); }}
                    className={`w-full flex items-center gap-2.5 px-3 py-2.5 rounded-lg mb-2 text-sm font-medium transition-all ${
                      !selectedVehicleId && !selectedProjectId
                        ? 'bg-primary/15 text-primary shadow-sm border border-primary/20'
                        : 'text-muted-foreground hover:bg-accent/50 hover:text-foreground border border-transparent'
                    }`}
                  >
                    <Home className="w-4 h-4" />
                    Filo Genel Bakış
                  </button>
                  <Separator className="bg-border/30 mb-2" />
                  <Tabs defaultValue="vehicles" className="w-full">
                    <TabsList className="w-full bg-card/50 border border-border/30 p-1 mb-2">
                      <TabsTrigger value="vehicles" className="flex-1 text-xs data-[state=active]:bg-primary/15 data-[state=active]:text-primary">Araçlar</TabsTrigger>
                      <TabsTrigger value="projects" className="flex-1 text-xs data-[state=active]:bg-primary/15 data-[state=active]:text-primary">Projeler</TabsTrigger>
                    </TabsList>
                    <TabsContent value="vehicles" className="mt-0 border-none p-0 outline-none">
                      <div className="flex items-center justify-between mb-2 px-1">
                        <span className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Araç Filosu</span>
                        <div className="flex gap-1">
                          <AddBulkVehicleDialog />
                          <AddVehicleDialog />
                        </div>
                      </div>
                      <VehicleList />
                    </TabsContent>
                    <TabsContent value="projects" className="mt-0 border-none p-0 outline-none">
                      <div className="flex items-center justify-between mb-2 px-1">
                        <span className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Tüm Projeler</span>
                      </div>
                      <ProjectList />
                    </TabsContent>
                  </Tabs>
                </div>
                <Separator className="bg-border/30" />
                <div className="p-4 bg-gradient-to-t from-background to-card/10 border-t border-border/20 backdrop-blur-md">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-primary/20 to-purple-500/20 flex items-center justify-center border border-primary/20 shadow-inner">
                      <UserIcon className="w-5 h-5 text-primary" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-semibold truncate text-foreground">{user?.email}</p>
                      <p className="text-[11px] font-medium text-emerald-500/90 tracking-wider uppercase mt-0.5 flex items-center gap-1.5">
                        <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse"></span>
                        Yönetici Hesabı
                      </p>
                    </div>
                    <Button variant="ghost" size="icon" onClick={signOut} className="h-9 w-9 text-muted-foreground hover:text-red-400 hover:bg-red-500/10 transition-colors" title="Güvenli Çıkış">
                      <LogOut className="h-4.5 w-4.5" />
                    </Button>
                  </div>
                </div>
              </SheetContent>
            </Sheet>

            {(selectedVehicle || selectedProject) && (
              <button
                onClick={() => { setSelectedVehicleId(null); setSelectedProjectId(null); }}
                className="p-1.5 rounded-lg hover:bg-accent/50 text-muted-foreground hover:text-foreground transition-colors mr-1"
                title="Filo Genel Bakış'a Dön"
              >
                <ArrowLeft className="w-4 h-4" />
              </button>
            )}
            <div>
              <h2 className="text-sm font-semibold flex items-center gap-2">
                {selectedVehicle && (
                  <Badge
                    className="text-[9px] px-1.5 py-0 h-4 border-0"
                    style={{
                      backgroundColor: VEHICLE_STATUS_COLORS[selectedVehicle.status].bg,
                      color: VEHICLE_STATUS_COLORS[selectedVehicle.status].text,
                    }}
                  >
                    {VEHICLE_STATUS_LABELS[selectedVehicle.status]}
                  </Badge>
                )}
                {selectedProject && (
                  <Badge
                    className="text-[9px] px-1.5 py-0 h-4 border-0"
                    style={{
                      backgroundColor: selectedProject.status === "aktif" ? "oklch(0.45 0.15 145 / 20%)" : "oklch(0.5 0.2 25 / 20%)",
                      color: selectedProject.status === "aktif" ? "oklch(0.7 0.18 145)" : "oklch(0.7 0.2 25)",
                    }}
                  >
                    {selectedProject.status === "aktif" ? "Aktif" : "Bitti"}
                  </Badge>
                )}
                {pageTitle}
              </h2>
              <p className="text-[11px] text-muted-foreground">{pageSubtitle}</p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <ExportExpensesDialog />
            <AddProjectDialog />
            <AddExpenseDialog />
          </div>
        </header>

        {/* Content Area */}
        <div className="flex-1 overflow-y-auto">
          <div className="p-4 lg:p-6 max-w-7xl mx-auto w-full">
            <Tabs defaultValue="dashboard" className="space-y-4">
              <TabsList className="bg-card/50 border border-border/30 p-1">
                <TabsTrigger value="dashboard" className="text-xs data-[state=active]:bg-primary/15 data-[state=active]:text-primary data-[state=active]:shadow-sm gap-1.5">
                  Dashboard
                </TabsTrigger>
                <TabsTrigger value="expenses" className="text-xs data-[state=active]:bg-primary/15 data-[state=active]:text-primary data-[state=active]:shadow-sm gap-1.5">
                  Giderler
                </TabsTrigger>
              </TabsList>

              <TabsContent value="dashboard" className="mt-4">
                <Dashboard />
              </TabsContent>
              <TabsContent value="expenses" className="mt-4">
                <ExpenseTable />
              </TabsContent>
            </Tabs>
          </div>
        </div>
      </main>
    </div>
  );
}

export default function AppShell() {
  return (
    <AppProvider>
      <AppContent />
    </AppProvider>
  );
}
