/**
 * Debug helper para rastrear problemas de API
 */

export function debugAPI(context: string, data: any) {
  if (typeof window !== 'undefined') {
    const timestamp = new Date().toISOString();
    const message = `[${timestamp}] ${context}`;
    
    console.group(`🔍 ${message}`);
    console.log(data);
    console.groupEnd();
    
    // Salvar no localStorage para análise posterior
    const debugLog = JSON.parse(localStorage.getItem('fluyt_debug_api') || '[]');
    debugLog.push({ timestamp, context, data });
    
    // Manter apenas os últimos 50 logs
    if (debugLog.length > 50) {
      debugLog.shift();
    }
    
    localStorage.setItem('fluyt_debug_api', JSON.stringify(debugLog));
  }
}

export function clearDebugLogs() {
  if (typeof window !== 'undefined') {
    localStorage.removeItem('fluyt_debug_api');
    console.log('🧹 Logs de debug limpos');
  }
}

export function getDebugLogs() {
  if (typeof window !== 'undefined') {
    return JSON.parse(localStorage.getItem('fluyt_debug_api') || '[]');
  }
  return [];
}