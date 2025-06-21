import { useState } from 'react';
import { Ambiente, AmbienteFormData } from '../../../types/ambiente';

const nomesFicticios = [
  'Cozinha',
  'Dormitório',
  'Sala de Estar',
  'Banheiro',
  'Escritório',
  'Lavanderia',
  'Quarto Master',
  'Closet',
  'Sala de Jantar',
  'Varanda'
];

export const useAmbientes = (clienteId?: string) => {
  const [ambientes, setAmbientes] = useState<Ambiente[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  const adicionarAmbiente = (data: AmbienteFormData) => {
    const agora = new Date().toISOString();
    
    const novoAmbiente: Ambiente = {
      id: Date.now().toString(),
      nome: data.nome,
      acabamentos: data.acabamentos.map((acabamento, index) => ({
        ...acabamento,
        id: `${Date.now()}-${index}`,
        valor: 0 // Valor padrão pois agora o valor é único por ambiente
      })),
      valorTotal: data.valorTotal,
      clienteId: clienteId,
      // Timestamps para ambiente criado manualmente
      criadoEm: agora,
      origem: 'manual'
    };

    setAmbientes(prev => [...prev, novoAmbiente]);
  };

  const removerAmbiente = (id: string) => {
    setAmbientes(prev => prev.filter(ambiente => ambiente.id !== id));
  };

  const importarXML = async () => {
    if (!clienteId) return;
    
    setIsLoading(true);
    
    // Função provisória que cria um ambiente fictício
    setTimeout(() => {
      const nomeAleatorio = nomesFicticios[Math.floor(Math.random() * nomesFicticios.length)];
      const agora = new Date().toISOString();
      
      const ambienteFicticio: Ambiente = {
        id: 'xml-' + Date.now(),
        nome: nomeAleatorio,
        acabamentos: [
          {
            id: 'acabamento-1',
            tipo: 'Porta',
            cor: 'Madeira Natural',
            espessura: '18mm',
            material: 'MDF',
            valor: 850
          },
          {
            id: 'acabamento-2',
            tipo: 'Caixa',
            cor: 'Branco Texturizado',
            espessura: '15mm',
            material: 'MDP',
            valor: 1200
          },
          {
            id: 'acabamento-3',
            tipo: 'Painel',
            cor: 'Carvalho Europeu',
            espessura: '18mm',
            material: 'MDF',
            valor: 950
          }
        ],
        valorTotal: 3000 + Math.floor(Math.random() * 2000), // Valor entre 3000 e 5000
        clienteId: clienteId,
        // Timestamps para ambiente importado via XML
        importadoEm: agora,
        criadoEm: agora, // Mesmo timestamp para ambos neste caso
        origem: 'xml'
      };

      setAmbientes(prev => [...prev, ambienteFicticio]);
      setIsLoading(false);
      
      console.log('Ambiente fictício criado:', ambienteFicticio);
    }, 1500);
  };

  const valorTotalGeral = ambientes.reduce((total, ambiente) => total + ambiente.valorTotal, 0);

  return {
    ambientes,
    adicionarAmbiente,
    removerAmbiente,
    importarXML,
    isLoading,
    valorTotalGeral
  };
};