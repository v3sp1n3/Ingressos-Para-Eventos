import { useEffect, useState } from 'react'
import { getLocais, createLocal, updateLocal, deleteLocal } from '../lib/api'
import type { Local } from '../lib/supabase'

export function AdminLocais() {
  const [locais, setLocais] = useState<Local[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [showForm, setShowForm] = useState(false)
  const [editingId, setEditingId] = useState<string | null>(null)
  const [saving, setSaving] = useState(false)

  const [form, setForm] = useState({
    nome: '',
    endereco: '',
    capacidade: ''
  })

  useEffect(() => {
    loadLocais()
  }, [])

  async function loadLocais() {
    try {
      setLoading(true)
      const data = await getLocais()
      setLocais(data)
    } catch (err) {
      setError('Erro ao carregar locais')
    } finally {
      setLoading(false)
    }
  }

  function resetForm() {
    setForm({ nome: '', endereco: '', capacidade: '' })
    setShowForm(false)
    setEditingId(null)
  }

  function handleEdit(local: Local) {
    setForm({
      nome: local.nome,
      endereco: local.endereco,
      capacidade: local.capacidade.toString()
    })
    setEditingId(local.id)
    setShowForm(true)
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setSaving(true)
    setError(null)

    try {
      const data = {
        nome: form.nome,
        endereco: form.endereco,
        capacidade: parseInt(form.capacidade)
      }

      if (editingId) {
        await updateLocal(editingId, data)
      } else {
        await createLocal(data)
      }

      await loadLocais()
      resetForm()
    } catch (err) {
      setError('Erro ao salvar local')
    } finally {
      setSaving(false)
    }
  }

  async function handleDelete(id: string) {
    if (!confirm('Tem certeza que deseja excluir este local?')) return

    try {
      await deleteLocal(id)
      await loadLocais()
    } catch (err) {
      setError('Erro ao excluir local')
    }
  }

  if (loading) {
    return <div className="loading">Carregando locais...</div>
  }

  return (
    <div className="admin-page">
      <div className="page-header">
        <h1>Gerenciar Locais</h1>
        <p>Cadastre e gerencie os locais onde os eventos acontecem</p>
      </div>

      {error && <div className="error-message">{error}</div>}

      <button
        className="btn btn-primary"
        onClick={() => setShowForm(true)}
        disabled={showForm}
      >
        + Novo Local
      </button>

      {showForm && (
        <div className="form-card">
          <h2>{editingId ? 'Editar Local' : 'Novo Local'}</h2>
          <form onSubmit={handleSubmit}>
            <div className="form-group">
              <label htmlFor="nome">Nome do Local *</label>
              <input
                id="nome"
                type="text"
                value={form.nome}
                onChange={(e) => setForm({ ...form, nome: e.target.value })}
                placeholder="Teatro Municipal, Estádio..."
                required
              />
            </div>

            <div className="form-group">
              <label htmlFor="endereco">Endereço Completo *</label>
              <input
                id="endereco"
                type="text"
                value={form.endereco}
                onChange={(e) => setForm({ ...form, endereco: e.target.value })}
                placeholder="Rua X, 123 - Centro"
                required
              />
            </div>

            <div className="form-group">
              <label htmlFor="capacidade">Capacidade Máxima *</label>
              <input
                id="capacidade"
                type="number"
                value={form.capacidade}
                onChange={(e) => setForm({ ...form, capacidade: e.target.value })}
                placeholder="500"
                min="1"
                required
              />
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
        {locais.map((local) => (
          <div key={local.id} className="item-card">
            <div className="item-content">
              <h3>{local.nome}</h3>
              <p className="item-detail">{local.endereco}</p>
              <p className="item-detail">
                <strong>Capacidade:</strong> {local.capacidade} pessoas
              </p>
            </div>
            <div className="item-actions">
              <button className="btn btn-small" onClick={() => handleEdit(local)}>
                Editar
              </button>
              <button className="btn btn-small btn-danger" onClick={() => handleDelete(local.id)}>
                Excluir
              </button>
            </div>
          </div>
        ))}
      </div>

      {locais.length === 0 && !showForm && (
        <div className="empty-state">
          <p>Nenhum local cadastrado.</p>
        </div>
      )}
    </div>
  )
}
