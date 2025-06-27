/**
 * TESTE DE DEBUG - SETORES SERVICE
 * =================================
 * 
 * Script para testar se a correção do ApiClientStable funcionou
 */

// Simular o ambiente do React (importação estática)
import { ApiClientStable } from './src/lib/api-client-stable.js';

// Teste 1: Verificar se métodos estáticos existem
console.log('🔍 Testando métodos estáticos do ApiClientStable...');

const metodosEstaticos = ['get', 'post', 'put', 'delete', 'request'];
const metodosExistentes = metodosEstaticos.filter(metodo => 
  typeof ApiClientStable[metodo] === 'function'
);

console.log(`✅ Métodos encontrados: ${metodosExistentes.join(', ')}`);

if (metodosExistentes.length === metodosEstaticos.length) {
  console.log('✅ Todos os métodos estáticos estão disponíveis!');
} else {
  console.log('❌ Alguns métodos estáticos estão faltando');
}

// Teste 2: Tentar usar o método get (mesmo que falhe por conexão)
console.log('\n🔍 Testando chamada de método estático...');

try {
  // Chamar o método - pode falhar por não ter backend, mas não deve falhar por "não ser função"
  ApiClientStable.get('/test')
    .then(response => {
      console.log('✅ Método get funcionou (resposta recebida)');
    })
    .catch(error => {
      if (error.message.includes('is not a function')) {
        console.log('❌ ERRO: Método ainda não é função');
      } else {
        console.log('✅ Método get existe e foi chamado (erro de conexão é normal)');
        console.log(`   Erro esperado: ${error.message}`);
      }
    });
} catch (error) {
  if (error.message.includes('is not a function')) {
    console.log('❌ ERRO: Método get não é uma função');
  } else {
    console.log('✅ Método get existe (erro diferente)');
  }
}

// Resultado esperado
console.log('\n📋 RESULTADO ESPERADO:');
console.log('✅ Métodos estáticos disponíveis');
console.log('✅ Chamada não falha com "is not a function"');
console.log('⚠️ Pode falhar com erro de conexão (normal sem backend)'); 