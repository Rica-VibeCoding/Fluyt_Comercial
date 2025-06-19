import { Input } from '../../ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../../ui/select';
import { Button } from '../../ui/button';
import { Badge } from '../../ui/badge';
import { Card } from '../../ui/card';
import { Search, X, Filter, Calendar, User, MapPin } from 'lucide-react';
import { FiltrosCliente, Vendedor, PROCEDENCIAS_PADRAO } from '../../../types/cliente';
import { useState, useEffect } from 'react';

interface ClienteFiltrosModernoProps {
  filtros: FiltrosCliente;
  onFiltrosChange: (filtros: FiltrosCliente) => void;
  vendedores: Vendedor[];
}

export function ClienteFiltrosModerno({ filtros, onFiltrosChange, vendedores }: ClienteFiltrosModernoProps) {
  const [busca, setBusca] = useState(filtros.busca || '');
  const [mostrarFiltrosAvancados, setMostrarFiltrosAvancados] = useState(false);

  // Debounce para busca
  useEffect(() => {
    const timer = setTimeout(() => {
      onFiltrosChange({ ...filtros, busca: busca || undefined });
    }, 300);

    return () => clearTimeout(timer);
  }, [busca]);

  const limparFiltros = () => {
    setBusca('');
    onFiltrosChange({});
    setMostrarFiltrosAvancados(false);
  };

  const filtrosAtivos = Object.values(filtros).filter(Boolean).length;

  return (
    <Card className="shadow-md border-0 bg-white dark:bg-slate-800">
      <div className="px-4 pt-4 pb-4 space-y-3">
        {/* Busca principal */}
        <div className="flex gap-3">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Buscar por nome, telefone ou email..."
              value={busca}
              onChange={(e) => setBusca(e.target.value)}
              className="pl-10 h-9 text-sm bg-slate-50 dark:bg-slate-900 border-slate-200 dark:border-slate-700"
            />
          </div>
          
          <Button
            variant="outline"
            size="sm"
            onClick={() => setMostrarFiltrosAvancados(!mostrarFiltrosAvancados)}
            className={`h-9 px-4 gap-2 border-slate-200 dark:border-slate-700 text-sm ${
              mostrarFiltrosAvancados ? 'bg-slate-100 border-slate-300 text-slate-700 dark:bg-slate-700 dark:border-slate-600 dark:text-slate-300' : ''
            }`}
          >
            <Filter className="h-3 w-3" />
            Filtros
            {filtrosAtivos > 0 && (
              <Badge variant="destructive" className="ml-1 px-1 py-0 text-xs h-4 min-w-4">
                {filtrosAtivos}
              </Badge>
            )}
          </Button>
        </div>

        {/* Filtros avançados */}
        {mostrarFiltrosAvancados && (
          <div className="space-y-3 p-3 bg-slate-50 dark:bg-slate-800/50 rounded-lg border border-slate-200 dark:border-slate-700">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-3">
              <div className="space-y-1">
                <label className="text-xs font-medium text-slate-600 dark:text-slate-400 flex items-center gap-1">
                  <User className="h-3 w-3" />
                  Tipo de Venda
                </label>
                <Select
                  value={filtros.tipo_venda || 'all'}
                  onValueChange={(value) => 
                    onFiltrosChange({ ...filtros, tipo_venda: value === 'all' ? undefined : value as any })
                  }
                >
                  <SelectTrigger className="h-8 text-xs bg-white dark:bg-slate-800">
                    <SelectValue placeholder="Selecionar tipo" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">Todos</SelectItem>
                    <SelectItem value="NORMAL">Normal</SelectItem>
                    <SelectItem value="FUTURA">Futura</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-1">
                <label className="text-xs font-medium text-slate-600 dark:text-slate-400 flex items-center gap-1">
                  <User className="h-3 w-3" />
                  Vendedor
                </label>
                <Select
                  value={filtros.vendedor_id || 'all'}
                  onValueChange={(value) => 
                    onFiltrosChange({ ...filtros, vendedor_id: value === 'all' ? undefined : value })
                  }
                >
                  <SelectTrigger className="h-8 text-xs bg-white dark:bg-slate-800">
                    <SelectValue placeholder="Vendedor" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">Todos</SelectItem>
                    {vendedores.map(vendedor => (
                      <SelectItem key={vendedor.id} value={vendedor.id}>
                        {vendedor.nome}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-1">
                <label className="text-xs font-medium text-slate-600 dark:text-slate-400 flex items-center gap-1">
                  <MapPin className="h-3 w-3" />
                  Procedência
                </label>
                <Select
                  value={filtros.procedencia_id || 'all'}
                  onValueChange={(value) => 
                    onFiltrosChange({ ...filtros, procedencia_id: value === 'all' ? undefined : value })
                  }
                >
                  <SelectTrigger className="h-8 text-xs bg-white dark:bg-slate-800">
                    <SelectValue placeholder="Procedência" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">Todas</SelectItem>
                    {PROCEDENCIAS_PADRAO.map(proc => (
                      <SelectItem key={proc} value={proc}>
                        {proc}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-1">
                <label className="text-xs font-medium text-slate-600 dark:text-slate-400 flex items-center gap-1">
                  <Calendar className="h-3 w-3" />
                  Período
                </label>
                <div className="grid grid-cols-2 gap-1">
                  <Input
                    type="date"
                    value={filtros.data_inicio || ''}
                    onChange={(e) => 
                      onFiltrosChange({ ...filtros, data_inicio: e.target.value || undefined })
                    }
                    className="h-8 text-xs bg-white dark:bg-slate-800"
                  />
                  <Input
                    type="date"
                    value={filtros.data_fim || ''}
                    onChange={(e) => 
                      onFiltrosChange({ ...filtros, data_fim: e.target.value || undefined })
                    }
                    className="h-8 text-xs bg-white dark:bg-slate-800"
                  />
                </div>
              </div>
            </div>

            {/* Filtros ativos e botão limpar */}
            {filtrosAtivos > 0 && (
              <div className="flex items-center justify-between pt-2 border-t border-slate-200 dark:border-slate-700">
                <div className="flex items-center gap-2">
                  <span className="text-xs font-medium text-slate-600 dark:text-slate-400">
                    Filtros ativos:
                  </span>
                  <Badge variant="secondary" className="bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200 text-xs px-2 py-0">
                    {filtrosAtivos}
                  </Badge>
                </div>
                <Button 
                  variant="ghost" 
                  size="sm" 
                  onClick={limparFiltros}
                  className="h-6 px-2 text-xs gap-1 text-slate-500 hover:text-slate-700 dark:text-slate-400 dark:hover:text-slate-200"
                >
                  <X className="h-3 w-3" />
                  Limpar
                </Button>
              </div>
            )}
          </div>
        )}
      </div>
    </Card>
  );
}