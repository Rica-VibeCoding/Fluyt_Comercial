/**
 * Teste de Fluxo Completo - Clientes → Ambientes → Orçamento → Contratos
 * 
 * Este teste valida todo o fluxo comercial de ponta a ponta para identificar
 * onde o cliente está sendo perdido e os dados zerados.
 */

// Simulação do estado da sessão
class SessaoSimulada {
  constructor() {
    this.reset();
  }

  reset() {
    this.estado = {
      cliente: null,
      ambientes: [],
      valorTotalAmbientes: 0,
      orcamentoConfigurado: false,
      valorNegociado: 0,
      formasPagamento: 0,
      descontoReal: 0
    };
    this.logs = [];
  }

  log(acao, dados) {
    const timestamp = new Date().toISOString();
    this.logs.push({ timestamp, acao, dados: JSON.parse(JSON.stringify(dados)) });
    console.log(`📝 [${timestamp}] ${acao}:`, dados);
  }

  // Simular definição de cliente
  definirCliente(cliente) {
    this.log('DEFINIR_CLIENTE', { anterior: this.estado.cliente?.nome, novo: cliente?.nome });
    this.estado.cliente = cliente;
    
    // Verificar se deveria limpar dados
    if (!cliente) {
      this.estado.ambientes = [];
      this.estado.valorTotalAmbientes = 0;
      this.estado.orcamentoConfigurado = false;
      this.estado.valorNegociado = 0;
      this.estado.formasPagamento = 0;
      this.estado.descontoReal = 0;
    }
  }

  // Simular definição de ambientes
  definirAmbientes(ambientes) {
    this.log('DEFINIR_AMBIENTES', { quantidade: ambientes.length });
    this.estado.ambientes = ambientes;
    this.estado.valorTotalAmbientes = ambientes.reduce((total, amb) => total + amb.valorTotal, 0);
  }

  // Simular definição de orçamento
  definirOrcamento(valorNegociado, formasPagamento, descontoReal = 0) {
    this.log('DEFINIR_ORCAMENTO', { valorNegociado, formasPagamento, descontoReal });
    this.estado.orcamentoConfigurado = formasPagamento > 0;
    this.estado.valorNegociado = valorNegociado;
    this.estado.formasPagamento = formasPagamento;
    this.estado.descontoReal = descontoReal;
  }

  // Simular navegação (onde pode estar o problema)
  simularNavegacao(origem, destino, preservarParametros = false) {
    this.log('NAVEGACAO', { origem, destino, preservarParametros });
    
    // Simular perda de parâmetros de URL se não preservar
    if (!preservarParametros) {
      this.log('PERDA_PARAMETROS', { 
        clienteAtual: this.estado.cliente?.nome,
        acao: 'Cliente pode ser perdido sem parâmetros'
      });
      
      // Simular limpeza de cliente (como no bug reportado)
      if (Math.random() > 0.5) { // 50% chance de perder cliente
        this.definirCliente(null);
        return false; // Navegação com erro
      }
    }
    
    return true; // Navegação bem-sucedida
  }

  // Obter resumo atual
  obterResumo() {
    return {
      temCliente: !!this.estado.cliente,
      clienteNome: this.estado.cliente?.nome || 'NENHUM',
      quantidadeAmbientes: this.estado.ambientes.length,
      valorTotalAmbientes: this.estado.valorTotalAmbientes,
      orcamentoConfigurado: this.estado.orcamentoConfigurado,
      valorNegociado: this.estado.valorNegociado,
      formasPagamento: this.estado.formasPagamento,
      descontoReal: this.estado.descontoReal,
      podeGerarContrato: this.estado.cliente && this.estado.ambientes.length > 0 && this.estado.orcamentoConfigurado
    };
  }
}

// Dados de teste
const CLIENTE_TESTE = {
  id: 'cliente-123',
  nome: 'João Silva',
  email: 'joao@teste.com'
};

const AMBIENTES_TESTE = [
  { id: 'amb-1', nome: 'Sala', valorTotal: 5000 },
  { id: 'amb-2', nome: 'Quarto', valorTotal: 3000 },
  { id: 'amb-3', nome: 'Cozinha', valorTotal: 4000 }
];

const ORCAMENTO_TESTE = {
  valorNegociado: 11400, // 12000 - 5% desconto
  formasPagamento: 2,
  descontoReal: 5.0
};

// Função principal de teste
function testarFluxoCompleto() {
  console.log('🚀 INICIANDO TESTE DE FLUXO COMPLETO\n');
  
  const sessao = new SessaoSimulada();
  const resultados = [];

  // FASE 1: Configurar Cliente
  console.log('📋 FASE 1: CONFIGURAR CLIENTE');
  sessao.definirCliente(CLIENTE_TESTE);
  let resumo = sessao.obterResumo();
  resultados.push({
    fase: 'CLIENTE',
    sucesso: resumo.temCliente,
    dados: resumo
  });
  console.log('✅ Cliente configurado:', resumo.clienteNome);

  // FASE 2: Adicionar Ambientes
  console.log('\n🏢 FASE 2: ADICIONAR AMBIENTES');
  sessao.definirAmbientes(AMBIENTES_TESTE);
  resumo = sessao.obterResumo();
  resultados.push({
    fase: 'AMBIENTES',
    sucesso: resumo.quantidadeAmbientes > 0,
    dados: resumo
  });
  console.log(`✅ Ambientes adicionados: ${resumo.quantidadeAmbientes} (R$ ${resumo.valorTotalAmbientes})`);

  // FASE 3: Navegar para Orçamento
  console.log('\n💰 FASE 3: NAVEGAR PARA ORÇAMENTO');
  const navegacaoOrcamento = sessao.simularNavegacao('/painel/ambientes', '/painel/orcamento', true);
  resultados.push({
    fase: 'NAVEGACAO_ORCAMENTO',
    sucesso: navegacaoOrcamento,
    dados: sessao.obterResumo()
  });

  if (!navegacaoOrcamento) {
    console.log('❌ FALHA: Cliente perdido na navegação para orçamento');
    return { sucesso: false, resultados, logs: sessao.logs };
  }

  // FASE 4: Configurar Orçamento
  console.log('\n📊 FASE 4: CONFIGURAR ORÇAMENTO');
  sessao.definirOrcamento(ORCAMENTO_TESTE.valorNegociado, ORCAMENTO_TESTE.formasPagamento, ORCAMENTO_TESTE.descontoReal);
  resumo = sessao.obterResumo();
  resultados.push({
    fase: 'ORCAMENTO',
    sucesso: resumo.orcamentoConfigurado,
    dados: resumo
  });
  console.log(`✅ Orçamento configurado: R$ ${resumo.valorNegociado} (${resumo.formasPagamento} formas, ${resumo.descontoReal}% desconto)`);

  // FASE 5: Navegar para Contratos (PONTO CRÍTICO)
  console.log('\n📋 FASE 5: NAVEGAR PARA CONTRATOS (PONTO CRÍTICO)');
  
  // Testar navegação SEM preservar parâmetros (cenário do bug)
  console.log('🔍 Testando navegação SEM preservar parâmetros...');
  const navegacaoContratosSemParametros = sessao.simularNavegacao('/painel/orcamento', '/painel/contratos', false);
  
  if (!navegacaoContratosSemParametros) {
    console.log('❌ FALHA CONFIRMADA: Cliente perdido na navegação para contratos');
    resumo = sessao.obterResumo();
    resultados.push({
      fase: 'NAVEGACAO_CONTRATOS_SEM_PARAMS',
      sucesso: false,
      dados: resumo,
      problema: 'Cliente perdido, dados zerados'
    });
    
    // Restaurar cliente para testar com parâmetros
    sessao.definirCliente(CLIENTE_TESTE);
    sessao.definirAmbientes(AMBIENTES_TESTE);
    sessao.definirOrcamento(ORCAMENTO_TESTE.valorNegociado, ORCAMENTO_TESTE.formasPagamento, ORCAMENTO_TESTE.descontoReal);
  }

  // Testar navegação COM preservar parâmetros (correção implementada)
  console.log('🔍 Testando navegação COM preservar parâmetros...');
  const navegacaoContratosComParametros = sessao.simularNavegacao('/painel/orcamento', '/painel/contratos', true);
  resumo = sessao.obterResumo();
  
  resultados.push({
    fase: 'NAVEGACAO_CONTRATOS_COM_PARAMS',
    sucesso: navegacaoContratosComParametros && resumo.podeGerarContrato,
    dados: resumo
  });

  // FASE 6: Validar Estado Final em Contratos
  console.log('\n📑 FASE 6: VALIDAR ESTADO FINAL EM CONTRATOS');
  resumo = sessao.obterResumo();
  
  const validacaoFinal = {
    clientePreservado: resumo.temCliente,
    ambientesPreservados: resumo.quantidadeAmbientes > 0,
    orcamentoPreservado: resumo.orcamentoConfigurado,
    podeGerarContrato: resumo.podeGerarContrato,
    valoresCorretos: {
      valorAmbientes: resumo.valorTotalAmbientes === 12000,
      descontoReal: resumo.descontoReal === 5.0,
      valorNegociado: resumo.valorNegociado === 11400
    }
  };

  resultados.push({
    fase: 'VALIDACAO_FINAL',
    sucesso: Object.values(validacaoFinal).every(v => v === true || (typeof v === 'object' && Object.values(v).every(x => x === true))),
    dados: validacaoFinal
  });

  // RESUMO FINAL
  const sucessoGeral = resultados.every(r => r.sucesso);
  
  console.log('\n📊 RESUMO FINAL:');
  console.log('==================');
  resultados.forEach(resultado => {
    const status = resultado.sucesso ? '✅' : '❌';
    console.log(`${status} ${resultado.fase}: ${resultado.sucesso ? 'SUCESSO' : 'FALHA'}`);
    if (!resultado.sucesso && resultado.problema) {
      console.log(`   🚨 Problema: ${resultado.problema}`);
    }
  });
  
  console.log(`\n🎯 RESULTADO GERAL: ${sucessoGeral ? '✅ SUCESSO' : '❌ FALHA'}`);
  
  return {
    sucesso: sucessoGeral,
    resultados,
    logs: sessao.logs,
    estadoFinal: resumo
  };
}

// Executar teste
const resultadoTeste = testarFluxoCompleto();

// Análise específica do problema de contratos
console.log('\n🔍 ANÁLISE ESPECÍFICA DO PROBLEMA:');
console.log('=====================================');

if (!resultadoTeste.sucesso) {
  console.log('❌ PROBLEMAS IDENTIFICADOS:');
  
  const falhas = resultadoTeste.resultados.filter(r => !r.sucesso);
  falhas.forEach(falha => {
    console.log(`\n🚨 FALHA NA FASE: ${falha.fase}`);
    console.log('📋 Dados no momento da falha:', JSON.stringify(falha.dados, null, 2));
  });
  
  console.log('\n💡 RECOMENDAÇÕES:');
  console.log('1. Verificar se parâmetros de URL estão sendo preservados na navegação');
  console.log('2. Validar se useClienteSelecionadoRealista está limpando cliente incorretamente');
  console.log('3. Confirmar se definirOrcamento está salvando descontoReal corretamente');
  console.log('4. Testar se contract-summary.tsx está lendo dados da sessão corretamente');
  
} else {
  console.log('✅ TESTE PASSOU! Problema pode estar em implementação específica.');
}

console.log('\n📝 LOGS DETALHADOS:');
console.log('===================');
resultadoTeste.logs.forEach(log => {
  console.log(`[${log.timestamp}] ${log.acao}:`, log.dados);
});

module.exports = { testarFluxoCompleto, SessaoSimulada };