import { useEffect, useState } from 'react'
import { Package, CheckSquare, Clock, TrendingUp, Warehouse, UserCheck, Users } from 'lucide-react'
import Layout from '../../components/Layout'
import { supabase } from '../../lib/supabase'
import { useAuthStore } from '../../store/useAuthStore'
import { format } from 'date-fns'
import { es } from 'date-fns/locale'

export default function EmpleadoDashboard() {
  const { profile } = useAuthStore()
  const [stats, setStats] = useState({
    pedidosAsignados: 0,
    tareasActivas: 0,
    asistenciaHoy: null,
  })
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    loadDashboardData()
  }, [])

  const loadDashboardData = async () => {
    try {
      // Cargar ventas asignadas (tu BD usa 'venta' no 'pedidos')
      const { count: ventasCount } = await supabase
        .from('venta')
        .select('*', { count: 'exact', head: true })
        .eq('id_empleado', profile.id_empleado)

      // Cargar repartos activos
      const { count: repartosCount } = await supabase
        .from('reparto')
        .select('*', { count: 'exact', head: true })
        .eq('id_empleado', profile.id_empleado)
        .eq('estado', 'pendiente')

      // Verificar asistencia de hoy
      const hoy = format(new Date(), 'yyyy-MM-dd')
      const { data: asistencia } = await supabase
        .from('asistencia')
        .select('*')
        .eq('id_empleado', profile.id_empleado)
        .eq('fecha', hoy)
        .maybeSingle()

      setStats({
        pedidosAsignados: ventasCount || 0,
        tareasActivas: repartosCount || 0,
        asistenciaHoy: asistencia,
      })
    } catch (error) {
      console.error('Error loading dashboard:', error)
    } finally {
      setLoading(false)
    }
  }

  const statCards = [
    {
      title: 'Ventas Asignadas',
      value: stats.pedidosAsignados,
      icon: Package,
      color: 'bg-blue-500',
      textColor: 'text-blue-600',
      bgColor: 'bg-blue-50 dark:bg-blue-900/20',
    },
    {
      title: 'Repartos Activos',
      value: stats.tareasActivas,
      icon: CheckSquare,
      color: 'bg-green-500',
      textColor: 'text-green-600',
      bgColor: 'bg-green-50 dark:bg-green-900/20',
    },
    {
      title: 'Asistencia Hoy',
      value: stats.asistenciaHoy ? 'Registrada' : 'Pendiente',
      icon: Clock,
      color: 'bg-purple-500',
      textColor: 'text-purple-600',
      bgColor: 'bg-purple-50 dark:bg-purple-900/20',
    },
  ]

  return (
    <Layout type="empleado">
      <div className="space-y-6">
        {/* Header */}
        <div>
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
            ¡Bienvenido, {profile?.nombre}!
          </h1>
          <p className="text-gray-600 dark:text-gray-400 mt-1">
            {format(new Date(), "EEEE, d 'de' MMMM 'de' yyyy", { locale: es })}
          </p>
        </div>

        {/* Stats Grid */}
        {loading ? (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {[1, 2, 3].map((i) => (
              <div key={i} className="card animate-pulse">
                <div className="h-24 bg-gray-200 dark:bg-gray-700 rounded"></div>
              </div>
            ))}
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {statCards.map((stat, index) => {
              const Icon = stat.icon
              return (
                <div key={index} className="card hover:shadow-lg transition-shadow">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium text-gray-600 dark:text-gray-400">
                        {stat.title}
                      </p>
                      <p className={`text-3xl font-bold mt-2 ${stat.textColor}`}>
                        {stat.value}
                      </p>
                    </div>
                    <div className={`p-4 rounded-full ${stat.bgColor}`}>
                      <Icon className={`w-8 h-8 ${stat.textColor}`} />
                    </div>
                  </div>
                </div>
              )
            })}
          </div>
        )}

        {/* Información de asistencia */}
        {stats.asistenciaHoy && (
          <div className="card bg-green-50 dark:bg-green-900/20 border-green-200 dark:border-green-800">
            <div className="flex items-start">
              <Clock className="w-6 h-6 text-green-600 mr-3 mt-1" />
              <div>
                <h3 className="font-semibold text-green-900 dark:text-green-100">
                  Asistencia registrada
                </h3>
                <p className="text-sm text-green-700 dark:text-green-300 mt-1">
                  Entrada: {stats.asistenciaHoy.hora_entrada ? 
                    format(new Date(stats.asistenciaHoy.hora_entrada), 'HH:mm') : 
                    'No registrada'}
                </p>
                {stats.asistenciaHoy.hora_salida && (
                  <p className="text-sm text-green-700 dark:text-green-300">
                    Salida: {format(new Date(stats.asistenciaHoy.hora_salida), 'HH:mm')}
                  </p>
                )}
              </div>
            </div>
          </div>
        )}

        {/* Accesos rápidos */}
        <div className="card">
          <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-4">
            Accesos Rápidos
          </h2>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <a
              href="/empleado/pedidos"
              className="p-4 border-2 border-gray-200 dark:border-gray-700 rounded-lg hover:border-primary-500 dark:hover:border-primary-500 transition-colors"
            >
              <Package className="w-8 h-8 text-primary-600 mb-2" />
              <h3 className="font-semibold text-gray-900 dark:text-white">
                Ver Pedidos
              </h3>
              <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                Gestiona tus entregas
              </p>
            </a>
            <a
              href="/empleado/tareas"
              className="p-4 border-2 border-gray-200 dark:border-gray-700 rounded-lg hover:border-primary-500 dark:hover:border-primary-500 transition-colors"
            >
              <CheckSquare className="w-8 h-8 text-primary-600 mb-2" />
              <h3 className="font-semibold text-gray-900 dark:text-white">
                Mis Tareas
              </h3>
              <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                Revisa tus pendientes
              </p>
            </a>
            <a
              href="/empleado/asistencia"
              className="p-4 border-2 border-gray-200 dark:border-gray-700 rounded-lg hover:border-primary-500 dark:hover:border-primary-500 transition-colors"
            >
              <Clock className="w-8 h-8 text-primary-600 mb-2" />
              <h3 className="font-semibold text-gray-900 dark:text-white">
                Asistencia
              </h3>
              <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                Marca tu entrada/salida
              </p>
            </a>
          </div>
        </div>

        {/* Accesos rápidos de administrador */}
        {profile?.rol === 'admin' && (
          <div className="card bg-gradient-to-br from-primary-50 to-purple-50 dark:from-primary-900/20 dark:to-purple-900/20">
            <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-4">
              Panel de Administrador
            </h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              <a
                href="/empleado/productos"
                className="p-4 bg-white dark:bg-gray-800 border-2 border-gray-200 dark:border-gray-700 rounded-lg hover:border-primary-500 dark:hover:border-primary-500 transition-colors shadow-sm"
              >
                <Package className="w-8 h-8 text-primary-600 mb-2" />
                <h3 className="font-semibold text-gray-900 dark:text-white">
                  Productos
                </h3>
                <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                  Catálogo completo
                </p>
              </a>
              <a
                href="/empleado/inventario"
                className="p-4 bg-white dark:bg-gray-800 border-2 border-gray-200 dark:border-gray-700 rounded-lg hover:border-primary-500 dark:hover:border-primary-500 transition-colors shadow-sm"
              >
                <Warehouse className="w-8 h-8 text-primary-600 mb-2" />
                <h3 className="font-semibold text-gray-900 dark:text-white">
                  Inventario
                </h3>
                <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                  Gestiona el stock
                </p>
              </a>
              <a
                href="/empleado/asignar-tareas"
                className="p-4 bg-white dark:bg-gray-800 border-2 border-gray-200 dark:border-gray-700 rounded-lg hover:border-primary-500 dark:hover:border-primary-500 transition-colors shadow-sm"
              >
                <UserCheck className="w-8 h-8 text-primary-600 mb-2" />
                <h3 className="font-semibold text-gray-900 dark:text-white">
                  Asignar Tareas
                </h3>
                <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                  Asigna repartos
                </p>
              </a>
              <a
                href="/empleado/asistencia-empleados"
                className="p-4 bg-white dark:bg-gray-800 border-2 border-gray-200 dark:border-gray-700 rounded-lg hover:border-primary-500 dark:hover:border-primary-500 transition-colors shadow-sm"
              >
                <Users className="w-8 h-8 text-primary-600 mb-2" />
                <h3 className="font-semibold text-gray-900 dark:text-white">
                  Asistencia Empleados
                </h3>
                <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                  Monitorea asistencias
                </p>
              </a>
            </div>
          </div>
        )}
      </div>
    </Layout>
  )
}
