import { useEffect, useState } from 'react'
import { getIngressos } from '../lib/api'
import type { Ingresso } from '../lib/supabase'
import { useAuth } from '../context/AuthContext'

export function MeusIngressos() {
  const [ingressos, setIngressos] = useState<Ingresso[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const { user } = useAuth()

  useEffect(() => {
    if (user) {
      loadIngressos()
    }
  }, [user])

  async function loadIngressos() {
    if (!user) return

    try {
      setLoading(true)
      const data = await getIngressos(user.id)
      setIngressos(data)
    } catch (err) {
      setError('Erro ao carregar ingressos')
    } finally {
      setLoading(false)
    }
  }

  function formatDate(date: string) {
    return new Date(date).toLocaleDateString('pt-BR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    })
  }

  if (loading) {
    return <div className="loading">Carregando seus ingressos...</div>
  }

  if (error) {
    return <div className="error-message">{error}</div>
  }

  return (
    <div className="meus-ingressos-page">
      <div className="page-header">
        <h1>Meus Ingressos</h1>
        <p>Visualize todos os ingressos que você adquiriu</p>
      </div>

      <div className="ingressos-list">
        {ingressos.map((ingresso) => (
          <div key={ingresso.id} className="ingresso-card">
            <div className="ingresso-header">
              <h2>{ingresso.evento?.nome}</h2>
              <span className="ingresso-id">#{ingresso.id.slice(0, 8)}</span>
            </div>

            <div className="ingresso-body">
              <div className="ingresso-row">
                <span className="label">Local:</span>
                <span className="value">{ingresso.evento?.local?.nome}</span>
              </div>
              <div className="ingresso-row">
                <span className="label">Data do evento:</span>
                <span className="value">
                  {new Date(ingresso.evento?.data || '').toLocaleDateString('pt-BR')}
                </span>
              </div>
              <div className="ingresso-row">
                <span className="label">Horário:</span>
                <span className="value">{ingresso.evento?.horario}</span>
              </div>
              <div className="ingresso-row">
                <span className="label">Valor pago:</span>
                <span className="value highlighted">
                  R$ {Number(ingresso.valor_pago).toFixed(2)}
                </span>
              </div>
              <div className="ingresso-row">
                <span className="label">Data da compra:</span>
                <span className="value">{formatDate(ingresso.data_compra)}</span>
              </div>
            </div>

            <div className="ingresso-footer">
              <span className="status valid">Válido</span>
            </div>
          </div>
        ))}
      </div>

      {ingressos.length === 0 && (
        <div className="empty-state">
          <p>Você ainda não possui ingressos.</p>
          <a href="/eventos" className="btn btn-primary">Ver Eventos</a>
        </div>
      )}
    </div>
  )
}
