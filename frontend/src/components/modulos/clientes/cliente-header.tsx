import { Button } from '../../ui/button';
import { TrendingUp, Users, UserPlus } from 'lucide-react';

interface ClienteHeaderProps {
  totalClientes: number;
  onNovoCliente: () => void;
}

export function ClienteHeader({
  totalClientes,
  onNovoCliente
}: ClienteHeaderProps) {
  const clientesAtivos = Math.floor(totalClientes * 0.85);
  const novosClientes = Math.floor(totalClientes * 0.12);

  return (
    <div className="bg-white rounded-lg shadow-md border-0 p-4 min-h-[80px] flex items-center">
      <div className="flex items-center justify-between w-full">
        {/* Área esquerda - Stats compactas */}
        <div className="flex items-center gap-6 bg-slate-50 rounded-lg px-4 py-2 border border-slate-200 w-80 h-16">
          {/* Total de Clientes */}
          <div className="flex items-center gap-2">
            <div className="w-6 h-6 bg-blue-100 rounded-full flex items-center justify-center">
              <Users className="h-3 w-3 text-blue-600" />
            </div>
            <div className="text-sm">
              <div className="font-semibold text-slate-800">{totalClientes.toLocaleString('pt-BR')}</div>
              <div className="text-xs text-slate-500">Total</div>
            </div>
          </div>

          {/* Separador */}
          <div className="w-px h-6 bg-slate-200"></div>

          {/* Clientes Ativos */}
          <div className="flex items-center gap-2">
            <div className="w-6 h-6 bg-green-100 rounded-full flex items-center justify-center">
              <TrendingUp className="h-3 w-3 text-green-600" />
            </div>
            <div className="text-sm">
              <div className="font-semibold text-slate-800">{clientesAtivos.toLocaleString('pt-BR')}</div>
              <div className="text-xs text-slate-500">Ativos</div>
            </div>
          </div>

          {/* Separador */}
          <div className="w-px h-6 bg-slate-200"></div>

          {/* Novos Clientes */}
          <div className="flex items-center gap-2">
            <div className="w-6 h-6 bg-orange-100 rounded-full flex items-center justify-center">
              <UserPlus className="h-3 w-3 text-orange-600" />
            </div>
            <div className="text-sm">
              <div className="font-semibold text-slate-800">{novosClientes.toLocaleString('pt-BR')}</div>
              <div className="text-xs text-slate-500">Novos</div>
            </div>
          </div>
        </div>

        {/* Área direita - Botão */}
        <Button 
          onClick={onNovoCliente} 
          size="sm" 
          className="gap-2 h-12 px-4 bg-gradient-to-r from-slate-600 to-slate-700 hover:from-slate-700 hover:to-slate-800 shadow-md hover:shadow-lg transition-all duration-200 rounded-lg font-semibold text-white"
        >
          <UserPlus className="h-4 w-4" />
          Novo Cliente
        </Button>
      </div>
    </div>
  );
}