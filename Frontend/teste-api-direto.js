// Teste direto da API sem proxy
import fetch from 'node-fetch';

async function testarAPIdireta() {
  console.log("🔍 TESTE DIRETO DA API\n");
  
  try {
    // 1. Login
    console.log("1️⃣ Fazendo login...");
    const loginResponse = await fetch('http://localhost:8000/api/v1/auth/login', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        email: 'ricardo.nilton@hotmail.com',
        password: '123456'
      })
    });
    
    const loginData = await loginResponse.json();
    
    if (!loginData.access_token) {
      console.error("❌ Login falhou:", loginData);
      return;
    }
    
    console.log("✅ Login OK - Token obtido");
    
    // 2. Buscar clientes
    console.log("\n2️⃣ Buscando clientes...");
    const startTime = Date.now();
    
    const clientesResponse = await fetch('http://localhost:8000/api/v1/clientes/', {
      headers: {
        'Authorization': `Bearer ${loginData.access_token}`,
        'Accept': 'application/json'
      }
    });
    
    const endTime = Date.now();
    console.log(`⏱️  Tempo de resposta: ${endTime - startTime}ms`);
    
    const clientesData = await clientesResponse.json();
    
    if (clientesResponse.ok && clientesData.items) {
      console.log(`✅ Sucesso! ${clientesData.items.length} clientes encontrados`);
      console.log("\n📋 Clientes:");
      clientesData.items.forEach((cliente, i) => {
        console.log(`   ${i + 1}. ${cliente.nome} - ${cliente.cpf_cnpj}`);
      });
    } else {
      console.error("❌ Erro ao buscar clientes:", clientesData);
    }
    
  } catch (error) {
    console.error("❌ Erro geral:", error.message);
  }
}

// Executar teste
testarAPIdireta();