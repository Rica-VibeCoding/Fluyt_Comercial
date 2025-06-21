'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';

export default function HomePage() {
  const router = useRouter();

  useEffect(() => {
    // Redireciona automaticamente para o login
    router.replace('/login');
  }, [router]);

  // Tela vazia enquanto redireciona
  return null;
} 