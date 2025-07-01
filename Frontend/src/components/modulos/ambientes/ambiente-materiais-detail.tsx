/**
 * Componente para exibir detalhes de materiais de ambiente
 * Layout conforme especificação: 4 seções principais + 2 secundárias
 */

'use client';

import React from 'react';

interface MaterialData {
  linha_detectada?: string;
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
  valor_total?: {
    valor_venda?: string;
    custo_fabrica?: string;
  };
}

interface AmbienteMaterialDetailProps {
  materiais: MaterialData;
}

export function AmbienteMaterialDetail({ materiais }: AmbienteMaterialDetailProps) {
  if (!materiais || typeof materiais !== 'object') {
    return (
      <div className="text-sm text-slate-500 italic text-center py-4">
        Materiais não disponíveis
      </div>
    );
  }

  // Função para formatar valores de campo
  const formatarValor = (valor: string | undefined) => {
    if (!valor) return null;
    
    // Regra: não exibir "sem puxador"
    if (valor.toLowerCase().includes('sem puxador')) {
      return null;
    }
    
    return valor;
  };

  // Função para renderizar campo individual
  const renderCampo = (label: string, valor: string | undefined) => {
    const valorFormatado = formatarValor(valor);
    if (!valorFormatado) return null;

    return (
      <div className="mb-1">
        <span className="text-xs font-medium text-slate-600">{label}:</span>
        <span className="text-xs text-slate-900 ml-1">{valorFormatado}</span>
      </div>
    );
  };

  // Verificar se seção tem conteúdo válido
  const temConteudo = (secao: any) => {
    if (!secao || typeof secao !== 'object') return false;
    return Object.values(secao).some(v => v && (typeof v !== 'string' || !v.toLowerCase().includes('sem puxador')));
  };

  // Renderizar seção principal
  const renderSecaoPrincipal = (titulo: string, dados: any) => {
    if (!temConteudo(dados)) return null;

    return (
      <div className="border border-slate-200 rounded-lg p-3 bg-white">
        <h4 className="text-sm font-semibold text-slate-800 mb-2 border-b border-slate-100 pb-1">
          {titulo}
        </h4>
        <div className="space-y-0.5">
          {titulo === 'Porta' && dados && (
            <>
              {renderCampo('Cor', dados.cor)}
              {renderCampo('Modelo', dados.modelo)}
              {renderCampo('Material', dados.material)}
              {renderCampo('Espessura', dados.espessura)}
            </>
          )}
          {titulo === 'Caixa' && dados && (
            <>
              {renderCampo('Cor', dados.cor)}
              {renderCampo('Material', dados.material)}
              {renderCampo('Espessura', dados.espessura)}
              {renderCampo('Espessura Prateleiras', dados.espessura_prateleiras)}
            </>
          )}
          {titulo === 'Painéis' && dados && (
            <>
              {renderCampo('Cor', dados.cor)}
              {renderCampo('Material', dados.material)}
              {renderCampo('Espessura', dados.espessura)}
            </>
          )}
          {titulo === 'Ferragens' && dados && (
            <>
              {dados.puxadores && !dados.puxadores.toLowerCase().includes('sem puxador') && 
                renderCampo('Puxadores', dados.puxadores)}
              {renderCampo('Corrediças', dados.corredicas)}
              {renderCampo('Dobradiças', dados.dobradicas)}
            </>
          )}
        </div>
      </div>
    );
  };

  // Renderizar seção secundária
  const renderSecaoSecundaria = (titulo: string, dados: any) => {
    if (!temConteudo(dados)) return null;

    return (
      <div className="border border-slate-200 rounded-lg p-3 bg-gray-50">
        <h4 className="text-sm font-semibold text-slate-700 mb-2">
          {titulo}
        </h4>
        <div className="space-y-0.5">
          {titulo === 'Brilhart Color' && dados && (
            <>
              {renderCampo('Cor', dados.cor)}
              {renderCampo('Perfil', dados.perfil)}
            </>
          )}
          {titulo === 'Porta Perfil' && dados && (
            <>
              {renderCampo('Perfil', dados.perfil)}
              {renderCampo('Vidro', dados.vidro)}
              {renderCampo('Puxador', dados.puxador)}
            </>
          )}
        </div>
      </div>
    );
  };

  // Verificar se tem seções secundárias
  const temSecoesSecundarias = temConteudo(materiais.brilhart_color) || temConteudo(materiais.porta_perfil);

  return (
    <div className="space-y-4">
      {/* Grid de 4 colunas para seções principais */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-3">
        {renderSecaoPrincipal('Porta', materiais.portas)}
        {renderSecaoPrincipal('Caixa', materiais.caixa)}
        {renderSecaoPrincipal('Painéis', materiais.paineis)}
        {renderSecaoPrincipal('Ferragens', materiais.ferragens)}
      </div>

      {/* Grid de 2 colunas para seções secundárias */}
      {temSecoesSecundarias && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          {renderSecaoSecundaria('Brilhart Color', materiais.brilhart_color)}
          {renderSecaoSecundaria('Porta Perfil', materiais.porta_perfil)}
        </div>
      )}

      {/* Fallback se não há nenhuma seção */}
      {!temConteudo(materiais.portas) && 
       !temConteudo(materiais.caixa) && 
       !temConteudo(materiais.paineis) && 
       !temConteudo(materiais.ferragens) && 
       !temSecoesSecundarias && (
        <div className="text-sm text-slate-500 italic text-center py-8">
          Nenhum detalhe de material disponível
        </div>
      )}
    </div>
  );
}