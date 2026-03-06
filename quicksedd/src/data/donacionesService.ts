/**
 * donacionesService.ts – Crear donaciones, cambiar status, historial.
 */
import api from "./api";
import type {
  Donacion,
  DonacionCreate,
  DonacionHistorial,
  DonacionStatus,
  DonacionStatusUpdate,
} from "./types";

export const donacionesService = {
  /** Lista todas las donaciones (admin). Filtra por status si se indica. */
  async getAll(params?: {
    status?: DonacionStatus;
    skip?: number;
    limit?: number;
  }): Promise<Donacion[]> {
    const query = new URLSearchParams();
    if (params?.status) query.set("status", params.status);
    if (params?.skip) query.set("skip", String(params.skip));
    if (params?.limit) query.set("limit", String(params.limit));

    const qs = query.toString();
    return api.get<Donacion[]>(`/donaciones${qs ? `?${qs}` : ""}`);
  },

  /** Donaciones del usuario autenticado. */
  async getMias(): Promise<Donacion[]> {
    return api.get<Donacion[]>("/donaciones/mis");
  },

  /** Detalle de una donación. */
  async getById(id: number): Promise<Donacion> {
    return api.get<Donacion>(`/donaciones/${id}`);
  },

  /** Crear una nueva donación (donante autenticado). */
  async create(data: DonacionCreate): Promise<Donacion> {
    return api.post<Donacion>("/donaciones", data);
  },

  /** Cambiar el status de una donación (admin). */
  async updateStatus(id: number, data: DonacionStatusUpdate): Promise<Donacion> {
    return api.patch<Donacion>(`/donaciones/${id}/status`, data);
  },

  /** Historial de cambios de status de una donación (admin). */
  async getHistorial(id: number): Promise<DonacionHistorial[]> {
    return api.get<DonacionHistorial[]>(`/donaciones/${id}/historial`);
  },
};

export default donacionesService;
