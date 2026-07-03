import { useEffect, useState } from 'react'
import { getResumo } from '../lib/api'
import type { ResumoIngressos } from '../lib/supabase'

export function Dashboard() {
  const [resumo, setResumo] = useState<ResumoIngressos | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    loadResumo()
  }, [])

  async function loadResumo() {
    try {
      setLoading(true)
      const data = await getResumo()
      setResumo(data)
    } catch (err) {
      setError('Erro ao carregar estatísticas')
    } finally {
      setLoading(false)
    }
  }

  if (loading) {
    return <div className="loading">Carregando estatísticas...</div>
  }

  if (error) {
    return <div className="error-message">{error}</div>
  }

  return (
    <div className="dashboard-page">
      <div className="page-header">
        <h1>Dashboard</h1>
        <p>Resumo estatístico de vendas (cálculo em memória)</p>
      </div>

      <div className="stats-grid">
        <div className="stat-card">
          <div className="stat-icon">🎫</div>
          <div className="stat-content">
            <span className="stat-value">{resumo?.total_ingressos || 0}</span>
            <span className="stat-label">Total de Ingressos Vendidos</span>
          </div>
        </div>

        <div className="stat-card">
          <div className="stat-icon">💰</div>
          <div className="stat-content">
            <span className="stat-value">
              R$ {(resumo?.receita_total || 0).toFixed(2)}
            </span>
            <span className="stat-label">Receita Total</span>
          </div>
        </div>

        <div className="stat-card">
          <div className="stat-icon">📊</div>
          <div className="stat-content">
            <span className="stat-value">
              {(resumo?.taxa_ocupacao_media || 0).toFixed(1)}%
            </span>
            <span className="stat-label">Taxa de Ocupação Média</span>
          </div>
        </div>

        <div className="stat-card highlight">
          <div className="stat-icon">🏆</div>
          <div className="stat-content">
            <span className="stat-value">
              {resumo?.evento_top_vendas?.nome || 'N/A'}
            </span>
            <span className="stat-label">
              {resumo?.evento_top_vendas
                ? `${resumo.evento_top_vendas.total_vendas} ingressos vendidos`
                : 'Evento com mais vendas'}
            </span>
          </div>
        </div>
      </div>

      <div className="dashboard-info">
        <h2>Sobre as Métricas</h2>
        <div className="info-cards">
          <div className="info-card">
            <h3>Cálculo em Memória</h3>
            <p>
              As estatísticas são calculadas em memória no cliente, processando
              todos os dados retornados do banco. Isso simula o comportamento
              de métricas calculadas via loops/streams em Java.
            </p>
          </div>
          <div className="info-card">
            <h3>Taxa de Ocupação</h3>
            <p>
              A taxa média de ocupação é calculada dividindo o total de ingressos
              vendidos pela capacidade do local para cada evento, depois tirando
              a média de todos os eventos.
            </p>
          </div>
          <div className="info-card">
            <h3>Evento Destaque</h3>
            <p>
              O evento com maior número de vendas é determinado percorrendo
              todos os ingressos e contando quantos pertencem a cada evento.
            </p>
          </div>
        </div>
      </div>

      <div className="api-docs">
        <h2>Endpoint: GET /ingressos/resumo</h2>
        <p>
          As estatísticas são equivalentes ao endpoint de resumo do projeto Java.
          Em uma implementação backend, seria:
        </p>
        <pre className="code-block">
{`GET /ingressos/resumo

Response:
{
  "total_ingressos": ${resumo?.total_ingressos || 0},
  "receita_total": ${resumo?.receita_total || 0},
  "taxa_ocupacao_media": ${resumo?.taxa_ocupacao_media || 0},
  "evento_top_vendas": ${resumo?.evento_top_vendas ? `{
    "id": "${resumo.evento_top_vendas.id}",
    "nome": "${resumo.evento_top_vendas.nome}",
    "total_vendas": ${resumo.evento_top_vendas.total_vendas}
  }` : 'null'}
}`}
        </pre>
      </div>
    </div>
  )
}
