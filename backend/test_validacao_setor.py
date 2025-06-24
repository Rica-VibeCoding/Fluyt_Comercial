#!/usr/bin/env python3
"""
Teste Validação Setor - Investigar erro específico
"""

import sys
import os
sys.path.append(os.path.dirname(os.path.abspath(__file__)))

def test_validacao_setor():
    """Testa validação específica do setor que está falhando"""
    
    print("🔬 TESTE VALIDAÇÃO SETOR")
    print("=" * 40)
    
    try:
        print("1️⃣ Testando get_admin_database()...")
        from core.database import get_admin_database
        
        admin_db = get_admin_database()
        print("   ✅ get_admin_database() funcionou")
        
        print("\n2️⃣ Testando acesso direto à tabela cad_setores...")
        setor_id = "2faea93f-ed12-476a-8320-48ee7cda5695"
        
        # Teste direto no admin db
        result = admin_db.table('cad_setores').select('id, nome').eq('id', setor_id).execute()
        
        print(f"   📋 Resultado da query:")
        print(f"      Data: {result.data}")
        print(f"      Count: {getattr(result, 'count', 'N/A')}")
        
        if result.data:
            print("   ✅ Setor encontrado no admin DB")
            setor = result.data[0]
            print(f"      Nome: {setor.get('nome')}")
            print(f"      ID: {setor.get('id')}")
        else:
            print("   ❌ Setor NÃO encontrado no admin DB")
        
        print("\n3️⃣ Testando através da função validar_relacionamentos...")
        from modules.equipe.services import FuncionarioService
        
        service = FuncionarioService()
        
        # Testar validação
        resultado_validacao = service.validar_relacionamentos(
            loja_id=None,  # Não testar loja por enquanto
            setor_id=setor_id
        )
        
        print("   ✅ Validação de relacionamentos funcionou!")
        print(f"      Resultado: {resultado_validacao}")
        
        return True
        
    except Exception as e:
        print(f"\n❌ ERRO NA VALIDAÇÃO: {e}")
        print(f"   Tipo: {type(e).__name__}")
        import traceback
        traceback.print_exc()
        return False

def test_dados_frontend():
    """Testa os dados exatos que vieram do frontend"""
    
    print("\n" + "=" * 40)
    print("🔬 TESTE DADOS FRONTEND")
    print("=" * 40)
    
    try:
        print("1️⃣ Simulando dados do frontend...")
        
        # Dados exatos do modal
        dados_frontend = {
            "nome": "RICARDO NILTON BOR",
            "email": "ricardo.nilttdon@hotmail.com",
            "telefone": "(11) 94737-2389",
            "perfil": "VENDEDOR",  # Tipo de Funcionário: Vendedor
            "nivel_acesso": "USUARIO",  # Nível de Acesso: Usuário
            "loja_id": "PRECISA_DESCOBRIR",  # Teste Loja 231233
            "setor_id": "2faea93f-ed12-476a-8320-48ee7cda5695",  # Vendas
            "salario": 2000.0,
            "data_admissao": "2025-06-25",  # 25/06/2025
            "limite_desconto": 10.0,
            "comissao_percentual_vendedor": 5.0,  # Comissão 5%
            "tem_minimo_garantido": True,
            "valor_minimo_garantido": 0.0
        }
        
        print("   📋 Dados preparados:")
        for key, value in dados_frontend.items():
            print(f"      {key}: {value}")
        
        print("\n2️⃣ Buscando loja 'Teste Loja 231233'...")
        from core.database import get_database
        
        db = get_database()
        loja_result = db.table('c_lojas').select('id, nome').ilike('nome', '%teste%').execute()
        
        print(f"   📊 Lojas encontradas: {len(loja_result.data)}")
        for loja in loja_result.data:
            print(f"      {loja['nome']} - {loja['id']}")
            if "teste" in loja['nome'].lower():
                dados_frontend['loja_id'] = loja['id']
                print(f"   ✅ Loja selecionada: {loja['nome']}")
        
        print("\n3️⃣ Testando criação com dados corrigidos...")
        from modules.equipe.services import FuncionarioService
        from modules.equipe.schemas import FuncionarioCreate
        from core.auth import User
        
        # Usuário admin mock
        user = User(
            id="admin-test",
            email="admin@test.com",
            nome="Admin Test",
            perfil="ADMIN_MASTER",
            loja_id="f486a675-06a1-4162-91e3-3b8b96690ed6"
        )
        
        # Criar schema
        funcionario_data = FuncionarioCreate(**dados_frontend)
        
        print("   ✅ Schema FuncionarioCreate criado com sucesso")
        print(f"      Nome: {funcionario_data.nome}")
        print(f"      Setor ID: {funcionario_data.setor_id}")
        
        # Testar service (sem salvar)
        service = FuncionarioService()
        
        # Só testar validação, não criar de fato
        resultado_validacao = service.validar_relacionamentos(
            loja_id=dados_frontend['loja_id'],
            setor_id=dados_frontend['setor_id']
        )
        
        print("   ✅ Validação de relacionamentos OK!")
        print(f"      Resultado: {resultado_validacao}")
        
        return True
        
    except Exception as e:
        print(f"\n❌ ERRO NOS DADOS FRONTEND: {e}")
        print(f"   Tipo: {type(e).__name__}")
        import traceback
        traceback.print_exc()
        return False

if __name__ == "__main__":
    print("🚀 Investigando erro de validação de setor\n")
    
    # Teste 1: Validação de setor isolada
    setor_ok = test_validacao_setor()
    
    # Teste 2: Dados do frontend
    frontend_ok = test_dados_frontend()
    
    print("\n" + "=" * 40)
    print("📊 DIAGNÓSTICO")
    print("=" * 40)
    print(f"Validação Setor:   {'✅ OK' if setor_ok else '❌ FALHA'}")
    print(f"Dados Frontend:    {'✅ OK' if frontend_ok else '❌ FALHA'}")
    
    if setor_ok and frontend_ok:
        print("\n🎯 PROBLEMA PODE ESTAR EM OUTRO LUGAR")
        print("   - Middleware interferindo")
        print("   - Conversão de dados no controller")
        print("   - Headers da requisição")
    else:
        print("\n🎯 PROBLEMA ENCONTRADO NA VALIDAÇÃO") 