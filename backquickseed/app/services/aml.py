"""
Servicio de evaluación AML/KYC.
Determina nivel de riesgo y si la donación requiere verificación documental.
"""
from decimal import Decimal

from app.core.config import settings
from app.models.models import RiskLevel


def evaluate_risk(
    monto: Decimal,
    document_match: int,
    ip_origen: str | None,
    ubicacion: str | None,
    total_donado_previo: Decimal,
) -> tuple[RiskLevel, bool]:
    """
    Retorna (nivel_riesgo, requiere_kyc).

    Reglas básicas (ampliables con ML):
    - Monto > AML_THRESHOLD             → siempre requiere KYC
    - document_match < 50               → high risk
    - document_match 50-74              → medium risk
    - Ubicación fuera de México         → sube un nivel
    - Total acumulado > 5 000 000 MXN   → high risk
    """
    threshold = Decimal(str(settings.AML_THRESHOLD))
    requiere_kyc = monto >= threshold

    # Score base por document_match
    if document_match >= 75:
        risk = RiskLevel.low
    elif document_match >= 50:
        risk = RiskLevel.medium
    else:
        risk = RiskLevel.high

    # Penalización por ubicación extranjera
    if ubicacion and "México" not in ubicacion and "Mexico" not in ubicacion:
        if risk == RiskLevel.low:
            risk = RiskLevel.medium
        elif risk == RiskLevel.medium:
            risk = RiskLevel.high

    # Penalización por acumulado alto
    if total_donado_previo + monto > Decimal("5000000"):
        risk = RiskLevel.high
        requiere_kyc = True

    return risk, requiere_kyc
