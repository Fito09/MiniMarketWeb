import { useEffect } from 'react'
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import { Toaster } from 'react-hot-toast'
import { useAuthStore } from './store/useAuthStore'
import { useThemeStore } from './store/useThemeStore'

// Pages
import LoginPage from './pages/LoginPage'
import RegisterPage from './pages/RegisterPage'
import EmpleadoDashboard from './pages/empleado/Dashboard'
import EmpleadoPedidos from './pages/empleado/Pedidos'
import EmpleadoTareas from './pages/empleado/Tareas'
import EmpleadoAsistencia from './pages/empleado/Asistencia'
import EmpleadoInventario from './pages/empleado/Inventario'
import EmpleadoAsignarTareas from './pages/empleado/AsignarTareas'
import EmpleadoAsistenciaEmpleados from './pages/empleado/AsistenciaEmpleados'
import EmpleadoProductos from './pages/empleado/Productos'
import ClienteDashboard from './pages/cliente/Dashboard'
import ClienteCatalogo from './pages/cliente/Catalogo'
import ClienteCarrito from './pages/cliente/Carrito'
import ClientePedidos from './pages/cliente/Pedidos'
import ClientePerfil from './pages/cliente/Perfil'
import NotFound from './pages/NotFound'

// Components
import LoadingScreen from './components/LoadingScreen'
import ProtectedRoute from './components/ProtectedRoute'

function App() {
  const initialize = useAuthStore((state) => state.initialize)
  const loading = useAuthStore((state) => state.loading)
  const user = useAuthStore((state) => state.user)
  const profile = useAuthStore((state) => state.profile)
  const { initializeTheme } = useThemeStore()

  useEffect(() => {
    initialize()
    initializeTheme()
  }, [])

  if (loading) {
    return <LoadingScreen />
  }

  return (
    <BrowserRouter>
      <Toaster 
        position="top-right"
        toastOptions={{
          duration: 3000,
          style: {
            background: '#363636',
            color: '#fff',
          },
          success: {
            duration: 3000,
            iconTheme: {
              primary: '#10b981',
              secondary: '#fff',
            },
          },
          error: {
            duration: 4000,
            iconTheme: {
              primary: '#ef4444',
              secondary: '#fff',
            },
          },
        }}
      />
      
      <Routes>
        {/* Rutas públicas */}
        <Route path="/login" element={<LoginPage />} />
        <Route path="/register" element={<RegisterPage />} />
        
        {/* Rutas de empleados */}
        <Route path="/empleado" element={
          <ProtectedRoute requireEmpleado>
            <EmpleadoDashboard />
          </ProtectedRoute>
        } />
        <Route path="/empleado/pedidos" element={
          <ProtectedRoute requireEmpleado>
            <EmpleadoPedidos />
          </ProtectedRoute>
        } />
        <Route path="/empleado/tareas" element={
          <ProtectedRoute requireEmpleado>
            <EmpleadoTareas />
          </ProtectedRoute>
        } />
        <Route path="/empleado/asistencia" element={
          <ProtectedRoute requireEmpleado>
            <EmpleadoAsistencia />
          </ProtectedRoute>
        } />
        <Route path="/empleado/inventario" element={
          <ProtectedRoute requireEmpleado>
            <EmpleadoInventario />
          </ProtectedRoute>
        } />
        <Route path="/empleado/asignar-tareas" element={
          <ProtectedRoute requireEmpleado>
            <EmpleadoAsignarTareas />
          </ProtectedRoute>
        } />
        <Route path="/empleado/asistencia-empleados" element={
          <ProtectedRoute requireEmpleado>
            <EmpleadoAsistenciaEmpleados />
          </ProtectedRoute>
        } />
        <Route path="/empleado/productos" element={
          <ProtectedRoute requireEmpleado>
            <EmpleadoProductos />
          </ProtectedRoute>
        } />
        
        {/* Rutas de clientes */}
        <Route path="/cliente" element={
          <ProtectedRoute requireCliente>
            <ClienteDashboard />
          </ProtectedRoute>
        } />
        <Route path="/cliente/catalogo" element={
          <ProtectedRoute requireCliente>
            <ClienteCatalogo />
          </ProtectedRoute>
        } />
        <Route path="/cliente/carrito" element={
          <ProtectedRoute requireCliente>
            <ClienteCarrito />
          </ProtectedRoute>
        } />
        <Route path="/cliente/pedidos" element={
          <ProtectedRoute requireCliente>
            <ClientePedidos />
          </ProtectedRoute>
        } />
        <Route path="/cliente/perfil" element={
          <ProtectedRoute requireCliente>
            <ClientePerfil />
          </ProtectedRoute>
        } />
        
        {/* Ruta raíz - redirige según el rol */}
        <Route path="/" element={
          user && profile 
            ? (profile.rol === 'empleado' || profile.rol === 'admin' 
                ? <Navigate to="/empleado" replace /> 
                : <Navigate to="/cliente" replace />)
            : <Navigate to="/login" replace />
        } />
        
        {/* 404 */}
        <Route path="*" element={<NotFound />} />
      </Routes>
    </BrowserRouter>
  )
}

export default App
