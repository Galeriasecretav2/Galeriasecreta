/*
  # Create candidaturas table and storage

  1. New Tables
    - `candidaturas`
      - `id` (uuid, primary key)
      - `nome` (text, required)
      - `idade` (integer, required)
      - `pais` (text, required)
      - `provincia` (text, required)
      - `email` (text, required)
      - `whatsapp` (text, required)
      - `foto_url` (text, optional)
      - `foto_nome` (text, optional)
      - `foto_path` (text, optional)
      - `termos_aceit` (boolean, default true)
      - `status` (text, default 'pendente')
      - `observacoes` (text, default '')
      - `created_at` (timestamp, default now)
      - `updated_at` (timestamp, default now)

  2. Storage
    - Create `candidaturas-fotos` bucket for photo uploads
    - Enable public access for uploaded photos

  3. Security
    - Enable RLS on `candidaturas` table
    - Add policies for public insert (for applications)
    - Add policies for authenticated read/update (for admin)
*/

-- Create candidaturas table
CREATE TABLE IF NOT EXISTS candidaturas (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  nome text NOT NULL,
  idade integer NOT NULL CHECK (idade >= 18 AND idade <= 65),
  pais text NOT NULL DEFAULT 'Moçambique',
  provincia text NOT NULL,
  email text NOT NULL,
  whatsapp text NOT NULL,
  foto_url text,
  foto_nome text,
  foto_path text,
  termos_aceit boolean DEFAULT true,
  status text DEFAULT 'pendente' CHECK (status IN ('pendente', 'aprovado', 'rejeitado', 'em_analise')),
  observacoes text DEFAULT '',
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Enable RLS
ALTER TABLE candidaturas ENABLE ROW LEVEL SECURITY;

-- Create policies
CREATE POLICY "Allow public insert for applications"
  ON candidaturas
  FOR INSERT
  TO anon
  WITH CHECK (true);

CREATE POLICY "Allow authenticated users to read all"
  ON candidaturas
  FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Allow authenticated users to update"
  ON candidaturas
  FOR UPDATE
  TO authenticated
  USING (true);

-- Create storage bucket for photos
INSERT INTO storage.buckets (id, name, public)
VALUES ('candidaturas-fotos', 'candidaturas-fotos', true)
ON CONFLICT (id) DO NOTHING;

-- Create storage policies
CREATE POLICY "Allow public upload of candidatura photos"
  ON storage.objects
  FOR INSERT
  TO anon
  WITH CHECK (bucket_id = 'candidaturas-fotos');

CREATE POLICY "Allow public read of candidatura photos"
  ON storage.objects
  FOR SELECT
  TO anon
  USING (bucket_id = 'candidaturas-fotos');

CREATE POLICY "Allow authenticated delete of candidatura photos"
  ON storage.objects
  FOR DELETE
  TO authenticated
  USING (bucket_id = 'candidaturas-fotos');

-- Create updated_at trigger
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = now();
    RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER update_candidaturas_updated_at
    BEFORE UPDATE ON candidaturas
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();