#!/usr/bin/env python3
"""
Teste Frontend Equipe Requests - Simular requisições exatas do frontend
Descobrir por que tabela equipe não aparece no frontend
"""

import sys
import os
import asyncio
import json
import requests
sys.path.append(os.path.dirname(os.path.abspath(__file__)))

async def test_listar_funcionarios_like_frontend():
    """Testa listagem como o frontend faz"""
    
    print("🔬 TESTE LISTAGEM FUNCIONÁRIOS (FRONTEND)")
    print("=" * 50)
    
    try:
        # Simular exatamente como frontend chama
        print("1️⃣ Simulando chamada do frontend...")
        
        from modules.equipe.controller import listar_funcionarios
        from core.auth import User
        from core.dependencies import PaginationParams
        
        # Usuário mock (como vem do frontend)
        user = User(
            id="test-user-id",
            email="test@email.com",
            nome="Usuário Teste",
            perfil="ADMIN_MASTER",
            loja_id="f486a675-06a1-4162-91e3-3b8b96690ed6"
        )
        
        # Paginação padrão
        pagination = PaginationParams(page=1, limit=20)
        
        print("   📋 Parâmetros preparados")
        print(f"      Usuário: {user.nome} ({user.perfil})")
        print(f"      Loja: {user.loja_id}")
        print(f"      Paginação: página {pagination.page}, limite {pagination.limit}")
        
        # Chamar endpoint de listagem
        print("\n2️⃣ Chamando listar_funcionarios...")
        resultado = await listar_funcionarios(
            busca=None,
            perfil=None,
            setor_id=None,
            data_inicio=None,
            data_fim=None,
            pagination=pagination,
            current_user=user
        )
        
        print("   ✅ LISTAGEM FUNCIONOU!")
        print(f"      Total de funcionários: {resultado.total}")
        print(f"      Itens na página: {len(resultado.items)}")
        print(f"      Página atual: {resultado.page}")
        print(f"      Total de páginas: {resultado.pages}")
        
        # Mostrar primeiro funcionário se existir
        if resultado.items:
            primeiro = resultado.items[0]
            print(f"\n   📋 Primeiro funcionário:")
            print(f"      ID: {getattr(primeiro, 'id', 'N/A')}")
            print(f"      Nome: {getattr(primeiro, 'nome', 'N/A')}")
            print(f"      Email: {getattr(primeiro, 'email', 'N/A')}")
            print(f"      Perfil: {getattr(primeiro, 'perfil', 'N/A')}")
        else:
            print("\n   ⚠️ NENHUM FUNCIONÁRIO ENCONTRADO!")
            print("      Isso explica por que frontend não mostra dados")
        
        return len(resultado.items) > 0
        
    except Exception as e:
        print(f"\n❌ ERRO NA LISTAGEM: {e}")
        print(f"   Tipo: {type(e).__name__}")
        import traceback
        traceback.print_exc()
        return False

async def test_database_direct_query():
    """Testa consulta direta no banco para ver se tem dados"""
    
    print("\n" + "=" * 50)
    print("🔬 TESTE CONSULTA DIRETA NO BANCO")
    print("=" * 50)
    
    try:
        print("1️⃣ Conectando diretamente no banco...")
        from core.database import get_database
        
        db = get_database()
        
        # Contar total de registros
        print("\n2️⃣ Contando total de funcionários...")
        
        response_count = db.table('cad_equipe').select('id', count='exact').execute()
        total_registros = response_count.count
        
        print(f"   📊 Total de registros na tabela: {total_registros}")
        
        if total_registros == 0:
            print("   ⚠️ TABELA VAZIA! Isso explica o problema do frontend")
            return False
        
        # Buscar alguns registros
        print("\n3️⃣ Buscando primeiros registros...")
        
        response_data = db.table('cad_equipe').select('*').limit(5).execute()
        registros = response_data.data
        
        print(f"   📋 Encontrados {len(registros)} registros:")
        
        for i, registro in enumerate(registros, 1):
            print(f"      {i}. {registro.get('nome', 'Sem nome')} - {registro.get('perfil', 'Sem perfil')}")
            print(f"         ID: {registro.get('id')}")
            print(f"         Ativo: {registro.get('ativo', 'N/A')}")
            print(f"         Loja: {registro.get('loja_id', 'N/A')}")
        
        return True
        
    except Exception as e:
        print(f"\n❌ ERRO NA CONSULTA DIRETA: {e}")
        import traceback
        traceback.print_exc()
        return False

async def test_repository_list_funcionarios():
    """Testa repository de listagem diretamente"""
    
    print("\n" + "=" * 50)
    print("🔬 TESTE REPOSITORY LISTAGEM")
    print("=" * 50)
    
    try:
        print("1️⃣ Testando repository diretamente...")
        
        from modules.equipe.repository import FuncionarioRepository
        from modules.equipe.schemas import FiltrosFuncionario
        from core.dependencies import PaginationParams
        
        repository = FuncionarioRepository()
        
        # Filtros vazios
        filtros = FiltrosFuncionario()
        pagination = PaginationParams(page=1, limit=20)
        
        # Simular usuário da loja
        loja_id = "f486a675-06a1-4162-91e3-3b8b96690ed6"
        
        print(f"   📋 Buscando funcionários da loja: {loja_id}")
        
        # Chamar repository
        print("\n2️⃣ Chamando repository.listar...")
        resultado = repository.listar_funcionarios(
            filtros=filtros,
            pagination=pagination,
            loja_id=loja_id
        )
        
        print("   ✅ REPOSITORY FUNCIONOU!")
        print(f"      Total: {resultado.total}")
        print(f"      Itens: {len(resultado.items)}")
        
        # Mostrar detalhes se tiver dados
        if resultado.items:
            for i, item in enumerate(resultado.items, 1):
                print(f"      {i}. {item.nome} ({item.perfil})")
        else:
            print("   ⚠️ Repository não retornou dados!")
        
        return len(resultado.items) > 0
        
    except Exception as e:
        print(f"\n❌ ERRO NO REPOSITORY: {e}")
        import traceback
        traceback.print_exc()
        return False

async def test_services_list_funcionarios():
    """Testa services de listagem"""
    
    print("\n" + "=" * 50)
    print("🔬 TESTE SERVICES LISTAGEM")
    print("=" * 50)
    
    try:
        print("1️⃣ Testando services diretamente...")
        
        from modules.equipe.services import FuncionarioService
        from modules.equipe.schemas import FiltrosFuncionario
        from core.dependencies import PaginationParams
        from core.auth import User
        
        service = FuncionarioService()
        
        # Usuário e filtros
        user = User(
            id="test-user-id",
            email="test@email.com",
            nome="Usuário Teste",
            perfil="ADMIN_MASTER",
            loja_id="f486a675-06a1-4162-91e3-3b8b96690ed6"
        )
        
        filtros = FiltrosFuncionario()
        pagination = PaginationParams(page=1, limit=20)
        
        print(f"   📋 Usuário: {user.nome} - Loja: {user.loja_id}")
        
        # Chamar service
        print("\n2️⃣ Chamando service.listar_funcionarios...")
        resultado = service.listar_funcionarios(
            user=user,
            filtros=filtros,
            pagination=pagination
        )
        
        print("   ✅ SERVICE FUNCIONOU!")
        print(f"      Total: {resultado.total}")
        print(f"      Itens: {len(resultado.items)}")
        
        # Mostrar funcionários
        if resultado.items:
            for i, func in enumerate(resultado.items, 1):
                print(f"      {i}. {func.nome} - {func.perfil}")
                print(f"         Loja: {getattr(func, 'loja_nome', 'N/A')}")
                print(f"         Setor: {getattr(func, 'setor_nome', 'N/A')}")
        else:
            print("   ⚠️ Service não retornou funcionários!")
        
        return len(resultado.items) > 0
        
    except Exception as e:
        print(f"\n❌ ERRO NO SERVICE: {e}")
        import traceback
        traceback.print_exc()
        return False

async def test_criar_funcionario_teste():
    """Cria um funcionário de teste para garantir que há dados"""
    
    print("\n" + "=" * 50)
    print("🔬 CRIANDO FUNCIONÁRIO DE TESTE")
    print("=" * 50)
    
    try:
        print("1️⃣ Verificando se já existe funcionário de teste...")
        
        from core.database import get_database
        
        db = get_database()
        
        # Verificar se já existe
        existing = db.table('cad_equipe').select('id').eq('email', 'teste.frontend@email.com').execute()
        
        if existing.data:
            print("   ✅ Funcionário de teste já existe")
            return True
        
        print("\n2️⃣ Criando funcionário de teste...")
        
        from modules.equipe.services import FuncionarioService
        from modules.equipe.schemas import FuncionarioCreate
        from core.auth import User
        
        service = FuncionarioService()
        
        # Dados do funcionário teste
        dados = FuncionarioCreate(
            nome="Funcionário Teste Frontend",
            email="teste.frontend@email.com",
            telefone="11999998888",
            perfil="VENDEDOR",
            nivel_acesso="USUARIO",
            loja_id="f486a675-06a1-4162-91e3-3b8b96690ed6",
            setor_id="b54209a6-50ac-41f6-bf2c-996b6fe0bf2d",
            salario=2000.0,
            data_admissao="2025-01-24",
            limite_desconto=0.0,
            tem_minimo_garantido=True,
            valor_minimo_garantido=0.0
        )
        
        # Usuário criador
        user = User(
            id="test-user-id",
            email="test@email.com",
            nome="Usuário Teste",
            perfil="ADMIN_MASTER",
            loja_id="f486a675-06a1-4162-91e3-3b8b96690ed6"
        )
        
        # Criar funcionário
        resultado = service.criar_funcionario(dados, user)
        
        print("   ✅ FUNCIONÁRIO TESTE CRIADO!")
        print(f"      ID: {resultado.id}")
        print(f"      Nome: {resultado.nome}")
        
        return True
        
    except Exception as e:
        print(f"\n❌ ERRO AO CRIAR FUNCIONÁRIO TESTE: {e}")
        import traceback
        traceback.print_exc()
        return False

async def main():
    """Executa todos os testes de investigação do frontend"""
    
    print("🚀 INVESTIGANDO PROBLEMA DA TABELA EQUIPE NO FRONTEND\n")
    
    # Teste 1: Verificar se há dados no banco
    dados_banco = await test_database_direct_query()
    
    # Se não há dados, criar funcionário teste
    if not dados_banco:
        print("\n🔧 Criando dados de teste...")
        await test_criar_funcionario_teste()
    
    # Teste 2: Repository
    repository_ok = await test_repository_list_funcionarios()
    
    # Teste 3: Services
    services_ok = await test_services_list_funcionarios()
    
    # Teste 4: Controller (como frontend chama)
    frontend_ok = await test_listar_funcionarios_like_frontend()
    
    print("\n" + "=" * 50)
    print("📊 DIAGNÓSTICO FRONTEND EQUIPE")
    print("=" * 50)
    print(f"Dados no Banco:     {'✅ OK' if dados_banco else '❌ VAZIO'}")
    print(f"Repository:         {'✅ OK' if repository_ok else '❌ FALHA'}")
    print(f"Services:           {'✅ OK' if services_ok else '❌ FALHA'}")
    print(f"Controller/Frontend: {'✅ OK' if frontend_ok else '❌ FALHA'}")
    
    if all([repository_ok, services_ok, frontend_ok]):
        print("\n🎯 BACKEND FUNCIONANDO PERFEITAMENTE!")
        print("   Se frontend não mostra dados:")
        print("   - Verificar URL da API no frontend")
        print("   - Verificar headers de autenticação")
        print("   - Verificar console do navegador")
        print("   - Verificar se frontend está fazendo a requisição")
    else:
        print("\n🎯 PROBLEMAS ENCONTRADOS:")
        if not dados_banco:
            print("   ❌ Não há dados na tabela equipe")
        if not repository_ok:
            print("   ❌ Repository não está funcionando")
        if not services_ok:
            print("   ❌ Services não está funcionando")
        if not frontend_ok:
            print("   ❌ Controller não está funcionando")

if __name__ == "__main__":
    asyncio.run(main()) 