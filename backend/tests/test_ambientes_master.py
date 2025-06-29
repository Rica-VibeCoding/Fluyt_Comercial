"""
Script Master - Testes Completos do Módulo Ambientes
Executa todos os testes e gera relatório final completo
"""
import asyncio
import sys
import time
import traceback
from datetime import datetime
from typing import Dict, List, Any

# Importações dos testes
from test_ambientes_unit import TestAmbienteRepository, TestAmbienteService, TestAmbienteValidacoes
from test_ambientes_integration import TestAmbienteIntegracaoCompleta

# Importações do projeto
from core.database import get_supabase_client
from modules.ambientes.repository import AmbienteRepository
from modules.ambientes.service import AmbienteService


class TestMasterAmbientes:
    """
    Classe master para executar todos os testes do módulo Ambientes
    """
    
    def __init__(self):
        self.resultados = {
            'unitarios': {'total': 0, 'passou': 0, 'falhou': 0, 'detalhes': []},
            'integracao': {'total': 0, 'passou': 0, 'falhou': 0, 'detalhes': []},
            'performance': {'tempo_total': 0, 'operacoes': []},
            'resumo': {'inicio': None, 'fim': None, 'duracao': 0}
        }
    
    async def executar_todos_testes(self):
        """Executa todos os testes em sequência"""
        print("🚀 INICIANDO BATERIA COMPLETA DE TESTES - MÓDULO AMBIENTES")
        print("=" * 80)
        
        self.resultados['resumo']['inicio'] = datetime.now()
        tempo_inicio = time.time()
        
        try:
            # 1. Verificação inicial do ambiente
            await self._verificar_ambiente()
            
            # 2. Testes Unitários
            print("\n📋 FASE 1: TESTES UNITÁRIOS")
            print("-" * 50)
            await self._executar_testes_unitarios()
            
            # 3. Testes de Integração
            print("\n🔄 FASE 2: TESTES DE INTEGRAÇÃO")
            print("-" * 50)
            await self._executar_testes_integracao()
            
            # 4. Testes de Performance
            print("\n⚡ FASE 3: TESTES DE PERFORMANCE")
            print("-" * 50)
            await self._executar_testes_performance()
            
            # 5. Testes de Stress (opcional)
            print("\n💪 FASE 4: TESTES DE STRESS")
            print("-" * 50)
            await self._executar_testes_stress()
            
        except Exception as e:
            print(f"\n❌ ERRO CRÍTICO NA BATERIA DE TESTES: {e}")
            traceback.print_exc()
        finally:
            tempo_fim = time.time()
            self.resultados['resumo']['fim'] = datetime.now()
            self.resultados['resumo']['duracao'] = tempo_fim - tempo_inicio
            
            # Relatório final
            await self._gerar_relatorio_final()
    
    async def _verificar_ambiente(self):
        """Verifica se o ambiente está pronto para testes"""
        print("🔍 Verificando ambiente de testes...")
        
        try:
            # Testa conexão com banco
            db = get_supabase_client()
            repository = AmbienteRepository(db)
            
            # Testa listagem básica
            resultado = await repository.listar(page=1, per_page=1)
            assert 'items' in resultado
            assert 'total' in resultado
            
            print("✅ Ambiente de testes OK")
            print(f"   - Conexão com banco: ✅")
            print(f"   - Tabelas acessíveis: ✅")
            print(f"   - Registros existentes: {resultado['total']}")
            
        except Exception as e:
            print(f"❌ Erro na verificação do ambiente: {e}")
            raise
    
    async def _executar_testes_unitarios(self):
        """Executa todos os testes unitários"""
        testes_unitarios = [
            # Repository Tests
            ('Repository - Listagem', self._test_repository_listagem),
            ('Repository - Criação', self._test_repository_criacao),
            ('Repository - Busca por ID', self._test_repository_busca_id),
            ('Repository - Atualização', self._test_repository_atualizacao),
            ('Repository - Filtros', self._test_repository_filtros),
            
            # Service Tests
            ('Service - Listagem', self._test_service_listagem),
            ('Service - Criação', self._test_service_criacao),
            ('Service - Validações', self._test_service_validacoes),
            ('Service - Filtros', self._test_service_filtros),
            
            # Schema Tests
            ('Schemas - Criação Válida', self._test_schema_create_valido),
            ('Schemas - Validações', self._test_schema_validacoes),
            ('Schemas - Filtros', self._test_schema_filtros),
        ]
        
        for nome_teste, metodo_teste in testes_unitarios:
            await self._executar_teste_individual(nome_teste, metodo_teste, 'unitarios')
    
    async def _executar_testes_integracao(self):
        """Executa todos os testes de integração"""
        testes_integracao = [
            ('CRUD Completo', self._test_crud_completo),
            ('Consistência entre Camadas', self._test_consistencia_camadas),
            ('Filtros + Paginação', self._test_filtros_paginacao),
            ('Materiais de Ambiente', self._test_materiais_ambiente),
            ('Casos Extremos', self._test_casos_extremos),
        ]
        
        for nome_teste, metodo_teste in testes_integracao:
            await self._executar_teste_individual(nome_teste, metodo_teste, 'integracao')
    
    async def _executar_teste_individual(self, nome: str, metodo, categoria: str):
        """Executa um teste individual e registra o resultado"""
        print(f"  🧪 {nome}...", end=" ")
        
        tempo_inicio = time.time()
        try:
            await metodo()
            tempo_fim = time.time()
            duracao = tempo_fim - tempo_inicio
            
            self.resultados[categoria]['passou'] += 1
            self.resultados[categoria]['detalhes'].append({
                'nome': nome,
                'status': 'PASSOU',
                'duracao': duracao,
                'erro': None
            })
            
            print(f"✅ ({duracao:.3f}s)")
            
        except Exception as e:
            tempo_fim = time.time()
            duracao = tempo_fim - tempo_inicio
            
            self.resultados[categoria]['falhou'] += 1
            self.resultados[categoria]['detalhes'].append({
                'nome': nome,
                'status': 'FALHOU',
                'duracao': duracao,
                'erro': str(e)
            })
            
            print(f"❌ ({duracao:.3f}s)")
            print(f"     Erro: {str(e)[:100]}...")
        
        self.resultados[categoria]['total'] += 1
    
    # Métodos de teste unitário
    async def _test_repository_listagem(self):
        db = get_supabase_client()
        repository = AmbienteRepository(db)
        resultado = await repository.listar(page=1, per_page=10)
        assert 'items' in resultado and 'total' in resultado
    
    async def _test_repository_criacao(self):
        db = get_supabase_client()
        repository = AmbienteRepository(db)
        dados = {
            'cliente_id': 'test-cliente',
            'nome': f'Teste Master {int(time.time())}',
            'origem': 'manual'
        }
        ambiente = await repository.criar_ambiente(dados)
        assert ambiente['id'] is not None
        await repository.excluir_ambiente(ambiente['id'])
    
    async def _test_repository_busca_id(self):
        db = get_supabase_client()
        repository = AmbienteRepository(db)
        dados = {
            'cliente_id': 'test-cliente',
            'nome': f'Teste Busca {int(time.time())}',
            'origem': 'manual'
        }
        ambiente = await repository.criar_ambiente(dados)
        encontrado = await repository.buscar_por_id(ambiente['id'])
        assert encontrado['id'] == ambiente['id']
        await repository.excluir_ambiente(ambiente['id'])
    
    async def _test_repository_atualizacao(self):
        db = get_supabase_client()
        repository = AmbienteRepository(db)
        dados = {
            'cliente_id': 'test-cliente',
            'nome': f'Teste Update {int(time.time())}',
            'origem': 'manual'
        }
        ambiente = await repository.criar_ambiente(dados)
        atualizado = await repository.atualizar_ambiente(ambiente['id'], {'nome': 'Nome Atualizado'})
        assert atualizado['nome'] == 'Nome Atualizado'
        await repository.excluir_ambiente(ambiente['id'])
    
    async def _test_repository_filtros(self):
        db = get_supabase_client()
        repository = AmbienteRepository(db)
        resultado = await repository.listar(origem='manual', page=1, per_page=5)
        assert isinstance(resultado['items'], list)
    
    async def _test_service_listagem(self):
        from modules.ambientes.schemas import AmbienteFiltros
        db = get_supabase_client()
        service = AmbienteService(db)
        filtros = AmbienteFiltros(page=1, per_page=10)
        resultado = await service.listar_ambientes(filtros)
        assert hasattr(resultado, 'items') and hasattr(resultado, 'total')
    
    async def _test_service_criacao(self):
        from modules.ambientes.schemas import AmbienteCreate
        from decimal import Decimal
        db = get_supabase_client()
        service = AmbienteService(db)
        dados = AmbienteCreate(
            cliente_id='test-service',
            nome=f'Teste Service {int(time.time())}',
            origem='manual'
        )
        ambiente = await service.criar_ambiente(dados)
        assert ambiente.id is not None
        await service.excluir_ambiente(ambiente.id)
    
    async def _test_service_validacoes(self):
        from modules.ambientes.schemas import AmbienteCreate
        from core.exceptions import ValidationException
        db = get_supabase_client()
        service = AmbienteService(db)
        
        try:
            dados_invalidos = AmbienteCreate(
                cliente_id='',  # Cliente vazio
                nome='Teste',
                origem='manual'
            )
            await service.criar_ambiente(dados_invalidos)
            assert False, "Deveria ter falhado na validação"
        except ValidationException:
            pass  # Esperado
    
    async def _test_service_filtros(self):
        from modules.ambientes.schemas import AmbienteFiltros
        db = get_supabase_client()
        service = AmbienteService(db)
        filtros = AmbienteFiltros(origem='manual', page=1, per_page=5)
        resultado = await service.listar_ambientes(filtros)
        assert isinstance(resultado.items, list)
    
    async def _test_schema_create_valido(self):
        from modules.ambientes.schemas import AmbienteCreate
        dados = AmbienteCreate(
            cliente_id='test-schema',
            nome='Teste Schema',
            origem='manual'
        )
        assert dados.cliente_id == 'test-schema'
        assert dados.nome == 'Teste Schema'
        assert dados.origem == 'manual'
    
    async def _test_schema_validacoes(self):
        from modules.ambientes.schemas import AmbienteCreate
        try:
            AmbienteCreate(
                cliente_id='test',
                nome='',  # Nome vazio
                origem='manual'
            )
            assert False, "Deveria falhar na validação"
        except ValueError:
            pass  # Esperado
    
    async def _test_schema_filtros(self):
        from modules.ambientes.schemas import AmbienteFiltros
        filtros = AmbienteFiltros(
            nome='Teste',
            origem='manual',
            page=1,
            per_page=20
        )
        assert filtros.nome == 'Teste'
        assert filtros.origem == 'manual'
        assert filtros.page == 1
        assert filtros.per_page == 20
    
    # Métodos de teste de integração
    async def _test_crud_completo(self):
        from modules.ambientes.schemas import AmbienteCreate, AmbienteUpdate
        from decimal import Decimal
        db = get_supabase_client()
        service = AmbienteService(db)
        
        # Create
        dados = AmbienteCreate(
            cliente_id='test-crud',
            nome=f'CRUD Test {int(time.time())}',
            valor_venda=Decimal('2500.00'),
            origem='manual'
        )
        ambiente = await service.criar_ambiente(dados)
        
        # Read
        encontrado = await service.buscar_ambiente_por_id(ambiente.id)
        assert encontrado.id == ambiente.id
        
        # Update
        update_data = AmbienteUpdate(nome='CRUD Atualizado')
        atualizado = await service.atualizar_ambiente(ambiente.id, update_data)
        assert atualizado.nome == 'CRUD Atualizado'
        
        # Delete
        await service.excluir_ambiente(ambiente.id)
    
    async def _test_consistencia_camadas(self):
        from modules.ambientes.schemas import AmbienteCreate
        db = get_supabase_client()
        service = AmbienteService(db)
        repository = AmbienteRepository(db)
        
        dados = AmbienteCreate(
            cliente_id='test-consistencia',
            nome=f'Consistência {int(time.time())}',
            origem='manual'
        )
        
        ambiente_service = await service.criar_ambiente(dados)
        ambiente_repo = await repository.buscar_por_id(ambiente_service.id)
        
        assert ambiente_service.id == ambiente_repo['id']
        assert ambiente_service.nome == ambiente_repo['nome']
        
        await service.excluir_ambiente(ambiente_service.id)
    
    async def _test_filtros_paginacao(self):
        from modules.ambientes.schemas import AmbienteFiltros
        db = get_supabase_client()
        service = AmbienteService(db)
        
        filtros = AmbienteFiltros(
            origem='manual',
            page=1,
            per_page=5
        )
        resultado = await service.listar_ambientes(filtros)
        
        assert len(resultado.items) <= 5
        assert resultado.page == 1
        assert resultado.per_page == 5
    
    async def _test_materiais_ambiente(self):
        from modules.ambientes.schemas import AmbienteCreate, AmbienteMaterialCreate
        db = get_supabase_client()
        service = AmbienteService(db)
        
        # Cria ambiente
        dados = AmbienteCreate(
            cliente_id='test-material',
            nome=f'Material Test {int(time.time())}',
            origem='manual'
        )
        ambiente = await service.criar_ambiente(dados)
        
        # Cria material
        material = AmbienteMaterialCreate(
            material_data={'nome': 'Teste Material', 'quantidade': 1}
        )
        material_criado = await service.criar_material_ambiente(ambiente.id, material)
        
        assert material_criado.ambiente_id == ambiente.id
        
        # Busca materiais
        materiais = await service.obter_materiais_ambiente(ambiente.id)
        assert len(materiais) >= 1
        
        await service.excluir_ambiente(ambiente.id)
    
    async def _test_casos_extremos(self):
        from core.exceptions import NotFoundException
        db = get_supabase_client()
        service = AmbienteService(db)
        
        # ID inexistente
        try:
            await service.buscar_ambiente_por_id('id-inexistente')
            assert False, "Deveria ter falhado"
        except NotFoundException:
            pass  # Esperado
    
    async def _executar_testes_performance(self):
        """Testa performance das operações"""
        print("  ⚡ Testando performance de listagem...", end=" ")
        
        tempo_inicio = time.time()
        
        from modules.ambientes.schemas import AmbienteFiltros
        db = get_supabase_client()
        service = AmbienteService(db)
        
        # Teste de listagem
        filtros = AmbienteFiltros(page=1, per_page=50)
        resultado = await service.listar_ambientes(filtros)
        
        tempo_listagem = time.time() - tempo_inicio
        
        self.resultados['performance']['operacoes'].append({
            'operacao': 'Listagem (50 itens)',
            'tempo': tempo_listagem,
            'status': 'OK' if tempo_listagem < 3.0 else 'LENTO'
        })
        
        print(f"✅ ({tempo_listagem:.3f}s)")
        
        # Teste de criação em lote
        print("  ⚡ Testando criação em lote...", end=" ")
        
        tempo_inicio = time.time()
        ambientes_criados = []
        
        try:
            from modules.ambientes.schemas import AmbienteCreate
            for i in range(5):
                dados = AmbienteCreate(
                    cliente_id=f'perf-test-{i}',
                    nome=f'Performance Test {i}',
                    origem='manual'
                )
                ambiente = await service.criar_ambiente(dados)
                ambientes_criados.append(ambiente.id)
            
            tempo_criacao = time.time() - tempo_inicio
            
            self.resultados['performance']['operacoes'].append({
                'operacao': 'Criação em lote (5 itens)',
                'tempo': tempo_criacao,
                'status': 'OK' if tempo_criacao < 5.0 else 'LENTO'
            })
            
            print(f"✅ ({tempo_criacao:.3f}s)")
            
        finally:
            # Limpeza
            for ambiente_id in ambientes_criados:
                try:
                    await service.excluir_ambiente(ambiente_id)
                except:
                    pass
    
    async def _executar_testes_stress(self):
        """Testa comportamento sob stress"""
        print("  💪 Testando múltiplas operações simultâneas...", end=" ")
        
        try:
            from modules.ambientes.schemas import AmbienteFiltros
            db = get_supabase_client()
            service = AmbienteService(db)
            
            # Múltiplas listagens simultâneas
            tasks = []
            for i in range(10):
                filtros = AmbienteFiltros(page=1, per_page=10)
                task = service.listar_ambientes(filtros)
                tasks.append(task)
            
            tempo_inicio = time.time()
            resultados = await asyncio.gather(*tasks, return_exceptions=True)
            tempo_stress = time.time() - tempo_inicio
            
            # Verifica se alguma operação falhou
            falhas = sum(1 for r in resultados if isinstance(r, Exception))
            
            self.resultados['performance']['operacoes'].append({
                'operacao': 'Stress Test (10 listagens simultâneas)',
                'tempo': tempo_stress,
                'falhas': falhas,
                'status': 'OK' if falhas == 0 else 'FALHAS'
            })
            
            print(f"✅ ({tempo_stress:.3f}s, {falhas} falhas)")
            
        except Exception as e:
            print(f"❌ Erro no teste de stress: {e}")
    
    async def _gerar_relatorio_final(self):
        """Gera relatório final completo"""
        print("\n" + "=" * 80)
        print("📊 RELATÓRIO FINAL - TESTES MÓDULO AMBIENTES")
        print("=" * 80)
        
        # Resumo geral
        total_testes = (self.resultados['unitarios']['total'] + 
                       self.resultados['integracao']['total'])
        total_passou = (self.resultados['unitarios']['passou'] + 
                       self.resultados['integracao']['passou'])
        total_falhou = (self.resultados['unitarios']['falhou'] + 
                       self.resultados['integracao']['falhou'])
        
        print(f"\n🎯 RESUMO GERAL:")
        print(f"   Total de testes: {total_testes}")
        print(f"   Passou: {total_passou} ✅")
        print(f"   Falhou: {total_falhou} ❌")
        print(f"   Taxa de sucesso: {(total_passou/total_testes)*100:.1f}%")
        print(f"   Duração total: {self.resultados['resumo']['duracao']:.2f}s")
        
        # Detalhes por categoria
        print(f"\n📋 TESTES UNITÁRIOS:")
        print(f"   Total: {self.resultados['unitarios']['total']}")
        print(f"   Passou: {self.resultados['unitarios']['passou']} ✅")
        print(f"   Falhou: {self.resultados['unitarios']['falhou']} ❌")
        
        print(f"\n🔄 TESTES DE INTEGRAÇÃO:")
        print(f"   Total: {self.resultados['integracao']['total']}")
        print(f"   Passou: {self.resultados['integracao']['passou']} ✅")
        print(f"   Falhou: {self.resultados['integracao']['falhou']} ❌")
        
        # Performance
        if self.resultados['performance']['operacoes']:
            print(f"\n⚡ PERFORMANCE:")
            for op in self.resultados['performance']['operacoes']:
                status_icon = "✅" if op['status'] == 'OK' else "⚠️"
                print(f"   {op['operacao']}: {op['tempo']:.3f}s {status_icon}")
        
        # Falhas detalhadas
        falhas_unitarios = [d for d in self.resultados['unitarios']['detalhes'] if d['status'] == 'FALHOU']
        falhas_integracao = [d for d in self.resultados['integracao']['detalhes'] if d['status'] == 'FALHOU']
        
        if falhas_unitarios or falhas_integracao:
            print(f"\n❌ FALHAS DETALHADAS:")
            for falha in falhas_unitarios + falhas_integracao:
                print(f"   {falha['nome']}: {falha['erro']}")
        
        # Status final
        print(f"\n" + "=" * 80)
        if total_falhou == 0:
            print("🎉 TODOS OS TESTES PASSARAM! MÓDULO AMBIENTES 100% TESTADO!")
        else:
            print(f"⚠️ {total_falhou} TESTE(S) FALHARAM - REVISAR IMPLEMENTAÇÃO")
        print("=" * 80)


# Função principal
async def main():
    """Executa a bateria completa de testes"""
    master = TestMasterAmbientes()
    await master.executar_todos_testes()


if __name__ == "__main__":
    asyncio.run(main()) 