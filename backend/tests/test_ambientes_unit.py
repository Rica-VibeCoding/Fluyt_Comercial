"""
Testes Unitários - Módulo Ambientes
Testa cada componente separadamente: Repository, Services, Validações
"""
import pytest
import asyncio
from datetime import datetime, date, time
from decimal import Decimal
from unittest.mock import Mock, patch

# Configuração do event loop para testes async
pytest_plugins = ('pytest_asyncio',)

# Importações do projeto
from core.database import get_supabase_client
from core.exceptions import NotFoundException, ValidationException, DatabaseException

from modules.ambientes.repository import AmbienteRepository
from modules.ambientes.service import AmbienteService
from modules.ambientes.schemas import (
    AmbienteCreate, AmbienteUpdate, AmbienteFiltros,
    AmbienteMaterialCreate
)


class TestAmbienteRepository:
    """
    Testes da camada Repository - acesso direto ao banco
    """
    
    @pytest.fixture
    async def repository(self):
        """Fixture para repository"""
        db = get_supabase_client()
        return AmbienteRepository(db)
    
    @pytest.fixture
    def dados_ambiente_teste(self):
        """Dados válidos para teste"""
        timestamp = datetime.now().strftime("%H%M%S")
        return {
            'cliente_id': 'cliente-test-uuid',
            'nome': f'Ambiente Teste {timestamp}',
            'valor_custo_fabrica': Decimal('1500.00'),
            'valor_venda': Decimal('2500.00'),
            'data_importacao': date.today(),
            'hora_importacao': time(14, 30),
            'origem': 'manual'
        }
    
    async def test_listar_ambientes(self, repository):
        """Testa listagem de ambientes com JOIN"""
        print("\n🔍 [REPOSITORY] Testando listagem de ambientes...")
        
        filtros = {
            'page': 1,
            'per_page': 10,
            'order_by': 'created_at',
            'order_direction': 'desc'
        }
        
        resultado = await repository.listar(**filtros)
        
        assert 'items' in resultado
        assert 'total' in resultado
        assert isinstance(resultado['items'], list)
        assert resultado['total'] >= 0
        
        # Verifica JOIN com clientes
        for ambiente in resultado['items']:
            if ambiente.get('cliente_nome'):  # Se há cliente associado
                assert 'cliente_nome' in ambiente
                assert 'cliente_email' in ambiente
        
        print(f"✅ Listagem OK: {resultado['total']} ambientes encontrados")
    
    async def test_criar_ambiente(self, repository, dados_ambiente_teste):
        """Testa criação de ambiente"""
        print("\n🔍 [REPOSITORY] Testando criação de ambiente...")
        
        # Cria o ambiente
        ambiente_criado = await repository.criar_ambiente(dados_ambiente_teste)
        
        assert ambiente_criado['id'] is not None
        assert ambiente_criado['nome'] == dados_ambiente_teste['nome']
        assert ambiente_criado['cliente_id'] == dados_ambiente_teste['cliente_id']
        assert ambiente_criado['origem'] == dados_ambiente_teste['origem']
        assert float(ambiente_criado['valor_venda']) == float(dados_ambiente_teste['valor_venda'])
        
        print(f"✅ Ambiente criado: {ambiente_criado['id']} - {ambiente_criado['nome']}")
        
        # Limpa o teste
        await repository.excluir_ambiente(ambiente_criado['id'])
        
        return ambiente_criado
    
    async def test_buscar_ambiente_por_id(self, repository, dados_ambiente_teste):
        """Testa busca de ambiente por ID"""
        print("\n🔍 [REPOSITORY] Testando busca por ID...")
        
        # Cria ambiente para teste
        ambiente_criado = await repository.criar_ambiente(dados_ambiente_teste)
        ambiente_id = ambiente_criado['id']
        
        # Busca o ambiente
        ambiente_encontrado = await repository.buscar_por_id(ambiente_id)
        
        assert ambiente_encontrado['id'] == ambiente_id
        assert ambiente_encontrado['nome'] == dados_ambiente_teste['nome']
        assert ambiente_encontrado['cliente_id'] == dados_ambiente_teste['cliente_id']
        
        print(f"✅ Ambiente encontrado: {ambiente_encontrado['nome']}")
        
        # Limpa o teste
        await repository.excluir_ambiente(ambiente_id)
    
    async def test_atualizar_ambiente(self, repository, dados_ambiente_teste):
        """Testa atualização de ambiente"""
        print("\n🔍 [REPOSITORY] Testando atualização...")
        
        # Cria ambiente para teste
        ambiente_criado = await repository.criar_ambiente(dados_ambiente_teste)
        ambiente_id = ambiente_criado['id']
        
        # Dados para atualização
        dados_atualizacao = {
            'nome': 'Ambiente Atualizado Teste',
            'valor_venda': Decimal('3000.00')
        }
        
        # Atualiza
        ambiente_atualizado = await repository.atualizar_ambiente(ambiente_id, dados_atualizacao)
        
        assert ambiente_atualizado['nome'] == dados_atualizacao['nome']
        assert float(ambiente_atualizado['valor_venda']) == float(dados_atualizacao['valor_venda'])
        
        print(f"✅ Ambiente atualizado: {ambiente_atualizado['nome']}")
        
        # Limpa o teste
        await repository.excluir_ambiente(ambiente_id)
    
    async def test_filtros_avancados(self, repository):
        """Testa filtros avançados de busca"""
        print("\n🔍 [REPOSITORY] Testando filtros avançados...")
        
        # Teste com filtro de valor
        filtros = {
            'valor_min': 1000.0,
            'valor_max': 5000.0,
            'origem': 'manual',
            'page': 1,
            'per_page': 5
        }
        
        resultado = await repository.listar(**filtros)
        
        assert isinstance(resultado['items'], list)
        assert resultado['total'] >= 0
        
        # Verifica se filtros foram aplicados
        for ambiente in resultado['items']:
            if ambiente.get('valor_venda'):
                assert float(ambiente['valor_venda']) >= filtros['valor_min']
                assert float(ambiente['valor_venda']) <= filtros['valor_max']
            if ambiente.get('origem'):
                assert ambiente['origem'] == filtros['origem']
        
        print(f"✅ Filtros aplicados: {len(resultado['items'])} ambientes filtrados")


class TestAmbienteService:
    """
    Testes da camada Service - lógica de negócio
    """
    
    @pytest.fixture
    async def service(self):
        """Fixture para service"""
        db = get_supabase_client()
        return AmbienteService(db)
    
    @pytest.fixture
    def dados_ambiente_valido(self):
        """Dados válidos para teste"""
        timestamp = datetime.now().strftime("%H%M%S")
        return AmbienteCreate(
            cliente_id='cliente-test-uuid',
            nome=f'Ambiente Service {timestamp}',
            valor_custo_fabrica=Decimal('1200.00'),
            valor_venda=Decimal('2000.00'),
            origem='manual'
        )
    
    async def test_listar_ambientes_service(self, service):
        """Testa listagem via service"""
        print("\n🔍 [SERVICE] Testando listagem via service...")
        
        filtros = AmbienteFiltros(
            page=1,
            per_page=10,
            order_by='created_at',
            order_direction='desc'
        )
        
        resultado = await service.listar_ambientes(filtros)
        
        assert hasattr(resultado, 'items')
        assert hasattr(resultado, 'total')
        assert hasattr(resultado, 'page')
        assert hasattr(resultado, 'per_page')
        assert isinstance(resultado.items, list)
        
        print(f"✅ Service listagem OK: {resultado.total} ambientes")
    
    async def test_criar_ambiente_service(self, service, dados_ambiente_valido):
        """Testa criação via service"""
        print("\n🔍 [SERVICE] Testando criação via service...")
        
        # Cria o ambiente
        ambiente_criado = await service.criar_ambiente(dados_ambiente_valido)
        
        assert ambiente_criado.id is not None
        assert ambiente_criado.nome == dados_ambiente_valido.nome
        assert ambiente_criado.cliente_id == dados_ambiente_valido.cliente_id
        assert ambiente_criado.origem == dados_ambiente_valido.origem
        
        print(f"✅ Ambiente criado via service: {ambiente_criado.nome}")
        
        # Limpa o teste
        await service.excluir_ambiente(ambiente_criado.id)
        
        return ambiente_criado
    
    async def test_validacoes_negocio(self, service):
        """Testa validações de regras de negócio"""
        print("\n🔍 [SERVICE] Testando validações de negócio...")
        
        # Teste 1: Nome obrigatório
        with pytest.raises(ValidationException):
            dados_invalidos = AmbienteCreate(
                cliente_id='cliente-test',
                nome='',  # Nome vazio
                origem='manual'
            )
            await service.criar_ambiente(dados_invalidos)
        
        # Teste 2: Cliente obrigatório
        with pytest.raises(ValidationException):
            dados_invalidos = AmbienteCreate(
                cliente_id='',  # Cliente vazio
                nome='Ambiente Teste',
                origem='manual'
            )
            await service.criar_ambiente(dados_invalidos)
        
        # Teste 3: Origem inválida
        with pytest.raises(ValidationException):
            dados_invalidos = AmbienteCreate(
                cliente_id='cliente-test',
                nome='Ambiente Teste',
                origem='origem_invalida'  # Origem inválida
            )
            await service.criar_ambiente(dados_invalidos)
        
        print("✅ Validações de negócio funcionando")
    
    async def test_filtros_service(self, service):
        """Testa filtros via service"""
        print("\n🔍 [SERVICE] Testando filtros via service...")
        
        # Filtros com validação
        filtros = AmbienteFiltros(
            nome='Teste',
            origem='manual',
            valor_min=100.0,
            valor_max=10000.0,
            page=1,
            per_page=20
        )
        
        resultado = await service.listar_ambientes(filtros)
        
        assert isinstance(resultado.items, list)
        assert resultado.total >= 0
        assert resultado.page == 1
        assert resultado.per_page == 20
        
        print(f"✅ Filtros service OK: {len(resultado.items)} resultados")


class TestAmbienteValidacoes:
    """
    Testes de validações de schemas
    """
    
    def test_schema_ambiente_create_valido(self):
        """Testa schema de criação válido"""
        print("\n🔍 [VALIDAÇÕES] Testando schema de criação válido...")
        
        dados_validos = {
            'cliente_id': 'cliente-uuid-valido',
            'nome': 'Ambiente Teste',
            'valor_custo_fabrica': 1500.00,
            'valor_venda': 2500.00,
            'origem': 'manual'
        }
        
        schema = AmbienteCreate(**dados_validos)
        
        assert schema.cliente_id == dados_validos['cliente_id']
        assert schema.nome == dados_validos['nome']
        assert schema.origem == dados_validos['origem']
        assert isinstance(schema.valor_custo_fabrica, Decimal)
        assert isinstance(schema.valor_venda, Decimal)
        
        print("✅ Schema de criação válido")
    
    def test_schema_ambiente_create_invalido(self):
        """Testa schema de criação inválido"""
        print("\n🔍 [VALIDAÇÕES] Testando schema de criação inválido...")
        
        # Teste 1: Nome obrigatório
        with pytest.raises(ValueError):
            AmbienteCreate(
                cliente_id='cliente-test',
                nome='',  # Nome vazio
                origem='manual'
            )
        
        # Teste 2: Origem inválida
        with pytest.raises(ValueError):
            AmbienteCreate(
                cliente_id='cliente-test',
                nome='Ambiente Teste',
                origem='origem_invalida'  # Origem inválida
            )
        
        # Teste 3: Valor negativo
        with pytest.raises(ValueError):
            AmbienteCreate(
                cliente_id='cliente-test',
                nome='Ambiente Teste',
                valor_venda=-100.00,  # Valor negativo
                origem='manual'
            )
        
        print("✅ Validações de schema funcionando")
    
    def test_schema_filtros_valido(self):
        """Testa schema de filtros válido"""
        print("\n🔍 [VALIDAÇÕES] Testando schema de filtros...")
        
        filtros = AmbienteFiltros(
            cliente_id='cliente-test',
            nome='Teste',
            origem='xml',
            valor_min=100.0,
            valor_max=5000.0,
            page=1,
            per_page=20,
            order_by='nome',
            order_direction='asc'
        )
        
        assert filtros.cliente_id == 'cliente-test'
        assert filtros.nome == 'Teste'
        assert filtros.origem == 'xml'
        assert filtros.valor_min == 100.0
        assert filtros.valor_max == 5000.0
        assert filtros.page == 1
        assert filtros.per_page == 20
        assert filtros.order_by == 'nome'
        assert filtros.order_direction == 'asc'
        
        print("✅ Schema de filtros válido")
    
    def test_schema_material_create(self):
        """Testa schema de material"""
        print("\n🔍 [VALIDAÇÕES] Testando schema de material...")
        
        material_data = {
            'nome': 'Porta de Madeira',
            'quantidade': 2,
            'valor_unitario': 150.00,
            'categoria': 'Portas'
        }
        
        material = AmbienteMaterialCreate(
            material_data=material_data
        )
        
        assert material.material_data == material_data
        assert isinstance(material.material_data, dict)
        
        print("✅ Schema de material válido")


# Função principal para executar os testes
async def main():
    """Executa todos os testes unitários"""
    print("🧪 INICIANDO TESTES UNITÁRIOS - MÓDULO AMBIENTES")
    print("=" * 60)
    
    # Configuração de testes
    pytest.main([
        __file__,
        "-v",
        "--tb=short",
        "--asyncio-mode=auto"
    ])
    
    print("\n" + "=" * 60)
    print("✅ TESTES UNITÁRIOS CONCLUÍDOS")


if __name__ == "__main__":
    asyncio.run(main()) 