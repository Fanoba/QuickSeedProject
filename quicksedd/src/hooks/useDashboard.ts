/**
 * useDashboard.ts
 * Carga todos los datos del admin dashboard desde la API.
 * Fallback automático a mockData si la API falla.
 */
import { useEffect, useState } from "react";
import { analyticsService, donacionesService, alertasService, usuariosService } from "@/data";
import type { AnalyticsSummary, Donacion, Alerta, Usuario } from "@/data";

// Fallback mock
import {
  donations as mockDonations,
  alerts as mockAlerts,
  donors as mockDonors,
  monthlyDonations as mockMonthly,
} from "@/data/mockData";

const USE_MOCK = import.meta.env.VITE_USE_MOCK === "true";

function adaptMockDonations(): Donacion[] {
  return mockDonations.map((d) => ({
    id: Number(d.id.replace("D", "")),
    codigo: d.id,
    usuario_id: Number(d.donorId.replace("USR-", "")),
    proyecto_id: 1,
    monto: d.amount,
    metodo_pago: "online" as const,
    referencia_pago: null,
    document_match: d.documentMatch,
    status: d.status,
    nivel_riesgo: d.riskLevel,
    ip_origen: d.ip,
    ubicacion: d.location,
    requiere_kyc: d.amount >= 100000,
    fecha_donacion: d.date,
    created_at: d.date,
  }));
}

function adaptMockAlertas(): Alerta[] {
  return mockAlerts.map((a) => ({
    id: a.id,
    tipo: a.type as Alerta["tipo"],
    mensaje: a.message,
    severidad: a.severity as Alerta["severidad"],
    usuario_id: null,
    donacion_id: null,
    resuelta: false,
    fecha: a.date,
    created_at: a.date,
  }));
}

function adaptMockUsuarios(): Usuario[] {
  return mockDonors.map((d) => ({
    id: Number(d.id.replace("USR-", "")),
    codigo: d.id,
    nombre: d.name,
    email: d.email,
    telefono: d.phone,
    rfc: d.rfc === "N/A" ? null : d.rfc,
    curp: null,
    ubicacion: d.location,
    avatar_url: d.avatar,
    nivel_riesgo: d.riskLevel,
    total_donado: d.totalDonated,
    conteo_donaciones: d.donationCount,
    fecha_registro: d.joinDate,
    constancia_expiry: d.constanciaExpiry === "N/A" ? null : d.constanciaExpiry,
    rol: "donante" as const,
    activo: true,
    created_at: d.joinDate,
  }));
}

function adaptMockSummary(donaciones: Donacion[]): AnalyticsSummary {
  return {
    total_recaudado: donaciones.filter((d) => d.status === "verified").reduce((s, d) => s + d.monto, 0),
    total_donantes: new Set(donaciones.map((d) => d.usuario_id)).size,
    total_proyectos: 6,
    donaciones_pendientes: donaciones.filter((d) => d.status === "pending").length,
    donaciones_flagged: donaciones.filter((d) => d.status === "flagged").length,
  };
}

export function useDashboard() {
  const [donaciones, setDonaciones] = useState<Donacion[]>([]);
  const [alertas, setAlertas] = useState<Alerta[]>([]);
  const [usuarios, setUsuarios] = useState<Usuario[]>([]);
  const [summary, setSummary] = useState<AnalyticsSummary | null>(null);
  const [monthlyData, setMonthlyData] = useState(mockMonthly);
  const [loading, setLoading] = useState(true);
  const [usingMock, setUsingMock] = useState(false);

  const load = async () => {
    setLoading(true);

    if (USE_MOCK) {
      const d = adaptMockDonations();
      setDonaciones(d);
      setAlertas(adaptMockAlertas());
      setUsuarios(adaptMockUsuarios());
      setSummary(adaptMockSummary(d));
      setUsingMock(true);
      setLoading(false);
      return;
    }

    try {
      const [don, ale, usr, sum, monthly] = await Promise.all([
        donacionesService.getAll({ limit: 100 }),
        alertasService.getAll({ limit: 50 }),
        usuariosService.getAll({ limit: 100 }),
        analyticsService.getSummary(),
        analyticsService.getDonacionesPorMes(),
      ]);
      setDonaciones(don);
      setAlertas(ale);
      setUsuarios(usr);
      setSummary(sum);
      setMonthlyData(monthly.map((m) => ({ month: m.mes, amount: m.total, count: m.conteo })));
      setUsingMock(false);
    } catch (err) {
      console.warn("[useDashboard] API no disponible, usando mockData", err);
      const d = adaptMockDonations();
      setDonaciones(d);
      setAlertas(adaptMockAlertas());
      setUsuarios(adaptMockUsuarios());
      setSummary(adaptMockSummary(d));
      setUsingMock(true);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { load(); }, []);

  const updateDonacionStatus = async (id: number, status: Donacion["status"], motivo?: string) => {
    if (usingMock) return; // no hay API en mock
    try {
      const updated = await donacionesService.updateStatus(id, { status, motivo });
      setDonaciones((prev) => prev.map((d) => (d.id === id ? updated : d)));
    } catch (err) {
      console.error("Error actualizando status", err);
    }
  };

  const resolveAlerta = async (id: number) => {
    if (usingMock) return;
    try {
      const updated = await alertasService.resolve(id);
      setAlertas((prev) => prev.map((a) => (a.id === id ? updated : a)));
    } catch (err) {
      console.error("Error resolviendo alerta", err);
    }
  };

  return {
    donaciones, alertas, usuarios, summary, monthlyData,
    loading, usingMock, reload: load,
    updateDonacionStatus, resolveAlerta,
  };
}
