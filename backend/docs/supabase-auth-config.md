# Configuração de Autenticação do Supabase

## Credenciais do Projeto
- **URL**: https://momwbpxqnvgehotfmvde.supabase.co
- **Project Ref**: momwbpxqnvgehotfmvde

## Configurações Necessárias no Dashboard

### 1. Site URL
```
http://localhost:3000
```

### 2. Redirect URLs (adicionar todas)
```
http://localhost:3000/auth/callback
http://localhost:3000/painel
http://127.0.0.1:3000/auth/callback
http://127.0.0.1:3000/painel
```

## Como Configurar

1. Acesse o dashboard do Supabase: https://supabase.com/dashboard
2. Selecione o projeto: momwbpxqnvgehotfmvde
3. No menu lateral, vá para: **Authentication** > **URL Configuration**
4. Configure:
   - **Site URL**: `http://localhost:3000`
   - **Redirect URLs**: Adicione cada URL listada acima

## Verificação

Após configurar, teste o fluxo de autenticação acessando:
- http://localhost:3000
- http://127.0.0.1:3000

Ambos devem funcionar corretamente para login/logout.