-- ========================================
-- SETUP COMPLETO DO BANCO DE DADOS
-- Contador de Dívida do Internacional
-- ========================================

-- 1. Tabela para informações/notícias
CREATE TABLE IF NOT EXISTS inter (
    id SERIAL PRIMARY KEY,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    text TEXT,
    text2 TEXT,
    text3 TEXT,
    text4 TEXT,
    text5 TEXT
);

-- 2. Tabela para alterações da dívida (histórico)
CREATE TABLE IF NOT EXISTS divida_alteracoes (
    id SERIAL PRIMARY KEY,
    valor BIGINT NOT NULL,
    descricao TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 3. Tabela para valor atual da dívida (estado atual)
CREATE TABLE IF NOT EXISTS divida_atual (
  id SERIAL PRIMARY KEY,
  valor BIGINT NOT NULL DEFAULT 1000000000, -- R$ 1 bilhão como valor inicial
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- ========================================
-- DADOS INICIAIS
-- ========================================

-- Inserir valor inicial da dívida se não existir
INSERT INTO divida_atual (valor) 
SELECT 1000000000 
WHERE NOT EXISTS (SELECT 1 FROM divida_atual);

-- Inserir algumas notícias de exemplo
INSERT INTO inter (text, text2, text3, text4, text5) 
SELECT * FROM (VALUES 
    ('Situação Financeira Atual', 
     'O Internacional enfrenta uma das maiores crises financeiras de sua história.',
     'Dívidas acumuladas incluem salários, fornecedores e questões tributárias.',
     'Clube trabalha em programa de reestruturação financeira.',
     'Fonte: Demonstrativos financeiros públicos'),
    ('Medidas de Recuperação',
     'Implementação de gestão profissional e controle rigoroso de gastos.',
     'Venda estratégica de jogadores para equilibrar as contas.',
     'Renegociação de contratos e parcelamento de dívidas.',
     'Busca por novos investidores e parcerias comerciais.')
) AS v(text, text2, text3, text4, text5)
WHERE NOT EXISTS (SELECT 1 FROM inter WHERE text = v.text);

-- Inserir algumas alterações de exemplo
INSERT INTO divida_alteracoes (valor, descricao, created_at) 
SELECT * FROM (VALUES 
    (-50000000, 'Pagamento de dívida com fornecedores', NOW() - INTERVAL '2 days'),
    (25000000, 'Multa por atraso em pagamentos', NOW() - INTERVAL '1 day'),
    (-100000000, 'Venda de jogador para quitação de débitos', NOW() - INTERVAL '5 hours')
) AS v(valor, descricao, created_at)
WHERE NOT EXISTS (SELECT 1 FROM divida_alteracoes WHERE descricao = v.descricao);

-- ========================================
-- FUNCTIONS E TRIGGERS
-- ========================================

-- Função para atualizar automaticamente o updated_at
CREATE OR REPLACE FUNCTION update_divida_atual_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = CURRENT_TIMESTAMP;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger para atualizar updated_at automaticamente
DROP TRIGGER IF EXISTS update_divida_atual_updated_at_trigger ON divida_atual;
CREATE TRIGGER update_divida_atual_updated_at_trigger
    BEFORE UPDATE ON divida_atual
    FOR EACH ROW
    EXECUTE FUNCTION update_divida_atual_updated_at();

-- ========================================
-- VERIFICAÇÃO FINAL
-- ========================================

-- Mostrar status das tabelas criadas
SELECT 'inter' as tabela, COUNT(*) as registros FROM inter
UNION ALL
SELECT 'divida_alteracoes' as tabela, COUNT(*) as registros FROM divida_alteracoes  
UNION ALL
SELECT 'divida_atual' as tabela, COUNT(*) as registros FROM divida_atual;

-- Mostrar valor atual da dívida
SELECT 
    'Valor atual da dívida: R$ ' || TO_CHAR(valor, 'FM999,999,999,999') as status,
    updated_at as ultima_atualizacao
FROM divida_atual 
ORDER BY id DESC 
LIMIT 1;
