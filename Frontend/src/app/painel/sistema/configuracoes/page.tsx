"use client";

import React, { useState } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { ArrowLeft, Users, DollarSign, Settings, FileText, Building2, Store, UserCog, Layers } from 'lucide-react';
import Link from 'next/link';
import { GestaoEmpresas, GestaoLojas, GestaoEquipe, GestaoSetores, GestaoComissoes, ConfigLoja, GestaoConfigLoja, GestaoTiposColaboradores, GestaoColaboradoresIndividuais } from '@/components/modulos/sistema';
import { ResetDados } from '@/components/modulos/sistema/configuracoes/reset-dados';
import { TesteConectividade } from '@/components/modulos/sistema/configuracoes/teste-conectividade';

export default function ConfiguracoesPage() {
  const [activeSection, setActiveSection] = useState('pessoas');
  const userProfile = 'ADMIN_MASTER'; // Seria obtido do contexto de auth

  const sections = [{
    id: 'pessoas',
    label: 'Pessoas',
    icon: Users,
    iconColor: 'blue',
    description: 'Gestão de empresas, lojas, equipe e setores',
    items: [{
      id: 'empresas',
      label: 'Empresas',
      icon: Building2
    }, {
      id: 'lojas',
      label: 'Lojas',
      icon: Store
    }, {
      id: 'setores',
      label: 'Setores',
      icon: Layers
    }, {
      id: 'equipe',
      label: 'Equipe',
      icon: UserCog
    }]
  }, {
    id: 'configuracoes',
    label: 'Configurações',
    icon: DollarSign,
    iconColor: 'green',
    description: 'Configurações críticas do sistema',
    adminOnly: true,
    items: [{
      id: 'comissoes',
      label: 'Regras de Comissão'
    }, {
      id: 'config-loja',
      label: 'Configurações da Loja'
    }, {
      id: 'status',
      label: 'Status de Orçamento'
    }]
  }, {
    id: 'operacional',
    label: 'Colaboradores',
    icon: Settings,
    iconColor: 'orange',
    description: 'Gestão de colaboradores externos',
    items: [{
      id: 'tipos-colaboradores',
      label: 'Tipos'
    }, {
      id: 'colaboradores-individuais',
      label: 'Colaboradores'
    }]
  }, {
    id: 'sistema',
    label: 'Sistema',
    icon: FileText,
    iconColor: 'purple',
    description: 'Auditoria e logs',
    items: [{
      id: 'auditoria',
      label: 'Auditoria'
    }, {
      id: 'dados',
      label: 'Gerenciar Dados'
    }, {
      id: 'conectividade',
      label: 'Teste Supabase'
    }]
  }];

  const renderContent = (sectionId: string, itemId: string) => {
    const key = `${sectionId}-${itemId}`;
    switch (key) {
      case 'pessoas-empresas':
        return <GestaoEmpresas />;
      case 'pessoas-lojas':
        return <GestaoLojas />;
      case 'pessoas-equipe':
        return <GestaoEquipe />;
      case 'pessoas-setores':
        return <GestaoSetores />;
      case 'configuracoes-comissoes':
        return <GestaoComissoes />;
      case 'configuracoes-config-loja':
        return <GestaoConfigLoja />;
      case 'configuracoes-status':
        return (
          <Card className="shadow-md border-0 bg-white">
            <CardContent className="p-6">
              <div className="text-center text-muted-foreground">
                <div className="text-lg font-medium mb-2">Status de Orçamento</div>
                <p>Funcionalidade em desenvolvimento</p>
              </div>
            </CardContent>
          </Card>
        );
      case 'operacional-tipos-colaboradores':
        return <GestaoTiposColaboradores />;
      case 'operacional-colaboradores-individuais':
        return <GestaoColaboradoresIndividuais />;
      case 'sistema-auditoria':
        return (
          <Card className="shadow-md border-0 bg-white">
            <CardContent className="p-6">
              <div className="text-center text-muted-foreground">
                <div className="text-lg font-medium mb-2">Logs de Auditoria</div>
                <p>Funcionalidade em desenvolvimento</p>
              </div>
            </CardContent>
          </Card>
        );
      case 'sistema-dados':
        return <ResetDados />;
      case 'sistema-conectividade':
        return <TesteConectividade />;
      default:
        return (
          <Card className="shadow-md border-0 bg-white">
            <CardContent className="p-6">
              <div className="text-center text-muted-foreground">
                <div className="text-lg font-medium mb-2">
                  {sectionId.charAt(0).toUpperCase() + sectionId.slice(1)} - {itemId.charAt(0).toUpperCase() + itemId.slice(1)}
                </div>
                <p>Funcionalidade em desenvolvimento</p>
              </div>
            </CardContent>
          </Card>
        );
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 p-4 md:p-6">
      <div className="max-w-7xl mx-auto space-y-4">
        {/* Header padronizado seguindo padrão da página sistema */}
        <div className="mb-8">
          <div className="flex items-center justify-between gap-4 mb-4">
            <Link href="/painel/sistema">
              <Button variant="ghost" size="sm" className="gap-2 bg-gradient-to-r from-slate-600 to-slate-700 hover:from-slate-700 hover:to-slate-800 shadow-md hover:shadow-lg transition-all duration-200 rounded-xl font-semibold text-white">
                <ArrowLeft className="h-4 w-4" />
                Voltar
              </Button>
            </Link>
            <div className="flex-1">
              <h1 className="text-2xl font-bold text-gray-900">Configurações do Sistema</h1>
              <p className="text-base text-muted-foreground">Gerencie todos os aspectos da sua aplicação</p>
            </div>
          </div>
        </div>

        <Tabs value={activeSection} onValueChange={setActiveSection} className="space-y-4">
          {/* Navegação principal com estilo padronizado */}
          <Card className="shadow-md border-0 bg-white">
            <CardContent className="p-3">
              <TabsList className="grid w-full grid-cols-4 h-10 bg-transparent">
              {sections.map(section => {
                const Icon = section.icon;
                const isDisabled = section.adminOnly && userProfile !== 'ADMIN_MASTER';
                return (
                  <TabsTrigger 
                    key={section.id} 
                    value={section.id} 
                    disabled={isDisabled} 
                      className="flex items-center gap-1.5 h-8 px-2 data-[state=active]:bg-gradient-to-r data-[state=active]:from-slate-600 data-[state=active]:to-slate-700 data-[state=active]:text-white rounded-lg transition-all duration-200 text-xs font-medium"
                  >
                      <Icon className="h-3.5 w-3.5" />
                      <span>{section.label}</span>
                  </TabsTrigger>
                );
              })}
            </TabsList>
            </CardContent>
          </Card>

          {sections.map(section => (
            <TabsContent key={section.id} value={section.id} className="space-y-4">
              {/* Card de informação da seção com estilo padronizado */}
              <Card className="shadow-md border-0 bg-white">
                <CardContent className="p-4">
                  <div className="flex items-center gap-3">
                    <div className={`w-8 h-8 ${
                      section.iconColor === 'blue' ? 'bg-blue-50' :
                      section.iconColor === 'green' ? 'bg-green-50' :
                      section.iconColor === 'orange' ? 'bg-orange-50' :
                      section.iconColor === 'purple' ? 'bg-purple-50' : 'bg-primary/10'
                    } rounded-lg flex items-center justify-center`}>
                      <section.icon className={`h-4 w-4 ${
                        section.iconColor === 'blue' ? 'text-blue-600' :
                        section.iconColor === 'green' ? 'text-green-600' :
                        section.iconColor === 'orange' ? 'text-orange-600' :
                        section.iconColor === 'purple' ? 'text-purple-600' : 'text-primary'
                      }`} />
                    </div>
                    <div className="flex-1">
                      <div className="flex items-center gap-3">
                        <h2 className="text-lg font-semibold text-gray-900">{section.label}</h2>
                        {section.adminOnly && (
                          <Badge variant="destructive" className="text-xs">
                            Admin Only
                          </Badge>
                        )}
                      </div>
                      <p className="text-sm text-gray-600 mt-1">{section.description}</p>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Sub-navegação com estilo padronizado */}
              <Tabs defaultValue={section.items[0]?.id} className="space-y-4">
                <Card className="shadow-md border-0 bg-white">
                  <CardContent className="p-3">
                    <TabsList className="grid w-full h-10 bg-transparent" style={{ gridTemplateColumns: `repeat(${section.items.length}, 1fr)` }}>
                    {section.items.map(item => (
                      <TabsTrigger 
                        key={item.id} 
                        value={item.id} 
                          className="flex items-center gap-1.5 h-8 px-2 data-[state=active]:bg-gradient-to-r data-[state=active]:from-slate-600 data-[state=active]:to-slate-700 data-[state=active]:text-white rounded-lg transition-all duration-200 text-xs font-medium"
                      >
                          {item.icon && <item.icon className="h-3.5 w-3.5" />}
                          <span>{item.label}</span>
                      </TabsTrigger>
                    ))}
                  </TabsList>
                  </CardContent>
                </Card>

                {section.items.map(item => (
                  <TabsContent key={item.id} value={item.id}>
                    {renderContent(section.id, item.id)}
                  </TabsContent>
                ))}
              </Tabs>
            </TabsContent>
          ))}
        </Tabs>
      </div>
    </div>
  );
}