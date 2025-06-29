#!/usr/bin/env python3
"""
Script para validar se as chaves do .env estão corretas
"""
import os
import re
from pathlib import Path

def validate_env_file():
    """Valida se o arquivo .env tem chaves válidas"""
    env_file = Path(".env")
    
    if not env_file.exists():
        print("❌ Arquivo .env não encontrado!")
        return False
    
    print("🔍 Validando arquivo .env...")
    
    with open(env_file, 'r', encoding='utf-8') as f:
        content = f.read()
    
    # Padrões para validar
    patterns = {
        'SUPABASE_URL': r'SUPABASE_URL=https://\w+\.supabase\.co',
        'SUPABASE_ANON_KEY': r'SUPABASE_ANON_KEY=eyJ[A-Za-z0-9_-]+\.[A-Za-z0-9_-]+\.[A-Za-z0-9_-]+',
        'SUPABASE_SERVICE_KEY': r'SUPABASE_SERVICE_KEY=eyJ[A-Za-z0-9_-]+\.[A-Za-z0-9_-]+\.[A-Za-z0-9_-]+',
        'JWT_SECRET_KEY': r'JWT_SECRET_KEY=.+'
    }
    
    all_valid = True
    
    for key, pattern in patterns.items():
        if re.search(pattern, content):
            print(f"✅ {key}: Válido")
        else:
            print(f"❌ {key}: Inválido ou não encontrado")
            all_valid = False
    
    # Verificar se as chaves JWT não estão quebradas
    lines = content.split('\n')
    for line in lines:
        if 'SUPABASE_' in line and '=' in line:
            key, value = line.split('=', 1)
            if key.strip() in ['SUPABASE_ANON_KEY', 'SUPABASE_SERVICE_KEY']:
                if len(value.strip()) < 100:  # JWT deve ter mais de 100 chars
                    print(f"⚠️  {key.strip()}: Muito curto, pode estar quebrado")
                    all_valid = False
                elif '\n' in value or '\r' in value:
                    print(f"⚠️  {key.strip()}: Contém quebras de linha")
                    all_valid = False
    
    if all_valid:
        print("\n🎉 Arquivo .env está válido!")
    else:
        print("\n💥 Arquivo .env tem problemas!")
    
    return all_valid

if __name__ == "__main__":
    validate_env_file() 