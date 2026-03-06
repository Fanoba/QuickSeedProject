/**
 * kycService.ts – Documentos KYC por usuario.
 */
import api from "./api";
import type { DocType, DocumentoKYC } from "./types";

export const kycService = {
  /** Obtiene los documentos KYC de un usuario. */
  async getByUsuario(usuarioId: number): Promise<DocumentoKYC[]> {
    return api.get<DocumentoKYC[]>(`/kyc/${usuarioId}`);
  },

  /** Registra o actualiza un documento de un usuario. */
  async upload(
    usuarioId: number,
    tipo: DocType,
    data: { archivo_url?: string; fecha_expiry?: string },
  ): Promise<DocumentoKYC> {
    return api.post<DocumentoKYC>(`/kyc/${usuarioId}/${tipo}`, data);
  },

  /** Marca un documento como verificado (admin). */
  async verify(docId: number): Promise<DocumentoKYC> {
    return api.patch<DocumentoKYC>(`/kyc/${docId}/verify`);
  },

  /**
   * Helper: retorna un objeto { INE, CSF, CURP } con booleanos
   * para saber si cada doc está verificado, dado el array completo.
   */
  parseDocsStatus(docs: DocumentoKYC[]): Record<string, boolean> {
    return {
      INE: docs.some((d) => d.tipo === "INE" && d.verificado),
      CSF: docs.some((d) => d.tipo === "CSF" && d.verificado),
      CURP: docs.some((d) => d.tipo === "CURP" && d.verificado),
    };
  },
};

export default kycService;
