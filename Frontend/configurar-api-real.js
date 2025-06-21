/**
 * Script para configurar o frontend para usar a API real
 * Execute com: node configurar-api-real.js
 */

const fs = require('fs');
const path = require('path');

console.log('🔧 Configurando frontend para usar API real...\n');

// Conteúdo do arquivo .env.local
const envContent = `# Configurações do Frontend Fluyt Comercial
# Este arquivo ativa o uso da API real em vez dos dados mockados

# URL do Backend (FastAPI rodando na porta 8000)
NEXT_PUBLIC_API_URL=http://localhost:8000

# Ativar uso da API real (true = usa backend, false = usa mock)
NEXT_PUBLIC_USE_REAL_API=true

# Ambiente (development, production)
NODE_ENV=development
`;

// Caminho do arquivo
const envPath = path.join(__dirname, '.env.local');

try {
  // Criar ou sobrescrever o arquivo
  fs.writeFileSync(envPath, envContent);
  
  console.log('✅ Arquivo .env.local criado com sucesso!');
  console.log('📁 Localização:', envPath);
  console.log('\n📋 Configurações aplicadas:');
  console.log('   - API URL: http://localhost:8000');
  console.log('   - USE_REAL_API: true (ativado)');
  console.log('\n⚠️  IMPORTANTE:');
  console.log('   1. Certifique-se que o backend está rodando na porta 8000');
  console.log('   2. Reinicie o frontend (npm run dev) para aplicar as mudanças');
  console.log('   3. O frontend agora vai buscar dados reais do Supabase!\n');
  
} catch (error) {
  console.error('❌ Erro ao criar arquivo:', error.message);
  console.log('\n💡 Tente criar manualmente o arquivo .env.local com o conteúdo acima');
} 