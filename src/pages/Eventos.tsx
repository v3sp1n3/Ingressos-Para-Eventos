import { useEffect, useState } from 'react'
import { getEventos, comprarIngresso } from '../lib/api'
import type { Evento } from '../lib/supabase'
import { useAuth } from '../context/AuthContext'

export function Eventos() {
  const [eventos, setEventos] = useState<Evento[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [buyingId, setBuyingId] = useState<string | null>(null)
  const [buyError, setBuyError] = useState<string | null>(null)
  const [success, setSuccess] = useState<string | null>(null)
  const { user } = useAuth()

  useEffect(() => {
    loadEventos()
  }, [])

  async function loadEventos() {
    try {
      setLoading(true)
      const data = await getEventos()
      setEventos(data)
    } catch (err) {
      setError('Erro ao carregar eventos')
    } finally {
      setLoading(false)
    }
  }

  async function handleComprar(eventoId: string) {
    if (!user) return

    setBuyingId(eventoId)
    setBuyError(null)
    setSuccess(null)

    const result = await comprarIngresso(user.id, eventoId, 1)

    if (result.success) {
      setSuccess('Ingresso comprado com sucesso!')
      await loadEventos()
    } else {
      setBuyError(result.error || 'Erro ao comprar ingresso')
    }

    setBuyingId(null)
  }

  function formatDate(date: string) {
    return new Date(date).toLocaleDateString('pt-BR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric'
    })
  }

  if (loading) {
    return <div className="loading">Carregando eventos...</div>
  }

  if (error) {
    return <div className="error-message">{error}</div>
  }

  return (
    <div className="eventos-page">
      <div className="page-header">
        <h1>Eventos Disponíveis</h1>
        <p>Escolha um evento e compre seus ingressos</p>
      </div>

      {buyError && <div className="error-message">{buyError}</div>}
      {success && <div className="success-message">{success}</div>}

      <div className="eventos-grid">
        {eventos.map((evento) => (
          <div key={evento.id} className="evento-card">
            <div className="evento-header">
              <h2>{evento.nome}</h2>
              <span className="evento-preco">
                R$ {Number(evento.preco).toFixed(2)}
              </span>
            </div>

            {evento.descricao && (
              <p className="evento-descricao">{evento.descricao}</p>
            )}

            <div className="evento-info">
              <div className="info-item">
                <strong>Local:</strong> {evento.local?.nome}
              </div>
              <div className="info-item">
                <strong>Endereço:</strong> {evento.local?.endereco}
              </div>
              <div className="info-item">
                <strong>Data:</strong> {formatDate(evento.data)}
              </div>
              <div className="info-item">
                <strong>Horário:</strong> {evento.horario}
              </div>
              <div className="info-item">
                <strong>Capacidade:</strong> {evento.local?.capacidade} pessoas
              </div>
            </div>

            <button
              className="btn btn-primary btn-block"
              onClick={() => handleComprar(evento.id)}
              disabled={buyingId === evento.id}
            >
              {buyingId === evento.id ? 'Processando...' : 'Comprar Ingresso'}
            </button>
          </div>
        ))}
      </div>

      {eventos.length === 0 && (
        <div className="empty-state">
          <p>Nenhum evento disponível no momento.</p>
        </div>
      )}
    </div>
  )
}
