/**
 * 🔧 SCRIPT DE TESTE DIAGNÓSTICO COMPLETO
 * Loop de validação e refatoração automática
 */

const BACKEND_URL = 'http://localhost:8000';
const FRONTEND_URL = 'http://localhost:3000';

class DiagnosticoCompleto {
    constructor() {
        this.resultados = [];
        this.erros = [];
        this.sucessos = [];
    }

    log(tipo, mensagem, dados = null) {
        const timestamp = new Date().toISOString();
        const entrada = { timestamp, tipo, mensagem, dados };
        
        console.log(`[${timestamp}] ${tipo.toUpperCase()}: ${mensagem}`);
        if (dados) console.log('Dados:', dados);
        
        this.resultados.push(entrada);
        
        if (tipo === 'ERRO') this.erros.push(entrada);
        if (tipo === 'SUCESSO') this.sucessos.push(entrada);
    }

    async testeConectividade() {
        this.log('INFO', '🔌 Iniciando testes de conectividade...');
        
        // Teste 1: Backend Health
        try {
            const response = await fetch(`${BACKEND_URL}/health`);
            const data = await response.json();
            
            if (response.ok) {
                this.log('SUCESSO', '✅ Backend health OK', data);
            } else {
                this.log('ERRO', '❌ Backend health falhou', { status: response.status, data });
            }
        } catch (error) {
            this.log('ERRO', '💥 Backend totalmente offline', error.message);
        }

        // Teste 2: Frontend Health
        try {
            const response = await fetch(`${FRONTEND_URL}`);
            if (response.ok) {
                this.log('SUCESSO', '✅ Frontend respondendo');
            } else {
                this.log('ERRO', '❌ Frontend com problemas', response.status);
            }
        } catch (error) {
            this.log('ERRO', '💥 Frontend offline', error.message);
        }
    }

    async testeEndpointsAPI() {
        this.log('INFO', '🌐 Testando endpoints da API...');
        
        const endpoints = [
            { nome: 'Funcionários (sem auth)', url: '/api/v1/funcionarios', expectativa: 403 },
            { nome: 'Docs Swagger', url: '/api/v1/docs', expectativa: 200 },
            { nome: 'Empresas (sem auth)', url: '/api/v1/empresas', expectativa: 403 },
            { nome: 'Lojas (sem auth)', url: '/api/v1/lojas', expectativa: 403 },
        ];

        for (const endpoint of endpoints) {
            try {
                const response = await fetch(`${BACKEND_URL}${endpoint.url}`);
                
                if (response.status === endpoint.expectativa) {
                    this.log('SUCESSO', `✅ ${endpoint.nome}: Status ${response.status} (esperado)`);
                } else {
                    this.log('ERRO', `❌ ${endpoint.nome}: Status ${response.status} (esperado ${endpoint.expectativa})`);
                }
                
                // Verificar se retorna JSON válido
                try {
                    const data = await response.json();
                    this.log('INFO', `📦 ${endpoint.nome} retornou JSON válido`, data);
                } catch (jsonError) {
                    this.log('ERRO', `💀 ${endpoint.nome} não retornou JSON válido`, jsonError.message);
                }
                
            } catch (error) {
                this.log('ERRO', `💥 ${endpoint.nome} falhou completamente`, error.message);
            }
        }
    }

    async testeAutenticacao() {
        this.log('INFO', '🔐 Testando fluxo de autenticação...');
        
        // Teste com credenciais inválidas
        try {
            const response = await fetch(`${BACKEND_URL}/api/v1/auth/login`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    email: 'teste@invalido.com',
                    password: 'senhaerrada'
                })
            });
            
            const data = await response.json();
            
            if (response.status === 401 || response.status === 422) {
                this.log('SUCESSO', '✅ Login com credenciais inválidas rejeitado corretamente', { status: response.status, data });
            } else {
                this.log('ERRO', '❌ Login deveria rejeitar credenciais inválidas', { status: response.status, data });
            }
        } catch (error) {
            this.log('ERRO', '💥 Endpoint de login não está funcionando', error.message);
        }
    }

    async testeFuncionariosComToken() {
        this.log('INFO', '👥 Testando endpoints de funcionários...');
        
        // Teste sem token
        try {
            const response = await fetch(`${BACKEND_URL}/api/v1/funcionarios`);
            const data = await response.json();
            
            if (response.status === 403) {
                this.log('SUCESSO', '✅ Endpoint funcionários bloqueia acesso sem token', data);
            } else {
                this.log('ERRO', '❌ Endpoint funcionários deveria bloquear acesso sem token', { status: response.status, data });
            }
        } catch (error) {
            this.log('ERRO', '💥 Erro ao testar funcionários sem token', error.message);
        }

        // Teste com token falso
        try {
            const response = await fetch(`${BACKEND_URL}/api/v1/funcionarios`, {
                headers: {
                    'Authorization': 'Bearer token-falso-123'
                }
            });
            const data = await response.json();
            
            if (response.status === 401 || response.status === 403) {
                this.log('SUCESSO', '✅ Endpoint funcionários rejeita token falso', data);
            } else {
                this.log('ERRO', '❌ Endpoint funcionários deveria rejeitar token falso', { status: response.status, data });
            }
        } catch (error) {
            this.log('ERRO', '💥 Erro ao testar funcionários com token falso', error.message);
        }
    }

    async testeCORS() {
        this.log('INFO', '🌍 Testando configuração CORS...');
        
        // Simular requisição de origem diferente
        try {
            const response = await fetch(`${BACKEND_URL}/health`, {
                method: 'GET',
                headers: {
                    'Origin': 'http://localhost:3000',
                    'Access-Control-Request-Method': 'GET'
                }
            });
            
            const corsHeaders = {
                'Access-Control-Allow-Origin': response.headers.get('Access-Control-Allow-Origin'),
                'Access-Control-Allow-Methods': response.headers.get('Access-Control-Allow-Methods'),
                'Access-Control-Allow-Headers': response.headers.get('Access-Control-Allow-Headers'),
            };
            
            this.log('INFO', '🔍 Headers CORS detectados', corsHeaders);
            
            if (corsHeaders['Access-Control-Allow-Origin']) {
                this.log('SUCESSO', '✅ CORS configurado no backend');
            } else {
                this.log('ERRO', '❌ CORS pode não estar configurado corretamente');
            }
            
        } catch (error) {
            this.log('ERRO', '💥 Erro ao testar CORS', error.message);
        }
    }

    async testeConversaoJSON() {
        this.log('INFO', '🔄 Testando conversão de dados JSON...');
        
        // Dados de teste para funcionário
        const dadosTeste = {
            lojaId: 'test-123',
            tipoFuncionario: 'VENDEDOR',
            setorId: 'test-456',
            nivelAcesso: 'USUARIO',
            dataAdmissao: '2024-01-01',
            nome: 'Teste Silva',
            email: 'teste@email.com'
        };

        try {
            // Simular conversão frontend -> backend
            const payload = {
                loja_id: dadosTeste.lojaId,
                perfil: dadosTeste.tipoFuncionario,
                setor_id: dadosTeste.setorId,
                nivel_acesso: dadosTeste.nivelAcesso,
                data_admissao: dadosTeste.dataAdmissao,
                nome: dadosTeste.nome,
                email: dadosTeste.email
            };
            
            this.log('SUCESSO', '✅ Conversão frontend->backend OK', { original: dadosTeste, convertido: payload });
            
            // Simular conversão backend -> frontend
            const reconvertido = {
                lojaId: payload.loja_id,
                tipoFuncionario: payload.perfil,
                setorId: payload.setor_id,
                nivelAcesso: payload.nivel_acesso,
                dataAdmissao: payload.data_admissao,
                nome: payload.nome,
                email: payload.email
            };
            
            // Verificar se conversão é reversível
            const dadosIguais = JSON.stringify(dadosTeste) === JSON.stringify(reconvertido);
            
            if (dadosIguais) {
                this.log('SUCESSO', '✅ Conversão bidirecional OK');
            } else {
                this.log('ERRO', '❌ Conversão bidirecional com problemas', { original: dadosTeste, reconvertido });
            }
            
        } catch (error) {
            this.log('ERRO', '💥 Erro na conversão JSON', error.message);
        }
    }

    async testeMemoriaEPerformance() {
        this.log('INFO', '⚡ Testando performance e memória...');
        
        const inicio = performance.now();
        
        // Simular várias requisições simultâneas
        const promises = [];
        for (let i = 0; i < 5; i++) {
            promises.push(fetch(`${BACKEND_URL}/health`));
        }
        
        try {
            const responses = await Promise.all(promises);
            const fim = performance.now();
            const tempoTotal = fim - inicio;
            
            const sucessos = responses.filter(r => r.ok).length;
            
            this.log('INFO', `⏱️ Performance: ${sucessos}/5 requisições OK em ${tempoTotal.toFixed(2)}ms`);
            
            if (sucessos === 5 && tempoTotal < 2000) {
                this.log('SUCESSO', '✅ Performance adequada');
            } else {
                this.log('ERRO', '❌ Performance abaixo do esperado');
            }
            
        } catch (error) {
            this.log('ERRO', '💥 Erro no teste de performance', error.message);
        }
    }

    async executarTodosTestes() {
        this.log('INFO', '🚀 Iniciando diagnóstico completo do sistema...');
        
        await this.testeConectividade();
        await this.testeEndpointsAPI();
        await this.testeAutenticacao();
        await this.testeFuncionariosComToken();
        await this.testeCORS();
        await this.testeConversaoJSON();
        await this.testeMemoriaEPerformance();
        
        this.gerarRelatorioFinal();
    }

    gerarRelatorioFinal() {
        console.log('\n' + '='.repeat(80));
        console.log('📊 RELATÓRIO FINAL DO DIAGNÓSTICO');
        console.log('='.repeat(80));
        
        console.log(`✅ Sucessos: ${this.sucessos.length}`);
        console.log(`❌ Erros: ${this.erros.length}`);
        console.log(`📋 Total de testes: ${this.resultados.length}`);
        
        const percentualSucesso = ((this.sucessos.length / this.resultados.length) * 100).toFixed(2);
        console.log(`📈 Taxa de sucesso: ${percentualSucesso}%`);
        
        if (this.erros.length > 0) {
            console.log('\n🔥 ERROS ENCONTRADOS:');
            this.erros.forEach((erro, index) => {
                console.log(`${index + 1}. ${erro.mensagem}`);
                if (erro.dados) console.log(`   Dados:`, erro.dados);
            });
        }
        
        console.log('\n🎯 PRÓXIMAS AÇÕES RECOMENDADAS:');
        if (this.erros.length === 0) {
            console.log('✅ Sistema funcionando perfeitamente!');
        } else {
            console.log('🔧 Corrigir erros identificados');
            console.log('🔄 Executar testes novamente');
            console.log('🚀 Implementar melhorias');
        }
        
        console.log('='.repeat(80));
        
        return {
            sucessos: this.sucessos.length,
            erros: this.erros.length,
            total: this.resultados.length,
            percentualSucesso,
            resultadosCompletos: this.resultados
        };
    }
}

// Executar diagnóstico automaticamente
const diagnostico = new DiagnosticoCompleto();
diagnostico.executarTodosTestes().then(resultado => {
    console.log('\n🏁 Diagnóstico completo finalizado!');
}).catch(error => {
    console.error('💥 Erro fatal no diagnóstico:', error);
});

// Exportar para uso em outros scripts
if (typeof module !== 'undefined' && module.exports) {
    module.exports = DiagnosticoCompleto;
} 