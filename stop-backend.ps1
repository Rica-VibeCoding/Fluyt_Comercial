#!/usr/bin/env pwsh
<#
.SYNOPSIS
    Script para parar o backend Fluyt Comercial de forma segura
.DESCRIPTION
    Versão simplificada que realmente funciona - para processos Python na porta 8000
.NOTES
    Autor: Fluyt Team
    Versão: 2.0 (Simplificada)
    Data: 2025-01-21
#>

param(
    [int]$Port = 8000,
    [switch]$Force
)

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
        $connection = Test-NetConnection -ComputerName localhost -Port $Port -WarningAction SilentlyContinue -InformationLevel Quiet
        return $connection
    }
    catch {
        return $false
    }
}

function Stop-BackendProcesses {
    param([int]$Port)
    
    $processesKilled = 0
    
    Write-ColorOutput "Parando backend na porta $Port..." $Yellow
    
    # Método 1: Usar taskkill diretamente para processos Python
    try {
        Write-ColorOutput "Finalizando processos Python..." $Blue
        $result = taskkill /f /im python.exe 2>$null
        if ($LASTEXITCODE -eq 0) {
            Write-ColorOutput "Processos Python finalizados com taskkill" $Green
            $processesKilled++
        }
    }
    catch {
        # Ignorar erro se não houver processos
    }
    
    # Método 2: PowerShell Get-Process (mais específico)
    try {
        $pythonProcesses = Get-Process -Name "python" -ErrorAction SilentlyContinue
        
        if ($pythonProcesses) {
            Write-ColorOutput "Finalizando processos Python restantes..." $Blue
            foreach ($process in $pythonProcesses) {
                try {
                    Write-ColorOutput "   Finalizando PID: $($process.Id)" $Yellow
                    Stop-Process -Id $process.Id -Force -ErrorAction Stop
                    Write-ColorOutput "   Processo $($process.Id) finalizado" $Green
                    $processesKilled++
                }
                catch {
                    # Processo já pode ter sido finalizado
                }
            }
        }
    }
    catch {
        # Ignorar erros
    }
    
    # Método 3: Se ainda estiver ocupado, usar netstat + taskkill
    if (Test-Port -Port $Port) {
        try {
            Write-ColorOutput "Porta ainda ocupada, usando netstat..." $Yellow
            $netstatOutput = netstat -ano | findstr ":$Port "
            if ($netstatOutput) {
                $lines = $netstatOutput -split "`n"
                foreach ($line in $lines) {
                    if ($line -match '\s+(\d+)\s*$') {
                        $processId = $matches[1].Trim()
                        try {
                            Write-ColorOutput "   Finalizando processo na porta: $processId" $Yellow
                            taskkill /f /pid $processId 2>$null
                            if ($LASTEXITCODE -eq 0) {
                                Write-ColorOutput "   Processo $processId finalizado" $Green
                                $processesKilled++
                            }
                        }
                        catch {
                            # Ignorar erros
                        }
                    }
                }
            }
        }
        catch {
            Write-ColorOutput "Erro ao usar netstat: $($_.Exception.Message)" $Red
        }
    }
    
    return $processesKilled
}

function Show-FinalStatus {
    param([int]$Port)
    
    Write-ColorOutput "Verificando status final..." $Blue
    Start-Sleep -Seconds 2
    
    if (Test-Port -Port $Port) {
        Write-ColorOutput "   Porta $Port ainda OCUPADA" $Red
        
        # Última tentativa com Force
        if ($Force) {
            Write-ColorOutput "Tentativa final com FORCE..." $Yellow
            taskkill /f /im python.exe 2>$null
            taskkill /f /im uvicorn.exe 2>$null
            Start-Sleep -Seconds 2
            
            if (Test-Port -Port $Port) {
                Write-ColorOutput "   Porta ainda ocupada mesmo com FORCE" $Red
                Write-ColorOutput "   Pode ser necessário reiniciar o terminal" $Yellow
            } else {
                Write-ColorOutput "   Porta liberada com FORCE" $Green
            }
        } else {
            Write-ColorOutput "   Use -Force para tentativa mais agressiva" $Blue
        }
    } else {
        Write-ColorOutput "   Porta $Port LIVRE" $Green
    }
}

# Execução principal
Write-ColorOutput "Backend Stop - Fluyt Comercial v2.0" $Blue
Write-ColorOutput "==========================================" $Blue

# Verificar se há algo rodando na porta
if (-not (Test-Port -Port $Port)) {
    Write-ColorOutput "Porta $Port já está livre" $Green
    Write-ColorOutput "Backend já está parado" $Blue
    exit 0
}

Write-ColorOutput "Porta $Port está ocupada - iniciando parada..." $Yellow

# Parar processos
$killed = Stop-BackendProcesses -Port $Port

# Mostrar resultado
Write-ColorOutput "==========================================" $Blue

if ($killed -gt 0) {
    Write-ColorOutput "$killed tentativa(s) de finalização executada(s)" $Green
} else {
    Write-ColorOutput "Nenhum processo foi finalizado" $Yellow
}

# Status final
Show-FinalStatus -Port $Port

Write-ColorOutput "==========================================" $Blue

if (-not (Test-Port -Port $Port)) {
    Write-ColorOutput "Backend parado com sucesso!" $Green
} else {
    Write-ColorOutput "Backend pode ainda estar rodando" $Yellow
    Write-ColorOutput "Tente: Ctrl+C no terminal do backend" $Blue
}

Write-ColorOutput "==========================================" $Blue 