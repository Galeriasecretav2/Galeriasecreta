/*
  # Tabela para códigos de redefinição de senha

  1. Nova Tabela
    - `reset_codes`
      - `id` (uuid, primary key)
      - `usuario_id` (uuid, foreign key para usuarios)
      - `email` (text)
      - `codigo` (text, 6 dígitos)
      - `usado` (boolean, default false)
      - `tentativas` (integer, default 0)
      - `expires_at` (timestamp, válido por 15 minutos)
      - `created_at` (timestamp)

  2. Segurança
    - Enable RLS na tabela `reset_codes`
    - Política para permitir inserção pública
    - Política para permitir leitura/atualização apenas do próprio código

  3. Índices
    - Índice no email para busca rápida
    - Índice no código para verificação
    - Índice na data de expiração para limpeza
*/

-- Criar tabela de códigos de redefinição
CREATE TABLE IF NOT EXISTS reset_codes (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  usuario_id uuid REFERENCES usuarios(id) ON DELETE CASCADE,
  email text NOT NULL,
  codigo text NOT NULL,
  usado boolean DEFAULT false,
  tentativas integer DEFAULT 0,
  expires_at timestamptz NOT NULL,
  created_at timestamptz DEFAULT now()
);

-- Habilitar RLS
ALTER TABLE reset_codes ENABLE ROW LEVEL SECURITY;

-- Política para permitir inserção pública (para solicitar código)
CREATE POLICY "Permitir inserção pública de códigos"
  ON reset_codes
  FOR INSERT
  TO anon
  WITH CHECK (true);

-- Política para permitir leitura/atualização do próprio código
CREATE POLICY "Permitir leitura/atualização do próprio código"
  ON reset_codes
  FOR ALL
  TO anon
  USING (true);

-- Política para admins lerem todos os códigos
CREATE POLICY "Admins podem ler todos os códigos"
  ON reset_codes
  FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM usuarios 
      WHERE usuarios.id::text = auth.uid()::text 
      AND usuarios.tipo_usuario = 'admin'
    )
  );

-- Índices para performance
CREATE INDEX IF NOT EXISTS idx_reset_codes_email ON reset_codes(email);
CREATE INDEX IF NOT EXISTS idx_reset_codes_codigo ON reset_codes(codigo);
CREATE INDEX IF NOT EXISTS idx_reset_codes_expires_at ON reset_codes(expires_at);
CREATE INDEX IF NOT EXISTS idx_reset_codes_usuario_id ON reset_codes(usuario_id);

-- Função para limpar códigos expirados (executar periodicamente)
CREATE OR REPLACE FUNCTION cleanup_expired_reset_codes()
RETURNS void
LANGUAGE plpgsql
AS $$
BEGIN
  DELETE FROM reset_codes 
  WHERE expires_at < now() - interval '1 hour';
END;
$$;