import { MoreHorizontal, Edit, Trash2, Home, Loader2 } from 'lucide-react';
import { Button } from '../../ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '../../ui/dropdown-menu';
import { Cliente } from '../../../types/cliente';
import { useRouter } from 'next/navigation';

interface ClienteActionsMenuProps {
  cliente: Cliente;
  onEditar: (cliente: Cliente) => void;
  onRemover: (id: string) => void;
  isRemoving: boolean;
}

export function ClienteActionsMenu({ cliente, onEditar, onRemover, isRemoving }: ClienteActionsMenuProps) {
  const router = useRouter();

  const handleEditClick = () => {
    // Adiciona um pequeno delay para permitir que o menu feche antes de abrir o modal.
    // Isso evita conflitos de estado e renderização com o DropdownMenu.
    setTimeout(() => {
      onEditar(cliente);
    }, 50); // 50ms é um delay seguro e imperceptível.
  };

  const handleCriarAmbientes = () => {
    // Adicionar parâmetro de intenção para forçar troca de cliente
    router.push(`/painel/ambientes?clienteId=${cliente.id}&clienteNome=${encodeURIComponent(cliente.nome)}&forcar=true`);
  };

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" className="h-8 w-8 p-0">
          <span className="sr-only">Abrir menu</span>
          <MoreHorizontal className="h-4 w-4" />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end">
        <DropdownMenuLabel>Ações</DropdownMenuLabel>
        <DropdownMenuItem onClick={handleCriarAmbientes}>
          <Home className="mr-2 h-4 w-4" />
          Criar Ambientes
        </DropdownMenuItem>
        <DropdownMenuSeparator />
        <DropdownMenuItem onClick={handleEditClick}>
          <Edit className="mr-2 h-4 w-4" />
          Editar
        </DropdownMenuItem>
        <DropdownMenuItem 
          className="text-red-600" 
          onClick={() => onRemover(cliente.id)}
          disabled={isRemoving}
        >
          {isRemoving ? (
            <><Loader2 className="mr-2 h-4 w-4 animate-spin" /> Inativando...</>
          ) : (
            <><Trash2 className="mr-2 h-4 w-4" /> Remover</>
          )}
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}