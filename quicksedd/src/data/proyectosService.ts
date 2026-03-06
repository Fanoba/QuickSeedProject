/**
 * proyectosService.ts – CRUD de proyectos y categorías.
 */
import api from "./api";
import type { Categoria, Proyecto, ProyectoCreate, ProyectoUpdate } from "./types";

export const proyectosService = {
  /** Lista proyectos públicos (con filtros opcionales). */
  async getAll(params?: {
    categoria_id?: number;
    activo?: boolean;
    skip?: number;
    limit?: number;
  }): Promise<Proyecto[]> {
    const query = new URLSearchParams();
    if (params?.categoria_id) query.set("categoria_id", String(params.categoria_id));
    if (params?.activo !== undefined) query.set("activo", String(params.activo));
    if (params?.skip) query.set("skip", String(params.skip));
    if (params?.limit) query.set("limit", String(params.limit));

    const qs = query.toString();
    return api.get<Proyecto[]>(`/proyectos${qs ? `?${qs}` : ""}`);
  },

  /** Detalle de un proyecto por ID. */
  async getById(id: number): Promise<Proyecto> {
    return api.get<Proyecto>(`/proyectos/${id}`);
  },

  /** Lista todas las categorías. */
  async getCategorias(): Promise<Categoria[]> {
    return api.get<Categoria[]>("/proyectos/categorias");
  },

  /** Crear proyecto (admin). */
  async create(data: ProyectoCreate): Promise<Proyecto> {
    return api.post<Proyecto>("/proyectos", data);
  },

  /** Editar proyecto (admin). */
  async update(id: number, data: ProyectoUpdate): Promise<Proyecto> {
    return api.patch<Proyecto>(`/proyectos/${id}`, data);
  },

  /** Desactivar proyecto (admin). */
  async delete(id: number): Promise<void> {
    return api.delete<void>(`/proyectos/${id}`);
  },
};

export default proyectosService;
