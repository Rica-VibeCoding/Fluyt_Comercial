"use client";

import React from 'react';
import { Card, CardContent } from '@/components/ui/card';

export function GestaoColaboradoresIndividuais() {
  return (
    <div className="space-y-3">
      <Card className="shadow-md border-0 bg-white">
        <CardContent className="p-6">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h3 className="text-lg font-semibold text-gray-900">Colaboradores Individuais</h3>
              <p className="text-sm text-gray-600 mt-1">
                Cadastre e gerencie pessoas/empresas individuais
              </p>
            </div>
          </div>
          
          <div className="text-center text-muted-foreground py-8">
            <div className="text-lg font-medium mb-2">Colaboradores Individuais</div>
            <p>Funcionalidade em desenvolvimento - Etapa 3</p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
} 