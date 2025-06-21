#!/usr/bin/env python3
"""
Script para redefinir senha diretamente no Supabase
Útil quando o email não está funcionando
"""

import os
import sys
from pathlib import Path
from supabase import create_client, Client
from getpass import getpass

# Adicionar o diretório backend ao path
sys.path.append(str(Path(__file__).parent))

# Carregar variáveis de ambiente
from dotenv import load_dotenv
load_dotenv()

def resetar_senha():
    """Reseta a senha de um usuário diretamente"""
    try:
        url = os.getenv('SUPABASE_URL')
        service_key = os.getenv('SUPABASE_SERVICE_KEY')
        
        if not url or not service_key:
            print("❌ Erro: Variáveis de ambiente não encontradas")
            return
            
        supabase: Client = create_client(url, service_key)
        
        print("🔐 Reset de Senha - Fluyt Comercial")
        print("-" * 40)
        
        # Pedir o email
        email = input("Digite o email do usuário: ").strip()
        if not email:
            print("❌ Email não pode estar vazio")
            return
            
        # Verificar se o usuário existe
        auth_users = supabase.auth.admin.list_users()
        user_found = None
        
        for user in auth_users:
            if user.email == email:
                user_found = user
                break
                
        if not user_found:
            print(f"❌ Usuário com email '{email}' não encontrado")
            return
            
        print(f"✅ Usuário encontrado: {user_found.email}")
        print(f"   ID: {user_found.id}")
        
        # Pedir a nova senha
        print("\nDigite a nova senha (mínimo 6 caracteres)")
        nova_senha = getpass("Nova senha: ")
        
        if len(nova_senha) < 6:
            print("❌ A senha deve ter pelo menos 6 caracteres")
            return
            
        confirma_senha = getpass("Confirme a senha: ")
        
        if nova_senha != confirma_senha:
            print("❌ As senhas não coincidem")
            return
            
        # Atualizar a senha
        print("\n🔄 Atualizando senha...")
        
        try:
            # Usar a API admin para atualizar o usuário
            result = supabase.auth.admin.update_user_by_id(
                user_found.id,
                {"password": nova_senha}
            )
            
            print("✅ Senha atualizada com sucesso!")
            print(f"\n📧 Email: {email}")
            print(f"🔑 Senha: [definida por você]")
            print("\nAgora você pode fazer login em http://localhost:3000/login")
            
        except Exception as e:
            print(f"❌ Erro ao atualizar senha: {str(e)}")
            
    except Exception as e:
        print(f"❌ Erro: {str(e)}")

if __name__ == "__main__":
    resetar_senha()