-- Script para criar a tabela 'inter' caso não exista
-- Este script pode ser executado diretamente no v0

CREATE TABLE IF NOT EXISTS inter (
    id SERIAL PRIMARY KEY,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    text TEXT,
    text2 TEXT,
    text3 TEXT,
    text4 TEXT,
    text5 TEXT
);

-- Inserir alguns dados de exemplo sobre a situação do Internacional
INSERT INTO inter (text, text2, text3, text4, text5) VALUES 
(
    'Situação Financeira Atual',
    'O Internacional enfrenta uma das maiores crises financeiras de sua história.',
    'Dívidas acumuladas incluem salários, fornecedores e questões tributárias.',
    'Clube trabalha em programa de reestruturação financeira.',
    'Fonte: Demonstrativos financeiros públicos'
),
(
    'Medidas de Recuperação',
    'Implementação de gestão profissional e controle rigoroso de gastos.',
    'Venda estratégica de jogadores para equilibrar as contas.',
    'Renegociação de contratos e parcelamento de dívidas.',
    'Busca por novos investidores e parcerias comerciais.'
),
(
    'Impacto no Futebol',
    'Dificuldades para contratar novos jogadores devido às restrições financeiras.',
    'Necessidade de formar mais jogadores da base para reduzir custos.',
    'Foco em competições que garantam receita, como Libertadores.',
    'Manutenção do elenco principal apesar das dificuldades.'
);
