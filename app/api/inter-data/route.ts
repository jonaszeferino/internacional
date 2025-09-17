import { NextResponse } from "next/server"
import { sql } from "@vercel/postgres"

export async function GET() {
  try {
    console.log("[v0] Buscando dados da tabela inter...")

    const result = await sql`
      SELECT * FROM inter 
      ORDER BY created_at DESC 
      LIMIT 10
    `

    console.log("[v0] Dados recuperados com sucesso:", result.rows.length, "registros")
    return NextResponse.json(result.rows)
  } catch (error) {
    console.error("[v0] Erro ao buscar dados:", error)
    return NextResponse.json(
      { error: "Erro ao conectar com o banco de dados", details: error.message },
      { status: 500 },
    )
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json()
    console.log("[v0] Dados recebidos para inserção:", body)
    const { text, text2, text3, text4, text5 } = body

    if (!text || text.trim() === "") {
      return NextResponse.json({ error: "Campo 'text' é obrigatório" }, { status: 400 })
    }

    console.log("[v0] Inserindo dados...")

    const result = await sql`
      INSERT INTO inter (text, text2, text3, text4, text5, created_at) 
      VALUES (${text}, ${text2 || null}, ${text3 || null}, ${text4 || null}, ${text5 || null}, NOW()) 
      RETURNING *
    `

    console.log("[v0] Inserção realizada com sucesso:", result.rows[0])
    return NextResponse.json(result.rows[0])
  } catch (error) {
    console.error("[v0] Erro ao inserir dados:", error)
    return NextResponse.json({ error: "Erro ao inserir dados no banco", details: error.message }, { status: 500 })
  }
}
