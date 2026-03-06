"""
GET    /kyc/{user_id}           – documentos del usuario
POST   /kyc/{user_id}/{tipo}    – subir/registrar documento
PATCH  /kyc/{doc_id}/verify     – verificar documento (admin)
"""
from datetime import date

from fastapi import APIRouter, Depends, HTTPException, status
from pydantic import BaseModel
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from app.db.session import get_db
from app.models.models import DocType, DocumentoKYC, Usuario, UserRole
from app.utils.deps import get_current_user, require_admin

router = APIRouter(prefix="/kyc", tags=["KYC / Documentos"])


class DocUpload(BaseModel):
    archivo_url: str | None = None
    fecha_expiry: date | None = None


class DocOut(BaseModel):
    id: int
    usuario_id: int
    tipo: DocType
    archivo_url: str | None
    verificado: bool
    fecha_expiry: date | None

    model_config = {"from_attributes": True}


@router.get("/{user_id}", response_model=list[DocOut])
async def get_docs(
    user_id: int,
    db: AsyncSession = Depends(get_db),
    current_user: Usuario = Depends(get_current_user),
):
    if current_user.rol != UserRole.admin and current_user.id != user_id:
        raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="Acceso denegado")

    result = await db.execute(select(DocumentoKYC).where(DocumentoKYC.usuario_id == user_id))
    return result.scalars().all()


@router.post("/{user_id}/{tipo}", response_model=DocOut, status_code=status.HTTP_201_CREATED)
async def upload_doc(
    user_id: int,
    tipo: DocType,
    payload: DocUpload,
    db: AsyncSession = Depends(get_db),
    current_user: Usuario = Depends(get_current_user),
):
    if current_user.rol != UserRole.admin and current_user.id != user_id:
        raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="Acceso denegado")

    # Upsert
    result = await db.execute(
        select(DocumentoKYC).where(
            DocumentoKYC.usuario_id == user_id, DocumentoKYC.tipo == tipo
        )
    )
    doc = result.scalar_one_or_none()
    if doc:
        doc.archivo_url = payload.archivo_url
        doc.fecha_expiry = payload.fecha_expiry
        doc.verificado = False  # reset hasta nueva verificación
    else:
        doc = DocumentoKYC(
            usuario_id=user_id,
            tipo=tipo,
            archivo_url=payload.archivo_url,
            fecha_expiry=payload.fecha_expiry,
        )
        db.add(doc)

    await db.flush()
    await db.refresh(doc)
    return doc


@router.patch("/{doc_id}/verify", response_model=DocOut)
async def verify_doc(
    doc_id: int,
    db: AsyncSession = Depends(get_db),
    _: Usuario = Depends(require_admin),
):
    result = await db.execute(select(DocumentoKYC).where(DocumentoKYC.id == doc_id))
    doc = result.scalar_one_or_none()
    if not doc:
        raise HTTPException(status_code=404, detail="Documento no encontrado")

    doc.verificado = True
    await db.flush()
    await db.refresh(doc)
    return doc
