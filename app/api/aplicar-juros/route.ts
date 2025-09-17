import { NextResponse } from "next/server"
import { supabase } from "@/lib/db"

export async function POST() {
  try {
    console.log("[v0] Iniciando aplicação de juros diários...")

    // 1. Buscar taxa Selic atual
    const selicResponse = await fetch(`${process.env.VERCEL_URL || 'http://localhost:3000'}/api/selic`)
    const selicData = await selicResponse.json()
    
    if (!selicData.success && !selicData.fallback) {
      throw new Error("Não foi possível obter taxa Selic")
    }

    const taxaDiaria = selicData.taxa_selic_diaria
    console.log("[v0] Taxa Selic diária:", selicData.taxa_selic_diaria_percentual.toFixed(4) + "%")

    // 2. Buscar valor atual da dívida
    const dividaResponse = await fetch(`${process.env.VERCEL_URL || 'http://localhost:3000'}/api/divida-atual`)
    const dividaData = await dividaResponse.json()
    const valorAtual = dividaData.valor

    console.log("[v0] Valor atual da dívida:", valorAtual.toLocaleString())

    // 3. Calcular juros do dia
    const jurosCalculados = Math.floor(valorAtual * taxaDiaria)
    console.log("[v0] Juros calculados para hoje:", jurosCalculados.toLocaleString())

    // 4. Verificar se já foram aplicados juros hoje
    const hoje = new Date().toISOString().split('T')[0] // YYYY-MM-DD
    
    const { data: jurosHoje } = await supabase
      .from('divida_alteracoes')
      .select('*')
      .eq('descricao', `Juros Selic - ${hoje}`)
      .limit(1)

    if (jurosHoje && jurosHoje.length > 0) {
      return NextResponse.json({
        message: "Juros já aplicados hoje",
        data: hoje,
        valor_juros: jurosHoje[0].valor,
        ja_aplicado: true
      })
    }

    // 5. Aplicar juros como nova alteração
    const { data: novaAlteracao, error } = await supabase
      .from('divida_alteracoes')
      .insert({
        valor: jurosCalculados,
        descricao: `Juros Selic - ${hoje} (${selicData.taxa_selic_diaria_percentual.toFixed(4)}% ao dia)`
      })
      .select()
      .single()

    if (error) throw error

    console.log("[v0] Juros aplicados com sucesso:", novaAlteracao)

    return NextResponse.json({
      success: true,
      message: "Juros aplicados com sucesso",
      data: hoje,
      taxa_selic_anual: selicData.taxa_selic_anual,
      taxa_selic_diaria: selicData.taxa_selic_diaria_percentual,
      valor_divida_anterior: valorAtual,
      juros_aplicados: jurosCalculados,
      novo_valor_divida: valorAtual + jurosCalculados,
      fonte_selic: selicData.fonte
    })

  } catch (error) {
    console.error("[v0] Erro ao aplicar juros:", error)
    return NextResponse.json({
      error: "Erro ao aplicar juros",
      details: error.message
    }, { status: 500 })
  }
}
