import os
from supabase import create_client, Client

# Tentar criar um cliente Supabase e verificar os atributos
print("🔍 Testando cliente Supabase...")

try:
    # Mock de configurações para teste
    url = "https://example.supabase.co"
    key = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InRlc3QiLCJyb2xlIjoiYW5vbiIsImlhdCI6MTY0MzI2OTY4NSwiZXhwIjoxOTU4ODQ1Njg1fQ.test"
    
    client = create_client(url, key)
    print(f"✅ Cliente criado: {type(client)}")
    
    # Verificar atributos
    print(f"📋 Atributos do cliente: {dir(client)}")
    
    # Verificar especificamente auth
    if hasattr(client, 'auth'):
        print(f"✅ Atributo 'auth' encontrado: {type(client.auth)}")
        print(f"📋 Métodos do auth: {dir(client.auth)}")
    else:
        print("❌ Atributo 'auth' NÃO encontrado")
        
    # Verificar table
    if hasattr(client, 'table'):
        print(f"✅ Atributo 'table' encontrado")
    else:
        print("❌ Atributo 'table' NÃO encontrado")
    
except Exception as e:
    print(f"❌ Erro ao criar cliente: {e}")
    print(f"Tipo do erro: {type(e)}") 