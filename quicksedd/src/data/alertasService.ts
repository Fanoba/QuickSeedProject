/**
 * alertasService.ts – Alertas AML/KYC.
 */
import api from "./api";
import type { Alerta, AlertaCreate, AlertType, RiskLevel } from "./types";

export const alertasService = {
  /** Lista alertas con filtros opcionales (admin). */
  async getAll(params?: {
    severidad?: RiskLevel;
    tipo?: AlertType;
    resuelta?: boolean;
    skip?: number;
    limit?: number;
  }): Promise<Alerta[]> {
    const query = new URLSearchParams();
    if (params?.severidad) query.set("severidad", params.severidad);
    if (params?.tipo) query.set("tipo", params.tipo);
    if (params?.resuelta !== undefined) query.set("resuelta", String(params.resuelta));
    if (params?.skip) query.set("skip", String(params.skip));
    if (params?.limit) query.set("limit", String(params.limit));

    const qs = query.toString();
    return api.get<Alerta[]>(`/alertas${qs ? `?${qs}` : ""}`);
  },

  /** Crear alerta manualmente (admin). */
  async create(data: AlertaCreate): Promise<Alerta> {
    return api.post<Alerta>("/alertas", data);
  },

  /** Marcar alerta como resuelta (admin). */
  async resolve(id: number): Promise<Alerta> {
    return api.patch<Alerta>(`/alertas/${id}/resolve`);
  },
};

export default alertasService;
