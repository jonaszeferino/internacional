import { NextResponse } from "next/server"
import { supabase } from "@/lib/db"

// GET - Calcular valor atual da dívida baseado nas alterações
export async function GET() {
  try {
    console.log("[v0] Calculando valor atual da dívida...")

    if (process.env.POSTGRES_URL || process.env.NEXT_PUBLIC_POSTGRES_HOST) {
      // Buscar todas as alterações e somar
      const { data: alteracoes, error } = await supabase
        .from('divida_alteracoes')
        .select('valor')
        .order('created_at', { ascending: true })
      
      if (error) throw error
      
      // Calcular valor atual: base + soma de todas as alterações
      const dividaBase = 1000000000 // R$ 1 bilhão
      const somaAlteracoes = alteracoes?.reduce((total, alt) => total + Number(alt.valor), 0) || 0
      const valorAtual = dividaBase + somaAlteracoes
      
      console.log("[v0] Dívida base:", dividaBase.toLocaleString())
      console.log("[v0] Soma alterações:", somaAlteracoes.toLocaleString())
      console.log("[v0] Valor atual calculado:", valorAtual.toLocaleString())
      
      return NextResponse.json({
        valor: valorAtual,
        divida_base: dividaBase,
        soma_alteracoes: somaAlteracoes,
        total_alteracoes: alteracoes?.length || 0,
        updated_at: new Date().toISOString()
      })
    } else {
      console.log("[v0] Modo demonstração - retornando valor padrão")
      return NextResponse.json({
        valor: 1000000000,
        updated_at: new Date().toISOString()
      })
    }
  } catch (error) {
    console.error("[v0] Erro ao calcular valor atual:", error)
    // Em caso de erro, retorna valor padrão
    return NextResponse.json({
      valor: 1000000000,
      updated_at: new Date().toISOString()
    })
  }
}

