from __future__ import annotations
from datetime import datetime
from decimal import Decimal
from typing import Optional

from pydantic import BaseModel, computed_field


class ProyectoBase(BaseModel):
    titulo: str
    descripcion: Optional[str] = None
    categoria_id: int
    imagen_url: Optional[str] = None
    meta: Decimal = Decimal("0")


class ProyectoCreate(ProyectoBase):
    pass


class ProyectoUpdate(BaseModel):
    titulo: Optional[str] = None
    descripcion: Optional[str] = None
    imagen_url: Optional[str] = None
    meta: Optional[Decimal] = None
    activo: Optional[bool] = None


class CategoriaOut(BaseModel):
    id: int
    nombre: str
    model_config = {"from_attributes": True}


class ProyectoOut(ProyectoBase):
    id: int
    recaudado: Decimal
    activo: bool
    created_at: datetime
    categoria: CategoriaOut

    @computed_field  # type: ignore[misc]
    @property
    def porcentaje(self) -> float:
        if self.meta == 0:
            return 0.0
        return round(float(self.recaudado / self.meta) * 100, 1)

    model_config = {"from_attributes": True}
