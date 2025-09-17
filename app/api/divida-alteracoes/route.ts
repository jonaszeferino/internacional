import { NextResponse } from "next/server"
import { sql } from "@vercel/postgres"

export async function GET() {
  try {
    console.log("[v0] Buscando alterações da dívida...")

    const result = await sql`
      SELECT * FROM divida_alteracoes 
      ORDER BY created_at DESC 
      LIMIT 20
    `

    console.log("[v0] Alterações encontradas:", result.rows.length)
    return NextResponse.json(result.rows)
  } catch (error) {
    console.error("[v0] Erro ao buscar alterações da dívida:", error)
    return NextResponse.json(
      { error: "Erro ao conectar com o banco de dados", details: error.message },
      { status: 500 },
    )
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

    console.log("[v0] Inserindo alteração da dívida...")

    const result = await sql`
      INSERT INTO divida_alteracoes (valor, descricao, created_at) 
      VALUES (${Number(valor)}, ${descricao || (Number(valor) > 0 ? "Aumento da dívida" : "Redução da dívida")}, NOW()) 
      RETURNING *
    `

    console.log("[v0] Alteração da dívida salva com sucesso:", result.rows[0])
    return NextResponse.json(result.rows[0])
  } catch (error) {
    console.error("[v0] Erro ao inserir alteração da dívida:", error)
    return NextResponse.json({ error: "Erro ao inserir dados no banco", details: error.message }, { status: 500 })
  }
}
