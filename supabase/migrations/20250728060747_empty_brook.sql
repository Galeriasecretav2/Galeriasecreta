/*
  # Criar tabela de inscrições

  1. Nova Tabela
    - `inscricoes`
      - `id` (uuid, chave primária)
      - `nome` (text, obrigatório)
      - `email` (text, único, obrigatório)
      - `telefone` (text, obrigatório)
      - `data_nascimento` (date, obrigatório)
      - `genero` (text, obrigatório)
      - `cidade` (text, obrigatório)
      - `provincia` (text, obrigatório)
      - `profissao` (text, opcional)
      - `experiencia_anterior` (boolean, padrão false)
      - `motivacao` (text, opcional)
      - `disponibilidade` (text, obrigatório)
      - `termos_aceitos` (boolean, padrão true)
      - `newsletter` (boolean, padrão false)
      - `status` (text, padrão 'pendente')
      - `observacoes` (text, padrão vazio)
      - `created_at` (timestamp)
      - `updated_at` (timestamp)

  2. Segurança
    - Habilitar RLS na tabela `inscricoes`
    - Adicionar política para inserção pública (anônimos)
    - Adicionar política para leitura/atualização por usuários autenticados

  3. Validações
    - Verificar idade mínima (18 anos)
    - Validar status permitidos
    - Validar gênero permitido
    - Validar disponibilidade permitida
*/

-- Criar tabela de inscrições
CREATE TABLE IF NOT EXISTS inscricoes (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  nome text NOT NULL,
  email text UNIQUE NOT NULL,
  telefone text NOT NULL,
  data_nascimento date NOT NULL,
  genero text NOT NULL CHECK (genero IN ('feminino', 'masculino', 'outro')),
  cidade text NOT NULL,
  provincia text NOT NULL,
  profissao text DEFAULT '',
  experiencia_anterior boolean DEFAULT false,
  motivacao text DEFAULT '',
  disponibilidade text NOT NULL CHECK (disponibilidade IN ('tempo_integral', 'meio_periodo', 'fins_semana', 'flexivel')),
  termos_aceitos boolean DEFAULT true,
  newsletter boolean DEFAULT false,
  status text DEFAULT 'pendente' CHECK (status IN ('pendente', 'aprovado', 'rejeitado', 'em_analise')),
  observacoes text DEFAULT '',
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Habilitar RLS
ALTER TABLE inscricoes ENABLE ROW LEVEL SECURITY;

-- Política para inserção pública (permite que visitantes se inscrevam)
CREATE POLICY "Permitir inserção pública de inscrições"
  ON inscricoes
  FOR INSERT
  TO anon
  WITH CHECK (true);

-- Política para leitura por usuários autenticados
CREATE POLICY "Permitir leitura para usuários autenticados"
  ON inscricoes
  FOR SELECT
  TO authenticated
  USING (true);

-- Política para atualização por usuários autenticados
CREATE POLICY "Permitir atualização para usuários autenticados"
  ON inscricoes
  FOR UPDATE
  TO authenticated
  USING (true);

-- Função para atualizar updated_at automaticamente
CREATE OR REPLACE FUNCTION update_inscricoes_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger para atualizar updated_at
CREATE TRIGGER update_inscricoes_updated_at
  BEFORE UPDATE ON inscricoes
  FOR EACH ROW
  EXECUTE FUNCTION update_inscricoes_updated_at();

-- Adicionar constraint para verificar idade mínima (18 anos)
ALTER TABLE inscricoes 
ADD CONSTRAINT inscricoes_idade_minima_check 
CHECK (data_nascimento <= CURRENT_DATE - INTERVAL '18 years');

-- Criar índices para melhor performance
CREATE INDEX IF NOT EXISTS idx_inscricoes_email ON inscricoes(email);
CREATE INDEX IF NOT EXISTS idx_inscricoes_status ON inscricoes(status);
CREATE INDEX IF NOT EXISTS idx_inscricoes_created_at ON inscricoes(created_at);
CREATE INDEX IF NOT EXISTS idx_inscricoes_provincia ON inscricoes(provincia);