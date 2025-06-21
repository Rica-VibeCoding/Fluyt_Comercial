/**
 * Script para limpar dados mockados do localStorage
 * Execute este arquivo no console do navegador (F12 -> Console)
 */

console.log('🧹 Iniciando limpeza de dados mockados...');

// Limpar ClienteStore
if (typeof localStorage !== 'undefined') {
  // Remover chave específica do ClienteStore
  localStorage.removeItem('fluyt_clientes');
  console.log('✅ ClienteStore limpo');
  
  // Listar todas as chaves para verificar outras possíveis
  const keys = Object.keys(localStorage);
  const flytKeys = keys.filter(key => key.includes('fluyt') || key.includes('cliente'));
  
  if (flytKeys.length > 0) {
    console.log('🔍 Outras chaves encontradas:', flytKeys);
    
    // Opcional: remover todas as chaves relacionadas
    // flytKeys.forEach(key => {
    //   localStorage.removeItem(key);
    //   console.log(`🗑️ Removida: ${key}`);
    // });
  }
  
  console.log('🎉 Limpeza concluída! Recarregue a página.');
} else {
  console.log('❌ localStorage não disponível');
}