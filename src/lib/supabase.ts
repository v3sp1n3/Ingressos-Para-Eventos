import { createClient } from '@supabase/supabase-js'

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY

if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error('Missing Supabase environment variables')
}

export const supabase = createClient(supabaseUrl, supabaseAnonKey)

// Types
export interface Usuario {
  id: string
  nome: string
  email: string
  telefone?: string
  created_at: string
}

export interface Endereco {
  id: string
  usuario_id: string
  logradouro: string
  numero: string
  complemento?: string
  bairro: string
  cidade: string
  estado: string
  cep: string
  created_at: string
}

export interface Local {
  id: string
  nome: string
  endereco: string
  capacidade: number
  created_at: string
}

export interface Evento {
  id: string
  local_id: string
  nome: string
  descricao?: string | null
  data: string
  horario: string
  preco: number
  created_at: string
  local?: Local
  ingressos_vendidos?: number
}

export interface Ingresso {
  id: string
  usuario_id: string
  evento_id: string
  data_compra: string
  valor_pago: number
  created_at: string
  evento?: Evento
}

export interface ResumoIngressos {
  total_ingressos: number
  receita_total: number
  taxa_ocupacao_media: number
  evento_top_vendas: {
    id: string
    nome: string
    total_vendas: number
  } | null
}
