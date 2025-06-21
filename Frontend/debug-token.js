/**
 * DEBUG DO TOKEN JWT
 * Execute com: node debug-token.js
 */

console.log('🔍 DEBUGANDO TOKEN JWT...\n');

async function debugToken() {
  const API_URL = 'http://localhost:8000';
  
  // 1. FAZER LOGIN E PEGAR TOKEN
  console.log('1️⃣ Fazendo login...');
  try {
    const loginResponse = await fetch(`${API_URL}/api/v1/auth/login`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        email: 'ricardo.nilton@hotmail.com',
        password: '123456'
      }),
    });
    
    if (loginResponse.ok) {
      const loginData = await loginResponse.json();
      const token = loginData.access_token;
      
      console.log('   ✅ Login realizado com sucesso!');
      console.log(`   📋 Token: ${token.substring(0, 50)}...`);
      
      // 2. DECODIFICAR TOKEN SEM VERIFICAÇÃO
      console.log('\n2️⃣ Decodificando token...');
      
      const parts = token.split('.');
      if (parts.length === 3) {
        // Decodificar header
        const headerEncoded = parts[0];
        const headerPadded = headerEncoded + '='.repeat(4 - headerEncoded.length % 4);
        const headerBytes = atob(headerPadded.replace(/-/g, '+').replace(/_/g, '/'));
        const header = JSON.parse(headerBytes);
        
        // Decodificar payload
        const payloadEncoded = parts[1];
        const payloadPadded = payloadEncoded + '='.repeat(4 - payloadEncoded.length % 4);
        const payloadBytes = atob(payloadPadded.replace(/-/g, '+').replace(/_/g, '/'));
        const payload = JSON.parse(payloadBytes);
        
        console.log('   📋 Header do token:');
        console.log('      ', JSON.stringify(header, null, 2));
        
        console.log('\n   📋 Payload do token:');
        console.log('      ', JSON.stringify(payload, null, 2));
        
        console.log('\n   📋 Campos importantes:');
        console.log(`      sub (user_id): ${payload.sub}`);
        console.log(`      email: ${payload.email}`);
        console.log(`      role: ${payload.role}`);
        console.log(`      aud: ${payload.aud}`);
        console.log(`      iss: ${payload.iss}`);
        
        // Verificar expiração
        if (payload.exp) {
          const expDate = new Date(payload.exp * 1000);
          const now = new Date();
          console.log(`      exp: ${expDate.toISOString()} (${expDate > now ? 'VÁLIDO' : 'EXPIRADO'})`);
        }
        
        // 3. TESTAR BUSCA DE CLIENTES COM ESSE TOKEN
        console.log('\n3️⃣ Testando busca de clientes...');
        
        const clientesResponse = await fetch(`${API_URL}/api/v1/clientes`, {
          method: 'GET',
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
          },
        });
        
        console.log(`   📋 Status: ${clientesResponse.status}`);
        
        if (!clientesResponse.ok) {
          const errorData = await clientesResponse.text();
          console.log(`   ❌ Erro: ${errorData}`);
        } else {
          const data = await clientesResponse.json();
          console.log('   ✅ Sucesso! Dados recebidos');
          console.log(`   📋 Total: ${data.total || data.items?.length || 'N/A'}`);
        }
        
      } else {
        console.log('   ❌ Token malformado');
      }
      
    } else {
      console.log('   ❌ Falha no login');
    }
    
  } catch (error) {
    console.log('   ❌ Erro:', error.message);
  }
}

debugToken(); 