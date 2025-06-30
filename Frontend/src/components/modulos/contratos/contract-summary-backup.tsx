'use client';

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Card, CardContent, CardHeader, CardTitle } from "../../ui/card";
import { Button } from "../../ui/button";
import { Badge } from "../../ui/badge";
import { Separator } from "../../ui/separator";
import { EditableField } from "./editable-field";
import { contratoMock, ContratoData } from "../../../types/contrato";
import { User, Building, Calculator, ArrowRight, Clock, CreditCard, Package, MapPin, Phone, Mail, FileText, ArrowLeft, AlertCircle } from "lucide-react";
import { ClienteSelectorUniversal } from "../../shared/cliente-selector-universal";
import { useSessao } from "../../../store/sessao-store";
import { Alert, AlertDescription } from "../../ui/alert";
import { useSearchParams } from "next/navigation";

const ContractSummary = () => {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { cliente, ambientes, valorTotalAmbientes, podeGerarOrcamento, podeGerarContrato, descontoReal, carregarSessaoCliente } = useSessao();
  const [contratoData, setContratoData] = useState<ContratoData>(contratoMock);
  const [tentouRecuperar, setTentouRecuperar] = useState(false);

  // Tentar recuperar sessão automaticamente se cliente foi perdido
  useEffect(() => {
    const clienteId = searchParams.get('clienteId');
    
    if (!cliente && clienteId && !tentouRecuperar) {
      console.log('🔄 ContractSummary - Tentando recuperar sessão perdida para cliente:', clienteId);
      setTentouRecuperar(true);
      carregarSessaoCliente(clienteId);
    }
  }, [cliente, searchParams, carregarSessaoCliente, tentouRecuperar]);

  // Sincronizar dados da sessão com o contrato
  useEffect(() => {
    console.log('🔍 ContractSummary - Sincronizando dados da sessão:', {
      temCliente: !!cliente,
      clienteNome: cliente?.nome || 'null',
      quantidadeAmbientes: ambientes.length,
      valorTotalAmbientes,
      descontoReal,
      podeGerarContrato
    });

    if (cliente && ambientes.length > 0) {
      // Usar desconto real da sessão ou valor padrão do mock
      const descontoParaUsar = descontoReal > 0 ? descontoReal / 100 : contratoMock.desconto;
      
      console.log('💰 ContractSummary - Calculando desconto:', {
        descontoRealSessao: descontoReal,
        condicao: 'descontoReal > 0',
        resultado: descontoReal > 0,
        descontoUsado: descontoParaUsar,
        origem: descontoReal > 0 ? 'SESSÃO' : 'MOCK (10%)',
        percentualFinal: (descontoParaUsar * 100).toFixed(1) + '%'
      });
      
      setContratoData(prev => ({
        ...prev,
        cliente: {
          nome: cliente.nome,
          cpf: cliente.cpf_cnpj || '',
          endereco: `${cliente.logradouro}, ${cliente.numero} - ${cliente.bairro}, ${cliente.cidade}/${cliente.uf}`,
          telefone: cliente.telefone,
          email: cliente.email
        },
        valor_total: valorTotalAmbientes,
        desconto: descontoParaUsar,
        valor_final: valorTotalAmbientes * (1 - descontoParaUsar),
        ambientes: ambientes.map(ambiente => ({
          nome: ambiente.nome,
          categoria: 'Ambiente',
          descricao: `Ambiente ${ambiente.nome}`,
          valor: ambiente.valorVenda || 0
        }))
      }));
    } else {
      // Log quando não há dados suficientes
      console.log('⚠️ ContractSummary - Dados insuficientes para gerar contrato:', {
        temCliente: !!cliente,
        quantidadeAmbientes: ambientes.length,
        valorTotal: valorTotalAmbientes,
        clienteIdURL: searchParams.get('clienteId'),
        tentouRecuperar
      });
    }
  }, [cliente, ambientes, valorTotalAmbientes, descontoReal, searchParams, tentouRecuperar]);

  const updateField = (path: string, value: string | number) => {
    setContratoData(prev => {
      const keys = path.split('.');
      const newData = { ...prev };
      let current: any = newData;
      for (let i = 0; i < keys.length - 1; i++) {
        current[keys[i]] = { ...current[keys[i]] };
        current = current[keys[i]];
      }
      current[keys[keys.length - 1]] = value;
      return newData;
    });
  };

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL'
    }).format(value);
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'RASCUNHO':
        return 'bg-orange-50 text-orange-700 border-orange-200';
      case 'PRONTO':
        return 'bg-blue-50 text-blue-700 border-blue-200';
      case 'ENVIADO':
        return 'bg-purple-50 text-purple-700 border-purple-200';
      case 'ASSINADO':
        return 'bg-green-50 text-green-700 border-green-200';
      default:
        return 'bg-gray-50 text-gray-700 border-gray-200';
    }
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case 'RASCUNHO':
        return 'Em Edição';
      case 'PRONTO':
        return 'Pronto para Apresentação';
      case 'ENVIADO':
        return 'Enviado para Assinatura';
      case 'ASSINADO':
        return 'Assinado e Finalizado';
      default:
        return status;
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 p-4 md:p-6">
      <div className="max-w-7xl mx-auto space-y-4">
        {/* Header Section */}
        <div className="bg-white rounded-lg shadow-md border-0 p-4 min-h-[80px] flex items-center">
          <div className="flex items-center justify-between w-full">
            {/* Navegação e Cliente - ESQUERDA */}
            <div className="flex items-center gap-4">
              <Button 
                variant="default" 
                size="sm"
                onClick={() => router.push('/painel/orcamento/simulador')}
                className="gap-2 h-12 px-4 bg-gradient-to-r from-slate-600 to-slate-700 hover:from-slate-700 hover:to-slate-800 shadow-md hover:shadow-lg transition-all duration-200 rounded-lg font-semibold text-white"
              >
                <ArrowLeft className="h-4 w-4" />
              </Button>
              
              <div className="h-6 w-px bg-gray-300" />
              
              {/* Cliente selecionado ou seletor */}
              <div className="w-80">
                <ClienteSelectorUniversal 
                  targetRoute="/painel/contratos"
                  placeholder="Selecionar cliente..."
                  integraSessao={true}
                />
              </div>
            </div>

            {/* Status e botões - DIREITA */}
            <div className="flex items-center gap-3">
              <Badge className={`${getStatusColor(contratoData.status)} px-3 py-2 text-sm font-medium border h-12 flex items-center`}>
                {getStatusText(contratoData.status)}
              </Badge>
              <Button 
                size="lg" 
                onClick={() => router.push('/painel/contratos/visualizar')} 
                disabled={!podeGerarContrato()}
                className="gap-3 h-12 px-6 bg-gradient-to-r from-slate-600 to-slate-700 hover:from-slate-700 hover:to-slate-800 shadow-md hover:shadow-lg transition-all duration-200 rounded-xl font-semibold text-white disabled:opacity-50 disabled:cursor-not-allowed"
                title={
                  !podeGerarContrato() 
                    ? "Complete o orçamento com formas de pagamento para finalizar" 
                    : "Finalizar contrato"
                }
              >
                Finalizar
                <ArrowRight className="h-5 w-5" />
              </Button>
            </div>
          </div>
        </div>

        {/* Alertas de Validação */}
        {!cliente && (
          <Alert>
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>
              Nenhum cliente selecionado. Selecione um cliente para continuar.
            </AlertDescription>
          </Alert>
        )}
        
        {cliente && ambientes.length === 0 && (
          <Alert>
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>
              Cliente {cliente.nome} selecionado, mas nenhum ambiente foi adicionado. 
              <Button 
                variant="link" 
                className="p-0 h-auto ml-1 underline"
                onClick={() => router.push('/painel/ambientes')}
              >
                Clique aqui para adicionar ambientes.
              </Button>
            </AlertDescription>
          </Alert>
        )}

        {cliente && ambientes.length > 0 && !podeGerarContrato && (
          <Alert>
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>
              Cliente e ambientes configurados, mas é necessário finalizar o orçamento com formas de pagamento.
              <Button 
                variant="link" 
                className="p-0 h-auto ml-1 underline"
                onClick={() => router.push('/painel/orcamento/simulador')}
              >
                Clique aqui para finalizar o orçamento.
              </Button>
            </AlertDescription>
          </Alert>
        )}

        {/* Main Content Grid */}
        <div className="grid grid-cols-1 xl:grid-cols-4 gap-4">
          
          {/* Dados do Cliente */}
          <div className="xl:col-span-1">
            <Card className="shadow-md border-0 bg-white h-fit">
              <CardHeader className="pb-3 px-4 pt-4">
                <CardTitle className="flex items-center gap-2 text-sm font-semibold text-gray-900">
                  <div className="w-5 h-5 bg-blue-50 rounded flex items-center justify-center">
                    <User className="h-3 w-3 text-blue-600" />
                  </div>
                  Cliente
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3 pt-0 px-4 pb-4">
                <div className="grid grid-cols-1 gap-3">
                  <div>
                    <label className="text-xs font-medium text-gray-600 mb-1 block">Nome Completo</label>
                    <EditableField 
                      value={contratoData.cliente.nome} 
                      onSave={value => updateField('cliente.nome', value)} 
                      className="text-sm p-2 font-medium text-gray-900 border rounded-md" 
                    />
                  </div>
                  
                  <div>
                    <label className="text-xs font-medium text-gray-600 mb-1 block">CPF</label>
                    <EditableField 
                      value={contratoData.cliente.cpf} 
                      onSave={value => updateField('cliente.cpf', value)} 
                      className="text-sm p-2 font-mono font-medium text-gray-900 border rounded-md" 
                    />
                  </div>
                </div>

                <Separator className="my-3" />

                <div className="space-y-3">
                  <div>
                    <label className="text-xs font-medium text-gray-600 mb-1 flex items-center gap-1">
                      <MapPin className="h-3 w-3" />
                      Endereço
                    </label>
                    <EditableField 
                      value={contratoData.cliente.endereco} 
                      onSave={value => updateField('cliente.endereco', value)} 
                      className="text-xs p-2 text-gray-900 border rounded-md" 
                      multiline 
                    />
                  </div>
                  
                  <div className="grid grid-cols-1 gap-3">
                    <div>
                      <label className="text-xs font-medium text-gray-600 mb-1 flex items-center gap-1">
                        <Phone className="h-3 w-3" />
                        Telefone
                      </label>
                      <EditableField 
                        value={contratoData.cliente.telefone} 
                        onSave={value => updateField('cliente.telefone', value)} 
                        className="text-xs p-2 font-mono text-gray-900 border rounded-md" 
                      />
                    </div>
                    
                    <div>
                      <label className="text-xs font-medium text-gray-600 mb-1 flex items-center gap-1">
                        <Mail className="h-3 w-3" />
                        E-mail
                      </label>
                      <EditableField 
                        value={contratoData.cliente.email} 
                        onSave={value => updateField('cliente.email', value)} 
                        className="text-xs p-2 text-gray-900 border rounded-md" 
                      />
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Dados da Loja */}
          <div className="xl:col-span-1">
            <Card className="shadow-md border-0 bg-white h-fit">
              <CardHeader className="pb-3 px-4 pt-4">
                <CardTitle className="flex items-center gap-2 text-sm font-semibold text-gray-900">
                  <div className="w-5 h-5 bg-green-50 rounded flex items-center justify-center">
                    <Building className="h-3 w-3 text-green-600" />
                  </div>
                  Loja
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3 pt-0 px-4 pb-4">
                <div className="grid grid-cols-1 gap-3">
                  <div>
                    <label className="text-xs font-medium text-gray-600 mb-1 block">Razão Social</label>
                    <EditableField 
                      value={contratoData.loja.nome} 
                      onSave={value => updateField('loja.nome', value)} 
                      className="text-sm p-2 font-medium text-gray-900 border rounded-md" 
                    />
                  </div>
                  
                  <div>
                    <label className="text-xs font-medium text-gray-600 mb-1 block">CNPJ</label>
                    <EditableField 
                      value={contratoData.loja.cnpj} 
                      onSave={value => updateField('loja.cnpj', value)} 
                      className="text-sm p-2 font-mono font-medium text-gray-900 border rounded-md" 
                    />
                  </div>
                </div>

                <Separator className="my-3" />

                <div className="space-y-3">
                  <div>
                    <label className="text-xs font-medium text-gray-600 mb-1 flex items-center gap-1">
                      <MapPin className="h-3 w-3" />
                      Endereço da Loja
                    </label>
                    <EditableField 
                      value={contratoData.loja.endereco} 
                      onSave={value => updateField('loja.endereco', value)} 
                      className="text-xs p-2 text-gray-900 border rounded-md" 
                      multiline 
                    />
                  </div>
                  
                  <div className="grid grid-cols-1 gap-3">
                    <div>
                      <label className="text-xs font-medium text-gray-600 mb-1 block">Vendedor</label>
                      <EditableField 
                        value={contratoData.vendedor} 
                        onSave={value => updateField('vendedor', value)} 
                        className="text-xs p-2 font-medium text-gray-900 border rounded-md" 
                      />
                    </div>
                    
                    <div>
                      <label className="text-xs font-medium text-gray-600 mb-1 block">Gerente</label>
                      <EditableField 
                        value={contratoData.gerente} 
                        onSave={value => updateField('gerente', value)} 
                        className="text-xs p-2 font-medium text-gray-900 border rounded-md" 
                      />
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Resumo Financeiro */}
          <div className="xl:col-span-2">
            <Card className="shadow-md border-0 bg-white h-fit">
              <CardHeader className="pb-3 px-4 pt-4">
                <CardTitle className="flex items-center gap-2 text-sm font-semibold text-gray-900">
                  <div className="w-5 h-5 bg-purple-50 rounded flex items-center justify-center">
                    <Calculator className="h-3 w-3 text-purple-600" />
                  </div>
                  Resumo Financeiro
                </CardTitle>
              </CardHeader>
              <CardContent className="pt-0 px-4 pb-4">
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                  <div className="bg-gray-100 rounded-lg p-4 space-y-3">
                    <div className="flex justify-between items-center">
                      <span className="text-sm text-gray-600">Valor dos Ambientes:</span>
                      <span className="font-semibold text-gray-900 text-lg">{formatCurrency(contratoData.valor_total)}</span>
                    </div>
                    
                    <div className="flex justify-between items-center">
                      <span className="text-sm text-gray-600">Desconto ({(contratoData.desconto * 100).toFixed(0)}%):</span>
                      <span className="font-semibold text-red-600 text-lg">
                        -{formatCurrency(contratoData.valor_total * contratoData.desconto)}
                      </span>
                    </div>
                    
                    <Separator className="my-3" />
                    
                    <div className="flex justify-between items-center pt-2 bg-white rounded-md p-3 border border-green-200 shadow-sm">
                      <span className="text-base font-semibold text-gray-900">Valor Final:</span>
                      <span className="text-2xl font-bold text-green-600">
                        {formatCurrency(contratoData.valor_final)}
                      </span>
                    </div>
                  </div>

                  <div className="space-y-3">
                    <div>
                      <label className="text-xs font-medium text-gray-600 mb-1 flex items-center gap-1">
                        <Clock className="h-3 w-3" />
                        Prazo de Entrega
                      </label>
                      <EditableField 
                        value={contratoData.prazo_entrega} 
                        onSave={value => updateField('prazo_entrega', value)} 
                        className="text-sm p-2 font-medium border rounded-md text-gray-900" 
                      />
                    </div>

                    <div className="bg-blue-50 rounded-lg p-3 border border-blue-200">
                      <div className="flex items-center gap-2 mb-2">
                        <CreditCard className="h-4 w-4 text-blue-600" />
                        <span className="text-sm font-medium text-blue-600">Pagamento</span>
                      </div>
                      <p className="text-xs text-gray-600">
                        Condições detalhadas no contrato final
                      </p>
                    </div>

                    <div className="bg-orange-50 rounded-lg p-3 border border-orange-200">
                      <div className="flex items-center justify-between mb-1">
                        <span className="text-sm font-medium text-orange-600">Total de Ambientes:</span>
                        <span className="text-lg font-bold text-orange-600">{contratoData.ambientes.length}</span>
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="text-xs text-gray-600">Valor médio por ambiente:</span>
                        <span className="text-sm font-medium text-orange-600">
                          {formatCurrency(contratoData.valor_total / contratoData.ambientes.length)}
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>

        {/* Ambientes Section */}
        <Card className="shadow-md border-0 bg-white">
          <CardHeader className="pb-3 px-4 pt-4">
            <CardTitle className="flex items-center gap-2 text-base text-gray-900">
              <div className="w-6 h-6 bg-orange-50 rounded-md flex items-center justify-center">
                <Package className="h-3 w-3 text-orange-600" />
              </div>
              Ambientes Contratados
              <Badge variant="outline" className="ml-auto text-xs border-gray-200 text-gray-600">
                {contratoData.ambientes.length} {contratoData.ambientes.length === 1 ? 'ambiente' : 'ambientes'}
              </Badge>
            </CardTitle>
          </CardHeader>
          <CardContent className="pt-0 px-4 pb-4">
            <div className="space-y-2">
              {contratoData.ambientes.map((ambiente, index) => (
                <div key={index} className="flex items-center justify-between p-3 border border-gray-200 rounded-lg hover:bg-gray-100 transition-colors">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-3 mb-1">
                      <h4 className="font-medium text-gray-900 text-sm truncate">{ambiente.nome}</h4>
                      <Badge variant="outline" className="text-xs px-2 py-0 flex-shrink-0 border-gray-200 text-gray-600">
                        {ambiente.categoria}
                      </Badge>
                    </div>
                    <p className="text-xs text-gray-600 leading-relaxed line-clamp-2">{ambiente.descricao}</p>
                  </div>
                  <div className="ml-4 text-right flex-shrink-0">
                    <span className="text-sm font-semibold text-green-600">
                      {formatCurrency(ambiente.valor)}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Action Bar */}
        <div className="sticky bottom-4 bg-white rounded-lg shadow-lg border p-4">
          <div className="flex flex-col sm:flex-row justify-between items-center gap-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-green-50 rounded-full flex items-center justify-center">
                <FileText className="h-5 w-5 text-green-600" />
              </div>
              <div>
                <p className="font-semibold text-gray-900 text-base">Resumo Finalizado</p>
                <div className="flex items-center gap-4 text-sm text-gray-600">
                  <span>{contratoData.ambientes.length} ambientes</span>
                  <span>•</span>
                  <span className="font-medium text-green-600">{formatCurrency(contratoData.valor_final)}</span>
                </div>
              </div>
            </div>
            
            <Button 
              size="lg" 
              onClick={() => router.push('/painel/contratos/visualizar')} 
              disabled={!podeGerarContrato()}
              className="gap-3 h-12 px-6 bg-gradient-to-r from-slate-600 to-slate-700 hover:from-slate-700 hover:to-slate-800 shadow-md hover:shadow-lg transition-all duration-200 rounded-xl font-semibold text-white disabled:opacity-50 disabled:cursor-not-allowed"
              title={
                !podeGerarContrato() 
                  ? "Complete o orçamento com formas de pagamento para finalizar" 
                  : "Avançar para contrato final"
              }
            >
              Avançar para Contrato
              <ArrowRight className="h-5 w-5" />
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ContractSummary;