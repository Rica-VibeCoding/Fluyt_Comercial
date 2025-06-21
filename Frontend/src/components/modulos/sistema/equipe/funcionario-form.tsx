import React from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Loader2 } from 'lucide-react';
import type { FuncionarioFormData, Loja, Setor } from '@/types/sistema';

interface FuncionarioFormProps {
  formData: FuncionarioFormData;
  onFormDataChange: (data: FuncionarioFormData) => void;
  onSubmit: (e: React.FormEvent) => void;
  onCancel: () => void;
  isEditing: boolean;
  loading?: boolean;
  lojas: Loja[];
  setores: Setor[];
}

export function FuncionarioForm({
  formData,
  onFormDataChange,
  onSubmit,
  onCancel,
  isEditing,
  loading = false,
  lojas,
  setores
}: FuncionarioFormProps) {

  const handleChange = (field: keyof FuncionarioFormData, value: any) => {
    onFormDataChange({
      ...formData,
      [field]: value
    });
  };

  const handleConfigChange = (field: string, value: number | undefined) => {
    onFormDataChange({
      ...formData,
      configuracoes: {
        ...formData.configuracoes,
        [field]: value
      }
    });
  };

  const niveisAcesso = [
    { value: 'USUARIO', label: 'Usuário' },
    { value: 'SUPERVISOR', label: 'Supervisor' },
    { value: 'GERENTE', label: 'Gerente' },
    { value: 'ADMIN', label: 'Admin' }
  ];

  const tiposFuncionario = [
    { value: 'VENDEDOR', label: 'Vendedor' },
    { value: 'GERENTE', label: 'Gerente' },
    { value: 'MEDIDOR', label: 'Medidor' },
    { value: 'ADMIN_MASTER', label: 'Admin Master' }
  ];

  return (
    <form onSubmit={onSubmit} className="space-y-6">
      {/* Dados Pessoais */}
      <div className="space-y-4">
        <h3 className="text-lg font-medium border-b pb-2">Dados Pessoais</h3>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label htmlFor="nome">Nome Completo *</Label>
            <Input
              id="nome"
              value={formData.nome}
              onChange={(e) => handleChange('nome', e.target.value)}
              placeholder="Nome completo do funcionário"
              required
              disabled={loading}
            />
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="email">Email *</Label>
            <Input
              id="email"
              type="email"
              value={formData.email}
              onChange={(e) => handleChange('email', e.target.value)}
              placeholder="email@empresa.com.br"
              required
              disabled={loading}
            />
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label htmlFor="telefone">Telefone *</Label>
            <Input
              id="telefone"
              value={formData.telefone}
              onChange={(e) => handleChange('telefone', e.target.value)}
              placeholder="(11) 98765-4321"
              required
              disabled={loading}
            />
          </div>
          
        </div>
      </div>

      {/* Dados Profissionais */}
      <div className="space-y-4">
        <h3 className="text-lg font-medium border-b pb-2">Dados Profissionais</h3>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="space-y-2">
            <Label htmlFor="tipoFuncionario">Tipo *</Label>
            <Select
              value={formData.tipoFuncionario}
              onValueChange={(value) => handleChange('tipoFuncionario', value)}
              disabled={loading}
            >
              <SelectTrigger>
                <SelectValue placeholder="Selecione o tipo" />
              </SelectTrigger>
              <SelectContent>
                {tiposFuncionario.map((tipo) => (
                  <SelectItem key={tipo.value} value={tipo.value}>
                    {tipo.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label htmlFor="nivelAcesso">Nível de Acesso *</Label>
            <Select
              value={formData.nivelAcesso}
              onValueChange={(value) => handleChange('nivelAcesso', value)}
              disabled={loading}
            >
              <SelectTrigger>
                <SelectValue placeholder="Selecione o nível" />
              </SelectTrigger>
              <SelectContent>
                {niveisAcesso.map((nivel) => (
                  <SelectItem key={nivel.value} value={nivel.value}>
                    {nivel.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label htmlFor="dataAdmissao">Data de Admissão *</Label>
            <Input
              id="dataAdmissao"
              type="date"
              value={formData.dataAdmissao}
              onChange={(e) => handleChange('dataAdmissao', e.target.value)}
              required
              disabled={loading}
            />
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label htmlFor="lojaId">Loja *</Label>
            <Select
              value={formData.lojaId}
              onValueChange={(value) => handleChange('lojaId', value)}
              disabled={loading}
            >
              <SelectTrigger>
                <SelectValue placeholder="Selecione a loja" />
              </SelectTrigger>
              <SelectContent>
                {lojas.map((loja) => (
                  <SelectItem key={loja.id} value={loja.id}>
                    {loja.nome}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label htmlFor="setor">Setor *</Label>
            <Select
              value={formData.setor}
              onValueChange={(value) => handleChange('setor', value)}
              disabled={loading}
            >
              <SelectTrigger>
                <SelectValue placeholder="Selecione o setor" />
              </SelectTrigger>
              <SelectContent>
                {setores.map((setor) => (
                  <SelectItem key={setor.id} value={setor.nome}>
                    {setor.nome}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>
      </div>

      {/* Dados Financeiros */}
      <div className="space-y-4">
        <h3 className="text-lg font-medium border-b pb-2">Dados Financeiros</h3>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label htmlFor="salario">Salário (R$)</Label>
            <Input
              id="salario"
              type="number"
              min="0"
              step="0.01"
              value={formData.salario}
              onChange={(e) => handleChange('salario', Number(e.target.value))}
              placeholder="0.00"
              disabled={loading}
            />
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="comissao">Comissão (%)</Label>
            <Input
              id="comissao"
              type="number"
              min="0"
              max="100"
              step="0.1"
              value={formData.comissao}
              onChange={(e) => handleChange('comissao', Number(e.target.value))}
              placeholder="0.0"
              disabled={loading}
            />
          </div>
        </div>
      </div>

      {/* Configurações Especiais */}
      {(formData.tipoFuncionario === 'VENDEDOR' || formData.tipoFuncionario === 'GERENTE' || formData.tipoFuncionario === 'MEDIDOR') && (
        <div className="space-y-4">
          <h3 className="text-lg font-medium border-b pb-2">Configurações Especiais</h3>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="limiteDesconto">Limite de Desconto (%)</Label>
              <Input
                id="limiteDesconto"
                type="number"
                min="0"
                max="100"
                step="0.1"
                value={formData.configuracoes?.limiteDesconto || ''}
                onChange={(e) => handleConfigChange('limiteDesconto', e.target.value ? Number(e.target.value) : undefined)}
                placeholder="0.0"
                disabled={loading}
              />
            </div>

            {formData.tipoFuncionario === 'MEDIDOR' && (
              <div className="space-y-2">
                <Label htmlFor="valorMedicao">Valor por Medição (R$) *</Label>
                <Input
                  id="valorMedicao"
                  type="number"
                  min="0"
                  step="0.01"
                  value={formData.configuracoes?.valorMedicao || ''}
                  onChange={(e) => handleConfigChange('valorMedicao', e.target.value ? Number(e.target.value) : undefined)}
                  placeholder="0.00"
                  required={formData.tipoFuncionario === 'MEDIDOR'}
                  disabled={loading}
                />
              </div>
            )}

            {formData.tipoFuncionario === 'GERENTE' && (
              <div className="space-y-2">
                <Label htmlFor="minimoGarantido">Mínimo Garantido (R$)</Label>
                <Input
                  id="minimoGarantido"
                  type="number"
                  min="0"
                  step="0.01"
                  value={formData.configuracoes?.minimoGarantido || ''}
                  onChange={(e) => handleConfigChange('minimoGarantido', e.target.value ? Number(e.target.value) : undefined)}
                  placeholder="0.00"
                  disabled={loading}
                />
              </div>
            )}
          </div>
        </div>
      )}

      {/* Botões */}
      <div className="flex justify-end gap-3 pt-4">
        <Button
          type="button"
          variant="outline"
          onClick={onCancel}
          disabled={loading}
        >
          Cancelar
        </Button>
        <Button
          type="submit"
          className="bg-blue-600 hover:bg-blue-700"
          disabled={loading}
        >
          {loading ? (
            <>
              <Loader2 className="h-4 w-4 mr-2 animate-spin" />
              {isEditing ? 'Atualizando...' : 'Criando...'}
            </>
          ) : (
            isEditing ? 'Atualizar Funcionário' : 'Criar Funcionário'
          )}
        </Button>
      </div>
    </form>
  );
}