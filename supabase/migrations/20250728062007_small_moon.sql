/*
  # Criar tabela de logs de login

  1. Nova Tabela
    - `login_logs`
      - `id` (uuid, primary key)
      - `usuario_id` (uuid, foreign key)
      - `email` (text)
      - `ip_address` (text)
      - `user_agent` (text)
      - `sucesso` (boolean)
      - `motivo_falha` (text)
      - `created_at` (timestamp)

  2. Segurança
    - Enable RLS na tabela `login_logs`
    - Apenas admins podem ler logs

  3. Índices
    - Índice no usuario_id
    - Índice no email
    - Índice no created_at
    - Índice no sucesso
*/

CREATE TABLE IF NOT EXISTS login_logs (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  usuario_id uuid REFERENCES usuarios(id) ON DELETE SET NULL,
  email text NOT NULL,
  ip_address text,
  user_agent text,
  sucesso boolean NOT NULL,
  motivo_falha text,
  created_at timestamptz DEFAULT now()
);

-- Índices para performance
CREATE INDEX IF NOT EXISTS idx_login_logs_usuario_id ON login_logs(usuario_id);
CREATE INDEX IF NOT EXISTS idx_login_logs_email ON login_logs(email);
CREATE INDEX IF NOT EXISTS idx_login_logs_created_at ON login_logs(created_at);
CREATE INDEX IF NOT EXISTS idx_login_logs_sucesso ON login_logs(sucesso);
CREATE INDEX IF NOT EXISTS idx_login_logs_ip ON login_logs(ip_address);

-- Enable RLS
ALTER TABLE login_logs ENABLE ROW LEVEL SECURITY;

-- Políticas RLS
CREATE POLICY "Apenas admins podem ler logs de login"
  ON login_logs
  FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM usuarios 
      WHERE id::text = auth.uid()::text 
      AND tipo_usuario = 'admin'
    )
  );

CREATE POLICY "Sistema pode inserir logs"
  ON login_logs
  FOR INSERT
  TO authenticated, anon
  WITH CHECK (true);