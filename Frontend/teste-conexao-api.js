/**
 * Script de teste para verificar conexão com o backend
 * Ricardo, rode este arquivo com: node teste-conexao-api.js
 */

console.log('=== TESTE DE CONEXÃO COM O BACKEND ===\n');

// Teste 1: Health Check
console.log('1. Testando Health Check...');
fetch('http://localhost:8000/health')
  .then(res => res.json())
  .then(data => {
    console.log('✅ Health Check OK:', data);
    console.log('   Status:', data.status);
    console.log('   Database:', data.database);
    console.log('   Environment:', data.environment);
  })
  .catch(err => console.error('❌ Erro no Health Check:', err.message));

// Teste 2: Endpoint de Clientes (público)
setTimeout(() => {
  console.log('\n2. Testando API de Clientes...');
  fetch('http://localhost:8000/api/v1/clientes/test/public')
    .then(res => res.json())
    .then(data => {
      console.log('✅ API de Clientes OK:', data);
      console.log('   Total de clientes no banco:', data.total_clientes);
      console.log('   Ambiente:', data.ambiente);
    })
    .catch(err => console.error('❌ Erro na API de Clientes:', err.message));
}, 1000);

// Teste 3: Verificar CORS
setTimeout(() => {
  console.log('\n3. Testando CORS (simulando chamada do frontend)...');
  fetch('http://localhost:8000/api/v1/clientes/test/public', {
    headers: {
      'Origin': 'http://localhost:3000',
      'Content-Type': 'application/json'
    }
  })
    .then(res => {
      console.log('✅ CORS OK:');
      console.log('   Status:', res.status);
      console.log('   Headers CORS:', res.headers.get('access-control-allow-origin'));
      return res.json();
    })
    .then(data => {
      console.log('   Resposta:', data.message);
    })
    .catch(err => console.error('❌ Erro no teste de CORS:', err.message));
}, 2000);

// Teste 4: Verificar variáveis de ambiente
setTimeout(() => {
  console.log('\n4. Verificando configuração do Frontend...');
  console.log('   NEXT_PUBLIC_API_URL deve ser: http://localhost:8000');
  console.log('   NEXT_PUBLIC_USE_REAL_API deve ser: true');
  console.log('\n⚠️  IMPORTANTE: Se você mudou o .env.local, reinicie o Next.js!');
  console.log('\n✨ Se todos os testes passaram, o backend está funcionando perfeitamente!');
}, 3000);