/**
 * Teste específico para debug do componente de contratos
 * Simula o estado da sessão e testa como o contrato lê os dados
 */

// Simulação do estado da sessão conforme aparece no bug
const estadoSessaoComBug = {
  cliente: null, // Cliente perdido
  ambientes: [],
  valorTotalAmbientes: 0,
  descontoReal: 0, // Zero devido à perda do cliente
  podeGerarContrato: false
};

const estadoSessaoCorreto = {
  cliente: {
    id: 'cliente-123',
    nome: 'João Silva',
    cpf_cnpj: '123.456.789-00',
    logradouro: 'Rua das Flores',
    numero: '123',
    bairro: 'Centro',
    cidade: 'São Paulo',
    uf: 'SP',
    telefone: '(11) 99999-9999',
    email: 'joao@teste.com'
  },
  ambientes: [
    { id: 'amb-1', nome: 'Sala', valorTotal: 5000, acabamentos: ['Piso', 'Tinta'] },
    { id: 'amb-2', nome: 'Quarto', valorTotal: 3000, acabamentos: ['Piso'] },
    { id: 'amb-3', nome: 'Cozinha', valorTotal: 4000, acabamentos: ['Azulejo', 'Bancada'] }
  ],
  valorTotalAmbientes: 12000,
  descontoReal: 5.0, // 5% de desconto real calculado
  podeGerarContrato: true
};

// Mock do contratoMock (dados padrão)
const contratoMock = {
  desconto: 0.10, // 10% padrão
  valor_total: 0,
  valor_final: 0
};

// Função que simula a lógica do contract-summary.tsx
function simularCalculoContrato(estadoSessao) {
  console.log('🔍 SIMULANDO CÁLCULO DO CONTRATO');
  console.log('Estado da sessão recebido:', JSON.stringify(estadoSessao, null, 2));
  
  const { cliente, ambientes, valorTotalAmbientes, descontoReal } = estadoSessao;
  
  // Esta é a lógica atual da linha 25 do contract-summary.tsx
  const descontoParaUsar = descontoReal > 0 ? descontoReal / 100 : contratoMock.desconto;
  
  console.log('📊 ANÁLISE DO DESCONTO:');
  console.log(`   descontoReal da sessão: ${descontoReal}`);
  console.log(`   Condição (descontoReal > 0): ${descontoReal > 0}`);
  console.log(`   Desconto usado: ${descontoParaUsar} (${descontoParaUsar * 100}%)`);
  console.log(`   Origem: ${descontoReal > 0 ? 'SESSÃO' : 'MOCK (10%)'}`);
  
  const dadosContrato = {
    valor_total: valorTotalAmbientes,
    desconto: descontoParaUsar,
    valor_final: valorTotalAmbientes * (1 - descontoParaUsar),
    temCliente: !!cliente,
    temAmbientes: ambientes.length > 0
  };
  
  console.log('📋 RESULTADO DO CONTRATO:');
  console.log(`   Valor dos Ambientes: R$ ${dadosContrato.valor_total.toLocaleString('pt-BR')}`);
  console.log(`   Desconto aplicado: ${(dadosContrato.desconto * 100).toFixed(1)}%`);
  console.log(`   Valor Final: R$ ${dadosContrato.valor_final.toLocaleString('pt-BR')}`);
  console.log(`   Tem Cliente: ${dadosContrato.temCliente}`);
  console.log(`   Tem Ambientes: ${dadosContrato.temAmbientes}`);
  
  return dadosContrato;
}

// Função para detectar problemas
function detectarProblemas(estadoSessao, resultado) {
  const problemas = [];
  
  if (!estadoSessao.cliente) {
    problemas.push('❌ CLIENTE PERDIDO - Cliente é null');
  }
  
  if (estadoSessao.ambientes.length === 0) {
    problemas.push('❌ AMBIENTES PERDIDOS - Array de ambientes vazio');
  }
  
  if (estadoSessao.valorTotalAmbientes === 0) {
    problemas.push('❌ VALOR ZERADO - valorTotalAmbientes é 0');
  }
  
  if (estadoSessao.descontoReal === 0) {
    problemas.push('⚠️ DESCONTO ZERADO - descontoReal é 0, usando desconto padrão de 10%');
  }
  
  if (resultado.desconto === contratoMock.desconto) {
    problemas.push('🚨 USANDO DESCONTO MOCK - Não está usando o desconto real calculado');
  }
  
  return problemas;
}

function executarTeste() {
  console.log('🧪 TESTE DE DEBUG - COMPONENTE DE CONTRATOS\n');
  
  // Teste 1: Estado com bug (como reportado)
  console.log('='.repeat(60));
  console.log('🚨 TESTE 1: ESTADO COM BUG (CLIENTE PERDIDO)');
  console.log('='.repeat(60));
  
  const resultadoBug = simularCalculoContrato(estadoSessaoComBug);
  const problemasBug = detectarProblemas(estadoSessaoComBug, resultadoBug);
  
  console.log('\n🔍 PROBLEMAS DETECTADOS:');
  problemasBug.forEach(problema => console.log(`   ${problema}`));
  
  // Teste 2: Estado correto
  console.log('\n' + '='.repeat(60));
  console.log('✅ TESTE 2: ESTADO CORRETO (CLIENTE PRESERVADO)');
  console.log('='.repeat(60));
  
  const resultadoCorreto = simularCalculoContrato(estadoSessaoCorreto);
  const problemasCorreto = detectarProblemas(estadoSessaoCorreto, resultadoCorreto);
  
  console.log('\n🔍 PROBLEMAS DETECTADOS:');
  if (problemasCorreto.length === 0) {
    console.log('   ✅ Nenhum problema detectado!');
  } else {
    problemasCorreto.forEach(problema => console.log(`   ${problema}`));
  }
  
  // Análise comparativa
  console.log('\n' + '='.repeat(60));
  console.log('📊 ANÁLISE COMPARATIVA');
  console.log('='.repeat(60));
  
  console.log('\nCOMPARAÇÃO DE RESULTADOS:');
  console.log(`Valor Total - Bug: R$ ${resultadoBug.valor_total} | Correto: R$ ${resultadoCorreto.valor_total}`);
  console.log(`Desconto - Bug: ${(resultadoBug.desconto * 100).toFixed(1)}% | Correto: ${(resultadoCorreto.desconto * 100).toFixed(1)}%`);
  console.log(`Valor Final - Bug: R$ ${resultadoBug.valor_final} | Correto: R$ ${resultadoCorreto.valor_final.toLocaleString('pt-BR')}`);
  
  // Conclusões
  console.log('\n🎯 CONCLUSÕES:');
  console.log('================');
  
  if (resultadoBug.desconto === contratoMock.desconto) {
    console.log('✅ CONFIRMADO: Quando cliente é perdido, o sistema usa desconto padrão de 10%');
    console.log('   → Este é exatamente o bug reportado!');
  }
  
  if (resultadoCorreto.desconto !== contratoMock.desconto) {
    console.log('✅ CONFIRMADO: Com cliente preservado, o sistema usa desconto real calculado');
    console.log('   → Este é o comportamento esperado!');
  }
  
  console.log('\n💡 SOLUÇÃO RECOMENDADA:');
  console.log('========================');
  console.log('1. Garantir que parâmetros de URL sejam preservados na navegação');
  console.log('2. Melhorar a lógica de fallback no contract-summary.tsx');
  console.log('3. Adicionar logs de debug para identificar quando o cliente é perdido');
  console.log('4. Implementar recuperação automática da sessão ao carregar contratos');
  
  return {
    bugConfirmado: resultadoBug.desconto === contratoMock.desconto,
    solucaoFunciona: resultadoCorreto.desconto !== contratoMock.desconto,
    problemasBug,
    problemasCorreto
  };
}

// Executar o teste
const resultado = executarTeste();

console.log('\n📝 RESUMO FINAL:');
console.log('=================');
console.log(`Bug confirmado: ${resultado.bugConfirmado ? '✅' : '❌'}`);
console.log(`Solução funciona: ${resultado.solucaoFunciona ? '✅' : '❌'}`);
console.log(`Total de problemas no cenário com bug: ${resultado.problemasBug.length}`);
console.log(`Total de problemas no cenário correto: ${resultado.problemasCorreto.length}`);