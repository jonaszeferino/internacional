import { NextResponse } from "next/server"
import { supabase } from "@/lib/db"

export async function GET() {
  try {
    console.log("[v0] Buscando dados da tabela inter...")

    // Dados de exemplo para demonstração (remova quando configurar o banco)
    const mockData = [
      {
        id: 1,
        created_at: new Date().toISOString(),
        text: "Internacional anuncia novo plano de reestruturação financeira",
        text2: "Clube busca reduzir dívida em 30% até 2025",
        text3: "O Sport Club Internacional apresentou hoje um novo plano de reestruturação que visa reduzir significativamente sua dívida através de venda de jogadores e parcerias estratégicas.",
        text4: "Valor estimado: R$ 300 milhões",
        text5: "Prazo: 18 meses"
      },
      {
        id: 2,
        created_at: new Date(Date.now() - 86400000).toISOString(),
        text: "Venda de jogador gera receita de R$ 50 milhões",
        text2: "Transferência para clube europeu",
        text3: "A venda do meio-campista para o futebol europeu representa um alívio importante nas contas do clube.",
        text4: "Destino: Liga dos Campeões",
        text5: "Percentual para o Inter: 80%"
      }
    ];

    // Tente conectar ao banco, caso contrário use dados mock
    if (process.env.POSTGRES_URL || process.env.NEXT_PUBLIC_POSTGRES_HOST) {
      const { data, error } = await supabase
        .from('inter')
        .select('*')
        .order('created_at', { ascending: false })
        .limit(10)
      
      if (error) throw error
      
      console.log("[v0] Dados recuperados com sucesso:", data.length, "registros")
      return NextResponse.json(data)
    } else {
      console.log("[v0] Usando dados de demonstração (configure POSTGRES_URL no .env.local)")
      return NextResponse.json(mockData)
    }
  } catch (error) {
    console.error("[v0] Erro ao buscar dados:", error)
    
    // Retorna dados mock em caso de erro
    const mockData = [
      {
        id: 1,
        created_at: new Date().toISOString(),
        text: "Sistema em modo demonstração",
        text2: "Configure o banco de dados",
        text3: "Para usar dados reais, configure a variável POSTGRES_URL no arquivo .env.local",
        text4: "Status: Demo",
        text5: "Dados fictícios"
      }
    ];
    
    return NextResponse.json(mockData)
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

    if (process.env.POSTGRES_URL || process.env.NEXT_PUBLIC_POSTGRES_HOST) {
      console.log("[v0] Inserindo dados no banco...")

      const { data, error } = await supabase
        .from('inter')
        .insert({
          text,
          text2: text2 || null,
          text3: text3 || null,
          text4: text4 || null,
          text5: text5 || null
        })
        .select()
        .single()

      if (error) throw error

      console.log("[v0] Inserção realizada com sucesso:", data)
      return NextResponse.json(data)
    } else {
      console.log("[v0] Modo demonstração - notícia simulada")
      const mockResult = {
        id: Date.now(),
        text,
        text2: text2 || null,
        text3: text3 || null,
        text4: text4 || null,
        text5: text5 || null,
        created_at: new Date().toISOString()
      }
      
      console.log("[v0] Notícia simulada criada:", mockResult)
      return NextResponse.json(mockResult)
    }
  } catch (error) {
    console.error("[v0] Erro ao processar dados:", error)
    return NextResponse.json({ error: "Erro ao processar dados", details: error.message }, { status: 500 })
  }
}
