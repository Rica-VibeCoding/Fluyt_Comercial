/**
 * EXEMPLO DE INTEGRAÇÃO COM API - ORÇAMENTOS
 * Demonstra como usar o hook integrado para conectar frontend com backend
 * 
 * ETAPA 3: Integração Frontend-Backend
 */

'use client';

import React, { useState, useEffect } from 'react';
import { useOrcamentoIntegrado } from '@/hooks/data/use-orcamento-integrado';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { toast } from '@/hooks/globais/use-toast';
import { Save, RefreshCw, List, Plus } from 'lucide-react';

interface ExemploIntegracaoProps {
  mostrarExemplo?: boolean;
}

export const ExemploIntegracaoApi: React.FC<ExemploIntegracaoProps> = ({ 
  mostrarExemplo = false 
}) => {
  // Hook integrado que combina store + API
  const orcamento = useOrcamentoIntegrado();
  
  // Estados locais para listagem
  const [orcamentos, setOrcamentos] = useState<any[]>([]);
  const [status, setStatus] = useState<any[]>([]);

  // ========== EFEITOS ==========

  useEffect(() => {
    if (mostrarExemplo) {
      carregarDadosIniciais();
    }
  }, [mostrarExemplo]);

  // ========== FUNÇÕES ==========

  const carregarDadosIniciais = async () => {
    try {
      // Carregar status disponíveis
      const statusData = await orcamento.carregarStatus();
      setStatus(statusData);

      // Carregar orçamentos existentes
      const orcamentosData = await orcamento.listarOrcamentos({
        limit: 10,
        page: 1
      });
      setOrcamentos(orcamentosData);

      toast({
        title: "✅ Dados carregados",
        description: `${statusData.length} status e ${orcamentosData.length} orçamentos encontrados`,
      });
    } catch (error) {
      toast({
        title: "❌ Erro ao carregar dados",
        description: error instanceof Error ? error.message : "Erro desconhecido",
        variant: "destructive",
      });
    }
  };

  const salvarOrcamentoAtual = async () => {
    try {
      if (!orcamento.podeSerSalvo()) {
        toast({
          title: "⚠️ Dados incompletos",
          description: "Adicione cliente e ambientes antes de salvar",
          variant: "destructive",
        });
        return;
      }

      const resultado = await orcamento.salvarOrcamentoCompleto();
      
      toast({
        title: "✅ Orçamento salvo",
        description: `Orçamento ${resultado.numero} criado com sucesso`,
      });

      // Recarregar lista
      await carregarDadosIniciais();

    } catch (error) {
      toast({
        title: "❌ Erro ao salvar",
        description: error instanceof Error ? error.message : "Erro desconhecido",
        variant: "destructive",
      });
    }
  };

  const carregarOrcamentoExistente = async (id: string) => {
    try {
      await orcamento.carregarOrcamento(id);
      
      toast({
        title: "✅ Orçamento carregado",
        description: "Dados carregados no editor",
      });
    } catch (error) {
      toast({
        title: "❌ Erro ao carregar",
        description: error instanceof Error ? error.message : "Erro desconhecido",
        variant: "destructive",
      });
    }
  };

  const adicionarClienteTeste = () => {
    orcamento.definirCliente({
      id: 'cliente-teste-123',
      nome: 'Cliente de Teste API'
    });

    orcamento.definirAmbientes([
      { id: 'amb-1', nome: 'Cozinha', valor: 15000 },
      { id: 'amb-2', nome: 'Quarto', valor: 8000 }
    ]);

    toast({
      title: "📋 Dados de teste adicionados",
      description: "Cliente e ambientes definidos para teste",
    });
  };

  // ========== RENDER ==========

  if (!mostrarExemplo) {
    return (
      <div className="p-4 border-l-4 border-blue-500 bg-blue-50">
        <p className="text-sm text-blue-700">
          ⚡ Integração API-Frontend disponível. 
          <br />Defina <code>mostrarExemplo=true</code> para testar.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <RefreshCw className="h-5 w-5" />
            Integração Frontend ↔ Backend
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex gap-2 flex-wrap">
            <Button
              onClick={adicionarClienteTeste}
              variant="outline"
              size="sm"
              disabled={orcamento.loading}
            >
              <Plus className="h-4 w-4 mr-1" />
              Dados Teste
            </Button>

            <Button
              onClick={salvarOrcamentoAtual}
              disabled={orcamento.loading || !orcamento.podeSerSalvo()}
              size="sm"
            >
              <Save className="h-4 w-4 mr-1" />
              {orcamento.loading ? 'Salvando...' : 'Salvar Orçamento'}
            </Button>

            <Button
              onClick={carregarDadosIniciais}
              variant="outline"
              size="sm"
              disabled={orcamento.loading}
            >
              <List className="h-4 w-4 mr-1" />
              Recarregar Lista
            </Button>
          </div>

          {orcamento.error && (
            <div className="mt-3 p-3 border-l-4 border-red-500 bg-red-50">
              <p className="text-sm text-red-700">{orcamento.error}</p>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Estado Atual */}
      <Card>
        <CardHeader>
          <CardTitle>Estado Atual do Orçamento</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-2 text-sm">
            <div>
              <strong>Cliente:</strong> {orcamento.cliente?.nome || 'Não definido'}
            </div>
            <div>
              <strong>Ambientes:</strong> {orcamento.ambientes.length} item(s)
            </div>
            <div>
              <strong>Valor Total:</strong> R$ {orcamento.valorTotal.toFixed(2)}
            </div>
            <div>
              <strong>Formas Pagamento:</strong> {orcamento.formasPagamento.length} forma(s)
            </div>
            <div>
              <strong>Pode Salvar:</strong> {orcamento.podeSerSalvo() ? '✅ Sim' : '❌ Não'}
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Status Disponíveis */}
      <Card>
        <CardHeader>
          <CardTitle>Status Disponíveis ({status.length})</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-1">
            {status.map((s) => (
              <div key={s.id} className="flex items-center gap-2 text-sm">
                <div 
                  className="w-3 h-3 rounded"
                  style={{ backgroundColor: s.cor }}
                />
                <span>{s.ordem}. {s.nome}</span>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Orçamentos Existentes */}
      <Card>
        <CardHeader>
          <CardTitle>Orçamentos Existentes ({orcamentos.length})</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-2">
            {orcamentos.map((orc) => (
              <div key={orc.id} className="flex items-center justify-between p-2 border rounded">
                <div>
                  <div className="font-medium">{orc.numero}</div>
                  <div className="text-sm text-gray-600">
                    R$ {Number(orc.valor_final || 0).toFixed(2)}
                  </div>
                </div>
                <Button
                  onClick={() => carregarOrcamentoExistente(orc.id)}
                  variant="outline"
                  size="sm"
                  disabled={orcamento.loading}
                >
                  Carregar
                </Button>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};