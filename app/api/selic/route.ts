import { NextResponse } from "next/server"

// API do Banco Central do Brasil para taxa Selic
// Série 432 = Taxa Selic (% a.a.)
const SELIC_API_URL = "https://api.bcb.gov.br/dados/serie/bcdata.sgs.432/dados/ultimos/1?formato=json"

export async function GET() {
  try {
    console.log("[v0] Buscando taxa Selic atual...")

    const response = await fetch(SELIC_API_URL, {
      headers: {
        'User-Agent': 'Internacional-Divida-App/1.0'
      }
    })

    if (!response.ok) {
      throw new Error(`Erro na API do BACEN: ${response.status}`)
    }

    const data = await response.json()
    
    if (!data || data.length === 0) {
      throw new Error("Nenhum dado retornado da API")
    }

    const ultimaSelicData = data[0]
    const taxaSelic = parseFloat(ultimaSelicData.valor) // Taxa anual em %
    
    // Calcular taxa diária
    // Fórmula: ((1 + taxa_anual/100)^(1/365)) - 1
    const taxaAnual = taxaSelic / 100
    const taxaDiaria = Math.pow(1 + taxaAnual, 1/365) - 1
    const taxaDiariaPercentual = taxaDiaria * 100

    console.log("[v0] Taxa Selic obtida:", {
      data: ultimaSelicData.data,
      taxa_anual: taxaSelic,
      taxa_diaria_percentual: taxaDiariaPercentual
    })

    return NextResponse.json({
      success: true,
      data_referencia: ultimaSelicData.data,
      taxa_selic_anual: taxaSelic,
      taxa_selic_diaria: taxaDiaria,
      taxa_selic_diaria_percentual: taxaDiariaPercentual,
      fonte: "Banco Central do Brasil",
      serie: "432 - Taxa Selic"
    })

  } catch (error) {
    console.error("[v0] Erro ao buscar Selic:", error)
    
    // Fallback: usar taxa aproximada (13.25% a.a. - última conhecida)
    const taxaFallback = 13.25
    const taxaDiariaFallback = Math.pow(1 + taxaFallback/100, 1/365) - 1
    
    return NextResponse.json({
      success: false,
      error: error.message,
      fallback: true,
      data_referencia: new Date().toISOString().split('T')[0],
      taxa_selic_anual: taxaFallback,
      taxa_selic_diaria: taxaDiariaFallback,
      taxa_selic_diaria_percentual: taxaDiariaFallback * 100,
      fonte: "Estimativa (API indisponível)"
    })
  }
}
