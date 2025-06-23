# 🟢 DESCOBERTA MCP - COMO DESCOBRIR ESTRUTURAS REAIS

## 🚨 **REGRA #1: NUNCA ASSUMA, SEMPRE DESCUBRA!**

> **Módulo "funcionários" ≠ Tabela "funcionarios"**  
> No Fluyt, pode ser `cad_equipe`, `c_funcionarios`, etc!

## 🔍 **O QUE É MCP?**

**Model Context Protocol** - Ferramenta que permite acessar o Supabase diretamente.  
Usamos para descobrir estruturas reais ANTES de codificar.

## 📋 **PROCESSO OBRIGATÓRIO - 5 PASSOS**

### **PASSO 1: DESCOBRIR TABELA REAL VIA MCP**

```python
# 🎯 COPIE E COLE ESTE CÓDIGO:
python3 -c "
import sys
sys.path.append('/mnt/c/Users/ricar/Projetos/Fluyt_Comercial/backend')
from core.database import get_database

print('🔍 DESCOBRINDO TABELA REAL VIA MCP...')
db = get_database()

# Substitua 'funcionarios' pelo módulo que procura
modulo = 'funcionarios'
tabelas_possiveis = [
    modulo,
    f'cad_{modulo}',
    f'c_{modulo}',
    f'{modulo[:-1]}',  # singular
    f'cad_{modulo[:-1]}'
]

for tabela in tabelas_possiveis:
    try:
        result = db.table(tabela).select('id').limit(1).execute()
        print(f'✅ ENCONTRADA: {tabela}')
        
        # Mostrar estrutura
        result = db.table(tabela).select('*').limit(1).execute()
        if result.data:
            print(f'\n📊 CAMPOS:')
            for campo, valor in result.data[0].items():
                print(f'  {campo}: {type(valor).__name__}')
        break
    except:
        print(f'❌ {tabela}: não existe')
"
```

**📋 OUTPUT ESPERADO:**
```
🔍 DESCOBRINDO TABELA REAL VIA MCP...
❌ funcionarios: não existe
❌ cad_funcionarios: não existe  
✅ ENCONTRADA: cad_equipe

📊 CAMPOS:
  id: str
  nome: str
  perfil: str
  setor_id: str
  loja_id: str
```

### **PASSO 2: COMPARAR COM FRONTEND**

```bash
# Ver o que frontend espera
grep -n "interface.*Funcionario" Frontend/src/types/*.ts -A 10

# Ver formulários
grep -n "formData\." Frontend/src/components/**/*.tsx | grep -i funcionario
```

### **PASSO 3: CRIAR MAPEAMENTO VISUAL**

| Campo Frontend | Campo Banco | Status | Ação |
|----------------|-------------|--------|------|
| `setor` | `setor_id` | 🚨 | Converter nome→UUID |
| `tipoFuncionario` | `perfil` | ⚠️ | Renomear |
| `lojaId` | `loja_id` | ✅ | snake_case |

### **PASSO 4: VALIDAR COM RICARDO**

```markdown
Ricardo, MCP descobriu:

✅ **TABELA:** `cad_equipe` (não "funcionarios")
🚨 **PROBLEMAS:** 3 incompatibilidades
💡 **SOLUÇÃO:** Converter setor nome→ID

Posso prosseguir?
```

### **PASSO 5: DOCUMENTAR NO .MD**

```yaml
---
# 🚨 ESQUEMA VALIDADO VIA MCP
tabela_real: cad_equipe
campos_conversao:
  setor: setor_id       # nome→UUID
  tipoFuncionario: perfil
---
```

## 🚫 **ERROS FATAIS A EVITAR**

### **❌ ERRO 1: Assumir nome da tabela**
```python
# NUNCA FAÇA:
db.table('funcionarios')  # Pode não existir!
```

### **❌ ERRO 2: Ignorar tipos de dados**
```typescript
// Frontend espera string, banco tem UUID
setor: "Vendas" vs setor_id: "uuid-123"
```

### **❌ ERRO 3: Não verificar relacionamentos**
```sql
-- setor_id aponta para cad_setores
-- Mas cad_setores pode estar vazia!
```

## 🎯 **CASOS REAIS DO FLUYT**

### **Caso 1: Módulo Equipe**
- **Assumido:** tabela `funcionarios`
- **Real:** tabela `cad_equipe`
- **Resultado:** 6 horas de retrabalho evitadas

### **Caso 2: Campo Setor**
- **Frontend:** envia nome "Vendas"
- **Backend:** espera UUID
- **Solução:** Converter no backend

### **Caso 3: Comissões**
- **Frontend:** campo único `comissao`
- **Backend:** 2 campos `comissao_percentual_vendedor/gerente`
- **Solução:** Lógica condicional

## ✅ **CHECKLIST ANTES DE CODIFICAR**

- [ ] Usei MCP para descobrir tabela real?
- [ ] Comparei campos frontend vs banco?
- [ ] Criei tabela de mapeamento?
- [ ] Validei com Ricardo?
- [ ] Documentei no arquivo .md?

## 🚀 **PRÓXIMO PASSO**

Agora leia: **[🟢1C- Claude_Code_MISSOES.md](./🟢1C-%20Claude_Code_MISSOES.md)**

---

**Tempo de leitura:** ~5 minutos  
**Criticidade:** OBRIGATÓRIA antes de criar qualquer módulo