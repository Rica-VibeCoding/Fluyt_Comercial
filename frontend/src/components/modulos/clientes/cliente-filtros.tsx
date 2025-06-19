import { Input } from '../../ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../../ui/select';
import { Button } from '../../ui/button';
import { Badge } from '../../ui/badge';
import { Search, X } from 'lucide-react';
import { FiltrosCliente, Vendedor, PROCEDENCIAS_PADRAO } from '../../../types/cliente';
import { useState, useEffect } from 'react';

interface ClienteFiltrosProps {
  filtros: FiltrosCliente;
  onFiltrosChange: (filtros: FiltrosCliente) => void;
  vendedores: Vendedor[];
}

export function ClienteFiltros({ filtros, onFiltrosChange, vendedores }: ClienteFiltrosProps) {
  const [busca, setBusca] = useState(filtros.busca || '');

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
  };

  const filtrosAtivos = Object.values(filtros).filter(Boolean).length;

  return (
    <div className="space-y-4">
      {/* Busca principal */}
      <div className="relative">
        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
        <Input
          placeholder="🔍 Buscar por nome, CPF, telefone ou email..."
          value={busca}
          onChange={(e) => setBusca(e.target.value)}
          className="pl-10 h-11"
        />
      </div>

      {/* Filtros em linha */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 xl:grid-cols-5 gap-4">
        <Select
          value={filtros.tipo_venda || 'all'}
          onValueChange={(value) => 
            onFiltrosChange({ ...filtros, tipo_venda: value === 'all' ? undefined : value as any })
          }
        >
          <SelectTrigger>
            <SelectValue placeholder="Tipo de Venda" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Todos os tipos</SelectItem>
            <SelectItem value="NORMAL">Normal</SelectItem>
            <SelectItem value="FUTURA">Futura</SelectItem>
          </SelectContent>
        </Select>

        <Select
          value={filtros.vendedor_id || 'all'}
          onValueChange={(value) => 
            onFiltrosChange({ ...filtros, vendedor_id: value === 'all' ? undefined : value })
          }
        >
          <SelectTrigger>
            <SelectValue placeholder="Vendedor" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Todos vendedores</SelectItem>
            {vendedores.map(vendedor => (
              <SelectItem key={vendedor.id} value={vendedor.id}>
                {vendedor.nome}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>

        <Select
          value={filtros.procedencia_id || 'all'}
          onValueChange={(value) => 
            onFiltrosChange({ ...filtros, procedencia_id: value === 'all' ? undefined : value })
          }
        >
          <SelectTrigger>
            <SelectValue placeholder="Procedência" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Todas procedências</SelectItem>
            {PROCEDENCIAS_PADRAO.map(proc => (
              <SelectItem key={proc} value={proc}>
                {proc}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>

        <Input
          type="date"
          value={filtros.data_inicio || ''}
          onChange={(e) => 
            onFiltrosChange({ ...filtros, data_inicio: e.target.value || undefined })
          }
          placeholder="Data inicial"
        />

        <Input
          type="date"
          value={filtros.data_fim || ''}
          onChange={(e) => 
            onFiltrosChange({ ...filtros, data_fim: e.target.value || undefined })
          }
          placeholder="Data final"
        />
      </div>

      {/* Badges de filtros ativos e botão limpar */}
      {filtrosAtivos > 0 && (
        <div className="flex items-center gap-2 flex-wrap">
          <span className="text-sm text-muted-foreground">Filtros ativos:</span>
          <Badge variant="secondary">{filtrosAtivos} filtro(s)</Badge>
          <Button 
            variant="ghost" 
            size="sm" 
            onClick={limparFiltros}
            className="h-6 px-2 text-xs"
          >
            <X className="h-3 w-3 mr-1" />
            Limpar Filtros
          </Button>
        </div>
      )}
    </div>
  );
}