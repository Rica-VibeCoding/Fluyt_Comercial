#!/usr/bin/env python3
"""
Verificar estrutura completa dos materiais JSON
"""
import json
from supabase import create_client, Client

SUPABASE_URL = "https://momwbpxqnvgehotfmvde.supabase.co"
SUPABASE_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im1vbXdicHhxbnZnZWhvdGZtdmRlIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc0Nzc3MDE1MiwiZXhwIjoyMDYzMzQ2MTUyfQ.NyRBsnWlhUmZUQFykINlaMgm9dHGkzx2nqhCYjaNiFA"

def main():
    supabase: Client = create_client(SUPABASE_URL, SUPABASE_KEY)
    
    # Buscar primeiro material
    result = supabase.table("c_ambientes_material").select("*").limit(1).execute()
    
    if result.data:
        material = result.data[0]
        materiais_json = material.get('materiais_json', {})
        
        print("📦 ESTRUTURA COMPLETA DO MATERIAL:")
        print("=" * 50)
        print(json.dumps(materiais_json, indent=2, ensure_ascii=False))
        
        print("\n🔍 ANÁLISE DAS SEÇÕES:")
        print("-" * 30)
        
        for secao, dados in materiais_json.items():
            if isinstance(dados, dict):
                print(f"\n📌 {secao.upper()}:")
                for chave, valor in dados.items():
                    print(f"   {chave}: {valor}")
            else:
                print(f"\n📌 {secao}: {dados}")

if __name__ == "__main__":
    main()