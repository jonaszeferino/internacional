import { NextResponse } from "next/server"
import { supabase } from "@/lib/db"

export async function POST() {
  try {
    console.log("[v0] Iniciando setup do banco de dados...")

    // Verificar e criar tabela divida_atual se necessário
    const { data: dividaAtualData, error: dividaAtualError } = await supabase
      .from('divida_atual')
      .select('*')
      .limit(1)

    if (dividaAtualError && dividaAtualError.code === 'PGRST204') {
      // Tabela não existe, vamos criá-la via RPC ou informar para criar manualmente
      return NextResponse.json({
        error: "Tabela divida_atual não existe",
        message: "Execute o script SQL no Supabase Dashboard",
        sql: `
CREATE TABLE divida_atual (
  id SERIAL PRIMARY KEY,
  valor BIGINT NOT NULL DEFAULT 1000000000,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

INSERT INTO divida_atual (valor) VALUES (1000000000);
        `
      })
    }

    // Se a tabela existe mas está vazia, inserir valor inicial
    if (dividaAtualData && dividaAtualData.length === 0) {
      const { data: insertData, error: insertError } = await supabase
        .from('divida_atual')
        .insert({ valor: 1000000000 })
        .select()

      if (insertError) {
        console.error("[v0] Erro ao inserir valor inicial:", insertError)
        return NextResponse.json({ error: "Erro ao inserir valor inicial", details: insertError })
      }

      console.log("[v0] Valor inicial inserido:", insertData)
    }

    // Verificar estrutura das tabelas
    const tablesStatus = {}

    // Testar tabela inter
    try {
      const { data: interData } = await supabase.from('inter').select('*').limit(1)
      tablesStatus.inter = `OK - ${interData?.length || 0} registros`
    } catch (e) {
      tablesStatus.inter = `Erro: ${e.message}`
    }

    // Testar tabela divida_alteracoes
    try {
      const { data: alteracoesData } = await supabase.from('divida_alteracoes').select('*').limit(1)
      tablesStatus.divida_alteracoes = `OK - ${alteracoesData?.length || 0} registros`
    } catch (e) {
      tablesStatus.divida_alteracoes = `Erro: ${e.message}`
    }

    // Testar tabela divida_atual
    try {
      const { data: atualData } = await supabase.from('divida_atual').select('*').limit(1)
      tablesStatus.divida_atual = `OK - ${atualData?.length || 0} registros`
    } catch (e) {
      tablesStatus.divida_atual = `Erro: ${e.message}`
    }

    return NextResponse.json({
      success: true,
      message: "Setup verificado",
      tables: tablesStatus
    })

  } catch (error) {
    console.error("[v0] Erro no setup:", error)
    return NextResponse.json({
      error: "Erro no setup",
      details: error.message
    }, { status: 500 })
  }
}
