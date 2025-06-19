const { createClient } = require('@supabase/supabase-js')
require('dotenv').config({ path: '.env.local' })

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

if (!supabaseUrl || !supabaseAnonKey || supabaseUrl.includes('your-project') || supabaseAnonKey.includes('your-anon')) {
  console.log('❌ Configure suas credenciais do Supabase no arquivo .env.local primeiro!')
  process.exit(1)
}

const supabase = createClient(supabaseUrl, supabaseAnonKey)

async function listTables() {
  try {
    console.log('🔍 Buscando tabelas no projeto Supabase...\n')
    
    // Query para listar todas as tabelas do schema public
    const { data, error } = await supabase
      .rpc('list_tables')
      .select('*')
    
    if (error) {
      console.log('⚠️ Erro ao usar RPC, tentando query direta...')
      
      // Método alternativo: tentar listar algumas tabelas conhecidas
      const tables = ['empresas', 'lojas', 'clientes', 'ambientes', 'orcamentos', 'contratos', 'usuarios', 'equipe']
      
      console.log('📋 Verificando existência das tabelas esperadas:\n')
      
      for (const table of tables) {
        try {
          const { data, error } = await supabase
            .from(table)
            .select('*')
            .limit(1)
          
          if (!error) {
            console.log(`✅ ${table} - existe`)
          } else {
            console.log(`❌ ${table} - não existe ou sem permissão`)
          }
        } catch (err) {
          console.log(`❌ ${table} - erro: ${err.message}`)
        }
      }
    } else {
      console.log('📋 Tabelas encontradas:')
      console.log(data)
    }
    
  } catch (err) {
    console.error('❌ Erro:', err.message)
  }
}

listTables()