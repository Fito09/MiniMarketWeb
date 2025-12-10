import { useEffect, useState } from 'react'
import { Users, Plus, Edit2, Trash2, Search, Eye, EyeOff, X, Check } from 'lucide-react'
import Layout from '../../components/Layout'
import { supabase } from '../../lib/supabase'
import toast from 'react-hot-toast'

export default function Usuarios() {
  const [usuarios, setUsuarios] = useState([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState('')
  const [showModal, setShowModal] = useState(false)
  const [editingId, setEditingId] = useState(null)
  const [showPassword, setShowPassword] = useState(false)
  const [formData, setFormData] = useState({
    usuario: '',
    contrasena: '',
    rol: 'empleado',
    nombre: '',
    nombre_usuario: '',
    telefono: '',
    telefono_usuario: '',
  })

  useEffect(() => {
    loadUsuarios()
  }, [])

  const loadUsuarios = async () => {
    try {
      setLoading(true)
      const { data, error } = await supabase
        .from('usuario')
        .select(`
          id_usuario,
          usuario,
          nombre,
          rol,
          telefono,
          empleado:empleado(id_empleado, nombre, cargo, telefono),
          cliente:cliente(id_cliente, nombre, telefono)
        `)
        .order('usuario')

      if (error) throw error
      setUsuarios(data || [])
    } catch (error) {
      console.error('Error loading usuarios:', error)
      toast.error('Error al cargar usuarios')
    } finally {
      setLoading(false)
    }
  }

  const handleOpenModal = (usuario = null) => {
    if (usuario) {
      setEditingId(usuario.id_usuario)
      setFormData({
        usuario: usuario.usuario,
        contrasena: '',
        rol: usuario.rol,
        nombre: usuario.empleado?.nombre || usuario.cliente?.nombre || '',
        nombre_usuario: usuario.nombre || usuario.empleado?.nombre || usuario.cliente?.nombre || '',
        telefono: usuario.empleado?.telefono || usuario.cliente?.telefono || '',
        telefono_usuario: usuario.telefono || '',
      })
    } else {
      setEditingId(null)
      setFormData({
        usuario: '',
        contrasena: '',
        rol: 'empleado',
        nombre: '',
        nombre_usuario: '',
        telefono: '',
        telefono_usuario: '',
      })
    }
    setShowModal(true)
  }

  const handleCloseModal = () => {
    setShowModal(false)
    setEditingId(null)
    setFormData({
      usuario: '',
      contrasena: '',
      rol: 'empleado',
      nombre: '',
      nombre_usuario: '',
      telefono: '',
      telefono_usuario: '',
    })
  }

  const handleInputChange = (e) => {
    const { name, value } = e.target
    setFormData(prev => ({
      ...prev,
      [name]: value
    }))
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    
    if (!formData.usuario) {
      toast.error('Usuario es requerido')
      return
    }

    if (!formData.nombre) {
      toast.error('Nombre completo es requerido')
      return
    }

    if (!editingId && !formData.contrasena) {
      toast.error('Contraseña es requerida para nuevos usuarios')
      return
    }

    try {
      if (editingId) {
        // Actualizar usuario existente
        const updateData = {
          usuario: formData.usuario,
          rol: formData.rol,
          nombre: formData.nombre_usuario,
          telefono: formData.telefono_usuario,
        }

        // Si se proporciona contraseña, actualizarla
        if (formData.contrasena) {
          updateData.contrasena = formData.contrasena
        }

        const { error } = await supabase
          .from('usuario')
          .update(updateData)
          .eq('id_usuario', editingId)

        if (error) throw error

        // Actualizar empleado si el rol es empleado o repartidor
        if (formData.rol === 'empleado' || formData.rol === 'repartidor') {
          // Primero intentar actualizar
          const { error: empError, count } = await supabase
            .from('empleado')
            .update({
              nombre: formData.nombre,
              telefono: formData.telefono,
              tipo_cargo: formData.rol === 'repartidor' ? 'repartidor' : 'vendedor',
            })
            .eq('id_usuario', editingId)

          // Si no hay registros actualizados, crear uno nuevo
          if (!empError && count === 0) {
            await supabase
              .from('empleado')
              .insert({
                id_usuario: editingId,
                nombre: formData.nombre,
                telefono: formData.telefono,
                tipo_cargo: formData.rol === 'repartidor' ? 'repartidor' : 'vendedor',
              })
          }

          if (empError) {
            console.error('Error actualizando empleado:', empError)
          }
        }

        // Actualizar cliente si el rol es cliente
        if (formData.rol === 'cliente') {
          // Primero intentar actualizar
          const { error: cliError, count } = await supabase
            .from('cliente')
            .update({
              nombre: formData.nombre,
              telefono: formData.telefono,
            })
            .eq('id_usuario', editingId)

          // Si no hay registros actualizados, crear uno nuevo
          if (!cliError && count === 0) {
            await supabase
              .from('cliente')
              .insert({
                id_usuario: editingId,
                nombre: formData.nombre,
                telefono: formData.telefono,
                tipo: 'mayorista',
              })
          }

          if (cliError) {
            console.error('Error actualizando cliente:', cliError)
          }
        }

        toast.success('Usuario actualizado correctamente')
      } else {
        // Crear nuevo usuario
        const { data: newUser, error: dbError } = await supabase
          .from('usuario')
          .insert({
            usuario: formData.usuario,
            contrasena: formData.contrasena,
            rol: formData.rol,
            nombre: formData.nombre_usuario,
            telefono: formData.telefono_usuario,
          })
          .select()
          .single()

        if (dbError) throw dbError

        // Si es empleado o repartidor, crear registro en tabla empleado
        if (formData.rol === 'empleado' || formData.rol === 'repartidor') {
          await supabase
            .from('empleado')
            .insert({
              id_usuario: newUser.id_usuario,
              nombre: formData.nombre,
              telefono: formData.telefono,
              tipo_cargo: formData.rol === 'repartidor' ? 'repartidor' : 'vendedor',
            })
        }

        // Si es cliente, crear registro en tabla cliente
        if (formData.rol === 'cliente') {
          await supabase
            .from('cliente')
            .insert({
              id_usuario: newUser.id_usuario,
              nombre: formData.nombre,
              telefono: formData.telefono,
              tipo: 'mayorista',
              ci_ruc: '9999999999',
            })
        }

        toast.success('Usuario creado correctamente')
      }

      handleCloseModal()
      loadUsuarios()
    } catch (error) {
      console.error('Error saving usuario:', error)
      toast.error(error.message || 'Error al guardar usuario')
    }
  }

  const handleDelete = async (id) => {
    if (!window.confirm('¿Estás seguro de que deseas eliminar este usuario?')) {
      return
    }

    try {
      const { error } = await supabase
        .from('usuario')
        .delete()
        .eq('id_usuario', id)

      if (error) throw error
      toast.success('Usuario eliminado correctamente')
      loadUsuarios()
    } catch (error) {
      console.error('Error deleting usuario:', error)
      toast.error('Error al eliminar usuario')
    }
  }

  const filteredUsuarios = usuarios.filter(usuario => {
    const searchLower = searchTerm.toLowerCase()
    const nombre = usuario.empleado?.nombre || usuario.cliente?.nombre || ''
    return (
      usuario.usuario?.toLowerCase().includes(searchLower) ||
      nombre.toLowerCase().includes(searchLower)
    )
  })

  const getRolColor = (rol) => {
    switch (rol) {
      case 'admin':
        return 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200'
      case 'empleado':
        return 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200'
      case 'cliente':
        return 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200'
      case 'repartidor':
        return 'bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-200'
      default:
        return 'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-300'
    }
  }

  return (
    <Layout type="empleado">
      <div className="space-y-6">
        {/* Header */}
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 dark:text-white flex items-center gap-2">
              <Users size={32} />
              Gestión de Usuarios
            </h1>
            <p className="text-gray-600 dark:text-gray-400 mt-1">
              Administra los usuarios del sistema
            </p>
          </div>
          <button
            onClick={() => handleOpenModal()}
            className="bg-primary-600 hover:bg-primary-700 text-white px-4 py-2 rounded-lg flex items-center gap-2 transition-colors"
          >
            <Plus size={20} />
            Nuevo Usuario
          </button>
        </div>

        {/* Search */}
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-4">
          <div className="flex items-center gap-2 text-gray-600 dark:text-gray-400">
            <Search size={20} />
            <input
              type="text"
              placeholder="Buscar por usuario o nombre..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="flex-1 bg-transparent outline-none text-gray-900 dark:text-white placeholder-gray-400 dark:placeholder-gray-500"
            />
          </div>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-4">
            <p className="text-gray-600 dark:text-gray-400 text-sm">Total de Usuarios</p>
            <p className="text-3xl font-bold text-gray-900 dark:text-white mt-1">
              {usuarios.length}
            </p>
          </div>
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-4">
            <p className="text-gray-600 dark:text-gray-400 text-sm">Administradores</p>
            <p className="text-3xl font-bold text-red-600 mt-1">
              {usuarios.filter(u => u.rol === 'admin').length}
            </p>
          </div>
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-4">
            <p className="text-gray-600 dark:text-gray-400 text-sm">Empleados</p>
            <p className="text-3xl font-bold text-blue-600 mt-1">
              {usuarios.filter(u => u.rol === 'empleado').length}
            </p>
          </div>
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-4">
            <p className="text-gray-600 dark:text-gray-400 text-sm">Repartidores</p>
            <p className="text-3xl font-bold text-purple-600 mt-1">
              {usuarios.filter(u => u.rol === 'repartidor').length}
            </p>
          </div>
        </div>

        {/* Table */}
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow overflow-hidden">
          {loading ? (
            <div className="p-8 text-center text-gray-500 dark:text-gray-400">
              Cargando usuarios...
            </div>
          ) : filteredUsuarios.length === 0 ? (
            <div className="p-8 text-center text-gray-500 dark:text-gray-400">
              No hay usuarios para mostrar
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-50 dark:bg-gray-700 border-b border-gray-200 dark:border-gray-600">
                  <tr>
                    <th className="px-6 py-3 text-left text-sm font-semibold text-gray-900 dark:text-white">
                      Usuario
                    </th>
                    <th className="px-6 py-3 text-left text-sm font-semibold text-gray-900 dark:text-white">
                      Nombre Completo
                    </th>
                    <th className="px-6 py-3 text-left text-sm font-semibold text-gray-900 dark:text-white">
                      Rol
                    </th>
                    <th className="px-6 py-3 text-left text-sm font-semibold text-gray-900 dark:text-white">
                      Teléfono Usuario
                    </th>
                    <th className="px-6 py-3 text-left text-sm font-semibold text-gray-900 dark:text-white">
                      Teléfono Empleado/Cliente
                    </th>
                    <th className="px-6 py-3 text-left text-sm font-semibold text-gray-900 dark:text-white">
                      Acciones
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
                  {filteredUsuarios.map((usuario) => (
                    <tr key={usuario.id_usuario} className="hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors">
                      <td className="px-6 py-4 text-sm text-gray-900 dark:text-white font-medium">
                        {usuario.usuario}
                      </td>
                      <td className="px-6 py-4 text-sm text-gray-600 dark:text-gray-400">
                        {usuario.empleado?.nombre || usuario.cliente?.nombre || '-'}
                      </td>
                      <td className="px-6 py-4 text-sm">
                        <span className={`px-3 py-1 rounded-full text-xs font-semibold ${getRolColor(usuario.rol)}`}>
                          {usuario.rol}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-sm text-gray-600 dark:text-gray-400">
                        {usuario.telefono || '-'}
                      </td>
                      <td className="px-6 py-4 text-sm text-gray-600 dark:text-gray-400">
                        {usuario.empleado?.telefono || usuario.cliente?.telefono || '-'}
                      </td>
                      <td className="px-6 py-4 text-sm space-x-2 flex">
                        <button
                          onClick={() => handleOpenModal(usuario)}
                          className="p-2 text-blue-600 hover:bg-blue-50 dark:hover:bg-blue-900/20 rounded-lg transition-colors"
                          title="Editar"
                        >
                          <Edit2 size={18} />
                        </button>
                        <button
                          onClick={() => handleDelete(usuario.id_usuario)}
                          className="p-2 text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg transition-colors"
                          title="Eliminar"
                        >
                          <Trash2 size={18} />
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>

      {/* Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg max-w-md w-full">
            <div className="flex justify-between items-center p-6 border-b border-gray-200 dark:border-gray-700">
              <h2 className="text-xl font-bold text-gray-900 dark:text-white">
                {editingId ? 'Editar Usuario' : 'Nuevo Usuario'}
              </h2>
              <button
                onClick={handleCloseModal}
                className="text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-300"
              >
                <X size={24} />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="p-6 space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Usuario *
                </label>
                <input
                  type="text"
                  name="usuario"
                  value={formData.usuario}
                  onChange={handleInputChange}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-primary-500"
                  required
                  disabled={editingId ? true : false}
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Nombre de Usuario
                </label>
                <input
                  type="text"
                  name="nombre_usuario"
                  value={formData.nombre_usuario}
                  onChange={handleInputChange}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-primary-500"
                  placeholder="Nombre completo del usuario"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Teléfono de Usuario
                </label>
                <input
                  type="tel"
                  name="telefono_usuario"
                  value={formData.telefono_usuario}
                  onChange={handleInputChange}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-primary-500"
                  placeholder="Teléfono del usuario"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Nombre Completo *
                </label>
                <input
                  type="text"
                  name="nombre"
                  value={formData.nombre}
                  onChange={handleInputChange}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-primary-500"
                  placeholder="Nombre del empleado/cliente"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Teléfono del Empleado/Cliente
                </label>
                <input
                  type="tel"
                  name="telefono"
                  value={formData.telefono}
                  onChange={handleInputChange}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-primary-500"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Rol *
                </label>
                <select
                  name="rol"
                  value={formData.rol}
                  onChange={handleInputChange}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-primary-500"
                  required
                >
                  <option value="empleado">empleado</option>
                  <option value="repartidor">repartidor</option>
                  <option value="admin">admin</option>
                  <option value="cliente">cliente</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Contraseña {editingId ? '(dejar en blanco para no cambiar)' : '*'}
                </label>
                <div className="relative">
                  <input
                    type={showPassword ? 'text' : 'password'}
                    name="contrasena"
                    value={formData.contrasena}
                    onChange={handleInputChange}
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-primary-500"
                    required={!editingId}
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-300"
                  >
                    {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                  </button>
                </div>
              </div>

              <div className="flex gap-3 pt-4">
                <button
                  type="button"
                  onClick={handleCloseModal}
                  className="flex-1 px-4 py-2 border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="flex-1 px-4 py-2 bg-primary-600 hover:bg-primary-700 text-white rounded-lg transition-colors flex items-center justify-center gap-2"
                >
                  <Check size={18} />
                  {editingId ? 'Actualizar' : 'Crear'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </Layout>
  )
}
