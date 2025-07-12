// 🔧 TESTE DE AUTENTICAÇÃO FLUYT - COM CREDENCIAIS CORRETAS
// Cole este código no Console do navegador (F12 → Console)

async function testeAuthRicardo() {
    console.log('🔧 TESTE DE AUTENTICAÇÃO FLUYT - CREDENCIAIS RICARDO');
    
    // 1. Verificar token atual
    const token = localStorage.getItem('fluyt_auth_token');
    console.log('1. Token no localStorage:', token ? '✅ EXISTE' : '❌ NÃO EXISTE');
    
    // 2. Fazer login com credenciais corretas
    if (!token) {
        console.log('2. Fazendo login com credenciais do Ricardo...');
        try {
            const response = await fetch('http://localhost:8000/api/v1/auth/login', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ 
                    email: 'ricardo.nilton@hotmail.com', 
                    password: '123456' 
                })
            });
            
            const data = await response.json();
            console.log('Response completa:', data);
            
            if (response.ok && data.access_token) {
                localStorage.setItem('fluyt_auth_token', data.access_token);
                localStorage.setItem('fluyt_user', JSON.stringify(data.user));
                console.log('2. Login: ✅ SUCESSO');
                console.log('   Usuário:', data.user.nome);
                console.log('   Perfil:', data.user.perfil);
                console.log('   Token salvo:', data.access_token.substring(0, 20) + '...');
            } else {
                console.log('2. Login: ❌ FALHOU');
                console.log('   Status:', response.status);
                console.log('   Erro:', data.error || data.message);
                return;
            }
        } catch (error) {
            console.log('2. Login: ❌ ERRO DE CONEXÃO');
            console.log('   Erro:', error.message);
            console.log('   Verifique se o backend está rodando na porta 8000');
            return;
        }
    } else {
        console.log('2. Login: ✅ JÁ LOGADO (token existe)');
    }
    
    // 3. Testar API de clientes com token
    console.log('3. Testando API de clientes...');
    try {
        const tokenAtual = localStorage.getItem('fluyt_auth_token');
        const response = await fetch('http://localhost:8000/api/v1/clientes/', {
            headers: { 
                'Authorization': `Bearer ${tokenAtual}`,
                'Content-Type': 'application/json'
            }
        });
        
        const data = await response.json();
        console.log('Response da API:', data);
        
        if (response.ok) {
            console.log('3. API Clientes: ✅ FUNCIONANDO');
            console.log('   Status:', response.status);
            console.log('   Total clientes:', data.items?.length || 0);
            console.log('   Primeira página:', data.page || 1);
            
            // 4. Recarregar página para aplicar correção
            console.log('4. ✅ TUDO FUNCIONANDO! Recarregando página...');
            setTimeout(() => {
                window.location.reload();
            }, 2000);
        } else {
            console.log('3. API Clientes: ❌ ERRO');
            console.log('   Status:', response.status);
            console.log('   Erro:', data.error || data.message);
            
            if (response.status === 401) {
                console.log('   💡 Token pode estar expirado. Tentando novo login...');
                localStorage.removeItem('fluyt_auth_token');
                localStorage.removeItem('fluyt_user');
                // Recursive call para tentar login novamente
                setTimeout(() => testeAuthRicardo(), 1000);
            }
        }
    } catch (error) {
        console.log('3. API Clientes: ❌ ERRO DE CONEXÃO');
        console.log('   Erro:', error.message);
    }
}

// Executar teste automaticamente
console.log('🚀 Iniciando teste de autenticação...');
testeAuthRicardo();