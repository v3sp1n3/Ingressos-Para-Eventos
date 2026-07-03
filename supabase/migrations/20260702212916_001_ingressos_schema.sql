/*
# Create Event Tickets System Schema

This migration sets up the complete database schema for an event ticket management system.

## 1. New Tables

### usuarios (public profile data)
- `id` (uuid, primary key) - References auth.users
- `nome` (text, not null) - Full name
- `email` (text, unique, not null) - Email address
- `telefone` (text) - Phone number
- `created_at` (timestamp) - Account creation date

### enderecos (OneToOne with usuarios)
- `id` (uuid, primary key)
- `usuario_id` (uuid, unique, not null) - FK to usuarios, ONE address per user
- `logradouro` (text, not null) - Street address
- `numero` (text, not null) - Street number
- `complemento` (text) - Address complement
- `bairro` (text, not null) - Neighborhood
- `cidade` (text, not null) - City
- `estado` (text, not null) - State (2 letters)
- `cep` (text, not null) - ZIP code
- `created_at` (timestamp)

### locais (Event venues)
- `id` (uuid, primary key)
- `nome` (text, not null) - Venue name
- `endereco` (text, not null) - Full address
- `capacidade` (integer, not null) - Maximum capacity
- `created_at` (timestamp)

### eventos (Events at venues)
- `id` (uuid, primary key)
- `local_id` (uuid, not null) - FK to locais (ManyToOne)
- `nome` (text, not null) - Event name
- `descricao` (text) - Event description
- `data` (date, not null) - Event date
- `horario` (time, not null) - Event time
- `preco` (decimal, not null) - Ticket price
- `created_at` (timestamp)

### ingressos (Transaction entity - ManyToOne with Usuario and Evento)
- `id` (uuid, primary key)
- `usuario_id` (uuid, not null) - FK to usuarios (buyer)
- `evento_id` (uuid, not null) - FK to eventos
- `data_compra` (timestamp, not null) - Purchase date
- `valor_pago` (decimal, not null) - Amount paid
- `created_at` (timestamp)

## 2. Security

- Enable RLS on all tables
- Usuarios/enderecos: Users can only access their own data
- Locais/eventos: Public read, authenticated write (admin-like)
- Ingressos: Users can only access their own tickets

## 3. Important Notes

1. The endereco table has a UNIQUE constraint on usuario_id to enforce OneToOne
2. Capacidade on locais is used for business rule validation (no exceeding capacity)
3. Preco on eventos is stored for historical reference (valor_pago on ingresso records actual paid amount)
*/

-- Usuarios table (public profile, extends auth.users)
CREATE TABLE IF NOT EXISTS usuarios (
  id uuid PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  nome text NOT NULL,
  email text UNIQUE NOT NULL,
  telefone text,
  created_at timestamptz DEFAULT now()
);

-- Enderecos table (OneToOne with usuarios)
CREATE TABLE IF NOT EXISTS enderecos (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  usuario_id uuid UNIQUE NOT NULL REFERENCES usuarios(id) ON DELETE CASCADE,
  logradouro text NOT NULL,
  numero text NOT NULL,
  complemento text,
  bairro text NOT NULL,
  cidade text NOT NULL,
  estado text NOT NULL CHECK (LENGTH(estado) = 2),
  cep text NOT NULL,
  created_at timestamptz DEFAULT now()
);

-- Locais table (event venues)
CREATE TABLE IF NOT EXISTS locais (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  nome text NOT NULL,
  endereco text NOT NULL,
  capacidade integer NOT NULL CHECK (capacidade > 0),
  created_at timestamptz DEFAULT now()
);

-- Eventos table (events at venues)
CREATE TABLE IF NOT EXISTS eventos (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  local_id uuid NOT NULL REFERENCES locais(id) ON DELETE CASCADE,
  nome text NOT NULL,
  descricao text,
  data date NOT NULL,
  horario time NOT NULL,
  preco decimal(10,2) NOT NULL CHECK (preco >= 0),
  created_at timestamptz DEFAULT now()
);

-- Ingressos table (transaction entity)
CREATE TABLE IF NOT EXISTS ingressos (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  usuario_id uuid NOT NULL REFERENCES usuarios(id) ON DELETE CASCADE,
  evento_id uuid NOT NULL REFERENCES eventos(id) ON DELETE CASCADE,
  data_compra timestamptz NOT NULL DEFAULT now(),
  valor_pago decimal(10,2) NOT NULL CHECK (valor_pago >= 0),
  created_at timestamptz DEFAULT now()
);

-- Enable RLS on all tables
ALTER TABLE usuarios ENABLE ROW LEVEL SECURITY;
ALTER TABLE enderecos ENABLE ROW LEVEL SECURITY;
ALTER TABLE locais ENABLE ROW LEVEL SECURITY;
ALTER TABLE eventos ENABLE ROW LEVEL SECURITY;
ALTER TABLE ingressos ENABLE ROW LEVEL SECURITY;

-- Usuarios policies (users can only access their own data)
DROP POLICY IF EXISTS "select_own_usuario" ON usuarios;
CREATE POLICY "select_own_usuario" ON usuarios FOR SELECT
  TO authenticated USING (auth.uid() = id);

DROP POLICY IF EXISTS "insert_own_usuario" ON usuarios;
CREATE POLICY "insert_own_usuario" ON usuarios FOR INSERT
  TO authenticated WITH CHECK (auth.uid() = id);

DROP POLICY IF EXISTS "update_own_usuario" ON usuarios;
CREATE POLICY "update_own_usuario" ON usuarios FOR UPDATE
  TO authenticated USING (auth.uid() = id) WITH CHECK (auth.uid() = id);

-- Enderecos policies (OneToOne - users can only access their own address)
DROP POLICY IF EXISTS "select_own_endereco" ON enderecos;
CREATE POLICY "select_own_endereco" ON enderecos FOR SELECT
  TO authenticated USING (auth.uid() = usuario_id);

DROP POLICY IF EXISTS "insert_own_endereco" ON enderecos;
CREATE POLICY "insert_own_endereco" ON enderecos FOR INSERT
  TO authenticated WITH CHECK (auth.uid() = usuario_id);

DROP POLICY IF EXISTS "update_own_endereco" ON enderecos;
CREATE POLICY "update_own_endereco" ON enderecos FOR UPDATE
  TO authenticated USING (auth.uid() = usuario_id) WITH CHECK (auth.uid() = usuario_id);

DROP POLICY IF EXISTS "delete_own_endereco" ON enderecos;
CREATE POLICY "delete_own_endereco" ON enderecos FOR DELETE
  TO authenticated USING (auth.uid() = usuario_id);

-- Locais policies (public read, authenticated write)
DROP POLICY IF EXISTS "select_locais" ON locais;
CREATE POLICY "select_locais" ON locais FOR SELECT
  TO anon, authenticated USING (true);

DROP POLICY IF EXISTS "insert_locais" ON locais;
CREATE POLICY "insert_locais" ON locais FOR INSERT
  TO authenticated WITH CHECK (true);

DROP POLICY IF EXISTS "update_locais" ON locais;
CREATE POLICY "update_locais" ON locais FOR UPDATE
  TO authenticated USING (true) WITH CHECK (true);

DROP POLICY IF EXISTS "delete_locais" ON locais;
CREATE POLICY "delete_locais" ON locais FOR DELETE
  TO authenticated USING (true);

-- Eventos policies (public read, authenticated write)
DROP POLICY IF EXISTS "select_eventos" ON eventos;
CREATE POLICY "select_eventos" ON eventos FOR SELECT
  TO anon, authenticated USING (true);

DROP POLICY IF EXISTS "insert_eventos" ON eventos;
CREATE POLICY "insert_eventos" ON eventos FOR INSERT
  TO authenticated WITH CHECK (true);

DROP POLICY IF EXISTS "update_eventos" ON eventos;
CREATE POLICY "update_eventos" ON eventos FOR UPDATE
  TO authenticated USING (true) WITH CHECK (true);

DROP POLICY IF EXISTS "delete_eventos" ON eventos;
CREATE POLICY "delete_eventos" ON eventos FOR DELETE
  TO authenticated USING (true);

-- Ingressos policies (users can only access their own tickets)
DROP POLICY IF EXISTS "select_own_ingressos" ON ingressos;
CREATE POLICY "select_own_ingressos" ON ingressos FOR SELECT
  TO authenticated USING (auth.uid() = usuario_id);

DROP POLICY IF EXISTS "insert_own_ingressos" ON ingressos;
CREATE POLICY "insert_own_ingressos" ON ingressos FOR INSERT
  TO authenticated WITH CHECK (auth.uid() = usuario_id);

DROP POLICY IF EXISTS "delete_own_ingressos" ON ingressos;
CREATE POLICY "delete_own_ingressos" ON ingressos FOR DELETE
  TO authenticated USING (auth.uid() = usuario_id);

-- Create indexes for performance
CREATE INDEX IF NOT EXISTS idx_enderecos_usuario_id ON enderecos(usuario_id);
CREATE INDEX IF NOT EXISTS idx_eventos_local_id ON eventos(local_id);
CREATE INDEX IF NOT EXISTS idx_ingressos_usuario_id ON ingressos(usuario_id);
CREATE INDEX IF NOT EXISTS idx_ingressos_evento_id ON ingressos(evento_id);