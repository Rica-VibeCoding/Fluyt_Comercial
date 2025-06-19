/**
 * DEBUG RÁPIDO: Teste do valor negociado
 * Para reproduzir o cenário da screenshot
 */

// Simular dados da screenshot
const valorTotal = 23667.00;
const descontoPercentual = 10;
const formasPagamento = []; // Vazio como na imagem

console.log('📊 TESTE DE DEBUG - Valor Negociado');
console.log('=====================================');

// Cálculo simples manual
const valorNegociadoManual = valorTotal * (1 - descontoPercentual / 100);
console.log('💰 Valor Total:', valorTotal.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' }));
console.log('📉 Desconto:', descontoPercentual + '%');
console.log('💵 Valor Negociado (manual):', valorNegociadoManual.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' }));

// Testar se a fórmula está correta
const esperado = 23667 * 0.9; // 90% de 23667
console.log('🎯 Valor Esperado:', esperado.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' }));

if (Math.abs(valorNegociadoManual - esperado) < 0.01) {
  console.log('✅ Cálculo manual correto');
} else {
  console.log('❌ Erro no cálculo manual');
}

// Agora testar a calculadora (simular a lógica)
const estado = {
  valorTotal: valorTotal,
  descontoPercentual: descontoPercentual,
  formasPagamento: formasPagamento
};

console.log('\n🧮 TESTANDO LÓGICA DA CALCULADORA:');

// 1. Calcular valor negociado
const valorNegociadoCalculadora = estado.valorTotal * (1 - estado.descontoPercentual / 100);
console.log('💵 Valor Negociado (calculadora):', valorNegociadoCalculadora.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' }));

// 2. Validações
const erros = [];

if (estado.descontoPercentual > 50) {
  erros.push('Desconto máximo permitido: 50%');
}

if (estado.descontoPercentual < 0) {
  erros.push('Desconto não pode ser negativo');
}

if (estado.valorTotal <= 0) {
  erros.push('Valor total deve ser maior que zero');
}

// 3. Validação de formas (ajustada)
if (estado.formasPagamento.length > 0) {
  const temFormaComValor = estado.formasPagamento.some(f => f.valor > 0);
  if (!temFormaComValor) {
    erros.push('Pelo menos uma forma de pagamento deve ter valor maior que zero');
  }
}

console.log('🚨 Erros encontrados:', erros);

// 4. Resultado final
if (erros.length === 0) {
  console.log('✅ SEM ERROS - Valor negociado deve aparecer!');
} else {
  console.log('⚠️ COM ERROS - Mas valor negociado ainda deve aparecer');
}

// 5. Simular o que pode estar acontecendo no React
console.log('\n🔍 POSSÍVEIS CAUSAS NO REACT:');
console.log('1. Import da calculadora quebrado?');
console.log('2. Hook useCalculadoraNegociacao não executando?');
console.log('3. Valores chegando como undefined/NaN?');
console.log('4. Error boundary capturando erro?');

// 6. Teste de tipos
console.log('\n🔢 VERIFICAÇÃO DE TIPOS:');
console.log('valorTotal tipo:', typeof valorTotal, 'valor:', valorTotal);
console.log('descontoPercentual tipo:', typeof descontoPercentual, 'valor:', descontoPercentual);
console.log('formasPagamento tipo:', typeof formasPagamento, 'length:', formasPagamento.length);