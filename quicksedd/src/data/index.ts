/**
 * index.ts – Re-exporta todos los servicios y tipos desde un solo punto.
 *
 * Uso en componentes:
 *   import { proyectosService, type Proyecto } from "@/data";
 */

export { default as api, tokenStorage, ApiException } from "./api";
export type { ApiError } from "./api";

export { default as authService } from "./authService";
export { default as proyectosService } from "./proyectosService";
export { default as donacionesService } from "./donacionesService";
export { default as usuariosService } from "./usuariosService";
export { default as alertasService } from "./alertasService";
export { default as kycService } from "./kycService";
export { default as analyticsService } from "./analyticsService";

export type {
  // Enums
  RiskLevel,
  DonationStatus,
  PaymentMethod,
  DocType,
  AlertType,
  UserRole,
  // Auth
  TokenResponse,
  // Entidades
  Categoria,
  Proyecto,
  ProyectoCreate,
  ProyectoUpdate,
  Usuario,
  UsuarioCreate,
  UsuarioUpdate,
  Donacion,
  DonacionCreate,
  DonacionStatusUpdate,
  DonacionHistorial,
  DocumentoKYC,
  Alerta,
  AlertaCreate,
  // Analytics
  AnalyticsSummary,
  DonacionMes,
  RiesgoDistribucion,
  UbicacionStat,
} from "./types";
