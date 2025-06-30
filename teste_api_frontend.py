#!/usr/bin/env python3
"""
Testar API como o frontend faria - simular requisição HTTP
"""
import requests
import json

def teste_api_ambientes():
    base_url = "http://localhost:8000/api/v1"
    
    # Simular token de autenticação (precisaria estar logado)
    headers = {
        "Content-Type": "application/json",
        "Accept": "application/json"
    }
    
    try:
        print("🔍 TESTE API AMBIENTES (via HTTP)")
        print("=" * 40)
        
        # Teste 1: Listar ambientes
        print("\n📋 GET /ambientes")
        response = requests.get(f"{base_url}/ambientes", headers=headers, timeout=5)
        print(f"Status: {response.status_code}")
        
        if response.status_code == 200:
            data = response.json()
            print(f"Total: {data.get('total', 0)} ambientes")
            
            if data.get('items'):
                primeiro = data['items'][0]
                print(f"Primeiro ambiente: {primeiro.get('nome', 'N/A')}")
                print(f"Tem materiais: {'materiais' in primeiro}")
                
        # Teste 2: Buscar ambiente específico com materiais
        if response.status_code == 200 and data.get('items'):
            primeiro_id = data['items'][0]['id']
            print(f"\n📦 GET /ambientes/{primeiro_id}?incluir_materiais=true")
            
            response2 = requests.get(
                f"{base_url}/ambientes/{primeiro_id}?incluir_materiais=true", 
                headers=headers, 
                timeout=5
            )
            print(f"Status: {response2.status_code}")
            
            if response2.status_code == 200:
                ambiente_completo = response2.json()
                materiais = ambiente_completo.get('materiais', {})
                
                if materiais:
                    print("✅ Materiais recebidos via API")
                    secoes = [k for k, v in materiais.items() if v and k != 'metadata']
                    print(f"Seções: {secoes}")
                else:
                    print("❌ Materiais NÃO recebidos via API")
        
    except requests.exceptions.ConnectionError:
        print("❌ Erro: Backend não está rodando (localhost:8000)")
    except Exception as e:
        print(f"❌ Erro: {str(e)}")

if __name__ == "__main__":
    teste_api_ambientes()