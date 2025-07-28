/*
  # Criar tabela de usuários para login

  1. Nova Tabela
    - `usuarios`
      - `id` (uuid, primary key)
      - `email` (text, unique)
      - `senha_hash` (text)
      - `nome` (text)
      - `tipo_usuario` (text) - admin, modelo, cliente
      - `ativo` (boolean)
      - `ultimo_login` (timestamp)
      - `tentativas_login` (integer)
      - `bloqueado_ate` (timestamp)
      - `token_reset` (text)
      - `token_reset_expira` (timestamp)
      - `created_at` (timestamp)
      - `updated_at` (timestamp)

  2. Segurança
    - Enable RLS na tabela `usuarios`
    - Políticas para leitura e atualização de dados próprios
    - Política para inserção pública (registro)

  3. Índices
    - Índice único no email
    - Índice no tipo_usuario
    - Índice no ultimo_login
*/

CREATE TABLE IF NOT EXISTS usuarios (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  email text UNIQUE NOT NULL,
  senha_hash text NOT NULL,
  nome text NOT NULL,
  tipo_usuario text DEFAULT 'cliente' CHECK (tipo_usuario IN ('admin', 'modelo', 'cliente')),
  ativo boolean DEFAULT true,
  ultimo_login timestamptz,
  tentativas_login integer DEFAULT 0,
  bloqueado_ate timestamptz,
  token_reset text,
  token_reset_expira timestamptz,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Índices para performance
CREATE INDEX IF NOT EXISTS idx_usuarios_email ON usuarios(email);
CREATE INDEX IF NOT EXISTS idx_usuarios_tipo ON usuarios(tipo_usuario);
CREATE INDEX IF NOT EXISTS idx_usuarios_ultimo_login ON usuarios(ultimo_login);
CREATE INDEX IF NOT EXISTS idx_usuarios_ativo ON usuarios(ativo);

-- Enable RLS
ALTER TABLE usuarios ENABLE ROW LEVEL SECURITY;

-- Políticas RLS
CREATE POLICY "Usuários podem ler seus próprios dados"
  ON usuarios
  FOR SELECT
  TO authenticated
  USING (auth.uid()::text = id::text);

CREATE POLICY "Usuários podem atualizar seus próprios dados"
  ON usuarios
  FOR UPDATE
  TO authenticated
  USING (auth.uid()::text = id::text);

CREATE POLICY "Admins podem ler todos os usuários"
  ON usuarios
  FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM usuarios 
      WHERE id::text = auth.uid()::text 
      AND tipo_usuario = 'admin'
    )
  );

CREATE POLICY "Permitir inserção pública para registro"
  ON usuarios
  FOR INSERT
  TO anon
  WITH CHECK (true);

-- Função para atualizar updated_at
CREATE OR REPLACE FUNCTION update_usuarios_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger para updated_at
DROP TRIGGER IF EXISTS update_usuarios_updated_at ON usuarios;
CREATE TRIGGER update_usuarios_updated_at
  BEFORE UPDATE ON usuarios
  FOR EACH ROW
  EXECUTE FUNCTION update_usuarios_updated_at();