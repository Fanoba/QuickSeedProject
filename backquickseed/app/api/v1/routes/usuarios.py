"""
GET    /usuarios              – lista (admin)
POST   /usuarios              – registro público
GET    /usuarios/{id}         – detalle (admin o propio)
PATCH  /usuarios/{id}         – actualizar (admin o propio)
DELETE /usuarios/{id}         – desactivar (admin)
"""
import uuid
from datetime import date

from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from app.core.security import hash_password
from app.db.session import get_db
from app.models.models import Usuario, UserRole
from app.schemas.usuario import UsuarioCreate, UsuarioOut, UsuarioUpdate
from app.utils.deps import get_current_user, require_admin

router = APIRouter(prefix="/usuarios", tags=["Usuarios"])


def _gen_codigo() -> str:
    return f"USR-{str(uuid.uuid4().int)[:4].upper()}"


@router.get("", response_model=list[UsuarioOut])
async def list_usuarios(
    skip: int = 0,
    limit: int = 50,
    db: AsyncSession = Depends(get_db),
    _: Usuario = Depends(require_admin),
):
    result = await db.execute(select(Usuario).offset(skip).limit(limit))
    return result.scalars().all()


@router.post("", response_model=UsuarioOut, status_code=status.HTTP_201_CREATED)
async def create_usuario(payload: UsuarioCreate, db: AsyncSession = Depends(get_db)):
    # Email único
    existing = await db.execute(select(Usuario).where(Usuario.email == payload.email))
    if existing.scalar_one_or_none():
        raise HTTPException(status_code=400, detail="Email ya registrado")

    user = Usuario(
        codigo=_gen_codigo(),
        nombre=payload.nombre,
        email=payload.email,
        password_hash=hash_password(payload.password),
        telefono=payload.telefono,
        rfc=payload.rfc,
        curp=payload.curp,
        ubicacion=payload.ubicacion,
        avatar_url=payload.avatar_url,
        fecha_registro=date.today(),
    )
    db.add(user)
    await db.flush()
    await db.refresh(user)
    return user


@router.get("/{user_id}", response_model=UsuarioOut)
async def get_usuario(
    user_id: int,
    db: AsyncSession = Depends(get_db),
    current_user: Usuario = Depends(get_current_user),
):
    if current_user.rol != UserRole.admin and current_user.id != user_id:
        raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="Acceso denegado")

    result = await db.execute(select(Usuario).where(Usuario.id == user_id))
    user = result.scalar_one_or_none()
    if not user:
        raise HTTPException(status_code=404, detail="Usuario no encontrado")
    return user


@router.patch("/{user_id}", response_model=UsuarioOut)
async def update_usuario(
    user_id: int,
    payload: UsuarioUpdate,
    db: AsyncSession = Depends(get_db),
    current_user: Usuario = Depends(get_current_user),
):
    if current_user.rol != UserRole.admin and current_user.id != user_id:
        raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="Acceso denegado")

    result = await db.execute(select(Usuario).where(Usuario.id == user_id))
    user = result.scalar_one_or_none()
    if not user:
        raise HTTPException(status_code=404, detail="Usuario no encontrado")

    for field, value in payload.model_dump(exclude_none=True).items():
        setattr(user, field, value)

    await db.flush()
    await db.refresh(user)
    return user


@router.delete("/{user_id}", status_code=status.HTTP_204_NO_CONTENT)
async def deactivate_usuario(
    user_id: int,
    db: AsyncSession = Depends(get_db),
    _: Usuario = Depends(require_admin),
):
    result = await db.execute(select(Usuario).where(Usuario.id == user_id))
    user = result.scalar_one_or_none()
    if not user:
        raise HTTPException(status_code=404, detail="Usuario no encontrado")

    user.activo = False
    await db.flush()
