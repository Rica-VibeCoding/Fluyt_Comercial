# FastAPI routes for status_orcamento
from fastapi import APIRouter, Depends
from .schemas import *

router = APIRouter(prefix='/status_orcamento', tags=['status_orcamento'])

@router.get('/', response_model=list[dict])
async def list_status_orcamento():
    # TODO: Implementar quando o repository for criado
    return []
