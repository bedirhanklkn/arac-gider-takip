"use client";

import { useState } from "react";
import { useApp } from "@/lib/store";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Search } from "lucide-react";

function formatCurrency(amount: number): string {
  return new Intl.NumberFormat("tr-TR", {
    style: "currency",
    currency: "TRY",
    minimumFractionDigits: 2,
    maximumFractionDigits: 3,
  }).format(amount);
}

export function ProjectList() {
  const { projects, selectedProjectId, setSelectedProjectId, getTotalExpense } = useApp();
  const [searchQuery, setSearchQuery] = useState("");

  const filteredProjects = projects
    .filter((p) => p.projectName.toLowerCase().includes(searchQuery.toLowerCase()))
    .sort((a, b) => a.projectName.localeCompare(b.projectName, 'tr'));

  if (projects.length === 0) {
    return (
      <div className="p-3 text-center text-sm text-muted-foreground border border-border/50 rounded-lg bg-card/20">
        Henüz proje eklenmedi.
      </div>
    );
  }

  return (
    <div className="space-y-2 mt-2">
      <div className="relative px-1 pt-1 pb-2">
        <div className="absolute inset-y-0 left-3 top-1 flex items-center pointer-events-none">
          <Search className="h-3.5 w-3.5 text-muted-foreground" />
        </div>
        <Input
          placeholder="Proje ara..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="pl-8 h-8 text-xs bg-card/30 border-border/40 placeholder:text-muted-foreground/70"
        />
      </div>

      {filteredProjects.length === 0 ? (
        <div className="text-center py-6 text-xs text-muted-foreground">
          Aradığınız kriterlere uygun proje bulunamadı.
        </div>
      ) : (
        filteredProjects.map((project, i) => {
        const projectTotal = getTotalExpense(null, project.id);
        const isSelected = selectedProjectId === project.id;
        
        const endDate = new Date(project.endDate);
        const today = new Date();
        const daysLeft = Math.ceil((endDate.getTime() - today.getTime()) / (1000 * 60 * 60 * 24));

        return (
          <button
            key={project.id}
            onClick={() => setSelectedProjectId(project.id)}
            className={`w-full text-left p-3 rounded-xl transition-all duration-200 animate-fade-in ${
              isSelected
                ? "bg-primary/15 border border-primary/30 glow"
                : "hover:bg-accent/50 border border-transparent"
            }`}
            style={{ animationDelay: `${i * 60}ms` }}
          >
            <div className="flex items-center gap-3">
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-1.5 mb-0.5">
                  <p className="text-sm font-semibold truncate">
                    {project.projectName}
                  </p>
                  <Badge
                    className="text-[9px] px-1.5 py-0 h-4 border-0"
                    style={{
                      backgroundColor: project.status === "aktif" ? "oklch(0.45 0.15 145 / 20%)" : "oklch(0.5 0.2 25 / 20%)",
                      color: project.status === "aktif" ? "oklch(0.7 0.18 145)" : "oklch(0.7 0.2 25)",
                    }}
                  >
                    {project.status === "aktif" ? "Aktif" : project.status === "iptal" ? "İptal" : "Bitti"}
                  </Badge>
                </div>
                <div className="flex items-center gap-2 text-[10px] text-muted-foreground">
                  <span>{project.vehicleIds.length} araç</span>
                  <span>•</span>
                  <span>{daysLeft > 0 ? `${daysLeft} gün kaldı` : "Bitti"}</span>
                </div>
              </div>
              <div className="text-right">
                <p className="text-sm font-semibold text-rose-400">{formatCurrency(projectTotal)}</p>
                <p className="text-[10px] text-muted-foreground">proje gideri</p>
              </div>
            </div>
          </button>
        );
      })
      )}
    </div>
  );
}
