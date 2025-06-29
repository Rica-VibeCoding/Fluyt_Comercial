// Estado global da aplicação
let resultadosExtracao = null;
let processandoArquivo = false; // Previne duplo processamento
let ultimoArquivoProcessado = null;
let ultimoTimestamp = 0;

// Configuração da API
const API_BASE = 'http://localhost:8000';

// Elementos DOM (serão inicializados após o DOM carregar)
let uploadArea, fileInput, loading, results, actions, successMessage;

// Event listeners
document.addEventListener('DOMContentLoaded', function() {
    console.log('🚀 DOM Carregado - Inicializando aplicação');
    
    // Inicializar elementos DOM
    uploadArea = document.getElementById('uploadArea');
    fileInput = document.getElementById('fileInput');
    loading = document.getElementById('loading');
    results = document.getElementById('results');
    actions = document.getElementById('actions');
    successMessage = document.getElementById('successMessage');
    
    // Verificar se todos os elementos foram encontrados
    console.log('📋 Elementos DOM:', {
        uploadArea: !!uploadArea,
        fileInput: !!fileInput,
        loading: !!loading,
        results: !!results,
        actions: !!actions,
        successMessage: !!successMessage
    });
    
    if (!uploadArea || !fileInput) {
        console.error('❌ Elementos DOM críticos não encontrados!');
        return;
    }
    
    setupEventListeners();
    verificarResultadosSalvos();
});

function setupEventListeners() {
    console.log('🔧 Configurando event listeners');
    
    // Drag and drop
    uploadArea.addEventListener('dragover', handleDragOver);
    uploadArea.addEventListener('dragleave', handleDragLeave);
    uploadArea.addEventListener('drop', handleDrop);
    
    // Label selecionar arquivo (agora é um label, não precisa de listener especial)
    const selectFileBtn = document.getElementById('selectFileBtn');
    if (selectFileBtn) {
        console.log('✅ Label do arquivo configurado (funciona nativamente)');
    } else {
        console.error('❌ Label selectFileBtn não encontrado');
    }
    
    // Click na área de upload removido - evita conflito com onclick do botão
    
    // File input - CORREÇÃO CRÍTICA
    fileInput.addEventListener('change', handleFileSelect);
    
    // Debug: Verificar se o label está funcionando
    fileInput.addEventListener('click', function() {
        console.log('🎯 Input de arquivo foi clicado - diálogo deve abrir');
    });
    
    // Método alternativo via teclado
    document.addEventListener('keydown', (e) => {
        if (e.ctrlKey && e.key === 'o') {
            e.preventDefault();
            console.log('⌨️ Ctrl+O pressionado - abrindo arquivo');
            triggerFileDialog();
        }
    });
    
    console.log('✅ Event listeners configurados');
}



// Função removida - agora usamos <label> nativo que funciona automaticamente

// Função removida - conflito de event propagation eliminado

// Variável para prevenir múltiplas chamadas simultâneas
let dialogoAberto = false;

function triggerFileDialog() {
    console.log('📂 Abrindo diálogo de seleção de arquivo');
    
    if (processandoArquivo || dialogoAberto) {
        console.log('⏳ Já processando ou diálogo aberto, ignorando');
        return;
    }
    
    if (!fileInput) {
        console.error('❌ fileInput não encontrado');
        return;
    }
    
    // Marcar como aberto
    dialogoAberto = true;
    
    try {
        // Resetar valor para permitir seleção do mesmo arquivo
        fileInput.value = '';
        
        // Método simples e direto
        fileInput.click();
        console.log('✅ fileInput.click() executado');
        
    } catch (error) {
        console.error('❌ Erro ao abrir diálogo:', error);
        
        // Fallback: Criar novo input temporário
        const tempInput = document.createElement('input');
        tempInput.type = 'file';
        tempInput.accept = '.xml';
        tempInput.style.position = 'absolute';
        tempInput.style.left = '-9999px';
        tempInput.style.opacity = '0';
        
        tempInput.addEventListener('change', function(e) {
            const file = e.target.files[0];
            if (file) {
                console.log('📄 Arquivo selecionado via fallback:', file.name);
                processarArquivo(file);
            }
            document.body.removeChild(tempInput);
            dialogoAberto = false;
        });
        
        document.body.appendChild(tempInput);
        tempInput.click();
        console.log('🔄 Fallback executado');
    }
    
    // Liberar após um tempo
    setTimeout(() => {
        dialogoAberto = false;
    }, 1000);
}

function handleFileSelect(e) {
    console.log('📄 handleFileSelect chamado');
    e.stopPropagation();
    
    const file = e.target.files[0];
    if (file && !processandoArquivo) {
        console.log('📄 Arquivo selecionado:', file.name);
        processarArquivo(file);
    } else if (!file) {
        console.log('❌ Nenhum arquivo selecionado');
    } else {
        console.log('⏳ Já processando arquivo');
    }
}

function handleDragOver(e) {
    e.preventDefault();
    e.stopPropagation();
    uploadArea.classList.add('dragover');
}

function handleDragLeave(e) {
    e.preventDefault();
    e.stopPropagation();
    uploadArea.classList.remove('dragover');
}

function handleDrop(e) {
    e.preventDefault();
    e.stopPropagation();
    uploadArea.classList.remove('dragover');
    
    const files = e.dataTransfer.files;
    if (files.length > 0) {
        console.log('📁 Arquivo arrastado:', files[0].name);
        processarArquivo(files[0]);
    }
}

async function processarArquivo(file) {
    console.log('🔄 === INICIANDO PROCESSAMENTO ===');
    console.log('📄 Arquivo:', file.name, '| Tamanho:', file.size, 'bytes');
    
    // CORREÇÃO CRÍTICA: Verificar se já está processando ANTES de qualquer ação
    if (processandoArquivo) {
        console.log('⏳ Já processando arquivo, ignorando nova tentativa');
        return;
    }
    
    // Debounce - previne duplo processamento do mesmo arquivo
    const agora = Date.now();
    if (file === ultimoArquivoProcessado && (agora - ultimoTimestamp) < 2000) {
        console.log('⏳ Debounce: mesmo arquivo recentemente processado');
        return;
    }
    
    // Marcar como processando IMEDIATAMENTE
    processandoArquivo = true;
    ultimoArquivoProcessado = file;
    ultimoTimestamp = agora;
    
    // Validar tipo de arquivo
    if (!file.name.toLowerCase().endsWith('.xml')) {
        mostrarErro('❌ Por favor, selecione um arquivo XML válido.');
        processandoArquivo = false;
        return;
    }
    
    // Limpar estado anterior
    resultadosExtracao = null;
    
    // Mostrar loading e esconder outros elementos
    mostrarLoading(true);
    
    try {
        console.log('📤 Enviando arquivo para API...');
        
        // Criar FormData
        const formData = new FormData();
        formData.append('file', file);
        
        // Fazer requisição
        const response = await fetch(`${API_BASE}/api/extract-file`, {
            method: 'POST',
            body: formData
        });
        
        console.log('📥 Resposta da API:', response.status, response.statusText);
        
        if (!response.ok) {
            const errorText = await response.text();
            throw new Error(`Erro HTTP ${response.status}: ${errorText}`);
        }
        
        const resultado = await response.json();
        console.log('✅ Dados recebidos da API:', resultado);
        
        // Armazenar resultado
        resultadosExtracao = resultado;
        
        // Exibir resultados
        exibirResultados(resultado);
        
        // Mostrar ações
        mostrarAcoes(true);
        
    } catch (error) {
        console.error('❌ Erro ao processar arquivo:', error);
        mostrarErro(`Erro ao processar arquivo: ${error.message}`);
    } finally {
        // SEMPRE liberar processamento
        processandoArquivo = false;
        mostrarLoading(false);
        
        console.log('✅ Processamento finalizado');
    }
}

function mostrarLoading(mostrar) {
    if (mostrar) {
        uploadArea.classList.add('processing');
        loading.style.display = 'block';
        results.style.display = 'none';
        actions.style.display = 'none';
        successMessage.style.display = 'none';
    } else {
        uploadArea.classList.remove('processing');
        loading.style.display = 'none';
    }
}

function mostrarAcoes(mostrar) {
    if (mostrar && resultadosExtracao && resultadosExtracao.success) {
        actions.style.display = 'block';
    } else {
        actions.style.display = 'none';
    }
}

function temDadosReais(dados) {
    /**
     * Verifica se um objeto tem dados reais (não apenas campos null/undefined/vazios)
     * @param {Object} dados - Objeto a verificar
     * @returns {boolean} - true se tem dados úteis
     */
    if (!dados || typeof dados !== 'object') return false;
    
    // Verificar se pelo menos um campo tem valor não nulo/vazio
    return Object.values(dados).some(value => {
        if (Array.isArray(value)) return value.length > 0;
        return value !== null && value !== undefined && value !== '';
    });
}

function exibirResultados(resultado) {
    console.log('🎨 === EXIBINDO RESULTADOS ===');
    console.log('📊 Resultado completo:', resultado);
    
    const container = document.getElementById('results');
    if (!container) {
        console.error('❌ Container de resultados não encontrado');
        return;
    }
    
    // Limpar container
    container.innerHTML = '';
    
    if (!resultado.success) {
        console.log('❌ Extração falhou:', resultado.error);
        container.innerHTML = `
            <div class="result-card error">
                <h3>❌ Erro na Extração</h3>
                <p>${resultado.error || 'Erro desconhecido'}</p>
            </div>
        `;
        results.style.display = 'block';
        return;
    }
    
    // Cabeçalho com informações da linha
    let headerHtml = `
        <div class="header">
            <h1>📋 Resultado da Extração</h1>
            <div class="ambiente-info">
                <strong>🏠 Ambiente:</strong> 
                <span class="badge-ambiente">${resultado.nome_ambiente || 'Não identificado'}</span>
            </div>
            <div class="linha-info">
                <strong>Linha(s) Detectada(s):</strong> 
                <span class="badge">${resultado.linha_detectada || 'Não detectada'}</span>
        </div>
        </div>
    `;
    
    container.innerHTML = headerHtml;
    
    let secaoesRenderizadas = 0;
    
    // Renderizar cada seção apenas se tiver dados reais
    if (resultado.caixa && temDadosReais(resultado.caixa)) {
        console.log('✅ Renderizando 📦 Caixa');
        container.innerHTML += renderizarCaixa(resultado.caixa);
        secaoesRenderizadas++;
    }
    
    if (resultado.paineis && temDadosReais(resultado.paineis)) {
        console.log('✅ Renderizando 🪵 Painéis');
        container.innerHTML += renderizarPaineis(resultado.paineis);
        secaoesRenderizadas++;
    }
    
    if (resultado.portas && temDadosReais(resultado.portas)) {
        console.log('✅ Renderizando 🚪 Portas');
        container.innerHTML += renderizarPortas(resultado.portas);
        secaoesRenderizadas++;
    }
    
    if (resultado.ferragens && temDadosReais(resultado.ferragens)) {
        console.log('✅ Renderizando 🔧 Ferragens');
        container.innerHTML += renderizarFerragens(resultado.ferragens);
        secaoesRenderizadas++;
    }
    
    if (resultado.porta_perfil && temDadosReais(resultado.porta_perfil)) {
        console.log('✅ Renderizando 🪟 Porta Perfil');
        container.innerHTML += renderizarPortaPerfil(resultado.porta_perfil);
        secaoesRenderizadas++;
    }
    
    if (resultado.brilhart_color && temDadosReais(resultado.brilhart_color)) {
        console.log('✅ Renderizando ✨ Brilhart Color');
        container.innerHTML += renderizarBrilhartColor(resultado.brilhart_color);
        secaoesRenderizadas++;
    }
    
    if (resultado.valor_total && temDadosReais(resultado.valor_total)) {
        console.log('✅ Renderizando 💰 Valor Total');
        container.innerHTML += renderizarValorTotal(resultado.valor_total);
        secaoesRenderizadas++;
    }
    
    console.log(`📊 Total de seções renderizadas: ${secaoesRenderizadas}`);
    
    if (secaoesRenderizadas === 0) {
        container.innerHTML += `
            <div class="result-card error">
                <h3>⚠️ Nenhum Dado Encontrado</h3>
                <p>O arquivo XML não contém dados válidos para extração.</p>
            </div>
        `;
    }
    
    // Mostrar container de resultados
    results.style.display = 'block';
    console.log('✅ Resultados exibidos com sucesso');
}

function mostrarErro(mensagem) {
    console.error('❌ Erro:', mensagem);
    
    const container = document.getElementById('results');
    container.innerHTML = `
        <div class="result-card error">
            <h3>❌ Erro</h3>
            <p>${mensagem}</p>
        </div>
    `;
    
    results.style.display = 'block';
}

function salvarResultados() {
    if (!resultadosExtracao) {
        mostrarErro('Nenhum resultado para salvar.');
        return;
    }
    
    try {
        // Salvar no localStorage
        const timestamp = new Date().toISOString();
        const dadosParaSalvar = {
            timestamp,
            resultado: resultadosExtracao,
            arquivo: fileInput.files[0]?.name || 'arquivo.xml'
        };
        
        const chave = `extrator_xml_${timestamp}`;
        localStorage.setItem(chave, JSON.stringify(dadosParaSalvar));
        
        // Salvar lista de extrações
        const listaExtracoes = JSON.parse(localStorage.getItem('lista_extracoes') || '[]');
        listaExtracoes.push({
            chave,
            timestamp,
            arquivo: dadosParaSalvar.arquivo,
            linha: resultadosExtracao.linha_detectada,
            secoes: resultadosExtracao.metadata?.sections_extracted?.length || 0
        });
        localStorage.setItem('lista_extracoes', JSON.stringify(listaExtracoes));
        
        // Mostrar mensagem de sucesso
        successMessage.style.display = 'block';
        setTimeout(() => {
            successMessage.style.display = 'none';
        }, 3000);
        
    } catch (error) {
        console.error('Erro ao salvar:', error);
        mostrarErro('Erro ao salvar resultados no localStorage.');
    }
}

function resetar() {
    // Limpar formulário
    fileInput.value = '';
    resultadosExtracao = null;
    
    // Esconder elementos
    results.style.display = 'none';
    actions.style.display = 'none';
    loading.style.display = 'none';
    successMessage.style.display = 'none';
    
    // Resetar área de upload
    uploadArea.classList.remove('processing', 'dragover');
}

function verificarResultadosSalvos() {
    const listaExtracoes = JSON.parse(localStorage.getItem('lista_extracoes') || '[]');
    
    if (listaExtracoes.length > 0) {
        console.log(`${listaExtracoes.length} extrações salvas encontradas no localStorage`);
        
        // Opcional: Mostrar últimas extrações
        const ultimaExtracao = listaExtracoes[listaExtracoes.length - 1];
        console.log('Última extração:', ultimaExtracao);
    }
}

// Função para listar extrações salvas (para debug)
function listarExtracoesSalvas() {
    const lista = JSON.parse(localStorage.getItem('lista_extracoes') || '[]');
    console.table(lista);
    return lista;
}

// Função para recuperar extração específica (para debug)
function recuperarExtracao(chave) {
    return JSON.parse(localStorage.getItem(chave));
}



// Expor funções para debug no console (simplificado)
window.debugExtractor = {
    listarExtracoesSalvas,
    recuperarExtracao,
    resultadosExtracao: () => resultadosExtracao,
    getElements: () => ({
        uploadArea,
        fileInput, 
        loading,
        results,
        actions,
        successMessage
    }),
    forceFileDialog: () => {
        if (fileInput) {
            fileInput.value = '';
            fileInput.click();
        }
    }
};

function renderizarValorTotal(dados) {
    /**
     * Renderiza seção Valor Total - MÁXIMO SIMPLIFICADO
     * Mostra apenas: Custo Fábrica e Valor Venda (já formatados)
     */
    console.log('🔍 Renderizando Valor Total:', dados);
    
    let html = `
        <div class="section">
            <h2>💰 Valor Total</h2>
            <div class="content">
    `;
    
    // Custo de Fábrica
    if (dados.custo_fabrica) {
        html += `
            <div class="item highlight-custo">
                <span class="label">Custo Fábrica:</span>
                <span class="value">${dados.custo_fabrica}</span>
            </div>
        `;
    }
    
    // Valor de Venda
    if (dados.valor_venda) {
        html += `
            <div class="item highlight-venda">
                <span class="label">Valor Venda:</span>
                <span class="value">${dados.valor_venda}</span>
            </div>
        `;
    }
    
    html += `
            </div>
        </div>
    `;
    
    return html;
}

function renderizarCaixa(dados) {
    /**
     * Renderiza seção Caixa apenas se existir dados válidos
     */
    console.log('🔍 Verificando dados de Caixa:', dados);
    
    // Verifica se existe dados válidos para renderizar caixa
    if (!dados || (!dados.espessura && !dados.material && !dados.cor)) {
        console.log('❌ Sem dados de caixa/corpo - não renderizando');
        return '';
    }
    
    console.log('✅ Renderizando Caixa com dados válidos');
    
    let html = `
        <div class="section">
            <h2>📦 Caixa</h2>
            <div class="content">
    `;
    
    if (dados.espessura) {
        html += `
            <div class="item">
                <span class="label">Espessura:</span>
                <span class="value">${dados.espessura}</span>
            </div>
        `;
    }
    
    if (dados.material) {
        html += `
            <div class="item">
                <span class="label">Material:</span>
                <span class="value">${dados.material}</span>
            </div>
        `;
    }
    
    if (dados.cor) {
        html += `
            <div class="item">
                <span class="label">Cor:</span>
                <span class="value">${dados.cor}</span>
            </div>
        `;
    }
    
    html += `
            </div>
        </div>
    `;
    
    return html;
}

function renderizarPaineis(dados) {
    /**
     * Renderiza seção Painéis com suporte a múltiplas linhas
     */
    console.log('🔍 Renderizando Painéis:', dados);
    
    let html = `
        <div class="section">
            <h2>🪵 Painéis</h2>
            <div class="content">
    `;
    
    if (dados.material) {
        html += `
            <div class="item">
                <span class="label">Material:</span>
                <span class="value">${dados.material}</span>
            </div>
        `;
    }
    
    if (dados.espessura) {
        html += `
            <div class="item">
                <span class="label">Espessura:</span>
                <span class="value">${dados.espessura}</span>
            </div>
        `;
    }
    
    if (dados.cor) {
        html += `
            <div class="item">
                <span class="label">Cor:</span>
                <span class="value">${dados.cor}</span>
            </div>
        `;
    }
    
    html += `
            </div>
        </div>
    `;
    
    return html;
}

function renderizarPortas(dados) {
    /**
     * Renderiza seção Portas com suporte a múltiplas linhas
     */
    console.log('🔍 Renderizando Portas:', dados);
    
    let html = `
        <div class="section">
            <h2>🚪 Portas</h2>
            <div class="content">
    `;
    
    if (dados.espessura) {
        html += `
            <div class="item">
                <span class="label">Espessura:</span>
                <span class="value">${dados.espessura}</span>
            </div>
        `;
    }
    
    if (dados.material) {
        html += `
            <div class="item">
                <span class="label">Material:</span>
                <span class="value">${dados.material}</span>
            </div>
        `;
    }
    
    if (dados.modelo) {
        html += `
            <div class="item">
                <span class="label">Modelo:</span>
                <span class="value">${dados.modelo}</span>
            </div>
        `;
    }
    
    if (dados.cor) {
        html += `
            <div class="item">
                <span class="label">Cor:</span>
                <span class="value">${dados.cor}</span>
            </div>
        `;
    }
    
    html += `
            </div>
        </div>
    `;
    
    return html;
}

function renderizarFerragens(dados) {
    /**
     * Renderiza seção Ferragens com suporte a múltiplas linhas
     */
    console.log('🔍 Renderizando Ferragens:', dados);
    
    let html = `
        <div class="section">
            <h2>🔧 Ferragens</h2>
            <div class="content">
    `;
    
    if (dados.puxadores) {
        html += `
            <div class="item">
                <span class="label">Puxadores:</span>
                <span class="value">${dados.puxadores}</span>
            </div>
        `;
    }
    
    if (dados.dobradicas) {
        html += `
            <div class="item">
                <span class="label">Dobradiças:</span>
                <span class="value">${dados.dobradicas}</span>
            </div>
        `;
    }
    
    if (dados.corredicas) {
        html += `
            <div class="item">
                <span class="label">Corrediças:</span>
                <span class="value">${dados.corredicas}</span>
            </div>
        `;
    }
    
    html += `
            </div>
        </div>
    `;
    
    return html;
}

function renderizarPortaPerfil(dados) {
    /**
     * Renderiza seção Porta Perfil
     */
    console.log('🔍 Renderizando Porta Perfil:', dados);
    
    let html = `
        <div class="section">
            <h2>🪟 Porta Perfil</h2>
            <div class="content">
    `;
    
    if (dados.perfil) {
        html += `
            <div class="item">
                <span class="label">Perfil:</span>
                <span class="value">${dados.perfil}</span>
            </div>
        `;
    }
    
    if (dados.vidro) {
        html += `
            <div class="item">
                <span class="label">Vidro:</span>
                <span class="value">${dados.vidro}</span>
            </div>
        `;
    }
    
    if (dados.puxador) {
        html += `
            <div class="item">
                <span class="label">Puxador:</span>
                <span class="value">${dados.puxador}</span>
            </div>
        `;
    }
    
    html += `
            </div>
        </div>
    `;
    
    return html;
}

function renderizarBrilhartColor(dados) {
    /**
     * Renderiza seção Brilhart Color
     */
    console.log('🔍 Renderizando Brilhart Color:', dados);
    
    let html = `
        <div class="section">
            <h2>✨ Brilhart Color</h2>
            <div class="content">
    `;
    
    if (dados.espessura) {
        html += `
            <div class="item">
                <span class="label">Espessura:</span>
                <span class="value">${dados.espessura}</span>
            </div>
        `;
    }
    
    if (dados.cor) {
        html += `
            <div class="item">
                <span class="label">Cor:</span>
                <span class="value">${dados.cor}</span>
            </div>
        `;
    }
    
    if (dados.perfil) {
        html += `
            <div class="item">
                <span class="label">Perfil:</span>
                <span class="value">${dados.perfil}</span>
            </div>
        `;
    }
    
    html += `
            </div>
        </div>
    `;
    
    return html;
} 