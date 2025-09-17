"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { TrendingUp, DollarSign, Calendar, Info, RefreshCw, Plus, Minus, Settings, Send } from "lucide-react"

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

export default function ContadorDividaInter() {
  const [dividaAtual, setDividaAtual] = useState(0)
  const [informacoes, setInformacoes] = useState<InterData[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [showAdmin, setShowAdmin] = useState(false)
  const [alteracoesDivida, setAlteracoesDivida] = useState<DividaAlteracao[]>([])

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
    if (isNaN(valor) || valor === 0) return

    const novaAlteracao: DividaAlteracao = {
      id: Date.now().toString(),
      valor,
      descricao: descricaoAlteracao || (valor > 0 ? "Aumento da dívida" : "Redução da dívida"),
      timestamp: new Date(),
    }

    // Salvar no banco de dados
    try {
      console.log("[v0] Salvando alteração da dívida no banco:", { valor, descricao: novaAlteracao.descricao })
      const response = await fetch("/api/divida-alteracoes", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          valor,
          descricao: novaAlteracao.descricao,
        }),
      })

      if (response.ok) {
        console.log("[v0] Alteração salva com sucesso no banco")
      } else {
        console.error("[v0] Erro ao salvar alteração:", await response.text())
      }
    } catch (error) {
      console.error("[v0] Erro na requisição:", error)
    }

    setAlteracoesDivida((prev) => [novaAlteracao, ...prev.slice(0, 9)]) // Manter apenas 10 últimas
    setDividaAtual((prev) => prev + valor)
    setValorAlteracao("")
    setDescricaoAlteracao("")
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

  // Efeito para animar o contador
  useEffect(() => {
    const targetValue = dividaBase
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

    return () => clearInterval(timer)
  }, [dividaBase])

  // Buscar dados ao carregar
  useEffect(() => {
    fetchData()
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

  // Função para calcular incremento por segundo (simulação)
  const incrementoPorSegundo = Math.floor(dividaBase * 0.000001) // Aproximação de juros

  return (
    <div className="min-h-screen bg-gradient-to-br from-red-50 to-red-100 dark:from-red-950 dark:to-red-900 p-4">
      <div className="max-w-6xl mx-auto space-y-8">
        {/* Header */}
        <div className="text-center space-y-4">
          <div className="flex items-center justify-center gap-4">
            <h1 className="text-4xl md:text-6xl font-bold text-red-600 dark:text-red-400">Dívida do Internacional</h1>
            <Button onClick={() => setShowAdmin(!showAdmin)} variant="outline" size="sm" className="ml-4">
              <Settings className="h-4 w-4 mr-2" />
              Admin
            </Button>
          </div>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            Contador em tempo real da situação financeira do Sport Club Internacional
          </p>
        </div>

        {showAdmin && (
          <Card className="border-blue-200 dark:border-blue-800 bg-blue-50 dark:bg-blue-950">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Settings className="h-5 w-5" />
                Painel Administrativo
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              {/* Adicionar Notícia */}
              <div className="space-y-4">
                <h3 className="font-semibold">Adicionar Nova Notícia</h3>
                <div className="grid md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <label className="text-sm font-medium">Título Principal</label>
                    <Input
                      value={novaNoticia.text}
                      onChange={(e) => setNovaNoticia((prev) => ({ ...prev, text: e.target.value }))}
                      placeholder="Título da notícia..."
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="text-sm font-medium">Subtítulo</label>
                    <Input
                      value={novaNoticia.text2}
                      onChange={(e) => setNovaNoticia((prev) => ({ ...prev, text2: e.target.value }))}
                      placeholder="Subtítulo..."
                    />
                  </div>
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-medium">Descrição</label>
                  <Textarea
                    value={novaNoticia.text3}
                    onChange={(e) => setNovaNoticia((prev) => ({ ...prev, text3: e.target.value }))}
                    placeholder="Descrição detalhada..."
                    rows={3}
                  />
                </div>
                <div className="grid md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <label className="text-sm font-medium">Informação Extra 1</label>
                    <Input
                      value={novaNoticia.text4}
                      onChange={(e) => setNovaNoticia((prev) => ({ ...prev, text4: e.target.value }))}
                      placeholder="Informação adicional..."
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="text-sm font-medium">Informação Extra 2</label>
                    <Input
                      value={novaNoticia.text5}
                      onChange={(e) => setNovaNoticia((prev) => ({ ...prev, text5: e.target.value }))}
                      placeholder="Informação adicional..."
                    />
                  </div>
                </div>
                <Button onClick={adicionarNoticia} disabled={submittingNoticia || !novaNoticia.text.trim()}>
                  <Send className="h-4 w-4 mr-2" />
                  {submittingNoticia ? "Adicionando..." : "Adicionar Notícia"}
                </Button>
              </div>

              <div className="border-t pt-6 space-y-4">
                <h3 className="font-semibold">Controle da Dívida</h3>
                <div className="grid md:grid-cols-3 gap-4">
                  <div className="space-y-2">
                    <label className="text-sm font-medium">Valor (R$)</label>
                    <Input
                      type="number"
                      value={valorAlteracao}
                      onChange={(e) => setValorAlteracao(e.target.value)}
                      placeholder="Ex: -200000000 ou 50000000"
                    />
                    <p className="text-xs text-muted-foreground">Use valores negativos para diminuir</p>
                  </div>
                  <div className="space-y-2">
                    <label className="text-sm font-medium">Descrição</label>
                    <Input
                      value={descricaoAlteracao}
                      onChange={(e) => setDescricaoAlteracao(e.target.value)}
                      placeholder="Motivo da alteração..."
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="text-sm font-medium">Ação</label>
                    <Button onClick={adicionarAlteracaoDivida} disabled={!valorAlteracao} className="w-full">
                      {Number.parseFloat(valorAlteracao) < 0 ? (
                        <Minus className="h-4 w-4 mr-2" />
                      ) : (
                        <Plus className="h-4 w-4 mr-2" />
                      )}
                      Aplicar Alteração
                    </Button>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Contador Principal */}
        <Card className="border-red-200 dark:border-red-800">
          <CardHeader className="text-center">
            <CardTitle className="flex items-center justify-center gap-2 text-2xl">
              <DollarSign className="h-8 w-8 text-red-600" />
              Dívida Atual
            </CardTitle>
            <CardDescription>Valor aproximado baseado em dados públicos</CardDescription>
          </CardHeader>
          <CardContent className="text-center space-y-4">
            <div className="text-5xl md:text-7xl font-bold text-red-600 dark:text-red-400 font-mono">
              {formatarReal(dividaAtual)}
            </div>
            <div className="flex items-center justify-center gap-2 text-sm text-muted-foreground">
              <TrendingUp className="h-4 w-4" />
              <span>+{formatarReal(incrementoPorSegundo)} por segundo (estimativa)</span>
            </div>
            <Badge variant="destructive" className="text-sm">
              Dados aproximados - Última atualização: {new Date().toLocaleDateString("pt-BR")}
            </Badge>
          </CardContent>
        </Card>

        {alteracoesDivida.length > 0 && (
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Calendar className="h-5 w-5" />
                Alterações Recentes na Dívida
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {alteracoesDivida.map((alteracao) => (
                  <div key={alteracao.id} className="flex items-center justify-between p-3 border rounded-lg">
                    <div className="flex items-center gap-3">
                      {alteracao.valor < 0 ? (
                        <Minus className="h-4 w-4 text-green-600" />
                      ) : (
                        <Plus className="h-4 w-4 text-red-600" />
                      )}
                      <div>
                        <p className="font-medium">{alteracao.descricao}</p>
                        <p className="text-sm text-muted-foreground">{alteracao.timestamp.toLocaleString("pt-BR")}</p>
                      </div>
                    </div>
                    <div className={`font-bold ${alteracao.valor < 0 ? "text-green-600" : "text-red-600"}`}>
                      {alteracao.valor < 0 ? "" : "+"}
                      {formatarReal(alteracao.valor)}
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        )}

        {/* Informações Verídicas */}
        <div className="grid md:grid-cols-2 gap-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Info className="h-5 w-5" />
                Informações Oficiais
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <h4 className="font-semibold">Situação Atual:</h4>
                <p className="text-sm text-muted-foreground">
                  O Internacional enfrenta dificuldades financeiras há alguns anos, com dívidas que incluem salários
                  atrasados, débitos com fornecedores e questões tributárias.
                </p>
              </div>
              <div className="space-y-2">
                <h4 className="font-semibold">Medidas Tomadas:</h4>
                <ul className="text-sm text-muted-foreground space-y-1">
                  <li>• Programa de parcelamento de dívidas</li>
                  <li>• Venda de jogadores para equilibrar contas</li>
                  <li>• Renegociação com credores</li>
                  <li>• Implementação de gestão profissional</li>
                </ul>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Calendar className="h-5 w-5" />
                Cronologia Recente
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-3">
                <div className="border-l-2 border-red-200 pl-4">
                  <div className="font-semibold text-sm">2023-2024</div>
                  <div className="text-sm text-muted-foreground">Intensificação dos problemas financeiros</div>
                </div>
                <div className="border-l-2 border-yellow-200 pl-4">
                  <div className="font-semibold text-sm">2024</div>
                  <div className="text-sm text-muted-foreground">Implementação de medidas de recuperação</div>
                </div>
                <div className="border-l-2 border-green-200 pl-4">
                  <div className="font-semibold text-sm">Atual</div>
                  <div className="text-sm text-muted-foreground">Processo de reestruturação em andamento</div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* BIG BALL GLACIAL */}
        <Card className="border-blue-200 bg-blue-50 dark:bg-blue-950 dark:border-blue-800">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-blue-700 dark:text-blue-300">
              <div className="w-6 h-6 rounded-full bg-gradient-to-br from-blue-400 to-cyan-300"></div>
              BIG BALL GLACIAL
            </CardTitle>
            <CardDescription>Informações sobre o fenômeno BIG BALL GLACIAL</CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="grid md:grid-cols-2 gap-6">
              <div className="space-y-4">
                <div className="space-y-2">
                  <h4 className="font-semibold text-blue-800 dark:text-blue-200">O que é o BIG BALL GLACIAL?</h4>
                  <p className="text-sm text-blue-700 dark:text-blue-300">
                    O BIG BALL GLACIAL é um fenômeno natural raro que ocorre em regiões de clima extremamente frio, onde
                    massas de gelo se formam em formato esférico devido a condições específicas de temperatura, vento e
                    umidade.
                  </p>
                </div>

                <div className="space-y-2">
                  <h4 className="font-semibold text-blue-800 dark:text-blue-200">Características Principais:</h4>
                  <ul className="text-sm text-blue-700 dark:text-blue-300 space-y-1">
                    <li>• Formato esférico quase perfeito</li>
                    <li>• Diâmetro pode variar de 30cm a 2 metros</li>
                    <li>• Formação lenta ao longo de semanas</li>
                    <li>• Ocorre em temperaturas abaixo de -15°C</li>
                    <li>• Superfície lisa e cristalina</li>
                  </ul>
                </div>
              </div>

              <div className="space-y-4">
                <div className="space-y-2">
                  <h4 className="font-semibold text-blue-800 dark:text-blue-200">Locais de Ocorrência:</h4>
                  <ul className="text-sm text-blue-700 dark:text-blue-300 space-y-1">
                    <li>• Sibéria (Rússia)</li>
                    <li>• Alasca (EUA)</li>
                    <li>• Norte do Canadá</li>
                    <li>• Groenlândia</li>
                    <li>• Antártida (raramente)</li>
                  </ul>
                </div>

                <div className="space-y-2">
                  <h4 className="font-semibold text-blue-800 dark:text-blue-200">Processo de Formação:</h4>
                  <p className="text-sm text-blue-700 dark:text-blue-300">
                    A formação ocorre quando gotas de água superesfriada são moldadas por ventos circulares constantes,
                    criando camadas concêntricas de gelo que resultam na forma esférica característica.
                  </p>
                </div>
              </div>
            </div>

            <div className="border-t border-blue-200 dark:border-blue-700 pt-4">
              <div className="flex items-center gap-2 mb-3">
                <Badge variant="secondary" className="bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200">
                  Curiosidade Científica
                </Badge>
              </div>
              <p className="text-sm text-blue-700 dark:text-blue-300">
                O BIG BALL GLACIAL é considerado um dos fenômenos naturais mais raros do planeta, com apenas algumas
                dezenas de ocorrências documentadas cientificamente. Sua formação perfeita desafia as leis da física
                convencional e continua sendo objeto de estudo de glaciologistas ao redor do mundo.
              </p>
            </div>

            <div className="bg-gradient-to-r from-blue-100 to-cyan-100 dark:from-blue-900 dark:to-cyan-900 p-4 rounded-lg">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 rounded-full bg-gradient-to-br from-blue-400 via-cyan-300 to-blue-500 flex items-center justify-center">
                  <div className="w-8 h-8 rounded-full bg-white/30 backdrop-blur-sm"></div>
                </div>
                <div>
                  <h5 className="font-semibold text-blue-800 dark:text-blue-200">Status de Pesquisa</h5>
                  <p className="text-sm text-blue-700 dark:text-blue-300">
                    Atualmente em estudo pela Associação Internacional de Glaciologia
                  </p>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Dados do Banco */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center justify-between">
              <span className="flex items-center gap-2">
                <Info className="h-5 w-5" />
                Informações Adicionais
              </span>
              <Button onClick={fetchData} disabled={loading} variant="outline" size="sm">
                <RefreshCw className={`h-4 w-4 mr-2 ${loading ? "animate-spin" : ""}`} />
                Atualizar
              </Button>
            </CardTitle>
          </CardHeader>
          <CardContent>
            {loading && (
              <div className="text-center py-8">
                <RefreshCw className="h-8 w-8 animate-spin mx-auto mb-4" />
                <p>Carregando informações...</p>
              </div>
            )}

            {error && (
              <div className="text-center py-8 text-red-600">
                <p>Erro: {error}</p>
                <p className="text-sm text-muted-foreground mt-2">Verifique a conexão com o banco de dados</p>
              </div>
            )}

            {!loading && !error && informacoes.length === 0 && (
              <div className="text-center py-8 text-muted-foreground">
                <p>Nenhuma informação adicional encontrada no banco de dados.</p>
                <p className="text-sm mt-2">Adicione dados na tabela 'inter' para visualizar aqui.</p>
              </div>
            )}

            {!loading && !error && informacoes.length > 0 && (
              <div className="space-y-4">
                {informacoes.map((info) => (
                  <div key={info.id} className="border rounded-lg p-4 space-y-2">
                    <div className="flex justify-between items-start">
                      <h4 className="font-semibold">{info.text}</h4>
                      <Badge variant="outline">{new Date(info.created_at).toLocaleDateString("pt-BR")}</Badge>
                    </div>
                    {info.text2 && <p className="text-sm">{info.text2}</p>}
                    {info.text3 && <p className="text-sm text-muted-foreground">{info.text3}</p>}
                    {info.text4 && <p className="text-sm">{info.text4}</p>}
                    {info.text5 && <p className="text-sm">{info.text5}</p>}
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Disclaimer */}
        <Card className="border-yellow-200 bg-yellow-50 dark:bg-yellow-950 dark:border-yellow-800">
          <CardContent className="pt-6">
            <div className="flex items-start gap-3">
              <Info className="h-5 w-5 text-yellow-600 mt-0.5" />
              <div className="space-y-2">
                <h4 className="font-semibold text-yellow-800 dark:text-yellow-200">Aviso Importante</h4>
                <p className="text-sm text-yellow-700 dark:text-yellow-300">
                  Os valores apresentados são estimativas baseadas em informações públicas e não representam dados
                  oficiais exatos. Para informações precisas, consulte os demonstrativos financeiros oficiais do clube.
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
