from __future__ import annotations
from datetime import date, datetime
from decimal import Decimal
from typing import Optional

from pydantic import BaseModel

from app.models.models import DonationStatus, PaymentMethod, RiskLevel


class DonacionCreate(BaseModel):
    proyecto_id: int
    monto: Decimal
    metodo_pago: PaymentMethod = PaymentMethod.online
    referencia_pago: Optional[str] = None


class DonacionStatusUpdate(BaseModel):
    status: DonationStatus
    motivo: Optional[str] = None


class DonacionOut(BaseModel):
    id: int
    codigo: str
    usuario_id: int
    proyecto_id: int
    monto: Decimal
    metodo_pago: PaymentMethod
    referencia_pago: Optional[str]
    document_match: int
    status: DonationStatus
    nivel_riesgo: RiskLevel
    ip_origen: Optional[str]
    ubicacion: Optional[str]
    requiere_kyc: bool
    fecha_donacion: date
    created_at: datetime

    model_config = {"from_attributes": True}


class DonacionHistorialOut(BaseModel):
    id: int
    status_antes: Optional[DonationStatus]
    status_nuevo: DonationStatus
    motivo: Optional[str]
    admin_id: Optional[int]
    created_at: datetime

    model_config = {"from_attributes": True}
