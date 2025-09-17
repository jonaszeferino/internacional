import { NextResponse } from "next/server"
import { supabase } from "@/lib/db"

export async function POST() {
  try {
    console.log("[v0] Inicializando valor da dívida...")

    // Inserir valor inicial diretamente
    const { data, error } = await supabase
      .from('divida_atual')
      .insert({ 
        valor: 1000000000
      })
      .select()

    if (error) {
      console.error("[v0] Erro ao inserir:", error)
      return NextResponse.json({ 
        error: "Erro ao inserir valor inicial", 
        details: error,
        suggestion: "Verifique se a tabela divida_atual tem as colunas: id, valor, created_at, updated_at"
      })
    }

    console.log("[v0] Valor inicial inserido com sucesso:", data)
    return NextResponse.json({ 
      success: true, 
      data: data[0],
      message: "Valor inicial de R$ 1 bilhão inserido com sucesso!"
    })

  } catch (error) {
    console.error("[v0] Erro:", error)
    return NextResponse.json({
      error: "Erro na operação",
      details: error.message
    }, { status: 500 })
  }
}
