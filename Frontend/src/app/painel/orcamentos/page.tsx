'use client';

import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Pencil, Eye, Trash2, Plus, Search } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { orcamentoService } from '@/services';
import type { OrcamentoBackend, StatusOrcamento, FiltrosOrcamento } from '@/services';
import { formatarMoedaBR } from '@/lib/formatters';

export default function OrcamentosPage() {
  const router = useRouter();
  const [orcamentos, setOrcamentos] = useState<OrcamentoBackend[]>([]);
  const [statusList, setStatusList] = useState<StatusOrcamento[]>([]);
  const [loading, setLoading] = useState(true);
  const [filtros, setFiltros] = useState<FiltrosOrcamento>({});

  // Carregar dados iniciais
  useEffect(() => {
    carregarDados();
  }, []);

  const carregarDados = async () => {
    setLoading(true);
    try {
      // Carregar orçamentos e status em paralelo
      const [orcamentosResponse, statusResponse] = await Promise.all([
        orcamentoService.listarOrcamentos(filtros),
        orcamentoService.listarStatusOrcamento()
      ]);

      if (orcamentosResponse.success && orcamentosResponse.data) {
        setOrcamentos(orcamentosResponse.data.items);
      }

      if (statusResponse.success && statusResponse.data) {
        setStatusList(statusResponse.data);
      }
    } catch (error) {
      console.error('Erro ao carregar dados:', error);
    } finally {
      setLoading(false);
    }
  };

  // Aplicar filtros
  const aplicarFiltros = () => {
    carregarDados();
  };

  const excluirOrcamento = async (id: string) => {
    if (confirm('Tem certeza que deseja excluir este orçamento?')) {
      try {
        const response = await orcamentoService.excluirOrcamento(id);
        if (response.success) {
          carregarDados(); // Recarregar lista
        }
      } catch (error) {
        console.error('Erro ao excluir orçamento:', error);
      }
    }
  };

  const getStatusBadge = (statusId?: string) => {
    const status = statusList.find(s => s.id === statusId);
    if (!status) return <Badge variant="secondary">Sem Status</Badge>;
    
    return (
      <Badge 
        variant="secondary" 
        style={{ backgroundColor: status.cor || '#gray' }}
      >
        {status.nome}
      </Badge>
    );
  };

  if (loading) {
    return (
      <div className="p-6">
        <div className="flex items-center justify-center h-64">
          <div className="text-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
            <p className="mt-2 text-gray-600">Carregando orçamentos...</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold">Orçamentos Salvos</h1>
          <p className="text-gray-600">Gerencie todos os orçamentos criados</p>
        </div>
        <Button onClick={() => router.push('/painel/orcamento')}>
          <Plus className="w-4 h-4 mr-2" />
          Novo Orçamento
        </Button>
      </div>

      {/* Filtros */}
      <Card>
        <CardHeader>
          <CardTitle>Filtros</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <Input
              placeholder="Número do orçamento"
              value={filtros.numero || ''}
              onChange={(e) => setFiltros({...filtros, numero: e.target.value})}
            />
            
            <Select 
              value={filtros.status_id || ''} 
              onValueChange={(value) => setFiltros({...filtros, status_id: value || undefined})}
            >
              <SelectTrigger>
                <SelectValue placeholder="Status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="">Todos os status</SelectItem>
                {statusList.map(status => (
                  <SelectItem key={status.id} value={status.id}>
                    {status.nome}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>

            <Input
              placeholder="ID do cliente"
              value={filtros.cliente_id || ''}
              onChange={(e) => setFiltros({...filtros, cliente_id: e.target.value})}
            />

            <Button onClick={aplicarFiltros} variant="outline">
              <Search className="w-4 h-4 mr-2" />
              Filtrar
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Lista de Orçamentos */}
      <div className="grid gap-4">
        {orcamentos.length === 0 ? (
          <Card>
            <CardContent className="p-8 text-center">
              <p className="text-gray-500">Nenhum orçamento encontrado.</p>
              <Button 
                onClick={() => router.push('/painel/orcamento')} 
                className="mt-4"
                variant="outline"
              >
                Criar Primeiro Orçamento
              </Button>
            </CardContent>
          </Card>
        ) : (
          orcamentos.map(orcamento => (
            <Card key={orcamento.id} className="hover:shadow-md transition-shadow">
              <CardContent className="p-6">
                <div className="flex justify-between items-start">
                  <div className="flex-1 space-y-2">
                    <div className="flex items-center gap-4">
                      <h3 className="font-semibold text-lg">
                        Orçamento #{orcamento.numero}
                      </h3>
                      {getStatusBadge(orcamento.status_id)}
                    </div>
                    
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                      <div>
                        <span className="text-gray-500">Cliente:</span>
                        <p className="font-medium">{orcamento.cliente_id}</p>
                      </div>
                      <div>
                        <span className="text-gray-500">Valor Final:</span>
                        <p className="font-medium text-green-600">
                          {formatarMoedaBR(Number(orcamento.valor_final))}
                        </p>
                      </div>
                      <div>
                        <span className="text-gray-500">Vendedor:</span>
                        <p className="font-medium">{orcamento.vendedor_id}</p>
                      </div>
                      <div>
                        <span className="text-gray-500">Criado em:</span>
                        <p className="font-medium">
                          {new Date(orcamento.created_at).toLocaleDateString('pt-BR')}
                        </p>
                      </div>
                    </div>

                    {orcamento.observacoes && (
                      <div className="mt-2">
                        <span className="text-gray-500 text-sm">Observações:</span>
                        <p className="text-sm">{orcamento.observacoes}</p>
                      </div>
                    )}
                  </div>

                  <div className="flex gap-2 ml-4">
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => router.push(`/painel/orcamento?edit=${orcamento.id}`)}
                    >
                      <Pencil className="w-4 h-4" />
                    </Button>
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => router.push(`/painel/contratos/visualizar?orcamento=${orcamento.id}`)}
                    >
                      <Eye className="w-4 h-4" />
                    </Button>
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => excluirOrcamento(orcamento.id)}
                      className="text-red-600 hover:text-red-700"
                    >
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))
        )}
      </div>

      {/* Estatísticas */}
      {orcamentos.length > 0 && (
        <Card>
          <CardContent className="p-4">
            <div className="flex justify-between items-center">
              <span className="text-sm text-gray-600">
                Total de {orcamentos.length} orçamento(s) encontrado(s)
              </span>
              <span className="text-sm font-medium">
                Valor Total: {formatarMoedaBR(
                  orcamentos.reduce((sum, orc) => sum + Number(orc.valor_final), 0)
                )}
              </span>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}