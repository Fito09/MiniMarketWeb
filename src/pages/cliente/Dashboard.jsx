import { useEffect, useState } from 'react'
import { ShoppingBag, Package, TrendingUp, Tag } from 'lucide-react'
import Layout from '../../components/Layout'
import { supabase } from '../../lib/supabase'
import { useAuthStore } from '../../store/useAuthStore'
import { Link } from 'react-router-dom'

export default function ClienteDashboard() {
  const { profile } = useAuthStore()
  const [stats, setStats] = useState({
    pedidosActivos: 0,
    pedidosCompletados: 0,
    promocionesActivas: 0,
  })
  const [promociones, setPromociones] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    loadDashboardData()
  }, [])

  const loadDashboardData = async () => {
    try {
      // Verificar que tenemos id_cliente
      if (!profile?.id_cliente) {
        console.error('No se encontró id_cliente en el perfil')
        setLoading(false)
        return
      }

      // Cargar ventas (pedidos) activos - estados pendientes
      const { data: ventasActivas } = await supabase
        .from('venta')
        .select('id_venta')
        .eq('id_cliente', profile.id_cliente)

      // Cargar ventas completadas (todas las ventas son "completadas" en este esquema)
      const { data: ventasCompletadas } = await supabase
        .from('venta')
        .select('id_venta')
        .eq('id_cliente', profile.id_cliente)

      // Cargar promociones activas con productos
      const { data: promocionesData } = await supabase
        .from('promocion')
        .select('*, producto:id_producto(*)')
        .lte('fecha_inicio', new Date().toISOString())
        .gte('fecha_fin', new Date().toISOString())
        .limit(3)

      // Formatear promociones para mostrar
      const promocionesFormateadas = promocionesData?.map(promo => ({
        id: promo.id_promocion,
        producto_nombre: promo.producto?.nombre || 'Producto',
        precio_original: promo.producto?.precio || 0,
        precio_con_descuento: (promo.producto?.precio * (1 - promo.descuento / 100)).toFixed(2),
        descuento_porcentaje: promo.descuento,
        imagen_url: promo.producto?.imagen_url,
        promocion_nombre: `Descuento ${promo.descuento}%`
      })) || []

      setStats({
        pedidosActivos: ventasActivas?.length || 0,
        pedidosCompletados: ventasCompletadas?.length || 0,
        promocionesActivas: promocionesFormateadas.length,
      })
      setPromociones(promocionesFormateadas)
    } catch (error) {
      console.error('Error loading dashboard:', error)
    } finally {
      setLoading(false)
    }
  }

  const statCards = [
    {
      title: 'Pedidos Activos',
      value: stats.pedidosActivos,
      icon: ShoppingBag,
      color: 'bg-blue-500',
      textColor: 'text-blue-600',
      bgColor: 'bg-blue-50 dark:bg-blue-900/20',
    },
    {
      title: 'Pedidos Completados',
      value: stats.pedidosCompletados,
      icon: Package,
      color: 'bg-green-500',
      textColor: 'text-green-600',
      bgColor: 'bg-green-50 dark:bg-green-900/20',
    },
    {
      title: 'Promociones Activas',
      value: stats.promocionesActivas,
      icon: Tag,
      color: 'bg-purple-500',
      textColor: 'text-purple-600',
      bgColor: 'bg-purple-50 dark:bg-purple-900/20',
    },
  ]

  return (
    <Layout type="cliente">
      <div className="space-y-6">
        {/* Header */}
        <div>
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
            ¡Hola, {profile?.nombre}!
          </h1>
          <p className="text-gray-600 dark:text-gray-400 mt-1">
            Bienvenido a Mini Market
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

        {/* Promociones destacadas */}
        {promociones.length > 0 && (
          <div className="card">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-xl font-bold text-gray-900 dark:text-white flex items-center">
                <Tag className="w-6 h-6 mr-2 text-purple-600" />
                Promociones Destacadas
              </h2>
              <Link 
                to="/cliente/catalogo"
                className="text-primary-600 hover:text-primary-700 text-sm font-medium"
              >
                Ver todas →
              </Link>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {promociones.map((promo) => (
                <div 
                  key={promo.id}
                  className="border border-gray-200 dark:border-gray-700 rounded-lg p-4 hover:shadow-md transition-shadow"
                >
                  {promo.imagen_url && (
                    <img 
                      src={promo.imagen_url} 
                      alt={promo.producto_nombre}
                      className="w-full h-32 object-cover rounded-lg mb-3"
                    />
                  )}
                  <h3 className="font-semibold text-gray-900 dark:text-white mb-1">
                    {promo.producto_nombre}
                  </h3>
                  <div className="flex items-center gap-2 mb-2">
                    <span className="text-lg font-bold text-green-600">
                      Bs {promo.precio_con_descuento}
                    </span>
                    <span className="text-sm text-gray-500 line-through">
                      Bs {promo.precio_original}
                    </span>
                    <span className="badge badge-danger text-xs">
                      -{promo.descuento_porcentaje}%
                    </span>
                  </div>
                  <p className="text-xs text-gray-600 dark:text-gray-400">
                    {promo.promocion_nombre}
                  </p>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Accesos rápidos */}
        <div className="card">
          <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-4">
            Accesos Rápidos
          </h2>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <Link
              to="/cliente/catalogo"
              className="p-4 border-2 border-gray-200 dark:border-gray-700 rounded-lg hover:border-primary-500 dark:hover:border-primary-500 transition-colors"
            >
              <ShoppingBag className="w-8 h-8 text-primary-600 mb-2" />
              <h3 className="font-semibold text-gray-900 dark:text-white">
                Catálogo
              </h3>
              <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                Explora nuestros productos
              </p>
            </Link>
            <Link
              to="/cliente/pedidos"
              className="p-4 border-2 border-gray-200 dark:border-gray-700 rounded-lg hover:border-primary-500 dark:hover:border-primary-500 transition-colors"
            >
              <Package className="w-8 h-8 text-primary-600 mb-2" />
              <h3 className="font-semibold text-gray-900 dark:text-white">
                Mis Pedidos
              </h3>
              <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                Rastrea tus compras
              </p>
            </Link>
            <Link
              to="/cliente/perfil"
              className="p-4 border-2 border-gray-200 dark:border-gray-700 rounded-lg hover:border-primary-500 dark:hover:border-primary-500 transition-colors"
            >
              <TrendingUp className="w-8 h-8 text-primary-600 mb-2" />
              <h3 className="font-semibold text-gray-900 dark:text-white">
                Mi Perfil
              </h3>
              <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                Gestiona tu cuenta
              </p>
            </Link>
          </div>
        </div>
      </div>
    </Layout>
  )
}
