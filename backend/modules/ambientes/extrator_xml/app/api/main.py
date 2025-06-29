"""
API FastAPI - Endpoints para extração XML

Autor: Ricardo Borges - 2025
"""

import os
from typing import Optional, List
from fastapi import FastAPI, HTTPException, UploadFile, File, Form
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse
import json

from app.models import (
    ExtractionRequest,
    ExtractionResult,
    ValidationResult,
    SectionEnum
)
from app.extractors import XMLExtractor

# Configuração da aplicação
app = FastAPI(
    title="Extrator XML Promob",
    description="API para extração de dados estruturados de arquivos XML do Promob",
    version="1.0.0",
    docs_url="/docs",
    redoc_url="/redoc"
)

# Configurar CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # Em produção, especificar origens permitidas
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Servir arquivos estáticos com middleware no-cache
from fastapi.staticfiles import StaticFiles
from starlette.middleware.base import BaseHTTPMiddleware

class NoCacheMiddleware(BaseHTTPMiddleware):
    async def dispatch(self, request, call_next):
        response = await call_next(request)
        if request.url.path.startswith("/static/"):
            response.headers["Cache-Control"] = "no-cache, no-store, must-revalidate"
            response.headers["Pragma"] = "no-cache"
            response.headers["Expires"] = "0"
        return response

app.add_middleware(NoCacheMiddleware)
app.mount("/static", StaticFiles(directory="app/static"), name="static")

# Removido: instância global causava problemas de estado entre requisições


@app.get("/")
async def root():
    """Endpoint raiz - redireciona para interface web"""
    from fastapi.responses import RedirectResponse
    return RedirectResponse(url="/static/index.html")


@app.get("/debug")
async def debug_page():
    """Página de debug para diagnóstico de problemas"""
    from fastapi.responses import FileResponse
    return FileResponse('app/static/debug.html')


@app.get("/health")
async def health_check():
    """Verifica o status da API"""
    return {
        "status": "healthy",
        "service": "Extrator XML Promob",
        "version": "1.0.0"
    }


@app.post("/api/extract", response_model=ExtractionResult)
async def extract_xml(request: ExtractionRequest):
    """
    Extrai dados de um XML fornecido como string
    
    Args:
        request: Objeto com xml_content e sections opcionais
        
    Returns:
        ExtractionResult com dados extraídos
    """
    try:
        # Converter enum para string se necessário
        sections = None
        if request.extract_sections:
            sections = [s.value if isinstance(s, SectionEnum) else s 
                       for s in request.extract_sections]
        
        # Criar nova instância do extrator para cada requisição
        extractor = XMLExtractor()
        # Executar extração
        result = extractor.extract(request.xml_content, sections)
        
        return result
        
    except Exception as e:
        raise HTTPException(
            status_code=500,
            detail=f"Erro ao processar XML: {str(e)}"
        )


@app.post("/api/extract-xml")
async def extract_xml_file_legacy(file: UploadFile = File(...)):
    """Endpoint legado para compatibilidade - redireciona para extract-file"""
    return await extract_xml_file(file)

@app.post("/api/extract-file", response_model=ExtractionResult)
async def extract_xml_file(
    file: UploadFile = File(...),
    sections: Optional[str] = Form(None)
):
    """
    Extrai dados de um arquivo XML enviado
    
    Args:
        file: Arquivo XML
        sections: Lista de seções em formato JSON (opcional)
        
    Returns:
        ExtractionResult com dados extraídos
    """
    try:
        # Validar tipo de arquivo
        if not file.filename.endswith('.xml'):
            raise HTTPException(
                status_code=400,
                detail="Arquivo deve ser XML"
            )
        
        # Ler conteúdo do arquivo
        content = await file.read()
        xml_content = content.decode('utf-8')
        
        # Processar seções se fornecidas
        sections_list = None
        if sections:
            try:
                sections_list = json.loads(sections)
            except:
                # Tentar como lista separada por vírgula
                sections_list = [s.strip() for s in sections.split(',')]
        
        # Criar nova instância do extrator para cada requisição
        extractor = XMLExtractor()
        # Executar extração
        result = extractor.extract(xml_content, sections_list)
        
        return result
        
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(
            status_code=500,
            detail=f"Erro ao processar arquivo: {str(e)}"
        )


@app.post("/api/validate", response_model=ValidationResult)
async def validate_xml(file: UploadFile = File(...)):
    """
    Valida um arquivo XML e retorna informações sobre seções disponíveis
    
    Args:
        file: Arquivo XML para validar
        
    Returns:
        ValidationResult com informações de validação
    """
    try:
        # Validar tipo de arquivo
        if not file.filename.endswith('.xml'):
            raise HTTPException(
                status_code=400,
                detail="Arquivo deve ser XML"
            )
        
        # Ler conteúdo
        content = await file.read()
        xml_content = content.decode('utf-8')
        
        # Validar XML
        # Criar nova instância do extrator para cada requisição
        extractor = XMLExtractor()
        validation_info = extractor.validate(xml_content)
        
        # Calcular tamanho do arquivo
        file_size_kb = len(content) / 1024
        
        return ValidationResult(
            valid=validation_info.get('valid', False),
            linha_detectada=validation_info.get('linha_detectada'),
            available_sections=validation_info.get('available_sections', []),
            file_size_kb=round(file_size_kb, 2),
            errors=validation_info.get('errors', [])
        )
        
    except HTTPException:
        raise
    except Exception as e:
        return ValidationResult(
            valid=False,
            errors=[str(e)],
            available_sections=[],
            file_size_kb=0
        )


# Tratamento global de erros
@app.exception_handler(Exception)
async def global_exception_handler(request, exc):
    """Tratamento global de exceções não capturadas"""
    return JSONResponse(
        status_code=500,
        content={
            "detail": "Erro interno do servidor",
            "error": str(exc) if os.getenv("DEBUG") == "True" else "Erro ao processar requisição"
        }
    ) 