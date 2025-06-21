# Script PowerShell para testar o backend

Write-Host "🔍 Testando conexão com o backend..." -ForegroundColor Yellow
Write-Host ""

# Testar se o backend está respondendo
try {
    $response = Invoke-WebRequest -Uri "http://localhost:8000/api/v1/health" -Method GET -UseBasicParsing -TimeoutSec 5
    Write-Host "✅ Backend está rodando!" -ForegroundColor Green
    Write-Host "   Status: $($response.StatusCode)" -ForegroundColor Gray
} catch {
    Write-Host "❌ Backend NÃO está rodando!" -ForegroundColor Red
    Write-Host ""
    Write-Host "Para iniciar o backend:" -ForegroundColor Yellow
    Write-Host "1. Abra um novo PowerShell"
    Write-Host "2. Execute:"
    Write-Host "   cd C:\Users\ricar\Projetos\Fluyt_Comercial\backend" -ForegroundColor Cyan
    Write-Host "   python main.py" -ForegroundColor Cyan
}

Write-Host ""
Write-Host "Pressione qualquer tecla para sair..."
$null = $Host.UI.RawUI.ReadKey("NoEcho,IncludeKeyDown")