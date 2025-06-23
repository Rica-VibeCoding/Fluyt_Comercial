#!/usr/bin/env python3
"""
Teste simples e direto da API de equipe
"""
import subprocess
import json

# 1. Fazer login
print("1. Fazendo login...")
login_cmd = '''curl -s -X POST http://localhost:8000/api/v1/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email": "ricardo.nilton@hotmail.com", "password": "123456"}' '''

result = subprocess.run(login_cmd, shell=True, capture_output=True, text=True)
if result.returncode == 0:
    login_data = json.loads(result.stdout)
    if login_data.get('access_token'):
        token = login_data['access_token']
        print(f"✅ Login OK - Token obtido")
        
        # 2. Listar funcionários
        print("\n2. Listando funcionários...")
        list_cmd = f'''curl -s -X GET http://localhost:8000/api/v1/equipe/ \
          -H "Authorization: Bearer {token}"'''
        
        result = subprocess.run(list_cmd, shell=True, capture_output=True, text=True)
        if result.returncode == 0:
            equipe_data = json.loads(result.stdout)
            print(f"✅ Listagem OK - Total: {equipe_data.get('total', 0)} funcionários")
            
            # Mostrar alguns funcionários
            items = equipe_data.get('items', [])
            for i, func in enumerate(items[:3]):
                print(f"   {i+1}. {func.get('nome')} - {func.get('perfil')} - {func.get('email')}")
        else:
            print(f"❌ Erro na listagem: {result.stderr}")
    else:
        print(f"❌ Login falhou: {login_data}")
else:
    print(f"❌ Erro no curl: {result.stderr}")

print("\n✅ Teste concluído!")