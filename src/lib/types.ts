export type FuelType = "benzin" | "dizel" | "lpg" | "elektrik" | "hibrit";

export type VehicleStatus = "kirada" | "musait" | "bakimda" | "rezerve";



export type ExpenseCategory =
  | "yakit"
  | "bakim"
  | "sigorta"
  | "vergi"
  | "lastik"
  | "yikama"
  | "hasar"
  | "ceza"
  | "muayene"
  | "diger";

export interface Vehicle {
  id: string;
  plate: string;
  brand: string;
  model: string;
  year: number;
  fuelType: FuelType;
  currentKm: number;
  status: VehicleStatus;
  color: string;
  currentRenter?: string;
  rentalEndDate?: string;
}

export interface Expense {
  id: string;
  vehicleId: string;
  projectId?: string;
  category: ExpenseCategory;
  amount: number;
  date: string;
  description: string;
  km?: number;
  liters?: number;
  pricePerLiter?: number;
}

export interface ProjectRecord {
  id: string;
  vehicleIds: string[];
  projectName: string;
  projectDetails: string;
  startDate: string;
  endDate: string;
  status: "aktif" | "tamamlandi" | "iptal";
}

export const EXPENSE_CATEGORY_LABELS: Record<ExpenseCategory, string> = {
  yakit: "Yakıt",
  bakim: "Bakım / Servis",
  sigorta: "Sigorta",
  vergi: "MTV / Vergi",
  lastik: "Lastik",
  yikama: "Yıkama / Temizlik",
  hasar: "Hasar / Kaza",
  ceza: "Trafik Cezası",
  muayene: "Muayene",
  diger: "Diğer",
};


export const EXPENSE_CATEGORY_COLORS: Record<ExpenseCategory, string> = {
  yakit: "oklch(0.65 0.2 260)",
  bakim: "oklch(0.7 0.18 170)",
  sigorta: "oklch(0.65 0.2 310)",
  vergi: "oklch(0.75 0.15 60)",
  lastik: "oklch(0.6 0.22 25)",
  yikama: "oklch(0.7 0.15 200)",
  hasar: "oklch(0.6 0.25 30)",
  ceza: "oklch(0.7 0.2 40)",
  muayene: "oklch(0.6 0.15 280)",
  diger: "oklch(0.55 0.1 260)",
};

export const FUEL_TYPE_LABELS: Record<FuelType, string> = {
  benzin: "Benzin",
  dizel: "Dizel",
  lpg: "LPG",
  elektrik: "Elektrik",
  hibrit: "Hibrit",
};

export const VEHICLE_STATUS_LABELS: Record<VehicleStatus, string> = {
  kirada: "Kirada",
  musait: "Müsait",
  bakimda: "Bakımda",
  rezerve: "Rezerve",
};

export const VEHICLE_STATUS_COLORS: Record<VehicleStatus, { bg: string; text: string }> = {
  kirada: { bg: "oklch(0.45 0.15 145 / 20%)", text: "oklch(0.7 0.18 145)" },
  musait: { bg: "oklch(0.45 0.15 260 / 20%)", text: "oklch(0.7 0.18 260)" },
  bakimda: { bg: "oklch(0.5 0.15 60 / 20%)", text: "oklch(0.75 0.15 60)" },
  rezerve: { bg: "oklch(0.45 0.15 310 / 20%)", text: "oklch(0.7 0.18 310)" },
};
