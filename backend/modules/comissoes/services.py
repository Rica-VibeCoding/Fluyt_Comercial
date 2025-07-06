"""
Service para Regras de Comissão
Contém lógica de negócio para gerenciamento de comissões
"""

from supabase import Client
from typing import Dict, Any, List, Optional
from uuid import UUID
from datetime import datetime

from core.exceptions import ValidationException, BusinessRuleException
from .repository import ComissoesRepository
from .schemas import (
    RegraComissaoCreate,
    RegraComissaoUpdate,
    RegraComissaoResponse,
    RegraComissaoListResponse,
    CalculoComissaoResponse
)


class ComissoesService:
    """Service para gerenciar regras de comissão"""
    
    def __init__(self, db: Client):
        self.repository = ComissoesRepository(db)
    
    def listar_regras(self, filtros: Dict[str, Any] = None, page: int = 1, limit: int = 20) -> RegraComissaoListResponse:
        """Lista regras de comissão com filtros"""
        regras, total = self.repository.listar(filtros, page, limit)
        
        # Converter para response models
        items = [RegraComissaoResponse(**self._converter_para_frontend(regra)) for regra in regras]
        
        pages = (total + limit - 1) // limit
        
        return RegraComissaoListResponse(
            items=items,
            total=total,
            page=page,
            limit=limit,
            pages=pages
        )
    
    def buscar_por_id(self, regra_id: str) -> Optional[RegraComissaoResponse]:
        """Busca regra por ID"""
        regra = self.repository.buscar_por_id(regra_id)
        
        if regra:
            return RegraComissaoResponse(**self._converter_para_frontend(regra))
        
        return None
    
    def criar_regra(self, dados: RegraComissaoCreate) -> RegraComissaoResponse:
        """Cria nova regra de comissão"""
        # Validações de negócio
        self._validar_regra_comissao(dados.model_dump())
        
        # Verificar sobreposição
        if self.repository.verificar_sobreposicao(dados.model_dump()):
            raise ValidationException("Existe sobreposição com outra regra ativa do mesmo tipo")
        
        # Gerar próxima ordem automaticamente
        ordem = self.repository.obter_proxima_ordem(dados.tipo_comissao, str(dados.loja_id))
        
        # Converter para formato do banco
        dados_banco = self._converter_para_banco(dados.model_dump())
        dados_banco['ordem'] = ordem
        dados_banco['created_at'] = datetime.now().isoformat()
        dados_banco['updated_at'] = datetime.now().isoformat()
        
        regra_criada = self.repository.criar(dados_banco)
        
        return RegraComissaoResponse(**self._converter_para_frontend(regra_criada))
    
    def atualizar_regra(self, regra_id: str, dados: RegraComissaoUpdate) -> Optional[RegraComissaoResponse]:
        """Atualiza regra existente"""
        # Buscar regra atual
        regra_atual = self.repository.buscar_por_id(regra_id)
        if not regra_atual:
            return None
        
        # Aplicar apenas campos fornecidos
        dados_atualizacao = {k: v for k, v in dados.model_dump().items() if v is not None}
        
        if dados_atualizacao:
            # Validar dados atualizados
            dados_completos = regra_atual.copy()
            dados_completos.update(dados_atualizacao)
            self._validar_regra_comissao(dados_completos)
            
            # Verificar sobreposição (excluindo regra atual)
            if self.repository.verificar_sobreposicao(dados_completos, regra_id):
                raise ValidationException("Existe sobreposição com outra regra ativa do mesmo tipo")
            
            # Converter para formato do banco
            dados_banco = self._converter_para_banco(dados_atualizacao)
            dados_banco['updated_at'] = datetime.now().isoformat()
            
            regra_atualizada = self.repository.atualizar(regra_id, dados_banco)
            return RegraComissaoResponse(**self._converter_para_frontend(regra_atualizada))
        
        return RegraComissaoResponse(**self._converter_para_frontend(regra_atual))
    
    def excluir_regra(self, regra_id: str) -> bool:
        """Exclui regra (soft delete)"""
        return self.repository.excluir(regra_id)
    
    def alternar_status(self, regra_id: str) -> Optional[RegraComissaoResponse]:
        """Alterna status ativo/inativo"""
        regra = self.repository.buscar_por_id(regra_id)
        if not regra:
            return None
        
        novo_status = not regra['ativo']
        dados_atualizacao = {
            'ativo': novo_status,
            'updated_at': datetime.now().isoformat()
        }
        
        regra_atualizada = self.repository.atualizar(regra_id, dados_atualizacao)
        return RegraComissaoResponse(**self._converter_para_frontend(regra_atualizada))
    
    def calcular_comissao(self, valor: float, tipo_comissao: str, loja_id: UUID) -> Optional[CalculoComissaoResponse]:
        """Calcula comissão para um valor específico"""
        regras = self.repository.buscar_regras_ativas_por_tipo(tipo_comissao, str(loja_id))
        
        # Encontrar regra aplicável
        for regra in regras:
            valor_min = regra['valor_minimo']
            valor_max = regra['valor_maximo']
            
            # Se valor_maximo é None, considerar infinito
            if valor_max is None:
                valor_max = float('inf')
            
            if valor_min <= valor <= valor_max:
                valor_comissao = (valor * regra['percentual']) / 100
                
                return CalculoComissaoResponse(
                    valor_venda=valor,
                    percentual_aplicado=regra['percentual'],
                    valor_comissao=valor_comissao,
                    regra_id=regra['id'],
                    regra_descricao=regra.get('descricao')
                )
        
        return None
    
    def listar_tipos_por_loja(self, loja_id: UUID) -> List[str]:
        """Lista tipos de comissão únicos para uma loja"""
        regras, _ = self.repository.listar({'loja_id': loja_id, 'ativo': True})
        tipos = list(set(regra['tipo_comissao'] for regra in regras))
        return sorted(tipos)
    
    def _validar_regra_comissao(self, dados: Dict[str, Any]) -> None:
        """Validações de negócio para regras de comissão"""
        # Validar valor mínimo
        if dados.get('valor_minimo', 0) < 0:
            raise ValidationException("Valor mínimo deve ser maior ou igual a zero")
        
        # Validar valor máximo vs mínimo
        valor_max = dados.get('valor_maximo')
        valor_min = dados.get('valor_minimo', 0)
        
        if valor_max is not None and valor_max <= valor_min:
            raise ValidationException("Valor máximo deve ser maior que valor mínimo")
        
        # Validar percentual
        percentual = dados.get('percentual', 0)
        if percentual <= 0 or percentual > 100:
            raise ValidationException("Percentual deve estar entre 0.01% e 100%")
        
        # Validar tipo de comissão
        tipos_validos = ['VENDEDOR', 'GERENTE', 'SUPERVISOR']
        if dados.get('tipo_comissao') not in tipos_validos:
            raise ValidationException(f"Tipo de comissão deve ser um de: {', '.join(tipos_validos)}")
    
    def _converter_para_banco(self, dados: Dict[str, Any]) -> Dict[str, Any]:
        """Converte dados do frontend (camelCase) para formato do banco (snake_case)"""
        mapeamento = {
            'tipo': 'tipo_comissao',
            'valorMinimo': 'valor_minimo',
            'valorMaximo': 'valor_maximo',
            'lojaId': 'loja_id'
        }
        
        dados_banco = {}
        for key, value in dados.items():
            # Mapear campo se existe mapeamento, senão usar key original
            campo_banco = mapeamento.get(key, key)
            dados_banco[campo_banco] = value
        
        # Converter UUID para string se necessário
        if 'loja_id' in dados_banco and isinstance(dados_banco['loja_id'], UUID):
            dados_banco['loja_id'] = str(dados_banco['loja_id'])
        
        return dados_banco
    
    def _converter_para_frontend(self, dados: Dict[str, Any]) -> Dict[str, Any]:
        """Converte dados do banco (snake_case) para formato do frontend (camelCase)"""
        # Garantir que todos os campos estão presentes para o Response model
        return {
            'id': dados.get('id'),
            'loja_id': dados.get('loja_id'),
            'tipo_comissao': dados.get('tipo_comissao'),
            'valor_minimo': dados.get('valor_minimo'),
            'valor_maximo': dados.get('valor_maximo'),
            'percentual': dados.get('percentual'),
            'ordem': dados.get('ordem'),
            'ativo': dados.get('ativo'),
            'descricao': dados.get('descricao'),
            'created_at': dados.get('created_at'),
            'updated_at': dados.get('updated_at'),
            'loja_nome': dados.get('loja_nome')
        }