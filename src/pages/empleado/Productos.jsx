import { useEffect, useState } from 'react'
import { Package, Plus, Edit, Trash2, Search, DollarSign, Calendar, Image as ImageIcon, AlertCircle } from 'lucide-react'
import Layout from '../../components/Layout'
import { supabase } from '../../lib/supabase'
import { formatCurrency } from '../../lib/currencyFormatter'
import { format } from 'date-fns'
import { es } from 'date-fns/locale'

export default function Productos() {
  const [productos, setProductos] = useState([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState('')
  const [selectedCategoria, setSelectedCategoria] = useState('')
  const [showModal, setShowModal] = useState(false)
  const [editingItem, setEditingItem] = useState(null)
  const [formData, setFormData] = useState({
    codigo: '',
    nombre: '',
    categoria: '',
    precio: '',
    stock: '',
    fecha_vencimiento: '',
    imagen_url: '',
  })

  useEffect(() => {
    loadProductos()
  }, [])

  const loadProductos = async () => {
    try {
      setLoading(true)
      
      const { data, error } = await supabase
        .from('producto')
        .select('*')
        .order('nombre')

      if (error) throw error
      setProductos(data || [])
    } catch (error) {
      console.error('Error loading productos:', error)
      alert('Error al cargar los productos')
    } finally {
      setLoading(false)
    }
  }

  const handleSubmit = async (e) => {
    e.preventDefault()

    try {
      const productData = {
        codigo: formData.codigo,
        nombre: formData.nombre,
        categoria: formData.categoria || null,
        precio: parseFloat(formData.precio),
        stock: parseInt(formData.stock) || 0,
        fecha_vencimiento: formData.fecha_vencimiento || null,
        imagen_url: formData.imagen_url || null,
      }

      if (editingItem) {
        // Actualizar
        const { error } = await supabase
          .from('producto')
          .update(productData)
          .eq('id_producto', editingItem.id_producto)

        if (error) throw error
        alert('Producto actualizado exitosamente')
      } else {
        // Crear
        const { error } = await supabase
          .from('producto')
          .insert([productData])

        if (error) throw error
        alert('Producto creado exitosamente')
      }

      setShowModal(false)
      setEditingItem(null)
      setFormData({
        codigo: '',
        nombre: '',
        categoria: '',
        precio: '',
        stock: '',
        fecha_vencimiento: '',
        imagen_url: '',
      })
      loadProductos()
    } catch (error) {
      console.error('Error saving:', error)
      alert('Error al guardar: ' + error.message)
    }
  }

  const handleEdit = (item) => {
    setEditingItem(item)
    setFormData({
      codigo: item.codigo || '',
      nombre: item.nombre || '',
      categoria: item.categoria || '',
      precio: item.precio?.toString() || '',
      stock: item.stock?.toString() || '',
      fecha_vencimiento: item.fecha_vencimiento || '',
      imagen_url: item.imagen_url || '',
    })
    setShowModal(true)
  }

  const handleDelete = async (id) => {
    if (!confirm('¿Estás seguro de eliminar este producto? Esta acción no se puede deshacer.')) return

    try {
      const { error } = await supabase
        .from('producto')
        .delete()
        .eq('id_producto', id)

      if (error) throw error
      alert('Producto eliminado exitosamente')
      loadProductos()
    } catch (error) {
      console.error('Error deleting:', error)
      alert('Error al eliminar: ' + error.message)
    }
  }

  // Obtener categorías únicas
  const categorias = [...new Set(productos.map(p => p.categoria).filter(Boolean))]

  const filteredProductos = productos.filter((item) => {
    const searchLower = searchTerm.toLowerCase()
    const matchSearch = 
      item.nombre?.toLowerCase().includes(searchLower) ||
      item.codigo?.toLowerCase().includes(searchLower) ||
      item.categoria?.toLowerCase().includes(searchLower)
    
    const matchCategoria = !selectedCategoria || item.categoria === selectedCategoria

    return matchSearch && matchCategoria
  })

  const getStockBadge = (stock) => {
    if (stock === 0) return { color: 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200', text: 'Sin stock' }
    if (stock < 10) return { color: 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200', text: 'Stock bajo' }
    return { color: 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200', text: 'Stock normal' }
  }

  const isVencido = (fecha) => {
    if (!fecha) return false
    return new Date(fecha) < new Date()
  }

  const isPorVencer = (fecha) => {
    if (!fecha) return false
    const hoy = new Date()
    const vencimiento = new Date(fecha)
    const diasDiferencia = Math.ceil((vencimiento - hoy) / (1000 * 60 * 60 * 24))
    return diasDiferencia > 0 && diasDiferencia <= 30
  }

  // Estadísticas
  const stats = {
    total: productos.length,
    sinStock: productos.filter(p => p.stock === 0).length,
    stockBajo: productos.filter(p => p.stock > 0 && p.stock < 10).length,
    vencidos: productos.filter(p => isVencido(p.fecha_vencimiento)).length,
    porVencer: productos.filter(p => isPorVencer(p.fecha_vencimiento)).length,
  }

  return (
    <Layout type="empleado">
      <div className="space-y-6">
        {/* Header */}
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
              Gestión de Productos
            </h1>
            <p className="text-gray-600 dark:text-gray-400 mt-1">
              Administra el catálogo completo de productos
            </p>
          </div>
          <button
            onClick={() => {
              setEditingItem(null)
              setFormData({
                codigo: '',
                nombre: '',
                categoria: '',
                precio: '',
                stock: '',
                fecha_vencimiento: '',
                imagen_url: '',
              })
              setShowModal(true)
            }}
            className="btn-primary flex items-center"
          >
            <Plus className="w-5 h-5 mr-2" />
            Nuevo Producto
          </button>
        </div>

        {/* Estadísticas */}
        <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
          <div className="card bg-blue-50 dark:bg-blue-900/20 border-blue-200 dark:border-blue-800">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-blue-600 dark:text-blue-400">Total Productos</p>
                <p className="text-2xl font-bold text-blue-700 dark:text-blue-300">
                  {stats.total}
                </p>
              </div>
              <Package className="w-8 h-8 text-blue-600 dark:text-blue-400" />
            </div>
          </div>
          <div className="card bg-red-50 dark:bg-red-900/20 border-red-200 dark:border-red-800">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-red-600 dark:text-red-400">Sin Stock</p>
                <p className="text-2xl font-bold text-red-700 dark:text-red-300">
                  {stats.sinStock}
                </p>
              </div>
              <AlertCircle className="w-8 h-8 text-red-600 dark:text-red-400" />
            </div>
          </div>
          <div className="card bg-yellow-50 dark:bg-yellow-900/20 border-yellow-200 dark:border-yellow-800">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-yellow-600 dark:text-yellow-400">Stock Bajo</p>
                <p className="text-2xl font-bold text-yellow-700 dark:text-yellow-300">
                  {stats.stockBajo}
                </p>
              </div>
              <AlertCircle className="w-8 h-8 text-yellow-600 dark:text-yellow-400" />
            </div>
          </div>
          <div className="card bg-orange-50 dark:bg-orange-900/20 border-orange-200 dark:border-orange-800">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-orange-600 dark:text-orange-400">Por Vencer</p>
                <p className="text-2xl font-bold text-orange-700 dark:text-orange-300">
                  {stats.porVencer}
                </p>
              </div>
              <Calendar className="w-8 h-8 text-orange-600 dark:text-orange-400" />
            </div>
          </div>
          <div className="card bg-purple-50 dark:bg-purple-900/20 border-purple-200 dark:border-purple-800">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-purple-600 dark:text-purple-400">Vencidos</p>
                <p className="text-2xl font-bold text-purple-700 dark:text-purple-300">
                  {stats.vencidos}
                </p>
              </div>
              <AlertCircle className="w-8 h-8 text-purple-600 dark:text-purple-400" />
            </div>
          </div>
        </div>

        {/* Filtros */}
        <div className="card">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Búsqueda */}
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
              <input
                type="text"
                placeholder="Buscar por nombre, código o categoría..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="input pl-10 w-full"
              />
            </div>

            {/* Filtro por categoría */}
            <div>
              <select
                value={selectedCategoria}
                onChange={(e) => setSelectedCategoria(e.target.value)}
                className="input w-full"
              >
                <option value="">Todas las categorías</option>
                {categorias.map((cat) => (
                  <option key={cat} value={cat}>
                    {cat}
                  </option>
                ))}
              </select>
            </div>
          </div>
        </div>

        {/* Grid de productos */}
        <div className="card">
          {loading ? (
            <div className="text-center py-12">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600 mx-auto"></div>
              <p className="text-gray-600 dark:text-gray-400 mt-4">Cargando...</p>
            </div>
          ) : filteredProductos.length === 0 ? (
            <div className="text-center py-12">
              <Package className="w-16 h-16 text-gray-400 mx-auto mb-4" />
              <p className="text-gray-600 dark:text-gray-400">
                {searchTerm || selectedCategoria ? 'No se encontraron productos' : 'No hay productos registrados'}
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
              {filteredProductos.map((producto) => {
                const stockBadge = getStockBadge(producto.stock)
                const vencido = isVencido(producto.fecha_vencimiento)
                const porVencer = isPorVencer(producto.fecha_vencimiento)

                return (
                  <div
                    key={producto.id_producto}
                    className="border border-gray-200 dark:border-gray-700 rounded-lg overflow-hidden hover:shadow-lg transition-shadow bg-white dark:bg-gray-800"
                  >
                    {/* Imagen del producto */}
                    <div className="relative h-48 bg-gray-100 dark:bg-gray-700 flex items-center justify-center">
                      {producto.imagen_url ? (
                        <img
                          src={producto.imagen_url}
                          alt={producto.nombre}
                          className="w-full h-full object-cover"
                          onError={(e) => {
                            e.target.style.display = 'none'
                            e.target.nextSibling.style.display = 'flex'
                          }}
                        />
                      ) : null}
                      <div className={producto.imagen_url ? 'hidden' : 'flex'} style={{ display: producto.imagen_url ? 'none' : 'flex' }}>
                        <ImageIcon className="w-16 h-16 text-gray-400" />
                      </div>
                      
                      {/* Badges de alerta */}
                      {vencido && (
                        <div className="absolute top-2 right-2 bg-red-500 text-white text-xs px-2 py-1 rounded-full font-semibold">
                          Vencido
                        </div>
                      )}
                      {!vencido && porVencer && (
                        <div className="absolute top-2 right-2 bg-orange-500 text-white text-xs px-2 py-1 rounded-full font-semibold">
                          Por vencer
                        </div>
                      )}
                    </div>

                    {/* Información del producto */}
                    <div className="p-4">
                      <div className="flex items-start justify-between mb-2">
                        <div className="flex-1">
                          <h3 className="font-semibold text-gray-900 dark:text-white line-clamp-2">
                            {producto.nombre}
                          </h3>
                          <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                            Código: {producto.codigo}
                          </p>
                        </div>
                      </div>

                      {producto.categoria && (
                        <span className="inline-block px-2 py-1 text-xs font-medium rounded-full bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200 mb-2">
                          {producto.categoria}
                        </span>
                      )}

                      <div className="space-y-2 mt-3">
                        <div className="flex items-center justify-between">
                          <span className="text-sm text-gray-600 dark:text-gray-400">Precio:</span>
                          <span className="text-lg font-bold text-primary-600 dark:text-primary-400">
                            {formatCurrency(producto.precio)}
                          </span>
                        </div>

                        <div className="flex items-center justify-between">
                          <span className="text-sm text-gray-600 dark:text-gray-400">Stock:</span>
                          <span className={`text-sm font-semibold px-2 py-1 rounded ${stockBadge.color}`}>
                            {producto.stock} unidades
                          </span>
                        </div>

                        {producto.fecha_vencimiento && (
                          <div className="flex items-center justify-between">
                            <span className="text-sm text-gray-600 dark:text-gray-400">Vencimiento:</span>
                            <span className={`text-xs flex items-center ${vencido ? 'text-red-600' : porVencer ? 'text-orange-600' : 'text-gray-600 dark:text-gray-400'}`}>
                              <Calendar className="w-3 h-3 mr-1" />
                              {format(new Date(producto.fecha_vencimiento), 'dd/MM/yyyy', { locale: es })}
                            </span>
                          </div>
                        )}
                      </div>

                      {/* Acciones */}
                      <div className="flex space-x-2 mt-4 pt-4 border-t border-gray-200 dark:border-gray-700">
                        <button
                          onClick={() => handleEdit(producto)}
                          className="flex-1 btn-secondary text-sm py-2 flex items-center justify-center"
                        >
                          <Edit className="w-4 h-4 mr-1" />
                          Editar
                        </button>
                        <button
                          onClick={() => handleDelete(producto.id_producto)}
                          className="flex-1 bg-red-100 text-red-700 dark:bg-red-900/20 dark:text-red-400 hover:bg-red-200 dark:hover:bg-red-900/40 text-sm py-2 rounded-lg flex items-center justify-center transition-colors"
                        >
                          <Trash2 className="w-4 h-4 mr-1" />
                          Eliminar
                        </button>
                      </div>
                    </div>
                  </div>
                )
              })}
            </div>
          )}
        </div>
      </div>

      {/* Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4 overflow-y-auto">
          <div className="bg-white dark:bg-gray-800 rounded-lg max-w-2xl w-full p-6 my-8">
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">
              {editingItem ? 'Editar Producto' : 'Nuevo Producto'}
            </h2>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    Código *
                  </label>
                  <input
                    type="text"
                    value={formData.codigo}
                    onChange={(e) => setFormData({ ...formData, codigo: e.target.value })}
                    className="input w-full"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    Nombre *
                  </label>
                  <input
                    type="text"
                    value={formData.nombre}
                    onChange={(e) => setFormData({ ...formData, nombre: e.target.value })}
                    className="input w-full"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    Categoría
                  </label>
                  <input
                    type="text"
                    value={formData.categoria}
                    onChange={(e) => setFormData({ ...formData, categoria: e.target.value })}
                    className="input w-full"
                    placeholder="Ej: Bebidas, Snacks, etc."
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    Precio *
                  </label>
                  <input
                    type="number"
                    step="0.01"
                    min="0"
                    value={formData.precio}
                    onChange={(e) => setFormData({ ...formData, precio: e.target.value })}
                    className="input w-full"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    Stock *
                  </label>
                  <input
                    type="number"
                    min="0"
                    value={formData.stock}
                    onChange={(e) => setFormData({ ...formData, stock: e.target.value })}
                    className="input w-full"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    Fecha de Vencimiento
                  </label>
                  <input
                    type="date"
                    value={formData.fecha_vencimiento}
                    onChange={(e) => setFormData({ ...formData, fecha_vencimiento: e.target.value })}
                    className="input w-full"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  URL de Imagen
                </label>
                <input
                  type="url"
                  value={formData.imagen_url}
                  onChange={(e) => setFormData({ ...formData, imagen_url: e.target.value })}
                  className="input w-full"
                  placeholder="https://ejemplo.com/imagen.jpg"
                />
                {formData.imagen_url && (
                  <div className="mt-2">
                    <img
                      src={formData.imagen_url}
                      alt="Preview"
                      className="h-32 w-32 object-cover rounded border border-gray-300 dark:border-gray-600"
                      onError={(e) => {
                        e.target.style.display = 'none'
                      }}
                    />
                  </div>
                )}
              </div>

              <div className="flex space-x-3 pt-4">
                <button
                  type="button"
                  onClick={() => {
                    setShowModal(false)
                    setEditingItem(null)
                  }}
                  className="btn-secondary flex-1"
                >
                  Cancelar
                </button>
                <button type="submit" className="btn-primary flex-1">
                  {editingItem ? 'Actualizar' : 'Crear'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </Layout>
  )
}
