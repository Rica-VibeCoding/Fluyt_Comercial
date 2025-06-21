#!/usr/bin/env python3
"""
Script para criar usuário de teste no Supabase
"""

import asyncio
import sys
from pathlib import Path

# Adicionar o diretório backend ao path
sys.path.append(str(Path(__file__).parent))

from core.database import get_database
from core.auth import get_password_hash

async def criar_usuario_teste():
    """Cria um usuário de teste no banco de dados"""
    try:
        db = get_database()
        
        # Dados do usuário de teste
        email = "teste@fluyt.com"
        senha = "senha123"
        senha_hash = get_password_hash(senha)
        
        # Verificar se usuário já existe
        existing = await db.table('funcionarios').select('*').eq('email', email).execute()
        
        if existing.data:
            print(f"✅ Usuário de teste já existe: {email}")
            return
        
        # Criar usuário
        user_data = {
            'email': email,
            'senha': senha_hash,
            'nome': 'Usuário Teste',
            'perfil': 'ADMIN',
            'loja_id': 'loja-teste-123',
            'empresa_id': 'empresa-teste-123',
            'ativo': True,
            'funcao': 'Administrador'
        }
        
        result = await db.table('funcionarios').insert(user_data).execute()
        
        if result.data:
            print(f"✅ Usuário de teste criado com sucesso!")
            print(f"📧 Email: {email}")
            print(f"🔑 Senha: {senha}")
        else:
            print("❌ Erro ao criar usuário")
            
    except Exception as e:
        print(f"❌ Erro: {str(e)}")
        print("\n💡 Dica: Certifique-se de que o backend está configurado corretamente")
        print("   e que as variáveis de ambiente estão definidas.")

if __name__ == "__main__":
    asyncio.run(criar_usuario_teste())