"""
API Principal do Sistema Fluyt Comercial
"""
import logging
import time
from contextlib import asynccontextmanager
from typing import Dict, Any

from fastapi import FastAPI, Request, status
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse
from fastapi.exceptions import RequestValidationError
from starlette.exceptions import HTTPException as StarletteHTTPException

# Rate limiting
from slowapi import _rate_limit_exceeded_handler
from slowapi.errors import RateLimitExceeded
from core.rate_limiter import limiter

from core.config import settings
from core.database import get_supabase
from core.exceptions import FlytException

# Configuração de logging
logging.basicConfig(
    level=getattr(logging, settings.log_level.upper()),
    format='%(asctime)s - %(name)s - %(levelname)s - %(message)s'
)
logger = logging.getLogger(__name__)


@asynccontextmanager
async def lifespan(app: FastAPI):
    """Gerencia o ciclo de vida da aplicação"""
    # Startup
    logger.info(f"Starting Fluyt API - Environment: {settings.environment}")
    logger.info(f"Supabase URL: {settings.supabase_url}")
    
    # Verifica conexão com banco
    health = await get_supabase().health_check()
    if health["status"] == "healthy":
        logger.info("Database connection successful")
    else:
        logger.error(f"Database connection failed: {health.get('error')}")
    
    yield
    
    # Shutdown
    logger.info("Shutting down Fluyt API")


# Criação da aplicação
app = FastAPI(
    title="Fluyt Comercial API",
    description="API para gestão comercial de móveis planejados",
    version="1.0.0",
    docs_url=f"{settings.api_prefix}/docs",
    redoc_url=f"{settings.api_prefix}/redoc",
    openapi_url=f"{settings.api_prefix}/openapi.json",
    lifespan=lifespan
)

# Adiciona o rate limiter à aplicação
app.state.limiter = limiter
app.add_exception_handler(RateLimitExceeded, _rate_limit_exceeded_handler)

# CORS Middleware
app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.cors_origins_list,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
    expose_headers=["X-Request-ID", "X-Process-Time"]
)


# Middleware customizado
@app.middleware("http")
async def add_process_time_header(request: Request, call_next):
    """Adiciona headers de debug e métricas"""
    start_time = time.time()
    
    # Gera ID único para a requisição
    import uuid
    request_id = str(uuid.uuid4())
    
    # Adiciona ao state para uso em logs
    request.state.request_id = request_id
    
    # Log da requisição
    logger.info(
        f"REQUEST: {request.method} {request.url.path}",
        extra={
            "request_id": request_id,
            "method": request.method,
            "path": request.url.path,
            "client": request.client.host if request.client else None
        }
    )
    
    # Processa requisição
    response = await call_next(request)
    
    # Calcula tempo de processamento
    process_time = time.time() - start_time
    
    # Adiciona headers
    response.headers["X-Request-ID"] = request_id
    response.headers["X-Process-Time"] = str(process_time)
    response.headers["X-Environment"] = settings.environment
    
    # Log da resposta
    logger.info(
        f"RESPONSE: {response.status_code} in {process_time:.3f}s",
        extra={
            "request_id": request_id,
            "status_code": response.status_code,
            "process_time": process_time
        }
    )
    
    return response


# Exception handlers
@app.exception_handler(FlytException)
async def flyt_exception_handler(request: Request, exc: FlytException):
    """Handler para exceções customizadas do sistema"""
    return JSONResponse(
        status_code=exc.status_code,
        content={
            "success": False,
            "error": exc.error_code or "ERROR",
            "message": exc.detail,
            "request_id": getattr(request.state, "request_id", None)
        },
        headers=exc.headers
    )


@app.exception_handler(StarletteHTTPException)
async def http_exception_handler(request: Request, exc: StarletteHTTPException):
    """Handler para exceções HTTP padrão"""
    return JSONResponse(
        status_code=exc.status_code,
        content={
            "success": False,
            "error": f"HTTP_{exc.status_code}",
            "message": exc.detail,
            "request_id": getattr(request.state, "request_id", None)
        }
    )


@app.exception_handler(RequestValidationError)
async def validation_exception_handler(request: Request, exc: RequestValidationError):
    """Handler para erros de validação do Pydantic"""
    return JSONResponse(
        status_code=status.HTTP_422_UNPROCESSABLE_ENTITY,
        content={
            "success": False,
            "error": "VALIDATION_ERROR",
            "message": "Erro de validação nos dados enviados",
            "details": exc.errors(),
            "request_id": getattr(request.state, "request_id", None)
        }
    )


# Rotas base
@app.get("/", tags=["Root"])
async def root() -> Dict[str, Any]:
    """Informações básicas da API"""
    return {
        "name": "Fluyt Comercial API",
        "version": "1.0.0",
        "environment": settings.environment,
        "docs": f"{settings.api_prefix}/docs",
        "health": "/health"
    }


@app.get("/health", tags=["Health"])
async def health_check() -> Dict[str, Any]:
    """Verifica saúde da aplicação"""
    db_health = await get_supabase().health_check()
    
    return {
        "status": db_health["status"],
        "timestamp": time.time(),
        "environment": settings.environment,
        "database": db_health["database"],
        "version": "1.0.0"
    }


# Importar e registrar routers dos módulos
from modules.auth.controller import router as auth_router
from modules.clientes.controller import router as clientes_router
from modules.empresas.controller import router as empresas_router
from modules.lojas.controller import router as lojas_router
from modules.status_orcamento.controller import router as status_router
from modules.equipe.controller import router as equipe_router

# Registrar routers na aplicação
app.include_router(auth_router, prefix="/api/v1/auth")
app.include_router(clientes_router, prefix="/api/v1")
app.include_router(empresas_router, prefix="/api/v1")
app.include_router(lojas_router, prefix="/api/v1")
app.include_router(status_router, prefix="/api/v1")
app.include_router(equipe_router, prefix="/api/v1")


# Execução direta (desenvolvimento)
if __name__ == "__main__":
    import uvicorn
    
    # Configurações otimizadas para estabilidade
    uvicorn_config = {
        "app": "main:app",
        "host": "0.0.0.0",
        "port": 8000,
        "reload": settings.is_development,
        "log_level": settings.log_level.lower(),
        "access_log": True,
        "use_colors": True,
        "reload_delay": 5.0,  # Aumentado para evitar reloads excessivos
        "reload_dirs": ["modules/", "core/"],  # Limita diretórios monitorados
        "reload_excludes": ["logs/", "temp/", "uploads/", "__pycache__/", "*.pyc"],
        "workers": 1,  # Força single worker para evitar conflitos
        "timeout_keep_alive": 10,  # Aumentado para conexões mais estáveis
        "limit_concurrency": 100,  # Limita conexões simultâneas
        "limit_max_requests": 5000,  # Aumentado para evitar reinicializações frequentes
    }
    
    if settings.is_development:
        logger.info("🔧 Configurações de desenvolvimento otimizadas aplicadas")
        logger.info(f"   - Reload delay: {uvicorn_config['reload_delay']}s")
        logger.info(f"   - Diretórios monitorados: {uvicorn_config['reload_dirs']}")
        logger.info(f"   - Arquivos excluídos: {uvicorn_config['reload_excludes']}")
    
    uvicorn.run(**uvicorn_config)