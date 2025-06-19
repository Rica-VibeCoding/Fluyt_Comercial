#!/usr/bin/env node

import fs from 'fs';
import path from 'path';
import os from 'os';
import { execSync } from 'child_process';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

/**
 * Script para limpar cache do Next.js quando há problemas de chunks
 */

const projectRoot = path.resolve(__dirname, '..');
const nextCache = path.join(projectRoot, '.next');
const nodeModulesCache = path.join(projectRoot, 'node_modules', '.cache');

function deleteDirectory(dirPath) {
  if (fs.existsSync(dirPath)) {
    console.log(`🧹 Removendo: ${dirPath}`);
    fs.rmSync(dirPath, { recursive: true, force: true });
    console.log(`✅ Removido: ${dirPath}`);
  } else {
    console.log(`⚠️ Não encontrado: ${dirPath}`);
  }
}

function clearCache() {
  console.log('🚀 Iniciando limpeza de cache...\n');
  
  // Remover .next
  deleteDirectory(nextCache);
  
  // Remover cache do node_modules
  deleteDirectory(nodeModulesCache);
  
  // Remover cache do npm (opcional)
  if (process.argv.includes('--deep')) {
    console.log('\n🔥 Limpeza profunda ativada...');
    try {
      execSync('npm cache clean --force', { stdio: 'inherit' });
      console.log('✅ Cache do npm limpo');
    } catch (error) {
      console.log('⚠️ Erro ao limpar cache npm:', error.message);
    }
  }
  
  console.log('\n🎉 Cache limpo com sucesso!');
  console.log('💡 Execute "npm run dev" para reiniciar o servidor.');
}

// Execute se chamado diretamente
if (import.meta.url === `file://${process.argv[1]}`) {
  clearCache();
}

export { clearCache };