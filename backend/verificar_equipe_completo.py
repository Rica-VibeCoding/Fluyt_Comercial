#!/usr/bin/env python3
"""
Script para verificar integridade completa da tabela cad_equipe
"""
import os
from supabase import create_client, Client
from dotenv import load_dotenv

# Carregar variáveis de ambiente
load_dotenv()

def verificar_equipe():
    """Verifica estrutura e dados da tabela cad_equipe"""
    try:
        url = os.getenv('SUPABASE_URL')
        service_key = os.getenv('SUPABASE_SERVICE_KEY')
        
        if not url or not service_key:
            print("❌ Erro: Variáveis de ambiente não encontradas")
            return
            
        supabase: Client = create_client(url, service_key)
        
        print("🔍 Verificando tabela cad_equipe...\n")
        
        # 1. Verificar se a tabela existe e tem dados
        try:
            result = supabase.table('cad_equipe').select('*').execute()
            print(f"✅ Tabela cad_equipe existe!")
            print(f"📊 Total de funcionários: {len(result.data)}")
            
            if len(result.data) > 0:
                print("\n👥 Funcionários cadastrados:")
                for func in result.data[:5]:  # Mostrar até 5
                    print(f"\n   Nome: {func.get('nome')}")
                    print(f"   Email: {func.get('email')}")
                    print(f"   Perfil: {func.get('perfil')}")
                    print(f"   Loja ID: {func.get('loja_id')}")
                    print(f"   Setor ID: {func.get('setor_id')}")
                    print(f"   Ativo: {func.get('ativo')}")
                    
                    # Verificar se loja existe
                    if func.get('loja_id'):
                        loja_result = supabase.table('cad_loja').select('nome').eq('id', func['loja_id']).execute()
                        if loja_result.data:
                            print(f"   ✅ Loja: {loja_result.data[0]['nome']}")
                        else:
                            print(f"   ❌ Loja ID {func['loja_id']} não encontrada!")
                    
                    # Verificar se setor existe
                    if func.get('setor_id'):
                        setor_result = supabase.table('cad_setores').select('nome').eq('id', func['setor_id']).execute()
                        if setor_result.data:
                            print(f"   ✅ Setor: {setor_result.data[0]['nome']}")
                        else:
                            print(f"   ❌ Setor ID {func['setor_id']} não encontrado!")
                    
                    print("   " + "-"*40)
            else:
                print("⚠️  Nenhum funcionário cadastrado ainda")
                
        except Exception as e:
            print(f"❌ Erro ao verificar cad_equipe: {str(e)}")
            
        # 2. Verificar lojas disponíveis
        print("\n\n🏢 Lojas disponíveis:")
        lojas = supabase.table('cad_loja').select('id, nome').execute()
        for loja in lojas.data:
            print(f"   - {loja['nome']} (ID: {loja['id']})")
            
        # 3. Verificar setores disponíveis
        print("\n\n📁 Setores disponíveis:")
        setores = supabase.table('cad_setores').select('id, nome').execute()
        for setor in setores.data:
            print(f"   - {setor['nome']} (ID: {setor['id']})")
            
    except Exception as e:
        print(f"❌ Erro geral: {str(e)}")

if __name__ == "__main__":
    verificar_equipe()