import { createClient } from '@supabase/supabase-js'

// Configuração do Supabase
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || ''
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || ''

// Verificar se as configurações são válidas
const isConfigured = supabaseUrl && 
                    supabaseAnonKey && 
                    !supabaseUrl.includes('COLE_SEU') && 
                    !supabaseAnonKey.includes('COLE_SUA') &&
                    supabaseUrl.startsWith('https://') &&
                    supabaseUrl.includes('.supabase.co')

// Cliente Supabase - só criar se configurado corretamente
let supabase = null
try {
  supabase = isConfigured 
    ? createClient(supabaseUrl, supabaseAnonKey)
    : null
  
  if (!isConfigured) {
    console.warn('⚠️ Supabase não configurado. Configure as variáveis de ambiente NEXT_PUBLIC_SUPABASE_URL e NEXT_PUBLIC_SUPABASE_ANON_KEY');
  }
} catch (error) {
  console.error('❌ Erro ao criar cliente Supabase:', error)
}

export { supabase }

// Flag para verificar se está configurado
export const isSupabaseConfigured = isConfigured

// Função para testar conectividade
export async function testConnection() {
  try {
    console.log('🔗 Testando conectividade com Supabase...')
    
    // Verificar se está configurado
    if (!isSupabaseConfigured || !supabase) {
      return {
        success: false,
        message: 'Supabase não configurado',
        error: 'Configure as variáveis NEXT_PUBLIC_SUPABASE_URL e NEXT_PUBLIC_SUPABASE_ANON_KEY no arquivo .env.local'
      }
    }
    
    // Teste básico de conectividade
    const { data, error } = await supabase
      .from('_test')
      .select('*')
      .limit(1)
    
    if (error) {
      console.log('⚠️ Erro esperado (tabela _test não existe):', error.message)
      console.log('✅ Conexão estabelecida com sucesso!')
      return { success: true, message: 'Conexão com Supabase funcionando' }
    }
    
    console.log('✅ Conexão e consulta realizadas com sucesso!')
    return { success: true, message: 'Conexão com Supabase funcionando', data }
    
  } catch (err) {
    console.error('❌ Erro de conectividade:', err)
    return { 
      success: false, 
      message: 'Erro de conectividade com Supabase',
      error: err instanceof Error ? err.message : 'Erro desconhecido'
    }
  }
}

// Função para verificar status de autenticação
export async function checkAuthStatus() {
  try {
    // Verificar se está configurado
    if (!isSupabaseConfigured || !supabase) {
      return {
        authenticated: false,
        error: 'Supabase não configurado. Configure as variáveis de ambiente primeiro.'
      }
    }

    const { data: { session }, error } = await supabase.auth.getSession()
    
    if (error) {
      console.log('⚠️ Erro de autenticação:', error.message)
      return { authenticated: false, error: error.message }
    }
    
    const isAuthenticated = !!session
    console.log(`🔐 Status de autenticação: ${isAuthenticated ? 'Autenticado' : 'Não autenticado'}`)
    
    return { 
      authenticated: isAuthenticated, 
      session,
      user: session?.user || null
    }
    
  } catch (err) {
    console.error('❌ Erro ao verificar autenticação:', err)
    return { 
      authenticated: false, 
      error: err instanceof Error ? err.message : 'Erro desconhecido' 
    }
  }
}