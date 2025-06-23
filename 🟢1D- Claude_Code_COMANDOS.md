# 🟢 COMANDOS - SCRIPTS PRONTOS PARA USAR

## ⚡ **COMANDO UNIVERSAL - DESCOBRIR QUALQUER TABELA**

```python
# 🎯 COPIE, COLE E MODIFIQUE 'produtos' PARA SEU MÓDULO:
python3 -c "
import sys
sys.path.append('/mnt/c/Users/ricar/Projetos/Fluyt_Comercial/backend')
from core.database import get_database

modulo = 'produtos'  # 👈 MUDE AQUI!
print(f'🔍 PROCURANDO TABELA PARA: {modulo}')
db = get_database()

padroes = [
    modulo, f'cad_{modulo}', f'c_{modulo}',
    modulo[:-1], f'cad_{modulo[:-1]}', f'c_{modulo[:-1]}'
]

for p in padroes:
    try:
        r = db.table(p).select('*').limit(1).execute()
        print(f'✅ ACHEI: {p}')
        if r.data:
            print(f'📊 Campos: {list(r.data[0].keys())}')
        break
    except:
        print(f'❌ {p}: não existe')
"
```

## 🔍 **COMANDOS DE DESCOBERTA**

### **Ver estrutura completa de uma tabela:**
```python
python3 -c "
from core.database import get_database
db = get_database()
tabela = 'cad_equipe'  # 👈 MUDE AQUI
result = db.table(tabela).select('*').limit(1).execute()
if result.data:
    for campo, valor in result.data[0].items():
        print(f'{campo}: {type(valor).__name__} = {valor}')
"
```

### **Listar TODAS as tabelas (exploratório):**
```python
python3 -c "
# Lista tabelas comuns do Fluyt
tabelas = [
    'cad_empresas', 'c_lojas', 'c_clientes', 'cad_equipe',
    'cad_procedencias', 'c_orcamentos', 'c_ambientes',
    'cad_setores', 'cad_status_orcamento'
]
from core.database import get_database
db = get_database()
for t in tabelas:
    try:
        count = db.table(t).select('id', count='exact').execute()
        print(f'✅ {t}: {count.count} registros')
    except:
        print(f'❌ {t}: não existe ou erro')
"
```

## 🔗 **COMANDOS DE RELACIONAMENTO**

### **Verificar se foreign key existe:**
```python
python3 -c "
from core.database import get_database
db = get_database()

# Verificar se setor_id em cad_equipe aponta para cad_setores válidos
equipe = db.table('cad_equipe').select('setor_id').execute()
setores = db.table('cad_setores').select('id').execute()

setores_ids = [s['id'] for s in setores.data]
invalidos = [e['setor_id'] for e in equipe.data if e['setor_id'] not in setores_ids]

if invalidos:
    print(f'🚨 {len(invalidos)} funcionários com setor_id inválido!')
else:
    print('✅ Todos setor_id são válidos')
"
```

## 🧪 **COMANDOS DE TESTE**

### **Testar conexão com Supabase:**
```bash
cd backend
python3 -c "
from core.database import get_database
try:
    db = get_database()
    print('✅ Conexão OK!')
except Exception as e:
    print(f'❌ Erro: {e}')
"
```

### **Testar endpoint da API:**
```bash
# 1. Obter token
TOKEN=$(curl -s -X POST "http://localhost:8000/api/v1/auth/login" \
  -H "Content-Type: application/json" \
  -d '{"email":"admin@fluyt.com","password":"senha123"}' \
  | jq -r '.access_token')

# 2. Testar endpoint
curl -X GET "http://localhost:8000/api/v1/funcionarios" \
  -H "Authorization: Bearer $TOKEN" | jq
```

## 📝 **COMANDOS ÚTEIS GREP**

### **Encontrar interfaces TypeScript:**
```bash
# Todas as interfaces
grep -r "interface" Frontend/src/types/ --include="*.ts"

# Interface específica
grep -r "interface.*Cliente" Frontend/src --include="*.ts" -A 10
```

### **Encontrar uso de formData:**
```bash
# Ver campos de formulário
grep -r "formData\." Frontend/src/components/ --include="*.tsx" | cut -d: -f2 | sort | uniq
```

### **Encontrar chamadas de API:**
```bash
# Ver endpoints sendo chamados
grep -r "apiClient\." Frontend/src/ --include="*.ts" --include="*.tsx" | grep -v "node_modules"
```

## 🛠️ **COMANDOS DE CORREÇÃO**

### **Popular tabela vazia:**
```python
python3 -c "
from core.database import get_database
from uuid import uuid4

db = get_database()
# Exemplo: popular cad_setores
setores = ['Vendas', 'Administrativo', 'Gerência']
for nome in setores:
    try:
        db.table('cad_setores').insert({'id': str(uuid4()), 'nome': nome}).execute()
        print(f'✅ Criado: {nome}')
    except Exception as e:
        print(f'❌ Erro em {nome}: {e}')
"
```

## 🚨 **TROUBLESHOOTING**

### **Erro: "No module named 'core'"**
```bash
# Certifique-se de estar no diretório correto
cd /mnt/c/Users/ricar/Projetos/Fluyt_Comercial/backend
```

### **Erro: "relation does not exist"**
```python
# Tabela não existe - verifique nome correto
python3 -c "
# Use o comando universal acima para descobrir nome real
"
```

### **Erro: "permission denied"**
```python
# RLS ativo - pode precisar de contexto de usuário
# Ou executar direto no Supabase Dashboard
```

## ✅ **COMANDOS MAIS USADOS**

```bash
# 1. Descobrir tabela
python3 -c "..." # Comando universal acima

# 2. Ver estrutura
python3 -c "..." # Comando estrutura acima

# 3. Testar API
curl -X GET "http://localhost:8000/api/v1/..." -H "Authorization: Bearer $TOKEN"

# 4. Procurar no código
grep -r "TERMO" Frontend/src/ --include="*.tsx"
```

---

## 🎯 **RESUMO: FLUXO TÍPICO**

1. **Descobrir tabela** → Comando universal
2. **Ver estrutura** → Comando estrutura  
3. **Verificar frontend** → Comandos grep
4. **Testar API** → Comandos curl
5. **Corrigir problemas** → Comandos correção

---

**Tempo de leitura:** ~5 minutos  
**Referência rápida:** Mantenha aberto enquanto trabalha