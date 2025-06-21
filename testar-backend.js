#!/usr/bin/env node

/**
 * Script para testar se o backend está rodando
 */

console.log('🔍 Testando conexão com o backend...\n');

// Testar endpoint de saúde
fetch('http://localhost:8000/api/v1/health')
  .then(res => {
    console.log(`✅ Backend respondeu com status: ${res.status}`);
    return res.json();
  })
  .then(data => {
    console.log('📋 Resposta:', data);
  })
  .catch(err => {
    console.error('❌ Backend não está acessível!');
    console.error('   Erro:', err.message);
    console.log('\n💡 Para iniciar o backend:');
    console.log('   cd backend');
    console.log('   python main.py');
  });

// Testar endpoint de login
console.log('\n🔐 Testando endpoint de login...');
fetch('http://localhost:8000/api/v1/auth/login', {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
  },
  body: JSON.stringify({
    email: 'teste@exemplo.com',
    password: 'senha123'
  })
})
  .then(res => {
    console.log(`📡 Login endpoint respondeu com status: ${res.status}`);
    if (res.status === 401) {
      console.log('✅ Endpoint está funcionando (credenciais inválidas como esperado)');
    }
  })
  .catch(err => {
    console.error('❌ Erro ao acessar endpoint de login:', err.message);
  });