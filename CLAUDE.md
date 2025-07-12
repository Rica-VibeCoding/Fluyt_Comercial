 👋 Olá Sou o Ricardo - Estamos construindo o Fluyt #

## 🎯 **SOBRE MIM E O PROJETO**

Oi Claude! Me chamo **Ricardo** e sou **empreendedor do mercado de móveis planejados**. NÃO sou desenvolvedor, mas estou criando esta solução para meu mercado usando IA para programar.

## 🛠 **STACKS DO PROJETO FLUYT**

### **🎨 FRONTEND (Next.js)**
- **Next.js 14.2** (App Router) - Framework React
- **React 18.3** - Biblioteca de interface
- **TypeScript** - Tipagem estática
- **Tailwind CSS** - Estilização utilitária
- **Shadcn/ui** - Componentes baseados em Radix UI
- **TanStack Query** - Gerenciamento de estado servidor
- **Zustand** - Gerenciamento de estado cliente
- **React Hook Form** - Formulários performáticos
- **Zod** - Validação de schemas
- **Supabase-js** - Cliente do banco de dados

### **⚡ BACKEND (Python)**
- **FastAPI** - Framework web moderno
dddddupabase** - Banco PostgreSQL + Auth
- **JWT** - Autenticação via tokens
- **SlowAPI** - Rate limiting para segurança

### **   BANCO DE DADOS**
- **PostgreSQL** (via Supabase)
- **Row Level Security (RLS)** - Segurança por linha
- **Soft Delete** - Exclusão lógica
- **Índices otimizados** - Performance

### **🔧 FERRAMENTAS EXTRAS**
- **React PDF** - Geração de relatórios
- **Recharts** - Gráficos e dashboards
- **Date-fns** - Manipulação de datas
- **Lucide React** - Ícones modernos
- **PowerShell Scripts** - Automação Windows

## 🚨 **REGRAS FUNDAMENTAIS PARA TRABALHARMOS JUNTOS**

### **1. LINGUAGEM SIMPLES** 
- Explique tudo em **português simples**
- NÃO use termos técnicos complicados
- Se usar algum termo técnico, **explique o que significa**

### **2. COMENTÁRIOS OBRIGATÓRIOS**
- **COMENTE TODO código em PT-BR**
- Explique **o que cada parte faz** em linguagem simples
- Sempre diga **POR QUE** está fazendo algo

### **3. TRANSPARÊNCIA TOTAL**
- A cada mudança, **explique amplamente** o que está fazendo
- Quero entender **se estamos na direção correta**
- Se algo não estiver funcionando, **me avise imediatamente**

### **4. NÃO MUDE ALÉM DO ESCOPO**
- Faça **APENAS** o que estamos combinando
- NÃO adicione funcionalidades extras sem avisar
- Posso me perder se fizer muita coisa de uma vez

### **5. PEÇA PERMISSÃO PARA AVANÇAR**
- **NUNCA** passe para próxima etapa sem me perguntar
- Isso me dá tempo de **raciocinar e acompanhar**
- Sempre pergunte: "Ricardo, posso avançar para a próxima parte?"

### **6. DADOS REAIS - ZERO MOCK**
- **APAGUE todo código mock** que encontrar
- Usamos **dados reais do Supabase**
- Se encontrar dados falsos, **substitua por dados reais**

### **7. EVITAR DUPLICAÇÃO**
- **ANTES** de criar função nova, **verifique se já existe**
- NÃO quero arquivos duplicados ou fantasmas
- Se encontrar código duplicado, **me avise**

### **8. TESTES**
- Você está no **Cursor com outras IAs no chat**
- Se não conseguir testar algo, **peça para elas testarem**
- Sempre **teste antes** de me mostrar

### **9. RELATORIOS SEM CODIGO**
- não adianta mostra codigo par aquem não sabe codar**
- só me atrapaha para avaliar o relatorio*




### **10. BOAS PRATICAS**
- AS IMPLEMENTAÇÕES TEM QUE ATENDEREM BOAS PRATICAS
- COISAS IMPORTANTES TEM QUE SER PESQUISADAS NO SITE DA GITHUB PARA SER USADA BOAS PRATICAS COM BASE NA COMUNIDADE 
- CONSIDERE SERMPRE AS STACKS QUE ESTAMOS USANDO 



## 📊 **INFORMAÇÕES DO BANCO SUPABASE**

# ===== SUPABASE CONFIGURATION =====
SUPABASE_URL=https://momwbpxqnvgehotfmvde.supabase.co
SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im1vbXdicHhxbnZnZWhvdGZtdmRlIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDc3NzAxNTIsImV4cCI6MjA2MzM0NjE1Mn0.n90ZweBT-o1ugerZJDZl8gx65WGe1eUrhph6VuSdSCs
SUPABASE_SERVICE_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im1vbXdicHhxbnZnZWhvdGZtdmRlIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc0Nzc3MDE1MiwiZXhwIjoyMDYzMzQ2MTUyfQ.NyRBsnWlhUmZUQFykINlaMgm9dHGkzx2nqhCYjaNiFA


# ===== JWT AUTHENTICATION =====
JWT_SECRET_KEY=fluyt-super-secret-key-development-2025
JWT_ALGORITHM=HS256
JWT_ACCESS_TOKEN_EXPIRE_MINUTES=60

# ===== APPLICATION SETTINGS =====
ENVIRONMENT=development
API_VERSION=v1
DEBUG=true
LOG_LEVEL=INFO

# ===== CORS CONFIGURATION =====
CORS_ORIGINS=http://localhost:3000,http://127.0.0.1:3000

# ===== FILE UPLOAD LIMITS =====
MAX_FILE_SIZE_MB=10
ALLOWED_FILE_EXTENSIONS=.xml

**O arquivo .env já está na raiz do backend** com essas configurações.


Estamos integrando a tabelas no circuito frontend, backand e supabase 
seu papel é depurar o que esta feito e o que falta fazer para nosso objetivo que é ter frontend com dados reais do supabase,
antes de tudo precisamos assegurar que o shemma no banco esta alinhado com o frontend ou precisara de refaturação, aparentemente não temos frontend disso ainda

Esse sistema tem múltiplas tabelas já funcionando 100% entregadas com backend e supabase e tem que servir de templates/exemplo para usarmos para a nova tabela que iremos criar.

uiux_tabela_modal> esse nosso arquivo existe para garantir padronização uiux, assim como as demais tabelas existente

vamos criar as etapas para toda a implantação
usar esse arquivo (que esta em branco) para criar os talks guia da implantação IMPLEMENTAR_Status_de_Orçamento.md

se conecte ao supabase via mcp para avaliar a tabela

me pergunte qual a próxima tabela ou refatoração que vamos fazer!



