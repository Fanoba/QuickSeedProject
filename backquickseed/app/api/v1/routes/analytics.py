"""
GET /analytics/summary           – totales generales
GET /analytics/donaciones-mes    – recaudación mensual
GET /analytics/riesgo            – distribución por nivel de riesgo
GET /analytics/ubicaciones       – donaciones por ubicación (mapa)
"""
from fastapi import APIRouter, Depends
from sqlalchemy import func, select, text
from sqlalchemy.ext.asyncio import AsyncSession

from app.db.session import get_db
from app.models.models import Donacion, DonationStatus, Proyecto, RiskLevel, Usuario
from app.utils.deps import require_admin

router = APIRouter(prefix="/analytics", tags=["Analytics"])


@router.get("/summary")
async def summary(
    db: AsyncSession = Depends(get_db),
    _: Usuario = Depends(require_admin),
):
    total_donado = await db.scalar(
        select(func.sum(Donacion.monto)).where(Donacion.status == DonationStatus.verified)
    )
    total_donantes = await db.scalar(select(func.count(func.distinct(Donacion.usuario_id))))
    total_proyectos = await db.scalar(select(func.count(Proyecto.id)).where(Proyecto.activo == True))
    pendientes = await db.scalar(
        select(func.count(Donacion.id)).where(Donacion.status == DonationStatus.pending)
    )
    flagged = await db.scalar(
        select(func.count(Donacion.id)).where(Donacion.status == DonationStatus.flagged)
    )

    return {
        "total_recaudado": float(total_donado or 0),
        "total_donantes": total_donantes or 0,
        "total_proyectos": total_proyectos or 0,
        "donaciones_pendientes": pendientes or 0,
        "donaciones_flagged": flagged or 0,
    }


@router.get("/donaciones-mes")
async def donaciones_por_mes(
    db: AsyncSession = Depends(get_db),
    _: Usuario = Depends(require_admin),
):
    result = await db.execute(
        text(
            """
            SELECT DATE_FORMAT(fecha_donacion, '%Y-%m') AS mes,
                   COUNT(*)                             AS conteo,
                   SUM(monto)                           AS total
            FROM donaciones
            WHERE status = 'verified'
            GROUP BY mes
            ORDER BY mes
            """
        )
    )
    rows = result.mappings().all()
    return [{"mes": r["mes"], "conteo": r["conteo"], "total": float(r["total"])} for r in rows]


@router.get("/riesgo")
async def riesgo_distribution(
    db: AsyncSession = Depends(get_db),
    _: Usuario = Depends(require_admin),
):
    data = {}
    for level in RiskLevel:
        count = await db.scalar(
            select(func.count(Usuario.id)).where(Usuario.nivel_riesgo == level)
        )
        data[level.value] = count or 0
    return data


@router.get("/ubicaciones")
async def ubicaciones(
    db: AsyncSession = Depends(get_db),
    _: Usuario = Depends(require_admin),
):
    result = await db.execute(
        text(
            """
            SELECT ubicacion,
                   COUNT(*)   AS conteo,
                   SUM(monto) AS total
            FROM donaciones
            WHERE status IN ('verified','pending')
              AND ubicacion IS NOT NULL
            GROUP BY ubicacion
            ORDER BY total DESC
            LIMIT 20
            """
        )
    )
    rows = result.mappings().all()
    return [
        {"ubicacion": r["ubicacion"], "conteo": r["conteo"], "total": float(r["total"])}
        for r in rows
    ]
