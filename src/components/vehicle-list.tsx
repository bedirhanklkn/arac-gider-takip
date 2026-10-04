"use client";

import { useState } from "react";
import { useApp } from "@/lib/store";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Search, Edit2 } from "lucide-react";
import { EditVehicleDialog } from "@/components/dialogs";
import {
  FUEL_TYPE_LABELS, VEHICLE_STATUS_LABELS, VEHICLE_STATUS_COLORS,
} from "@/lib/types";

function formatCurrency(amount: number): string {
  return new Intl.NumberFormat("tr-TR", {
    style: "currency",
    currency: "TRY",
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(amount);
}

export function VehicleList() {
  const { vehicles, projects, selectedVehicleId, setSelectedVehicleId, getTotalExpense, getFleetStats } = useApp();
  const fleetStats = getFleetStats();
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState<string | null>(null);

  const enrichedVehicles = vehicles.map(v => {
    const activeProject = projects.find(p => p.status === "aktif" && p.vehicleIds.includes(v.id));
    return {
      ...v,
      displayRenter: activeProject?.projectName || v.currentRenter,
      displayEndDate: activeProject?.endDate || v.rentalEndDate
    };
  });

  const filteredVehicles = enrichedVehicles.filter((v) => {
    if (statusFilter && v.status !== statusFilter) return false;
    if (!searchQuery) return true;
    
    // Convert to lowercase but handle Turkish character dotless i safely using standard toLocaleLowerCase if needed
    // However, simple toLowerCase works for most cases unless specifically typing 'I'
    const lowerQuery = searchQuery.toLocaleLowerCase('tr-TR');
    
    return (
      v.plate.toLocaleLowerCase('tr-TR').includes(lowerQuery) ||
      v.brand.toLocaleLowerCase('tr-TR').includes(lowerQuery) ||
      v.model.toLocaleLowerCase('tr-TR').includes(lowerQuery) ||
      (v.displayRenter?.toLocaleLowerCase('tr-TR').includes(lowerQuery) ?? false)
    );
  });

  return (
    <div className="space-y-2">
      {/* All vehicles option */}
      <button
        onClick={() => setSelectedVehicleId(null)}
        className={`w-full text-left p-3 rounded-xl transition-all duration-200 ${
          selectedVehicleId === null
            ? "bg-primary/15 border border-primary/30 glow"
            : "hover:bg-accent/50 border border-transparent"
        }`}
      >
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-indigo-500/30 to-purple-500/30 flex items-center justify-center text-lg">
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-sm font-semibold">Tüm Filo</p>
            <p className="text-xs text-muted-foreground">
              {fleetStats.toplam} araç · {fleetStats.kirada} kirada
            </p>
          </div>
          <div className="text-right">
            <p className="text-xs font-semibold">{formatCurrency(getTotalExpense())}</p>
            <p className="text-[10px] text-muted-foreground">toplam gider</p>
          </div>
        </div>
      </button>

      {/* Search Input */}
      <div className="relative px-1 pt-1 pb-2">
        <div className="absolute inset-y-0 left-3 top-1 flex items-center pointer-events-none">
          <Search className="h-3.5 w-3.5 text-muted-foreground" />
        </div>
        <Input
          placeholder="Plaka, marka, model veya proje ara..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="pl-8 h-8 text-xs bg-card/30 border-border/40 placeholder:text-muted-foreground/70"
        />
      </div>

      {/* Status filter pills */}
      <div className="flex gap-1.5 px-1 py-1 flex-wrap">
        {(["kirada", "musait", "bakimda", "rezerve"] as const).map((status) => {
          const count = vehicles.filter((v) => v.status === status).length;
          if (count === 0) return null;
          const isActive = statusFilter === status;
          return (
            <button
              key={status}
              onClick={() => setStatusFilter(isActive ? null : status)}
              className={`text-[10px] px-2 py-0.5 rounded-full font-medium transition-all ${isActive ? 'ring-2 ring-offset-1 ring-offset-background' : 'opacity-80 hover:opacity-100'}`}
              style={{
                backgroundColor: VEHICLE_STATUS_COLORS[status].bg,
                color: VEHICLE_STATUS_COLORS[status].text,
                ...(isActive ? { ringColor: VEHICLE_STATUS_COLORS[status].text } : {})
              }}
            >
              {count} {VEHICLE_STATUS_LABELS[status]}
            </button>
          );
        })}
      </div>

      {/* Vehicle cards */}
      {filteredVehicles.length === 0 ? (
        <div className="text-center py-6 text-xs text-muted-foreground">
          Aradığınız kriterlere uygun araç bulunamadı.
        </div>
      ) : (
        filteredVehicles.map((vehicle, i) => {
          const vehicleTotal = getTotalExpense(vehicle.id);
        const isSelected = selectedVehicleId === vehicle.id;
        const statusStyle = VEHICLE_STATUS_COLORS[vehicle.status];

        return (
          <div
            key={vehicle.id}
            role="button"
            tabIndex={0}
            onClick={() => setSelectedVehicleId(vehicle.id)}
            onKeyDown={(e) => {
              if (e.key === 'Enter' || e.key === ' ') {
                setSelectedVehicleId(vehicle.id);
              }
            }}
            className={`w-full text-left p-2.5 rounded-lg transition-all duration-200 animate-fade-in flex items-center justify-between group cursor-pointer ${
              isSelected
                ? "bg-primary/15 border border-primary/30 glow"
                : "hover:bg-accent/40 border border-transparent"
            }`}
            style={{ animationDelay: `${i * 60}ms` }}
          >
            <div className="flex items-center gap-3 overflow-hidden">
              <div 
                className="w-2 h-2 rounded-full flex-shrink-0" 
                style={{ backgroundColor: statusStyle.text, boxShadow: `0 0 6px ${statusStyle.text}` }}
                title={VEHICLE_STATUS_LABELS[vehicle.status]}
              />
              <div className="min-w-0 flex-1">
                <p className="text-sm font-semibold tracking-wide truncate">
                  {vehicle.plate}
                </p>
                <p className="text-[10px] text-muted-foreground truncate">
                  {vehicle.brand} {vehicle.model}
                </p>
              </div>
            </div>
            
            <div className="text-right flex-shrink-0 ml-2 flex items-center gap-1">
              {vehicle.status === "kirada" && vehicle.displayRenter ? (
                <div className="text-[9px] text-primary/80 truncate border border-primary/20 bg-primary/10 px-1.5 py-0.5 rounded max-w-[70px]">
                  {vehicle.displayRenter}
                </div>
              ) : vehicle.status === "bakimda" ? (
                <div className="text-[9px] text-amber-500/80 truncate border border-amber-500/20 bg-amber-500/10 px-1.5 py-0.5 rounded">
                  Serviste
                </div>
              ) : (
                <p className="text-[10px] text-muted-foreground/60 font-medium group-hover:text-muted-foreground/80 transition-colors">
                  {vehicle.currentKm > 0 ? `${(vehicle.currentKm / 1000).toFixed(0)}k` : '0'} km
                </p>
              )}
              <EditVehicleDialog vehicle={vehicle}>
                <button
                  type="button"
                  onClick={(e) => e.stopPropagation()}
                  className="p-1 rounded text-muted-foreground/0 group-hover:text-muted-foreground hover:!text-primary transition-all cursor-pointer"
                  title="Aracı Düzenle"
                >
                  <Edit2 className="w-3 h-3" />
                </button>
              </EditVehicleDialog>
            </div>
          </div>
        );
      })
      )}
    </div>
  );
}
