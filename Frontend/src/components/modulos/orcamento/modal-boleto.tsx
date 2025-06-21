'use client';

import React, { useState, useEffect } from 'react';
import { Input } from '@/components/ui/input';
import { formatarDataInput, obterDataAtualInput, converterDataParaInput } from '@/lib/formatters';
import { gerarCronogramaParcelas } from '@/lib/calculators';
import { ModalPagamentoBase } from './ModalPagamentoBase';
import { CampoValor } from './CampoValor';

interface ParcelaBoleto {
  numero: number;
  data: string;
  valor: number;
}

interface ModalBoletoProps {
  isOpen: boolean;
  onClose: () => void;
  onSalvar: (dados: { valor: number; parcelas: ParcelaBoleto[] }) => void;
  dadosIniciais?: {
    valor?: number;
    parcelas?: ParcelaBoleto[];
  };
  valorMaximo?: number;
  valorJaAlocado?: number;
}

export function ModalBoleto({ isOpen, onClose, onSalvar, dadosIniciais, valorMaximo = 0, valorJaAlocado = 0 }: ModalBoletoProps) {
  // ✅ USAR ESTADOS PRÓPRIOS (como modal financeira que funciona)
  const [valor, setValor] = useState('');
  const [numeroVezes, setNumeroVezes] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [salvando, setSalvando] = useState(false);
  const [erroValidacao, setErroValidacao] = useState('');
  
  // Configuração de limites sem usar hook
  const limitesConfig = { min: 1, max: 12 };

  // Estados específicos apenas para boleto (data e parcelas)
  const [dataPrimeira, setDataPrimeira] = useState('');
  const [parcelas, setParcelas] = useState<ParcelaBoleto[]>([]);
  const [datasEditadas, setDatasEditadas] = useState<Set<number>>(new Set());


  // Carregar dados iniciais quando modal abrir para edição
  useEffect(() => {
    if (isOpen && dadosIniciais) {
      if (dadosIniciais.valor) {
        const valorFormatado = dadosIniciais.valor.toLocaleString('pt-BR', {
          style: 'currency',
          currency: 'BRL'
        });
        setValor(valorFormatado);
      }
      
      if (dadosIniciais.parcelas && dadosIniciais.parcelas.length > 0) {
        setNumeroVezes(dadosIniciais.parcelas.length.toString());
        
        // Definir data da primeira parcela
        const primeiraParcela = dadosIniciais.parcelas[0];
        if (primeiraParcela.data) {
          const dataFormatada = converterDataParaInput(primeiraParcela.data);
          setDataPrimeira(dataFormatada);
        }
        
        // Carregar todas as parcelas
        setParcelas(dadosIniciais.parcelas);
      }
    } else if (isOpen) {
      // Limpar campos se for nova forma
      setValor('');
      setNumeroVezes('');
      setDataPrimeira('');
      setParcelas([]);
      setDatasEditadas(new Set());
    }
  }, [isOpen, dadosIniciais]);

  // Gerar parcelas automaticamente usando função centralizada
  useEffect(() => {
    if (numeroVezes && dataPrimeira && valor) {
      const vezes = parseInt(numeroVezes);
      const valorNumerico = parseFloat(valor.replace(/[^\d,]/g, '').replace(',', '.'));
      
      if (vezes >= limitesConfig.min && vezes <= limitesConfig.max && !isNaN(valorNumerico)) {
        const cronograma = gerarCronogramaParcelas(valorNumerico, vezes, dataPrimeira);
        setParcelas(cronograma);
        // Reset datas editadas quando gera novas parcelas
        setDatasEditadas(new Set());
      }
    } else {
      setParcelas([]);
      setDatasEditadas(new Set());
    }
  }, [numeroVezes, dataPrimeira, valor]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    const valorNumerico = parseFloat(valor.replace(/[^\d,]/g, '').replace(',', '.'));
    const valorRestante = valorMaximo - valorJaAlocado;
    
    // Validação final
    if (valorNumerico > valorRestante) {
      setErroValidacao(`Valor excede o disponível: R$ ${valorRestante.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}`);
      return;
    }
    
    setIsLoading(true);
    setSalvando(true);

    try {
      // Chama onSalvar imediatamente (sem delay)
      onSalvar({
        valor: valorNumerico,
        parcelas: parcelas
      });

      // Aguarda 1.5 segundos para garantir feedback visual claro
      await new Promise(resolve => setTimeout(resolve, 1500));

      // Reset form
      setValor('');
      setNumeroVezes('');
      setDataPrimeira('');
      setParcelas([]);
      setDatasEditadas(new Set());
      setErroValidacao('');
      setSalvando(false);
      onClose();
    } catch (error) {
      console.error('Erro ao salvar boleto:', error);
      setSalvando(false);
    } finally {
      setIsLoading(false);
    }
  };

  const formatarValor = (value: string) => {
    const numero = value.replace(/\D/g, '');
    const valorNumerico = parseInt(numero) / 100;
    
    return valorNumerico.toLocaleString('pt-BR', {
      style: 'currency',
      currency: 'BRL'
    });
  };

  const handleValorChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const valorFormatado = formatarValor(e.target.value);
    setValor(valorFormatado);
    
    // Validar em tempo real
    const valorNumerico = parseFloat(valorFormatado.replace(/[^\d,]/g, '').replace(',', '.'));
    const valorRestante = valorMaximo - valorJaAlocado;
    
    if (valorNumerico > valorRestante) {
      setErroValidacao(`Valor excede o disponível: R$ ${valorRestante.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}`);
    } else {
      setErroValidacao('');
    }
  };

  const handleDataParcelaChange = (index: number, novaData: string) => {
    const novasParcelas = [...parcelas];
    novasParcelas[index].data = novaData;
    setParcelas(novasParcelas);
    
    // Marca esta data como editada
    setDatasEditadas(prev => new Set([...prev, index]));
  };

  const getDataMinima = () => {
    return obterDataAtualInput();
  };

  // Função para determinar a classe CSS da célula
  const getCellClass = (index: number) => {
    if (salvando) return "bg-green-100 dark:bg-green-900/30"; // Todas verdes ao salvar
    if (datasEditadas.has(index)) return "bg-green-50 dark:bg-green-900/20"; // Verde claro se editada
    return ""; // Normal
  };

  const isFormValido = valor && numeroVezes && dataPrimeira && parcelas.length > 0 && !erroValidacao;

  return (
    <ModalPagamentoBase
      isOpen={isOpen}
      onClose={onClose}
      titulo="Boleto"
      isLoading={isLoading}
      salvando={salvando}
      erroValidacao={erroValidacao}
      onSubmit={handleSubmit}
      isFormValido={isFormValido}
    >
      {/* Campo Valor - SISTEMA PRÓPRIO (como modal financeira) */}
      <div>
        <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">
          Valor *
        </label>
        <Input
          type="text"
          value={valor}
          onChange={handleValorChange}
          placeholder="R$ 0,00"
          className="h-9 text-sm border-slate-300 focus:border-slate-400 dark:border-slate-600 dark:focus:border-slate-500"
          disabled={salvando}
          required
          autoComplete="off"
          autoFocus={false}
        />
        {valorMaximo > 0 && (
          <div className="mt-1 text-xs text-slate-500">
            Disponível: <span className="font-medium">R$ {(valorMaximo - valorJaAlocado).toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</span>
          </div>
        )}
        {erroValidacao && (
          <div className="mt-1 text-xs text-red-600">
            {erroValidacao}
          </div>
        )}
      </div>

      {/* Grid: Número de Vezes + Data Primeira */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
        <div>
          <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">
            Número de Vezes *
          </label>
          <Input
            type="number"
            value={numeroVezes}
            onChange={(e) => setNumeroVezes(e.target.value)}
            placeholder="1"
            min="1"
            max={limitesConfig.max.toString()}
            className="h-9 text-sm border-slate-300 focus:border-slate-400 dark:border-slate-600 dark:focus:border-slate-500"
            required
            autoComplete="off"
            autoFocus={false}
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">
            Data Primeira *
          </label>
          <Input
            type="date"
            value={dataPrimeira}
            onChange={(e) => setDataPrimeira(e.target.value)}
            min={getDataMinima()}
            className="h-9 text-sm border-slate-300 focus:border-slate-400 dark:border-slate-600 dark:focus:border-slate-500 w-full min-w-[120px]"
            required
            autoComplete="off"
            autoFocus={false}
          />
        </div>
      </div>

      {/* Minitabela de Parcelas */}
      {parcelas.length > 0 && (
        <div className="mt-2">
          <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
            Datas das Parcelas
          </label>
          
          <div className="border border-slate-200 dark:border-slate-600 rounded-lg text-sm">
            {/* Header da tabela */}
            <div className="grid grid-cols-3 gap-2 p-3 bg-slate-50 dark:bg-slate-800 border-b border-slate-200 dark:border-slate-600 font-medium text-slate-700 dark:text-slate-300">
              <span>Parcela</span>
              <span>Data</span>
              <span>Valor</span>
            </div>
            
            {/* Linhas das parcelas */}
            <div className={parcelas.length > 10 ? "max-h-48 overflow-y-auto" : ""}>
              {parcelas.map((parcela, index) => (
                <div key={index} className={`grid grid-cols-3 gap-2 p-3 border-b border-slate-100 dark:border-slate-700 last:border-b-0 transition-colors duration-200 ${getCellClass(index)}`}>
                  <span className="text-slate-600 dark:text-slate-400 self-center font-medium">
                    {parcela.numero}x
                  </span>
                  <Input
                    type="date"
                    value={parcela.data}
                    onChange={(e) => handleDataParcelaChange(index, e.target.value)}
                    className="h-8 text-sm border-slate-200 focus:border-slate-300 dark:border-slate-600 dark:focus:border-slate-500"
                    min={getDataMinima()}
                    disabled={salvando}
                    autoComplete="off"
                  />
                  <span className="text-slate-600 dark:text-slate-400 self-center text-sm font-medium">
                    {parcela.valor.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}
                  </span>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
      
    </ModalPagamentoBase>
  );
}