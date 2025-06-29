"""
Teste Simples - Módulo Ambientes
Script direto para testar o backend do módulo Ambientes
"""
import asyncio
import sys
import os
import time
import uuid
from datetime import datetime, date
from decimal import Decimal

# Adiciona o diretório backend ao path
sys.path.append(os.path.dirname(os.path.abspath(__file__)))

# Importações do projeto
from core.database import get_admin_database
from core.exceptions import NotFoundException, ValidationException

from modules.ambientes.repository import AmbienteRepository
from modules.ambientes.service import AmbienteService
from modules.ambientes.schemas import (
    AmbienteCreate, AmbienteUpdate, AmbienteFiltros,
    AmbienteMaterialCreate
)

# Cliente real do banco para testes
CLIENTE_TESTE_ID = "d10bea28-3858-482c-b656-82134d808957"


class TesteAmbientesSimples:
    """
    Classe para testes simples do módulo Ambientes
    """
    
    def __init__(self):
        self.resultados = {
            'total': 0,
            'passou': 0,
            'falhou': 0,
            'detalhes': []
        }
    
    async def executar_testes(self):
        """Executa bateria de testes simplificada"""
        print("🧪 TESTANDO MÓDULO AMBIENTES - VERSÃO SIMPLIFICADA")
        print("=" * 60)
        
        try:
            # Configuração inicial (usa admin para bypassar RLS)
            db = get_admin_database()
            repository = AmbienteRepository(db)
            service = AmbienteService(db)
            
            print("✅ Conexão com banco estabelecida")
            
            # Lista de testes
            testes = [
                ("Teste 1: Listagem básica", self.test_listagem_basica),
                ("Teste 2: Criação de ambiente", self.test_criacao_ambiente),
                ("Teste 3: Busca por ID", self.test_busca_por_id),
                ("Teste 4: Atualização", self.test_atualizacao),
                ("Teste 5: Filtros", self.test_filtros),
                ("Teste 6: Validações", self.test_validacoes),
                ("Teste 7: Materiais", self.test_materiais),
                ("Teste 8: CRUD completo", self.test_crud_completo),
                ("Teste 9: Performance", self.test_performance),
                ("Teste 10: Casos extremos", self.test_casos_extremos),
            ]
            
            # Executa cada teste
            for nome_teste, metodo_teste in testes:
                await self.executar_teste_individual(nome_teste, metodo_teste, db, repository, service)
            
            # Relatório final
            self.gerar_relatorio()
            
        except Exception as e:
            print(f"❌ ERRO CRÍTICO: {e}")
            import traceback
            traceback.print_exc()
    
    async def executar_teste_individual(self, nome, metodo, db, repository, service):
        """Executa um teste individual"""
        print(f"\n{nome}...", end=" ")
        
        tempo_inicio = time.time()
        try:
            await metodo(db, repository, service)
            tempo_fim = time.time()
            duracao = tempo_fim - tempo_inicio
            
            self.resultados['passou'] += 1
            self.resultados['detalhes'].append({
                'nome': nome,
                'status': 'PASSOU',
                'duracao': duracao
            })
            
            print(f"✅ ({duracao:.3f}s)")
            
        except Exception as e:
            tempo_fim = time.time()
            duracao = tempo_fim - tempo_inicio
            
            self.resultados['falhou'] += 1
            self.resultados['detalhes'].append({
                'nome': nome,
                'status': 'FALHOU',
                'duracao': duracao,
                'erro': str(e)
            })
            
            print(f"❌ ({duracao:.3f}s)")
            print(f"   Erro: {str(e)}")
        
        self.resultados['total'] += 1
    
    async def test_listagem_basica(self, db, repository, service):
        """Testa listagem básica"""
        # Repository
        resultado_repo = await repository.listar(page=1, per_page=10)
        assert 'items' in resultado_repo
        assert 'total' in resultado_repo
        assert isinstance(resultado_repo['items'], list)
        
        # Service
        filtros = AmbienteFiltros(page=1, per_page=10)
        resultado_service = await service.listar_ambientes(filtros)
        assert hasattr(resultado_service, 'items')
        assert hasattr(resultado_service, 'total')
        
        print(f"({resultado_repo['total']} registros)", end="")
    
    async def test_criacao_ambiente(self, db, repository, service):
        """Testa criação de ambiente"""
        timestamp = int(time.time())
        
        # Via Repository (usa cliente real)
        dados_repo = {
            'cliente_id': CLIENTE_TESTE_ID,
            'nome': f'Ambiente Repo {timestamp}',
            'origem': 'manual'
        }
        ambiente_repo = await repository.criar_ambiente(dados_repo)
        assert ambiente_repo['id'] is not None
        assert ambiente_repo['nome'] == dados_repo['nome']
        
        # Via Service
        dados_service = AmbienteCreate(
            cliente_id=CLIENTE_TESTE_ID,
            nome=f'Ambiente Service {timestamp}',
            origem='manual'
        )
        ambiente_service = await service.criar_ambiente(dados_service)
        assert ambiente_service.id is not None
        assert ambiente_service.nome == dados_service.nome
        
        # Limpeza
        await repository.excluir_ambiente(ambiente_repo['id'])
        await service.excluir_ambiente(ambiente_service.id)
    
    async def test_busca_por_id(self, db, repository, service):
        """Testa busca por ID"""
        timestamp = int(time.time())
        
        # Cria ambiente para teste
        dados = {
            'cliente_id': CLIENTE_TESTE_ID,
            'nome': f'Ambiente Busca {timestamp}',
            'origem': 'manual'
        }
        ambiente_criado = await repository.criar_ambiente(dados)
        ambiente_id = ambiente_criado['id']
        
        try:
            # Busca via repository
            ambiente_repo = await repository.buscar_por_id(ambiente_id)
            assert ambiente_repo['id'] == ambiente_id
            assert ambiente_repo['nome'] == dados['nome']
            
            # Busca via service
            ambiente_service = await service.buscar_ambiente_por_id(ambiente_id)
            assert ambiente_service.id == ambiente_id
            assert ambiente_service.nome == dados['nome']
            
        finally:
            await repository.excluir_ambiente(ambiente_id)
    
    async def test_atualizacao(self, db, repository, service):
        """Testa atualização de ambiente"""
        timestamp = int(time.time())
        
        # Cria ambiente
        dados = {
            'cliente_id': CLIENTE_TESTE_ID,
            'nome': f'Ambiente Update {timestamp}',
            'origem': 'manual'
        }
        ambiente = await repository.criar_ambiente(dados)
        ambiente_id = ambiente['id']
        
        try:
            # Atualiza via repository
            dados_update_repo = {'nome': 'Ambiente Atualizado Repo'}
            ambiente_atualizado_repo = await repository.atualizar_ambiente(ambiente_id, dados_update_repo)
            assert ambiente_atualizado_repo['nome'] == 'Ambiente Atualizado Repo'
            
            # Atualiza via service
            dados_update_service = AmbienteUpdate(nome='Ambiente Atualizado Service')
            ambiente_atualizado_service = await service.atualizar_ambiente(ambiente_id, dados_update_service)
            assert ambiente_atualizado_service.nome == 'Ambiente Atualizado Service'
            
        finally:
            await repository.excluir_ambiente(ambiente_id)
    
    async def test_filtros(self, db, repository, service):
        """Testa filtros de busca"""
        # Repository - filtros básicos
        resultado_repo = await repository.listar(
            origem='manual',
            page=1,
            per_page=5
        )
        assert isinstance(resultado_repo['items'], list)
        assert len(resultado_repo['items']) <= 5
        
        # Service - filtros avançados
        filtros = AmbienteFiltros(
            origem='manual',
            valor_min=100.0,
            valor_max=10000.0,
            page=1,
            per_page=10
        )
        resultado_service = await service.listar_ambientes(filtros)
        assert isinstance(resultado_service.items, list)
        assert len(resultado_service.items) <= 10
    
    async def test_validacoes(self, db, repository, service):
        """Testa validações de dados"""
        # Schema - dados válidos
        dados_validos = AmbienteCreate(
            cliente_id='test-validacao',
            nome='Ambiente Válido',
            origem='manual'
        )
        assert dados_validos.cliente_id == 'test-validacao'
        assert dados_validos.nome == 'Ambiente Válido'
        
        # Schema - dados inválidos
        try:
            AmbienteCreate(
                cliente_id='test',
                nome='',  # Nome vazio
                origem='manual'
            )
            assert False, "Deveria falhar"
        except ValueError:
            pass  # Esperado
        
        # Service - validação de negócio
        try:
            dados_invalidos = AmbienteCreate(
                cliente_id='',  # Cliente vazio
                nome='Teste',
                origem='manual'
            )
            await service.criar_ambiente(dados_invalidos)
            assert False, "Deveria falhar"
        except ValidationException:
            pass  # Esperado
    
    async def test_materiais(self, db, repository, service):
        """Testa funcionalidade de materiais"""
        timestamp = int(time.time())
        
        # Cria ambiente
        dados = AmbienteCreate(
            cliente_id=CLIENTE_TESTE_ID,
            nome=f'Ambiente Material {timestamp}',
            origem='manual'
        )
        ambiente = await service.criar_ambiente(dados)
        
        try:
            # Cria material
            material_data = AmbienteMaterialCreate(
                material_data={
                    'nome': 'Porta Teste',
                    'categoria': 'Portas',
                    'quantidade': 1,
                    'valor_unitario': 500.00
                }
            )
            material = await service.criar_material_ambiente(ambiente.id, material_data)
            assert material.ambiente_id == ambiente.id
            assert material.material_data['nome'] == 'Porta Teste'
            
            # Busca materiais
            materiais = await service.obter_materiais_ambiente(ambiente.id)
            assert len(materiais) >= 1
            assert any(m.material_data['nome'] == 'Porta Teste' for m in materiais)
            
        finally:
            await service.excluir_ambiente(ambiente.id)
    
    async def test_crud_completo(self, db, repository, service):
        """Testa fluxo CRUD completo"""
        timestamp = int(time.time())
        
        # CREATE
        dados = AmbienteCreate(
            cliente_id=CLIENTE_TESTE_ID,
            nome=f'CRUD Completo {timestamp}',
            valor_venda=Decimal('2500.00'),
            origem='manual'
        )
        ambiente = await service.criar_ambiente(dados)
        ambiente_id = ambiente.id
        
        try:
            # READ
            ambiente_lido = await service.buscar_ambiente_por_id(ambiente_id)
            assert ambiente_lido.id == ambiente_id
            assert ambiente_lido.nome == dados.nome
            
            # UPDATE
            dados_update = AmbienteUpdate(
                nome='CRUD Atualizado',
                valor_venda=Decimal('3000.00')
            )
            ambiente_atualizado = await service.atualizar_ambiente(ambiente_id, dados_update)
            assert ambiente_atualizado.nome == 'CRUD Atualizado'
            assert ambiente_atualizado.valor_venda == Decimal('3000.00')
            
            # Verifica persistência
            ambiente_verificado = await service.buscar_ambiente_por_id(ambiente_id)
            assert ambiente_verificado.nome == 'CRUD Atualizado'
            
            # DELETE
            await service.excluir_ambiente(ambiente_id)
            
            # Verifica exclusão
            try:
                await service.buscar_ambiente_por_id(ambiente_id)
                assert False, "Deveria ter sido excluído"
            except NotFoundException:
                pass  # Esperado
            
            ambiente_id = None  # Marca como excluído
            
        finally:
            if ambiente_id:
                try:
                    await service.excluir_ambiente(ambiente_id)
                except:
                    pass
    
    async def test_performance(self, db, repository, service):
        """Testa performance básica"""
        # Listagem com limite de tempo
        tempo_inicio = time.time()
        filtros = AmbienteFiltros(page=1, per_page=20)
        resultado = await service.listar_ambientes(filtros)
        tempo_listagem = time.time() - tempo_inicio
        
        assert tempo_listagem < 5.0, f"Listagem muito lenta: {tempo_listagem:.3f}s"
        
        # Criação/exclusão rápida
        timestamp = int(time.time())
        dados = AmbienteCreate(
            cliente_id=CLIENTE_TESTE_ID,
            nome=f'Performance {timestamp}',
            origem='manual'
        )
        
        tempo_inicio = time.time()
        ambiente = await service.criar_ambiente(dados)
        tempo_criacao = time.time() - tempo_inicio
        
        tempo_inicio = time.time()
        await service.excluir_ambiente(ambiente.id)
        tempo_exclusao = time.time() - tempo_inicio
        
        assert tempo_criacao < 3.0, f"Criação muito lenta: {tempo_criacao:.3f}s"
        assert tempo_exclusao < 2.0, f"Exclusão muito lenta: {tempo_exclusao:.3f}s"
        
        print(f"(L:{tempo_listagem:.2f}s C:{tempo_criacao:.2f}s E:{tempo_exclusao:.2f}s)", end="")
    
    async def test_casos_extremos(self, db, repository, service):
        """Testa casos extremos"""
        # ID inexistente
        try:
            await service.buscar_ambiente_por_id('id-inexistente-123')
            assert False, "Deveria falhar"
        except NotFoundException:
            pass  # Esperado
        
        # Atualização de ID inexistente
        try:
            dados_update = AmbienteUpdate(nome='Teste')
            await service.atualizar_ambiente('id-inexistente-123', dados_update)
            assert False, "Deveria falhar"
        except NotFoundException:
            pass  # Esperado
        
        # Exclusão de ID inexistente
        try:
            await service.excluir_ambiente('id-inexistente-123')
            assert False, "Deveria falhar"
        except NotFoundException:
            pass  # Esperado
        
        # Filtros extremos
        filtros_extremos = AmbienteFiltros(
            valor_min=999999.0,
            valor_max=1000000.0,
            page=1,
            per_page=100
        )
        resultado = await service.listar_ambientes(filtros_extremos)
        assert isinstance(resultado.items, list)  # Deve retornar lista vazia
    
    def gerar_relatorio(self):
        """Gera relatório final"""
        print("\n" + "=" * 60)
        print("📊 RELATÓRIO FINAL")
        print("=" * 60)
        
        print(f"\n🎯 RESUMO:")
        print(f"   Total de testes: {self.resultados['total']}")
        print(f"   Passou: {self.resultados['passou']} ✅")
        print(f"   Falhou: {self.resultados['falhou']} ❌")
        
        if self.resultados['total'] > 0:
            taxa_sucesso = (self.resultados['passou'] / self.resultados['total']) * 100
            print(f"   Taxa de sucesso: {taxa_sucesso:.1f}%")
        
        # Detalhes dos testes
        print(f"\n📋 DETALHES:")
        for detalhe in self.resultados['detalhes']:
            status_icon = "✅" if detalhe['status'] == 'PASSOU' else "❌"
            print(f"   {detalhe['nome']}: {detalhe['status']} {status_icon} ({detalhe['duracao']:.3f}s)")
            if detalhe['status'] == 'FALHOU' and 'erro' in detalhe:
                print(f"      Erro: {detalhe['erro']}")
        
        # Status final
        print(f"\n" + "=" * 60)
        if self.resultados['falhou'] == 0:
            print("🎉 TODOS OS TESTES PASSARAM! MÓDULO AMBIENTES FUNCIONAL!")
        else:
            print(f"⚠️ {self.resultados['falhou']} TESTE(S) FALHARAM")
        print("=" * 60)


async def main():
    """Função principal"""
    teste = TesteAmbientesSimples()
    await teste.executar_testes()


if __name__ == "__main__":
    asyncio.run(main()) 