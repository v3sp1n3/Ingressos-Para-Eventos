import { BrowserRouter, Routes, Route,NavLink, useNavigate } from 'react-router-dom'
import { AuthProvider, useAuth } from './context/AuthContext'
import { Login } from './components/Auth'
import { Eventos } from './pages/Eventos'
import { MeusIngressos } from './pages/MeusIngressos'
import { Perfil } from './pages/Perfil'
import { Dashboard } from './pages/Dashboard'
import { AdminLocais } from './pages/AdminLocais'
import { AdminEventos } from './pages/AdminEventos'

function Navigation() {
  const { user, signOut } = useAuth()
  const navigate = useNavigate()

  async function handleSignOut() {
    await signOut()
    navigate('/')
  }

  return (
    <nav className="main-nav">
      <div className="nav-brand">
        <NavLink to="/">🎫 Ingressos</NavLink>
      </div>
      <div className="nav-links">
        <NavLink to="/eventos">Eventos</NavLink>
        <NavLink to="/meus-ingressos">Meus Ingressos</NavLink>
        <NavLink to="/perfil">Perfil</NavLink>
        <NavLink to="/dashboard">Dashboard</NavLink>
        <span className="nav-divider">|</span>
        <NavLink to="/admin/locais">Locais</NavLink>
        <NavLink to="/admin/eventos">Eventos Admin</NavLink>
      </div>
      <div className="nav-auth">
        {user ? (
          <>
            <span className="user-email">{user.email}</span>
            <button className="btn btn-small btn-secondary" onClick={handleSignOut}>
              Sair
            </button>
          </>
        ) : null}
      </div>
    </nav>
  )
}

function PrivateRoute({ children }: { children: React.ReactNode }) {
  const { user, loading } = useAuth()

  if (loading) {
    return <div className="loading">Carregando...</div>
  }

  if (!user) {
    return <Login />
  }

  return <>{children}</>
}

function AppRoutes() {
  return (
    <Routes>
      <Route path="/" element={<Eventos />} />
      <Route path="/eventos" element={<Eventos />} />
      <Route
        path="/meus-ingressos"
        element={
          <PrivateRoute>
            <MeusIngressos />
          </PrivateRoute>
        }
      />
      <Route
        path="/perfil"
        element={
          <PrivateRoute>
            <Perfil />
          </PrivateRoute>
        }
      />
      <Route path="/dashboard" element={<Dashboard />} />
      <Route
        path="/admin/locais"
        element={
          <PrivateRoute>
            <AdminLocais />
          </PrivateRoute>
        }
      />
      <Route
        path="/admin/eventos"
        element={
          <PrivateRoute>
            <AdminEventos />
          </PrivateRoute>
        }
      />
    </Routes>
  )
}

function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <div className="app">
          <Navigation />
          <main className="main-content">
            <AppRoutes />
          </main>
          <footer className="main-footer">
            <p>Sistema de Ingressos para Eventos - Demonstração de Conceitos de Banco de Dados</p>
            <p className="footer-concepts">
              OneToOne (Usuario-Endereco) | ManyToOne (Evento-Local) | Transacao (Ingresso) |
              Regras de Negocio (Capacidade, Limite 5) | Metricas em Memoria | JWT Auth
            </p>
          </footer>
        </div>
      </BrowserRouter>
    </AuthProvider>
  )
}

export default App
