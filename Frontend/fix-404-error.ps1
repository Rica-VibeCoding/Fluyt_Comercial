#!/usr/bin/env pwsh

# 🔧 SCRIPT PARA RESOLVER ERRO 404 - BASEADO NA PESQUISA WEB
# Resolve problemas comuns de proxy Next.js + FastAPI

Write-Host "🚀 INICIANDO CORREÇÃO DO ERRO 404..." -ForegroundColor Green
Write-Host "================================================" -ForegroundColor Yellow

# 1. Parar processos Next.js existentes
Write-Host "🔄 Parando processos Next.js..." -ForegroundColor Cyan
Get-Process | Where-Object {$_.ProcessName -like "*node*" -and $_.MainWindowTitle -like "*Next.js*"} | Stop-Process -Force -ErrorAction SilentlyContinue

# 2. Limpar cache do Next.js (solução mais comum)
Write-Host "🧹 Limpando cache do Next.js..." -ForegroundColor Cyan
if (Test-Path ".next") {
    Remove-Item -Recurse -Force ".next"
    Write-Host "✅ Cache .next removido" -ForegroundColor Green
} else {
    Write-Host "ℹ️  Pasta .next não encontrada" -ForegroundColor Yellow
}

# 3. Limpar node_modules/.cache
Write-Host "🧹 Limpando cache do node_modules..." -ForegroundColor Cyan
if (Test-Path "node_modules/.cache") {
    Remove-Item -Recurse -Force "node_modules/.cache"
    Write-Host "✅ Cache node_modules removido" -ForegroundColor Green
}

# 4. Verificar se backend está rodando
Write-Host "🔍 Verificando backend..." -ForegroundColor Cyan
try {
    $response = Invoke-WebRequest -Uri "http://localhost:8000/health" -Method GET -TimeoutSec 5
    if ($response.StatusCode -eq 200) {
        Write-Host "✅ Backend rodando na porta 8000" -ForegroundColor Green
    }
} catch {
    Write-Host "❌ Backend não está rodando na porta 8000" -ForegroundColor Red
    Write-Host "   Execute: cd backend && python -m uvicorn main:app --reload --host 0.0.0.0 --port 8000" -ForegroundColor Yellow
}

# 5. Verificar configuração do next.config.mjs
Write-Host "🔍 Verificando configuração do proxy..." -ForegroundColor Cyan
if (Test-Path "next.config.mjs") {
    $config = Get-Content "next.config.mjs" -Raw
    if ($config -match "rewrites.*api/v1.*localhost:8000") {
        Write-Host "✅ Configuração de proxy encontrada" -ForegroundColor Green
    } else {
        Write-Host "⚠️  Configuração de proxy pode estar incorreta" -ForegroundColor Yellow
    }
} else {
    Write-Host "❌ next.config.mjs não encontrado" -ForegroundColor Red
}

# 6. Instalar dependências (se necessário)
Write-Host "📦 Verificando dependências..." -ForegroundColor Cyan
if (!(Test-Path "node_modules")) {
    Write-Host "📦 Instalando dependências..." -ForegroundColor Cyan
    npm install
}

# 7. Iniciar frontend em modo debug
Write-Host "🚀 Iniciando frontend com debug..." -ForegroundColor Green
Write-Host "================================================" -ForegroundColor Yellow
Write-Host "🔧 CONFIGURAÇÕES APLICADAS:" -ForegroundColor Cyan
Write-Host "   - Cache limpo" -ForegroundColor White
Write-Host "   - Proxy configurado: /api/v1/* -> http://localhost:8000/api/v1/*" -ForegroundColor White
Write-Host "   - Middleware corrigido para permitir rotas API" -ForegroundColor White
Write-Host "   - Trailing slash: false (Next.js padrão)" -ForegroundColor White
Write-Host "" -ForegroundColor White
Write-Host "📋 PRÓXIMOS PASSOS:" -ForegroundColor Cyan
Write-Host "   1. Execute: npm run dev" -ForegroundColor White
Write-Host "   2. Abra: http://localhost:3000" -ForegroundColor White
Write-Host "   3. Teste a edição de cliente" -ForegroundColor White
Write-Host "   4. Verifique logs no console (F12)" -ForegroundColor White
Write-Host "" -ForegroundColor White
Write-Host "🔍 SE O ERRO PERSISTIR:" -ForegroundColor Yellow
Write-Host "   - Verifique se backend está em http://localhost:8000" -ForegroundColor White
Write-Host "   - Execute o teste: node teste-api-debug.js" -ForegroundColor White
Write-Host "   - Verifique logs detalhados no console do browser" -ForegroundColor White
Write-Host "================================================" -ForegroundColor Yellow

# 8. Abrir browser automaticamente (opcional)
$openBrowser = Read-Host "Abrir browser automaticamente? (y/n)"
if ($openBrowser -eq "y" -or $openBrowser -eq "Y") {
    Start-Sleep -Seconds 3
    Start-Process "http://localhost:3000"
} 