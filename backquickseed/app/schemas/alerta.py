from __future__ import annotations
from datetime import date, datetime
from typing import Optional

from pydantic import BaseModel

from app.models.models import AlertType, RiskLevel


class AlertaCreate(BaseModel):
    tipo: AlertType
    mensaje: str
    severidad: RiskLevel = RiskLevel.medium
    usuario_id: Optional[int] = None
    donacion_id: Optional[int] = None
    fecha: date


class AlertaOut(BaseModel):
    id: int
    tipo: AlertType
    mensaje: str
    severidad: RiskLevel
    usuario_id: Optional[int]
    donacion_id: Optional[int]
    resuelta: bool
    fecha: date
    created_at: datetime

    model_config = {"from_attributes": True}
