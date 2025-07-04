/**
 * Sistema de Sessão Unificado
 * Substitui sessao-simples.ts e sessao-bridge.ts
 */

import { Cliente } from '@/types/cliente';
import { Ambiente } from '@/types/ambiente';
import { FormaPagamento } from '@/types/orcamento';

export interface SessaoUnificada {
  cliente: Cliente | null;
  ambientes: Ambiente[];
  formasPagamento: FormaPagamento[];
  valorTotal: number;
  dataAtualizacao: string;
}

class GerenciadorSessao {
  private static instance: GerenciadorSessao;
  private readonly CHAVE = 'fluyt_sessao_unificada';
  
  private constructor() {}
  
  public static getInstance(): GerenciadorSessao {
    if (!GerenciadorSessao.instance) {
      GerenciadorSessao.instance = new GerenciadorSessao();
    }
    return GerenciadorSessao.instance;
  }
  
  public carregar(): SessaoUnificada {
    if (typeof window === 'undefined') {
      return this.getEstadoVazio();
    }
    
    try {
      const dados = localStorage.getItem(this.CHAVE);
      if (dados) {
        return JSON.parse(dados);
      }
    } catch (error) {
      console.error('Erro ao carregar sessão:', error);
    }
    
    return this.getEstadoVazio();
  }
  
  public salvar(sessao: SessaoUnificada): boolean {
    if (typeof window === 'undefined') return false;
    
    try {
      sessao.dataAtualizacao = new Date().toISOString();
      localStorage.setItem(this.CHAVE, JSON.stringify(sessao));
      return true;
    } catch (error) {
      console.error('Erro ao salvar sessão:', error);
      return false;
    }
  }
  
  public limpar(): boolean {
    if (typeof window === 'undefined') return false;
    
    try {
      localStorage.removeItem(this.CHAVE);
      return true;
    } catch (error) {
      console.error('Erro ao limpar sessão:', error);
      return false;
    }
  }
  
  public atualizarCliente(cliente: Cliente | null): void {
    const sessao = this.carregar();
    sessao.cliente = cliente;
    this.salvar(sessao);
  }
  
  public atualizarAmbientes(ambientes: Ambiente[]): void {
    const sessao = this.carregar();
    sessao.ambientes = ambientes;
    sessao.valorTotal = this.calcularValorTotal(ambientes);
    this.salvar(sessao);
  }
  
  public atualizarFormasPagamento(formas: FormaPagamento[]): void {
    const sessao = this.carregar();
    sessao.formasPagamento = formas;
    this.salvar(sessao);
  }
  
  private calcularValorTotal(ambientes: Ambiente[]): number {
    return ambientes.reduce((total, amb) => 
      total + (amb.valor_venda || amb.valor_custo_fabrica || 0), 0
    );
  }
  
  private getEstadoVazio(): SessaoUnificada {
    return {
      cliente: null,
      ambientes: [],
      formasPagamento: [],
      valorTotal: 0,
      dataAtualizacao: new Date().toISOString()
    };
  }
}

// Exportar instância única
export const sessaoUnificada = GerenciadorSessao.getInstance();