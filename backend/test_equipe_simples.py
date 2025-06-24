#!/usr/bin/env python3
"""
Teste simplificado para equipe - identificar problema específico
"""
import os
import sys
import json
from datetime import datetime
from dotenv import load_dotenv

# Carrega variáveis de ambiente
load_dotenv()

# Adiciona o backend ao path
sys.path.append(os.path.dirname(os.path.abspath(__file__)))

# Imports locais
from core.database import get_database
from modules.equipe.repository import FuncionarioRepository

def test_direct_create():
    """Teste direto de criação sem passar pelo FastAPI"""
    try:
        print("🧪 Testando criação direta no repository...")
        
        # Conectar banco
        db = get_database()
        repo = FuncionarioRepository(db)
        
        # Dados simples para teste
        dados_teste = {
            'nome': 'Funcionário Teste',
            'email': 'teste@funcionario.com',
            'telefone': '11999999999',
            'perfil': 'VENDEDOR',
            'nivel_acesso': 'USUARIO',
            'loja_id': '317c3115-e071-40a6-9bc5-7c3227e0d82c',
            'salario': 3000.00,
            'data_admissao': '2025-01-01',
            'ativo': True
        }
        
        print(f"Dados de teste: {dados_teste}")
        
        # Tentar criar
        resultado = repo.criar(dados_teste)
        print(f"✅ Funcionário criado com sucesso!")
        print(f"ID: {resultado['id']}")
        print(f"Nome: {resultado['nome']}")
        
        # Limpar teste - deletar o funcionário criado
        try:
            db.table('cad_equipe').delete().eq('id', resultado['id']).execute()
            print("🧹 Funcionário de teste removido")
        except:
            pass
            
    except Exception as e:
        print(f"❌ Erro na criação direta: {str(e)}")
        import traceback
        traceback.print_exc()

def test_validation():
    """Teste da validação de relacionamentos"""
    try:
        print("🔍 Testando validação de relacionamentos...")
        
        from modules.equipe.services import FuncionarioService
        service = FuncionarioService()
        
        # Testar validação direta
        result = service.validar_relacionamentos(
            loja_id='317c3115-e071-40a6-9bc5-7c3227e0d82c',
            setor_id=None
        )
        print(f"✅ Validação passou: {result}")
        
    except Exception as e:
        print(f"❌ Erro na validação: {str(e)}")
        import traceback
        traceback.print_exc()

def test_service_create():
    """Teste criação via service (que estava falhando)"""
    try:
        print("\n🎯 Testando criação via service...")
        
        from modules.equipe.services import FuncionarioService
        from modules.equipe.schemas import FuncionarioCreate
        from core.auth import User
        
        # Mock user
        user = User(
            id='12345',
            nome='Ricardo Teste',
            email='ricardo@teste.com',
            perfil='ADMIN_MASTER',
            loja_id='317c3115-e071-40a6-9bc5-7c3227e0d82c'
        )
        
        service = FuncionarioService()
        
        # Dados para criação
        dados = FuncionarioCreate(
            nome='Funcionário Teste Service',
            email='teste.service@funcionario.com',
            telefone='11999999999',
            perfil='VENDEDOR',
            nivel_acesso='USUARIO',
            loja_id='317c3115-e071-40a6-9bc5-7c3227e0d82c',
            salario=3000.00
        )
        
        print(f"Dados para service: {dados.model_dump()}")
        
        # Tentar criar via service
        resultado = service.criar_funcionario(dados, user)
        print(f"✅ Funcionário criado via service!")
        print(f"ID: {resultado.id}")
        print(f"Nome: {resultado.nome}")
        
        # Limpar teste
        try:
            db = get_database()
            db.table('cad_equipe').delete().eq('id', resultado.id).execute()
            print("🧹 Funcionário de teste removido")
        except:
            pass
            
    except Exception as e:
        print(f"❌ Erro na criação via service: {str(e)}")
        import traceback
        traceback.print_exc()

if __name__ == "__main__":
    print("🚀 Iniciando testes simplificados de equipe\n")
    
    test_validation()
    test_direct_create()
    test_service_create()
    
    print("\n✅ Testes concluídos!") 