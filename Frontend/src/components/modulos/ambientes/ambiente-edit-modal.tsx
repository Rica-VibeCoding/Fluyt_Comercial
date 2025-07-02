/**
 * MODAL DE EDIÇÃO DE AMBIENTE - PADRÃO UX/UI ESTABELECIDO
 * Campos editáveis: nome, valor_venda, materiais (dinâmico)
 * Campos não editáveis: cliente_nome, linha, data/hora, origem
 */

'use client';

import { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '../../ui/dialog';
import { Button } from '../../ui/button';
import { Input } from '../../ui/input';
import { Label } from '../../ui/label';
import { Badge } from '../../ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../../ui/tabs';
import { 
  Home, 
  DollarSign, 
  Calendar, 
  User, 
  Package,
  FileText,
  Layers,
  Package2,
  Settings,
  Wrench,
  Palette,
  Frame
} from 'lucide-react';
import type { Ambiente } from '../../../types/ambiente';
import { formatarDataHora, formatarMoeda } from '../../../lib/formatters';

interface AmbienteEditModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSubmit: (id: string, data: Partial<Ambiente>) => void;
  ambiente: Ambiente | null;
}

// Tipos para materiais
interface MaterialEditavel {
  caixa?: {
    material?: string;
    cor?: string;
    espessura?: string;
    espessura_prateleiras?: string;
  };
  portas?: {
    material?: string;
    modelo?: string;
    cor?: string;
    espessura?: string;
  };
  ferragens?: {
    puxadores?: string;
    dobradicas?: string;
    corredicas?: string;
  };
  paineis?: {
    material?: string;
    cor?: string;
    espessura?: string;
  };
  porta_perfil?: {
    perfil?: string;
    vidro?: string;
    puxador?: string;
  };
  brilhart_color?: {
    cor?: string;
    perfil?: string;
    espessura?: string;
  };
}

export function AmbienteEditModal({ 
  open, 
  onOpenChange, 
  onSubmit, 
  ambiente 
}: AmbienteEditModalProps) {
  const [nome, setNome] = useState('');
  const [valorVenda, setValorVenda] = useState<number | undefined>(undefined);
  const [materiais, setMateriais] = useState<MaterialEditavel>({});
  const [activeTab, setActiveTab] = useState('dados');
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Atualizar campos quando ambiente mudar
  useEffect(() => {
    if (ambiente) {
      setNome(ambiente.nome);
      setValorVenda(ambiente.valor_venda);
      setMateriais(ambiente.materiais || {});
      setActiveTab('dados'); // Reset para aba de dados
    }
  }, [ambiente]);

  const resetForm = () => {
    setNome('');
    setValorVenda(undefined);
    setMateriais({});
    setActiveTab('dados');
    setIsSubmitting(false);
  };

  // Funções auxiliares para materiais
  const updateMaterial = (secao: string, campo: string, valor: string) => {
    setMateriais(prev => ({
      ...prev,
      [secao]: {
        ...prev[secao as keyof MaterialEditavel],
        [campo]: valor
      }
    }));
  };

  const temMateriais = () => {
    return ambiente?.materiais && Object.keys(ambiente.materiais).length > 0;
  };

  const getSecoesDisponiveis = () => {
    if (!ambiente?.materiais) return [];
    
    const secoes = [];
    if (ambiente.materiais.portas) secoes.push({ key: 'portas', label: 'Porta', icon: Package2 });
    if (ambiente.materiais.caixa) secoes.push({ key: 'caixa', label: 'Caixa', icon: Package });
    if (ambiente.materiais.paineis) secoes.push({ key: 'paineis', label: 'Painéis', icon: Layers });
    if (ambiente.materiais.ferragens) secoes.push({ key: 'ferragens', label: 'Ferragens', icon: Wrench });
    if (ambiente.materiais.porta_perfil) secoes.push({ key: 'porta_perfil', label: 'Porta Perfil', icon: Frame });
    if (ambiente.materiais.brilhart_color) secoes.push({ key: 'brilhart_color', label: 'Brilhart Color', icon: Palette });
    
    return secoes;
  };

  const handleSubmit = async () => {
    if (!ambiente || !nome.trim()) return;
    
    setIsSubmitting(true);
    
    try {
      const updateData: Partial<Ambiente> = {
        nome: nome.trim(),
      };

      // Adicionar valor de venda se foi informado
      if (valorVenda !== undefined && valorVenda >= 0) {
        updateData.valor_venda = valorVenda;
      }

      // Adicionar materiais se foram editados
      if (Object.keys(materiais).length > 0) {
        updateData.materiais = materiais;
      }

      await onSubmit(ambiente.id, updateData);
      resetForm();
      onOpenChange(false);
    } catch (error) {
      console.error('Erro ao atualizar ambiente:', error);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleCancel = () => {
    resetForm();
    onOpenChange(false);
  };

  const isFormValid = nome.trim().length > 0;

  if (!ambiente) return null;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-3xl max-h-[90vh] overflow-hidden bg-white dark:bg-slate-900">
        <DialogHeader className="border-b border-slate-200 dark:border-slate-700 pb-3">
          <div className="flex items-center gap-2">
            <div className="p-1.5 bg-blue-50 rounded-lg border border-blue-200">
              <Home className="h-4 w-4 text-blue-600" />
            </div>
            <DialogTitle className="text-lg font-semibold text-slate-900 dark:text-slate-100">
              Editar Ambiente
            </DialogTitle>
          </div>
        </DialogHeader>

        <form onSubmit={(e) => { e.preventDefault(); handleSubmit(); }} className="h-full">
          <Tabs value={activeTab} onValueChange={setActiveTab} className="h-full">
            <TabsList className="grid w-full grid-cols-2 mb-4">
              <TabsTrigger value="dados" className="flex items-center gap-2">
                <Settings className="h-4 w-4" />
                Dados Gerais
              </TabsTrigger>
              {temMateriais() && (
                <TabsTrigger value="materiais" className="flex items-center gap-2">
                  <Package className="h-4 w-4" />
                  Materiais ({getSecoesDisponiveis().length})
                </TabsTrigger>
              )}
            </TabsList>

            <div className="overflow-y-auto max-h-[calc(90vh-200px)] px-1">
              <TabsContent value="dados" className="space-y-4 mt-0">
          {/* Campos Não Editáveis - Apenas Visualização */}
          <div className="p-3 bg-slate-50 rounded-lg border border-slate-200 space-y-3">
            <div className="text-sm font-medium text-slate-700 mb-2">Informações do Ambiente</div>
            
            {/* Cliente */}
            <div className="flex items-center justify-between text-sm">
              <div className="flex items-center gap-2">
                <User className="h-4 w-4 text-blue-500" />
                <span className="text-slate-600">Cliente:</span>
              </div>
              <span className="font-medium text-slate-900">
                {ambiente.cliente_nome || 'Não informado'}
              </span>
            </div>

            {/* Linha */}
            {ambiente.materiais?.linha_detectada && (
              <div className="flex items-center justify-between text-sm">
                <div className="flex items-center gap-2">
                  <Package className="h-4 w-4 text-purple-500" />
                  <span className="text-slate-600">Linha:</span>
                </div>
                <span className="font-medium text-slate-900">
                  {ambiente.materiais.linha_detectada}
                </span>
              </div>
            )}

            {/* Data/Hora */}
            <div className="flex items-center justify-between text-sm">
              <div className="flex items-center gap-2">
                <Calendar className="h-4 w-4 text-green-500" />
                <span className="text-slate-600">Data/Hora:</span>
              </div>
              <span className="font-medium text-slate-900">
                {ambiente.data_importacao 
                  ? formatarDataHora(ambiente.data_importacao, ambiente.hora_importacao)
                  : 'Não informado'}
              </span>
            </div>

            {/* Origem */}
            <div className="flex items-center justify-between text-sm">
              <div className="flex items-center gap-2">
                <FileText className="h-4 w-4 text-orange-500" />
                <span className="text-slate-600">Origem:</span>
              </div>
              {ambiente.origem === 'xml' ? (
                <Badge variant="outline" className="text-xs px-1.5 py-0 h-4 bg-blue-50 border-blue-200 text-blue-700">
                  XML
                </Badge>
              ) : (
                <Badge variant="outline" className="text-xs px-1.5 py-0 h-4 bg-green-50 border-green-200 text-green-700">
                  Manual
                </Badge>
              )}
            </div>
          </div>

          {/* Campos Editáveis */}
          <div className="space-y-4">
            {/* Nome do Ambiente */}
            <div className="space-y-2">
              <Label htmlFor="nome" className="text-sm font-medium text-slate-700">
                Nome do Ambiente *
              </Label>
              <Input
                id="nome"
                value={nome}
                onChange={(e) => setNome(e.target.value)}
                placeholder="Ex: Cozinha, Dormitório, Sala de Estar..."
                className="h-10 border-slate-300 focus:border-blue-500"
                autoFocus
              />
            </div>

            {/* Valor de Venda */}
            <div className="space-y-2">
              <Label htmlFor="valorVenda" className="text-sm font-medium text-slate-700">
                Valor de Venda
              </Label>
              <div className="relative">
                <DollarSign className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-slate-400" />
                <Input
                  id="valorVenda"
                  type="number"
                  min="0"
                  step="0.01"
                  value={valorVenda || ''}
                  onChange={(e) => setValorVenda(e.target.value ? parseFloat(e.target.value) : undefined)}
                  placeholder="0,00"
                  className="h-10 pl-10 border-slate-300 focus:border-blue-500"
                />
              </div>
              {valorVenda !== undefined && valorVenda > 0 && (
                <p className="text-xs text-slate-500">
                  Valor formatado: {formatarMoeda(valorVenda)}
                </p>
              )}
            </div>
          </div>

                {/* Resumo de Alterações */}
                {(nome !== ambiente.nome || valorVenda !== ambiente.valor_venda) && (
                  <div className="p-3 bg-amber-50 rounded-lg border border-amber-200">
                    <div className="text-sm font-medium text-amber-800 mb-2">Alterações a serem salvas:</div>
                    <div className="space-y-1 text-sm">
                      {nome !== ambiente.nome && (
                        <div className="text-amber-700">
                          • Nome: <span className="line-through">{ambiente.nome}</span> → <span className="font-medium">{nome}</span>
                        </div>
                      )}
                      {valorVenda !== ambiente.valor_venda && (
                        <div className="text-amber-700">
                          • Valor: <span className="line-through">{formatarMoeda(ambiente.valor_venda || 0)}</span> → <span className="font-medium">{formatarMoeda(valorVenda || 0)}</span>
                        </div>
                      )}
                    </div>
                  </div>
                )}
              </TabsContent>

              {/* Tab de Materiais */}
              {temMateriais() && (
                <TabsContent value="materiais" className="space-y-4 mt-0">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {/* Seção Porta */}
                    {ambiente.materiais?.portas && (
                      <div className="p-4 bg-white border border-slate-200 rounded-lg">
                        <div className="flex items-center gap-2 mb-3">
                          <Package2 className="h-4 w-4 text-blue-500" />
                          <h3 className="text-sm font-semibold text-slate-800">Porta</h3>
                        </div>
                        <div className="space-y-3">
                          <div>
                            <Label className="text-xs">Cor</Label>
                            <Input
                              value={materiais.portas?.cor || ambiente.materiais.portas.cor || ''}
                              onChange={(e) => updateMaterial('portas', 'cor', e.target.value)}
                              className="h-8 text-sm"
                            />
                          </div>
                          <div>
                            <Label className="text-xs">Modelo</Label>
                            <Input
                              value={materiais.portas?.modelo || ambiente.materiais.portas.modelo || ''}
                              onChange={(e) => updateMaterial('portas', 'modelo', e.target.value)}
                              className="h-8 text-sm"
                            />
                          </div>
                          <div>
                            <Label className="text-xs">Material</Label>
                            <Input
                              value={materiais.portas?.material || ambiente.materiais.portas.material || ''}
                              onChange={(e) => updateMaterial('portas', 'material', e.target.value)}
                              className="h-8 text-sm"
                            />
                          </div>
                          <div>
                            <Label className="text-xs">Espessura</Label>
                            <Input
                              value={materiais.portas?.espessura || ambiente.materiais.portas.espessura || ''}
                              onChange={(e) => updateMaterial('portas', 'espessura', e.target.value)}
                              className="h-8 text-sm"
                            />
                          </div>
                        </div>
                      </div>
                    )}

                    {/* Seção Caixa */}
                    {ambiente.materiais?.caixa && (
                      <div className="p-4 bg-white border border-slate-200 rounded-lg">
                        <div className="flex items-center gap-2 mb-3">
                          <Package className="h-4 w-4 text-green-500" />
                          <h3 className="text-sm font-semibold text-slate-800">Caixa</h3>
                        </div>
                        <div className="space-y-3">
                          <div>
                            <Label className="text-xs">Cor</Label>
                            <Input
                              value={materiais.caixa?.cor || ambiente.materiais.caixa.cor || ''}
                              onChange={(e) => updateMaterial('caixa', 'cor', e.target.value)}
                              className="h-8 text-sm"
                            />
                          </div>
                          <div>
                            <Label className="text-xs">Material</Label>
                            <Input
                              value={materiais.caixa?.material || ambiente.materiais.caixa.material || ''}
                              onChange={(e) => updateMaterial('caixa', 'material', e.target.value)}
                              className="h-8 text-sm"
                            />
                          </div>
                          <div>
                            <Label className="text-xs">Espessura</Label>
                            <Input
                              value={materiais.caixa?.espessura || ambiente.materiais.caixa.espessura || ''}
                              onChange={(e) => updateMaterial('caixa', 'espessura', e.target.value)}
                              className="h-8 text-sm"
                            />
                          </div>
                          <div>
                            <Label className="text-xs">Espessura Prateleiras</Label>
                            <Input
                              value={materiais.caixa?.espessura_prateleiras || ambiente.materiais.caixa.espessura_prateleiras || ''}
                              onChange={(e) => updateMaterial('caixa', 'espessura_prateleiras', e.target.value)}
                              className="h-8 text-sm"
                            />
                          </div>
                        </div>
                      </div>
                    )}

                    {/* Seção Painéis */}
                    {ambiente.materiais?.paineis && (
                      <div className="p-4 bg-white border border-slate-200 rounded-lg">
                        <div className="flex items-center gap-2 mb-3">
                          <Layers className="h-4 w-4 text-purple-500" />
                          <h3 className="text-sm font-semibold text-slate-800">Painéis</h3>
                        </div>
                        <div className="space-y-3">
                          <div>
                            <Label className="text-xs">Cor</Label>
                            <Input
                              value={materiais.paineis?.cor || ambiente.materiais.paineis.cor || ''}
                              onChange={(e) => updateMaterial('paineis', 'cor', e.target.value)}
                              className="h-8 text-sm"
                            />
                          </div>
                          <div>
                            <Label className="text-xs">Material</Label>
                            <Input
                              value={materiais.paineis?.material || ambiente.materiais.paineis.material || ''}
                              onChange={(e) => updateMaterial('paineis', 'material', e.target.value)}
                              className="h-8 text-sm"
                            />
                          </div>
                          <div>
                            <Label className="text-xs">Espessura</Label>
                            <Input
                              value={materiais.paineis?.espessura || ambiente.materiais.paineis.espessura || ''}
                              onChange={(e) => updateMaterial('paineis', 'espessura', e.target.value)}
                              className="h-8 text-sm"
                            />
                          </div>
                        </div>
                      </div>
                    )}

                    {/* Seção Ferragens */}
                    {ambiente.materiais?.ferragens && (
                      <div className="p-4 bg-white border border-slate-200 rounded-lg">
                        <div className="flex items-center gap-2 mb-3">
                          <Wrench className="h-4 w-4 text-orange-500" />
                          <h3 className="text-sm font-semibold text-slate-800">Ferragens</h3>
                        </div>
                        <div className="space-y-3">
                          <div>
                            <Label className="text-xs">Puxadores</Label>
                            <Input
                              value={materiais.ferragens?.puxadores || ambiente.materiais.ferragens.puxadores || ''}
                              onChange={(e) => updateMaterial('ferragens', 'puxadores', e.target.value)}
                              className="h-8 text-sm"
                            />
                          </div>
                          <div>
                            <Label className="text-xs">Dobradiças</Label>
                            <Input
                              value={materiais.ferragens?.dobradicas || ambiente.materiais.ferragens.dobradicas || ''}
                              onChange={(e) => updateMaterial('ferragens', 'dobradicas', e.target.value)}
                              className="h-8 text-sm"
                            />
                          </div>
                          <div>
                            <Label className="text-xs">Corrediças</Label>
                            <Input
                              value={materiais.ferragens?.corredicas || ambiente.materiais.ferragens.corredicas || ''}
                              onChange={(e) => updateMaterial('ferragens', 'corredicas', e.target.value)}
                              className="h-8 text-sm"
                            />
                          </div>
                        </div>
                      </div>
                    )}

                    {/* Seção Porta Perfil */}
                    {ambiente.materiais?.porta_perfil && (
                      <div className="p-4 bg-white border border-slate-200 rounded-lg">
                        <div className="flex items-center gap-2 mb-3">
                          <Frame className="h-4 w-4 text-teal-500" />
                          <h3 className="text-sm font-semibold text-slate-800">Porta Perfil</h3>
                        </div>
                        <div className="space-y-3">
                          <div>
                            <Label className="text-xs">Perfil</Label>
                            <Input
                              value={materiais.porta_perfil?.perfil || ambiente.materiais.porta_perfil.perfil || ''}
                              onChange={(e) => updateMaterial('porta_perfil', 'perfil', e.target.value)}
                              className="h-8 text-sm"
                            />
                          </div>
                          <div>
                            <Label className="text-xs">Vidro</Label>
                            <Input
                              value={materiais.porta_perfil?.vidro || ambiente.materiais.porta_perfil.vidro || ''}
                              onChange={(e) => updateMaterial('porta_perfil', 'vidro', e.target.value)}
                              className="h-8 text-sm"
                            />
                          </div>
                          <div>
                            <Label className="text-xs">Puxador</Label>
                            <Input
                              value={materiais.porta_perfil?.puxador || ambiente.materiais.porta_perfil.puxador || ''}
                              onChange={(e) => updateMaterial('porta_perfil', 'puxador', e.target.value)}
                              className="h-8 text-sm"
                            />
                          </div>
                        </div>
                      </div>
                    )}

                    {/* Seção Brilhart Color */}
                    {ambiente.materiais?.brilhart_color && (
                      <div className="p-4 bg-white border border-slate-200 rounded-lg">
                        <div className="flex items-center gap-2 mb-3">
                          <Palette className="h-4 w-4 text-pink-500" />
                          <h3 className="text-sm font-semibold text-slate-800">Brilhart Color</h3>
                        </div>
                        <div className="space-y-3">
                          <div>
                            <Label className="text-xs">Cor</Label>
                            <Input
                              value={materiais.brilhart_color?.cor || ambiente.materiais.brilhart_color.cor || ''}
                              onChange={(e) => updateMaterial('brilhart_color', 'cor', e.target.value)}
                              className="h-8 text-sm"
                            />
                          </div>
                          <div>
                            <Label className="text-xs">Perfil</Label>
                            <Input
                              value={materiais.brilhart_color?.perfil || ambiente.materiais.brilhart_color.perfil || ''}
                              onChange={(e) => updateMaterial('brilhart_color', 'perfil', e.target.value)}
                              className="h-8 text-sm"
                            />
                          </div>
                          <div>
                            <Label className="text-xs">Espessura</Label>
                            <Input
                              value={materiais.brilhart_color?.espessura || ambiente.materiais.brilhart_color.espessura || ''}
                              onChange={(e) => updateMaterial('brilhart_color', 'espessura', e.target.value)}
                              className="h-8 text-sm"
                            />
                          </div>
                        </div>
                      </div>
                    )}
                  </div>
                </TabsContent>
              )}
            </div>
          </Tabs>

          {/* Botões - Fora do scroll */}
          <div className="flex justify-end gap-3 pt-4 mt-4 border-t border-slate-200">
            <Button 
              type="button" 
              variant="outline"
              onClick={handleCancel}
              disabled={isSubmitting}
              className="px-4 py-2"
            >
              Cancelar
            </Button>
            <Button 
              type="submit"
              disabled={!isFormValid || isSubmitting}
              className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isSubmitting ? (
                <>
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                  Salvando...
                </>
              ) : (
                'Salvar Alterações'
              )}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}