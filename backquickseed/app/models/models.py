"""
ORM models – espejo del schema MySQL de QuickSeed.
"""
from __future__ import annotations

import enum
from datetime import date, datetime
from decimal import Decimal

from sqlalchemy import (
    BigInteger, Boolean, Date, DateTime, Enum, ForeignKey,
    Numeric, SmallInteger, String, Text, func,
)
from sqlalchemy.orm import Mapped, mapped_column, relationship

from app.db.session import Base


# ── Enums ─────────────────────────────────────────────────
class RiskLevel(str, enum.Enum):
    low = "low"
    medium = "medium"
    high = "high"


class DonationStatus(str, enum.Enum):
    verified = "verified"
    pending = "pending"
    flagged = "flagged"


class PaymentMethod(str, enum.Enum):
    transferencia = "transferencia"
    online = "online"
    efectivo = "efectivo"


class DocType(str, enum.Enum):
    INE = "INE"
    CSF = "CSF"
    CURP = "CURP"
    OTRO = "OTRO"


class AlertType(str, enum.Enum):
    kyc = "kyc"
    fraud = "fraud"
    compliance = "compliance"
    system = "system"


class UserRole(str, enum.Enum):
    donante = "donante"
    admin = "admin"


# ── Tables ────────────────────────────────────────────────
class Categoria(Base):
    __tablename__ = "categorias"

    id: Mapped[int] = mapped_column(primary_key=True, autoincrement=True)
    nombre: Mapped[str] = mapped_column(String(100), unique=True, nullable=False)
    descripcion: Mapped[str | None] = mapped_column(Text)
    created_at: Mapped[datetime] = mapped_column(DateTime, server_default=func.now())

    proyectos: Mapped[list["Proyecto"]] = relationship(back_populates="categoria")


class Proyecto(Base):
    __tablename__ = "proyectos"

    id: Mapped[int] = mapped_column(primary_key=True, autoincrement=True)
    titulo: Mapped[str] = mapped_column(String(255), nullable=False)
    descripcion: Mapped[str | None] = mapped_column(Text)
    categoria_id: Mapped[int] = mapped_column(ForeignKey("categorias.id"))
    imagen_url: Mapped[str | None] = mapped_column(String(500))
    meta: Mapped[Decimal] = mapped_column(Numeric(15, 2), default=0)
    recaudado: Mapped[Decimal] = mapped_column(Numeric(15, 2), default=0)
    activo: Mapped[bool] = mapped_column(Boolean, default=True)
    created_at: Mapped[datetime] = mapped_column(DateTime, server_default=func.now())
    updated_at: Mapped[datetime] = mapped_column(
        DateTime, server_default=func.now(), onupdate=func.now()
    )

    categoria: Mapped["Categoria"] = relationship(back_populates="proyectos")
    donaciones: Mapped[list["Donacion"]] = relationship(back_populates="proyecto")


class Usuario(Base):
    __tablename__ = "usuarios"

    id: Mapped[int] = mapped_column(primary_key=True, autoincrement=True)
    codigo: Mapped[str] = mapped_column(String(20), unique=True, nullable=False)
    nombre: Mapped[str] = mapped_column(String(150), nullable=False)
    email: Mapped[str] = mapped_column(String(200), unique=True, nullable=False)
    password_hash: Mapped[str | None] = mapped_column(String(255))
    telefono: Mapped[str | None] = mapped_column(String(30))
    rfc: Mapped[str | None] = mapped_column(String(20), index=True)
    curp: Mapped[str | None] = mapped_column(String(20))
    ubicacion: Mapped[str | None] = mapped_column(String(150))
    avatar_url: Mapped[str | None] = mapped_column(String(500))
    nivel_riesgo: Mapped[RiskLevel] = mapped_column(
        Enum(RiskLevel), default=RiskLevel.low, index=True
    )
    total_donado: Mapped[Decimal] = mapped_column(Numeric(15, 2), default=0)
    conteo_donaciones: Mapped[int] = mapped_column(default=0)
    fecha_registro: Mapped[date | None] = mapped_column(Date)
    constancia_expiry: Mapped[date | None] = mapped_column(Date)
    rol: Mapped[UserRole] = mapped_column(Enum(UserRole), default=UserRole.donante)
    activo: Mapped[bool] = mapped_column(Boolean, default=True)
    created_at: Mapped[datetime] = mapped_column(DateTime, server_default=func.now())
    updated_at: Mapped[datetime] = mapped_column(
        DateTime, server_default=func.now(), onupdate=func.now()
    )

    documentos: Mapped[list["DocumentoKYC"]] = relationship(back_populates="usuario")
    donaciones: Mapped[list["Donacion"]] = relationship(
        back_populates="usuario", foreign_keys="Donacion.usuario_id"
    )
    alertas: Mapped[list["Alerta"]] = relationship(
        back_populates="usuario", foreign_keys="Alerta.usuario_id"
    )


class DocumentoKYC(Base):
    __tablename__ = "documentos_kyc"

    id: Mapped[int] = mapped_column(primary_key=True, autoincrement=True)
    usuario_id: Mapped[int] = mapped_column(ForeignKey("usuarios.id", ondelete="CASCADE"))
    tipo: Mapped[DocType] = mapped_column(Enum(DocType), nullable=False)
    archivo_url: Mapped[str | None] = mapped_column(String(500))
    verificado: Mapped[bool] = mapped_column(Boolean, default=False)
    fecha_subida: Mapped[datetime] = mapped_column(DateTime, server_default=func.now())
    fecha_expiry: Mapped[date | None] = mapped_column(Date)

    usuario: Mapped["Usuario"] = relationship(back_populates="documentos")


class Donacion(Base):
    __tablename__ = "donaciones"

    id: Mapped[int] = mapped_column(primary_key=True, autoincrement=True)
    codigo: Mapped[str] = mapped_column(String(20), unique=True, nullable=False)
    usuario_id: Mapped[int] = mapped_column(ForeignKey("usuarios.id"))
    proyecto_id: Mapped[int] = mapped_column(ForeignKey("proyectos.id"))
    monto: Mapped[Decimal] = mapped_column(Numeric(15, 2), nullable=False)
    metodo_pago: Mapped[PaymentMethod] = mapped_column(
        Enum(PaymentMethod), default=PaymentMethod.online
    )
    referencia_pago: Mapped[str | None] = mapped_column(String(100))
    document_match: Mapped[int] = mapped_column(SmallInteger, default=0)
    status: Mapped[DonationStatus] = mapped_column(
        Enum(DonationStatus), default=DonationStatus.pending, index=True
    )
    nivel_riesgo: Mapped[RiskLevel] = mapped_column(
        Enum(RiskLevel), default=RiskLevel.low, index=True
    )
    ip_origen: Mapped[str | None] = mapped_column(String(45))
    ubicacion: Mapped[str | None] = mapped_column(String(150))
    requiere_kyc: Mapped[bool] = mapped_column(Boolean, default=False)
    fecha_donacion: Mapped[date] = mapped_column(Date, nullable=False, index=True)
    created_at: Mapped[datetime] = mapped_column(DateTime, server_default=func.now())
    updated_at: Mapped[datetime] = mapped_column(
        DateTime, server_default=func.now(), onupdate=func.now()
    )

    usuario: Mapped["Usuario"] = relationship(
        back_populates="donaciones", foreign_keys=[usuario_id]
    )
    proyecto: Mapped["Proyecto"] = relationship(back_populates="donaciones")
    historial: Mapped[list["DonacionHistorial"]] = relationship(back_populates="donacion")
    alertas: Mapped[list["Alerta"]] = relationship(
        back_populates="donacion", foreign_keys="Alerta.donacion_id"
    )


class DonacionHistorial(Base):
    __tablename__ = "donacion_historial"

    id: Mapped[int] = mapped_column(primary_key=True, autoincrement=True)
    donacion_id: Mapped[int] = mapped_column(ForeignKey("donaciones.id", ondelete="CASCADE"))
    status_antes: Mapped[DonationStatus | None] = mapped_column(Enum(DonationStatus))
    status_nuevo: Mapped[DonationStatus] = mapped_column(Enum(DonationStatus), nullable=False)
    motivo: Mapped[str | None] = mapped_column(String(500))
    admin_id: Mapped[int | None] = mapped_column(ForeignKey("usuarios.id", ondelete="SET NULL"))
    created_at: Mapped[datetime] = mapped_column(DateTime, server_default=func.now())

    donacion: Mapped["Donacion"] = relationship(back_populates="historial")


class Alerta(Base):
    __tablename__ = "alertas"

    id: Mapped[int] = mapped_column(primary_key=True, autoincrement=True)
    tipo: Mapped[AlertType] = mapped_column(Enum(AlertType), nullable=False)
    mensaje: Mapped[str] = mapped_column(Text, nullable=False)
    severidad: Mapped[RiskLevel] = mapped_column(
        Enum(RiskLevel), default=RiskLevel.medium, index=True
    )
    usuario_id: Mapped[int | None] = mapped_column(
        ForeignKey("usuarios.id", ondelete="SET NULL")
    )
    donacion_id: Mapped[int | None] = mapped_column(
        ForeignKey("donaciones.id", ondelete="SET NULL")
    )
    resuelta: Mapped[bool] = mapped_column(Boolean, default=False, index=True)
    fecha: Mapped[date] = mapped_column(Date, nullable=False)
    created_at: Mapped[datetime] = mapped_column(DateTime, server_default=func.now())

    usuario: Mapped["Usuario | None"] = relationship(
        back_populates="alertas", foreign_keys=[usuario_id]
    )
    donacion: Mapped["Donacion | None"] = relationship(
        back_populates="alertas", foreign_keys=[donacion_id]
    )
