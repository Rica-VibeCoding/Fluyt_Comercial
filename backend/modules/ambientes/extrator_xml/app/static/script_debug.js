// ===================================
// SCRIPT DE DEBUG - EXTRATOR XML
// ===================================

console.log('🔧 Script de debug carregado');

// Estado global
let debugState = {
    processandoArquivo: false,
    elementos: {},
    logs: [],
    tentativas: 0
};

// Função para log detalhado
function debugLog(mensagem, dados = null) {
    const timestamp = new Date().toISOString().split('T')[1].split('.')[0];
    const logEntry = `[${timestamp}] ${mensagem}`;
    
    console.log(logEntry, dados || '');
    debugState.logs.push({ timestamp, mensagem, dados });
    
    // Mostrar logs na tela também
    updateDebugPanel();
}

// Painel de debug na tela
function createDebugPanel() {
    const panel = document.createElement('div');
    panel.id = 'debugPanel';
    panel.style.cssText = `
        position: fixed;
        top: 10px;
        right: 10px;
        width: 400px;
        max-height: 300px;
        background: #2c3e50;
        color: white;
        padding: 15px;
        border-radius: 8px;
        font-family: monospace;
        font-size: 12px;
        z-index: 9999;
        overflow-y: auto;
        box-shadow: 0 4px 8px rgba(0,0,0,0.3);
    `;
    
    panel.innerHTML = `
        <div style="font-weight: bold; margin-bottom: 10px; color: #3498db;">
            🔧 DEBUG PANEL
            <button onclick="clearDebugLogs()" style="float: right; background: #e74c3c; color: white; border: none; padding: 2px 8px; border-radius: 3px; cursor: pointer;">Clear</button>
        </div>
        <div id="debugContent">Iniciando diagnósticos...</div>
    `;
    
    document.body.appendChild(panel);
    debugLog('✅ Painel de debug criado');
}

function updateDebugPanel() {
    const content = document.getElementById('debugContent');
    if (!content) return;
    
    const lastLogs = debugState.logs.slice(-10); // Últimos 10 logs
    content.innerHTML = lastLogs.map(log => 
        `<div style="margin: 2px 0; padding: 2px; background: rgba(255,255,255,0.1); border-radius: 2px;">
            ${log.mensagem}
        </div>`
    ).join('');
}

function clearDebugLogs() {
    debugState.logs = [];
    updateDebugPanel();
    debugLog('🧹 Logs limpos');
}

// Diagnóstico completo do sistema
function diagnosticarSistema() {
    debugLog('🔍 Iniciando diagnóstico completo...');
    
    // 1. Verificar elementos DOM
    const elementos = {
        uploadArea: document.getElementById('uploadArea'),
        fileInput: document.getElementById('fileInput'),
        selectFileBtn: document.getElementById('selectFileBtn'),
        selectFileLbl: document.getElementById('selectFileLbl')
    };
    
    debugState.elementos = elementos;
    
    Object.entries(elementos).forEach(([nome, elemento]) => {
        if (elemento) {
            debugLog(`✅ ${nome}: Encontrado`, {
                id: elemento.id,
                tagName: elemento.tagName,
                type: elemento.type,
                display: getComputedStyle(elemento).display,
                visibility: getComputedStyle(elemento).visibility
            });
        } else {
            debugLog(`❌ ${nome}: NÃO ENCONTRADO`);
        }
    });
    
    // 2. Verificar capacidades do navegador
    debugLog('🌐 Informações do navegador:', {
        userAgent: navigator.userAgent,
        cookieEnabled: navigator.cookieEnabled,
        language: navigator.language,
        platform: navigator.platform
    });
    
    // 3. Verificar APIs disponíveis
    const apis = {
        File: typeof File !== 'undefined',
        FileReader: typeof FileReader !== 'undefined',
        FormData: typeof FormData !== 'undefined',
        fetch: typeof fetch !== 'undefined'
    };
    
    debugLog('🔌 APIs disponíveis:', apis);
    
    // 4. Testar criação de input temporário
    testarInputTemporario();
    
    return debugState;
}

function testarInputTemporario() {
    debugLog('🧪 Testando criação de input temporário...');
    
    try {
        const tempInput = document.createElement('input');
        tempInput.type = 'file';
        tempInput.accept = '.xml';
        tempInput.style.cssText = 'position: fixed; top: -1000px; opacity: 0;';
        
        document.body.appendChild(tempInput);
        debugLog('✅ Input temporário criado com sucesso');
        
        // Testar evento
        tempInput.addEventListener('change', () => {
            debugLog('✅ Evento change do input temporário funciona');
        });
        
        // Remover após teste
        setTimeout(() => {
            document.body.removeChild(tempInput);
            debugLog('✅ Input temporário removido');
        }, 100);
        
    } catch (error) {
        debugLog('❌ Erro ao criar input temporário:', error.message);
    }
}

// Função simplificada para abrir arquivo
function abrirArquivoSimples() {
    debugState.tentativas++;
    debugLog(`🎯 Tentativa ${debugState.tentativas} de abrir arquivo`);
    
    const fileInput = debugState.elementos.fileInput;
    
    if (!fileInput) {
        debugLog('❌ fileInput não encontrado');
        return false;
    }
    
    if (debugState.processandoArquivo) {
        debugLog('⏸️ Já processando arquivo, ignorando');
        return false;
    }
    
    debugLog('🔄 Executando fileInput.click()...');
    
    try {
        // Método 1: Click direto
        fileInput.click();
        debugLog('✅ fileInput.click() executado sem erro');
        
        // Verificar se realmente abriu (não há como detectar diretamente)
        setTimeout(() => {
            debugLog('⏰ Verificando se diálogo abriu (timeout 1s)');
        }, 1000);
        
        return true;
        
    } catch (error) {
        debugLog('❌ Erro no fileInput.click():', error.message);
        return false;
    }
}

// Método alternativo com label
function abrirArquivoViaLabel() {
    debugLog('🏷️ Tentando método via label...');
    
    const label = debugState.elementos.selectFileLbl;
    if (!label) {
        debugLog('❌ Label não encontrado');
        return false;
    }
    
    label.style.display = 'inline-block';
    label.style.background = '#27ae60';
    label.textContent = '✅ Use Este Botão';
    
    debugLog('✅ Label alternativo ativado');
    return true;
}

// Método com input completamente novo
function criarInputNovo() {
    debugLog('🆕 Criando input completamente novo...');
    
    try {
        const novoInput = document.createElement('input');
        novoInput.type = 'file';
        novoInput.accept = '.xml';
        novoInput.multiple = false;
        
        // Estilo para debug (visível)
        novoInput.style.cssText = `
            position: fixed;
            top: 50px;
            right: 50px;
            z-index: 10000;
            padding: 10px;
            background: #e74c3c;
            color: white;
            border: 2px solid #c0392b;
            border-radius: 5px;
            cursor: pointer;
        `;
        
        novoInput.addEventListener('change', (e) => {
            const file = e.target.files[0];
            if (file) {
                debugLog('🎉 Arquivo selecionado via input novo:', file.name);
                processarArquivoDebug(file);
            }
            
            // Remover após uso
            setTimeout(() => {
                if (document.body.contains(novoInput)) {
                    document.body.removeChild(novoInput);
                    debugLog('🗑️ Input novo removido');
                }
            }, 1000);
        });
        
        document.body.appendChild(novoInput);
        debugLog('✅ Input novo criado e adicionado ao DOM');
        
        // Auto-remover após 30 segundos
        setTimeout(() => {
            if (document.body.contains(novoInput)) {
                document.body.removeChild(novoInput);
                debugLog('⏰ Input novo removido por timeout');
            }
        }, 30000);
        
        return true;
        
    } catch (error) {
        debugLog('❌ Erro ao criar input novo:', error.message);
        return false;
    }
}

// Processamento simplificado para debug
function processarArquivoDebug(file) {
    debugLog('📁 Processando arquivo:', {
        name: file.name,
        size: file.size,
        type: file.type,
        lastModified: new Date(file.lastModified).toISOString()
    });
    
    debugState.processandoArquivo = true;
    
    // Simular processamento
    setTimeout(() => {
        debugState.processandoArquivo = false;
        debugLog('✅ Processamento concluído (simulado)');
    }, 2000);
}

// Inicialização quando DOM carregar
document.addEventListener('DOMContentLoaded', function() {
    debugLog('📄 DOM carregado, iniciando sistema de debug');
    
    // Criar painel de debug
    createDebugPanel();
    
    // Diagnóstico inicial
    setTimeout(() => {
        diagnosticarSistema();
    }, 500);
    
    // Configurar botão principal com debug
    const selectFileBtn = document.getElementById('selectFileBtn');
    if (selectFileBtn) {
        selectFileBtn.addEventListener('click', function(e) {
            debugLog('🖱️ Clique no botão detectado');
            
            if (!abrirArquivoSimples()) {
                debugLog('⚠️ Método principal falhou, tentando alternativas...');
                
                setTimeout(() => {
                    if (!abrirArquivoViaLabel()) {
                        debugLog('⚠️ Label também falhou, criando input novo...');
                        criarInputNovo();
                    }
                }, 100);
            }
        });
        
        debugLog('✅ Event listener do botão configurado');
    }
});

// Expor funções globalmente para debug manual
window.debugExtractor = {
    diagnosticar: diagnosticarSistema,
    abrirArquivo: abrirArquivoSimples,
    abrirViaLabel: abrirArquivoViaLabel,
    criarInputNovo: criarInputNovo,
    estado: () => debugState,
    logs: () => debugState.logs,
    limparLogs: clearDebugLogs
};

debugLog('🚀 Sistema de debug inicializado'); 