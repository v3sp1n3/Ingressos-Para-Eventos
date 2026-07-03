import { supabase } from './supabase'
import type { Evento, Local, Ingresso, Endereco, ResumoIngressos } from './supabase'

// Locais API
export async function getLocais(): Promise<Local[]> {
  const { data, error } = await supabase
    .from('locais')
    .select('*')
    .order('created_at', { ascending: false })

  if (error) throw error
  return data || []
}

export async function getLocal(id: string): Promise<Local | null> {
  const { data, error } = await supabase
    .from('locais')
    .select('*')
    .eq('id', id)
    .maybeSingle()

  if (error) throw error
  return data
}

export async function createLocal(local: Omit<Local, 'id' | 'created_at'>): Promise<Local> {
  const { data, error } = await supabase
    .from('locais')
    .insert(local)
    .select()
    .single()

  if (error) throw error
  return data
}

export async function updateLocal(id: string, local: Partial<Local>): Promise<Local> {
  const { data, error } = await supabase
    .from('locais')
    .update(local)
    .eq('id', id)
    .select()
    .single()

  if (error) throw error
  return data
}

export async function deleteLocal(id: string): Promise<void> {
  const { error } = await supabase
    .from('locais')
    .delete()
    .eq('id', id)

  if (error) throw error
}

// Eventos API
export async function getEventos(): Promise<Evento[]> {
  const { data, error } = await supabase
    .from('eventos')
    .select(`
      *,
      local:locais(*)
    `)
    .order('data', { ascending: true })

  if (error) throw error
  return data || []
}

export async function getEvento(id: string): Promise<Evento | null> {
  const { data, error } = await supabase
    .from('eventos')
    .select(`
      *,
      local:locais(*)
    `)
    .eq('id', id)
    .maybeSingle()

  if (error) throw error
  return data
}

export async function createEvento(evento: Omit<Evento, 'id' | 'created_at' | 'local' | 'ingressos_vendidos'>): Promise<Evento> {
  const { data, error } = await supabase
    .from('eventos')
    .insert(evento)
    .select(`
      *,
      local:locais(*)
    `)
    .single()

  if (error) throw error
  return data
}

export async function updateEvento(id: string, evento: Partial<Evento>): Promise<Evento> {
  const { data, error } = await supabase
    .from('eventos')
    .update(evento)
    .eq('id', id)
    .select(`
      *,
      local:locais(*)
    `)
    .single()

  if (error) throw error
  return data
}

export async function deleteEvento(id: string): Promise<void> {
  const { error } = await supabase
    .from('eventos')
    .delete()
    .eq('id', id)

  if (error) throw error
}

// Ingressos API with business rules
export async function getIngressos(usuarioId: string): Promise<Ingresso[]> {
  const { data, error } = await supabase
    .from('ingressos')
    .select(`
      *,
      evento:eventos(
        *,
        local:locais(*)
      )
    `)
    .eq('usuario_id', usuarioId)
    .order('data_compra', { ascending: false })

  if (error) throw error
  return data || []
}

// Get ticket count for an event
async function getTicketCountForEvent(eventoId: string): Promise<number> {
  const { count, error } = await supabase
    .from('ingressos')
    .select('*', { count: 'exact', head: true })
    .eq('evento_id', eventoId)

  if (error) throw error
  return count || 0
}

// Get user ticket count for a specific event
async function getUserTicketCountForEvent(usuarioId: string, eventoId: string): Promise<number> {
  const { count, error } = await supabase
    .from('ingressos')
    .select('*', { count: 'exact', head: true })
    .eq('usuario_id', usuarioId)
    .eq('evento_id', eventoId)

  if (error) throw error
  return count || 0
}

export interface CompraIngressoResult {
  success: boolean
  ingresso?: Ingresso
  error?: string
}

// Purchase ticket with business rule validation
export async function comprarIngresso(
  usuarioId: string,
  eventoId: string,
  quantidade: number = 1
): Promise<CompraIngressoResult> {
  try {
    // Get event with venue capacity
    const evento = await getEvento(eventoId)
    if (!evento) {
      return { success: false, error: 'Evento não encontrado' }
    }

    // Get current ticket counts
    const ticketsSold = await getTicketCountForEvent(eventoId)
    const userTickets = await getUserTicketCountForEvent(usuarioId, eventoId)

    // Business rule 1: Capacity check
    if (ticketsSold + quantidade > evento.local!.capacidade) {
      const disponivel = evento.local!.capacidade - ticketsSold
      return {
        success: false,
        error: `Capacidade máxima atingida. Apenas ${disponivel} ingressos disponíveis.`
      }
    }

    // Business rule 2: Max 5 tickets per user per event
    if (userTickets + quantidade > 5) {
      return {
        success: false,
        error: `Limite de 5 ingressos por usuário para este evento. Você já possui ${userTickets} ingresso(s).`
      }
    }

    // Create tickets
    const ingressos: Ingresso[] = []
    for (let i = 0; i < quantidade; i++) {
      const { data, error } = await supabase
        .from('ingressos')
        .insert({
          usuario_id: usuarioId,
          evento_id: eventoId,
          valor_pago: evento.preco,
          data_compra: new Date().toISOString(),
        })
        .select(`
          *,
          evento:eventos(
            *,
            local:locais(*)
          )
        `)
        .single()

      if (error) throw error
      if (data) ingressos.push(data)
    }

    return { success: true, ingresso: ingressos[0] }
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Erro ao comprar ingresso'
    }
  }
}

// Endereco API
export async function getEndereco(usuarioId: string): Promise<Endereco | null> {
  const { data, error } = await supabase
    .from('enderecos')
    .select('*')
    .eq('usuario_id', usuarioId)
    .maybeSingle()

  if (error) throw error
  return data
}

export async function createEndereco(endereco: Omit<Endereco, 'id' | 'created_at'>): Promise<Endereco> {
  const { data, error } = await supabase
    .from('enderecos')
    .insert(endereco)
    .select()
    .single()

  if (error) throw error
  return data
}

export async function updateEndereco(usuarioId: string, endereco: Partial<Endereco>): Promise<Endereco> {
  const { data, error } = await supabase
    .from('enderecos')
    .update(endereco)
    .eq('usuario_id', usuarioId)
    .select()
    .single()

  if (error) throw error
  return data
}

export async function upsertEndereco(endereco: Omit<Endereco, 'id' | 'created_at'>): Promise<Endereco> {
  const existing = await getEndereco(endereco.usuario_id)

  if (existing) {
    return updateEndereco(endereco.usuario_id, endereco)
  }

  return createEndereco(endereco)
}

// Statistics endpoint
export async function getResumo(): Promise<ResumoIngressos> {
  // Get all tickets with event and venue info
  const { data: ingressos, error: ingressosError } = await supabase
    .from('ingressos')
    .select(`
      valor_pago,
      evento:eventos(
        id,
        nome,
        local:locais(capacidade)
      )
    `)

  if (ingressosError) throw ingressosError

  // Get all events with capacity
  const { data: eventos, error: eventosError } = await supabase
    .from('eventos')
    .select(`
      id,
      nome,
      local:locais(capacidade)
    `)

  if (eventosError) throw eventosError

  // Calculate metrics in memory
  const totalIngressos = ingressos?.length || 0
  const receitaTotal = ingressos?.reduce((sum, i) => sum + Number(i.valor_pago), 0) || 0

  // Calculate average occupancy rate
  const eventosMap = new Map<string, { nome: string; capacidade: number; vendidos: number }>()

  eventos?.forEach(e => {
    if (e.local) {
      const localData = Array.isArray(e.local) ? e.local[0] : e.local
      eventosMap.set(e.id, {
        nome: e.nome,
        capacidade: localData?.capacidade || 0,
        vendidos: 0
      })
    }
  })

  ingressos?.forEach(i => {
    const eventoId = (i.evento as any)?.id
    if (eventoId && eventosMap.has(eventoId)) {
      const e = eventosMap.get(eventoId)!
      e.vendidos++
    }
  })

  const taxasOcupacao = Array.from(eventosMap.values()).map(e =>
    e.capacidade > 0 ? e.vendidos / e.capacidade : 0
  )
  const taxaOcupacaoMedia = taxasOcupacao.length > 0
    ? taxasOcupacao.reduce((a, b) => a + b, 0) / taxasOcupacao.length * 100
    : 0

  // Find top selling event
  let eventoTopVendas: ResumoIngressos['evento_top_vendas'] = null
  let maxVendas = 0

  eventosMap.forEach((e, id) => {
    if (e.vendidos > maxVendas) {
      maxVendas = e.vendidos
      eventoTopVendas = {
        id,
        nome: e.nome,
        total_vendas: e.vendidos
      }
    }
  })

  return {
    total_ingressos: totalIngressos,
    receita_total: receitaTotal,
    taxa_ocupacao_media: Math.round(taxaOcupacaoMedia * 100) / 100,
    evento_top_vendas: eventoTopVendas
  }
}
