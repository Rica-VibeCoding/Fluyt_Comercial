"""
Script para verificar dados de ambientes no Supabase
"""
import os
import sys
from pathlib import Path
from datetime import datetime
import json

# Adicionar o diretório backend ao path
sys.path.append(str(Path(__file__).parent / "backend"))

from core.database import get_supabase_client
from supabase import Client

def verificar_ambientes():
    """Verifica os dados de ambientes no Supabase"""
    try:
        # Conectar ao Supabase
        print("🔄 Conectando ao Supabase...")
        supabase: Client = get_supabase_client()
        
        # 1. Verificar tabela c_ambientes
        print("\n📊 TABELA C_AMBIENTES:")
        print("-" * 80)
        
        ambientes = supabase.table("c_ambientes").select("*").execute()
        
        if ambientes.data:
            print(f"\n✅ Total de ambientes: {len(ambientes.data)}")
            
            for amb in ambientes.data:
                print(f"\n🏠 Ambiente: {amb.get('nome', 'Sem nome')}")
                print(f"   ID: {amb.get('id')}")
                print(f"   Cliente ID: {amb.get('cliente_id')}")
                print(f"   Origem: {amb.get('origem', 'manual')}")
                print(f"   Valor Custo: R$ {amb.get('valor_custo_fabrica', 0)}")
                print(f"   Valor Venda: R$ {amb.get('valor_venda', 0)}")
                print(f"   Data Importação: {amb.get('data_importacao', 'N/A')}")
                print(f"   Criado em: {amb.get('created_at', 'N/A')}")
        else:
            print("❌ Nenhum ambiente encontrado!")
            
        # 2. Verificar tabela c_ambientes_material
        print("\n\n📋 TABELA C_AMBIENTES_MATERIAL:")
        print("-" * 80)
        
        materiais = supabase.table("c_ambientes_material").select("*").execute()
        
        if materiais.data:
            print(f"\n✅ Total de registros de materiais: {len(materiais.data)}")
            
            for mat in materiais.data:
                print(f"\n📦 Material ID: {mat.get('id')}")
                print(f"   Ambiente ID: {mat.get('ambiente_id')}")
                print(f"   XML Hash: {mat.get('xml_hash', 'N/A')[:20]}..." if mat.get('xml_hash') else "   XML Hash: N/A")
                
                # Verificar estrutura do JSON de materiais
                materiais_json = mat.get('materiais_json', {})
                if materiais_json:
                    print(f"   Estrutura do JSON:")
                    print(f"   - Linha detectada: {materiais_json.get('linha_detectada', 'N/A')}")
                    print(f"   - Nome ambiente: {materiais_json.get('nome_ambiente', 'N/A')}")
                    
                    # Verificar seções disponíveis
                    secoes = ['caixa', 'portas', 'ferragens', 'paineis', 'porta_perfil', 'brilhart_color', 'valor_total']
                    secoes_presentes = [s for s in secoes if materiais_json.get(s)]
                    print(f"   - Seções presentes: {', '.join(secoes_presentes) if secoes_presentes else 'Nenhuma'}")
                    
                    # Detalhar cada seção presente
                    for secao in secoes_presentes:
                        dados_secao = materiais_json.get(secao, {})
                        if isinstance(dados_secao, dict):
                            print(f"\n   📌 {secao.upper()}:")
                            for chave, valor in dados_secao.items():
                                if valor:
                                    print(f"      - {chave}: {valor}")
        else:
            print("❌ Nenhum material encontrado!")
            
        # 3. Verificar relacionamento entre tabelas
        print("\n\n🔗 VERIFICAÇÃO DE INTEGRIDADE:")
        print("-" * 80)
        
        # IDs de ambientes
        ids_ambientes = {amb['id'] for amb in ambientes.data} if ambientes.data else set()
        
        # IDs de ambientes em materiais
        ids_em_materiais = {mat['ambiente_id'] for mat in materiais.data} if materiais.data else set()
        
        # Ambientes sem materiais
        ambientes_sem_materiais = ids_ambientes - ids_em_materiais
        if ambientes_sem_materiais:
            print(f"\n⚠️  Ambientes SEM materiais: {len(ambientes_sem_materiais)}")
            for amb_id in ambientes_sem_materiais:
                amb = next((a for a in ambientes.data if a['id'] == amb_id), None)
                if amb:
                    print(f"   - {amb['nome']} (ID: {amb_id})")
        
        # Materiais órfãos
        materiais_orfaos = ids_em_materiais - ids_ambientes
        if materiais_orfaos:
            print(f"\n⚠️  Materiais ÓRFÃOS (sem ambiente): {len(materiais_orfaos)}")
            for mat_id in materiais_orfaos:
                print(f"   - Ambiente ID: {mat_id}")
        
        if not ambientes_sem_materiais and not materiais_orfaos:
            print("\n✅ Integridade OK - Todos os ambientes têm materiais correspondentes")
            
    except Exception as e:
        print(f"\n❌ Erro ao verificar Supabase: {str(e)}")
        import traceback
        traceback.print_exc()

if __name__ == "__main__":
    verificar_ambientes()