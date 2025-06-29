# 🔧 COMANDOS PARA CONTINUAR REFATORAÇÃO

## ETAPA 4: RESOLVER DUPLICAÇÃO BACKEND

### 1. Identificar duplicação no repository:
```bash
grep -n "if filtros" repository.py
# Linhas 82-129 tem lógica duplicada
```

### 2. Criar método para extrair filtros:
```python
def _aplicar_filtros(self, query, filtros: Dict[str, Any]):
    """Aplica filtros na query de forma centralizada"""
    # Mover lógica duplicada para cá
```

### 3. Verificar tamanho do service:
```bash
wc -l service.py
# Meta: reduzir de 560 para <300 linhas
```

## ETAPA 5: REFATORAR FRONTEND

### 1. Buscar formatação duplicada:
```bash
grep -r "toLocaleString.*BRL" ../../../Frontend/src
```

### 2. Criar formatters.ts:
```typescript
// Frontend/src/lib/formatters.ts
export const formatarMoeda = (valor?: number): string => {
  if (!valor) return '--';
  return valor.toLocaleString('pt-BR', { 
    style: 'currency', 
    currency: 'BRL' 
  });
};
```

### 3. Substituir em todos arquivos:
```bash
# Lista arquivos que usam formatação
grep -l "toLocaleString.*BRL" Frontend/src/components/modulos/ambientes/*.tsx
```

## ETAPA 6: TRANSAÇÕES E HASH

### 1. Localizar onde implementar transação:
```bash
grep -n "criar_ambiente.*criar_material" service.py
# Linha ~466-489
```

### 2. Implementar hash:
```python
import hashlib
xml_hash = hashlib.sha256(conteudo_xml.encode()).hexdigest()
```

## VERIFICAÇÕES RÁPIDAS

### Status geral:
```bash
# Compilar Python
cd backend && python3 -m py_compile modules/ambientes/*.py

# Contar linhas
wc -l modules/ambientes/*.py

# Ver TODOs
grep -n "TODO" modules/ambientes/*
```

### Encontrar código duplicado:
```bash
# Backend
grep -A5 -B5 "except ValidationException" modules/ambientes/controller.py

# Frontend  
grep -r "formatarValor\|formatarDataHora" Frontend/src/components/modulos/ambientes/
```

## IMPORTANTE

- Sempre testar após cada mudança
- Manter código 100% funcional
- Uma etapa por vez
- Atualizar REFATORACAO_STATUS.md ao concluir