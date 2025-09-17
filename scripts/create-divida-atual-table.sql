-- Tabela para armazenar o valor atual da dívida do Internacional
CREATE TABLE IF NOT EXISTS divida_atual (
  id SERIAL PRIMARY KEY,
  valor BIGINT NOT NULL DEFAULT 1000000000, -- R$ 1 bilhão como valor inicial
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Inserir valor inicial se a tabela estiver vazia
INSERT INTO divida_atual (valor) 
SELECT 1000000000 
WHERE NOT EXISTS (SELECT 1 FROM divida_atual);

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
