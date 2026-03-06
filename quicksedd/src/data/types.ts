/**
 * types.ts – Interfaces TypeScript que reflejan los schemas Pydantic del backend.
 * Úsalas en toda la app en lugar de los tipos del mockData.
 */

// ── Enums ──────────────────────────────────────────────────
export type RiskLevel = "low" | "medium" | "high";
export type DonationStatus = "verified" | "pending" | "flagged";
export type PaymentMethod = "transferencia" | "online" | "efectivo";
export type DocType = "INE" | "CSF" | "CURP" | "OTRO";
export type AlertType = "kyc" | "fraud" | "compliance" | "system";
export type UserRole = "donante" | "admin";

// ── Auth ───────────────────────────────────────────────────
export interface TokenResponse {
  access_token: string;
  refresh_token: string;
  token_type: string;
}

// ── Categoría ──────────────────────────────────────────────
export interface Categoria {
  id: number;
  nombre: string;
}

// ── Proyecto ───────────────────────────────────────────────
export interface Proyecto {
  id: number;
  titulo: string;
  descripcion: string | null;
  categoria_id: number;
  categoria: Categoria;
  imagen_url: string | null;
  meta: number;
  recaudado: number;
  porcentaje: number;
  activo: boolean;
  created_at: string;
}

export interface ProyectoCreate {
  titulo: string;
  descripcion?: string;
  categoria_id: number;
  imagen_url?: string;
  meta: number;
}

export interface ProyectoUpdate {
  titulo?: string;
  descripcion?: string;
  imagen_url?: string;
  meta?: number;
  activo?: boolean;
}

// ── Usuario ────────────────────────────────────────────────
export interface Usuario {
  id: number;
  codigo: string;
  nombre: string;
  email: string;
  telefono: string | null;
  rfc: string | null;
  curp: string | null;
  ubicacion: string | null;
  avatar_url: string | null;
  nivel_riesgo: RiskLevel;
  total_donado: number;
  conteo_donaciones: number;
  fecha_registro: string | null;
  constancia_expiry: string | null;
  rol: UserRole;
  activo: boolean;
  created_at: string;
}

export interface UsuarioCreate {
  nombre: string;
  email: string;
  password: string;
  telefono?: string;
  rfc?: string;
  curp?: string;
  ubicacion?: string;
}

export interface UsuarioUpdate {
  nombre?: string;
  telefono?: string;
  rfc?: string;
  curp?: string;
  ubicacion?: string;
  avatar_url?: string;
  constancia_expiry?: string;
  nivel_riesgo?: RiskLevel;
}

// ── Donación ───────────────────────────────────────────────
export interface Donacion {
  id: number;
  codigo: string;
  usuario_id: number;
  proyecto_id: number;
  monto: number;
  metodo_pago: PaymentMethod;
  referencia_pago: string | null;
  document_match: number;
  status: DonationStatus;
  nivel_riesgo: RiskLevel;
  ip_origen: string | null;
  ubicacion: string | null;
  requiere_kyc: boolean;
  fecha_donacion: string;
  created_at: string;
}

export interface DonacionCreate {
  proyecto_id: number;
  monto: number;
  metodo_pago?: PaymentMethod;
  referencia_pago?: string;
}

export interface DonacionStatusUpdate {
  status: DonationStatus;
  motivo?: string;
}

export interface DonacionHistorial {
  id: number;
  status_antes: DonationStatus | null;
  status_nuevo: DonationStatus;
  motivo: string | null;
  admin_id: number | null;
  created_at: string;
}

// ── Documento KYC ─────────────────────────────────────────
export interface DocumentoKYC {
  id: number;
  usuario_id: number;
  tipo: DocType;
  archivo_url: string | null;
  verificado: boolean;
  fecha_expiry: string | null;
}

// ── Alerta ────────────────────────────────────────────────
export interface Alerta {
  id: number;
  tipo: AlertType;
  mensaje: string;
  severidad: RiskLevel;
  usuario_id: number | null;
  donacion_id: number | null;
  resuelta: boolean;
  fecha: string;
  created_at: string;
}

export interface AlertaCreate {
  tipo: AlertType;
  mensaje: string;
  severidad?: RiskLevel;
  usuario_id?: number;
  donacion_id?: number;
  fecha: string;
}

// ── Analytics ─────────────────────────────────────────────
export interface AnalyticsSummary {
  total_recaudado: number;
  total_donantes: number;
  total_proyectos: number;
  donaciones_pendientes: number;
  donaciones_flagged: number;
}

export interface DonacionMes {
  mes: string;
  conteo: number;
  total: number;
}

export interface RiesgoDistribucion {
  low: number;
  medium: number;
  high: number;
}

export interface UbicacionStat {
  ubicacion: string;
  conteo: number;
  total: number;
}
