#!/usr/bin/env python3
"""
Script para configurar URLs de autenticação no Supabase
"""
import os
import requests
from dotenv import load_dotenv

# Carregar variáveis de ambiente
load_dotenv('backend/.env')

SUPABASE_URL = os.getenv('SUPABASE_URL')
SUPABASE_SERVICE_KEY = os.getenv('SUPABASE_SERVICE_KEY')

# Extrair o project_ref da URL
project_ref = SUPABASE_URL.split('//')[1].split('.')[0]

# URLs que queremos configurar
SITE_URL = "http://localhost:3000"
REDIRECT_URLS = [
    "http://localhost:3000/auth/callback",
    "http://localhost:3000/painel",
    "http://127.0.0.1:3000/auth/callback",
    "http://127.0.0.1:3000/painel"
]

print(f"Projeto Supabase: {project_ref}")
print(f"Site URL: {SITE_URL}")
print(f"Redirect URLs: {REDIRECT_URLS}")

# NOTA: A API de gerenciamento do Supabase requer autenticação adicional
# Este é um exemplo de como seria a requisição, mas precisaria de:
# 1. Token de acesso do dashboard (não apenas service key)
# 2. Endpoints específicos da Management API

"""
# Exemplo de como seria a requisição (não funcionará sem token apropriado):
headers = {
    'Authorization': f'Bearer {SUPABASE_SERVICE_KEY}',
    'Content-Type': 'application/json'
}

# Endpoint hipotético - a API real pode ser diferente
management_api_url = f"https://api.supabase.com/v1/projects/{project_ref}/config/auth"

data = {
    'site_url': SITE_URL,
    'redirect_urls': REDIRECT_URLS
}

# response = requests.patch(management_api_url, json=data, headers=headers)
"""

print("\n⚠️  IMPORTANTE:")
print("As configurações de Site URL e Redirect URLs precisam ser feitas manualmente no dashboard do Supabase:")
print(f"1. Acesse: {SUPABASE_URL}")
print("2. Vá para Authentication > URL Configuration")
print("3. Configure:")
print(f"   - Site URL: {SITE_URL}")
print("   - Redirect URLs:")
for url in REDIRECT_URLS:
    print(f"     - {url}")