"""
GET    /proyectos             – lista pública
POST   /proyectos             – crear (admin)
GET    /proyectos/{id}        – detalle público
PATCH  /proyectos/{id}        – editar (admin)
DELETE /proyectos/{id}        – desactivar (admin)
GET    /proyectos/categorias  – lista de categorías
"""
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy import select
from sqlalchemy.orm import selectinload
from sqlalchemy.ext.asyncio import AsyncSession

from app.db.session import get_db
from app.models.models import Categoria, Proyecto, Usuario
from app.schemas.proyecto import CategoriaOut, ProyectoCreate, ProyectoOut, ProyectoUpdate
from app.utils.deps import require_admin

router = APIRouter(prefix="/proyectos", tags=["Proyectos"])


@router.get("/categorias", response_model=list[CategoriaOut])
async def list_categorias(db: AsyncSession = Depends(get_db)):
    result = await db.execute(select(Categoria).order_by(Categoria.nombre))
    return result.scalars().all()


@router.get("", response_model=list[ProyectoOut])
async def list_proyectos(
    categoria_id: int | None = None,
    activo: bool = True,
    skip: int = 0,
    limit: int = 20,
    db: AsyncSession = Depends(get_db),
):
    q = select(Proyecto).options(selectinload(Proyecto.categoria)).where(Proyecto.activo == activo)
    if categoria_id:
        q = q.where(Proyecto.categoria_id == categoria_id)
    result = await db.execute(q.offset(skip).limit(limit))
    return result.scalars().all()


@router.post("", response_model=ProyectoOut, status_code=status.HTTP_201_CREATED)
async def create_proyecto(
    payload: ProyectoCreate,
    db: AsyncSession = Depends(get_db),
    _: Usuario = Depends(require_admin),
):
    proyecto = Proyecto(**payload.model_dump())
    db.add(proyecto)
    await db.flush()
    await db.refresh(proyecto, ["categoria"])
    return proyecto


@router.get("/{proyecto_id}", response_model=ProyectoOut)
async def get_proyecto(proyecto_id: int, db: AsyncSession = Depends(get_db)):
    result = await db.execute(
        select(Proyecto)
        .options(selectinload(Proyecto.categoria))
        .where(Proyecto.id == proyecto_id)
    )
    proyecto = result.scalar_one_or_none()
    if not proyecto:
        raise HTTPException(status_code=404, detail="Proyecto no encontrado")
    return proyecto


@router.patch("/{proyecto_id}", response_model=ProyectoOut)
async def update_proyecto(
    proyecto_id: int,
    payload: ProyectoUpdate,
    db: AsyncSession = Depends(get_db),
    _: Usuario = Depends(require_admin),
):
    result = await db.execute(
        select(Proyecto).options(selectinload(Proyecto.categoria)).where(Proyecto.id == proyecto_id)
    )
    proyecto = result.scalar_one_or_none()
    if not proyecto:
        raise HTTPException(status_code=404, detail="Proyecto no encontrado")

    for field, value in payload.model_dump(exclude_none=True).items():
        setattr(proyecto, field, value)
    await db.flush()
    await db.refresh(proyecto, ["categoria"])
    return proyecto


@router.delete("/{proyecto_id}", status_code=status.HTTP_204_NO_CONTENT)
async def deactivate_proyecto(
    proyecto_id: int,
    db: AsyncSession = Depends(get_db),
    _: Usuario = Depends(require_admin),
):
    result = await db.execute(select(Proyecto).where(Proyecto.id == proyecto_id))
    proyecto = result.scalar_one_or_none()
    if not proyecto:
        raise HTTPException(status_code=404, detail="Proyecto no encontrado")
    proyecto.activo = False
    await db.flush()
