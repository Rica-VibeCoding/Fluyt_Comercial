/**
 * Helpers para toasts específicos do sistema
 * Seguindo padrão UX/UI do projeto
 */

import { toast } from "../components/ui/use-toast";

export const toastHelpers = {
  /**
   * Toast para XML duplicado - seguindo padrão UX/UI azul do projeto
   */
  xmlDuplicado: () => {
    toast({
      variant: "destructive",
      title: "Este ambiente já foi importado",
      description: "Use um arquivo XML diferente ou verifique os ambientes existentes",
    });
  },

  /**
   * Toast para sucesso de XML
   */
  xmlSucesso: (nomeArquivo: string) => {
    toast({
      variant: "default",
      title: "XML importado com sucesso!",
      description: `Arquivo "${nomeArquivo}" processado com sucesso`,
    });
  },

  /**
   * Toast para erro genérico de XML
   */
  xmlErro: (mensagem: string) => {
    toast({
      variant: "destructive", 
      title: "Erro ao importar XML",
      description: mensagem,
    });
  },

  /**
   * Toast para processamento de XML
   */
  xmlProcessando: (nomeArquivo: string) => {
    toast({
      variant: "default",
      title: "Importando XML",
      description: `Processando arquivo "${nomeArquivo}"...`,
    });
  }
}; 