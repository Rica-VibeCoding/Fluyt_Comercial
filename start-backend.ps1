#!/usr/bin/env pwsh
<#
.SYNOPSIS
    Script para iniciar o backend Fluyt Comercial de forma segura
.DESCRIPTION
    Este script verifica e finaliza processos anteriores na porta 8000,
    ativa o ambiente virtual Python e inicia o servidor FastAPI com configurações otimizadas.
.NOTES
    Autor: Fluyt Team
    Versão: 2.0
    Data: 2025-01-20
#>

param(
    [switch]$Force,
    [switch]$Debug,
    [int]$Port = 8000
)

# Configurações
$BackendDir = "backend"
$VenvPath = "$BackendDir\venv"
$MainScript = "$BackendDir\main.py"
$RequirementsFile = "$BackendDir\requirements.txt"

# Cores para output
$Red = [System.ConsoleColor]::Red
$Green = [System.ConsoleColor]::Green
$Yellow = [System.ConsoleColor]::Yellow
$Blue = [System.ConsoleColor]::Blue

function Write-ColorOutput {
    param([string]$Message, [System.ConsoleColor]$Color = [System.ConsoleColor]::White)
    Write-Host $Message -ForegroundColor $Color
}

function Test-Port {
    param([int]$Port)
    try {
        $connection = Test-NetConnection -ComputerName localhost -Port $Port -WarningAction SilentlyContinue
        return $connection.TcpTestSucceeded
    }
    catch {
        return $false
    }
}

function Stop-ProcessOnPort {
    param([int]$Port)
    
    Write-ColorOutput "🔍 Verificando processos na porta $Port..." $Yellow
    
    # Método 1: netstat + taskkill
    try {
        $netstatOutput = netstat -ano | Select-String ":$Port "
        if ($netstatOutput) {
            foreach ($line in $netstatOutput) {
                if ($line -match '\s+(\d+)$') {
                    $pid = $matches[1]
                    Write-ColorOutput "📋 Finalizando processo PID: $pid" $Yellow
                    try {
                        Stop-Process -Id $pid -Force -ErrorAction Stop
                        Write-ColorOutput "✅ Processo $pid finalizado" $Green
                    }
                    catch {
                        Write-ColorOutput "⚠️  Erro ao finalizar processo $pid: $($_.Exception.Message)" $Red
                    }
                }
            }
        }
    }
    catch {
        Write-ColorOutput "⚠️  Erro no netstat: $($_.Exception.Message)" $Red
    }
    
    # Método 2: PowerShell Get-Process
    try {
        $pythonProcesses = Get-Process | Where-Object { 
            $_.ProcessName -like "*python*" -or 
            $_.ProcessName -like "*uvicorn*" -or
            $_.ProcessName -like "*fastapi*"
        }
        
        foreach ($process in $pythonProcesses) {
            try {
                # Verificar se o processo está usando a porta
                $connections = Get-NetTCPConnection -OwningProcess $process.Id -ErrorAction SilentlyContinue | Where-Object { $_.LocalPort -eq $Port }
                if ($connections) {
                    Write-ColorOutput "📋 Finalizando processo Python PID: $($process.Id)" $Yellow
                    Stop-Process -Id $process.Id -Force
                    Write-ColorOutput "✅ Processo Python $($process.Id) finalizado" $Green
                }
            }
            catch {
                # Ignorar erros de acesso
            }
        }
    }
    catch {
        Write-ColorOutput "⚠️  Erro ao verificar processos Python: $($_.Exception.Message)" $Red
    }
    
    # Aguardar liberação da porta
    $maxWait = 10
    $waited = 0
    while ((Test-Port -Port $Port) -and ($waited -lt $maxWait)) {
        Write-ColorOutput "⏳ Aguardando liberação da porta $Port... ($waited/$maxWait)" $Yellow
        Start-Sleep -Seconds 1
        $waited++
    }
    
    if (Test-Port -Port $Port) {
        Write-ColorOutput "❌ Porta $Port ainda está ocupada após $maxWait segundos" $Red
        if (-not $Force) {
            Write-ColorOutput "💡 Use -Force para tentar iniciar mesmo assim" $Yellow
            return $false
        }
    } else {
        Write-ColorOutput "✅ Porta $Port liberada" $Green
    }
    
    return $true
}

function Test-PythonEnvironment {
    Write-ColorOutput "🐍 Verificando ambiente Python..." $Blue
    
    # Verificar se o diretório backend existe
    if (-not (Test-Path $BackendDir)) {
        Write-ColorOutput "❌ Diretório backend não encontrado" $Red
        return $false
    }
    
    # Verificar arquivo principal
    if (-not (Test-Path $MainScript)) {
        Write-ColorOutput "❌ Arquivo main.py não encontrado em $MainScript" $Red
        return $false
    }
    
    # Verificar venv
    if (-not (Test-Path $VenvPath)) {
        Write-ColorOutput "⚠️  Ambiente virtual não encontrado em $VenvPath" $Yellow
        Write-ColorOutput "💡 Criando ambiente virtual..." $Blue
        
        try {
            Set-Location $BackendDir
            python -m venv venv
            Write-ColorOutput "✅ Ambiente virtual criado" $Green
        }
        catch {
            Write-ColorOutput "❌ Erro ao criar ambiente virtual: $($_.Exception.Message)" $Red
            return $false
        }
        finally {
            Set-Location ..
        }
    }
    
    return $true
}

function Install-Dependencies {
    Write-ColorOutput "📦 Verificando dependências..." $Blue
    
    try {
        Set-Location $BackendDir
        
        # Ativar venv
        if ($IsWindows -or $env:OS -eq "Windows_NT") {
            & ".\venv\Scripts\Activate.ps1"
        } else {
            & "source ./venv/bin/activate"
        }
        
        # Verificar se requirements.txt existe
        if (Test-Path $RequirementsFile) {
            Write-ColorOutput "📋 Instalando dependências do requirements.txt..." $Blue
            pip install -r requirements.txt --quiet
            Write-ColorOutput "✅ Dependências instaladas" $Green
        } else {
            Write-ColorOutput "⚠️  Arquivo requirements.txt não encontrado" $Yellow
        }
    }
    catch {
        Write-ColorOutput "❌ Erro ao instalar dependências: $($_.Exception.Message)" $Red
        return $false
    }
    finally {
        Set-Location ..
    }
    
    return $true
}

function Start-Backend {
    Write-ColorOutput "🚀 Iniciando backend Fluyt Comercial..." $Green
    
    try {
        Set-Location $BackendDir
        
        # Configurar variáveis de ambiente
        $env:PYTHONPATH = (Get-Location).Path
        $env:PYTHONUNBUFFERED = "1"
        
        # Verificar arquivo .env
        if (Test-Path ".env") {
            Write-ColorOutput "✅ Arquivo .env encontrado" $Green
        } else {
            Write-ColorOutput "⚠️  Arquivo .env não encontrado - algumas funcionalidades podem não funcionar" $Yellow
        }
        
        Write-ColorOutput "=" * 60 $Blue
        Write-ColorOutput "🌐 Backend rodando em: http://localhost:$Port" $Green
        Write-ColorOutput "📚 Documentação: http://localhost:$Port/docs" $Green
        Write-ColorOutput "🔧 Redoc: http://localhost:$Port/redoc" $Green
        Write-ColorOutput "❤️  Health Check: http://localhost:$Port/health" $Green
        Write-ColorOutput "=" * 60 $Blue
        Write-ColorOutput "💡 Pressione Ctrl+C para parar o servidor" $Yellow
        Write-ColorOutput "=" * 60 $Blue
        
        # Ativar ambiente virtual e iniciar servidor
        if ($IsWindows -or $env:OS -eq "Windows_NT") {
            & ".\venv\Scripts\python.exe" -m uvicorn main:app --host 0.0.0.0 --port $Port --reload $(if ($Debug) { "--log-level debug" } else { "--log-level info" })
        } else {
            & "./venv/bin/python" -m uvicorn main:app --host 0.0.0.0 --port $Port --reload $(if ($Debug) { "--log-level debug" } else { "--log-level info" })
        }
    }
    catch {
        Write-ColorOutput "❌ Erro ao iniciar backend: $($_.Exception.Message)" $Red
        return $false
    }
    finally {
        Set-Location ..
    }
    
    return $true
}

# Execução principal
Write-ColorOutput "🎯 Fluyt Comercial - Inicializador de Backend v2.0" $Blue
Write-ColorOutput "=" * 60 $Blue

# Verificar se estamos no diretório correto
if (-not (Test-Path "backend") -and -not (Test-Path "Frontend")) {
    Write-ColorOutput "❌ Execute este script na raiz do projeto Fluyt_Comercial" $Red
    exit 1
}

# Parar processos na porta
if (-not (Stop-ProcessOnPort -Port $Port)) {
    Write-ColorOutput "❌ Não foi possível liberar a porta $Port" $Red
    exit 1
}

# Verificar ambiente Python
if (-not (Test-PythonEnvironment)) {
    Write-ColorOutput "❌ Ambiente Python não está configurado corretamente" $Red
    exit 1
}

# Instalar dependências
if (-not (Install-Dependencies)) {
    Write-ColorOutput "❌ Erro ao configurar dependências" $Red
    exit 1
}

# Iniciar backend
if (-not (Start-Backend)) {
    Write-ColorOutput "❌ Erro ao iniciar backend" $Red
    exit 1
}

Write-ColorOutput "✅ Backend finalizado com sucesso" $Green 