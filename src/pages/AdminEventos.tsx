import { useEffect, useState } from 'react'
import { getEventos, getLocais, createEvento, updateEvento, deleteEvento } from '../lib/api'
import type { Evento, Local } from '../lib/supabase'

export function AdminEventos() {
  const [eventos, setEventos] = useState<Evento[]>([])
  const [locais, setLocais] = useState<Local[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [showForm, setShowForm] = useState(false)
  const [editingId, setEditingId] = useState<string | null>(null)
  const [saving, setSaving] = useState(false)

  const [form, setForm] = useState({
    nome: '',
    descricao: '',
    local_id: '',
    data: '',
    horario: '',
    preco: ''
  })

  useEffect(() => {
    loadData()
  }, [])

  async function loadData() {
    try {
      setLoading(true)
      const [eventosData, locaisData] = await Promise.all([getEventos(), getLocais()])
      setEventos(eventosData)
      setLocais(locaisData)
    } catch (err) {
      setError('Erro ao carregar dados')
    } finally {
      setLoading(false)
    }
  }

  function resetForm() {
    setForm({
      nome: '',
      descricao: '',
      local_id: '',
      data: '',
      horario: '',
      preco: ''
    })
    setShowForm(false)
    setEditingId(null)
  }

  function handleEdit(evento: Evento) {
    setForm({
      nome: evento.nome,
      descricao: evento.descricao || '',
      local_id: evento.local_id,
      data: evento.data,
      horario: evento.horario,
      preco: evento.preco.toString()
    })
    setEditingId(evento.id)
    setShowForm(true)
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setSaving(true)
    setError(null)

    try {
      const data = {
        nome: form.nome,
        descricao: form.descricao || undefined,
        local_id: form.local_id,
        data: form.data,
        horario: form.horario,
        preco: parseFloat(form.preco)
      }

      if (editingId) {
        await updateEvento(editingId, data)
      } else {
        await createEvento(data as Parameters<typeof createEvento>[0])
      }

      await loadData()
      resetForm()
    } catch (err) {
      setError('Erro ao salvar evento')
    } finally {
      setSaving(false)
    }
  }

  async function handleDelete(id: string) {
    if (!confirm('Tem certeza que deseja excluir este evento?')) return

    try {
      await deleteEvento(id)
      await loadData()
    } catch (err) {
      setError('Erro ao excluir evento')
    }
  }

  function formatDate(date: string) {
    return new Date(date).toLocaleDateString('pt-BR')
  }

  if (loading) {
    return <div className="loading">Carregando eventos...</div>
  }

  return (
    <div className="admin-page">
      <div className="page-header">
        <h1>Gerenciar Eventos</h1>
        <p>Cadastre e gerencie os eventos disponíveis</p>
      </div>

      {error && <div className="error-message">{error}</div>}

      <button
        className="btn btn-primary"
        onClick={() => setShowForm(true)}
        disabled={showForm}
      >
        + Novo Evento
      </button>

      {showForm && (
        <div className="form-card">
          <h2>{editingId ? 'Editar Evento' : 'Novo Evento'}</h2>
          <form onSubmit={handleSubmit}>
            <div className="form-group">
              <label htmlFor="nome">Nome do Evento *</label>
              <input
                id="nome"
                type="text"
                value={form.nome}
                onChange={(e) => setForm({ ...form, nome: e.target.value })}
                placeholder="Show, Peça, Conferência..."
                required
              />
            </div>

            <div className="form-group">
              <label htmlFor="descricao">Descrição</label>
              <textarea
                id="descricao"
                value={form.descricao}
                onChange={(e) => setForm({ ...form, descricao: e.target.value })}
                placeholder="Descrição do evento..."
                rows={3}
              />
            </div>

            <div className="form-group">
              <label htmlFor="local_id">Local *</label>
              <select
                id="local_id"
                value={form.local_id}
                onChange={(e) => setForm({ ...form, local_id: e.target.value })}
                required
              >
                <option value="">Selecione um local</option>
                {locais.map((local) => (
                  <option key={local.id} value={local.id}>
                    {local.nome} (Cap: {local.capacidade})
                  </option>
                ))}
              </select>
            </div>

            <div className="form-row">
              <div className="form-group">
                <label htmlFor="data">Data *</label>
                <input
                  id="data"
                  type="date"
                  value={form.data}
                  onChange={(e) => setForm({ ...form, data: e.target.value })}
                  required
                />
              </div>

              <div className="form-group">
                <label htmlFor="horario">Horário *</label>
                <input
                  id="horario"
                  type="time"
                  value={form.horario}
                  onChange={(e) => setForm({ ...form, horario: e.target.value })}
                  required
                />
              </div>

              <div className="form-group form-group-small">
                <label htmlFor="preco">Preço (R$) *</label>
                <input
                  id="preco"
                  type="number"
                  value={form.preco}
                  onChange={(e) => setForm({ ...form, preco: e.target.value })}
                  placeholder="50.00"
                  min="0"
                  step="0.01"
                  required
                />
              </div>
            </div>

            <div className="form-actions">
              <button type="submit" className="btn btn-primary" disabled={saving}>
                {saving ? 'Salvando...' : 'Salvar'}
              </button>
              <button type="button" className="btn btn-secondary" onClick={resetForm}>
                Cancelar
              </button>
            </div>
          </form>
        </div>
      )}

      <div className="items-list">
        {eventos.map((evento) => (
          <div key={evento.id} className="item-card">
            <div className="item-content">
              <h3>{evento.nome}</h3>
              <p className="item-detail">
                <strong>Local:</strong> {evento.local?.nome}
              </p>
              <p className="item-detail">
                <strong>Data:</strong> {formatDate(evento.data)} às {evento.horario}
              </p>
              <p className="item-detail">
                <strong>Preço:</strong> R$ {Number(evento.preco).toFixed(2)}
              </p>
            </div>
            <div className="item-actions">
              <button className="btn btn-small" onClick={() => handleEdit(evento)}>
                Editar
              </button>
              <button className="btn btn-small btn-danger" onClick={() => handleDelete(evento.id)}>
                Excluir
              </button>
            </div>
          </div>
        ))}
      </div>

      {eventos.length === 0 && !showForm && (
        <div className="empty-state">
          <p>Nenhum evento cadastrado.</p>
        </div>
      )}
    </div>
  )
}
