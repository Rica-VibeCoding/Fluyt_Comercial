import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Settings, Users, DollarSign, FileText, Building2 } from "lucide-react";
import Link from "next/link";

export default function SistemaPage() {
  return (
    <div className="min-h-screen bg-gray-50 p-4 md:p-6">
      <div className="max-w-7xl mx-auto space-y-4">
        <div className="mb-8">
          <div className="flex items-center gap-3 mb-2">
            <div className="p-2 bg-primary/10 rounded-lg">
              <Building2 className="h-6 w-6 text-primary" />
            </div>
            <div>
              <h1 className="text-2xl font-bold">Sistema Fluyt</h1>
              <p className="text-base text-muted-foreground">Sistema de Validação</p>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mb-8">
          <Card className="shadow-md border-0 bg-white hover:shadow-lg transition-shadow">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-sm font-semibold text-gray-900">
                <div className="w-5 h-5 bg-green-50 rounded flex items-center justify-center">
                  <DollarSign className="h-3 w-3 text-green-600" />
                </div>
                Simulador Financeiro
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-gray-600 mb-4">
                Simule propostas e calcule valores com desconto e comissões
              </p>
              <Link href="/painel/orcamento/simulador">
                <Button className="w-full bg-gradient-to-r from-slate-600 to-slate-700 hover:from-slate-700 hover:to-slate-800 shadow-md hover:shadow-lg transition-all duration-200 rounded-xl font-semibold text-white">
                  Acessar Simulador
                </Button>
              </Link>
            </CardContent>
          </Card>

          <Card className="shadow-md border-0 bg-white hover:shadow-lg transition-shadow">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-sm font-semibold text-gray-900">
                <div className="w-5 h-5 bg-blue-50 rounded flex items-center justify-center">
                  <Users className="h-3 w-3 text-blue-600" />
                </div>
                Gestão de Clientes
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-gray-600 mb-4">
                Centralize e gerencie todos os seus clientes de forma eficiente
              </p>
              <Link href="/painel/clientes">
                <Button className="w-full bg-gradient-to-r from-slate-600 to-slate-700 hover:from-slate-700 hover:to-slate-800 shadow-md hover:shadow-lg transition-all duration-200 rounded-xl font-semibold text-white">
                  Acessar Clientes
                </Button>
              </Link>
            </CardContent>
          </Card>

          <Card className="shadow-md border-0 bg-white hover:shadow-lg transition-shadow">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-sm font-semibold text-gray-900">
                <div className="w-5 h-5 bg-orange-50 rounded flex items-center justify-center">
                  <Settings className="h-3 w-3 text-orange-600" />
                </div>
                Configurações
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-gray-600 mb-4">
                Gerencie empresas, lojas, equipe e configurações do sistema
              </p>
              <Link href="/painel/sistema/configuracoes">
                <Button className="w-full bg-gradient-to-r from-slate-600 to-slate-700 hover:from-slate-700 hover:to-slate-800 shadow-md hover:shadow-lg transition-all duration-200 rounded-xl font-semibold text-white">
                  Acessar Configurações
                </Button>
              </Link>
            </CardContent>
          </Card>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <Card className="shadow-md border-0 bg-white">
            <CardHeader>
              <CardTitle className="text-lg font-semibold text-gray-900">Sistema de Configurações</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                <div className="flex items-center gap-2">
                  <Building2 className="h-4 w-4 text-muted-foreground" />
                  <span className="text-sm">Gestão de Empresas e Lojas</span>
                </div>
                <div className="flex items-center gap-2">
                  <Users className="h-4 w-4 text-muted-foreground" />
                  <span className="text-sm">Equipe e Setores</span>
                </div>
                <div className="flex items-center gap-2">
                  <DollarSign className="h-4 w-4 text-muted-foreground" />
                  <span className="text-sm">Regras de Comissão e Configurações Financeiras</span>
                </div>
                <div className="flex items-center gap-2">
                  <Settings className="h-4 w-4 text-muted-foreground" />
                  <span className="text-sm">Prestadores de Serviços</span>
                </div>
                <div className="flex items-center gap-2">
                  <FileText className="h-4 w-4 text-muted-foreground" />
                  <span className="text-sm">Auditoria e Logs</span>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="shadow-md border-0 bg-white">
            <CardHeader>
              <CardTitle className="text-lg font-semibold text-gray-900">Funcionalidades Implementadas</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-sm">✅ Gestão de Empresas</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm">✅ Gestão de Lojas</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm">✅ Gestão de Equipe</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm">✅ Regras de Comissão</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm">✅ Configurações de Loja</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm">✅ Status de Orçamento</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm">✅ Prestadores de Serviços</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm">✅ Logs de Auditoria</span>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}