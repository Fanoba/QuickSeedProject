# QuickSeed – Backend FastAPI

## Stack
- **FastAPI** + **Uvicorn**
- **SQLAlchemy 2.0** (async) + **aiomysql**
- **MySQL 8+**
- **JWT** (python-jose) + **bcrypt** (passlib)

## Estructura
```
app/
├── main.py                  # Entrypoint FastAPI
├── api/
│   └── v1/
│       ├── router.py        # Agrega todos los routers
│       └── routes/
│           ├── auth.py      # Login, refresh, /me
│           ├── usuarios.py  # CRUD donantes
│           ├── proyectos.py # CRUD proyectos + categorías
│           ├── donaciones.py# Crear donación, cambio de status, historial
│           ├── alertas.py   # Alertas AML
│           ├── kyc.py       # Documentos KYC por usuario
│           └── analytics.py # Dashboard stats
├── core/
│   ├── config.py            # Settings desde .env
│   └── security.py          # JWT + bcrypt
├── db/
│   └── session.py           # Engine async + get_db dependency
├── models/
│   └── models.py            # ORM SQLAlchemy
├── schemas/
│   ├── usuario.py
│   ├── proyecto.py
│   ├── donacion.py
│   └── alerta.py
├── services/
│   └── aml.py               # Lógica AML/KYC risk scoring
└── utils/
    └── deps.py              # get_current_user, require_admin
```

## Setup paso a paso

### 1. MySQL – crear usuario y base de datos
```bash
mysql -u root -p < mysql_setup.sql
```

### 2. Entorno Python
```bash
python -m venv .venv
source .venv/bin/activate      # Windows: .venv\Scripts\activate
pip install -r requirements.txt
```

### 3. Variables de entorno
```bash
cp .env.example .env
# Editar .env con tus credenciales si son distintas
```

### 4. Arrancar el servidor
```bash
uvicorn app.main:app --reload --host 0.0.0.0 --port 8000
```

> En modo `dev`, las tablas se crean automáticamente al iniciar.  
> Para producción usar Alembic.

## Endpoints principales

| Método | Ruta | Auth | Descripción |
|--------|------|------|-------------|
| POST | `/api/v1/auth/login` | ❌ | Login |
| POST | `/api/v1/auth/refresh` | ❌ | Renovar token |
| GET | `/api/v1/auth/me` | ✅ | Usuario actual |
| GET | `/api/v1/proyectos` | ❌ | Lista proyectos |
| POST | `/api/v1/donaciones` | ✅ donante | Crear donación |
| GET | `/api/v1/donaciones` | ✅ admin | Todas las donaciones |
| PATCH | `/api/v1/donaciones/{id}/status` | ✅ admin | Aprobar/rechazar |
| GET | `/api/v1/alertas` | ✅ admin | Alertas AML |
| GET | `/api/v1/analytics/summary` | ✅ admin | KPIs dashboard |
| GET | `/api/v1/kyc/{user_id}` | ✅ | Docs KYC |

Docs interactivas: `http://localhost:8000/api/v1/docs`
