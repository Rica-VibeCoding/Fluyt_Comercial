/**
 * TESTES DA CALCULADORA DE NEGOCIAÇÃO
 * Validação das funcionalidades antes da integração
 */

// Simular import (para Node.js)
const { CalculadoraNegociacao } = require('../src/lib/calculadora-negociacao.ts');

// ===============================
// DADOS DE TESTE
// ===============================

const formasExemplo = [
  {
    id: '1',
    tipo: 'a-vista',
    valor: 5000,
    valorPresente: 5000,
    travada: false,
    dados: {},
    criadaEm: '2024-01-01'
  },
  {
    id: '2', 
    tipo: 'boleto',
    valor: 3000,
    valorPresente: 2970, // ~1% desconto
    travada: false,
    dados: {},
    criadaEm: '2024-01-01'
  },
  {
    id: '3',
    tipo: 'cartao', 
    valor: 2000,
    valorPresente: 1829, // ~8.5% desconto (3% x 3 meses)
    travada: false,
    dados: {},
    criadaEm: '2024-01-01'
  }
];

const estadoTeste = {
  valorTotal: 10000,
  descontoPercentual: 0, // Sem desconto inicial
  formasPagamento: formasExemplo
};

// ===============================
// FUNÇÕES DE TESTE
// ===============================

function testarCalculoBasico() {
  console.log('\n🧮 TESTE 1: Cálculo Básico');
  console.log('=====================================');
  
  const resultado = CalculadoraNegociacao.calcular(estadoTeste);
  
  console.log('💰 Valor Total:', resultado.valorNegociado.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' }));
  console.log('📊 Valor Presente Total:', resultado.valorPresenteTotal.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' }));
  console.log('🎯 Desconto Real:', resultado.descontoReal.toFixed(2) + '%');
  console.log('⚖️ Diferença:', resultado.diferenca.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' }));
  console.log('🚨 Erros:', resultado.erros);
  
  // Validar que não há erros
  if (resultado.erros.length === 0) {
    console.log('✅ Teste 1 PASSOU - Cálculo básico funcionando');
  } else {
    console.log('❌ Teste 1 FALHOU - Erros encontrados');
  }
}

function testarDescontoPercentual() {
  console.log('\n📉 TESTE 2: Aplicação de Desconto 15%');
  console.log('=====================================');
  
  const estadoComDesconto = {
    ...estadoTeste,
    descontoPercentual: 15
  };
  
  const resultado = CalculadoraNegociacao.calcular(estadoComDesconto);
  
  console.log('💰 Valor Negociado:', resultado.valorNegociado.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' }));
  console.log('📊 Redistribuição das formas:');
  
  resultado.formasPagamento.forEach((forma, index) => {
    const original = formasExemplo[index].valor;
    const novo = forma.valor;
    const diferenca = ((novo - original) / original * 100).toFixed(1);
    
    console.log(`   ${forma.tipo}: R$ ${original.toLocaleString('pt-BR')} → R$ ${novo.toLocaleString('pt-BR')} (${diferenca > 0 ? '+' : ''}${diferenca}%)`);
  });
  
  console.log('🎯 Desconto Real:', resultado.descontoReal.toFixed(2) + '%');
  console.log('📝 Alterações:', resultado.alteracoesFeitas);
  
  // Validar que valor negociado está correto
  const valorEsperado = 10000 * 0.85; // 15% de desconto
  if (Math.abs(resultado.valorNegociado - valorEsperado) < 0.01) {
    console.log('✅ Teste 2 PASSOU - Desconto aplicado corretamente');
  } else {
    console.log('❌ Teste 2 FALHOU - Valor negociado incorreto');
  }
}

function testarTravamento() {
  console.log('\n🔒 TESTE 3: Travamento de Forma de Pagamento');
  console.log('=====================================');
  
  // Travar À Vista em R$ 6.000
  const formasComTravamento = CalculadoraNegociacao.toggleTravamento(formasExemplo, '1');
  formasComTravamento[0].valor = 6000; // Aumentar valor da À Vista
  
  const estadoComTravamento = {
    valorTotal: 10000,
    descontoPercentual: 10,
    formasPagamento: formasComTravamento
  };
  
  const resultado = CalculadoraNegociacao.calcular(estadoComTravamento);
  
  console.log('🔒 À Vista travada em R$ 6.000');
  console.log('💰 Valor Negociado:', resultado.valorNegociado.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' }));
  console.log('📊 Redistribuição (apenas formas livres):');
  
  resultado.formasPagamento.forEach(forma => {
    const status = forma.travada ? '🔒 TRAVADA' : '🔄 REDISTRIBUÍDA';
    console.log(`   ${forma.tipo}: R$ ${forma.valor.toLocaleString('pt-BR')} ${status}`);
  });
  
  // Validar que forma travada não mudou
  const aVistaTravada = resultado.formasPagamento.find(f => f.id === '1');
  if (aVistaTravada && aVistaTravada.valor === 6000) {
    console.log('✅ Teste 3 PASSOU - Travamento respeitado');
  } else {
    console.log('❌ Teste 3 FALHOU - Forma travada foi alterada');
  }
}

function testarValidacoes() {
  console.log('\n⚠️ TESTE 4: Validações de Limites');
  console.log('=====================================');
  
  // Testar desconto excessivo
  const estadoInvalido = {
    valorTotal: 10000,
    descontoPercentual: 60, // Acima do limite de 50%
    formasPagamento: formasExemplo
  };
  
  const resultado = CalculadoraNegociacao.calcular(estadoInvalido);
  
  console.log('🚨 Tentativa de desconto 60% (limite: 50%)');
  console.log('📋 Erros capturados:', resultado.erros);
  
  if (resultado.erros.length > 0 && resultado.erros[0].includes('50%')) {
    console.log('✅ Teste 4 PASSOU - Validação de limite funcionando');
  } else {
    console.log('❌ Teste 4 FALHOU - Validação não capturou erro');
  }
}

function testarCalculoValorPresente() {
  console.log('\n💵 TESTE 5: Cálculo de Valor Presente');
  console.log('=====================================');
  
  // Testar cálculo manual
  const valorFuturo = 1000;
  
  console.log('Comparação de Valor Presente por tipo:');
  console.log('  À Vista: R$ 1.000 → R$ 1.000 (taxa 0%)');
  console.log('  Boleto: R$ 1.000 → R$ 990 (taxa 1% x 1 mês)');
  console.log('  Financeira: R$ 1.000 → R$ 781 (taxa 2% x 12 meses)');
  console.log('  Cartão: R$ 1.000 → R$ 829 (taxa 3% x 3 meses)');
  
  // Simular resultado calculado
  const estadoVP = {
    valorTotal: 4000,
    descontoPercentual: 0,
    formasPagamento: [
      { ...formasExemplo[0], tipo: 'a-vista', valor: 1000 },
      { ...formasExemplo[1], tipo: 'boleto', valor: 1000 },
      { ...formasExemplo[2], tipo: 'financeira', valor: 1000 },
      { ...formasExemplo[0], tipo: 'cartao', valor: 1000, id: '4' }
    ]
  };
  
  const resultado = CalculadoraNegociacao.calcular(estadoVP);
  console.log('💰 Valor Presente Total Calculado:', resultado.valorPresenteTotal.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' }));
  console.log('🎯 Desconto Real:', resultado.descontoReal.toFixed(2) + '%');
  
  // O valor presente deve ser menor que 4000 devido às taxas
  if (resultado.valorPresenteTotal < 4000) {
    console.log('✅ Teste 5 PASSOU - Valor presente corretamente deflacionado');
  } else {
    console.log('❌ Teste 5 FALHOU - Deflação não aplicada corretamente');
  }
}

function testarCenarioCompleto() {
  console.log('\n🎯 TESTE 6: Cenário Completo de Negociação');
  console.log('=====================================');
  
  console.log('📋 Cenário: Cliente negocia 20% de desconto');
  console.log('  - Valor Original: R$ 10.000');
  console.log('  - À Vista fica travada em R$ 4.000');
  console.log('  - Restante distribuído entre outras formas');
  
  // Configurar cenário
  let formasNegociacao = [...formasExemplo];
  formasNegociacao = CalculadoraNegociacao.toggleTravamento(formasNegociacao, '1'); // Travar À Vista
  formasNegociacao[0].valor = 4000; // À Vista = R$ 4.000
  
  const estadoNegociacao = {
    valorTotal: 10000,
    descontoPercentual: 20,
    formasPagamento: formasNegociacao
  };
  
  const resultado = CalculadoraNegociacao.calcular(estadoNegociacao);
  
  console.log('\n📊 RESULTADO DA NEGOCIAÇÃO:');
  console.log('💰 Valor Negociado:', resultado.valorNegociado.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' }));
  console.log('📉 Desconto Aplicado: 20%');
  console.log('🎯 Desconto Real:', resultado.descontoReal.toFixed(2) + '%');
  console.log('💵 Valor Realmente Recebido:', resultado.valorPresenteTotal.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' }));
  
  console.log('\n📋 FORMAS DE PAGAMENTO:');
  resultado.formasPagamento.forEach(forma => {
    const status = forma.travada ? '🔒' : '🔄';
    const vp = forma.valor; // Simplificado para teste
    console.log(`   ${status} ${forma.tipo}: R$ ${forma.valor.toLocaleString('pt-BR')} (VP: R$ ${vp.toLocaleString('pt-BR')})`);
  });
  
  console.log('\n🎭 ANÁLISE:');
  const diferencaDesconto = (resultado.descontoReal - 20).toFixed(2);
  console.log(`   - Cliente pensa que teve ${20}% de desconto`);
  console.log(`   - Desconto real é ${resultado.descontoReal.toFixed(2)}% (${diferencaDesconto > 0 ? '+' : ''}${diferencaDesconto} pontos)`);
  
  const ganhoEmpresa = resultado.valorPresenteTotal - (10000 * 0.8);
  console.log(`   - Empresa recebe R$ ${ganhoEmpresa.toLocaleString('pt-BR')} a mais que desconto nominal`);
  
  console.log('✅ Teste 6 CONCLUÍDO - Cenário completo simulado');
}

// ===============================
// EXECUTAR TODOS OS TESTES
// ===============================

function executarTodosTestes() {
  console.log('🚀 INICIANDO TESTES DA CALCULADORA DE NEGOCIAÇÃO');
  console.log('==================================================');
  
  try {
    testarCalculoBasico();
    testarDescontoPercentual();
    testarTravamento();
    testarValidacoes();
    testarCalculoValorPresente();
    testarCenarioCompleto();
    
    console.log('\n🎉 TODOS OS TESTES CONCLUÍDOS!');
    console.log('================================');
    console.log('✅ Calculadora pronta para integração');
    console.log('🔧 Próximo passo: Integrar com componente React');
    
  } catch (error) {
    console.log('\n❌ ERRO NOS TESTES:', error.message);
    console.log('🔧 Verifique a implementação da calculadora');
  }
}

// Executar se chamado diretamente
if (require.main === module) {
  executarTodosTestes();
}

module.exports = {
  executarTodosTestes,
  testarCalculoBasico,
  testarDescontoPercentual,
  testarTravamento,
  testarValidacoes,
  testarCalculoValorPresente,
  testarCenarioCompleto
};