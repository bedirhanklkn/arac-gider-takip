"use client";

import { createContext, useContext, useState, useCallback, useEffect, type ReactNode } from "react";
import type { Vehicle, Expense, ExpenseCategory, ProjectRecord } from "@/lib/types";
import { supabase } from "@/lib/supabase";
import type { User } from "@supabase/supabase-js";

interface AppContextType {
  vehicles: Vehicle[];
  expenses: Expense[];
  projects: ProjectRecord[];
  selectedVehicleId: string | null;
  selectedProjectId: string | null;
  loading: boolean;
  addVehicle: (vehicle: Omit<Vehicle, "id">) => Promise<void>;
  addVehicles: (vehicles: Omit<Vehicle, "id">[]) => Promise<void>;
  updateVehicle: (id: string, vehicle: Partial<Vehicle>) => Promise<void>;
  deleteVehicle: (id: string) => Promise<void>;
  addExpense: (expense: Omit<Expense, "id">) => Promise<void>;
  updateExpense: (id: string, expense: Partial<Expense>) => Promise<void>;
  deleteExpense: (id: string) => Promise<void>;
  addProject: (project: Omit<ProjectRecord, "id">) => Promise<void>;
  updateProject: (id: string, project: Partial<ProjectRecord>) => Promise<void>;
  deleteProject: (id: string) => Promise<void>;
  removeVehicleFromProject: (projectId: string, vehicleId: string) => Promise<void>;
  addVehicleToProject: (projectId: string, vehicleId: string) => Promise<void>;
  setSelectedVehicleId: (id: string | null) => void;
  setSelectedProjectId: (id: string | null) => void;
  getVehicleExpenses: (vehicleId: string) => Expense[];
  getFilteredExpenses: (vehicleId?: string | null, projectId?: string | null) => Expense[];
  getTotalExpense: (vehicleId?: string | null, projectId?: string | null) => number;
  getCategoryTotal: (category: ExpenseCategory, vehicleId?: string | null, projectId?: string | null) => number;
  getMonthlyData: (vehicleId?: string | null, projectId?: string | null) => { month: string; total: number }[];
  getCategoryData: (vehicleId?: string | null, projectId?: string | null) => { category: ExpenseCategory; total: number; label: string }[];
  getFleetStats: () => { kirada: number; musait: number; bakimda: number; rezerve: number; satildi: number; toplam: number };
  user: User | null;
  signOut: () => Promise<void>;
}

const AppContext = createContext<AppContextType | null>(null);

export function AppProvider({ children }: { children: ReactNode }) {
  const [vehicles, setVehicles] = useState<Vehicle[]>([]);
  const [expenses, setExpenses] = useState<Expense[]>([]);
  const [projects, setProjects] = useState<ProjectRecord[]>([]);
  const [selectedVehicleId, setSelectedVehicleId] = useState<string | null>(null);
  const [selectedProjectId, setSelectedProjectId] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [user, setUser] = useState<User | null>(null);

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      setUser(session?.user ?? null);
    });

    const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
      setUser(session?.user ?? null);
    });

    return () => subscription.unsubscribe();
  }, []);

  const fetchData = useCallback(async () => {
    if (!user) {
      setLoading(false);
      return;
    }
    try {
      setLoading(true);
      const [vRes, pRes, eRes] = await Promise.all([
        supabase.from('vehicles').select('*'),
        supabase.from('projects').select('*'),
        supabase.from('expenses').select('*')
      ]);

      if (vRes.data) {
        setVehicles(vRes.data.map((v: any) => ({
          id: v.id, plate: v.plate, brand: v.brand, model: v.model,
          year: v.year, color: v.color, fuelType: v.fuel_type,
          status: v.status, currentKm: v.current_km
        })));
      }

      if (pRes.data) {
        setProjects(pRes.data.map((p: any) => ({
          id: p.id, vehicleIds: p.vehicle_ids || [], projectName: p.project_name,
          projectDetails: p.project_details, startDate: p.start_date,
          endDate: p.end_date, status: p.status
        })));
      }

      if (eRes.data) {
        setExpenses(eRes.data.map((e: any) => ({
          id: e.id, vehicleId: e.vehicle_id, projectId: e.project_id || undefined,
          category: e.category, amount: e.amount, date: e.date, description: e.description,
          km: e.km, liters: e.liters, pricePerLiter: e.price_per_liter
        })));
      }
    } catch (err) {
      console.error("Error fetching data:", err);
    } finally {
      setLoading(false);
    }
  }, [user]); // Re-fetch when user changes

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const signOut = async () => {
    await supabase.auth.signOut();
  };

  const handleSetSelectedVehicleId = useCallback((id: string | null) => {
    setSelectedVehicleId(id);
    setSelectedProjectId(null);
  }, []);

  const handleSetSelectedProjectId = useCallback((id: string | null) => {
    setSelectedProjectId(id);
    setSelectedVehicleId(null);
  }, []);

  const getFilteredExpenses = useCallback((vId?: string | null, pId?: string | null) => {
    if (pId) {
      // Filter by projectId on the expense itself (survives vehicle removal)
      return expenses.filter(e => e.projectId === pId);
    }
    if (vId) return expenses.filter(e => e.vehicleId === vId);
    return expenses;
  }, [expenses]);

  const addVehicle = useCallback(async (vehicle: Omit<Vehicle, "id">) => {
    const { data, error } = await supabase.from('vehicles').insert([{
      plate: vehicle.plate, brand: vehicle.brand, model: vehicle.model,
      year: vehicle.year, color: vehicle.color, fuel_type: vehicle.fuelType,
      status: vehicle.status, current_km: vehicle.currentKm
    }]).select();

    if (error) {
      console.error("Error adding vehicle:", error.message, error);
      return;
    }

    if (data && data[0]) {
      const v = data[0];
      setVehicles((prev) => [...prev, {
        id: v.id, plate: v.plate, brand: v.brand, model: v.model,
        year: v.year, color: v.color, fuelType: v.fuel_type,
        status: v.status, currentKm: v.current_km
      }]);
    }
  }, []);

  const addVehicles = useCallback(async (newVehicles: Omit<Vehicle, "id">[]) => {
    const inserts = newVehicles.map(v => ({
      plate: v.plate, brand: v.brand, model: v.model,
      year: v.year, color: v.color, fuel_type: v.fuelType,
      status: v.status, current_km: v.currentKm
    }));

    const { data, error } = await supabase.from('vehicles').insert(inserts).select();
    if (error) {
      console.error("Error adding vehicles:", error.message, error);
      return;
    }

    if (data) {
      const mapped = data.map((v: any) => ({
        id: v.id, plate: v.plate, brand: v.brand, model: v.model,
        year: v.year, color: v.color, fuelType: v.fuel_type,
        status: v.status, currentKm: v.current_km
      }));
      setVehicles((prev) => [...prev, ...mapped]);
    }
  }, []);

  const updateVehicle = useCallback(async (id: string, updates: Partial<Vehicle>) => {
    const updateData: any = {};
    if (updates.plate) updateData.plate = updates.plate;
    if (updates.brand) updateData.brand = updates.brand;
    if (updates.model) updateData.model = updates.model;
    if (updates.year) updateData.year = updates.year;
    if (updates.color) updateData.color = updates.color;
    if (updates.fuelType) updateData.fuel_type = updates.fuelType;
    if (updates.status) updateData.status = updates.status;
    if (updates.currentKm !== undefined) updateData.current_km = updates.currentKm;

    const { error } = await supabase.from('vehicles').update(updateData).eq('id', id);
    if (!error) {
      setVehicles((prev) =>
        prev.map((v) => (v.id === id ? { ...v, ...updates } : v))
      );
    }
  }, []);

  const deleteVehicle = useCallback(async (id: string) => {
    const { error } = await supabase.from('vehicles').delete().eq('id', id);
    if (!error) {
      setVehicles((prev) => prev.filter((v) => v.id !== id));
      setExpenses((prev) => prev.filter((e) => e.vehicleId !== id));
      setSelectedVehicleId((prev) => (prev === id ? null : prev));
    }
  }, []);

  const addExpense = useCallback(async (expense: Omit<Expense, "id">) => {
    const projectId = expense.projectId;

    const { data, error } = await supabase.from('expenses').insert([{
      vehicle_id: expense.vehicleId, project_id: projectId || null,
      category: expense.category, amount: expense.amount,
      date: expense.date, description: expense.description, km: expense.km,
      liters: expense.liters, price_per_liter: expense.pricePerLiter
    }]).select();

    if (error) {
      console.error("Error adding expense:", error.message, error);
      return;
    }

    if (data && data[0]) {
      const e = data[0];
      setExpenses((prev) => [...prev, {
        id: e.id, vehicleId: e.vehicle_id, projectId: e.project_id || undefined,
        category: e.category, amount: e.amount, date: e.date, description: e.description,
        km: e.km, liters: e.liters, pricePerLiter: e.price_per_liter
      }]);

      if (e.km && e.km > 0) {
        updateVehicle(e.vehicle_id, { currentKm: e.km });
      }
    }
  }, [projects, updateVehicle]);

  const updateExpense = useCallback(async (id: string, expenseUpdate: Partial<Expense>) => {
    // Map frontend keys to backend columns
    const updates: any = {};
    if (expenseUpdate.vehicleId !== undefined) updates.vehicle_id = expenseUpdate.vehicleId;
    if (expenseUpdate.projectId !== undefined) updates.project_id = expenseUpdate.projectId || null;
    if (expenseUpdate.category !== undefined) updates.category = expenseUpdate.category;
    if (expenseUpdate.amount !== undefined) updates.amount = expenseUpdate.amount;
    if (expenseUpdate.date !== undefined) updates.date = expenseUpdate.date;
    if (expenseUpdate.description !== undefined) updates.description = expenseUpdate.description;
    if (expenseUpdate.km !== undefined) updates.km = expenseUpdate.km;
    if (expenseUpdate.liters !== undefined) updates.liters = expenseUpdate.liters;
    if (expenseUpdate.pricePerLiter !== undefined) updates.price_per_liter = expenseUpdate.pricePerLiter;

    const { error } = await supabase.from('expenses').update(updates).eq('id', id);
    if (error) {
      console.error("Error updating expense:", error.message, error);
      return;
    }

    setExpenses((prev) =>
      prev.map((e) => (e.id === id ? { ...e, ...expenseUpdate } : e))
    );

    if (expenseUpdate.km && expenseUpdate.km > 0 && expenseUpdate.vehicleId) {
      updateVehicle(expenseUpdate.vehicleId, { currentKm: expenseUpdate.km });
    } else if (expenseUpdate.km && expenseUpdate.km > 0) {
      // Find the vehicle ID from the existing expense if it wasn't provided in the update
      setExpenses((prev) => {
        const existingExpense = prev.find(e => e.id === id);
        if (existingExpense && existingExpense.vehicleId) {
          updateVehicle(existingExpense.vehicleId, { currentKm: expenseUpdate.km });
        }
        return prev;
      });
    }
  }, [updateVehicle]);

  const deleteExpense = useCallback(async (id: string) => {
    const { error } = await supabase.from('expenses').delete().eq('id', id);
    if (!error) {
      setExpenses((prev) => prev.filter((e) => e.id !== id));
    }
  }, []);

  const addProject = useCallback(async (project: Omit<ProjectRecord, "id">) => {
    const { data, error } = await supabase.from('projects').insert([{
      vehicle_ids: project.vehicleIds, project_name: project.projectName,
      project_details: project.projectDetails, start_date: project.startDate,
      end_date: project.endDate, status: project.status
    }]).select();

    if (error) {
      console.error("Error adding project:", error.message, error);
      return;
    }

    if (data && data[0]) {
      const p = data[0];
      setProjects((prev) => [...prev, {
        id: p.id, vehicleIds: p.vehicle_ids || [], projectName: p.project_name,
        projectDetails: p.project_details, startDate: p.start_date,
        endDate: p.end_date, status: p.status
      }]);
    }
  }, []);

  const updateProject = useCallback(async (id: string, updates: Partial<ProjectRecord>) => {
    // Map camelCase back to snake_case for Supabase if needed
    const dbUpdates: any = {};
    if (updates.projectName !== undefined) dbUpdates.project_name = updates.projectName;
    if (updates.projectDetails !== undefined) dbUpdates.project_details = updates.projectDetails;
    if (updates.startDate !== undefined) dbUpdates.start_date = updates.startDate;
    if (updates.endDate !== undefined) dbUpdates.end_date = updates.endDate;
    if (updates.status !== undefined) dbUpdates.status = updates.status;
    if (updates.vehicleIds !== undefined) dbUpdates.vehicle_ids = updates.vehicleIds;

    const { error } = await supabase.from('projects').update(dbUpdates).eq('id', id);
    if (error) {
      console.error("Error updating project:", error.message, error);
      throw error;
    }

    setProjects(prev => prev.map(p => p.id === id ? { ...p, ...updates } : p));

    // Handle vehicle status changes based on project status
    const project = projects.find(p => p.id === id);
    if (updates.status !== undefined && project && updates.status !== project.status) {
      const vehicleIds = updates.vehicleIds || project.vehicleIds || [];
      
      if (vehicleIds.length > 0) {
        const newVehicleStatus = (updates.status === 'tamamlandi' || updates.status === 'iptal') ? 'musait' : 'kirada';
        
        for (const vId of vehicleIds) {
          await supabase.from('vehicles').update({ status: newVehicleStatus }).eq('id', vId);
        }
        
        setVehicles(prev => prev.map(v => 
          vehicleIds.includes(v.id) ? { ...v, status: newVehicleStatus } : v
        ));
      }
    }
  }, [projects]);

  const deleteProject = useCallback(async (id: string) => {
    const project = projects.find(p => p.id === id);
    if (!project) return;
    
    // First, set all assigned vehicles back to 'musait'
    if (project.vehicleIds && project.vehicleIds.length > 0) {
      for (const vId of project.vehicleIds) {
        await supabase.from('vehicles').update({ status: 'musait' }).eq('id', vId);
      }
    }

    // Then delete the project
    const { error } = await supabase.from('projects').delete().eq('id', id);
    if (error) {
      console.error("Error deleting project:", error.message, error);
      return;
    }

    setProjects(prev => prev.filter(p => p.id !== id));
    
    // Update local vehicle state to reflect they are musait
    if (project.vehicleIds && project.vehicleIds.length > 0) {
       setVehicles(prev => prev.map(v => project.vehicleIds.includes(v.id) ? { ...v, status: 'musait' } : v));
    }
  }, [projects]);

  const removeVehicleFromProject = useCallback(async (projectId: string, vehicleId: string) => {
    const project = projects.find(p => p.id === projectId);
    if (!project) return;
    
    const newVehicleIds = project.vehicleIds.filter(id => id !== vehicleId);
    
    const { error: pError } = await supabase.from('projects').update({ vehicle_ids: newVehicleIds }).eq('id', projectId);
    if (pError) {
      console.error("Error updating project:", pError);
      return;
    }
    
    const { error: vError } = await supabase.from('vehicles').update({ status: 'musait' }).eq('id', vehicleId);
    if (vError) {
       console.error("Error updating vehicle status:", vError);
    }
    
    setProjects(prev => prev.map(p => p.id === projectId ? { ...p, vehicleIds: newVehicleIds } : p));
    setVehicles(prev => prev.map(v => v.id === vehicleId ? { ...v, status: 'musait' } : v));
  }, [projects]);

  const addVehicleToProject = useCallback(async (projectId: string, vehicleId: string) => {
    const project = projects.find(p => p.id === projectId);
    if (!project) return;
    
    if (project.vehicleIds.includes(vehicleId)) return;
    const newVehicleIds = [...project.vehicleIds, vehicleId];
    
    const { error: pError } = await supabase.from('projects').update({ vehicle_ids: newVehicleIds }).eq('id', projectId);
    if (pError) {
      console.error("Error updating project:", pError);
      return;
    }
    
    const { error: vError } = await supabase.from('vehicles').update({ status: 'kirada' }).eq('id', vehicleId);
    if (vError) {
       console.error("Error updating vehicle status:", vError);
    }
    
    setProjects(prev => prev.map(p => p.id === projectId ? { ...p, vehicleIds: newVehicleIds } : p));
    setVehicles(prev => prev.map(v => v.id === vehicleId ? { ...v, status: 'kirada' } : v));
  }, [projects]);

  const getVehicleExpenses = useCallback(
    (vehicleId: string) => expenses.filter((e) => e.vehicleId === vehicleId),
    [expenses]
  );

  const getTotalExpense = useCallback(
    (vehicleId?: string | null, projectId?: string | null) => {
      const filtered = getFilteredExpenses(vehicleId, projectId);
      return filtered.reduce((sum, e) => sum + e.amount, 0);
    },
    [getFilteredExpenses]
  );

  const getCategoryTotal = useCallback(
    (category: ExpenseCategory, vehicleId?: string | null, projectId?: string | null) => {
      const filtered = getFilteredExpenses(vehicleId, projectId);
      return filtered.filter(e => e.category === category).reduce((sum, e) => sum + e.amount, 0);
    },
    [getFilteredExpenses]
  );

  const getMonthlyData = useCallback(
    (vehicleId?: string | null, projectId?: string | null) => {
      const filtered = getFilteredExpenses(vehicleId, projectId);

      const monthMap = new Map<string, number>();
      const months = ["Oca", "Şub", "Mar", "Nis", "May", "Haz", "Tem", "Ağu", "Eyl", "Eki", "Kas", "Ara"];

      months.forEach((m) => monthMap.set(m, 0));

      const currentYear = new Date().getFullYear();

      filtered.forEach((e) => {
        const date = new Date(e.date);
        if (date.getFullYear() === currentYear) {
          const monthIndex = date.getMonth();
          const monthName = months[monthIndex];
          monthMap.set(monthName, (monthMap.get(monthName) || 0) + e.amount);
        }
      });

      return Array.from(monthMap.entries()).map(([month, total]) => ({
        month,
        total,
      }));
    },
    [getFilteredExpenses]
  );

  const getCategoryData = useCallback(
    (vehicleId?: string | null, projectId?: string | null) => {
      const filtered = getFilteredExpenses(vehicleId, projectId);

      const categoryLabels: Record<ExpenseCategory, string> = {
        yakit: "Yakıt", bakim: "Bakım / Servis", sigorta: "Sigorta / Kasko", vergi: "MTV / Vergi",
        lastik: "Lastik", yikama: "Yıkama / Temizlik", hasar: "Hasar / Kaza",
        ceza: "Trafik Cezası", muayene: "Muayene", diger: "Diğer",
      };

      const categoryMap = new Map<ExpenseCategory, number>();
      filtered.forEach((e) => {
        categoryMap.set(e.category, (categoryMap.get(e.category) || 0) + e.amount);
      });

      return Array.from(categoryMap.entries())
        .map(([category, total]) => ({
          category,
          total,
          label: categoryLabels[category],
        }))
        .sort((a, b) => b.total - a.total);
    },
    [getFilteredExpenses]
  );

  const getFleetStats = useCallback(() => {
    return {
      kirada: vehicles.filter((v) => v.status === "kirada").length,
      musait: vehicles.filter((v) => v.status === "musait").length,
      bakimda: vehicles.filter((v) => v.status === "bakimda").length,
      rezerve: vehicles.filter((v) => v.status === "rezerve").length,
      satildi: vehicles.filter((v) => v.status === "satildi").length,
      toplam: vehicles.filter((v) => v.status !== "satildi").length, // Active fleet size (excludes sold)
    };
  }, [vehicles]);

  return (
    <AppContext.Provider
      value={{
        vehicles, expenses, projects, selectedVehicleId, selectedProjectId, loading,
        addVehicle, addVehicles, updateVehicle, deleteVehicle,
        addExpense, updateExpense, deleteExpense, addProject, updateProject, deleteProject, removeVehicleFromProject, addVehicleToProject,
        setSelectedVehicleId: handleSetSelectedVehicleId,
        setSelectedProjectId: handleSetSelectedProjectId,
        getVehicleExpenses, getFilteredExpenses,
        getTotalExpense, getCategoryTotal,
        getMonthlyData, getCategoryData, getFleetStats, user, signOut,
      }}
    >
      {children}
    </AppContext.Provider>
  );
}

export function useApp() {
  const context = useContext(AppContext);
  if (!context) {
    throw new Error("useApp must be used within an AppProvider");
  }
  return context;
}
