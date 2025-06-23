#!/usr/bin/env python3
"""
Script de teste para verificar integração completa da tabela equipe
"""
import requests
import json
from datetime import datetime

# URL base da API
API_URL = "http://localhost:8000/api/v1"

# Dados de login (ajuste conforme necessário)
LOGIN_DATA = {
    "email": "ricardo.nilton@hotmail.com",
    "password": "123456"
}

def fazer_login():
    """Realiza login e retorna o token JWT"""
    print("🔐 Fazendo login...")
    response = requests.post(f"{API_URL}/auth/login", json=LOGIN_DATA)
    
    if response.status_code == 200:
        data = response.json()
        print(f"✅ Login realizado com sucesso!")
        print(f"   Usuário: {data.get('user', {}).get('nome', 'N/A')}")
        return data.get('access_token')
    else:
        print(f"❌ Erro no login: {response.status_code}")
        print(f"   Resposta: {response.text}")
        return None

def testar_listagem_funcionarios(token):
    """Testa endpoint de listagem de funcionários"""
    print("\n📋 Testando listagem de funcionários...")
    
    headers = {"Authorization": f"Bearer {token}"}
    response = requests.get(f"{API_URL}/equipe/", headers=headers)
    
    if response.status_code == 200:
        data = response.json()
        print(f"✅ Listagem realizada com sucesso!")
        print(f"   Total de funcionários: {data.get('total', 0)}")
        print(f"   Página: {data.get('page', 1)} de {data.get('pages', 1)}")
        
        # Mostra alguns funcionários
        items = data.get('items', [])
        if items:
            print("\n   Funcionários encontrados:")
            for func in items[:3]:  # Mostra até 3
                print(f"   - {func.get('nome')} ({func.get('perfil')}) - {func.get('email')}")
        else:
            print("   ⚠️  Nenhum funcionário cadastrado")
            
        return True
    else:
        print(f"❌ Erro na listagem: {response.status_code}")
        print(f"   Resposta: {response.text}")
        return False

def testar_busca_funcionario(token, funcionario_id):
    """Testa busca de funcionário específico"""
    print(f"\n🔍 Testando busca de funcionário ID: {funcionario_id}...")
    
    headers = {"Authorization": f"Bearer {token}"}
    response = requests.get(f"{API_URL}/equipe/{funcionario_id}", headers=headers)
    
    if response.status_code == 200:
        data = response.json()
        print(f"✅ Funcionário encontrado!")
        print(f"   Nome: {data.get('nome')}")
        print(f"   Email: {data.get('email')}")
        print(f"   Perfil: {data.get('perfil')}")
        print(f"   Loja: {data.get('loja_nome', 'N/A')}")
        print(f"   Setor: {data.get('setor_nome', 'N/A')}")
        return True
    else:
        print(f"❌ Erro na busca: {response.status_code}")
        print(f"   Resposta: {response.text}")
        return False

def testar_criar_funcionario(token, loja_id=None):
    """Testa criação de novo funcionário"""
    print("\n➕ Testando criação de funcionário...")
    
    # Dados do novo funcionário
    novo_funcionario = {
        "nome": f"Teste API {datetime.now().strftime('%H%M%S')}",
        "email": f"teste{datetime.now().strftime('%H%M%S')}@fluyt.com",
        "telefone": "(11) 99999-9999",
        "perfil": "VENDEDOR",
        "nivel_acesso": "USUARIO",
        "salario": 3500.00,
        "data_admissao": datetime.now().strftime("%Y-%m-%d")
    }
    
    # Se foi fornecido loja_id, adicionar
    if loja_id:
        novo_funcionario["loja_id"] = loja_id
    
    headers = {"Authorization": f"Bearer {token}"}
    response = requests.post(f"{API_URL}/equipe/", headers=headers, json=novo_funcionario)
    
    if response.status_code == 201:
        data = response.json()
        print(f"✅ Funcionário criado com sucesso!")
        print(f"   ID: {data.get('id')}")
        print(f"   Nome: {data.get('nome')}")
        print(f"   Email: {data.get('email')}")
        return data.get('id')
    else:
        print(f"❌ Erro na criação: {response.status_code}")
        print(f"   Resposta: {response.text}")
        return None

def testar_endpoint_publico():
    """Testa endpoint público (sem autenticação)"""
    print("\n🌐 Testando endpoint público...")
    
    response = requests.get(f"{API_URL}/equipe/test/public")
    
    if response.status_code == 200:
        data = response.json()
        print(f"✅ Endpoint público funcionando!")
        print(f"   Mensagem: {data.get('message')}")
        print(f"   Auth requerida: {data.get('auth_required')}")
        return True
    else:
        print(f"❌ Erro no endpoint público: {response.status_code}")
        return False

def main():
    """Executa todos os testes"""
    print("🚀 Iniciando testes da API de Equipe\n")
    
    # Teste 1: Endpoint público
    testar_endpoint_publico()
    
    # Teste 2: Login
    token = fazer_login()
    if not token:
        print("\n❌ Não foi possível obter token. Encerrando testes.")
        return
    
    # Teste 3: Listagem
    if testar_listagem_funcionarios(token):
        # Se houver funcionários, tenta buscar o primeiro
        headers = {"Authorization": f"Bearer {token}"}
        response = requests.get(f"{API_URL}/equipe/", headers=headers)
        if response.status_code == 200:
            items = response.json().get('items', [])
            if items:
                # Teste 4: Busca específica
                testar_busca_funcionario(token, items[0]['id'])
    
    # Teste 5: Criar novo funcionário
    # Primeiro, buscar uma loja válida dos funcionários existentes
    loja_id = None
    headers = {"Authorization": f"Bearer {token}"}
    response = requests.get(f"{API_URL}/equipe/", headers=headers)
    if response.status_code == 200:
        items = response.json().get('items', [])
        if items and items[0].get('loja_id'):
            loja_id = items[0]['loja_id']
            print(f"\n📍 Usando loja_id: {loja_id}")
    
    novo_id = testar_criar_funcionario(token, loja_id)
    
    if novo_id:
        # Teste 6: Buscar o funcionário criado
        testar_busca_funcionario(token, novo_id)
    
    print("\n✅ Testes concluídos!")

if __name__ == "__main__":
    main()