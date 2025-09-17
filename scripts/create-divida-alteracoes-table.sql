-- Criar tabela para armazenar alterações da dívida
CREATE TABLE IF NOT EXISTS divida_alteracoes (
    id SERIAL PRIMARY KEY,
    valor BIGINT NOT NULL,
    descricao TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Inserir alguns dados de exemplo
INSERT INTO divida_alteracoes (valor, descricao, created_at) VALUES 
(-50000000, 'Pagamento de dívida com fornecedores', NOW() - INTERVAL '2 days'),
(25000000, 'Multa por atraso em pagamentos', NOW() - INTERVAL '1 day'),
(-100000000, 'Venda de jogador para quitação de débitos', NOW() - INTERVAL '5 hours');
