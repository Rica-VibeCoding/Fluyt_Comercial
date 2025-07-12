#!/usr/bin/env python3
"""
Script para executar migração de status de orçamento
Migra dados de c_config_status_orcamento para c_status_orcamento
"""

import os
import sys
import asyncio
from datetime import datetime
from typing import Dict, List, Any, Optional
from supabase import create_client, Client
from dotenv import load_dotenv

# Carregar variáveis de ambiente
load_dotenv()

# Configurações do Supabase
SUPABASE_URL = os.getenv("SUPABASE_URL")
SUPABASE_SERVICE_KEY = os.getenv("SUPABASE_SERVICE_KEY")

if not SUPABASE_URL or not SUPABASE_SERVICE_KEY:
    print("❌ Erro: Variáveis SUPABASE_URL e SUPABASE_SERVICE_KEY são obrigatórias")
    sys.exit(1)

# Cliente do Supabase
supabase: Client = create_client(SUPABASE_URL, SUPABASE_SERVICE_KEY)

class MigradorStatusOrcamento:
    """Classe para gerenciar a migração de status de orçamento"""
    
    def __init__(self):
        self.tabela_origem = "c_config_status_orcamento"
        self.tabela_destino = "c_status_orcamento"
        self.tabela_orcamentos = "c_orcamentos"
        self.mapeamento_ids = {}
        
    def log(self, mensagem: str, tipo: str = "INFO"):
        """Log formatado com timestamp"""
        timestamp = datetime.now().strftime("%Y-%m-%d %H:%M:%S")
        prefixo = {"INFO": "ℹ️", "SUCCESS": "✅", "WARNING": "⚠️", "ERROR": "❌"}
        print(f"[{timestamp}] {prefixo.get(tipo, 'ℹ️')} {mensagem}")
    
    def verificar_tabelas_existem(self) -> bool:
        """Verifica se as tabelas necessárias existem"""
        try:
            # Verificar tabela origem
            result_origem = supabase.table(self.tabela_origem).select("*").limit(1).execute()
            self.log(f"Tabela origem '{self.tabela_origem}' encontrada")
            
            # Verificar tabela destino
            result_destino = supabase.table(self.tabela_destino).select("*").limit(1).execute()
            self.log(f"Tabela destino '{self.tabela_destino}' encontrada")
            
            # Verificar tabela orçamentos
            result_orcamentos = supabase.table(self.tabela_orcamentos).select("id,status_id").limit(1).execute()
            self.log(f"Tabela orçamentos '{self.tabela_orcamentos}' encontrada")
            
            return True
            
        except Exception as e:
            self.log(f"Erro ao verificar tabelas: {str(e)}", "ERROR")
            return False
    
    def criar_backup_tabelas(self) -> bool:
        """Cria backup das tabelas antes da migração"""
        try:
            timestamp = datetime.now().strftime("%Y%m%d_%H%M%S")
            
            # Backup não é possível via API, mas vamos documentar os dados
            self.log("⚠️  Backup automático não disponível via API")
            self.log("📋 Execute o script SQL manual para criar backups")
            
            return True
            
        except Exception as e:
            self.log(f"Erro ao criar backup: {str(e)}", "ERROR")
            return False
    
    def analisar_dados_origem(self) -> Dict[str, Any]:
        """Analisa dados da tabela origem"""
        try:
            # Buscar todos os registros da origem
            result = supabase.table(self.tabela_origem).select("*").execute()
            dados_origem = result.data
            
            self.log(f"📊 Encontrados {len(dados_origem)} registros na tabela origem")
            
            # Analisar estrutura
            if dados_origem:
                campos_origem = list(dados_origem[0].keys())
                self.log(f"📋 Campos encontrados: {', '.join(campos_origem)}")
            
            return {
                "total": len(dados_origem),
                "dados": dados_origem,
                "campos": campos_origem if dados_origem else []
            }
            
        except Exception as e:
            self.log(f"Erro ao analisar dados origem: {str(e)}", "ERROR")
            return {"total": 0, "dados": [], "campos": []}
    
    def analisar_dados_destino(self) -> Dict[str, Any]:
        """Analisa dados da tabela destino"""
        try:
            # Buscar todos os registros do destino
            result = supabase.table(self.tabela_destino).select("*").execute()
            dados_destino = result.data
            
            self.log(f"📊 Encontrados {len(dados_destino)} registros na tabela destino")
            
            # Criar dicionário de nomes existentes
            nomes_existentes = {item['nome']: item['id'] for item in dados_destino}
            
            return {
                "total": len(dados_destino),
                "dados": dados_destino,
                "nomes_existentes": nomes_existentes
            }
            
        except Exception as e:
            self.log(f"Erro ao analisar dados destino: {str(e)}", "ERROR")
            return {"total": 0, "dados": [], "nomes_existentes": {}}
    
    def migrar_status_novos(self, dados_origem: List[Dict], nomes_existentes: Dict) -> bool:
        """Migra status que não existem na tabela destino"""
        try:
            status_para_migrar = []
            
            for status in dados_origem:
                nome = status.get('nome', '')
                if nome not in nomes_existentes:
                    # Preparar dados para inserção
                    novo_status = {
                        'id': status.get('id'),
                        'nome': nome,
                        'descricao': status.get('descricao', ''),
                        'cor': status.get('cor', '#6B7280'),
                        'ordem': status.get('ordem', 0),
                        'ativo': status.get('ativo', True),
                        'created_at': status.get('created_at', datetime.now().isoformat()),
                        'updated_at': status.get('updated_at', datetime.now().isoformat())
                    }
                    status_para_migrar.append(novo_status)
                    # Mapear IDs
                    self.mapeamento_ids[status['id']] = status['id']
                else:
                    # Mapear para o ID existente
                    self.mapeamento_ids[status['id']] = nomes_existentes[nome]
            
            if status_para_migrar:
                # Inserir novos status
                result = supabase.table(self.tabela_destino).insert(status_para_migrar).execute()
                self.log(f"✅ Migrados {len(status_para_migrar)} novos status")
                
                for status in status_para_migrar:
                    self.log(f"   - {status['nome']} ({status['id']})")
            else:
                self.log("ℹ️  Nenhum status novo para migrar")
            
            return True
            
        except Exception as e:
            self.log(f"Erro ao migrar status novos: {str(e)}", "ERROR")
            return False
    
    def atualizar_referencias_orcamentos(self) -> bool:
        """Atualiza referências na tabela de orçamentos"""
        try:
            # Buscar orçamentos que precisam de atualização
            result = supabase.table(self.tabela_orcamentos).select("id,status_id").execute()
            orcamentos = result.data
            
            atualizacoes = 0
            for orcamento in orcamentos:
                status_id_antigo = orcamento.get('status_id')
                if status_id_antigo and status_id_antigo in self.mapeamento_ids:
                    status_id_novo = self.mapeamento_ids[status_id_antigo]
                    
                    if status_id_antigo != status_id_novo:
                        # Atualizar referência
                        supabase.table(self.tabela_orcamentos).update({
                            'status_id': status_id_novo
                        }).eq('id', orcamento['id']).execute()
                        atualizacoes += 1
            
            if atualizacoes > 0:
                self.log(f"✅ Atualizadas {atualizacoes} referências na tabela orçamentos")
            else:
                self.log("ℹ️  Nenhuma referência de orçamento precisou ser atualizada")
            
            return True
            
        except Exception as e:
            self.log(f"Erro ao atualizar referências: {str(e)}", "ERROR")
            return False
    
    def validar_migracao(self) -> bool:
        """Valida se a migração foi bem-sucedida"""
        try:
            # Verificar total de status
            result_destino = supabase.table(self.tabela_destino).select("*").execute()
            total_destino = len(result_destino.data)
            
            # Verificar orçamentos sem status
            result_orcamentos = supabase.table(self.tabela_orcamentos).select("id,status_id").execute()
            orcamentos_sem_status = [o for o in result_orcamentos.data if not o.get('status_id')]
            
            self.log(f"📊 Total de status na tabela destino: {total_destino}")
            self.log(f"📊 Orçamentos sem status: {len(orcamentos_sem_status)}")
            
            if orcamentos_sem_status:
                self.log("⚠️  Alguns orçamentos ficaram sem status:", "WARNING")
                for orc in orcamentos_sem_status[:5]:  # Mostrar apenas os primeiros 5
                    self.log(f"   - Orçamento ID: {orc['id']}")
            
            return len(orcamentos_sem_status) == 0
            
        except Exception as e:
            self.log(f"Erro na validação: {str(e)}", "ERROR")
            return False
    
    def executar_migracao(self) -> bool:
        """Executa todo o processo de migração"""
        self.log("🚀 Iniciando migração de status de orçamento")
        
        # Passo 1: Verificar tabelas
        if not self.verificar_tabelas_existem():
            return False
        
        # Passo 2: Criar backup
        if not self.criar_backup_tabelas():
            return False
        
        # Passo 3: Analisar dados
        analise_origem = self.analisar_dados_origem()
        if analise_origem["total"] == 0:
            self.log("⚠️  Nenhum dado encontrado na tabela origem", "WARNING")
            return False
        
        analise_destino = self.analisar_dados_destino()
        
        # Passo 4: Migrar status novos
        if not self.migrar_status_novos(analise_origem["dados"], analise_destino["nomes_existentes"]):
            return False
        
        # Passo 5: Atualizar referências
        if not self.atualizar_referencias_orcamentos():
            return False
        
        # Passo 6: Validar migração
        if not self.validar_migracao():
            self.log("⚠️  Validação da migração apresentou problemas", "WARNING")
            return False
        
        self.log("🎉 Migração concluída com sucesso!", "SUCCESS")
        return True


async def main():
    """Função principal"""
    print("=" * 60)
    print("🔄 MIGRAÇÃO DE STATUS DE ORÇAMENTO")
    print("=" * 60)
    
    migrador = MigradorStatusOrcamento()
    
    try:
        # Executar migração
        sucesso = migrador.executar_migracao()
        
        if sucesso:
            print("\n" + "=" * 60)
            print("✅ MIGRAÇÃO CONCLUÍDA COM SUCESSO!")
            print("=" * 60)
            print("\n📋 PRÓXIMOS PASSOS:")
            print("1. Verificar os dados no Supabase")
            print("2. Testar o frontend com os novos dados")
            print("3. Remover a tabela c_config_status_orcamento (se tudo estiver ok)")
            print("4. Atualizar documentação do projeto")
        else:
            print("\n" + "=" * 60)
            print("❌ MIGRAÇÃO FALHOU!")
            print("=" * 60)
            print("\n🔧 AÇÕES RECOMENDADAS:")
            print("1. Verificar logs de erro acima")
            print("2. Executar script SQL manual se necessário")
            print("3. Verificar permissões no Supabase")
            
    except Exception as e:
        print(f"\n❌ Erro inesperado: {str(e)}")
        sys.exit(1)


if __name__ == "__main__":
    asyncio.run(main())