import { useEffect, useState } from 'react'
import { useAuth } from '../context/AuthContext'
import { getEndereco, upsertEndereco } from '../lib/api'
import type { Endereco } from '../lib/supabase'

export function Perfil() {
  const { user } = useAuth()
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState<string | null>(null)

  const [endereco, setEndereco] = useState<Omit<Endereco, 'id' | 'created_at'>>({
    usuario_id: '',
    logradouro: '',
    numero: '',
    complemento: '',
    bairro: '',
    cidade: '',
    estado: '',
    cep: ''
  })

  useEffect(() => {
    if (user) {
      loadEndereco()
    }
  }, [user])

  async function loadEndereco() {
    if (!user) return

    try {
      setLoading(true)
      const data = await getEndereco(user.id)
      if (data) {
        setEndereco({
          usuario_id: data.usuario_id,
          logradouro: data.logradouro,
          numero: data.numero,
          complemento: data.complemento || '',
          bairro: data.bairro,
          cidade: data.cidade,
          estado: data.estado,
          cep: data.cep
        })
      } else {
        setEndereco({
          usuario_id: user.id,
          logradouro: '',
          numero: '',
          complemento: '',
          bairro: '',
          cidade: '',
          estado: '',
          cep: ''
        })
      }
    } catch (err) {
      setError('Erro ao carregar endereço')
    } finally {
      setLoading(false)
    }
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!user) return

    setSaving(true)
    setError(null)
    setSuccess(null)

    try {
      await upsertEndereco({
        ...endereco,
        usuario_id: user.id
      })
      setSuccess('Endereço salvo com sucesso!')
    } catch (err) {
      setError('Erro ao salvar endereço')
    } finally {
      setSaving(false)
    }
  }

  function handleChange(field: keyof typeof endereco, value: string) {
    setEndereco(prev => ({ ...prev, [field]: value }))
  }

  if (loading) {
    return <div className="loading">Carregando perfil...</div>
  }

  return (
    <div className="perfil-page">
      <div className="page-header">
        <h1>Meu Perfil</h1>
        <p>Gerencie suas informações e endereço</p>
      </div>

      <div className="perfil-section">
        <h2>Informações da Conta</h2>
        <div className="info-grid">
          <div className="info-item">
            <label>E-mail</label>
            <span>{user?.email}</span>
          </div>
        </div>
      </div>

      <div className="perfil-section">
        <h2>Endereço</h2>
        <p className="section-description">
          Seu endereço está vinculado de forma exclusiva à sua conta (relacionamento OneToOne).
        </p>

        {error && <div className="error-message">{error}</div>}
        {success && <div className="success-message">{success}</div>}

        <form onSubmit={handleSubmit} className="endereco-form">
          <div className="form-row">
            <div className="form-group">
              <label htmlFor="logradouro">Logradouro *</label>
              <input
                id="logradouro"
                type="text"
                value={endereco.logradouro}
                onChange={(e) => handleChange('logradouro', e.target.value)}
                placeholder="Rua, Avenida..."
                required
              />
            </div>
            <div className="form-group form-group-small">
              <label htmlFor="numero">Número *</label>
              <input
                id="numero"
                type="text"
                value={endereco.numero}
                onChange={(e) => handleChange('numero', e.target.value)}
                placeholder="123"
                required
              />
            </div>
          </div>

          <div className="form-group">
            <label htmlFor="complemento">Complemento</label>
            <input
              id="complemento"
              type="text"
              value={endereco.complemento}
              onChange={(e) => handleChange('complemento', e.target.value)}
              placeholder="Apto, Sala..."
            />
          </div>

          <div className="form-row">
            <div className="form-group">
              <label htmlFor="bairro">Bairro *</label>
              <input
                id="bairro"
                type="text"
                value={endereco.bairro}
                onChange={(e) => handleChange('bairro', e.target.value)}
                placeholder="Seu bairro"
                required
              />
            </div>
            <div className="form-group">
              <label htmlFor="cidade">Cidade *</label>
              <input
                id="cidade"
                type="text"
                value={endereco.cidade}
                onChange={(e) => handleChange('cidade', e.target.value)}
                placeholder="Sua cidade"
                required
              />
            </div>
          </div>

          <div className="form-row">
            <div className="form-group form-group-small">
              <label htmlFor="estado">Estado *</label>
              <input
                id="estado"
                type="text"
                value={endereco.estado}
                onChange={(e) => handleChange('estado', e.target.value.toUpperCase())}
                placeholder="SP"
                maxLength={2}
                required
              />
            </div>
            <div className="form-group form-group-medium">
              <label htmlFor="cep">CEP *</label>
              <input
                id="cep"
                type="text"
                value={endereco.cep}
                onChange={(e) => handleChange('cep', e.target.value)}
                placeholder="00000-000"
                required
              />
            </div>
          </div>

          <button type="submit" className="btn btn-primary" disabled={saving}>
            {saving ? 'Salvando...' : 'Salvar Endereço'}
          </button>
        </form>
      </div>
    </div>
  )
}
