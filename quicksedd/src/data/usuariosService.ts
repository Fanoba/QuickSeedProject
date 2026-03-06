/**
 * usuariosService.ts – CRUD de usuarios / donantes.
 */
import api from "./api";
import type { Usuario, UsuarioCreate, UsuarioUpdate } from "./types";

export const usuariosService = {
  /** Lista todos los usuarios (admin). */
  async getAll(params?: { skip?: number; limit?: number }): Promise<Usuario[]> {
    const query = new URLSearchParams();
    if (params?.skip) query.set("skip", String(params.skip));
    if (params?.limit) query.set("limit", String(params.limit));

    const qs = query.toString();
    return api.get<Usuario[]>(`/usuarios${qs ? `?${qs}` : ""}`);
  },

  /** Detalle de un usuario. */
  async getById(id: number): Promise<Usuario> {
    return api.get<Usuario>(`/usuarios/${id}`);
  },

  /** Registrar un nuevo donante (público). */
  async create(data: UsuarioCreate): Promise<Usuario> {
    return api.post<Usuario>("/usuarios", data);
  },

  /** Actualizar perfil (propio o admin). */
  async update(id: number, data: UsuarioUpdate): Promise<Usuario> {
    return api.patch<Usuario>(`/usuarios/${id}`, data);
  },

  /** Desactivar usuario (admin). */
  async delete(id: number): Promise<void> {
    return api.delete<void>(`/usuarios/${id}`);
  },
};

export default usuariosService;
