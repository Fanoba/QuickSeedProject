"""
GET    /donaciones             – lista (admin)
POST   /donaciones             – crear (donante autenticado)
GET    /donaciones/{id}        – detalle
PATCH  /donaciones/{id}/status – cambiar status + auditoría (admin)
GET    /donaciones/{id}/historial – historial de cambios (admin)
GET    /donaciones/mis         – donaciones propias (donante)
"""
import random
import string
from datetime import date

from fastapi import APIRouter, Depends, HTTPException, Request, status
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from app.db.session import get_db
from app.models.models import (
    Donacion, DonacionHistorial, DonationStatus, Proyecto, Usuario, UserRole,
)
from app.schemas.donacion import (
    DonacionCreate, DonacionHistorialOut, DonacionOut, DonacionStatusUpdate,
)
from app.services.aml import evaluate_risk
from app.utils.deps import get_current_user, require_admin

router = APIRouter(prefix="/donaciones", tags=["Donaciones"])


def _gen_codigo() -> str:
    suffix = "".join(random.choices(string.ascii_uppercase + string.digits, k=6))
    return f"D-{suffix}"


@router.get("", response_model=list[DonacionOut])
async def list_donaciones(
    status: DonationStatus | None = None,
    skip: int = 0,
    limit: int = 50,
    db: AsyncSession = Depends(get_db),
    _: Usuario = Depends(require_admin),
):
    q = select(Donacion)
    if status:
        q = q.where(Donacion.status == status)
    result = await db.execute(q.order_by(Donacion.created_at.desc()).offset(skip).limit(limit))
    return result.scalars().all()


@router.get("/mis", response_model=list[DonacionOut])
async def my_donations(
    db: AsyncSession = Depends(get_db),
    current_user: Usuario = Depends(get_current_user),
):
    result = await db.execute(
        select(Donacion)
        .where(Donacion.usuario_id == current_user.id)
        .order_by(Donacion.created_at.desc())
    )
    return result.scalars().all()


@router.post("", response_model=DonacionOut, status_code=status.HTTP_201_CREATED)
async def create_donacion(
    payload: DonacionCreate,
    request: Request,
    db: AsyncSession = Depends(get_db),
    current_user: Usuario = Depends(get_current_user),
):
    # Validar proyecto
    result = await db.execute(
        select(Proyecto).where(Proyecto.id == payload.proyecto_id, Proyecto.activo == True)
    )
    proyecto = result.scalar_one_or_none()
    if not proyecto:
        raise HTTPException(status_code=404, detail="Proyecto no encontrado o inactivo")

    # Evaluación AML
    document_match = random.randint(40, 99)  # TODO: conectar con servicio KYC real
    ip_origen = request.client.host if request.client else None
    nivel_riesgo, requiere_kyc = evaluate_risk(
        monto=payload.monto,
        document_match=document_match,
        ip_origen=ip_origen,
        ubicacion=current_user.ubicacion,
        total_donado_previo=current_user.total_donado,
    )

    donacion = Donacion(
        codigo=_gen_codigo(),
        usuario_id=current_user.id,
        proyecto_id=payload.proyecto_id,
        monto=payload.monto,
        metodo_pago=payload.metodo_pago,
        referencia_pago=payload.referencia_pago,
        document_match=document_match,
        nivel_riesgo=nivel_riesgo,
        requiere_kyc=requiere_kyc,
        ip_origen=ip_origen,
        ubicacion=current_user.ubicacion,
        fecha_donacion=date.today(),
        status=DonationStatus.pending,
    )
    db.add(donacion)

    # Actualizar totales del usuario
    current_user.total_donado += payload.monto
    current_user.conteo_donaciones += 1

    # Actualizar recaudado del proyecto
    proyecto.recaudado += payload.monto

    await db.flush()
    await db.refresh(donacion)
    return donacion


@router.get("/{donacion_id}", response_model=DonacionOut)
async def get_donacion(
    donacion_id: int,
    db: AsyncSession = Depends(get_db),
    current_user: Usuario = Depends(get_current_user),
):
    result = await db.execute(select(Donacion).where(Donacion.id == donacion_id))
    donacion = result.scalar_one_or_none()
    if not donacion:
        raise HTTPException(status_code=404, detail="Donación no encontrada")
    if current_user.rol != UserRole.admin and donacion.usuario_id != current_user.id:
        raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="Acceso denegado")
    return donacion


@router.patch("/{donacion_id}/status", response_model=DonacionOut)
async def update_status(
    donacion_id: int,
    payload: DonacionStatusUpdate,
    db: AsyncSession = Depends(get_db),
    admin: Usuario = Depends(require_admin),
):
    result = await db.execute(select(Donacion).where(Donacion.id == donacion_id))
    donacion = result.scalar_one_or_none()
    if not donacion:
        raise HTTPException(status_code=404, detail="Donación no encontrada")

    # Guardar historial
    historial = DonacionHistorial(
        donacion_id=donacion.id,
        status_antes=donacion.status,
        status_nuevo=payload.status,
        motivo=payload.motivo,
        admin_id=admin.id,
    )
    db.add(historial)

    donacion.status = payload.status
    await db.flush()
    await db.refresh(donacion)
    return donacion


@router.get("/{donacion_id}/historial", response_model=list[DonacionHistorialOut])
async def get_historial(
    donacion_id: int,
    db: AsyncSession = Depends(get_db),
    _: Usuario = Depends(require_admin),
):
    result = await db.execute(
        select(DonacionHistorial)
        .where(DonacionHistorial.donacion_id == donacion_id)
        .order_by(DonacionHistorial.created_at)
    )
    return result.scalars().all()
