/**
 * analyticsService.ts – Datos del dashboard admin.
 */
import api from "./api";
import type {
  AnalyticsSummary,
  DonacionMes,
  RiesgoDistribucion,
  UbicacionStat,
} from "./types";

export const analyticsService = {
  /** KPIs generales del dashboard. */
  async getSummary(): Promise<AnalyticsSummary> {
    return api.get<AnalyticsSummary>("/analytics/summary");
  },

  /** Recaudación mensual (para el gráfico de área/barras). */
  async getDonacionesPorMes(): Promise<DonacionMes[]> {
    return api.get<DonacionMes[]>("/analytics/donaciones-mes");
  },

  /** Distribución de donantes por nivel de riesgo (para el pie chart). */
  async getRiesgoDistribucion(): Promise<RiesgoDistribucion> {
    return api.get<RiesgoDistribucion>("/analytics/riesgo");
  },

  /** Top ubicaciones por monto (para el mapa). */
  async getUbicaciones(): Promise<UbicacionStat[]> {
    return api.get<UbicacionStat[]>("/analytics/ubicaciones");
  },
};

export default analyticsService;
