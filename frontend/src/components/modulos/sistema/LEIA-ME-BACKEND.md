# ⚠️ MÓDULOS DO SISTEMA - DEPENDÊNCIA DE BACKEND

## 🔧 **Status Atual**
Os componentes nesta pasta (`sistema/`) fazem parte da **estrutura básica** preparada para desenvolvimento futuro, conforme documentado no README.md do projeto.

## 🚨 **Funcionalidades Temporariamente Indisponíveis**
Após a remoção do backend, os seguintes componentes **NÃO FUNCIONARÃO** completamente até que o backend seja recriado:

### **📂 Componentes Afetados:**
- `gestao-empresas.tsx` → Gestão de empresas
- `gestao-equipe.tsx` → Gestão de funcionários  
- `gestao-lojas.tsx` → Gestão de lojas
- `reset-dados.tsx` → Reset de dados do sistema

### **🔗 APIs Removidas:**
- `services/empresas-api.ts` ❌
- `services/equipe-api.ts` ❌  
- `services/lojas-api.ts` ❌
- `hooks/data/use-empresas-real.ts` ❌
- `hooks/data/use-equipe-real.ts` ❌
- `hooks/data/use-lojas-real.ts` ❌

## ✅ **Módulo Principal FUNCIONAL**
- **Simulador de Orçamentos** → `/painel/orcamento/simulador` ✅
- **Gestão de Clientes** → `/painel/clientes` ✅ (usa localStorage)

## 🛠 **Para Reativar no Futuro**
1. Recriar o backend com endpoints equivalentes
2. Recriar os serviços de API removidos
3. Recriar os hooks removidos
4. Os componentes já estão preparados e funcionarão automaticamente

## 📋 **Alternativa Atual**
Para desenvolvimento e testes, use:
- **Dados mock/locais** para simulação
- **localStorage** para persistência temporária
- **Zustand stores** para gerenciamento de estado

---
**Vibecode**: Os módulos do sistema estão estruturalmente prontos, mas precisam do backend para funcionalidade completa. 