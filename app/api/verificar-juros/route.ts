import { NextResponse } from "next/server"
import { supabase } from "@/lib/db"

export async function GET() {
  try {
    console.log("[v0] Verificando se juros precisam ser aplicados...")

    const hoje = new Date().toISOString().split('T')[0] // YYYY-MM-DD
    
    // Verificar se já foram aplicados juros hoje
    const { data: jurosHoje } = await supabase
      .from('divida_alteracoes')
      .select('*')
      .like('descricao', `Juros Selic - ${hoje}%`)
      .limit(1)

    if (jurosHoje && jurosHoje.length > 0) {
      return NextResponse.json({
        message: "Juros já aplicados hoje",
        data: hoje,
        ja_aplicado: true,
        valor_juros: jurosHoje[0].valor
      })
    }

    // Se não foram aplicados, aplicar agora
    const aplicarResponse = await fetch(`${process.env.VERCEL_URL || 'http://localhost:3000'}/api/aplicar-juros`, {
      method: 'POST'
    })

    const aplicarData = await aplicarResponse.json()

    return NextResponse.json({
      message: "Juros verificados e aplicados",
      ...aplicarData
    })

  } catch (error) {
    console.error("[v0] Erro ao verificar juros:", error)
    return NextResponse.json({
      error: "Erro ao verificar juros",
      details: error.message
    }, { status: 500 })
  }
}
