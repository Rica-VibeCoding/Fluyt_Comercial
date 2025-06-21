'use client';

import { useEffect, useState } from 'react';
import { Wifi, WifiOff } from 'lucide-react';
import { apiClient } from '@/services/api-client';
import { cn } from '@/lib/utils';

export function ConnectionStatus() {
  const [isOnline, setIsOnline] = useState(true);
  const [isChecking, setIsChecking] = useState(false);

  // Verificar status da conexão
  const checkConnection = async () => {
    if (isChecking) return;
    
    setIsChecking(true);
    try {
      const available = await apiClient.isBackendDisponivel();
      setIsOnline(available);
    } catch {
      setIsOnline(false);
    } finally {
      setIsChecking(false);
    }
  };

  useEffect(() => {
    // Verificar conexão ao montar
    checkConnection();

    // Verificar a cada 30 segundos
    const interval = setInterval(checkConnection, 30000);

    // Verificar quando voltar online
    const handleOnline = () => {
      setIsOnline(true);
      checkConnection();
    };

    // Verificar quando ficar offline
    const handleOffline = () => {
      setIsOnline(false);
    };

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    return () => {
      clearInterval(interval);
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  return (
    <div 
      className={cn(
        "flex items-center gap-2 px-3 py-1.5 rounded-full text-xs font-medium transition-all",
        isOnline 
          ? "bg-green-100 text-green-700 dark:bg-green-900/20 dark:text-green-400" 
          : "bg-red-100 text-red-700 dark:bg-red-900/20 dark:text-red-400"
      )}
      title={isOnline ? 'Sistema online' : 'Sistema offline - usando dados locais'}
    >
      {isOnline ? (
        <>
          <Wifi className="w-3 h-3" />
          <span>Online</span>
        </>
      ) : (
        <>
          <WifiOff className="w-3 h-3" />
          <span>Offline</span>
        </>
      )}
    </div>
  );
}