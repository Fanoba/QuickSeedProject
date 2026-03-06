"""
GET    /alertas            – lista (admin), filtro por severidad/tipo/resuelta
POST   /alertas            – crear manualmente (admin)
PATCH  /alertas/{id}/resolve – marcar como resuelta (admin)
"""
from datetime import date

from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from app.db.session import get_db
from app.models.models import Alerta, AlertType, RiskLevel, Usuario
from app.schemas.alerta import AlertaCreate, AlertaOut
from app.utils.deps import require_admin

router = APIRouter(prefix="/alertas", tags=["Alertas AML"])


@router.get("", response_model=list[AlertaOut])
async def list_alertas(
    severidad: RiskLevel | None = None,
    tipo: AlertType | None = None,
    resuelta: bool | None = None,
    skip: int = 0,
    limit: int = 50,
    db: AsyncSession = Depends(get_db),
    _: Usuario = Depends(require_admin),
):
    q = select(Alerta).order_by(Alerta.created_at.desc())
    if severidad:
        q = q.where(Alerta.severidad == severidad)
    if tipo:
        q = q.where(Alerta.tipo == tipo)
    if resuelta is not None:
        q = q.where(Alerta.resuelta == resuelta)
    result = await db.execute(q.offset(skip).limit(limit))
    return result.scalars().all()


@router.post("", response_model=AlertaOut, status_code=status.HTTP_201_CREATED)
async def create_alerta(
    payload: AlertaCreate,
    db: AsyncSession = Depends(get_db),
    _: Usuario = Depends(require_admin),
):
    alerta = Alerta(**payload.model_dump())
    db.add(alerta)
    await db.flush()
    await db.refresh(alerta)
    return alerta


@router.patch("/{alerta_id}/resolve", response_model=AlertaOut)
async def resolve_alerta(
    alerta_id: int,
    db: AsyncSession = Depends(get_db),
    _: Usuario = Depends(require_admin),
):
    result = await db.execute(select(Alerta).where(Alerta.id == alerta_id))
    alerta = result.scalar_one_or_none()
    if not alerta:
        raise HTTPException(status_code=404, detail="Alerta no encontrada")

    alerta.resuelta = True
    await db.flush()
    await db.refresh(alerta)
    return alerta
