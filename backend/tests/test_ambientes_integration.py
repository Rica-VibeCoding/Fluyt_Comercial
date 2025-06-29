"""
Testes de Integração - Módulo Ambientes
Testa o fluxo completo: CRUD, consistência entre camadas, performance
"""
import pytest
import asyncio
from datetime import datetime, date, time
from decimal import Decimal
import time as time_module

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


class TestAmbienteIntegracaoCompleta:
    """
    Testes de integração completa do módulo Ambientes
    """
    
    @pytest.fixture
    async def setup_completo(self):
        """Setup completo para testes de integração"""
        db = get_supabase_client()
        repository = AmbienteRepository(db)
        service = AmbienteService(db)
        
        return {
            'db': db,
            'repository': repository,
            'service': service
        }
    
    @pytest.fixture
    def dados_ambiente_completo(self):
        """Dados completos para teste de integração"""
        timestamp = datetime.now().strftime("%H%M%S")
        return {
            'cliente_id': f'cliente-integracao-{timestamp}',
            'nome': f'Ambiente Integração {timestamp}',
            'valor_custo_fabrica': Decimal('1800.00'),
            'valor_venda': Decimal('3200.00'),
            'data_importacao': date.today(),
            'hora_importacao': time(15, 45),
            'origem': 'xml'
        }
    
    async def test_fluxo_crud_completo(self, setup_completo, dados_ambiente_completo):
        """Testa fluxo CRUD completo através de todas as camadas"""
        print("\n🔄 [INTEGRAÇÃO] Testando CRUD completo...")
        
        service = setup_completo['service']
        ambiente_id = None
        
        try:
            # 1. CREATE - Criar ambiente
            print("  📝 Criando ambiente...")
            ambiente_create = AmbienteCreate(**dados_ambiente_completo)
            ambiente_criado = await service.criar_ambiente(ambiente_create)
            ambiente_id = ambiente_criado.id
            
            assert ambiente_criado.id is not None
            assert ambiente_criado.nome == dados_ambiente_completo['nome']
            assert ambiente_criado.cliente_id == dados_ambiente_completo['cliente_id']
            print(f"  ✅ Ambiente criado: {ambiente_criado.id}")
            
            # 2. READ - Buscar ambiente criado
            print("  🔍 Buscando ambiente criado...")
            ambiente_encontrado = await service.buscar_ambiente_por_id(ambiente_id)
            
            assert ambiente_encontrado.id == ambiente_id
            assert ambiente_encontrado.nome == dados_ambiente_completo['nome']
            print(f"  ✅ Ambiente encontrado: {ambiente_encontrado.nome}")
            
            # 3. UPDATE - Atualizar ambiente
            print("  ✏️ Atualizando ambiente...")
            dados_atualizacao = AmbienteUpdate(
                nome='Ambiente Atualizado Integração',
                valor_venda=Decimal('3500.00')
            )
            ambiente_atualizado = await service.atualizar_ambiente(ambiente_id, dados_atualizacao)
            
            assert ambiente_atualizado.nome == 'Ambiente Atualizado Integração'
            assert ambiente_atualizado.valor_venda == Decimal('3500.00')
            print(f"  ✅ Ambiente atualizado: {ambiente_atualizado.nome}")
            
            # 4. READ após UPDATE - Verificar persistência
            print("  🔍 Verificando persistência da atualização...")
            ambiente_verificado = await service.buscar_ambiente_por_id(ambiente_id)
            
            assert ambiente_verificado.nome == 'Ambiente Atualizado Integração'
            assert ambiente_verificado.valor_venda == Decimal('3500.00')
            print("  ✅ Atualização persistida corretamente")
            
            # 5. DELETE - Excluir ambiente
            print("  🗑️ Excluindo ambiente...")
            await service.excluir_ambiente(ambiente_id)
            print("  ✅ Ambiente excluído")
            
            # 6. READ após DELETE - Verificar exclusão
            print("  🔍 Verificando exclusão...")
            with pytest.raises(NotFoundException):
                await service.buscar_ambiente_por_id(ambiente_id)
            print("  ✅ Exclusão confirmada - ambiente não encontrado")
            
            ambiente_id = None  # Marca como excluído
            
        except Exception as e:
            print(f"  ❌ Erro no CRUD: {e}")
            raise
        finally:
            # Limpeza de segurança
            if ambiente_id:
                try:
                    await service.excluir_ambiente(ambiente_id)
                except:
                    pass
        
        print("✅ CRUD completo testado com sucesso")
    
    async def test_consistencia_entre_camadas(self, setup_completo, dados_ambiente_completo):
        """Testa consistência entre Repository e Service"""
        print("\n🔄 [INTEGRAÇÃO] Testando consistência entre camadas...")
        
        repository = setup_completo['repository']
        service = setup_completo['service']
        ambiente_id = None
        
        try:
            # Cria via service
            ambiente_create = AmbienteCreate(**dados_ambiente_completo)
            ambiente_service = await service.criar_ambiente(ambiente_create)
            ambiente_id = ambiente_service.id
            
            # Busca via repository
            ambiente_repository = await repository.buscar_por_id(ambiente_id)
            
            # Verifica consistência
            assert ambiente_service.id == ambiente_repository['id']
            assert ambiente_service.nome == ambiente_repository['nome']
            assert ambiente_service.cliente_id == ambiente_repository['cliente_id']
            assert float(ambiente_service.valor_venda) == float(ambiente_repository['valor_venda'])
            
            print("✅ Consistência entre camadas verificada")
            
        finally:
            if ambiente_id:
                await service.excluir_ambiente(ambiente_id)
    
    async def test_filtros_e_paginacao_integrados(self, setup_completo):
        """Testa filtros e paginação funcionando juntos"""
        print("\n🔄 [INTEGRAÇÃO] Testando filtros + paginação...")
        
        service = setup_completo['service']
        ambientes_criados = []
        
        try:
            # Cria múltiplos ambientes para teste
            for i in range(5):
                dados = AmbienteCreate(
                    cliente_id=f'cliente-filtro-{i}',
                    nome=f'Ambiente Filtro {i}',
                    valor_venda=Decimal(str(1000 + (i * 500))),  # 1000, 1500, 2000, 2500, 3000
                    origem='manual' if i % 2 == 0 else 'xml'
                )
                ambiente = await service.criar_ambiente(dados)
                ambientes_criados.append(ambiente.id)
            
            # Teste 1: Filtro por valor + paginação
            filtros = AmbienteFiltros(
                valor_min=1500.0,
                valor_max=2500.0,
                page=1,
                per_page=2
            )
            resultado = await service.listar_ambientes(filtros)
            
            assert len(resultado.items) <= 2  # Paginação
            for ambiente in resultado.items:
                if ambiente.valor_venda:
                    assert float(ambiente.valor_venda) >= 1500.0
                    assert float(ambiente.valor_venda) <= 2500.0
            
            # Teste 2: Filtro por origem
            filtros_origem = AmbienteFiltros(
                origem='manual',
                page=1,
                per_page=10
            )
            resultado_origem = await service.listar_ambientes(filtros_origem)
            
            for ambiente in resultado_origem.items:
                if ambiente.origem:
                    assert ambiente.origem == 'manual'
            
            print("✅ Filtros e paginação integrados funcionando")
            
        finally:
            # Limpeza
            for ambiente_id in ambientes_criados:
                try:
                    await service.excluir_ambiente(ambiente_id)
                except:
                    pass
    
    async def test_materiais_ambiente_integrado(self, setup_completo, dados_ambiente_completo):
        """Testa funcionalidade de materiais integrada"""
        print("\n🔄 [INTEGRAÇÃO] Testando materiais de ambiente...")
        
        service = setup_completo['service']
        ambiente_id = None
        
        try:
            # Cria ambiente
            ambiente_create = AmbienteCreate(**dados_ambiente_completo)
            ambiente_criado = await service.criar_ambiente(ambiente_create)
            ambiente_id = ambiente_criado.id
            
            # Cria material para o ambiente
            material_data = AmbienteMaterialCreate(
                material_data={
                    'nome': 'Porta Principal',
                    'categoria': 'Portas',
                    'quantidade': 1,
                    'valor_unitario': 800.00,
                    'observacoes': 'Porta de entrada principal'
                }
            )
            
            material_criado = await service.criar_material_ambiente(ambiente_id, material_data)
            
            assert material_criado.ambiente_id == ambiente_id
            assert material_criado.material_data['nome'] == 'Porta Principal'
            assert material_criado.material_data['valor_unitario'] == 800.00
            
            # Busca materiais do ambiente
            materiais = await service.obter_materiais_ambiente(ambiente_id)
            
            assert len(materiais) >= 1
            assert any(m.material_data['nome'] == 'Porta Principal' for m in materiais)
            
            print("✅ Materiais de ambiente funcionando")
            
        finally:
            if ambiente_id:
                await service.excluir_ambiente(ambiente_id)
    
    async def test_performance_basica(self, setup_completo):
        """Testa performance básica das operações"""
        print("\n🔄 [INTEGRAÇÃO] Testando performance básica...")
        
        service = setup_completo['service']
        
        # Teste de listagem
        start_time = time_module.time()
        filtros = AmbienteFiltros(page=1, per_page=20)
        resultado = await service.listar_ambientes(filtros)
        listagem_time = time_module.time() - start_time
        
        assert listagem_time < 5.0  # Deve ser menor que 5 segundos
        print(f"  ✅ Listagem: {listagem_time:.3f}s")
        
        # Teste de criação/exclusão rápida
        dados = AmbienteCreate(
            cliente_id='cliente-performance',
            nome='Ambiente Performance',
            origem='manual'
        )
        
        start_time = time_module.time()
        ambiente = await service.criar_ambiente(dados)
        criacao_time = time_module.time() - start_time
        
        start_time = time_module.time()
        await service.excluir_ambiente(ambiente.id)
        exclusao_time = time_module.time() - start_time
        
        assert criacao_time < 3.0  # Deve ser menor que 3 segundos
        assert exclusao_time < 2.0  # Deve ser menor que 2 segundos
        
        print(f"  ✅ Criação: {criacao_time:.3f}s")
        print(f"  ✅ Exclusão: {exclusao_time:.3f}s")
        print("✅ Performance básica aprovada")
    
    async def test_casos_extremos(self, setup_completo):
        """Testa casos extremos e edge cases"""
        print("\n🔄 [INTEGRAÇÃO] Testando casos extremos...")
        
        service = setup_completo['service']
        
        # Teste 1: Busca por ID inexistente
        with pytest.raises(NotFoundException):
            await service.buscar_ambiente_por_id('id-inexistente-123')
        
        # Teste 2: Atualização de ID inexistente
        with pytest.raises(NotFoundException):
            dados_update = AmbienteUpdate(nome='Teste')
            await service.atualizar_ambiente('id-inexistente-123', dados_update)
        
        # Teste 3: Exclusão de ID inexistente
        with pytest.raises(NotFoundException):
            await service.excluir_ambiente('id-inexistente-123')
        
        # Teste 4: Filtros com valores extremos
        filtros_extremos = AmbienteFiltros(
            valor_min=999999.0,
            valor_max=1000000.0,
            page=1,
            per_page=100
        )
        resultado = await service.listar_ambientes(filtros_extremos)
        assert isinstance(resultado.items, list)  # Deve retornar lista vazia
        
        print("✅ Casos extremos tratados corretamente")


# Função principal para executar os testes
async def main():
    """Executa todos os testes de integração"""
    print("🧪 INICIANDO TESTES DE INTEGRAÇÃO - MÓDULO AMBIENTES")
    print("=" * 60)
    
    # Configuração de testes
    pytest.main([
        __file__,
        "-v",
        "--tb=short",
        "--asyncio-mode=auto"
    ])
    
    print("\n" + "=" * 60)
    print("✅ TESTES DE INTEGRAÇÃO CONCLUÍDOS")


if __name__ == "__main__":
    asyncio.run(main()) 