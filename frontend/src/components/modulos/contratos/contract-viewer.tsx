'use client';

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Button } from "../../ui/button";
import { Card } from "../../ui/card";
import { Badge } from "../../ui/badge";
import { ContractPDFGenerator } from "./contract-pdf-generator";
import { contratoMock, ContratoData } from "../../../types/contrato";
import { ArrowLeft, FileText, Edit, Signature } from "lucide-react";
import { toast } from "../../../hooks/globais/use-toast";

// Componente PDF dinâmico (client-side only)
const DynamicPDFDownloadLink = ({ document, fileName, children }: any) => {
  const [PDFComponent, setPDFComponent] = useState(null);

  useEffect(() => {
    import("@react-pdf/renderer").then(({ PDFDownloadLink }) => {
      setPDFComponent(() => PDFDownloadLink);
    });
  }, []);

  if (!PDFComponent) {
    return <Button disabled>Carregando PDF...</Button>;
  }

  const Component = PDFComponent as any;
  return (
    <Component document={document} fileName={fileName}>
      {children}
    </Component>
  );
};

const ContractViewer = () => {
  const router = useRouter();
  const [contratoData, setContratoData] = useState<ContratoData>(contratoMock);
  const [editMode, setEditMode] = useState(false);

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL'
    }).format(value);
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('pt-BR');
  };

  const getStatusBadgeColor = (status: string) => {
    switch (status) {
      case 'RASCUNHO':
        return 'bg-orange-100 text-orange-700 border-orange-200';
      case 'PRONTO':
        return 'bg-blue-100 text-blue-700 border-blue-200';
      case 'ENVIADO':
        return 'bg-purple-100 text-purple-700 border-purple-200';
      case 'ASSINADO':
        return 'bg-green-100 text-green-700 border-green-200';
      default:
        return 'bg-gray-100 text-gray-700 border-gray-200';
    }
  };

  const handleAssinatura = () => {
    // Simular processo de assinatura
    setContratoData(prev => ({ ...prev, status: 'ENVIADO' }));
    
    toast({
      title: "Assinatura Digital Iniciada",
      description: "O documento foi enviado para assinatura digital. Você receberá um e-mail com o link para assinar."
    });

    // Simular assinatura após alguns segundos (para demo)
    setTimeout(() => {
      setContratoData(prev => ({ ...prev, status: 'ASSINADO' }));
      toast({
        title: "Contrato Assinado!",
        description: "O contrato foi assinado com sucesso. Processo finalizado.",
        variant: "default"
      });
    }, 3000);
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white shadow-sm border-b">
        <div className="max-w-5xl mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <Button 
                variant="default" 
                size="sm"
                onClick={() => router.push('/painel/contratos')}
                className="gap-2 h-12 px-4 bg-gradient-to-r from-slate-600 to-slate-700 hover:from-slate-700 hover:to-slate-800 shadow-md hover:shadow-lg transition-all duration-200 rounded-lg font-semibold text-white"
              >
                <ArrowLeft className="h-4 w-4" />
              </Button>
              <div>
                <div className="flex items-center gap-3">
                  <h1 className="text-2xl font-bold text-gray-900">
                    Contrato #{contratoData.numero}
                  </h1>
                  <Badge 
                    className={`${getStatusBadgeColor(contratoData.status)} px-2 py-1 text-xs font-medium`}
                  >
                    {contratoData.status}
                  </Badge>
                </div>
                <p className="text-gray-600">Visualização e finalização</p>
              </div>
            </div>
            <div className="flex items-center gap-3">
              
              <DynamicPDFDownloadLink 
                document={<ContractPDFGenerator contratoData={contratoData} />} 
                fileName={`contrato-${contratoData.numero}.pdf`}
              >
                {({
                  blob,
                  url,
                  loading,
                  error
                }: any) => (
                  <Button 
                    variant="outline" 
                    disabled={loading || !!error} 
                    className="flex items-center gap-2"
                    title={error ? 'Erro ao gerar PDF. Tente novamente.' : undefined}
                  >
                    <FileText className="h-4 w-4" />
                    {loading ? 'Gerando PDF...' : error ? 'Erro no PDF' : 'Gerar PDF'}
                  </Button>
                )}
              </DynamicPDFDownloadLink>
              <Button 
                onClick={handleAssinatura} 
                disabled={contratoData.status === 'ASSINADO'}
                className={`flex items-center gap-2 ${
                  contratoData.status === 'ASSINADO' 
                    ? 'bg-green-500 cursor-not-allowed opacity-75' 
                    : 'bg-green-600 hover:bg-green-700'
                }`}
              >
                <Signature className="h-4 w-4" />
                {contratoData.status === 'ASSINADO' ? 'Já Assinado' : 
                 contratoData.status === 'ENVIADO' ? 'Aguardando...' : 
                 'Assinatura Digital'}
              </Button>
            </div>
          </div>
        </div>
      </div>

      {/* Contract Content */}
      <div className="max-w-5xl mx-auto px-6 py-8">
        <Card className="bg-white shadow-lg">
          <div className="p-8 max-w-none">
            {/* Contract Header */}
            <div className="text-center mb-8 border-b pb-6">
              <h2 className="text-3xl font-bold text-gray-900 mb-2">
                CONTRATO DE PRESTAÇÃO DE SERVIÇOS
              </h2>
              <p className="text-lg text-gray-600">
                {contratoData.loja.nome}
              </p>
              <p className="text-sm text-gray-500 mt-2">
                Contrato nº {contratoData.numero} - {formatDate(contratoData.data_criacao)}
              </p>
            </div>

            {/* Parties */}
            <div className="mb-8">
              <h3 className="text-xl font-semibold mb-4 text-gray-900">PARTES CONTRATANTES</h3>
              
              <div className="grid md:grid-cols-2 gap-6 mb-6">
                <div className="bg-gray-50 p-4 rounded-lg">
                  <h4 className="font-semibold text-gray-900 mb-2">CONTRATADA:</h4>
                  <p className="text-gray-700">{contratoData.loja.nome}</p>
                  <p className="text-sm text-gray-600">CNPJ: {contratoData.loja.cnpj}</p>
                  <p className="text-sm text-gray-600">{contratoData.loja.endereco}</p>
                  <p className="text-sm text-gray-600">Tel: {contratoData.loja.telefone}</p>
                </div>

                <div className="bg-gray-50 p-4 rounded-lg">
                  <h4 className="font-semibold text-gray-900 mb-2">CONTRATANTE:</h4>
                  <p className="text-gray-700">{contratoData.cliente.nome}</p>
                  <p className="text-sm text-gray-600">CPF: {contratoData.cliente.cpf}</p>
                  <p className="text-sm text-gray-600">{contratoData.cliente.endereco}</p>
                  <p className="text-sm text-gray-600">Tel: {contratoData.cliente.telefone}</p>
                  <p className="text-sm text-gray-600">E-mail: {contratoData.cliente.email}</p>
                </div>
              </div>
            </div>

            {/* Services */}
            <div className="mb-8">
              <h3 className="text-xl font-semibold mb-4 text-gray-900">OBJETO DO CONTRATO</h3>
              <p className="text-gray-700 mb-4">
                A CONTRATADA se obriga a fornecer e instalar os seguintes ambientes planejados:
              </p>
              
              <div className="space-y-3 mb-4">
                {contratoData.ambientes.map((ambiente, index) => (
                  <div key={index} className="border rounded-lg p-4 bg-gray-50">
                    <div className="flex justify-between items-start">
                      <div className="flex-1">
                        <h5 className="font-semibold text-gray-900">{ambiente.nome}</h5>
                        <p className="text-sm text-gray-600 mt-1">{ambiente.descricao}</p>
                        <Badge variant="outline" className="mt-2">
                          {ambiente.categoria}
                        </Badge>
                      </div>
                      <div className="text-right">
                        <span className="text-lg font-bold text-green-600">
                          {formatCurrency(ambiente.valor)}
                        </span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>

              <div className="bg-blue-50 p-4 rounded-lg">
                <div className="flex justify-between items-center text-lg">
                  <span className="font-semibold">Valor Total dos Serviços:</span>
                  <span className="font-bold text-blue-700">
                    {formatCurrency(contratoData.valor_final)}
                  </span>
                </div>
              </div>
            </div>

            {/* Terms */}
            <div className="mb-8">
              <h3 className="text-xl font-semibold mb-4 text-gray-900">CONDIÇÕES GERAIS</h3>
              
              <div className="space-y-4 text-gray-700">
                <div>
                  <h4 className="font-semibold mb-2">1. PRAZO DE ENTREGA</h4>
                  <p>O prazo para entrega e instalação é de <strong>{contratoData.prazo_entrega}</strong>, contados a partir da aprovação do projeto e confirmação do pagamento.</p>
                </div>

                <div>
                  <h4 className="font-semibold mb-2">2. GARANTIA</h4>
                  <p>{contratoData.condicoes}</p>
                </div>

                <div>
                  <h4 className="font-semibold mb-2">3. RESPONSABILIDADES</h4>
                  <p>A CONTRATADA se responsabiliza pela qualidade dos materiais e pela instalação dos móveis. O CONTRATANTE deve disponibilizar o local e condições adequadas para instalação.</p>
                </div>

                <div>
                  <h4 className="font-semibold mb-2">4. VENDEDOR RESPONSÁVEL</h4>
                  <p>Vendedor: <strong>{contratoData.vendedor}</strong></p>
                  <p>Gerente: <strong>{contratoData.gerente}</strong></p>
                </div>
              </div>
            </div>

            {/* Signatures */}
            <div className="border-t pt-8">
              <h3 className="text-xl font-semibold mb-6 text-gray-900">ASSINATURAS</h3>
              
              <div className="grid md:grid-cols-2 gap-8">
                <div className="text-center">
                  <div className="border-t border-gray-400 pt-2 mt-16">
                    <p className="font-semibold">{contratoData.loja.nome}</p>
                    <p className="text-sm text-gray-600">CONTRATADA</p>
                  </div>
                </div>
                
                <div className="text-center">
                  <div className="border-t border-gray-400 pt-2 mt-16">
                    <p className="font-semibold">{contratoData.cliente.nome}</p>
                    <p className="text-sm text-gray-600">CONTRATANTE</p>
                  </div>
                </div>
              </div>

              <div className="text-center mt-8 text-sm text-gray-500">
                <p>São Paulo, {formatDate(contratoData.data_criacao)}</p>
              </div>
            </div>
          </div>
        </Card>
      </div>
    </div>
  );
};

export default ContractViewer;