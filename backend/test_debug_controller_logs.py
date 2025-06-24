#!/usr/bin/env python3
"""
Debug Controller - Adicionar logs temporários para investigar dados do frontend
"""

import sys
import os
sys.path.append(os.path.dirname(os.path.abspath(__file__)))

def add_debug_logs_to_controller():
    """Adiciona logs de debug temporários no controller"""
    
    print("🔧 ADICIONANDO LOGS DE DEBUG NO CONTROLLER")
    print("=" * 50)
    
    try:
        # Ler o arquivo atual
        with open('modules/equipe/controller.py', 'r', encoding='utf-8') as f:
            content = f.read()
        
        # Encontrar a função criar_funcionario e adicionar logs
        old_function_start = """    try:
        # Aplicar conversão de campos camelCase → snake_case
        dados_convertidos = dados_raw.copy()"""
        
        new_function_start = """    try:
        # ============= DEBUG LOGS TEMPORÁRIOS =============
        logger.error(f"🔍 DEBUG - dados_raw recebidos: {dados_raw}")
        logger.error(f"🔍 DEBUG - tipo dados_raw: {type(dados_raw)}")
        logger.error(f"🔍 DEBUG - keys em dados_raw: {list(dados_raw.keys())}")
        
        # Verificar especificamente setor_id
        if 'setor_id' in dados_raw:
            logger.error(f"🔍 DEBUG - setor_id encontrado: {dados_raw['setor_id']} (tipo: {type(dados_raw['setor_id'])})")
        else:
            logger.error(f"🔍 DEBUG - setor_id NÃO encontrado nos dados!")
        
        # Verificar setorId camelCase
        if 'setorId' in dados_raw:
            logger.error(f"🔍 DEBUG - setorId camelCase encontrado: {dados_raw['setorId']} (tipo: {type(dados_raw['setorId'])})")
        else:
            logger.error(f"🔍 DEBUG - setorId camelCase NÃO encontrado!")
        
        # ============= FIM DEBUG LOGS =============
        
        # Aplicar conversão de campos camelCase → snake_case
        dados_convertidos = dados_raw.copy()"""
        
        # Substituir
        if old_function_start in content:
            content = content.replace(old_function_start, new_function_start)
            
            # Salvar o arquivo modificado
            with open('modules/equipe/controller.py', 'w', encoding='utf-8') as f:
                f.write(content)
            
            print("   ✅ Logs de debug adicionados ao controller")
            print("   📋 Os logs aparecerão como ERROR no console do backend")
            print("   🔄 Agora teste criar funcionário no frontend")
            
            return True
        else:
            print("   ❌ Não foi possível encontrar o local para adicionar logs")
            return False
    
    except Exception as e:
        print(f"   ❌ Erro ao adicionar logs: {e}")
        return False

def remove_debug_logs_from_controller():
    """Remove os logs de debug do controller"""
    
    print("\n🧹 REMOVENDO LOGS DE DEBUG DO CONTROLLER")
    print("=" * 50)
    
    try:
        # Ler o arquivo atual
        with open('modules/equipe/controller.py', 'r', encoding='utf-8') as f:
            content = f.read()
        
        # Encontrar e remover os logs de debug
        debug_start = "        # ============= DEBUG LOGS TEMPORÁRIOS ============="
        debug_end = "        # ============= FIM DEBUG LOGS ============="
        
        if debug_start in content and debug_end in content:
            # Encontrar posições
            start_pos = content.find(debug_start)
            end_pos = content.find(debug_end) + len(debug_end) + 1  # +1 para incluir quebra de linha
            
            # Remover toda a seção de debug
            content = content[:start_pos] + content[end_pos:]
            
            # Salvar o arquivo limpo
            with open('modules/equipe/controller.py', 'w', encoding='utf-8') as f:
                f.write(content)
            
            print("   ✅ Logs de debug removidos do controller")
            return True
        else:
            print("   ⚠️ Logs de debug não encontrados (talvez já foram removidos)")
            return True
    
    except Exception as e:
        print(f"   ❌ Erro ao remover logs: {e}")
        return False

if __name__ == "__main__":
    print("🚀 DEBUG CONTROLLER - INVESTIGAR DADOS DO FRONTEND\n")
    
    print("OPÇÕES:")
    print("1. Adicionar logs de debug")
    print("2. Remover logs de debug")
    print("3. Sair")
    
    choice = input("\nEscolha (1/2/3): ").strip()
    
    if choice == "1":
        success = add_debug_logs_to_controller()
        if success:
            print("\n🎯 PRÓXIMOS PASSOS:")
            print("1. Vá no frontend e tente criar um funcionário")
            print("2. Observe os logs no console do backend")
            print("3. Execute este script novamente com opção 2 para limpar")
    
    elif choice == "2":
        remove_debug_logs_from_controller()
        print("\n✅ Controller limpo!")
    
    elif choice == "3":
        print("\n👋 Saindo...")
    
    else:
        print("\n❌ Opção inválida") 