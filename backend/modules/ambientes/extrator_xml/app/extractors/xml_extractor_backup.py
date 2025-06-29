"""
Extrator XML principal - Implementa algoritmos para 5 seções

Autor: Ricardo Borges - 2025
"""

from typing import Optional, List, Dict, Any, Tuple
from lxml import etree
import re

from app.models import (
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

from app.utils import (
    detectar_linha,
    detectar_linhas_disponiveis,
    extrair_multiplos_valores,
    extrair_multiplos_valores_se_existe,
    processar_material_cor,
    formatar_valor_monetario,
    validar_espessura,
    limpar_tipo_dobradica
)

from app.utils.helpers import (
    extrair_espessura_vidro,
    mapear_tipo_corredica,
    detectar_espessura_brilhart
)


class XMLExtractor:
    """
    Extrator principal para arquivos XML do Promob
    
    Implementa extração de 5 seções:
    - Caixa
    - Painéis  
    - Portas & Ferragens
    - Porta Perfil
    - Brilhart Color
    """
    
    def __init__(self):
        """Inicializa o extrator"""
        self.tree = None
        self.xml_content = None
        self.linha_detectada = None
        self.sections_extracted = []
        self.warnings = []
    
    def extract(self, xml_content: str, sections: Optional[List[str]] = None) -> ExtractionResult:
        """
        Extrai dados do XML
        
        Args:
            xml_content: Conteúdo XML como string
            sections: Lista de seções específicas para extrair
            
        Returns:
            ExtractionResult com dados extraídos
        """
        try:
            self.xml_content = xml_content
            self.tree = etree.fromstring(xml_content.encode('utf-8'))
            self.linha_detectada = detectar_linha(xml_content)
            self.sections_extracted = []
            self.warnings = []
            
            # Se não especificou seções, extrai todas
            if not sections:
                sections = ['caixa', 'paineis', 'portas', 'ferragens', 
                           'porta_perfil', 'brilhart_color', 'valor_total']
            
            result = ExtractionResult(
                success=True,
                linha_detectada=self.linha_detectada
            )
            
            # Extrai cada seção solicitada
            for section in sections:
                if section == 'caixa':
                    result.caixa = self._extrair_caixa()
                    if result.caixa:
                        self.sections_extracted.append('caixa')
                        
                elif section == 'paineis':
                    result.paineis = self._extrair_paineis()
                    if result.paineis:
                        self.sections_extracted.append('paineis')
                        
                elif section == 'portas' or section == 'ferragens':
                    portas, ferragens = self._extrair_portas_e_ferragens()
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
                linha=self.linha_detectada,
                sections_extracted=self.sections_extracted,
                warnings=self.warnings
            )
            
            return result
            
        except Exception as e:
            return ExtractionResult(
                success=False,
                error=f"Erro ao processar XML: {str(e)}"
            )
    
    def _extrair_caixa(self) -> Optional[CaixaModel]:
        """
        Extrai dados da seção Caixa
        
        Implementa algoritmo documentado para:
        - Detecção dinâmica de linha
        - Agrupamento de múltiplos valores
        - Separação material/cor
        """
        try:
            # Detectar linhas disponíveis
            linhas = detectar_linhas_disponiveis(self.xml_content)
            if not linhas:
                return None
            
            # Inicializar listas para agrupamento
            espessuras = []
            espessuras_prat = []
            materiais = []
            cores = []
            
            for linha in linhas:
                # XPath base para a coleção
                colecao_xpath = f"//MODELCATEGORYINFORMATION[@DESCRIPTION='Coleção {linha} ']"
                
                # Extrair espessuras
                esp = extrair_multiplos_valores_se_existe(
                    self.tree, colecao_xpath, "1 - Espessura Caixa"
                )
                espessuras.extend(esp)
                
                esp_prat = extrair_multiplos_valores_se_existe(
                    self.tree, colecao_xpath, "1.1 - Espessura Prateleiras"
                )
                espessuras_prat.extend(esp_prat)
                
                # Material + Cor
                materiais_cores = extrair_multiplos_valores_se_existe(
                    self.tree, colecao_xpath, "4 - Cor Corpo"
                )
                
                # Processar separação material\cor
                mats, cors = processar_material_cor(materiais_cores)
                materiais.extend(mats)
                cores.extend(cors)
            
            # Se não encontrou nada, retorna None
            if not (espessuras or materiais or cores):
                return None
            
            # Validar espessuras
            for esp in espessuras + espessuras_prat:
                if esp and not validar_espessura(esp):
                    self.warnings.append(f"Espessura inválida encontrada: {esp}")
            
            # Montar resultado
            return CaixaModel(
                linha=self.linha_detectada,
                espessura=' / '.join(list(dict.fromkeys(espessuras))) if espessuras else None,
                espessura_prateleiras=' / '.join(list(dict.fromkeys(espessuras_prat))) if espessuras_prat else None,
                material=' / '.join(list(dict.fromkeys(materiais))) if materiais else None,
                cor=' / '.join(list(dict.fromkeys(cores))) if cores else None
            )
            
        except Exception as e:
            self.warnings.append(f"Erro ao extrair caixa: {str(e)}")
            return None
    
    def _extrair_paineis(self) -> Optional[PainelModel]:
        """
        Extrai dados da seção Painéis
        
        Considera nomenclaturas diferentes:
        - Unique: "7 - Painéis"
        - Sublime: "Painéis"
        """
        try:
            linhas = detectar_linhas_disponiveis(self.xml_content)
            if not linhas:
                return None
            
            materiais = []
            cores = []
            espessuras = []
            
            for linha in linhas:
                colecao_xpath = f"//MODELCATEGORYINFORMATION[@DESCRIPTION='Coleção {linha} ']"
                
                # Buscar painéis com nomes diferentes por coleção
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
                
                # Processar materiais e cores
                mats, cors = processar_material_cor(materiais_cores)
                materiais.extend(mats)
                cores.extend(cors)
            
            # Se não encontrou nada, retorna None
            if not (materiais or cores or espessuras):
                return None
            
            return PainelModel(
                material=' / '.join(list(dict.fromkeys(materiais))) if materiais else None,
                espessura=' / '.join(list(dict.fromkeys(espessuras))) if espessuras else None,
                cor=' / '.join(list(dict.fromkeys(cores))) if cores else None
            )
            
        except Exception as e:
            self.warnings.append(f"Erro ao extrair painéis: {str(e)}")
            return None
    
    def _extrair_portas_e_ferragens(self) -> Tuple[Optional[PortaModel], Optional[FerragemModel]]:
        """
        Extrai dados das seções Portas e Ferragens
        
        Implementa:
        - Nomenclaturas diferentes Unique/Sublime
        - Fallback de puxadores Sublime → Unique
        - Múltiplas corrediças listadas separadamente
        - Omissão de campos inexistentes
        """
        try:
            linhas = detectar_linhas_disponiveis(self.xml_content)
            if not linhas:
                return None, None
            
            # Inicializar listas para agrupamento
            espessuras = []
            modelos = []
            materiais = []
            cores = []
            puxadores = []
            dobradicas = []
            tipos_dobradicas = []
            corredicas = []
            tipos_corredicas = []
            
            for linha in linhas:
                colecao_xpath = f"//MODELCATEGORYINFORMATION[@DESCRIPTION='Coleção {linha} ']"
                
                # PORTAS - Buscar campos com nomes diferentes por linha
                if linha == "Unique":
                    # Coleção Unique
                    espessuras.extend(extrair_multiplos_valores_se_existe(
                        self.tree, colecao_xpath, "3 - Espessura Frontal"
                    ))
                    modelos.extend(extrair_multiplos_valores_se_existe(
                        self.tree, colecao_xpath, "4.1 - Modelo Frontal"
                    ))
                    cores_frontais = extrair_multiplos_valores_se_existe(
                        self.tree, colecao_xpath, "5 - Cor Frontal"
                    )
                    puxadores.extend(extrair_multiplos_valores_se_existe(
                        self.tree, colecao_xpath, "5 - Puxadores"
                    ))
                    
                    # Ferragens
                    dobradicas.extend(extrair_multiplos_valores_se_existe(
                        self.tree, colecao_xpath, "7 - Dobradiça"
                    ))
                    tipos_dobradicas.extend(extrair_multiplos_valores_se_existe(
                        self.tree, colecao_xpath, "7.2.1 - Tipo Dobradiça"
                    ))
                    corredicas.extend(extrair_multiplos_valores_se_existe(
                        self.tree, colecao_xpath, "7.1 - Corrediça"
                    ))
                    tipos_corredicas.extend(extrair_multiplos_valores_se_existe(
                        self.tree, colecao_xpath, "7.2 - Tipo Corrediça"
                    ))
                    
                elif linha == "Sublime":
                    # Coleção Sublime (nomenclatura diferente)
                    # IMPORTANTE: Sublime NÃO tem campo de espessura frontal
                    modelos.extend(extrair_multiplos_valores_se_existe(
                        self.tree, colecao_xpath, "Modelo Frontal"  # Nome diferente
                    ))
                    cores_frontais = extrair_multiplos_valores_se_existe(
                        self.tree, colecao_xpath, "Cor Frontal"  # Nome diferente
                    )
                    
                    # Ferragens
                    dobradicas.extend(extrair_multiplos_valores_se_existe(
                        self.tree, colecao_xpath, "Tipo Dobradiças"  # Nome diferente
                    ))
                    corredicas.extend(extrair_multiplos_valores_se_existe(
                        self.tree, colecao_xpath, "7.1 - Corrediça"
                    ))
                    tipos_corredicas.extend(extrair_multiplos_valores_se_existe(
                        self.tree, colecao_xpath, "7.2 - Tipo Corrediça"
                    ))
                    
                    # FALLBACK: Puxadores podem estar em Unique para Sublime
                    unique_xpath = "//MODELCATEGORYINFORMATION[@DESCRIPTION='Coleção Unique ']"
                    puxadores.extend(extrair_multiplos_valores_se_existe(
                        self.tree, unique_xpath, "5 - Puxadores"
                    ))
                
                # Processar cores frontais (separar material\cor)
                mats, cors = processar_material_cor(cores_frontais)
                materiais.extend(mats)
                cores.extend(cors)
            
            # Processar tipos de dobradiças (extrair parte final)
            tipos_dobradicas_limpos = [limpar_tipo_dobradica(t) for t in tipos_dobradicas]
            
            # Processar puxadores (substituir \ por >)
            puxadores_formatados = []
            for pux in puxadores:
                if '\\' in pux:
                    puxadores_formatados.append(pux.replace('\\', ' > '))
                else:
                    puxadores_formatados.append(pux)
            
            # REGRA CRÍTICA: SÓ INCLUIR SE EXISTIR NO XML
            porta_model = None
            ferragem_model = None
            
            # PORTAS
            if espessuras or modelos or materiais or cores or puxadores_formatados:
                porta_data = {}
                if espessuras: 
                    porta_data['espessura'] = ' / '.join(list(dict.fromkeys(espessuras)))
                if materiais: 
                    porta_data['material'] = ' / '.join(list(dict.fromkeys(materiais)))
                if modelos: 
                    porta_data['modelo'] = ' / '.join(list(dict.fromkeys(modelos)))
                if cores: 
                    porta_data['cor'] = ' / '.join(list(dict.fromkeys(cores)))
                if puxadores_formatados: 
                    porta_data['puxadores'] = ' / '.join(list(dict.fromkeys(puxadores_formatados)))
                
                if porta_data:  # Só criar se tiver pelo menos um campo
                    porta_model = PortaModel(**porta_data)
            
            # FERRAGENS
            if dobradicas or tipos_dobradicas_limpos or corredicas or tipos_corredicas:
                ferragem_data = {}
                
                # Dobradiças (combinar dobradiça + tipo se ambos existirem)
                if dobradicas or tipos_dobradicas_limpos:
                    dobradicas_final = []
                    if dobradicas and tipos_dobradicas_limpos:
                        # Se tem ambos, combinar
                        for d in list(dict.fromkeys(dobradicas)):
                            for t in list(dict.fromkeys(tipos_dobradicas_limpos)):
                                dobradicas_final.append(f"{d} {t}")
                    elif tipos_dobradicas_limpos:
                        # Só tipos (caso Sublime)
                        dobradicas_final = list(dict.fromkeys(tipos_dobradicas_limpos))
                    elif dobradicas:
                        # Só dobradiças
                        dobradicas_final = list(dict.fromkeys(dobradicas))
                    
                    if dobradicas_final:
                        ferragem_data['dobradicas'] = ' / '.join(dobradicas_final)
                
                # Corrediças (mapear tipos e listar separadamente)
                if tipos_corredicas:
                    corredicas_final = []
                    for tipo in list(dict.fromkeys(tipos_corredicas)):
                        corredicas_final.append(mapear_tipo_corredica(tipo))
                    
                    # IMPORTANTE: Listar cada corrediça separadamente
                    if corredicas_final:
                        ferragem_data['corredicas'] = corredicas_final  # Lista
                
                if ferragem_data:  # Só criar se tiver pelo menos um campo
                    ferragem_model = FerragemModel(**ferragem_data)
            
            return porta_model, ferragem_model
            
        except Exception as e:
            self.warnings.append(f"Erro ao extrair portas e ferragens: {str(e)}")
            return None, None
    
    def _extrair_porta_perfil(self) -> Optional[PortaPerfilModel]:
        """
        Extrai dados da seção Porta Perfil (Portábille)
        
        Implementa:
        - Combinação perfil + acabamento
        - Combinação vidro + espessura
        - Omissão de "Sem Dobradiças"
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
            self.warnings.append(f"Erro ao extrair porta perfil: {str(e)}")
            return None

    def _extrair_brilhart_color(self) -> Optional[BrilhartColorModel]:
        """
        Extrai dados da seção Brilhart Color
        
        Implementa:
        - Detecção automática de espessura
        - Separação por '>' com decodificação HTML entities
        - Processamento "Acab Porta" e "Acab Perfil"
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
            self.warnings.append(f"Erro ao extrair brilhart color: {str(e)}")
            return None

    def _extrair_valor_total(self) -> Optional[ValorTotalModel]:
        """
        Extrai o valor total do projeto com múltiplos fallbacks
        
        Implementa:
        - Múltiplas fontes de valor
        - Formatação monetária brasileira
        - Fallback para soma de categorias
        """
        try:
            # Tentar extrair de diferentes locais
            xpaths_valor = [
                "//LISTING/TOTALPRICES/@TABLE",  # Principal
                "//LISTING/AMBIENTS/AMBIENT/TOTALPRICES/@TABLE",  # Por ambiente
                "//TOTALPRICES/@TABLE"  # Qualquer TOTALPRICES
            ]
            
            valor = None
            origem = None
            
            for xpath in xpaths_valor:
                elementos = self.tree.xpath(xpath)
                if elementos:
                    try:
                        valor = float(elementos[0])
                        origem = "totalprices_root" if "LISTING/TOTALPRICES" in xpath else "totalprices_ambiente"
                        break
                    except ValueError:
                        continue
            
            # Se não encontrou, tentar somar categorias individuais
            if not valor:
                categorias = self.tree.xpath("//TOTALPRICES[@TABLE]/@TABLE")
                if categorias:
                    try:
                        valores = [float(cat) for cat in categorias]
                        valor = sum(valores)
                        origem = "soma_categorias"
                    except ValueError:
                        pass
            
            if valor:
                # Formatar valor em R$
                valor_formatado = formatar_valor_monetario(valor)
                
                return ValorTotalModel(
                    valor=valor,
                    valor_formatado=valor_formatado,
                    origem=origem
                )
            
            return None
            
        except Exception as e:
            self.warnings.append(f"Erro ao extrair valor total: {str(e)}")
            return None
    

    
    def validate(self, xml_content: str) -> Dict[str, Any]:
        """
        Valida o XML e retorna informações sobre seções disponíveis
        
        Args:
            xml_content: Conteúdo XML como string
            
        Returns:
            Dicionário com informações de validação
        """
        try:
            tree = etree.fromstring(xml_content.encode('utf-8'))
            linha = detectar_linha(xml_content)
            
            # Verificar seções disponíveis
            available_sections = []
            
            # Caixa
            if tree.xpath("//MODELCATEGORYINFORMATION[@DESCRIPTION='Coleção Unique ']") or \
               tree.xpath("//MODELCATEGORYINFORMATION[@DESCRIPTION='Coleção Sublime']"):
                available_sections.append('caixa')
                available_sections.append('paineis')
                available_sections.append('portas')
                available_sections.append('ferragens')
            
            # Porta Perfil
            if tree.xpath("//MODELCATEGORYINFORMATION[@DESCRIPTION='Portábille']"):
                available_sections.append('porta_perfil')
            
            # Brilhart Color
            if tree.xpath("//MODELCATEGORYINFORMATION[@DESCRIPTION='Brilhart Color']"):
                available_sections.append('brilhart_color')
            
            return {
                'valid': True,
                'linha_detectada': linha,
                'available_sections': available_sections,
                'file_size_kb': len(xml_content) / 1024
            }
            
        except Exception as e:
            return {
                'valid': False,
                'errors': [str(e)]
            } 