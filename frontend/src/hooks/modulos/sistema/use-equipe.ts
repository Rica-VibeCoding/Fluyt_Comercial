// Hook legacy substituído pelo useEquipeReal
// Mantido apenas para compatibilidade temporária
import { useEquipeReal } from '@/hooks/data/use-equipe-real';

export function useEquipe() {
  console.warn('⚠️ useEquipe is deprecated. Use useEquipeReal instead.');
  return useEquipeReal();
}