"use client"

import { useState, useEffect } from "react"
import { supabase } from "@/lib/db"

interface InterData {
  id: number
  created_at: string
  text: string
  text2: string
  text3: string
  text4: string
  text5: string
}

interface DividaAlteracao {
  id: string
  valor: number
  descricao: string
  timestamp: Date
}

export default function ContadorDivida() {
  const [dividaAtual, setDividaAtual] = useState(0)
  const [informacoes, setInformacoes] = useState<InterData[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [alteracoesBanco, setAlteracoesBanco] = useState<any[]>([])
  const [showAdmin, setShowAdmin] = useState(false)

  const dividaBase = 1000000000 // R$ 1 bilhão

  // Estados para admin
  const [novaNoticia, setNovaNoticia] = useState({
    text: "",
    text2: "",
    text3: "",
    text4: "",
    text5: "",
  })
  const [valorAlteracao, setValorAlteracao] = useState("")
  const [descricaoAlteracao, setDescricaoAlteracao] = useState("")
  const [submittingNoticia, setSubmittingNoticia] = useState(false)
  const [feedbackMessage, setFeedbackMessage] = useState("")
  const [taxaSelic, setTaxaSelic] = useState<any>(null)
  const [aplicandoJuros, setAplicandoJuros] = useState(false)

  // Função para buscar valor atual da dívida
  const fetchDividaAtual = async () => {
    try {
      const response = await fetch("/api/divida-atual")
      if (response.ok) {
        const data = await response.json()
        console.log("[v0] Valor atual da dívida carregado:", data.valor)
        setDividaAtual(data.valor)
        return data.valor
      }
    } catch (error) {
      console.error("[v0] Erro ao carregar valor atual:", error)
    }
    return dividaBase // Fallback para valor padrão
  }

  // Função para recalcular valor atual baseado nas alterações
  const recalcularDivida = async () => {
    try {
      const response = await fetch("/api/divida-atual")
      if (response.ok) {
        const data = await response.json()
        console.log("[v0] Valor recalculado:", data.valor)
        setDividaAtual(data.valor)
        return data.valor
      }
    } catch (error) {
      console.error("[v0] Erro ao recalcular valor:", error)
    }
    return dividaAtual
  }

  // Função para buscar taxa Selic
  const fetchTaxaSelic = async () => {
    try {
      const response = await fetch("/api/selic")
      if (response.ok) {
        const data = await response.json()
        console.log("[v0] Taxa Selic carregada:", data.taxa_selic_anual + "% a.a.")
        setTaxaSelic(data)
      }
    } catch (error) {
      console.error("[v0] Erro ao carregar taxa Selic:", error)
    }
  }

  // Função para aplicar juros manualmente
  const aplicarJuros = async () => {
    setAplicandoJuros(true)
    try {
      const response = await fetch("/api/aplicar-juros", { method: "POST" })
      const data = await response.json()
      
      if (data.success) {
        setFeedbackMessage(`✅ Juros aplicados: ${new Intl.NumberFormat("pt-BR", {
          style: "currency",
          currency: "BRL",
          minimumFractionDigits: 0,
          maximumFractionDigits: 0,
        }).format(data.juros_aplicados)}!`)
        
        // Recarregar dados
        await recalcularDivida()
        await fetchAlteracoesBanco()
      } else if (data.ja_aplicado) {
        setFeedbackMessage("ℹ️ Juros já foram aplicados hoje!")
      } else {
        setFeedbackMessage("❌ Erro ao aplicar juros")
      }
      
      setTimeout(() => setFeedbackMessage(""), 5000)
    } catch (error) {
      console.error("[v0] Erro ao aplicar juros:", error)
      setFeedbackMessage("❌ Erro ao aplicar juros")
      setTimeout(() => setFeedbackMessage(""), 3000)
    } finally {
      setAplicandoJuros(false)
    }
  }

  // Função para verificar juros automaticamente
  const verificarJurosAutomatico = async () => {
    try {
      const response = await fetch("/api/verificar-juros")
      const data = await response.json()
      
      if (data.success && !data.ja_aplicado) {
        console.log("[v0] Juros aplicados automaticamente:", data.juros_aplicados)
        // Recarregar dados silenciosamente
        await recalcularDivida()
        await fetchAlteracoesBanco()
      }
    } catch (error) {
      console.error("[v0] Erro na verificação automática de juros:", error)
    }
  }

  // Função para buscar alterações do banco
  const fetchAlteracoesBanco = async () => {
    try {
      const response = await fetch("/api/divida-alteracoes")
      if (response.ok) {
        const data = await response.json()
        console.log("[v0] Alterações do banco carregadas:", data.length)
        setAlteracoesBanco(data)
      }
    } catch (error) {
      console.error("[v0] Erro ao carregar alterações do banco:", error)
    }
  }

  // Função para buscar dados do PostgreSQL
  const fetchData = async () => {
    try {
      setLoading(true)
      const response = await fetch("/api/inter-data")
      if (!response.ok) {
        throw new Error("Erro ao buscar dados")
      }
      const data = await response.json()
      setInformacoes(data)
    } catch (err) {
      setError(err instanceof Error ? err.message : "Erro desconhecido")
    } finally {
      setLoading(false)
    }
  }

  const adicionarAlteracaoDivida = async () => {
    const valor = Number.parseFloat(valorAlteracao)
    if (isNaN(valor) || valor === 0) {
      setFeedbackMessage("❌ Por favor, digite um valor válido!")
      setTimeout(() => setFeedbackMessage(""), 3000)
      return
    }

    console.log("[v0] Valor digitado:", valorAlteracao)
    console.log("[v0] Valor parseado:", valor)
    console.log("[v0] Dívida atual antes:", dividaAtual)

    const descricaoFinal = descricaoAlteracao || (valor > 0 ? "Aumento da dívida" : "Redução da dívida")

    // Salvar alteração no banco primeiro
    try {
      console.log("[v0] Salvando alteração da dívida no banco:", { valor, descricao: descricaoFinal })
      const response = await fetch("/api/divida-alteracoes", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          valor,
          descricao: descricaoFinal,
        }),
      })

      if (response.ok) {
        console.log("[v0] Alteração salva com sucesso no banco")
        
        // Recalcular valor atual baseado no banco
        await recalcularDivida()
        
        // Recarregar alterações do banco
        await fetchAlteracoesBanco()
      } else {
        console.error("[v0] Erro ao salvar alteração:", await response.text())
        return // Não atualiza se não salvou
      }
    } catch (error) {
      console.error("[v0] Erro na requisição:", error)
      return // Não atualiza se não salvou
    }

    // Mostrar feedback
    const valorFormatado = new Intl.NumberFormat("pt-BR", {
      style: "currency",
      currency: "BRL",
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(Math.abs(valor))
    
    setFeedbackMessage(
      valor > 0 
        ? `✅ Dívida aumentada em ${valorFormatado}!`
        : `✅ Dívida reduzida em ${valorFormatado}!`
    )
    
    // Limpar feedback após 3 segundos
    setTimeout(() => setFeedbackMessage(""), 3000)

    // Limpar campos
    setValorAlteracao("")
    setDescricaoAlteracao("")
  }

  // Função para resetar dívida para valor inicial
  const resetarDivida = async () => {
    if (confirm("Tem certeza que deseja resetar a dívida para R$ 1 bilhão? Isso apagará todas as alterações!")) {
      try {
        // Limpar todas as alterações do banco
        const { error } = await supabase
          .from('divida_alteracoes')
          .delete()
          .neq('id', 0) // Deleta todos os registros
        
        if (error) {
          console.error("[v0] Erro ao limpar alterações:", error)
          return
        }
        
        // Recalcular valor (deve voltar para R$ 1 bilhão)
        await recalcularDivida()
        
        // Recarregar alterações do banco
        await fetchAlteracoesBanco()
        
        setFeedbackMessage("✅ Dívida resetada para R$ 1 bilhão!")
        setTimeout(() => setFeedbackMessage(""), 3000)
      } catch (error) {
        console.error("[v0] Erro no reset:", error)
        setFeedbackMessage("❌ Erro ao resetar dívida")
        setTimeout(() => setFeedbackMessage(""), 3000)
      }
    }
  }

  const adicionarNoticia = async () => {
    if (!novaNoticia.text.trim()) return

    setSubmittingNoticia(true)
    try {
      console.log("[v0] Enviando notícia para o banco:", novaNoticia)
      const response = await fetch("/api/inter-data", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(novaNoticia),
      })

      console.log("[v0] Resposta da API:", response.status, response.statusText)

      if (response.ok) {
        const result = await response.json()
        console.log("[v0] Notícia salva com sucesso:", result)
        setNovaNoticia({ text: "", text2: "", text3: "", text4: "", text5: "" })
        await fetchData() // Recarregar dados
      } else {
        const errorData = await response.json()
        console.error("[v0] Erro ao salvar notícia:", errorData)
      }
    } catch (error) {
      console.error("[v0] Erro na requisição:", error)
    } finally {
      setSubmittingNoticia(false)
    }
  }

  // Carregar valor atual da dívida na inicialização
  useEffect(() => {
    const initializeData = async () => {
      // Carregar valor atual da dívida
      const valorAtual = await fetchDividaAtual()
      
      // Carregar dados das notícias
      await fetchData()
      
      // Carregar alterações do banco
      await fetchAlteracoesBanco()
      
      // Carregar taxa Selic
      await fetchTaxaSelic()
      
      // Verificar se juros precisam ser aplicados (silenciosamente)
      await verificarJurosAutomatico()
      
      // Se o valor carregado é diferente do base, não animar
      if (valorAtual !== dividaBase) {
        console.log("[v0] Valor carregado diferente do base, pulando animação")
        return
      }
      
      // Animar contador apenas se for o valor base inicial
      console.log("[v0] Iniciando animação do contador")
      const targetValue = valorAtual
      const duration = 3000 // 3 segundos
      const steps = 60
      const increment = targetValue / steps
      let current = 0
      let step = 0

      const timer = setInterval(() => {
        if (step < steps) {
          current += increment
          setDividaAtual(Math.floor(current))
          step++
        } else {
          setDividaAtual(targetValue)
          clearInterval(timer)
        }
      }, duration / steps)
    }

    initializeData()
  }, [])

  // Função para formatar valor em reais
  const formatarReal = (valor: number) => {
    return new Intl.NumberFormat("pt-BR", {
      style: "currency",
      currency: "BRL",
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(valor)
  }

  // Função para calcular incremento por segundo baseado na Selic real
  const calcularIncrementoPorSegundo = () => {
    if (taxaSelic && taxaSelic.taxa_selic_diaria) {
      // Juros por segundo = (dívida atual * taxa diária) / 86400 segundos
      const jurosPorSegundo = (dividaAtual * taxaSelic.taxa_selic_diaria) / 86400
      return Math.floor(jurosPorSegundo)
    }
    // Fallback para estimativa
    return Math.floor(dividaBase * 0.000001)
  }

  return (
    <div style={{ minHeight: '100vh', padding: '1rem' }}>
      <div className="container">
        {/* Header */}
        <div className="text-center mb-6">
          <div className="flex items-center justify-center gap-4 mb-4">
            <h1 className="text-4xl font-bold text-red-600">
              Dívida do Internacional
            </h1>
            <button 
              onClick={() => setShowAdmin(!showAdmin)}
              className="btn btn-outline btn-sm"
            >
              ⚙️ Admin
            </button>
          </div>
          <p className="text-lg text-gray-600">
            Contador em tempo real da situação financeira do Sport Club Internacional
          </p>
        </div>

        {/* Painel Admin */}
        <div className={`collapse ${showAdmin ? 'expanded' : 'collapsed'}`}>
          <div className="card bg-blue-50 border-blue-200">
            <div className="card-header">
              <h2 className="card-title">⚙️ Painel Administrativo</h2>
            </div>
            <div className="flex flex-col gap-6">
              {/* Adicionar Notícia */}
              <div>
                <h3 className="font-semibold mb-4">Adicionar Nova Notícia</h3>
                <div className="grid grid-2 mb-4">
                  <div>
                    <label className="label">Título Principal</label>
                    <input
                      className="input"
                      value={novaNoticia.text}
                      onChange={(e) => setNovaNoticia((prev) => ({ ...prev, text: e.target.value }))}
                      placeholder="Título da notícia..."
                    />
                  </div>
                  <div>
                    <label className="label">Subtítulo</label>
                    <input
                      className="input"
                      value={novaNoticia.text2}
                      onChange={(e) => setNovaNoticia((prev) => ({ ...prev, text2: e.target.value }))}
                      placeholder="Subtítulo..."
                    />
                  </div>
                </div>
                <div className="mb-4">
                  <label className="label">Descrição</label>
                  <textarea
                    className="textarea"
                    value={novaNoticia.text3}
                    onChange={(e) => setNovaNoticia((prev) => ({ ...prev, text3: e.target.value }))}
                    placeholder="Descrição detalhada..."
                    rows={3}
                  />
                </div>
                <div className="grid grid-2 mb-4">
                  <div>
                    <label className="label">Informação Extra 1</label>
                    <input
                      className="input"
                      value={novaNoticia.text4}
                      onChange={(e) => setNovaNoticia((prev) => ({ ...prev, text4: e.target.value }))}
                      placeholder="Informação adicional..."
                    />
                  </div>
                  <div>
                    <label className="label">Informação Extra 2</label>
                    <input
                      className="input"
                      value={novaNoticia.text5}
                      onChange={(e) => setNovaNoticia((prev) => ({ ...prev, text5: e.target.value }))}
                      placeholder="Informação adicional..."
                    />
                  </div>
                </div>
                <button
                  onClick={adicionarNoticia}
                  disabled={submittingNoticia || !novaNoticia.text.trim()}
                  className="btn btn-primary"
                >
                  📝 {submittingNoticia ? "Adicionando..." : "Adicionar Notícia"}
                </button>
              </div>

              <div className="divider"></div>

              {/* Sistema de Juros Selic */}
              <div>
                <h3 className="font-semibold mb-4">💹 Sistema de Juros Selic</h3>
                {taxaSelic && (
                  <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 mb-4">
                    <div className="grid grid-2 gap-4">
                      <div>
                        <p className="text-sm font-medium">Taxa Selic Anual:</p>
                        <p className="text-lg font-bold text-blue-600">{taxaSelic.taxa_selic_anual}% a.a.</p>
                      </div>
                      <div>
                        <p className="text-sm font-medium">Taxa Diária:</p>
                        <p className="text-lg font-bold text-green-600">
                          {taxaSelic.taxa_selic_diaria_percentual?.toFixed(4)}% ao dia
                        </p>
                      </div>
                    </div>
                    <div className="mt-2">
                      <p className="text-xs text-gray-600">
                        Fonte: {taxaSelic.fonte} | Data: {taxaSelic.data_referencia}
                      </p>
                    </div>
                  </div>
                )}
                <div className="flex gap-4">
                  <button
                    onClick={aplicarJuros}
                    disabled={aplicandoJuros}
                    className="btn btn-primary"
                  >
                    {aplicandoJuros ? "Aplicando..." : "💰 Aplicar Juros de Hoje"}
                  </button>
                  <button
                    onClick={fetchTaxaSelic}
                    className="btn btn-outline"
                  >
                    🔄 Atualizar Taxa Selic
                  </button>
                </div>
                <p className="text-sm text-gray-600 mt-2">
                  💡 Os juros são aplicados automaticamente uma vez por dia baseados na taxa Selic
                </p>
              </div>

              <div className="divider"></div>

              {/* Controle da Dívida */}
              <div>
                <h3 className="font-semibold mb-4">Controle da Dívida</h3>
                
                {/* Feedback Message */}
                {feedbackMessage && (
                  <div className="alert alert-success mb-4">
                    <span>🎉</span>
                    <div>{feedbackMessage}</div>
                  </div>
                )}
                
                <div className="grid grid-3">
                  <div>
                    <label className="label">Valor (R$)</label>
                    <input
                      className="input"
                      type="number"
                      value={valorAlteracao}
                      onChange={(e) => setValorAlteracao(e.target.value)}
                      placeholder="Ex: -200000000 ou 50000000"
                      step="1000000"
                    />
                    <div className="text-sm text-gray-500 mt-2">
                      <p>Use valores negativos para diminuir</p>
                      {valorAlteracao && !isNaN(Number(valorAlteracao)) && (
                        <p className="font-medium text-blue-600">
                          Valor: {new Intl.NumberFormat("pt-BR", {
                            style: "currency",
                            currency: "BRL",
                            minimumFractionDigits: 0,
                            maximumFractionDigits: 0,
                          }).format(Number(valorAlteracao))}
                        </p>
                      )}
                      <div className="flex gap-1 mt-2 flex-wrap">
                        <button 
                          type="button"
                          onClick={() => setValorAlteracao("1000000")}
                          className="btn btn-outline btn-sm text-xs"
                        >
                          +1M
                        </button>
                        <button 
                          type="button"
                          onClick={() => setValorAlteracao("10000000")}
                          className="btn btn-outline btn-sm text-xs"
                        >
                          +10M
                        </button>
                        <button 
                          type="button"
                          onClick={() => setValorAlteracao("100000000")}
                          className="btn btn-outline btn-sm text-xs"
                        >
                          +100M
                        </button>
                        <button 
                          type="button"
                          onClick={() => setValorAlteracao("-50000000")}
                          className="btn btn-outline btn-sm text-xs"
                        >
                          -50M
                        </button>
                      </div>
                    </div>
                  </div>
                  <div>
                    <label className="label">Descrição</label>
                    <input
                      className="input"
                      type="text"
                      value={descricaoAlteracao}
                      onChange={(e) => {
                        console.log("[v0] Descrição alterada:", e.target.value)
                        setDescricaoAlteracao(e.target.value)
                      }}
                      placeholder="Motivo da alteração..."
                      autoComplete="off"
                      style={{
                        pointerEvents: 'auto',
                        userSelect: 'text',
                        cursor: 'text'
                      }}
                    />
                    {descricaoAlteracao && (
                      <p className="text-xs text-gray-500 mt-1">
                        Descrição: "{descricaoAlteracao}"
                      </p>
                    )}
                    <div className="flex gap-1 mt-2">
                      <button 
                        type="button"
                        onClick={() => setDescricaoAlteracao("Teste de digitação")}
                        className="btn btn-outline btn-sm text-xs"
                      >
                        Teste
                      </button>
                      <button 
                        type="button"
                        onClick={() => setDescricaoAlteracao("")}
                        className="btn btn-outline btn-sm text-xs"
                      >
                        Limpar
                      </button>
                    </div>
                  </div>
                  <div>
                    <label className="label">Ação</label>
                    <div className="flex flex-col gap-2">
                      <button
                        onClick={adicionarAlteracaoDivida}
                        disabled={!valorAlteracao}
                        className={`btn w-full ${Number.parseFloat(valorAlteracao) < 0 ? 'btn-green' : 'btn-red'}`}
                      >
                        {Number.parseFloat(valorAlteracao) < 0 ? '➖' : '➕'} Aplicar Alteração
                      </button>
                      <button
                        onClick={resetarDivida}
                        className="btn btn-outline w-full btn-sm"
                      >
                        🔄 Resetar para R$ 1bi
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Contador Principal */}
        <div className="card border-red-200">
          <div className="card-header text-center">
            <h2 className="card-title text-2xl text-red-600">💰 Dívida Atual</h2>
            <p className="card-subtitle">Valor aproximado baseado em dados públicos</p>
          </div>
          <div className="text-center">
            <div className="text-6xl font-bold text-red-600 font-mono count-animation mb-4">
              {formatarReal(dividaAtual)}
            </div>
            <div className="flex items-center justify-center gap-2 text-sm text-gray-600 mb-4">
              <span>📈</span>
              <span>
                +{formatarReal(calcularIncrementoPorSegundo())} por segundo
                {taxaSelic ? (
                  <span className="text-blue-600 font-medium"> (Selic: {taxaSelic.taxa_selic_anual}% a.a.)</span>
                ) : (
                  <span> (estimativa)</span>
                )}
              </span>
            </div>
            <div className="badge badge-red">
              Dados aproximados - Última atualização: 17/09/2025
            </div>
          </div>
        </div>

        {/* Histórico de Alterações do Banco */}
        {alteracoesBanco.length > 0 && (
          <div className="card">
            <div className="card-header">
              <div className="flex justify-between items-center">
                <h2 className="card-title">💾 Histórico de Entradas e Saídas</h2>
                <button
                  onClick={fetchAlteracoesBanco}
                  className="btn btn-outline btn-sm"
                >
                  🔄 Atualizar
                </button>
              </div>
              <p className="card-subtitle">Todas as alterações salvas no banco de dados</p>
            </div>
            <div className="flex flex-col gap-4">
              {alteracoesBanco.map((alteracao) => (
                <div key={alteracao.id} className="flex justify-between items-center p-4 border rounded-lg">
                  <div className="flex items-center gap-4">
                    <span className={Number(alteracao.valor) < 0 ? 'text-green-600' : 'text-red-600'}>
                      {Number(alteracao.valor) < 0 ? '💸' : '💰'}
                    </span>
                    <div>
                      <p className="font-medium">
                        {alteracao.descricao || (Number(alteracao.valor) > 0 ? "Aumento da dívida" : "Redução da dívida")}
                      </p>
                      <p className="text-sm text-gray-500">
                        {new Date(alteracao.created_at).toLocaleString("pt-BR")}
                      </p>
                    </div>
                  </div>
                  <div className={`font-bold text-lg ${Number(alteracao.valor) < 0 ? 'text-green-600' : 'text-red-600'}`}>
                    {Number(alteracao.valor) < 0 ? '' : '+'}
                    {new Intl.NumberFormat("pt-BR", {
                      style: "currency",
                      currency: "BRL",
                      minimumFractionDigits: 0,
                      maximumFractionDigits: 0,
                    }).format(Number(alteracao.valor))}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}


        {/* Informações Oficiais e Cronologia */}
        <div className="grid grid-2 gap-6">
          <div className="card">
            <div className="card-header">
              <h2 className="card-title">ℹ️ Informações Oficiais Reporter Jonas Zeferino</h2>
            </div>
            <div className="flex flex-col gap-4">
              <div>
                <h4 className="font-semibold mb-2">Situação Atual:</h4>
                <p className="text-sm text-gray-600">
                  O Internacional enfrenta dificuldades financeiras há alguns anos, com dívidas que incluem salários
                  atrasados, débitos com fornecedores e questões tributárias.
                </p>
              </div>
            </div>
          </div>

          <div className="card">
            <div className="card-header">
              <h2 className="card-title">📅 Cronologia Recente</h2>
            </div>
            <div className="flex flex-col gap-4">
              <div className="flex items-center gap-4">
                <div className="w-3 h-3 bg-red-500 rounded-full"></div>
                <div>
                  <div className="font-semibold text-sm">2023-2024</div>
                  <div className="text-sm text-gray-600">Contratação do melhor time da história</div>
                </div>
              </div>
              <div className="flex items-center gap-4">
                <div className="w-3 h-3 bg-yellow-500 rounded-full"></div>
                <div>
                  <div className="font-semibold text-sm">2024</div>
                  <div className="text-sm text-gray-600">Infelizmente o time não ganhou nada</div>
                </div>
              </div>
              <div className="flex items-center gap-4">
                <div className="w-3 h-3 bg-green-500 rounded-full"></div>
                <div>
                  <div className="font-semibold text-sm">2025</div>
                  <div className="text-sm text-gray-600">Folha enxuta</div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Dados do Banco */}
        <div className="card">
          <div className="card-header">
            <div className="flex justify-between items-center">
              <h2 className="card-title">ℹ️ Informações Adicionais</h2>
              <button
                onClick={fetchData}
                disabled={loading}
                className="btn btn-outline btn-sm"
              >
                {loading ? <span className="spinner"></span> : '🔄'} Atualizar
              </button>
            </div>
          </div>

          {loading && (
            <div className="text-center py-8">
              <div className="spinner spinner-lg mb-4"></div>
              <p>Carregando informações...</p>
            </div>
          )}

          {error && (
            <div className="alert alert-error">
              <span>⚠️</span>
              <div>
                <div className="font-bold">Erro!</div>
                <div>
                  {error}
                  <br />
                  <span className="text-sm">Verifique a conexão com o banco de dados</span>
                </div>
              </div>
            </div>
          )}

          {!loading && !error && informacoes.length === 0 && (
            <div className="text-center py-8 text-gray-500">
              <p>Nenhuma informação adicional encontrada no banco de dados.</p>
              <p className="text-sm mt-2">Adicione dados na tabela 'inter' para visualizar aqui.</p>
            </div>
          )}

          {!loading && !error && informacoes.length > 0 && (
            <div className="flex flex-col gap-4">
              {informacoes.map((info) => (
                <div key={info.id} className="border rounded-lg p-4">
                  <div className="flex justify-between items-start mb-2">
                    <h4 className="font-semibold">{info.text}</h4>
                    <span className="badge badge-outline">
                      {new Date(info.created_at).toLocaleDateString("pt-BR")}
                    </span>
                  </div>
                  {info.text2 && <p className="text-sm mb-1">{info.text2}</p>}
                  {info.text3 && <p className="text-sm text-gray-600 mb-1">{info.text3}</p>}
                  {info.text4 && <p className="text-sm mb-1">{info.text4}</p>}
                  {info.text5 && <p className="text-sm">{info.text5}</p>}
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Disclaimer */}
        <div className="alert alert-warning">
          <span>⚠️</span>
          <div>
            <div className="font-bold">Aviso Importante</div>
            <div className="text-sm">
              Os valores apresentados são estimativas baseadas em informações públicas e não representam dados
              oficiais exatos. Para informações precisas, consulte os demonstrativos financeiros oficiais do clube.
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
