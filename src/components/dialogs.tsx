"use client";

import { useState } from "react";
import * as XLSX from "xlsx";
import { Search, ArrowLeft, Trash, Edit2, Plus, Download } from "lucide-react";
import { useApp } from "@/lib/store";
import {
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogDescription
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from "@/components/ui/select";
import type { ExpenseCategory, FuelType, VehicleStatus, ProjectRecord, Expense } from "@/lib/types";
import {
  EXPENSE_CATEGORY_LABELS, FUEL_TYPE_LABELS,
  VEHICLE_STATUS_LABELS,
} from "@/lib/types";

export function AddExpenseDialog() {
  const { vehicles, addExpense, selectedVehicleId, projects } = useApp();
  const [open, setOpen] = useState(false);
  const [step, setStep] = useState<1 | 2>(1);
  const [vehicleId, setVehicleId] = useState(selectedVehicleId || "");
  const [searchQuery, setSearchQuery] = useState("");
  const [category, setCategory] = useState<ExpenseCategory>("yakit");
  const [amount, setAmount] = useState("");
  const [date, setDate] = useState(new Date().toISOString().split("T")[0]);
  const [description, setDescription] = useState("");
  const [km, setKm] = useState("");
  const [liters, setLiters] = useState("");
  const [pricePerLiter, setPricePerLiter] = useState("");

  // Reset steps when modal opens/closes
  const handleOpenChange = (isOpen: boolean) => {
    setOpen(isOpen);
    if (!isOpen) {
      setStep(1);
      setSearchQuery("");
      setVehicleId(selectedVehicleId || "");
    } else {
      if (selectedVehicleId) {
        setVehicleId(selectedVehicleId);
        setStep(2);
      } else {
        setStep(1);
      }
    }
  };

  const handleSelectVehicle = (id: string) => {
    setVehicleId(id);
    setStep(2);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!vehicleId || !amount || !date) return;
    addExpense({
      vehicleId, category, amount: parseFloat(amount), date,
      description: description || EXPENSE_CATEGORY_LABELS[category],
      km: km ? parseInt(km) : undefined,
      liters: liters ? parseFloat(liters) : undefined,
      pricePerLiter: pricePerLiter ? parseFloat(pricePerLiter) : undefined,
    });
    setAmount(""); setDescription(""); setKm(""); setLiters(""); setPricePerLiter(""); setSearchQuery("");
    setOpen(false);
    setStep(1);
  };

  const filteredVehicles = vehicles.filter(v => {
    if (!searchQuery) return true;
    const q = searchQuery.toLowerCase();
    return v.plate.toLowerCase().includes(q) || v.brand.toLowerCase().includes(q) || v.model.toLowerCase().includes(q);
  });

  const selectedVehicle = vehicles.find(v => v.id === vehicleId);

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogTrigger render={<Button className="gap-2 bg-primary hover:bg-primary/90 shadow-lg shadow-primary/20 px-3 sm:px-4" />}>
        <Plus className="w-4 h-4" />
        <span className="hidden sm:inline">Gider Ekle</span>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[480px] p-0 gap-0 overflow-hidden bg-card border-border/50">
        {step === 1 ? (
          <>
            <DialogHeader className="p-5 pb-4 border-b border-border/30">
              <DialogTitle className="text-xl font-bold">Araç Seçin</DialogTitle>
            </DialogHeader>
            <div className="p-3 border-b border-border/30 bg-muted/20">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  className="pl-9 bg-background/50 border-border/40 focus-visible:ring-primary/30"
                  placeholder="Plaka veya marka ara..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  autoFocus
                />
              </div>
            </div>
            <div className="max-h-[320px] overflow-y-auto p-2">
              {filteredVehicles.length === 0 ? (
                <div className="p-8 text-center text-sm text-muted-foreground flex flex-col items-center gap-2">
                  <span className="text-2xl">🔍</span>
                  <p>Araç bulunamadı.</p>
                </div>
              ) : (
                <div className="flex flex-col gap-1">
                  {filteredVehicles.map((v) => (
                    <button
                      key={v.id}
                      onClick={() => handleSelectVehicle(v.id)}
                      className="flex items-center justify-between p-3 rounded-lg hover:bg-accent/40 transition-colors text-left group border border-transparent hover:border-border/30"
                    >
                      <div>
                        <p className="font-bold text-sm">{v.plate}</p>
                        <p className="text-xs text-muted-foreground group-hover:text-foreground/80 transition-colors">
                          {v.brand} {v.model}
                        </p>
                      </div>
                      <div className="text-right">
                        <p className="text-[10px] text-muted-foreground">
                          {v.currentKm > 0 ? `${(v.currentKm / 1000).toFixed(0)}k km` : '0 km'}
                        </p>
                        <p className="text-[10px] text-primary/0 group-hover:text-primary transition-colors font-medium mt-0.5">
                          Seç ve Devam Et
                        </p>
                      </div>
                    </button>
                  ))}
                </div>
              )}
            </div>
          </>
        ) : (
          <>
            <DialogHeader className="p-5 pb-4 border-b border-border/30">
              <div className="flex items-center gap-2">
                <button
                  onClick={() => setStep(1)}
                  className="p-1.5 -ml-2 rounded-md hover:bg-accent/50 text-muted-foreground hover:text-foreground transition-colors"
                  title="Geri Dön"
                >
                  <ArrowLeft className="w-4 h-4" />
                </button>
                <div>
                  <DialogTitle className="text-xl font-bold">Gider Ekle</DialogTitle>
                  <p className="text-xs text-primary font-medium mt-0.5">
                    {selectedVehicle?.plate}
                    {(() => {
                      const activeProject = projects.find(p => p.status === "aktif" && p.vehicleIds.includes(vehicleId));
                      return activeProject ? (
                        <span className="text-emerald-500 ml-1.5">· {activeProject.projectName}</span>
                      ) : null;
                    })()}
                  </p>
                </div>
              </div>
            </DialogHeader>
            <form onSubmit={handleSubmit} className="space-y-4 p-5">
              <div className="space-y-2">
                <Label htmlFor="category" className="text-sm font-medium">Kategori</Label>
                <Select value={category} onValueChange={(v) => setCategory(v as ExpenseCategory)}>
                  <SelectTrigger id="category" className="bg-input/50">
                    <SelectValue placeholder="Kategori seçin">
                      {category ? EXPENSE_CATEGORY_LABELS[category] : "Kategori seçin"}
                    </SelectValue>
                  </SelectTrigger>
                  <SelectContent>
                    {(Object.keys(EXPENSE_CATEGORY_LABELS) as ExpenseCategory[]).map((cat) => (
                      <SelectItem key={cat} value={cat}>
                        <span className="flex items-center gap-2">{EXPENSE_CATEGORY_LABELS[cat]}</span>
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-2">
                  <Label htmlFor="amount" className="text-sm font-medium">Tutar (₺)</Label>
                  <Input id="amount" type="number" step="0.01" placeholder="0.00" value={amount} onChange={(e) => setAmount(e.target.value)} required className="bg-input/50" />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="date" className="text-sm font-medium">Tarih</Label>
                  <Input id="date" type="date" value={date} onChange={(e) => setDate(e.target.value)} required className="bg-input/50" />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="description" className="text-sm font-medium">Açıklama</Label>
                <Input id="description" placeholder="Gider açıklaması..." value={description} onChange={(e) => setDescription(e.target.value)} className="bg-input/50" />
              </div>

              {category === "yakit" && (
                <div className="grid grid-cols-3 gap-3 p-3 rounded-lg bg-accent/30 border border-border/30">
                  <div className="space-y-2">
                    <Label htmlFor="km" className="text-xs text-muted-foreground">KM</Label>
                    <Input id="km" type="number" placeholder="45000" value={km} onChange={(e) => setKm(e.target.value)} className="bg-input/50 h-8 text-sm" />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="liters" className="text-xs text-muted-foreground">Litre</Label>
                    <Input id="liters" type="number" step="0.01" placeholder="42" value={liters} onChange={(e) => setLiters(e.target.value)} className="bg-input/50 h-8 text-sm" />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="pricePerLiter" className="text-xs text-muted-foreground">₺/lt</Label>
                    <Input id="pricePerLiter" type="number" step="0.01" placeholder="29.76" value={pricePerLiter} onChange={(e) => setPricePerLiter(e.target.value)} className="bg-input/50 h-8 text-sm" />
                  </div>
                </div>
              )}

              {category !== "yakit" && (category === "bakim" || category === "lastik" || category === "muayene") && (
                <div className="space-y-2">
                  <Label htmlFor="km" className="text-sm font-medium">Kilometre</Label>
                  <Input id="km" type="number" placeholder="Güncel km..." value={km} onChange={(e) => setKm(e.target.value)} className="bg-input/50" />
                </div>
              )}

              <Button type="submit" className="w-full bg-primary hover:bg-primary/90 shadow-lg shadow-primary/20 mt-2">
                Gider Kaydet
              </Button>
            </form>
          </>
        )}
      </DialogContent>
    </Dialog>
  );
}

export function AddVehicleDialog() {
  const { addVehicle } = useApp();
  const [open, setOpen] = useState(false);
  const [plate, setPlate] = useState("");
  const [brand, setBrand] = useState("");
  const [model, setModel] = useState("");
  const [year, setYear] = useState(new Date().getFullYear().toString());
  const [fuelType, setFuelType] = useState<FuelType>("benzin");
  const [currentKm, setCurrentKm] = useState("");

  const [status, setStatus] = useState<VehicleStatus>("musait");
  const [color, setColor] = useState("#6366f1");

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!plate || !brand || !model) return;
    addVehicle({
      plate: plate.toUpperCase(), brand, model, year: parseInt(year),
      fuelType, currentKm: parseInt(currentKm) || 0,
      status, color,
    });
    setPlate(""); setBrand(""); setModel(""); setCurrentKm("");
    setOpen(false);
  };

  const colorOptions = ["#6366f1", "#06b6d4", "#8b5cf6", "#ec4899", "#f59e0b", "#10b981", "#ef4444", "#3b82f6"];

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger render={<Button variant="outline" size="sm" className="gap-1 text-xs border-dashed border-border/60 hover:border-primary/50 hover:bg-primary/5" />}>
        Araç Ekle
      </DialogTrigger>
      <DialogContent className="sm:max-w-[520px] bg-card border-border/50">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 text-lg">
            Filoya Araç Ekle
          </DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4 mt-2">
          <div className="grid grid-cols-3 gap-3">
            <div className="space-y-2">
              <Label htmlFor="v-plate" className="text-sm font-medium">Plaka</Label>
              <Input id="v-plate" placeholder="34 FLT 011" value={plate} onChange={(e) => setPlate(e.target.value)} required className="bg-input/50" />
            </div>
            <div className="space-y-2">
              <Label htmlFor="v-brand" className="text-sm font-medium">Marka</Label>
              <Input id="v-brand" placeholder="Toyota" value={brand} onChange={(e) => setBrand(e.target.value)} required className="bg-input/50" />
            </div>
            <div className="space-y-2">
              <Label htmlFor="v-model" className="text-sm font-medium">Model</Label>
              <Input id="v-model" placeholder="Corolla" value={model} onChange={(e) => setModel(e.target.value)} required className="bg-input/50" />
            </div>
          </div>

          <div className="grid grid-cols-3 gap-3">
            <div className="space-y-2">
              <Label htmlFor="v-year" className="text-sm font-medium">Yıl</Label>
              <Input id="v-year" type="number" value={year} onChange={(e) => setYear(e.target.value)} required className="bg-input/50" />
            </div>
            <div className="space-y-2">
              <Label htmlFor="v-fuel" className="text-sm font-medium">Yakıt</Label>
              <Select value={fuelType} onValueChange={(v) => setFuelType(v as FuelType)}>
                <SelectTrigger id="v-fuel" className="bg-input/50">
                  <SelectValue placeholder="Yakıt Türü">
                    {fuelType ? FUEL_TYPE_LABELS[fuelType] : "Yakıt Türü"}
                  </SelectValue>
                </SelectTrigger>
                <SelectContent>
                  {(Object.keys(FUEL_TYPE_LABELS) as FuelType[]).map((ft) => (
                    <SelectItem key={ft} value={ft}>{FUEL_TYPE_LABELS[ft]}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label htmlFor="v-km" className="text-sm font-medium">Kilometre</Label>
              <Input id="v-km" type="number" placeholder="0" value={currentKm} onChange={(e) => setCurrentKm(e.target.value)} className="bg-input/50" />
            </div>
          </div>

          <div className="grid grid-cols-1 gap-3">
            <div className="space-y-2">
              <Label htmlFor="v-status" className="text-sm font-medium">Durum</Label>
              <Select value={status} onValueChange={(v) => setStatus(v as VehicleStatus)}>
                <SelectTrigger id="v-status" className="bg-input/50">
                  <SelectValue placeholder="Durum">
                    {status ? VEHICLE_STATUS_LABELS[status] : "Durum"}
                  </SelectValue>
                </SelectTrigger>
                <SelectContent>
                  {(Object.keys(VEHICLE_STATUS_LABELS) as VehicleStatus[]).map((vs) => (
                    <SelectItem key={vs} value={vs}>{VEHICLE_STATUS_LABELS[vs]}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="space-y-2">
            <Label className="text-sm font-medium">Renk</Label>
            <div className="flex gap-2">
              {colorOptions.map((c) => (
                <button key={c} type="button" onClick={() => setColor(c)}
                  className={`w-8 h-8 rounded-full transition-all ${color === c ? "ring-2 ring-white ring-offset-2 ring-offset-card scale-110" : "hover:scale-105"}`}
                  style={{ backgroundColor: c }}
                />
              ))}
            </div>
          </div>

          <Button type="submit" className="w-full bg-primary hover:bg-primary/90 shadow-lg shadow-primary/20">
            Filoya Ekle
          </Button>
        </form>
      </DialogContent>
    </Dialog>
  );
}

export function AddBulkVehicleDialog() {
  const { addVehicles } = useApp();
  const [open, setOpen] = useState(false);

  const downloadSampleExcel = () => {
    const ws = XLSX.utils.json_to_sheet([
      { Plaka: "34ABC123", Marka: "Toyota", Model: "Corolla", Yıl: 2023, KM: 15000 },
      { Plaka: "06XYZ456", Marka: "Fiat", Model: "Egea", Yıl: 2022, KM: 45000 },
    ]);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, "Örnek Araçlar");
    XLSX.writeFile(wb, "ornek_arac_listesi.xlsx");
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (evt) => {
      try {
        const data = new Uint8Array(evt.target?.result as ArrayBuffer);
        const workbook = XLSX.read(data, { type: "array" });
        const firstSheetName = workbook.SheetNames[0];
        const worksheet = workbook.Sheets[firstSheetName];
        const json = XLSX.utils.sheet_to_json(worksheet) as any[];

        const newVehicles = json.map(row => {
          const getVal = (keys: string[]) => {
            const matchKey = Object.keys(row).find(k => keys.includes(k.toLowerCase().trim()));
            return matchKey ? row[matchKey] : undefined;
          };

          const plate = getVal(["plaka", "plate"]);
          if (!plate) return null;

          return {
            plate: String(plate).toUpperCase().trim(),
            brand: String(getVal(["marka", "brand"]) || "Bilinmiyor"),
            model: String(getVal(["model"]) || "Bilinmiyor"),
            year: parseInt(getVal(["yıl", "yil", "year"]) as string) || new Date().getFullYear(),
            fuelType: "benzin" as FuelType,
            currentKm: parseInt(getVal(["km", "kilometre"]) as string) || 0,
            status: "musait" as VehicleStatus,
            color: "#6366f1",
          };
        }).filter(Boolean) as any[];

        if (newVehicles.length > 0) {
          addVehicles(newVehicles);
          setOpen(false);
        }
      } catch (err) {
        console.error("Excel okuma hatası", err);
      }
    };
    reader.readAsArrayBuffer(file);
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger render={<Button variant="outline" size="sm" className="gap-1 text-xs border-dashed border-border/60 hover:border-primary/50 hover:bg-primary/5" />}>
        Toplu Araç Ekle
      </DialogTrigger>
      <DialogContent className="sm:max-w-[400px] bg-card border-border/50">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 text-lg">
            Excel'den Araç Aktar
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-4 py-4 text-center">
          <div className="p-6 border-2 border-dashed border-border/60 rounded-xl bg-accent/10 flex flex-col items-center gap-3">
            <div className="w-12 h-12 rounded-full bg-emerald-500/20 text-emerald-500 flex items-center justify-center text-xl">📊</div>
            <div>
              <p className="text-sm font-medium">Excel veya CSV dosyası yükleyin</p>
              <p className="text-xs text-muted-foreground mt-1">Plaka, Marka, Model, Yıl ve KM sütunlarını içermelidir.</p>
            </div>
            <div className="flex flex-col w-full gap-2 mt-2">
              <Label htmlFor="excel-upload" className="cursor-pointer bg-primary text-primary-foreground px-4 py-2 rounded-md hover:bg-primary/90 shadow-sm text-sm font-medium">
                Dosya Seç ve Yükle
              </Label>
              <input id="excel-upload" type="file" accept=".xlsx, .xls, .csv" className="hidden" onChange={handleFileUpload} />

              <Button type="button" variant="outline" size="sm" onClick={downloadSampleExcel} className="text-xs text-muted-foreground h-9">
                Örnek Excel İndir
              </Button>
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}

export function AddProjectDialog() {
  const { vehicles, addProject, updateVehicle } = useApp();
  const [open, setOpen] = useState(false);
  const [selectedVehicleIds, setSelectedVehicleIds] = useState<string[]>([]);
  const [projectName, setProjectName] = useState("");
  const [projectDetails, setProjectDetails] = useState("");
  const [startDate, setStartDate] = useState(new Date().toISOString().split("T")[0]);
  const [endDate, setEndDate] = useState("");
  const [searchQuery, setSearchQuery] = useState("");

  const allAvailableVehicles = vehicles.filter((v) => v.status === "musait" || v.status === "rezerve");
  const availableVehicles = allAvailableVehicles.filter(v => {
    if (!searchQuery) return true;
    const q = searchQuery.toLowerCase();
    return v.plate.toLowerCase().includes(q) || v.brand.toLowerCase().includes(q) || v.model.toLowerCase().includes(q);
  });

  const days = startDate && endDate
    ? Math.max(1, Math.ceil((new Date(endDate).getTime() - new Date(startDate).getTime()) / (1000 * 60 * 60 * 24)))
    : 0;

  const toggleVehicleSelection = (id: string) => {
    setSelectedVehicleIds(prev =>
      prev.includes(id) ? prev.filter(vId => vId !== id) : [...prev, id]
    );
  };

  const isFormValid = selectedVehicleIds.length > 0 && projectName.trim() !== "" && startDate !== "" && endDate !== "";

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (selectedVehicleIds.length === 0 || !projectName || !startDate || !endDate) return;

    addProject({
      vehicleIds: selectedVehicleIds,
      projectName,
      projectDetails,
      startDate,
      endDate,
      status: "aktif",
    });

    selectedVehicleIds.forEach(id => {
      updateVehicle(id, {
        status: "kirada", currentRenter: projectName, rentalEndDate: endDate,
      });
    });

    setSelectedVehicleIds([]); setProjectName(""); setProjectDetails(""); setEndDate("");
    setOpen(false);
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger render={<Button variant="outline" className="gap-2 border-emerald-500/30 text-emerald-400 hover:bg-emerald-500/10 hover:text-emerald-300 px-3 sm:px-4" />}>
        <Plus className="w-4 h-4" />
        <span className="hidden sm:inline">Yeni Proje</span>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[480px] bg-card border-border/50">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 text-lg">
            Yeni Proje Oluştur
          </DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4 mt-2">

          <div className="space-y-2">
            <Label className="text-sm font-medium">Projeye Araç Ekle (Çoklu Seçim)</Label>

            <div className="relative">
              <div className="absolute inset-y-0 left-2.5 top-0 flex items-center pointer-events-none">
                <Search className="h-4 w-4 text-muted-foreground" />
              </div>
              <Input
                placeholder="Plaka, marka, model ara..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-9 h-9 text-xs bg-input/20 border-border/50"
              />
            </div>

            <div className="max-h-32 overflow-y-auto border border-border/50 rounded-md p-2 bg-input/20 space-y-1">
              {availableVehicles.length === 0 ? (
                <p className="text-sm text-muted-foreground p-2">Müsait araç yok</p>
              ) : (
                availableVehicles.map(v => (
                  <div key={v.id} className="flex items-center space-x-2">
                    <input
                      type="checkbox"
                      id={`chk-${v.id}`}
                      checked={selectedVehicleIds.includes(v.id)}
                      onChange={() => toggleVehicleSelection(v.id)}
                      className="rounded border-input text-primary focus:ring-primary h-4 w-4"
                    />
                    <Label htmlFor={`chk-${v.id}`} className="text-sm cursor-pointer flex-1">
                      {v.plate} - {v.brand} {v.model}
                    </Label>
                  </div>
                ))
              )}
            </div>
            <p className="text-xs text-muted-foreground">{selectedVehicleIds.length} araç seçildi</p>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-2">
              <Label htmlFor="p-name" className="text-sm font-medium">Proje Adı</Label>
              <Input id="p-name" placeholder="Proje İsmi veya Müşteri" value={projectName} onChange={(e) => setProjectName(e.target.value)} required className="bg-input/50" />
            </div>
            <div className="space-y-2">
              <Label htmlFor="p-details" className="text-sm font-medium">Detay / İletişim</Label>
              <Input id="p-details" placeholder="Not veya Telefon" value={projectDetails} onChange={(e) => setProjectDetails(e.target.value)} className="bg-input/50" />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-2">
              <Label htmlFor="p-start" className="text-sm font-medium">Başlangıç</Label>
              <Input id="p-start" type="date" value={startDate} onChange={(e) => setStartDate(e.target.value)} required className="bg-input/50" />
            </div>
            <div className="space-y-2">
              <Label htmlFor="p-end" className="text-sm font-medium">Bitiş</Label>
              <Input id="p-end" type="date" value={endDate} onChange={(e) => setEndDate(e.target.value)} required className="bg-input/50" />
            </div>
          </div>

          <Button type="submit" className="w-full bg-emerald-600 hover:bg-emerald-700 shadow-lg shadow-emerald-500/20" disabled={!isFormValid}>
            Projeyi Başlat
          </Button>
        </form>
      </DialogContent>
    </Dialog>
  );
}

export function ExportExpensesDialog() {
  const [open, setOpen] = useState(false);
  const [step, setStep] = useState<1 | 2>(1);
  const { vehicles, expenses } = useApp();
  const [selectedVehicleId, setSelectedVehicleId] = useState<string>("all");
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [searchQuery, setSearchQuery] = useState("");

  const handleOpenChange = (isOpen: boolean) => {
    setOpen(isOpen);
    if (!isOpen) {
      setStep(1);
      setSearchQuery("");
      setSelectedVehicleId("all");
      setStartDate("");
      setEndDate("");
    }
  };

  const filteredVehicles = vehicles.filter(v => {
    if (!searchQuery) return true;
    const q = searchQuery.toLowerCase();
    return v.plate.toLowerCase().includes(q) || v.brand.toLowerCase().includes(q) || v.model.toLowerCase().includes(q);
  });

  const handleSelectVehicle = (id: string) => {
    setSelectedVehicleId(id);
    setStep(2);
  };

  const handleExport = (e: React.FormEvent) => {
    e.preventDefault();
    let filtered = expenses;

    if (selectedVehicleId !== "all") {
      filtered = filtered.filter(e => e.vehicleId === selectedVehicleId);
    }

    if (startDate) {
      filtered = filtered.filter(e => new Date(e.date) >= new Date(startDate));
    }

    if (endDate) {
      filtered = filtered.filter(e => new Date(e.date) <= new Date(endDate));
    }

    if (filtered.length === 0) {
      alert("Bu kriterlere uygun gider bulunamadı!");
      return;
    }

    const dataToExport = filtered.map(exp => {
      const v = vehicles.find(v => v.id === exp.vehicleId);
      return {
        "Tarih": new Date(exp.date).toLocaleDateString("tr-TR"),
        "Plaka": v?.plate || "Silinmiş Araç",
        "Marka/Model": v ? `${v.brand} ${v.model}` : "-",
        "Kategori": EXPENSE_CATEGORY_LABELS[exp.category],
        "Tutar (TL)": exp.amount,
        "Açıklama": exp.description || "-"
      };
    });

    const ws = XLSX.utils.json_to_sheet(dataToExport);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, "Gider Raporu");

    const wscols = [
      { wch: 15 }, // Tarih
      { wch: 15 }, // Plaka
      { wch: 30 }, // Marka
      { wch: 20 }, // Kategori
      { wch: 15 }, // Tutar
      { wch: 50 }  // Açıklama
    ];
    ws['!cols'] = wscols;

    XLSX.writeFile(wb, `Gider_Raporu_${new Date().toISOString().split('T')[0]}.xlsx`);
    setOpen(false);
    setStep(1);
  };

  const selectedVehicle = selectedVehicleId === "all" ? null : vehicles.find(v => v.id === selectedVehicleId);

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogTrigger render={<Button variant="outline" className="gap-2 border-primary/30 text-primary hover:bg-primary/10 px-3 sm:px-4" />}>
        <Download className="w-4 h-4" />
        <span className="hidden sm:inline">Excel İndir</span>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[480px] p-0 gap-0 overflow-hidden bg-card border-border/50">
        {step === 1 ? (
          <>
            <DialogHeader className="p-5 pb-4 border-b border-border/30">
              <DialogTitle className="text-xl font-bold">Raporlanacak Aracı Seçin</DialogTitle>
              <DialogDescription className="text-xs pt-1">
                Gider raporunu almak istediğiniz aracı seçin veya "Tüm Araçlar" ile genel rapor oluşturun.
              </DialogDescription>
            </DialogHeader>
            <div className="p-3 border-b border-border/30 bg-muted/20">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  className="pl-9 bg-background/50 border-border/40 focus-visible:ring-primary/30"
                  placeholder="Plaka veya marka ara..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  autoFocus
                />
              </div>
            </div>
            <div className="max-h-[320px] overflow-y-auto p-2">
              <div className="flex flex-col gap-1">
                {(!searchQuery || "tüm araçlar".includes(searchQuery.toLowerCase())) && (
                  <button
                    onClick={() => handleSelectVehicle("all")}
                    className="flex items-center justify-between p-3 rounded-lg bg-primary/5 hover:bg-primary/10 transition-colors text-left group border border-primary/20 hover:border-primary/40 mb-2"
                  >
                    <div>
                      <p className="font-bold text-sm text-primary">Tüm Araçlar (Genel Rapor)</p>
                      <p className="text-xs text-muted-foreground transition-colors">
                        Sistemdeki tüm araçların giderlerini tek raporda toplayın.
                      </p>
                    </div>
                    <div className="text-right">
                      <p className="text-[10px] text-primary/0 group-hover:text-primary transition-colors font-medium mt-0.5">
                        Seç ve Devam Et
                      </p>
                    </div>
                  </button>
                )}

                {filteredVehicles.length === 0 ? (
                  <div className="p-8 text-center text-sm text-muted-foreground flex flex-col items-center gap-2">
                    <span className="text-2xl">🔍</span>
                    <p>Araç bulunamadı.</p>
                  </div>
                ) : (
                  filteredVehicles.map((v) => (
                    <button
                      key={v.id}
                      onClick={() => handleSelectVehicle(v.id)}
                      className="flex items-center justify-between p-3 rounded-lg hover:bg-accent/40 transition-colors text-left group border border-transparent hover:border-border/30"
                    >
                      <div>
                        <p className="font-bold text-sm">{v.plate}</p>
                        <p className="text-xs text-muted-foreground group-hover:text-foreground/80 transition-colors">
                          {v.brand} {v.model}
                        </p>
                      </div>
                      <div className="text-right">
                        <p className="text-[10px] text-primary/0 group-hover:text-primary transition-colors font-medium mt-0.5">
                          Seç ve Devam Et
                        </p>
                      </div>
                    </button>
                  ))
                )}
              </div>
            </div>
          </>
        ) : (
          <>
            <DialogHeader className="p-5 pb-4 border-b border-border/30">
              <div className="flex items-center gap-2">
                <button
                  onClick={() => setStep(1)}
                  className="p-1.5 -ml-2 rounded-md hover:bg-accent/50 text-muted-foreground hover:text-foreground transition-colors"
                  title="Geri Dön"
                >
                  <ArrowLeft className="w-4 h-4" />
                </button>
                <div>
                  <DialogTitle className="text-xl font-bold">Tarih Aralığı Belirleyin</DialogTitle>
                  <p className="text-xs text-primary font-medium mt-0.5">
                    {selectedVehicleId === "all" ? "Tüm Araçlar (Genel Rapor)" : selectedVehicle?.plate}
                  </p>
                </div>
              </div>
            </DialogHeader>
            <form onSubmit={handleExport} className="space-y-4 p-5">
              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-2">
                  <Label htmlFor="ex-start" className="text-sm font-medium">Başlangıç Tarihi</Label>
                  <Input id="ex-start" type="date" value={startDate} onChange={(e) => setStartDate(e.target.value)} className="bg-input/50" />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="ex-end" className="text-sm font-medium">Bitiş Tarihi</Label>
                  <Input id="ex-end" type="date" value={endDate} onChange={(e) => setEndDate(e.target.value)} className="bg-input/50" />
                </div>
              </div>

              <div className="bg-accent/20 border border-border/30 p-3 rounded-lg text-xs text-muted-foreground">
                <span className="text-foreground font-medium">Not:</span> Tarihleri boş bırakırsanız filtrelenen aracın (veya tüm araçların) tüm zamanlardaki tüm giderleri indirilir.
              </div>

              <Button type="submit" className="w-full bg-emerald-600 hover:bg-emerald-700 shadow-lg shadow-emerald-500/20 mt-4">
                Excel Dosyasını İndir
              </Button>
            </form>
          </>
        )}
      </DialogContent>
    </Dialog>
  );
}

export function AddVehicleToProjectDialog({ children, projectId }: { children: React.ReactNode, projectId: string }) {
  const [open, setOpen] = useState(false);
  const [selectedVehicleId, setSelectedVehicleId] = useState("");
  const [searchQuery, setSearchQuery] = useState("");
  const { vehicles, addVehicleToProject, projects } = useApp();

  // Find vehicles that are currently "musait" and match search
  const availableVehicles = vehicles.filter((v) => {
    if (v.status !== "musait") return false;
    if (!searchQuery) return true;
    const q = searchQuery.toLowerCase();
    return v.plate.toLowerCase().includes(q) || v.brand.toLowerCase().includes(q) || v.model.toLowerCase().includes(q);
  });

  const project = projects.find(p => p.id === projectId);

  const handleSelectVehicle = async (vehicleId: string) => {
    await addVehicleToProject(projectId, vehicleId);
    setOpen(false);
    setSearchQuery("");
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger render={children as React.ReactElement} />
      <DialogContent className="sm:max-w-[480px] p-0 gap-0 overflow-hidden bg-card border-border/50">
        <DialogHeader className="p-5 pb-4 border-b border-border/30">
          <DialogTitle className="text-xl font-bold">Projeye Araç Ekle</DialogTitle>
          <DialogDescription className="text-xs pt-1">
            "{project?.projectName}" projesi için müsait bir araç arayın ve seçin.
          </DialogDescription>
        </DialogHeader>

        <div className="p-3 border-b border-border/30 bg-muted/20">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              className="pl-9 bg-background/50 border-border/40 focus-visible:ring-primary/30"
              placeholder="Plaka veya marka ara..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              autoFocus
            />
          </div>
        </div>

        <div className="max-h-[320px] overflow-y-auto p-2">
          {availableVehicles.length === 0 ? (
            <div className="p-8 text-center text-sm text-muted-foreground flex flex-col items-center gap-2">
              <span className="text-2xl">🔍</span>
              <p>Müsait araç bulunamadı.</p>
            </div>
          ) : (
            <div className="flex flex-col gap-1">
              {availableVehicles.map((v) => (
                <button
                  key={v.id}
                  onClick={() => handleSelectVehicle(v.id)}
                  className="flex items-center justify-between p-3 rounded-lg hover:bg-accent/40 transition-colors text-left group border border-transparent hover:border-border/30"
                >
                  <div>
                    <p className="font-bold text-sm">{v.plate}</p>
                    <p className="text-xs text-muted-foreground group-hover:text-foreground/80 transition-colors">
                      {v.brand} {v.model}
                    </p>
                  </div>
                  <div className="text-right">
                    <p className="text-[10px] text-muted-foreground">
                      {v.currentKm > 0 ? `${(v.currentKm / 1000).toFixed(0)}k km` : '0 km'}
                    </p>
                    <p className="text-[10px] text-primary/0 group-hover:text-primary transition-colors font-medium mt-0.5">
                      Seç ve Ekle
                    </p>
                  </div>
                </button>
              ))}
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}

export function EditProjectDialog({ children, project }: { children: React.ReactNode, project: ProjectRecord }) {
  const { updateProject } = useApp();
  const [open, setOpen] = useState(false);
  const [projectName, setProjectName] = useState(project.projectName);
  const [projectDetails, setProjectDetails] = useState(project.projectDetails || "");
  const [startDate, setStartDate] = useState(project.startDate);
  const [endDate, setEndDate] = useState(project.endDate);
  const [status, setStatus] = useState<string>(project.status);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!projectName || !startDate || !endDate) return;

    await updateProject(project.id, {
      projectName,
      projectDetails,
      startDate,
      endDate,
      status: status as "aktif" | "tamamlandi" | "iptal"
    });

    setOpen(false);
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger render={children as React.ReactElement} />
      <DialogContent className="sm:max-w-[480px] bg-card border-border/50">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 text-lg">
            Projeyi Düzenle
          </DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4 mt-2">
          <div className="space-y-2">
            <Label htmlFor="projectName" className="text-sm font-medium">Proje Adı</Label>
            <Input id="projectName" placeholder="Örn: X İnşaat Hafriyat İşi" value={projectName} onChange={(e) => setProjectName(e.target.value)} required className="bg-input/50" />
          </div>

          <div className="space-y-2">
            <Label htmlFor="projectDetails" className="text-sm font-medium">Proje Detayları</Label>
            <Input id="projectDetails" placeholder="Proje hakkında kısa notlar..." value={projectDetails} onChange={(e) => setProjectDetails(e.target.value)} className="bg-input/50" />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-2">
              <Label htmlFor="p-start" className="text-sm font-medium">Başlangıç</Label>
              <Input id="p-start" type="date" value={startDate} onChange={(e) => setStartDate(e.target.value)} required className="bg-input/50" />
            </div>
            <div className="space-y-2">
              <Label htmlFor="p-end" className="text-sm font-medium">Bitiş</Label>
              <Input id="p-end" type="date" value={endDate} onChange={(e) => setEndDate(e.target.value)} required className="bg-input/50" />
            </div>
          </div>

          <div className="space-y-2">
            <Label className="text-sm font-medium">Proje Durumu</Label>
            <Select value={status} onValueChange={(val) => setStatus(val as any)}>
              <SelectTrigger className="bg-input/50">
                <SelectValue placeholder="Durum seçin">
                  {status === "aktif" ? "Aktif" : status === "tamamlandi" ? "Tamamlandı" : "İptal"}
                </SelectValue>
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="aktif">Aktif</SelectItem>
                <SelectItem value="tamamlandi">Tamamlandı</SelectItem>
                <SelectItem value="iptal">İptal</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <Button type="submit" className="w-full bg-primary hover:bg-primary/90 shadow-lg shadow-primary/20">
            Değişiklikleri Kaydet
          </Button>
        </form>
      </DialogContent>
    </Dialog>
  );
}

export function EditVehicleDialog({ children, vehicle }: { children: React.ReactNode, vehicle: { id: string; plate: string; brand: string; model: string; year: number; fuelType: FuelType; currentKm: number; status: VehicleStatus; color: string } }) {
  const { updateVehicle } = useApp();
  const [open, setOpen] = useState(false);
  const [plate, setPlate] = useState(vehicle.plate);
  const [brand, setBrand] = useState(vehicle.brand);
  const [model, setModel] = useState(vehicle.model);
  const [year, setYear] = useState(vehicle.year.toString());
  const [fuelType, setFuelType] = useState<FuelType>(vehicle.fuelType);
  const [currentKm, setCurrentKm] = useState(vehicle.currentKm.toString());
  const [status, setStatus] = useState<VehicleStatus>(vehicle.status);
  const [color, setColor] = useState(vehicle.color);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!plate || !brand || !model) return;
    await updateVehicle(vehicle.id, {
      plate: plate.toUpperCase(), brand, model, year: parseInt(year),
      fuelType, currentKm: parseInt(currentKm) || 0, status, color,
    });
    setOpen(false);
  };

  const colorOptions = ["#6366f1", "#06b6d4", "#8b5cf6", "#ec4899", "#f59e0b", "#10b981", "#ef4444", "#3b82f6"];

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger render={children as React.ReactElement} />
      <DialogContent className="sm:max-w-[480px] bg-card border-border/50">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 text-lg">
            Araç Düzenle
          </DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4 mt-2">
          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-2">
              <Label htmlFor="ev-plate" className="text-sm font-medium">Plaka</Label>
              <Input id="ev-plate" placeholder="34 ABC 123" value={plate} onChange={(e) => setPlate(e.target.value)} required className="bg-input/50 uppercase" />
            </div>
            <div className="space-y-2">
              <Label htmlFor="ev-year" className="text-sm font-medium">Yıl</Label>
              <Input id="ev-year" type="number" value={year} onChange={(e) => setYear(e.target.value)} className="bg-input/50" />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-2">
              <Label htmlFor="ev-brand" className="text-sm font-medium">Marka</Label>
              <Input id="ev-brand" placeholder="Ford" value={brand} onChange={(e) => setBrand(e.target.value)} required className="bg-input/50" />
            </div>
            <div className="space-y-2">
              <Label htmlFor="ev-model" className="text-sm font-medium">Model</Label>
              <Input id="ev-model" placeholder="Transit" value={model} onChange={(e) => setModel(e.target.value)} required className="bg-input/50" />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-2">
              <Label className="text-sm font-medium">Yakıt Türü</Label>
              <Select value={fuelType} onValueChange={(v) => setFuelType(v as FuelType)}>
                <SelectTrigger className="bg-input/50">
                  <SelectValue>{FUEL_TYPE_LABELS[fuelType]}</SelectValue>
                </SelectTrigger>
                <SelectContent>
                  {(Object.keys(FUEL_TYPE_LABELS) as FuelType[]).map((ft) => (
                    <SelectItem key={ft} value={ft}>{FUEL_TYPE_LABELS[ft]}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label htmlFor="ev-km" className="text-sm font-medium">Kilometre</Label>
              <Input id="ev-km" type="number" placeholder="0" value={currentKm} onChange={(e) => setCurrentKm(e.target.value)} className="bg-input/50" />
            </div>
          </div>

          <div className="space-y-2">
            <Label className="text-sm font-medium">Durum</Label>
            <Select value={status} onValueChange={(v) => setStatus(v as VehicleStatus)}>
              <SelectTrigger className="bg-input/50">
                <SelectValue>{VEHICLE_STATUS_LABELS[status]}</SelectValue>
              </SelectTrigger>
              <SelectContent>
                {(Object.keys(VEHICLE_STATUS_LABELS) as VehicleStatus[]).map((s) => (
                  <SelectItem key={s} value={s}>{VEHICLE_STATUS_LABELS[s]}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label className="text-sm font-medium">Renk</Label>
            <div className="flex gap-2">
              {colorOptions.map((c) => (
                <button key={c} type="button" onClick={() => setColor(c)}
                  className={`w-7 h-7 rounded-full border-2 transition-all ${color === c ? 'border-white scale-110 shadow-lg' : 'border-transparent opacity-60 hover:opacity-100'}`}
                  style={{ backgroundColor: c }}
                />
              ))}
            </div>
          </div>

          <Button type="submit" className="w-full bg-primary hover:bg-primary/90 shadow-lg shadow-primary/20">
            Değişiklikleri Kaydet
          </Button>
        </form>
      </DialogContent>
    </Dialog>
  );
}

export function EditExpenseDialog({ children, expense }: { children: React.ReactNode, expense: Expense }) {
  const { vehicles, addExpense, deleteExpense } = useApp();
  const [open, setOpen] = useState(false);
  const [category, setCategory] = useState<ExpenseCategory>(expense.category);
  const [amount, setAmount] = useState(expense.amount.toString());
  const [date, setDate] = useState(expense.date.split('T')[0]);
  const [description, setDescription] = useState(expense.description);
  const [km, setKm] = useState(expense.km?.toString() || "");
  const [liters, setLiters] = useState(expense.liters?.toString() || "");
  const [pricePerLiter, setPricePerLiter] = useState(expense.pricePerLiter?.toString() || "");

  const vehicle = vehicles.find(v => v.id === expense.vehicleId);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!amount || !date) return;
    // Delete old and insert new (Supabase doesn't have a clean update for all fields easily)
    await deleteExpense(expense.id);
    await addExpense({
      vehicleId: expense.vehicleId,
      projectId: expense.projectId,
      category, amount: parseFloat(amount), date,
      description: description || EXPENSE_CATEGORY_LABELS[category],
      km: km ? parseInt(km) : undefined,
      liters: liters ? parseFloat(liters) : undefined,
      pricePerLiter: pricePerLiter ? parseFloat(pricePerLiter) : undefined,
    });
    setOpen(false);
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger render={children as React.ReactElement} />
      <DialogContent className="sm:max-w-[480px] bg-card border-border/50">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 text-lg">
            Gider Düzenle
          </DialogTitle>
          <DialogDescription className="text-xs">
            {vehicle ? `${vehicle.plate} - ${vehicle.brand} ${vehicle.model}` : 'Araç'}
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4 mt-2">
          <div className="space-y-2">
            <Label className="text-sm font-medium">Kategori</Label>
            <Select value={category} onValueChange={(v) => setCategory(v as ExpenseCategory)}>
              <SelectTrigger className="bg-input/50">
                <SelectValue>{EXPENSE_CATEGORY_LABELS[category]}</SelectValue>
              </SelectTrigger>
              <SelectContent>
                {(Object.keys(EXPENSE_CATEGORY_LABELS) as ExpenseCategory[]).map((cat) => (
                  <SelectItem key={cat} value={cat}>{EXPENSE_CATEGORY_LABELS[cat]}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-2">
              <Label htmlFor="ee-amount" className="text-sm font-medium">Tutar (₺)</Label>
              <Input id="ee-amount" type="number" step="0.01" value={amount} onChange={(e) => setAmount(e.target.value)} required className="bg-input/50" />
            </div>
            <div className="space-y-2">
              <Label htmlFor="ee-date" className="text-sm font-medium">Tarih</Label>
              <Input id="ee-date" type="date" value={date} onChange={(e) => setDate(e.target.value)} required className="bg-input/50" />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="ee-desc" className="text-sm font-medium">Açıklama</Label>
            <Input id="ee-desc" value={description} onChange={(e) => setDescription(e.target.value)} className="bg-input/50" />
          </div>

          {category === "yakit" && (
            <div className="grid grid-cols-3 gap-3 p-3 rounded-lg bg-accent/30 border border-border/30">
              <div className="space-y-2">
                <Label className="text-xs text-muted-foreground">KM</Label>
                <Input type="number" value={km} onChange={(e) => setKm(e.target.value)} className="bg-input/50 h-8 text-sm" />
              </div>
              <div className="space-y-2">
                <Label className="text-xs text-muted-foreground">Litre</Label>
                <Input type="number" step="0.01" value={liters} onChange={(e) => setLiters(e.target.value)} className="bg-input/50 h-8 text-sm" />
              </div>
              <div className="space-y-2">
                <Label className="text-xs text-muted-foreground">₺/lt</Label>
                <Input type="number" step="0.01" value={pricePerLiter} onChange={(e) => setPricePerLiter(e.target.value)} className="bg-input/50 h-8 text-sm" />
              </div>
            </div>
          )}

          <Button type="submit" className="w-full bg-primary hover:bg-primary/90 shadow-lg shadow-primary/20">
            Değişiklikleri Kaydet
          </Button>
        </form>
      </DialogContent>
    </Dialog>
  );
}
