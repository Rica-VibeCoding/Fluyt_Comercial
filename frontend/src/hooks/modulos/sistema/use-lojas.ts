// Hook legacy substituído pelo useLojasReal
// Mantido apenas para compatibilidade temporária
import { useLojasReal } from '@/hooks/data/use-lojas-real';

export function useLojas() {
  console.warn('⚠️ useLojas is deprecated. Use useLojasReal instead.');
  return useLojasReal();
}