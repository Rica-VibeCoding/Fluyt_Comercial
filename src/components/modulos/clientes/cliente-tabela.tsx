import React, { useState } from 'react';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '../../ui/table';
import { Button } from '../../ui/button';
import { Badge } from '../../ui/badge';
import { Edit, Phone, Mail, MapPin, Users, FileText, ChevronDown, ChevronRight } from 'lucide-react';
import { Cliente } from '../../../types/cliente';
import { ClienteActionsMenu } from './cliente-actions-menu';

interface ClienteTabelaProps {
  clientes: Cliente[];
  isLoading: boolean;
  onEditarCliente: (cliente: Cliente) => void;
  onRemoverCliente: (id: string) => void;
}

export function ClienteTabela({ 
  clientes, 
  isLoading, 
  onEditarCliente, 
  onRemoverCliente 
}: ClienteTabelaProps) {
  const [expandedRows, setExpandedRows] = useState<Set<string>>(new Set());

  const toggleRowExpansion = (clienteId: string) => {
    const newExpandedRows = new Set(expandedRows);
    if (newExpandedRows.has(clienteId)) {
      newExpandedRows.delete(clienteId);
    } else {
      newExpandedRows.add(clienteId);
    }
    setExpandedRows(newExpandedRows);
  };

  const getClienteNumero = (index: number) => {
    return String(index + 1).padStart(3, '0');
  };

  const formatDate = (dateString?: string) => {
    if (!dateString) return '--';
    return new Date(dateString).toLocaleDateString('pt-BR');
  };

  // Loading State
  if (isLoading) {
    return (
      <div className="rounded-lg border-0 bg-blue-50/30 shadow-md">
        <div className="flex items-center justify-center py-8">
          <div className="flex items-center gap-2 text-gray-500">
            <div className="w-4 h-4 border-2 border-gray-300 border-t-blue-600 rounded-full animate-spin" />
            Carregando clientes...
          </div>
        </div>
      </div>
    );
  }

  // Empty State
  if (clientes.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-12 border-0 rounded-lg bg-white shadow-md">
        <Users className="h-12 w-12 text-gray-400 mb-4" />
        <h3 className="text-lg font-medium text-gray-900 mb-2">Nenhum cliente cadastrado</h3>
        <p className="text-gray-500 text-center max-w-sm">
          Comece criando seu primeiro cliente para gerenciar vendas e contratos.
        </p>
      </div>
    );
  }

  return (
    <div className="rounded-lg border-0 bg-blue-50/30 shadow-md">
      <Table>
        <TableHeader>
          <TableRow className="bg-slate-50 border-b border-slate-200">
            <TableHead className="font-semibold text-slate-700 h-10 w-12"></TableHead>
            <TableHead className="font-semibold text-slate-700 h-10">Pedido</TableHead>
            <TableHead className="font-semibold text-slate-700 h-10">Cliente</TableHead>
            <TableHead className="font-semibold text-slate-700 h-10">Contato</TableHead>
            <TableHead className="font-semibold text-slate-700 h-10">Tipo</TableHead>
            <TableHead className="font-semibold text-slate-700 h-10">Vendedor</TableHead>
            <TableHead className="font-semibold text-slate-700 h-10">Data de Cadastro</TableHead>
            <TableHead className="font-semibold text-slate-700 h-10">Status</TableHead>
            <TableHead className="text-right font-semibold text-slate-700 h-10">Ações</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {clientes.map((cliente, index) => (
            <React.Fragment key={cliente.id}>
              <TableRow 
                className="h-12 bg-white hover:bg-blue-50/50 cursor-pointer transition-colors"
                onClick={() => toggleRowExpansion(cliente.id)}
              >
                {/* Expand Icon */}
                <TableCell className="py-2 w-12">
                  {expandedRows.has(cliente.id) ? (
                    <ChevronDown className="h-4 w-4 text-slate-500" />
                  ) : (
                    <ChevronRight className="h-4 w-4 text-slate-500" />
                  )}
                </TableCell>

                {/* Pedido */}
                <TableCell className="py-2">
                  <span className="text-sm font-medium font-mono text-slate-900">#{getClienteNumero(index)}</span>
                </TableCell>

                {/* Cliente */}
                <TableCell className="py-2">
                  <div className="text-sm font-medium text-slate-900">{cliente.nome}</div>
                </TableCell>

                {/* Contato - APENAS TELEFONE */}
                <TableCell className="py-2">
                  <div className="flex items-center gap-1 text-sm font-normal text-slate-900">
                    <Phone className="h-3 w-3 text-green-600" />
                    {cliente.telefone}
                  </div>
                </TableCell>

                {/* Tipo */}
                <TableCell className="py-2">
                  <span className="text-sm font-normal text-slate-600">
                    {cliente.tipo_venda}
                  </span>
                </TableCell>

                {/* Vendedor */}
                <TableCell className="py-2">
                  <span className="text-sm font-medium text-slate-900">
                    {cliente.vendedor_nome || 'Não definido'}
                  </span>
                </TableCell>

                {/* Data de Cadastro */}
                <TableCell className="py-2">
                  <span className="text-sm font-normal text-slate-600">
                    {formatDate(cliente.created_at)}
                  </span>
                </TableCell>

                {/* Status */}
                <TableCell className="py-2">
                  <Badge variant="outline" className="border-green-300 text-green-600 bg-green-50">
                    Ativo
                  </Badge>
                </TableCell>

                {/* Ações */}
                <TableCell className="text-right py-2" onClick={(e) => e.stopPropagation()}>
                  <div className="flex justify-end gap-2">
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => onEditarCliente(cliente)}
                      className="h-8 w-8 p-0 hover:bg-blue-50/50"
                    >
                      <Edit className="h-3 w-3 text-slate-500" />
                    </Button>
                    
                    <ClienteActionsMenu
                      cliente={cliente}
                      onEditar={onEditarCliente}
                      onRemover={onRemoverCliente}
                    />
                  </div>
                </TableCell>
              </TableRow>

              {/* LINHA EXPANDIDA COM TODOS OS DADOS ADICIONAIS */}
              {expandedRows.has(cliente.id) && (
                <TableRow key={`${cliente.id}-expanded`} className="bg-blue-50/20 hover:bg-blue-50/30">
                  <TableCell colSpan={9} className="py-4">
                    <div className="pl-4">
                      {/* Layout Grid Responsivo */}
                      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                        
                        {/* COLUNA 1 - DADOS PESSOAIS */}
                        <div className="space-y-3">
                          <h4 className="text-sm font-semibold text-slate-700 mb-3">Dados Pessoais</h4>
                          
                          {/* CPF/CNPJ */}
                          <div className="flex items-center gap-2">
                            <FileText className="h-4 w-4 text-slate-600" />
                            <span className="text-sm font-medium text-slate-600">CPF/CNPJ:</span>
                            <span className="text-sm font-mono text-slate-900">{cliente.cpf_cnpj}</span>
                          </div>

                          {/* RG/IE */}
                          {cliente.rg_ie && (
                            <div className="flex items-center gap-2">
                              <FileText className="h-4 w-4 text-slate-600" />
                              <span className="text-sm font-medium text-slate-600">RG/IE:</span>
                              <span className="text-sm font-mono text-slate-900">{cliente.rg_ie}</span>
                            </div>
                          )}

                          {/* Email */}
                          {cliente.email && (
                            <div className="flex items-center gap-2">
                              <Mail className="h-4 w-4 text-blue-600" />
                              <span className="text-sm font-medium text-slate-600">Email:</span>
                              <span className="text-sm text-slate-900">{cliente.email}</span>
                            </div>
                          )}
                        </div>

                        {/* COLUNA 2 - LOCALIZAÇÃO */}
                        <div className="space-y-3">
                          <h4 className="text-sm font-semibold text-slate-700 mb-3">Localização</h4>
                          
                          {/* Endereço Completo */}
                          <div className="space-y-2">
                            <div className="flex items-center gap-2">
                              <MapPin className="h-4 w-4 text-red-600" />
                              <span className="text-sm font-medium text-slate-600">Endereço:</span>
                            </div>
                            <div className="ml-6 space-y-1 text-sm text-slate-900">
                              <div>
                                <strong>Logradouro:</strong> {cliente.logradouro || 'Não informado'}
                                {cliente.numero && `, ${cliente.numero}`}
                                {cliente.complemento && ` - ${cliente.complemento}`}
                              </div>
                              <div>
                                <strong>Bairro:</strong> {cliente.bairro || 'Não informado'} - 
                                <strong> Cidade:</strong> {cliente.cidade || 'Não informado'}/{cliente.uf || 'UF'}
                              </div>
                              <div>
                                <strong>CEP:</strong> {cliente.cep || 'Não informado'}
                              </div>
                            </div>
                          </div>
                        </div>

                        {/* COLUNA 3 - INFORMAÇÕES COMERCIAIS */}
                        <div className="space-y-3">
                          <h4 className="text-sm font-semibold text-slate-700 mb-3">Comercial</h4>
                          
                          {/* Procedência */}
                          {cliente.procedencia && (
                            <div className="flex items-center gap-2">
                              <Users className="h-4 w-4 text-purple-600" />
                              <span className="text-sm font-medium text-slate-600">Procedência:</span>
                              <Badge variant="outline" className="text-xs">
                                {cliente.procedencia}
                              </Badge>
                            </div>
                          )}

                          {/* Observações */}
                          {cliente.observacoes && (
                            <div className="space-y-2">
                              <div className="text-sm font-medium text-slate-600">Observações:</div>
                              <div className="text-sm italic bg-blue-50 p-3 rounded-md text-slate-900 border-l-4 border-blue-200">
                                {cliente.observacoes}
                              </div>
                            </div>
                          )}
                        </div>

                      </div>
                    </div>
                  </TableCell>
                </TableRow>
              )}
            </React.Fragment>
          ))}
        </TableBody>
      </Table>
    </div>
  );
}