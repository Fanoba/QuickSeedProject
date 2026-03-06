from __future__ import annotations
from datetime import date, datetime
from decimal import Decimal
from typing import Optional

from pydantic import BaseModel, EmailStr, field_validator

from app.models.models import RiskLevel, UserRole


class UsuarioBase(BaseModel):
    nombre: str
    email: EmailStr
    telefono: Optional[str] = None
    rfc: Optional[str] = None
    curp: Optional[str] = None
    ubicacion: Optional[str] = None
    avatar_url: Optional[str] = None


class UsuarioCreate(UsuarioBase):
    password: str


class UsuarioUpdate(BaseModel):
    nombre: Optional[str] = None
    telefono: Optional[str] = None
    rfc: Optional[str] = None
    curp: Optional[str] = None
    ubicacion: Optional[str] = None
    avatar_url: Optional[str] = None
    constancia_expiry: Optional[date] = None
    nivel_riesgo: Optional[RiskLevel] = None


class UsuarioOut(UsuarioBase):
    id: int
    codigo: str
    nivel_riesgo: RiskLevel
    total_donado: Decimal
    conteo_donaciones: int
    fecha_registro: Optional[date]
    constancia_expiry: Optional[date]
    rol: UserRole
    activo: bool
    created_at: datetime

    model_config = {"from_attributes": True}


# Auth
class LoginRequest(BaseModel):
    email: EmailStr
    password: str


class TokenResponse(BaseModel):
    access_token: str
    refresh_token: str
    token_type: str = "bearer"


class RefreshRequest(BaseModel):
    refresh_token: str
