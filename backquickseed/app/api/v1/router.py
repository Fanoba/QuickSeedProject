from fastapi import APIRouter

from app.api.v1.routes import (
    alertas,
    analytics,
    auth,
    donaciones,
    kyc,
    proyectos,
    usuarios,
)

api_router = APIRouter()

api_router.include_router(auth.router)
api_router.include_router(usuarios.router)
api_router.include_router(proyectos.router)
api_router.include_router(donaciones.router)
api_router.include_router(alertas.router)
api_router.include_router(kyc.router)
api_router.include_router(analytics.router)
