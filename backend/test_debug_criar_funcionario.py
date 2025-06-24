#!/usr/bin/env python3
"""
Debug específico - Criação de funcionário
Testa exatamente o payload que o frontend está enviando
"""
import requests
import json
from datetime import datetime

def teste_login():
    """Faz login e retorna token"""
    print("🔐 Fazendo login...")
    
    try:
        response = requests.post(
            "http://localhost:8000/api/v1/auth/login",
            json={
                "email": "ricardo.nilton@hotmail.com",
                "password": "123456"
            },
            timeout=10
        )
        
        if response.status_code == 200:
            token = response.json().get('access_token')
            print(f"✅ Login OK! Token: {token[:20]}...")
            return token
        else:
            print(f"❌ Login falhou: {response.status_code}")
            return None
            
    except Exception as e:
        print(f"❌ Erro no login: {str(e)}")
        return None

def teste_endpoint_publico():
    """Testa endpoint público"""
    print("\n🌐 Testando endpoint público...")
    
    try:
        response = requests.get("http://localhost:8000/api/v1/equipe/test/public", timeout=5)
        print(f"✅ Endpoint público: {response.status_code}")
        return True
    except Exception as e:
        print(f"❌ Erro endpoint público: {str(e)}")
        return False

def teste_listagem(token):
    """Testa listagem de funcionários"""
    print("\n📋 Testando listagem...")
    
    headers = {"Authorization": f"Bearer {token}"}
    
    try:
        response = requests.get("http://localhost:8000/api/v1/equipe/", headers=headers, timeout=10)
        
        if response.status_code == 200:
            data = response.json()
            print(f"✅ Listagem OK! Total: {data.get('total', 0)} funcionários")
            return True
        else:
            print(f"❌ Erro listagem: {response.status_code}")
            return False
            
    except Exception as e:
        print(f"❌ Erro na listagem: {str(e)}")
        return False

def teste_criacao_minima(token):
    """Testa criação com dados mínimos"""
    print("\n➕ Teste 1: Criação com dados mínimos...")
    
    headers = {
        "Authorization": f"Bearer {token}",
        "Content-Type": "application/json"
    }
    
    # Dados mínimos - apenas nome
    dados_minimos = {
        "nome": f"Teste Mínimo {datetime.now().strftime('%H%M%S')}"
    }
    
    print(f"📦 Payload: {json.dumps(dados_minimos, indent=2)}")
    
    try:
        response = requests.post(
            "http://localhost:8000/api/v1/equipe/",
            json=dados_minimos,
            headers=headers,
            timeout=15
        )
        
        print(f"📡 Status: {response.status_code}")
        print(f"📄 Response: {response.text[:500]}...")
        
        if response.status_code == 201:
            funcionario_id = response.json().get('id')
            print(f"✅ Criação mínima OK! ID: {funcionario_id}")
            return funcionario_id
        else:
            print(f"❌ Erro criação mínima: {response.status_code}")
            return None
            
    except Exception as e:
        print(f"❌ Erro na criação mínima: {str(e)}")
        return None

def teste_criacao_snake_case(token):
    """Testa criação com dados em snake_case (como backend espera)"""
    print("\n➕ Teste 2: Criação com snake_case...")
    
    headers = {
        "Authorization": f"Bearer {token}",
        "Content-Type": "application/json"
    }
    
    # Dados em snake_case
    dados_snake = {
        "nome": f"Teste Snake {datetime.now().strftime('%H%M%S')}",
        "email": f"teste.snake.{datetime.now().strftime('%H%M%S')}@fluyt.com",
        "telefone": "11999999999",
        "perfil": "VENDEDOR",
        "nivel_acesso": "USUARIO",
        "loja_id": "317c3115-e071-40a6-9bc5-7c3227e0d82c",
        "salario": 3000.00,
        "data_admissao": "2025-01-15"
    }
    
    print(f"📦 Payload: {json.dumps(dados_snake, indent=2)}")
    
    try:
        response = requests.post(
            "http://localhost:8000/api/v1/equipe/",
            json=dados_snake,
            headers=headers,
            timeout=15
        )
        
        print(f"📡 Status: {response.status_code}")
        print(f"📄 Response: {response.text[:500]}...")
        
        if response.status_code == 201:
            funcionario_id = response.json().get('id')
            print(f"✅ Criação snake_case OK! ID: {funcionario_id}")
            return funcionario_id
        else:
            print(f"❌ Erro criação snake_case: {response.status_code}")
            return None
            
    except Exception as e:
        print(f"❌ Erro na criação snake_case: {str(e)}")
        return None

def teste_criacao_camel_case(token):
    """Testa criação com dados em camelCase (como frontend envia)"""
    print("\n➕ Teste 3: Criação com camelCase...")
    
    headers = {
        "Authorization": f"Bearer {token}",
        "Content-Type": "application/json"
    }
    
    # Dados em camelCase (como frontend envia)
    dados_camel = {
        "nome": f"Teste Camel {datetime.now().strftime('%H%M%S')}",
        "email": f"teste.camel.{datetime.now().strftime('%H%M%S')}@fluyt.com",
        "telefone": "11999999999",
        "tipoFuncionario": "VENDEDOR",  # camelCase
        "nivelAcesso": "USUARIO",       # camelCase
        "lojaId": "317c3115-e071-40a6-9bc5-7c3227e0d82c",  # camelCase
        "salario": 3000.00,
        "dataAdmissao": "2025-01-15"    # camelCase
    }
    
    print(f"📦 Payload: {json.dumps(dados_camel, indent=2)}")
    
    try:
        response = requests.post(
            "http://localhost:8000/api/v1/equipe/",
            json=dados_camel,
            headers=headers,
            timeout=15
        )
        
        print(f"📡 Status: {response.status_code}")
        print(f"📄 Response: {response.text[:500]}...")
        
        if response.status_code == 201:
            funcionario_id = response.json().get('id')
            print(f"✅ Criação camelCase OK! ID: {funcionario_id}")
            return funcionario_id
        else:
            print(f"❌ Erro criação camelCase: {response.status_code}")
            
            # Tentar mostrar erro específico
            try:
                error_data = response.json()
                print(f"🔍 Erro detalhado: {json.dumps(error_data, indent=2)}")
            except:
                print(f"🔍 Response raw: {response.text}")
            
            return None
            
    except Exception as e:
        print(f"❌ Erro na criação camelCase: {str(e)}")
        return None

def limpar_funcionarios_teste(token, funcionario_ids):
    """Remove funcionários de teste"""
    print(f"\n🧹 Limpando {len(funcionario_ids)} funcionários de teste...")
    
    headers = {"Authorization": f"Bearer {token}"}
    
    for funcionario_id in funcionario_ids:
        try:
            response = requests.delete(
                f"http://localhost:8000/api/v1/equipe/{funcionario_id}",
                headers=headers,
                timeout=10
            )
            
            if response.status_code == 200:
                print(f"   ✅ Removido: {funcionario_id}")
            else:
                print(f"   ❌ Erro ao remover: {funcionario_id}")
                
        except Exception as e:
            print(f"   ❌ Erro ao remover {funcionario_id}: {str(e)}")

def main():
    """Executa todos os testes"""
    print("🚀 DEBUG ESPECÍFICO - CRIAÇÃO DE FUNCIONÁRIO")
    print("=" * 60)
    
    # Teste básico de conectividade
    if not teste_endpoint_publico():
        print("❌ Backend não está acessível. Verifique se está rodando.")
        return
    
    # Login
    token = teste_login()
    if not token:
        print("❌ Não foi possível fazer login. Verifique credenciais.")
        return
    
    # Teste listagem
    if not teste_listagem(token):
        print("❌ Problema na listagem. Verifique autenticação.")
        return
    
    funcionarios_criados = []
    
    # Teste 1: Dados mínimos
    id1 = teste_criacao_minima(token)
    if id1:
        funcionarios_criados.append(id1)
    
    # Teste 2: Snake case
    id2 = teste_criacao_snake_case(token)
    if id2:
        funcionarios_criados.append(id2)
    
    # Teste 3: Camel case (como frontend)
    id3 = teste_criacao_camel_case(token)
    if id3:
        funcionarios_criados.append(id3)
    
    # Limpeza
    if funcionarios_criados:
        limpar_funcionarios_teste(token, funcionarios_criados)
    
    # Relatório final
    print("\n" + "=" * 60)
    print("📊 RELATÓRIO FINAL")
    print("=" * 60)
    print(f"✅ Conectividade: OK")
    print(f"✅ Login: OK")
    print(f"✅ Listagem: OK")
    print(f"✅ Criação mínima: {'OK' if id1 else 'FALHOU'}")
    print(f"✅ Criação snake_case: {'OK' if id2 else 'FALHOU'}")
    print(f"✅ Criação camelCase: {'OK' if id3 else 'FALHOU'}")
    
    if not id3:
        print("\n🎯 PROBLEMA IDENTIFICADO: Criação com camelCase está falhando!")
        print("   O frontend envia dados em camelCase, mas o backend não está convertendo corretamente.")

if __name__ == "__main__":
    main() 