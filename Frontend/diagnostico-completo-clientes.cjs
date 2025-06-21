#!/usr/bin/env node

/**
 * Diagnóstico completo do fluxo Frontend -> Backend -> Supabase
 * Para tabela de clientes
 */

const http = require('http');
const https = require('https');

console.log("🔍 DIAGNÓSTICO COMPLETO - TABELA CLIENTES");
console.log("=" .repeat(60));

// 1. Testar backend diretamente
async function testarBackendDireto() {
  console.log("\n1️⃣ TESTE DIRETO NO BACKEND:");
  
  // Primeiro fazer login para obter token
  return new Promise((resolve) => {
    const loginData = JSON.stringify({
      email: "ricardo.nilton@hotmail.com",
      password: "123456"
    });
    
    const options = {
      hostname: 'localhost',
      port: 8000,
      path: '/api/v1/auth/login',
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Content-Length': loginData.length
      }
    };
    
    const req = http.request(options, (res) => {
      let data = '';
      
      res.on('data', (chunk) => {
        data += chunk;
      });
      
      res.on('end', () => {
        try {
          const response = JSON.parse(data);
          if (response.access_token) {
            console.log("✅ Login OK - Token obtido");
            testarListagemClientes(response.access_token);
          } else {
            console.log("❌ Login falhou:", response);
          }
        } catch (e) {
          console.log("❌ Erro no parse do login:", e.message);
        }
        resolve();
      });
    });
    
    req.on('error', (e) => {
      console.error(`❌ Erro de conexão no login: ${e.message}`);
      resolve();
    });
    
    req.write(loginData);
    req.end();
  });
}

// 2. Testar listagem de clientes com token
function testarListagemClientes(token) {
  console.log("\n2️⃣ LISTAGEM DE CLIENTES COM TOKEN:");
  
  const options = {
    hostname: 'localhost',
    port: 8000,
    path: '/api/v1/clientes/',
    method: 'GET',
    headers: {
      'Authorization': `Bearer ${token}`,
      'Accept': 'application/json'
    }
  };
  
  const startTime = Date.now();
  
  const req = http.request(options, (res) => {
    let data = '';
    
    res.on('data', (chunk) => {
      data += chunk;
    });
    
    res.on('end', () => {
      const endTime = Date.now();
      console.log(`⏱️  Tempo de resposta: ${endTime - startTime}ms`);
      console.log(`📡 Status: ${res.statusCode}`);
      
      try {
        const response = JSON.parse(data);
        if (response.items) {
          console.log(`✅ Clientes recebidos: ${response.items.length}`);
          console.log("📋 Primeiros 3 clientes:");
          response.items.slice(0, 3).forEach((cliente, i) => {
            console.log(`   ${i + 1}. ${cliente.nome} (${cliente.cpf_cnpj})`);
          });
        } else {
          console.log("❌ Resposta sem clientes:", response);
        }
      } catch (e) {
        console.log("❌ Erro no parse:", e.message);
        console.log("📄 Resposta raw:", data.substring(0, 200));
      }
    });
  });
  
  req.on('error', (e) => {
    console.error(`❌ Erro de conexão: ${e.message}`);
  });
  
  req.end();
}

// 3. Testar proxy do Next.js
async function testarProxyNext() {
  console.log("\n3️⃣ TESTE VIA PROXY DO NEXT.JS:");
  
  return new Promise((resolve) => {
    const options = {
      hostname: 'localhost',
      port: 3001,
      path: '/api/v1/health',
      method: 'GET',
      headers: {
        'Accept': 'application/json'
      }
    };
    
    const startTime = Date.now();
    
    const req = http.request(options, (res) => {
      let data = '';
      
      res.on('data', (chunk) => {
        data += chunk;
      });
      
      res.on('end', () => {
        const endTime = Date.now();
        console.log(`⏱️  Tempo de resposta: ${endTime - startTime}ms`);
        console.log(`📡 Status: ${res.statusCode}`);
        
        if (res.statusCode === 200) {
          console.log("✅ Proxy Next.js funcionando");
        } else {
          console.log("❌ Proxy retornou erro:", res.statusCode);
          console.log("📄 Resposta:", data);
        }
        resolve();
      });
    });
    
    req.on('error', (e) => {
      console.error(`❌ Erro de conexão com proxy: ${e.message}`);
      resolve();
    });
    
    req.setTimeout(5000, () => {
      console.error("❌ Timeout no proxy após 5 segundos");
      req.destroy();
      resolve();
    });
    
    req.end();
  });
}

// 4. Verificar conectividade com Supabase
async function testarSupabase() {
  console.log("\n4️⃣ TESTE DIRETO SUPABASE:");
  
  const supabaseUrl = 'https://momwbpxqnvgehotfmvde.supabase.co';
  const anonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im1vbXdicHhxbnZnZWhvdGZtdmRlIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDc3NzAxNTIsImV4cCI6MjA2MzM0NjE1Mn0.n90ZweBT-o1ugerZJDZl8gx65WGe1eUrhph6VuSdSCs';
  
  return new Promise((resolve) => {
    const url = new URL(`${supabaseUrl}/rest/v1/clientes?limit=5`);
    
    const options = {
      hostname: url.hostname,
      path: url.pathname + url.search,
      method: 'GET',
      headers: {
        'apikey': anonKey,
        'Authorization': `Bearer ${anonKey}`,
        'Accept': 'application/json'
      }
    };
    
    const req = https.request(options, (res) => {
      let data = '';
      
      res.on('data', (chunk) => {
        data += chunk;
      });
      
      res.on('end', () => {
        console.log(`📡 Status Supabase: ${res.statusCode}`);
        
        if (res.statusCode === 200) {
          try {
            const clientes = JSON.parse(data);
            console.log(`✅ Supabase acessível - ${clientes.length} clientes`);
          } catch (e) {
            console.log("❌ Erro no parse Supabase:", e.message);
          }
        } else {
          console.log("❌ Erro Supabase:", data);
        }
        resolve();
      });
    });
    
    req.on('error', (e) => {
      console.error(`❌ Erro conexão Supabase: ${e.message}`);
      resolve();
    });
    
    req.end();
  });
}

// 5. Análise final
async function analiseFinal() {
  console.log("\n5️⃣ ANÁLISE E RECOMENDAÇÕES:");
  console.log("📌 Possíveis problemas identificados:");
  console.log("   1. Timeout muito curto no frontend");
  console.log("   2. Proxy do Next.js não configurado corretamente");
  console.log("   3. Token de autenticação não sendo passado");
  console.log("   4. CORS bloqueando requisições");
  console.log("   5. Backend não processando requisições do proxy");
  
  console.log("\n💡 SOLUÇÕES RECOMENDADAS:");
  console.log("   1. Aumentar timeout para 60 segundos");
  console.log("   2. Verificar configuração do proxy em next.config.mjs");
  console.log("   3. Adicionar logs detalhados no api-client.ts");
  console.log("   4. Verificar se o token está sendo enviado corretamente");
  console.log("   5. Testar com conexão direta (sem proxy) temporariamente");
}

// Executar diagnóstico
async function executarDiagnostico() {
  await testarBackendDireto();
  await new Promise(resolve => setTimeout(resolve, 2000));
  await testarProxyNext();
  await testarSupabase();
  analiseFinal();
}

executarDiagnostico();