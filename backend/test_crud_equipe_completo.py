#!/usr/bin/env python3
"""
Teste CRUD Completo - Equipe
Identifica problemas específicos em cada operação
"""
import requests
import json
import time
from datetime import datetime

# Configurações
API_URL = "http://localhost:8000/api/v1"
LOGIN_DATA = {
    "email": "ricardo.nilton@hotmail.com",
    "password": "123456"
}

class TesteCRUDEquipe:
    def __init__(self):
        self.token = None
        self.funcionario_teste_id = None
        
    def fazer_login(self):
        """Faz login e obtém token"""
        print("🔐 Fazendo login...")
        
        try:
            response = requests.post(f"{API_URL}/auth/login", json=LOGIN_DATA, timeout=10)
            
            if response.status_code == 200:
                data = response.json()
                self.token = data.get('access_token')
                print(f"   ✅ Login OK! Usuário: {data.get('user', {}).get('nome', 'N/A')}")
                return True
            else:
                print(f"   ❌ Erro login: {response.status_code} - {response.text}")
                return False
                
        except Exception as e:
            print(f"   ❌ Erro login: {str(e)}")
            return False
    
    def get_headers(self):
        """Retorna headers com token"""
        return {"Authorization": f"Bearer {self.token}"}
    
    def teste_1_listar_funcionarios(self):
        """Teste 1: Listar funcionários existentes"""
        print("\n1️⃣ TESTE: Listar funcionários")
        print("-" * 40)
        
        try:
            response = requests.get(f"{API_URL}/equipe/", headers=self.get_headers(), timeout=10)
            
            if response.status_code == 200:
                data = response.json()
                print(f"   ✅ Listagem OK!")
                print(f"   📊 Total: {data.get('total', 0)} funcionários")
                
                # Mostrar alguns funcionários
                items = data.get('items', [])
                for i, func in enumerate(items[:3]):
                    print(f"   - {func.get('nome')} ({func.get('perfil')}) - {func.get('email')}")
                
                return True, data
            else:
                print(f"   ❌ Erro listagem: {response.status_code}")
                print(f"   📄 Response: {response.text}")
                return False, None
                
        except Exception as e:
            print(f"   ❌ Erro listagem: {str(e)}")
            return False, None
    
    def teste_2_criar_funcionario(self):
        """Teste 2: Criar novo funcionário"""
        print("\n2️⃣ TESTE: Criar funcionário")
        print("-" * 40)
        
        # Dados do novo funcionário - testando diferentes formatos
        funcionarios_teste = [
            {
                "nome": f"Teste CRUD {datetime.now().strftime('%H%M%S')}",
                "email": f"teste.crud.{datetime.now().strftime('%H%M%S')}@fluyt.com",
                "telefone": "11999999999",
                "perfil": "VENDEDOR",
                "nivel_acesso": "USUARIO",
                "loja_id": "317c3115-e071-40a6-9bc5-7c3227e0d82c",
                "salario": 3000.00,
                "data_admissao": "2025-01-15",
                "ativo": True
            },
            {
                "nome": f"Teste Mínimo {datetime.now().strftime('%H%M%S')}",
                "email": f"teste.min.{datetime.now().strftime('%H%M%S')}@fluyt.com"
            }
        ]
        
        for i, dados in enumerate(funcionarios_teste, 1):
            print(f"\n   🧪 Teste {i}: {dados['nome']}")
            print(f"   📦 Payload: {json.dumps(dados, indent=2)}")
            
            try:
                response = requests.post(
                    f"{API_URL}/equipe/", 
                    headers=self.get_headers(), 
                    json=dados,
                    timeout=15
                )
                
                print(f"   📡 Status: {response.status_code}")
                print(f"   📄 Response: {response.text[:200]}...")
                
                if response.status_code == 201:
                    data = response.json()
                    funcionario_id = data.get('id')
                    print(f"   ✅ Criação OK! ID: {funcionario_id}")
                    
                    # Guardar o primeiro ID para testes posteriores
                    if not self.funcionario_teste_id:
                        self.funcionario_teste_id = funcionario_id
                    
                    return True, funcionario_id
                else:
                    print(f"   ❌ Erro criação: {response.status_code}")
                    
                    # Tentar extrair erro específico
                    try:
                        error_data = response.json()
                        print(f"   🔍 Erro específico: {error_data.get('message', 'N/A')}")
                        print(f"   🔍 Tipo erro: {error_data.get('error', 'N/A')}")
                    except:
                        pass
                        
            except Exception as e:
                print(f"   ❌ Erro criação: {str(e)}")
        
        return False, None
    
    def teste_3_buscar_funcionario(self, funcionario_id):
        """Teste 3: Buscar funcionário específico"""
        print(f"\n3️⃣ TESTE: Buscar funcionário {funcionario_id}")
        print("-" * 40)
        
        try:
            response = requests.get(
                f"{API_URL}/equipe/{funcionario_id}", 
                headers=self.get_headers(), 
                timeout=10
            )
            
            if response.status_code == 200:
                data = response.json()
                print(f"   ✅ Busca OK!")
                print(f"   👤 Nome: {data.get('nome')}")
                print(f"   📧 Email: {data.get('email')}")
                print(f"   🏢 Loja: {data.get('loja_nome', 'N/A')}")
                return True, data
            else:
                print(f"   ❌ Erro busca: {response.status_code}")
                print(f"   📄 Response: {response.text}")
                return False, None
                
        except Exception as e:
            print(f"   ❌ Erro busca: {str(e)}")
            return False, None
    
    def teste_4_atualizar_funcionario(self, funcionario_id):
        """Teste 4: Atualizar funcionário"""
        print(f"\n4️⃣ TESTE: Atualizar funcionário {funcionario_id}")
        print("-" * 40)
        
        dados_atualizacao = {
            "telefone": "11888888888",
            "salario": 3500.00,
            "perfil": "GERENTE"
        }
        
        print(f"   📦 Dados: {json.dumps(dados_atualizacao, indent=2)}")
        
        try:
            response = requests.put(
                f"{API_URL}/equipe/{funcionario_id}", 
                headers=self.get_headers(), 
                json=dados_atualizacao,
                timeout=10
            )
            
            if response.status_code == 200:
                data = response.json()
                print(f"   ✅ Atualização OK!")
                print(f"   📞 Novo telefone: {data.get('telefone')}")
                print(f"   💰 Novo salário: {data.get('salario')}")
                return True, data
            else:
                print(f"   ❌ Erro atualização: {response.status_code}")
                print(f"   📄 Response: {response.text}")
                return False, None
                
        except Exception as e:
            print(f"   ❌ Erro atualização: {str(e)}")
            return False, None
    
    def teste_5_excluir_funcionario(self, funcionario_id):
        """Teste 5: Excluir funcionário"""
        print(f"\n5️⃣ TESTE: Excluir funcionário {funcionario_id}")
        print("-" * 40)
        
        try:
            response = requests.delete(
                f"{API_URL}/equipe/{funcionario_id}", 
                headers=self.get_headers(), 
                timeout=10
            )
            
            if response.status_code == 200:
                print(f"   ✅ Exclusão OK!")
                return True
            else:
                print(f"   ❌ Erro exclusão: {response.status_code}")
                print(f"   📄 Response: {response.text}")
                return False
                
        except Exception as e:
            print(f"   ❌ Erro exclusão: {str(e)}")
            return False
    
    def executar_todos_testes(self):
        """Executa todos os testes em sequência"""
        print("🚀 INICIANDO TESTE CRUD COMPLETO - EQUIPE")
        print("=" * 50)
        
        # Login
        if not self.fazer_login():
            print("❌ Falha no login. Encerrando testes.")
            return
        
        # Teste 1: Listar
        sucesso_listar, dados_lista = self.teste_1_listar_funcionarios()
        
        # Teste 2: Criar
        sucesso_criar, funcionario_id = self.teste_2_criar_funcionario()
        
        if sucesso_criar and funcionario_id:
            # Teste 3: Buscar
            sucesso_buscar, dados_funcionario = self.teste_3_buscar_funcionario(funcionario_id)
            
            # Teste 4: Atualizar
            sucesso_atualizar, dados_atualizados = self.teste_4_atualizar_funcionario(funcionario_id)
            
            # Teste 5: Excluir
            sucesso_excluir = self.teste_5_excluir_funcionario(funcionario_id)
        
        # Relatório final
        print("\n" + "=" * 50)
        print("📊 RELATÓRIO FINAL")
        print("=" * 50)
        print(f"✅ Login: {'OK' if self.token else 'FALHOU'}")
        print(f"✅ Listar: {'OK' if sucesso_listar else 'FALHOU'}")
        print(f"✅ Criar: {'OK' if sucesso_criar else 'FALHOU'}")
        
        if sucesso_criar:
            print(f"✅ Buscar: {'OK' if sucesso_buscar else 'FALHOU'}")
            print(f"✅ Atualizar: {'OK' if sucesso_atualizar else 'FALHOU'}")
            print(f"✅ Excluir: {'OK' if sucesso_excluir else 'FALHOU'}")

if __name__ == "__main__":
    teste = TesteCRUDEquipe()
    teste.executar_todos_testes() 