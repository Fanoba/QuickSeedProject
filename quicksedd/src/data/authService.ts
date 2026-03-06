/**
 * authService.ts – Login, logout y obtener usuario actual.
 */
import api, { tokenStorage } from "./api";
import type { TokenResponse, Usuario } from "./types";

export const authService = {
  /**
   * Inicia sesión y guarda los tokens en localStorage.
   */
  async login(email: string, password: string): Promise<Usuario> {
    const tokens = await api.post<TokenResponse>("/auth/login", { email, password });
    tokenStorage.set(tokens.access_token, tokens.refresh_token);
    return authService.me();
  },

  /**
   * Cierra sesión limpiando los tokens.
   */
  logout(): void {
    tokenStorage.clear();
  },

  /**
   * Retorna el usuario autenticado o null si no hay sesión.
   */
  async me(): Promise<Usuario> {
  const response = await api.get<any>("/auth/me");
  return Array.isArray(response) ? response[0] : response;
},

  /**
   * Indica si hay un token activo (no valida con el servidor).
   */
  isAuthenticated(): boolean {
    return Boolean(tokenStorage.getAccess());
  },
};

export default authService;
