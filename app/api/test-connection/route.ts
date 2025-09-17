import { NextResponse } from "next/server"
import { supabase } from "@/lib/db"

export async function GET() {
  try {
    console.log("[v0] Testando conexão com PostgreSQL...")
    console.log("[v0] POSTGRES_URL presente:", !!process.env.POSTGRES_URL)

    if (!process.env.POSTGRES_URL && !process.env.NEXT_PUBLIC_POSTGRES_HOST) {
      return NextResponse.json({ 
        error: "Nenhuma variável PostgreSQL configurada",
        env_vars: Object.keys(process.env).filter(key => key.includes('POSTGRES'))
      })
    }

    // Testar conexão básica verificando se consegue acessar uma tabela
    const { data: testData, error: testError } = await supabase
      .from('inter')
      .select('count', { count: 'exact', head: true })
    
    if (testError && testError.code !== 'PGRST116') {
      throw testError
    }

    // Verificar dados nas tabelas
    let tableData = {}
    
    try {
      const { count: interCount } = await supabase
        .from('inter')
        .select('*', { count: 'exact', head: true })
      tableData.inter = interCount || 0
    } catch (e) {
      tableData.inter = "Tabela não existe"
    }

    try {
      const { count: dividaAlteracoesCount } = await supabase
        .from('divida_alteracoes')
        .select('*', { count: 'exact', head: true })
      tableData.divida_alteracoes = dividaAlteracoesCount || 0
    } catch (e) {
      tableData.divida_alteracoes = "Tabela não existe"
    }

    try {
      const { data: dividaAtualData } = await supabase
        .from('divida_atual')
        .select('valor')
        .order('id', { ascending: false })
        .limit(1)
        .single()
      tableData.divida_atual = dividaAtualData?.valor || "Tabela vazia"
    } catch (e) {
      tableData.divida_atual = "Tabela não existe"
    }

    return NextResponse.json({
      success: true,
      connection: "OK - Supabase",
      supabase_url: process.env.NEXT_PUBLIC_SUPABASE_URL,
      current_time: new Date().toISOString(),
      table_data: tableData
    })

  } catch (error) {
    console.error("[v0] Erro na conexão:", error)
    return NextResponse.json({
      error: "Erro de conexão",
      details: error.message,
      postgres_url_exists: !!process.env.POSTGRES_URL
    }, { status: 500 })
  }
}
