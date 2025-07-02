"""
Importador de XML para ambientes
"""
import logging
import hashlib
from datetime import datetime
from typing import Dict, Any

from core.exceptions import ValidationException, DatabaseException
from .schemas import AmbienteCreate, AmbienteMaterialCreate
from .utils import converter_valor_monetario

logger = logging.getLogger(__name__)


class XMLImporter:
    """Classe responsável pela importação de ambientes via XML"""
    
    def __init__(self, service):
        """
        Args:
            service: Instância do AmbienteService
        """
        self.service = service
    
    def _gerar_hash_xml(self, conteudo_xml: str) -> str:
        """Gera hash SHA256 do conteúdo XML"""
        return hashlib.sha256(conteudo_xml.encode('utf-8')).hexdigest()
    
    async def importar_xml(self, cliente_id: str, conteudo_xml: str, nome_arquivo: str):
        """
        Importa ambiente a partir de XML do Promob
        Integra com o extrator XML e salva no banco
        """
        try:
            # Importação relativa correta sem modificar sys.path
            from .extrator_xml.app.extractors.xml_extractor import XMLExtractor
            
            # Criar instância do extrator
            extrator = XMLExtractor()
            
            # Processar XML
            logger.info(f"Processando XML '{nome_arquivo}' com extrator")
            resultado = extrator.extract(conteudo_xml)
            
            if not resultado.success:
                # Se falhou por não detectar linhas específicas, tentar extração básica
                if "linha (Unique/Sublime)" in resultado.error:
                    logger.warning(f"XML sem linhas Unique/Sublime detectadas, fazendo importação básica")
                    resultado = self._extrair_dados_basicos_xml(conteudo_xml, nome_arquivo)
                else:
                    raise ValidationException(f"Erro ao processar XML: {resultado.error}")
            
            # Extrair valores monetários com validação robusta
            valor_custo = converter_valor_monetario(
                resultado.valor_total.custo_fabrica if resultado.valor_total else None
            )
            valor_venda = converter_valor_monetario(
                resultado.valor_total.valor_venda if resultado.valor_total else None
            )
            
            # Criar dados do ambiente
            dados_ambiente = AmbienteCreate(
                cliente_id=cliente_id,
                nome=resultado.nome_ambiente or nome_arquivo.replace('.xml', ''),
                valor_custo_fabrica=valor_custo,
                valor_venda=valor_venda,
                origem='xml',
                data_importacao=datetime.now().date().isoformat(),
                hora_importacao=datetime.now().time().isoformat()
            )
            
            # Gerar hash do XML ANTES de criar o ambiente
            xml_hash = self._gerar_hash_xml(conteudo_xml)
            
            # Criar ambiente
            ambiente = await self.service.criar_ambiente(dados_ambiente)
            
            # Preparar dados para material
            materiais_json = self._preparar_materiais_json(resultado)
            
            # Criar registro de material
            material_data = AmbienteMaterialCreate(
                ambiente_id=ambiente.id,
                materiais_json=materiais_json,
                xml_hash=xml_hash
            )
            
            await self.service.criar_material_ambiente(ambiente.id, material_data)
            
            logger.info(f"Ambiente {ambiente.id} importado do XML com sucesso")
            
            # Retornar ambiente com materiais
            return await self.service.buscar_ambiente_por_id(ambiente.id, incluir_materiais=True)
            
        except ValidationException:
            raise
        except Exception as e:
            logger.error(f"Erro ao importar XML: {e}")
            raise DatabaseException(f"Erro ao processar XML: {str(e)}")
    
    def _extrair_dados_basicos_xml(self, conteudo_xml: str, nome_arquivo: str):
        """
        Extração básica para XMLs que não têm estrutura Unique/Sublime
        Extrai apenas nome do ambiente e tenta encontrar valores básicos
        """
        try:
            from xml.etree import ElementTree as ET
            from .schemas import AmbienteCreate
            
            # Parse básico do XML
            root = ET.fromstring(conteudo_xml)
            
            # Tentar extrair nome do ambiente
            nome_ambiente = None
            
            # Tentativas de encontrar nome do ambiente
            ambiente_element = root.find('.//AMBIENT')
            if ambiente_element is not None:
                nome_ambiente = ambiente_element.get('DESCRIPTION', '').strip()
                if nome_ambiente and nome_ambiente.startswith('Projeto - '):
                    nome_ambiente = nome_ambiente[10:].strip()
            
            # Se não encontrou, usar nome do arquivo
            if not nome_ambiente:
                nome_ambiente = nome_arquivo.replace('.xml', '').replace('_', ' ')
            
            # Criar resultado básico simulando o ExtractionResult
            class ResultadoBasico:
                def __init__(self):
                    self.success = True
                    self.linha_detectada = "Importação Básica"
                    self.nome_ambiente = nome_ambiente
                    self.valor_total = None
                    self.caixa = None
                    self.paineis = None
                    self.portas = None
                    self.ferragens = None
                    self.porta_perfil = None
                    self.brilhart_color = None
                    self.metadata = None
            
            logger.info(f"Extração básica concluída - Nome: {nome_ambiente}")
            return ResultadoBasico()
            
        except Exception as e:
            logger.error(f"Erro na extração básica: {str(e)}")
            raise ValidationException(f"Não foi possível processar este arquivo XML: {str(e)}")
    
    def _preparar_materiais_json(self, resultado) -> Dict[str, Any]:
        """Prepara dados de materiais do resultado do extrator XML"""
        return {
            'linha_detectada': resultado.linha_detectada,
            'nome_ambiente': resultado.nome_ambiente,
            'caixa': resultado.caixa.model_dump() if resultado.caixa else None,
            'paineis': resultado.paineis.model_dump() if resultado.paineis else None,
            'portas': resultado.portas.model_dump() if resultado.portas else None,
            'ferragens': resultado.ferragens.model_dump() if resultado.ferragens else None,
            'porta_perfil': resultado.porta_perfil.model_dump() if resultado.porta_perfil else None,
            'brilhart_color': resultado.brilhart_color.model_dump() if resultado.brilhart_color else None,
            'valor_total': resultado.valor_total.model_dump() if resultado.valor_total else None,
            'metadata': resultado.metadata.model_dump() if resultado.metadata else None
        }