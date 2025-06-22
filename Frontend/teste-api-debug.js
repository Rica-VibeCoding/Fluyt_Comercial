/**
 * SCRIPT DE DEBUG - ERRO 404 vs 403
 * Testa diferentes formas de fazer requisições para identificar o problema
 */

// Teste 1: Requisição direta ao backend (porta 8000)
async function testeBackendDireto() {
  console.log('🔍 TESTE 1: Requisição direta ao backend (porta 8000)');
  
  try {
    const response = await fetch('http://localhost:8000/api/v1/clientes/139e719e-1c5e-404b-9bdb-96b955320be5', {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ nome: 'Teste Direto' })
    });
    
    console.log(`Status: ${response.status}`);
    console.log(`Status Text: ${response.statusText}`);
    
    const data = await response.text();
    console.log('Response:', data);
    
  } catch (error) {
    console.error('Erro:', error.message);
  }
}

// Teste 2: Requisição via proxy do Next.js (porta 3000)
async function testeViaProxy() {
  console.log('🔍 TESTE 2: Requisição via proxy Next.js (porta 3000)');
  
  try {
    const response = await fetch('/api/v1/clientes/139e719e-1c5e-404b-9bdb-96b955320be5', {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ nome: 'Teste Proxy' })
    });
    
    console.log(`Status: ${response.status}`);
    console.log(`Status Text: ${response.statusText}`);
    
    const data = await response.text();
    console.log('Response:', data);
    
  } catch (error) {
    console.error('Erro:', error.message);
  }
}

// Teste 3: Health check direto
async function testeHealthDireto() {
  console.log('🔍 TESTE 3: Health check direto');
  
  try {
    const response = await fetch('http://localhost:8000/health');
    const data = await response.json();
    console.log('Health direto:', data);
  } catch (error) {
    console.error('Erro health direto:', error.message);
  }
}

// Teste 4: Health check via proxy
async function testeHealthProxy() {
  console.log('🔍 TESTE 4: Health check via proxy');
  
  try {
    const response = await fetch('/api/v1/health');
    const data = await response.json();
    console.log('Health proxy:', data);
  } catch (error) {
    console.error('Erro health proxy:', error.message);
  }
}

// Teste 5: Endpoint público de clientes
async function testeEndpointPublico() {
  console.log('🔍 TESTE 5: Endpoint público de clientes');
  
  try {
    // Direto
    const responseDireto = await fetch('http://localhost:8000/api/v1/clientes/test/public');
    const dataDireto = await responseDireto.json();
    console.log('Público direto:', dataDireto);
    
    // Via proxy
    const responseProxy = await fetch('/api/v1/clientes/test/public');
    const dataProxy = await responseProxy.json();
    console.log('Público proxy:', dataProxy);
    
  } catch (error) {
    console.error('Erro endpoint público:', error.message);
  }
}

// Executar todos os testes
async function executarTodosOsTestes() {
  console.log('🚀 INICIANDO TESTES DE DEBUG - ERRO 404 vs 403');
  console.log('================================================');
  
  await testeHealthDireto();
  console.log('');
  
  await testeHealthProxy();
  console.log('');
  
  await testeEndpointPublico();
  console.log('');
  
  await testeBackendDireto();
  console.log('');
  
  await testeViaProxy();
  console.log('');
  
  console.log('================================================');
  console.log('✅ TESTES CONCLUÍDOS');
}

// Se estiver no browser, executar automaticamente
if (typeof window !== 'undefined') {
  executarTodosOsTestes();
}

// Se estiver no Node.js, exportar as funções
if (typeof module !== 'undefined') {
  module.exports = {
    testeBackendDireto,
    testeViaProxy,
    testeHealthDireto,
    testeHealthProxy,
    testeEndpointPublico,
    executarTodosOsTestes
  };
} 