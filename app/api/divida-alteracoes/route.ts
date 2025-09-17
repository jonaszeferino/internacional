import { NextResponse } from "next/server"
import { supabase } from "@/lib/db"

export async function GET() {
  try {
    console.log("[v0] Buscando alterações da dívida...")

    // Tente conectar ao banco, caso contrário retorne array vazio
    if (process.env.POSTGRES_URL || process.env.NEXT_PUBLIC_POSTGRES_HOST) {
      const { data, error } = await supabase
        .from('divida_alteracoes')
        .select('*')
        .order('created_at', { ascending: false })
        .limit(20)
      
      if (error) throw error
      
      console.log("[v0] Alterações encontradas:", data.length)
      return NextResponse.json(data)
    } else {
      console.log("[v0] Banco não configurado - retornando lista vazia")
      return NextResponse.json([])
    }
  } catch (error) {
    console.error("[v0] Erro ao buscar alterações da dívida:", error)
    return NextResponse.json([])
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json()
    console.log("[v0] Dados recebidos para alteração da dívida:", body)
    const { valor, descricao } = body

    if (!valor || isNaN(Number(valor))) {
      return NextResponse.json({ error: "Valor inválido" }, { status: 400 })
    }

    if (process.env.POSTGRES_URL || process.env.NEXT_PUBLIC_POSTGRES_HOST) {
      console.log("[v0] Inserindo alteração da dívida...")

      const { data, error } = await supabase
        .from('divida_alteracoes')
        .insert({
          valor: Number(valor),
          descricao: descricao || (Number(valor) > 0 ? "Aumento da dívida" : "Redução da dívida")
        })
        .select()
        .single()

      if (error) throw error

      console.log("[v0] Alteração da dívida salva com sucesso:", data)
      return NextResponse.json(data)
    } else {
      console.log("[v0] Modo demonstração - alteração simulada")
      const mockResult = {
        id: Date.now(),
        valor: Number(valor),
        descricao: descricao || (Number(valor) > 0 ? "Aumento da dívida" : "Redução da dívida"),
        created_at: new Date().toISOString()
      }
      return NextResponse.json(mockResult)
    }
  } catch (error) {
    console.error("[v0] Erro ao inserir alteração da dívida:", error)
    return NextResponse.json({ error: "Erro ao processar dados", details: error.message }, { status: 500 })
  }
}
