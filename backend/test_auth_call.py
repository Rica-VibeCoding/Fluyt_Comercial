import asyncio
from core.database import get_database

async def test_auth():
    print("🔍 Testando auth do cliente...")
    
    # Pegar o cliente da dependência
    db = get_database()
    print(f"✅ Cliente obtido: {type(db)}")
    
    # Verificar se auth existe
    if hasattr(db, 'auth'):
        print(f"✅ Atributo 'auth' encontrado: {type(db.auth)}")
        
        # Verificar se sign_in_with_password existe
        if hasattr(db.auth, 'sign_in_with_password'):
            print("✅ Método 'sign_in_with_password' encontrado")
            
            # Tentar chamar o método (pode dar erro de credenciais, mas não de atributo)
            try:
                result = await db.auth.sign_in_with_password({
                    "email": "teste@teste.com",
                    "password": "123456"
                })
                print("✅ Chamada bem-sucedida (improvável)")
            except Exception as e:
                print(f"⚠️  Erro esperado: {e}")
                print(f"Tipo do erro: {type(e)}")
        else:
            print("❌ Método 'sign_in_with_password' NÃO encontrado")
            print(f"Métodos disponíveis: {[m for m in dir(db.auth) if not m.startswith('_')]}")
    else:
        print("❌ Atributo 'auth' NÃO encontrado")
        print(f"Atributos disponíveis: {[a for a in dir(db) if not a.startswith('_')]}")

if __name__ == "__main__":
    asyncio.run(test_auth()) 