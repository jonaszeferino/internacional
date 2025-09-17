# 🗄️ Configuração do Banco PostgreSQL

## 🚀 Opção 1: Supabase (Recomendado - Gratuito)

### 1. Criar conta no Supabase
1. Acesse: https://supabase.com
2. Clique "Start your project"
3. Faça login com GitHub ou email

### 2. Criar projeto
1. Clique "New Project"
2. Nome: `internacional-divida`
3. Escolha uma senha forte
4. Região: `South America (São Paulo)`
5. Clique "Create new project"

### 3. Obter connection string
1. Vá em "Settings" → "Database"
2. Procure por "Connection string"
3. Copie a URI (formato: `postgresql://postgres:senha@...`)

### 4. Configurar no projeto
1. Crie arquivo `.env.local` na raiz do projeto:
```env
POSTGRES_URL="sua-connection-string-aqui"
```

### 5. Executar scripts SQL
1. No Supabase, vá em "SQL Editor"
2. Cole o conteúdo do arquivo `scripts/setup-complete-database.sql`
3. Clique "Run"

---

## 🐘 Opção 2: PostgreSQL Local

### 1. Instalar PostgreSQL
```bash
# Mac (com Homebrew)
brew install postgresql
brew services start postgresql

# Criar banco
createdb internacional
```

### 2. Configurar .env.local
```env
POSTGRES_URL="postgresql://postgres:@localhost:5432/internacional"
```

### 3. Executar scripts
```bash
psql -d internacional -f scripts/setup-complete-database.sql
```

---

## ☁️ Opção 3: Vercel Postgres

### 1. No dashboard da Vercel
1. Vá para seu projeto
2. Aba "Storage"
3. "Create Database" → "Postgres"

### 2. Configurar variáveis
- As variáveis são adicionadas automaticamente

### 3. Executar SQL
- Use o dashboard da Vercel para executar os scripts

---

## ☁️ Opção 4: Neon

### 1. Criar conta
1. Acesse: https://neon.tech
2. Crie conta gratuita

### 2. Criar projeto
1. Nome: `internacional-divida`
2. Região: `US East (Ohio)` ou mais próxima

### 3. Obter connection string
- Copie a connection string fornecida

---

## ✅ Verificação

Após configurar, teste no terminal:
```bash
# Reiniciar servidor
npm run dev

# Verificar logs - deve aparecer:
# "[v0] Valor atual da dívida carregado: 1000000000"
# Em vez de: "[v0] Usando dados de demonstração"
```

## 🎯 Funcionalidades que funcionarão:

✅ **Valor da dívida**: Persistido entre sessões
✅ **Alterações**: Histórico completo salvo
✅ **Notícias**: Dados reais do banco
✅ **Sincronização**: Múltiplos usuários veem o mesmo valor

## 📞 Precisa de ajuda?

Me diga qual opção escolheu e eu te ajudo com os detalhes específicos!
