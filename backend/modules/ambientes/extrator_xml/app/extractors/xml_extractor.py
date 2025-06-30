"""
Extrator XML principal - Versão Corrigida
CORREÇÃO CRÍTICA: Extrai APENAS dados da linha detectada, sem misturar

Autor: Ricardo Borges - 2025
"""

from typing import Optional, List, Dict, Any, Tuple
from lxml import etree
import re
import logging

try:
    # Imports absolutos quando chamado via xml_importer
    from modules.ambientes.extrator_xml.app.models import (
        CaixaModel,
        PainelModel, 
        PortaModel,
        FerragemModel,
        PortaPerfilModel,
        BrilhartColorModel,
        ValorTotalModel,
        ExtractionResult,
        MetadataModel,
        LinhaEnum
    )
    from modules.ambientes.extrator_xml.app.utils import (
        detectar_linha,
        detectar_linhas_disponiveis,
        extrair_multiplos_valores,
        extrair_multiplos_valores_se_existe,
        processar_material_cor,
        formatar_valor_monetario,
        validar_espessura,
        limpar_tipo_dobradica
    )
    from modules.ambientes.extrator_xml.app.utils.helpers import (
        extrair_espessura_vidro,
        mapear_tipo_corredica,
        detectar_espessura_brilhart,
        extrair_espessura_paineis_sublime
    )
except ImportError:
    # Imports relativos quando chamado internamente
    from ..models import (
        CaixaModel,
        PainelModel, 
        PortaModel,
        FerragemModel,
        PortaPerfilModel,
        BrilhartColorModel,
        ValorTotalModel,
        ExtractionResult,
        MetadataModel,
        LinhaEnum
    )
    from ..utils import (
        detectar_linha,
        detectar_linhas_disponiveis,
        extrair_multiplos_valores,
        extrair_multiplos_valores_se_existe,
        processar_material_cor,
        formatar_valor_monetario,
        validar_espessura,
        limpar_tipo_dobradica
    )
    from ..utils.helpers import (
        extrair_espessura_vidro,
        mapear_tipo_corredica,
        detectar_espessura_brilhart,
        extrair_espessura_paineis_sublime
    )

# Configurar logger
logger = logging.getLogger(__name__)


class XMLExtractor:
    """
    Extrator principal para arquivos XML do Promob
    
    CORREÇÃO CRÍTICA: Extrai APENAS dados da linha principal detectada
    """
    
    def __init__(self):
        """Inicializa o extrator"""
        self.tree = None
        self.xml_content = None
        self.linhas_detectadas = None
        self.sections_extracted = []
        self.warnings = []
    
    def extract(self, xml_content: str, sections: Optional[List[str]] = None) -> ExtractionResult:
        """
        Extrai dados do XML - REFATORADO para múltiplas linhas
        
        CORREÇÃO: Extrai dados de TODAS as linhas disponíveis
        """
        try:
            self.xml_content = xml_content
            self.tree = etree.fromstring(xml_content.encode('utf-8'))
            
            # NOVO: Detectar TODAS as linhas disponíveis
            self.linhas_detectadas = detectar_linhas_disponiveis(xml_content)
            self.sections_extracted = []
            self.warnings = []
            
            # Log crítico para depuração
            logger.info(f"Linhas detectadas: {self.linhas_detectadas}")
            
            # Se não detectou nenhuma linha, retorna erro
            if not self.linhas_detectadas:
                return ExtractionResult(
                    success=False,
                    error="Não foi possível detectar nenhuma linha (Unique/Sublime) no XML"
                )
            
            # Se não especificou seções, extrai todas
            if not sections:
                sections = ['caixa', 'paineis', 'portas', 'ferragens', 
                           'porta_perfil', 'brilhart_color', 'valor_total']
            
            # String das linhas para resultado
            linha_detectada_str = ' / '.join(self.linhas_detectadas)
            
            # Extrair nome do ambiente
            nome_ambiente = self._extrair_nome_ambiente()
            
            result = ExtractionResult(
                success=True,
                linha_detectada=linha_detectada_str,
                nome_ambiente=nome_ambiente
            )
            
            # Extrai cada seção solicitada
            for section in sections:
                if section == 'caixa':
                    result.caixa = self._extrair_caixa_multiplas_linhas()
                    if result.caixa:
                        self.sections_extracted.append('caixa')
                        
                elif section == 'paineis':
                    result.paineis = self._extrair_paineis_multiplas_linhas()
                    if result.paineis:
                        self.sections_extracted.append('paineis')
                        
                elif section == 'portas' or section == 'ferragens':
                    portas, ferragens = self._extrair_portas_e_ferragens_multiplas_linhas()
                    if portas:
                        result.portas = portas
                        self.sections_extracted.append('portas')
                    if ferragens:
                        result.ferragens = ferragens
                        self.sections_extracted.append('ferragens')
                        
                elif section == 'porta_perfil':
                    result.porta_perfil = self._extrair_porta_perfil()
                    if result.porta_perfil:
                        self.sections_extracted.append('porta_perfil')
                        
                elif section == 'brilhart_color':
                    result.brilhart_color = self._extrair_brilhart_color()
                    if result.brilhart_color:
                        self.sections_extracted.append('brilhart_color')
                        
                elif section == 'valor_total':
                    result.valor_total = self._extrair_valor_total()
                    if result.valor_total:
                        self.sections_extracted.append('valor_total')
            
            # Adiciona metadados
            result.metadata = MetadataModel(
                linha=linha_detectada_str,
                sections_extracted=self.sections_extracted,
                warnings=self.warnings
            )
            
            return result
            
        except Exception as e:
            logger.error(f"Erro ao processar XML: {str(e)}")
            return ExtractionResult(
                success=False,
                error=f"Erro ao processar XML: {str(e)}"
            )
    
    def _get_colecao_xpath(self, linha: str) -> str:
        """
        Retorna o XPath correto para a coleção
        
        CORREÇÃO CRÍTICA: Sublime NÃO tem espaço no final!
        """
        if linha == "Unique":
            return "//MODELCATEGORYINFORMATION[@DESCRIPTION='Coleção Unique ']"
        elif linha == "Sublime":
            return "//MODELCATEGORYINFORMATION[@DESCRIPTION='Coleção Sublime']"
        else:
            return None
    
    def _extrair_nome_ambiente(self) -> Optional[str]:
        """
        Extrai o nome do ambiente do XML
        
        Localização: /LISTING/AMBIENTS/AMBIENT/@DESCRIPTION
        Remove prefixo "Projeto - " se existir
        """
        try:
            ambient = self.tree.find('.//AMBIENT')
            if ambient is not None:
                nome = ambient.get('DESCRIPTION', '').strip()
                if nome:
                    # Remover prefixo "Projeto - " se existir
                    if nome.startswith('Projeto - '):
                        nome = nome[10:]  # Remove "Projeto - " (10 caracteres)
                    return nome.strip() if nome.strip() else None
                return None
            return None
        except Exception as e:
            logger.error(f"Erro ao extrair nome do ambiente: {str(e)}")
            return None
    

    
    def _extrair_caixa_multiplas_linhas(self) -> Optional[CaixaModel]:
        """
        Extrai dados da seção Caixa de MÚLTIPLAS LINHAS
        
        CORREÇÃO: Verifica existência de categoria "Corpo" antes de extrair
        """
        try:
            # Verificar se existe categoria "Corpo" para alguma linha
            tem_categoria_corpo = False
            
            for linha in self.linhas_detectadas:
                if linha == "Unique":
                    # Verificar categoria "Corpo" para Unique
                    categoria_xpath = "//CATEGORY[@DESCRIPTION='Corpo']"
                elif linha == "Sublime":
                    # Verificar categoria "Corpo Sublime" para Sublime
                    categoria_xpath = "//CATEGORY[@DESCRIPTION='Corpo Sublime']"
                else:
                    continue
                
                if self.tree.xpath(categoria_xpath):
                    tem_categoria_corpo = True
                    break
            
            # Se não tem categoria corpo, não renderizar caixa
            if not tem_categoria_corpo:
                logger.debug("❌ Nenhuma categoria de corpo encontrada - não extraindo caixa")
                return None
            
            dados_por_linha = {}
            
            # Extrair dados de cada linha disponível
            for linha in self.linhas_detectadas:
                colecao_xpath = self._get_colecao_xpath(linha)
                if not colecao_xpath:
                    continue
                
                logger.debug(f"Extraindo caixa para linha: {linha}")
                
                # Inicializar variáveis
                espessuras = []
                espessuras_prat = []
                materiais = []
                cores = []
                
                # Extrair campos específicos por linha
                if linha == "Unique":
                    # Unique tem campos de espessura
                    espessuras = extrair_multiplos_valores_se_existe(
                        self.tree, colecao_xpath, "1 - Espessura Caixa"
                    )
                    espessuras_prat = extrair_multiplos_valores_se_existe(
                        self.tree, colecao_xpath, "1.1 - Espessura Prateleiras"
                    )
                    # Material + Cor
                    materiais_cores = extrair_multiplos_valores_se_existe(
                        self.tree, colecao_xpath, "4 - Cor Corpo"
                    )
                    
                elif linha == "Sublime":
                    # Sublime tem espessura padrão de 15mm APENAS se tem categoria corpo
                    categoria_sublime = self.tree.xpath("//CATEGORY[@DESCRIPTION='Corpo Sublime']")
                    if categoria_sublime:
                        espessuras = ["15mm"]
                    # Apenas tem "Cor Corpo" (sem número)
                    materiais_cores = extrair_multiplos_valores_se_existe(
                        self.tree, colecao_xpath, "Cor Corpo"
                    )
                
                # Processar separação material\cor
                if materiais_cores:
                    mats, cors = processar_material_cor(materiais_cores)
                    materiais.extend(mats)
                    cores.extend(cors)
                
                # Armazenar dados da linha
                dados_por_linha[linha] = {
                    'espessuras': espessuras,
                    'espessuras_prat': espessuras_prat,
                    'materiais': materiais,
                    'cores': cores
                }
            
            # Concatenar dados de todas as linhas
            todas_espessuras = []
            todas_espessuras_prat = []
            todos_materiais = []
            todas_cores = []
            
            for linha in self.linhas_detectadas:
                if linha in dados_por_linha:
                    dados = dados_por_linha[linha]
                    todas_espessuras.extend(dados['espessuras'])
                    todas_espessuras_prat.extend(dados['espessuras_prat'])
                    todos_materiais.extend(dados['materiais'])
                    todas_cores.extend(dados['cores'])
            
            # Se não encontrou nada, retorna None
            if not (todas_espessuras or todos_materiais or todas_cores):
                return None
            
            # Remover duplicatas mantendo ordem
            espessuras_unicas = list(dict.fromkeys(todas_espessuras))
            espessuras_prat_unicas = list(dict.fromkeys(todas_espessuras_prat))
            materiais_unicos = list(dict.fromkeys(todos_materiais))
            cores_unicas = list(dict.fromkeys(todas_cores))
            
            # Montar resultado
            return CaixaModel(
                linha=' / '.join(self.linhas_detectadas),
                espessura=' / '.join(espessuras_unicas) if espessuras_unicas else None,
                espessura_prateleiras=' / '.join(espessuras_prat_unicas) if espessuras_prat_unicas else None,
                material=' / '.join(materiais_unicos) if materiais_unicos else None,
                cor=' / '.join(cores_unicas) if cores_unicas else None
            )
            
        except Exception as e:
            logger.error(f"Erro ao extrair caixa múltiplas linhas: {str(e)}")
            self.warnings.append(f"Erro ao extrair caixa: {str(e)}")
            return None

    def _extrair_paineis_multiplas_linhas(self) -> Optional[PainelModel]:
        """
        Extrai dados da seção Painéis de MÚLTIPLAS LINHAS
        
        NOVO: Concatena dados de Unique e Sublime com " / "
        """
        try:
            dados_por_linha = {}
            
            # Extrair dados de cada linha disponível
            for linha in self.linhas_detectadas:
                colecao_xpath = self._get_colecao_xpath(linha)
                if not colecao_xpath:
                    continue
                
                logger.debug(f"Extraindo painéis para linha: {linha}")
                
                materiais = []
                cores = []
                espessuras = []
                
                # Buscar campos específicos por linha
                if linha == "Unique":
                    # Coleção Unique: "7 - Painéis"
                    materiais_cores = extrair_multiplos_valores_se_existe(
                        self.tree, colecao_xpath, "7 - Painéis"
                    )
                    esp = extrair_multiplos_valores_se_existe(
                        self.tree, colecao_xpath, "2 - Espessura Painéis"
                    )
                    espessuras.extend(esp)
                    
                elif linha == "Sublime":
                    # Coleção Sublime: "Painéis" (nome diferente)
                    materiais_cores = extrair_multiplos_valores_se_existe(
                        self.tree, colecao_xpath, "Painéis"
                    )
                    # CORREÇÃO: Extrair espessura via DESCRI REFERENCE
                    esp = extrair_espessura_paineis_sublime(self.tree, colecao_xpath)
                    espessuras.extend(esp)
                
                # Processar materiais e cores
                if materiais_cores:
                    mats, cors = processar_material_cor(materiais_cores)
                    materiais.extend(mats)
                    cores.extend(cors)
                
                # Armazenar dados da linha
                dados_por_linha[linha] = {
                    'materiais': materiais,
                    'cores': cores,
                    'espessuras': espessuras
                }
            
            # Concatenar dados de todas as linhas
            todos_materiais = []
            todas_cores = []
            todas_espessuras = []
            
            for linha in self.linhas_detectadas:
                if linha in dados_por_linha:
                    dados = dados_por_linha[linha]
                    todos_materiais.extend(dados['materiais'])
                    todas_cores.extend(dados['cores'])
                    todas_espessuras.extend(dados['espessuras'])
            
            # Se não encontrou nada, retorna None
            if not (todos_materiais or todas_cores or todas_espessuras):
                return None
            
            # Remover duplicatas mantendo ordem
            materiais_unicos = list(dict.fromkeys(todos_materiais))
            cores_unicas = list(dict.fromkeys(todas_cores))
            espessuras_unicas = list(dict.fromkeys(todas_espessuras))
            
            return PainelModel(
                material=' / '.join(materiais_unicos) if materiais_unicos else None,
                espessura=' / '.join(espessuras_unicas) if espessuras_unicas else None,
                cor=' / '.join(cores_unicas) if cores_unicas else None
            )
            
        except Exception as e:
            logger.error(f"Erro ao extrair painéis múltiplas linhas: {str(e)}")
            self.warnings.append(f"Erro ao extrair painéis: {str(e)}")
            return None

    def _extrair_portas_e_ferragens_multiplas_linhas(self) -> Tuple[Optional[PortaModel], Optional[FerragemModel]]:
        """
        Extrai dados das seções Portas e Ferragens de MÚLTIPLAS LINHAS
        
        NOVO: Concatena dados de Unique e Sublime com " / "
        """
        try:
            dados_por_linha = {}
            
            # Extrair dados de cada linha disponível
            for linha in self.linhas_detectadas:
                colecao_xpath = self._get_colecao_xpath(linha)
                if not colecao_xpath:
                    continue
                
                logger.debug(f"Extraindo portas e ferragens para linha: {linha}")
                
                # Inicializar listas
                espessuras = []
                modelos = []
                materiais = []
                cores = []
                puxadores = []
                dobradicas = []
                tipos_dobradicas = []
                corredicas = []
                
                # Extrair campos específicos por linha
                if linha == "Unique":
                    # Coleção Unique
                    espessuras = extrair_multiplos_valores_se_existe(
                        self.tree, colecao_xpath, "3 - Espessura Frontal"
                    )
                    modelos = extrair_multiplos_valores_se_existe(
                        self.tree, colecao_xpath, "4.1 - Modelo Frontal"
                    )
                    cores_frontais = extrair_multiplos_valores_se_existe(
                        self.tree, colecao_xpath, "5 - Cor Frontal"
                    )
                    puxadores = extrair_multiplos_valores_se_existe(
                        self.tree, colecao_xpath, "5 - Puxadores"
                    )
                    
                    # Ferragens
                    dobradicas = extrair_multiplos_valores_se_existe(
                        self.tree, colecao_xpath, "7 - Dobradiça"
                    )
                    tipos_dobradicas = extrair_multiplos_valores_se_existe(
                        self.tree, colecao_xpath, "7.2.1 - Tipo Dobradiça"
                    )
                    
                    # NOVO: Corrediças - Extração completa 7.1 + 7.1.1 + 7.2
                    # 7.1 - Corrediça (MARCA)
                    marca_corredica_71 = extrair_multiplos_valores_se_existe(
                        self.tree, colecao_xpath, "7.1 - Corrediça"
                    )
                    
                    # FALLBACK: Se não encontrar 7.1, usar REFERENCES
                    marca_corredica = []
                    if marca_corredica_71:
                        marca_corredica = marca_corredica_71
                    else:
                        referencias_marca = self.tree.xpath(f"{colecao_xpath}//MARCA/@REFERENCE")
                        for ref in referencias_marca:
                            if ref and ref.strip() != "." and ref.strip():
                                # Remover ponto inicial se existir
                                marca_limpa = ref.strip().lstrip(".")
                                if marca_limpa:
                                    marca_corredica.append(marca_limpa.strip())
                    
                    modelo_corredica = extrair_multiplos_valores_se_existe(
                        self.tree, colecao_xpath, "7.1.1 - Gaveta"
                    )
                    tipo_corredica = extrair_multiplos_valores_se_existe(
                        self.tree, colecao_xpath, "7.2 - Tipo Corrediça"
                    )
                    
                elif linha == "Sublime":
                    # Coleção Sublime (nomenclatura diferente)
                    modelos = extrair_multiplos_valores_se_existe(
                        self.tree, colecao_xpath, "Modelo Frontal"  # Nome diferente
                    )
                    cores_frontais = extrair_multiplos_valores_se_existe(
                        self.tree, colecao_xpath, "Cor Frontal"  # Nome diferente
                    )
                    
                    # Ferragens
                    dobradicas = extrair_multiplos_valores_se_existe(
                        self.tree, colecao_xpath, "Tipo Dobradiças"  # Nome diferente
                    )
                    
                    # NOVO: Corrediças Sublime
                    tipo_corredica_sublime = extrair_multiplos_valores_se_existe(
                        self.tree, colecao_xpath, "Tipo Corrediças"  # Nome diferente do Unique
                    )
                    
                    # FALLBACK: Puxadores podem estar em Unique para Sublime
                    unique_xpath = "//MODELCATEGORYINFORMATION[@DESCRIPTION='Coleção Unique ']"
                    puxadores_unique = extrair_multiplos_valores_se_existe(
                        self.tree, unique_xpath, "5 - Puxadores"
                    )
                    if puxadores_unique:
                        puxadores = puxadores_unique
                
                # Processar cores frontais (separar material\cor)
                if cores_frontais:
                    mats, cors = processar_material_cor(cores_frontais)
                    materiais.extend(mats)
                    cores.extend(cors)
                
                # Processar tipos de dobradiças (extrair parte final)
                tipos_dobradicas_limpos = [limpar_tipo_dobradica(t) for t in tipos_dobradicas]
                
                # Processar puxadores (substituir \ por > e tratar duplicação)
                puxadores_formatados = []
                for pux in puxadores:
                    if '\\' in pux:
                        # Substituir \ por >
                        pux_formatado = pux.replace('\\', ' > ')
                        
                        # CORREÇÃO: Tratar duplicação "Sem puxador > Sem Puxador"
                        if ' > ' in pux_formatado:
                            partes = [p.strip() for p in pux_formatado.split(' > ')]
                            # Se todas as partes são iguais (case insensitive), usar apenas uma
                            if len(set(p.lower() for p in partes)) == 1:
                                puxadores_formatados.append(partes[0])
                            else:
                                puxadores_formatados.append(pux_formatado)
                        else:
                            puxadores_formatados.append(pux_formatado)
                    else:
                        puxadores_formatados.append(pux)
                
                # NOVO: Processar corrediças - combinar marca + modelo + tipo
                corredicas_formatadas = []
                if linha == "Unique" and (marca_corredica or modelo_corredica or tipo_corredica):
                    # Combinar informações das corrediças
                    marca = marca_corredica[0] if marca_corredica else ""
                    modelo = modelo_corredica[0] if modelo_corredica else ""
                    tipo = tipo_corredica[0] if tipo_corredica else ""
                    
                    # CORREÇÃO: Processar modelo 7.1.1 (remover redundâncias)
                    if modelo:
                        # Remover prefixos redundantes
                        modelo_limpo = modelo.replace("c/ corrediça ", "").replace("c/ ", "").strip()
                        
                        # Processar casos específicos
                        if "telescópica" in modelo_limpo.lower():
                            modelo_limpo = "Telescópica"
                        elif "oculta" in modelo_limpo.lower():
                            modelo_limpo = "Oculta"
                        elif "alto drawer" in modelo_limpo.lower():
                            modelo_limpo = "Alto Drawer"
                        
                        # Se ainda tem "/", pegar a parte depois da barra
                        if "/" in modelo_limpo:
                            modelo_limpo = modelo_limpo.split("/")[-1].strip()
                    else:
                        modelo_limpo = ""
                    
                    # Processar tipo 7.2 (manter formato original, limpar redundâncias)
                    if tipo:
                        # Manter formato "c/amortecedor" ou "s/amortecedor"
                        tipo_limpo = tipo.strip()
                        
                        # Padronizar formato
                        if "amortecimento" in tipo_limpo.lower():
                            if tipo_limpo.lower().startswith("s/"):
                                tipo_limpo = "s/amortecedor"
                            elif tipo_limpo.lower().startswith("c/"):
                                tipo_limpo = "c/amortecedor"
                            else:
                                tipo_limpo = "amortecedor"
                    else:
                        tipo_limpo = ""
                    
                    # Combinar: Marca + Modelo + Tipo
                    partes_corredica = [p for p in [marca, modelo_limpo, tipo_limpo] if p]
                    if partes_corredica:
                        corredicas_formatadas.append(" ".join(partes_corredica))
                
                elif linha == "Sublime" and tipo_corredica_sublime:
                    # NOVO: Processar corrediças Sublime (apenas tipo)
                    for tipo in tipo_corredica_sublime:
                        # Processar: "Standard s/ amortecimento" → "Standard Amortecimento"
                        tipo_processado = tipo.replace("s/ ", "").replace("c/ ", "").strip()
                        if tipo_processado:
                            corredicas_formatadas.append(tipo_processado)
                
                # Armazenar dados da linha
                dados_por_linha[linha] = {
                    'espessuras': espessuras,
                    'modelos': modelos,
                    'materiais': materiais,
                    'cores': cores,
                    'puxadores': puxadores_formatados,
                    'dobradicas': dobradicas,
                    'tipos_dobradicas': tipos_dobradicas_limpos,
                    'corredicas': corredicas_formatadas
                }
            
            # Concatenar dados de todas as linhas
            todas_espessuras = []
            todos_modelos = []
            todos_materiais = []
            todas_cores = []
            todos_puxadores = []
            todas_dobradicas = []
            todas_corredicas = []
            
            for linha in self.linhas_detectadas:
                if linha in dados_por_linha:
                    dados = dados_por_linha[linha]
                    todas_espessuras.extend(dados['espessuras'])
                    todos_modelos.extend(dados['modelos'])
                    todos_materiais.extend(dados['materiais'])
                    todas_cores.extend(dados['cores'])
                    todos_puxadores.extend(dados['puxadores'])
                    todas_corredicas.extend(dados['corredicas'])
                    
                    # Combinar dobradiças + tipos para cada linha
                    dobradicas_linha = dados['dobradicas']
                    tipos_linha = dados['tipos_dobradicas']
                    
                    if dobradicas_linha and tipos_linha and linha == "Unique":
                        # Se tem ambos, combinar (apenas para Unique)
                        for d in dobradicas_linha:
                            for t in tipos_linha:
                                if d != t:  # Evitar duplicação
                                    todas_dobradicas.append(f"{d} {t}")
                    elif tipos_linha:
                        todas_dobradicas.extend(tipos_linha)
                    elif dobradicas_linha:
                        todas_dobradicas.extend(dobradicas_linha)
            
            # Remover duplicatas mantendo ordem
            espessuras_unicas = list(dict.fromkeys(todas_espessuras))
            modelos_unicos = list(dict.fromkeys(todos_modelos))
            materiais_unicos = list(dict.fromkeys(todos_materiais))
            cores_unicas = list(dict.fromkeys(todas_cores))
            puxadores_unicos = list(dict.fromkeys(todos_puxadores))
            dobradicas_unicas = list(dict.fromkeys(todas_dobradicas))
            corredicas_unicas = list(dict.fromkeys(todas_corredicas))
            
            # PORTAS
            porta_model = None
            if espessuras_unicas or modelos_unicos or materiais_unicos or cores_unicas:
                porta_data = {}
                if espessuras_unicas: 
                    porta_data['espessura'] = ' / '.join(espessuras_unicas)
                if materiais_unicos: 
                    porta_data['material'] = ' / '.join(materiais_unicos)
                if modelos_unicos: 
                    porta_data['modelo'] = ' / '.join(modelos_unicos)
                if cores_unicas: 
                    porta_data['cor'] = ' / '.join(cores_unicas)
                
                if porta_data:  # Só criar se tiver pelo menos um campo
                    porta_model = PortaModel(**porta_data)
            
            # FERRAGENS
            ferragem_model = None
            if puxadores_unicos or dobradicas_unicas or corredicas_unicas:
                ferragem_data = {}
                
                # Puxadores
                if puxadores_unicos:
                    ferragem_data['puxadores'] = ' / '.join(puxadores_unicos)
                
                # Dobradiças
                if dobradicas_unicas:
                    ferragem_data['dobradicas'] = ' / '.join(dobradicas_unicas)
                
                # NOVO: Corrediças
                if corredicas_unicas:
                    ferragem_data['corredicas'] = ' / '.join(corredicas_unicas)
                
                if ferragem_data:  # Só criar se tiver pelo menos um campo
                    ferragem_model = FerragemModel(**ferragem_data)
            
            return porta_model, ferragem_model
            
        except Exception as e:
            logger.error(f"Erro ao extrair portas e ferragens múltiplas linhas: {str(e)}")
            self.warnings.append(f"Erro ao extrair portas e ferragens: {str(e)}")
            return None, None
    
    def _extrair_porta_perfil(self) -> Optional[PortaPerfilModel]:
        """
        Extrai dados da seção Porta Perfil (Portábille)
        
        Esta seção é independente da linha (Unique/Sublime)
        """
        try:
            # Verificar se seção Portábille existe
            portabille_xpath = "//MODELCATEGORYINFORMATION[@DESCRIPTION='Portábille']"
            
            if not self.tree.xpath(portabille_xpath):
                return None  # Não existe Porta Perfil neste XML
            
            # Extrair campos individuais
            perfis = extrair_multiplos_valores_se_existe(
                self.tree, portabille_xpath, "Perfil"
            )
            acab_perfis = extrair_multiplos_valores_se_existe(
                self.tree, portabille_xpath, "Acab Perfis"
            )
            acab_vidros = extrair_multiplos_valores_se_existe(
                self.tree, portabille_xpath, "Acab Vidros"
            )
            paineis = extrair_multiplos_valores_se_existe(
                self.tree, portabille_xpath, "Painéis"
            )
            puxadores = extrair_multiplos_valores_se_existe(
                self.tree, portabille_xpath, "Puxadores"
            )
            dobradicas = extrair_multiplos_valores_se_existe(
                self.tree, portabille_xpath, "Dobradiças"
            )
            
            # Processar Perfil (combinar perfil + acabamento)
            perfil_final = []
            if perfis:
                perfil_final.extend(perfis)
            if acab_perfis:
                perfil_final.extend(acab_perfis)
            
            # Processar Vidro (extrair acabamento + espessura)
            vidro_final = []
            
            # Acabamento do vidro (separar por \)
            for item in acab_vidros:
                if '\\' in item:
                    # "Importados\Argentato" → usar apenas "Argentato"
                    vidro_final.append(item.split('\\')[-1])
                else:
                    vidro_final.append(item)
            
            # Espessura do vidro (extrair de painéis)
            for item in paineis:
                esp = extrair_espessura_vidro(item)
                if esp:
                    vidro_final.append(esp)
            
            # Verificar dobradiças (omitir se "Sem Dobradiças")
            tem_dobradicas = dobradicas and not any('Sem Dobradiças' in d for d in dobradicas)
            
            # REGRA CRÍTICA: SÓ INCLUIR SE EXISTIR NO XML
            resultado = {}
            
            if perfil_final:
                resultado['perfil'] = ' / '.join(list(dict.fromkeys(perfil_final)))
            
            if vidro_final:
                resultado['vidro'] = ' / '.join(list(dict.fromkeys(vidro_final)))
            
            if puxadores:
                resultado['puxador'] = ' / '.join(list(dict.fromkeys(puxadores)))
            
            # Opcional: incluir dobradiças se existirem (não "Sem Dobradiças")
            if tem_dobradicas:
                dobradicas_limpos = [d for d in dobradicas if 'Sem Dobradiças' not in d]
                if dobradicas_limpos:
                    resultado['dobradicas'] = ' / '.join(list(dict.fromkeys(dobradicas_limpos)))
            
            return PortaPerfilModel(**resultado) if resultado else None
            
        except Exception as e:
            logger.error(f"Erro ao extrair porta perfil: {str(e)}")
            self.warnings.append(f"Erro ao extrair porta perfil: {str(e)}")
            return None

    def _extrair_brilhart_color(self) -> Optional[BrilhartColorModel]:
        """
        Extrai dados da seção Brilhart Color
        
        Esta seção é independente da linha (Unique/Sublime)
        """
        try:
            # Verificar se seção Brilhart Color existe
            brilhart_xpath = "//MODELCATEGORYINFORMATION[@DESCRIPTION='Brilhart Color']"
            
            if not self.tree.xpath(brilhart_xpath):
                return None  # Não existe Brilhart Color neste XML
            
            # Extrair campos
            acab_porta = extrair_multiplos_valores_se_existe(
                self.tree, brilhart_xpath, "Acab Porta"
            )
            acab_perfil = extrair_multiplos_valores_se_existe(
                self.tree, brilhart_xpath, "Acab Perfil"
            )
            
            # Detectar espessura automaticamente
            espessura = detectar_espessura_brilhart(self.tree)
            
            # Processar Cor (Acab Porta separado por >)
            cores = []
            for item in acab_porta:
                # Decodificar HTML entities primeiro
                import html
                item_decodificado = html.unescape(item)
                if '>' in item_decodificado:
                    # "Fosco (2 Face)>Alba" → "Fosco(2 Face) > Alba"
                    cores.append(item_decodificado.replace('>', ' > '))
                else:
                    cores.append(item_decodificado)
            
            # Processar Perfil (Acab Perfil separado por >)
            perfis = []
            for item in acab_perfil:
                # Decodificar HTML entities primeiro
                import html
                item_decodificado = html.unescape(item)
                if '>' in item_decodificado:
                    # "Anodizados>Inox Escovado" → "Anodizado > Inox Escovado"
                    perfil_formatado = item_decodificado.replace('>', ' > ').replace('Anodizados', 'Anodizado')
                    perfis.append(perfil_formatado)
                else:
                    perfis.append(item_decodificado)
            
            # REGRA CRÍTICA: SÓ INCLUIR SE EXISTIR NO XML
            resultado = {}
            
            if espessura:
                resultado['espessura'] = espessura
            
            if cores:
                resultado['cor'] = ' / '.join(list(dict.fromkeys(cores)))
            
            if perfis:
                resultado['perfil'] = ' / '.join(list(dict.fromkeys(perfis)))
            
            return BrilhartColorModel(**resultado) if resultado else None
            
        except Exception as e:
            logger.error(f"Erro ao extrair brilhart color: {str(e)}")
            self.warnings.append(f"Erro ao extrair brilhart color: {str(e)}")
            return None

    def _extrair_valor_total(self) -> Optional[ValorTotalModel]:
        """
        Extrai apenas os 2 valores essenciais já formatados:
        - ORDER VALUE: Custo de fábrica  
        - BUDGET VALUE: Valor de venda
        """
        try:
            # 1. CUSTO DE FÁBRICA (ORDER VALUE)
            custo_fabrica_valor = None
            xpaths_order = [
                "//LISTING/TOTALPRICES/MARGINS/ORDER/@VALUE",
                "//LISTING/AMBIENTS/AMBIENT/TOTALPRICES/MARGINS/ORDER/@VALUE",
                "//TOTALPRICES/MARGINS/ORDER/@VALUE"
            ]
            
            for xpath in xpaths_order:
                elementos = self.tree.xpath(xpath)
                if elementos:
                    try:
                        custo_fabrica_valor = float(elementos[0])
                        break
                    except ValueError:
                        continue
            
            # 2. VALOR DE VENDA (BUDGET VALUE)  
            valor_venda_valor = None
            xpaths_budget = [
                "//LISTING/TOTALPRICES/MARGINS/BUDGET/@VALUE",
                "//LISTING/AMBIENTS/AMBIENT/TOTALPRICES/MARGINS/BUDGET/@VALUE", 
                "//TOTALPRICES/MARGINS/BUDGET/@VALUE"
            ]
            
            for xpath in xpaths_budget:
                elementos = self.tree.xpath(xpath)
                if elementos:
                    try:
                        valor_venda_valor = float(elementos[0])
                        break
                    except ValueError:
                        continue
            
            # Verificar se encontrou pelo menos um valor
            if not (custo_fabrica_valor or valor_venda_valor):
                return None
                
            # Formatar valores encontrados
            resultado = {}
            
            if custo_fabrica_valor:
                resultado['custo_fabrica'] = formatar_valor_monetario(custo_fabrica_valor)
            
            if valor_venda_valor:
                resultado['valor_venda'] = formatar_valor_monetario(valor_venda_valor)
            
            # Definir origem
            resultado['origem'] = "totalprices_root"
            
            return ValorTotalModel(**resultado)
            
        except Exception as e:
            logger.error(f"Erro ao extrair valor total: {str(e)}")
            self.warnings.append(f"Erro ao extrair valor total: {str(e)}")
            return None
    
    def validate(self, xml_content: str) -> Dict[str, Any]:
        """
        Valida o XML e retorna informações sobre seções disponíveis
        
        CORREÇÃO: Verifica dados reais, não apenas existência de tags
        """
        try:
            # Fazer uma extração completa para verificar dados reais
            result = self.extract(xml_content)
            
            # Verificar seções com dados reais
            available_sections = []
            sections_details = {}
            
            # 1. CAIXA
            if result.caixa:
                available_sections.append('caixa')
                sections_details['caixa'] = {
                    'has_data': True,
                    'fields': [k for k, v in result.caixa.model_dump().items() if v is not None]
                }
            
            # 2. PAINÉIS
            if result.paineis:
                available_sections.append('paineis')
                sections_details['paineis'] = {
                    'has_data': True,
                    'fields': [k for k, v in result.paineis.model_dump().items() if v is not None]
                }
            
            # 3. PORTAS
            if result.portas:
                available_sections.append('portas')
                sections_details['portas'] = {
                    'has_data': True,
                    'fields': [k for k, v in result.portas.model_dump().items() if v is not None]
                }
            
            # 4. FERRAGENS
            if result.ferragens:
                available_sections.append('ferragens')
                sections_details['ferragens'] = {
                    'has_data': True,
                    'fields': [k for k, v in result.ferragens.model_dump().items() if v is not None]
                }
            
            # 5. PORTA PERFIL
            if result.porta_perfil:
                available_sections.append('porta_perfil')
                sections_details['porta_perfil'] = {
                    'has_data': True,
                    'fields': [k for k, v in result.porta_perfil.model_dump().items() if v is not None]
                }
            
            # 6. BRILHART COLOR
            if result.brilhart_color:
                available_sections.append('brilhart_color')
                sections_details['brilhart_color'] = {
                    'has_data': True,
                    'fields': [k for k, v in result.brilhart_color.model_dump().items() if v is not None]
                }
            
            # 7. VALOR TOTAL
            if result.valor_total:
                available_sections.append('valor_total')
                sections_details['valor_total'] = {
                    'has_data': True,
                    'fields': [k for k, v in result.valor_total.model_dump().items() if v is not None]
                }
            
            return {
                'valid': True,
                'linha_detectada': result.linha_detectada,
                'available_sections': available_sections,
                'sections_details': sections_details,
                'file_size_kb': len(xml_content) / 1024
            }
            
        except Exception as e:
            return {
                'valid': False,
                'errors': [str(e)]
            }