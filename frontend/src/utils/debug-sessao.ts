/**
 * Utilitários para debug da sessão simples
 */

export function debugSessaoSimples() {
  if (typeof window === 'undefined') {
    console.log('🔒 SSR - window não disponível');
    return;
  }

  console.log('=== DEBUG SESSÃO SIMPLES ===');
  
  const dados = localStorage.getItem('fluyt_sessao_simples');
  
  if (!dados) {
    console.log('❌ Nenhum dado encontrado no localStorage');
    return;
  }

  try {
    const sessao = JSON.parse(dados);
    
    console.log('📊 Dados da sessão:');
    console.log('- Cliente:', sessao.cliente?.nome || 'null');
    console.log('- Ambientes:', sessao.ambientes?.length || 0);
    console.log('- Valor Total:', sessao.valorTotal || 0);
    console.log('- Formas de Pagamento:', sessao.formasPagamento?.length || 0);
    
    if (sessao.formasPagamento?.length > 0) {
      console.log('💰 Formas de pagamento encontradas:');
      sessao.formasPagamento.forEach((forma: any, index: number) => {
        console.log(`  ${index + 1}. ${forma.tipo} - R$ ${forma.valor} (VP: R$ ${forma.valorPresente})`);
      });
    } else {
      console.log('⚠️ Nenhuma forma de pagamento encontrada');
    }
    
    console.log('📦 Dados completos:', sessao);
    
  } catch (error) {
    console.log('❌ Erro ao parsear dados:', error);
  }
  
  console.log('=== FIM DEBUG ===');
}

export function limparSessaoSimples() {
  if (typeof window === 'undefined') return;
  
  localStorage.removeItem('fluyt_sessao_simples');
  console.log('🧹 Sessão simples limpa');
}

export function adicionarFormaPagamentoTeste() {
  if (typeof window === 'undefined') return;
  
  const dadosExemplo = {
    cliente: { id: "teste", nome: "Cliente Teste" },
    ambientes: [{ id: "1", nome: "Sala", valor: 5000 }],
    valorTotal: 5000,
    formasPagamento: [
      {
        id: "forma_teste_1",
        tipo: "a-vista",
        valor: 2000,
        valorPresente: 1900,
        criadaEm: new Date().toISOString(),
        dados: {}
      },
      {
        id: "forma_teste_2",
        tipo: "cartao",
        valor: 3000,
        valorPresente: 3000,
        parcelas: 3,
        criadaEm: new Date().toISOString(),
        dados: { vezes: 3 }
      }
    ]
  };
  
  localStorage.setItem('fluyt_sessao_simples', JSON.stringify(dadosExemplo));
  console.log('🎯 Dados de teste adicionados');
  debugSessaoSimples();
}

// Disponibilizar no window para debug no console do browser
if (typeof window !== 'undefined') {
  (window as any).debugSessao = {
    debug: debugSessaoSimples,
    limpar: limparSessaoSimples,
    adicionarTeste: adicionarFormaPagamentoTeste
  };
  
  console.log('🔧 Debug utils disponíveis em window.debugSessao');
}