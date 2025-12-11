import { useEffect, useState } from 'react'
import { Users, Calendar, Clock, Search, Filter, Download } from 'lucide-react'
import Layout from '../../components/Layout'
import { supabase } from '../../lib/supabase'
import { format, startOfMonth, endOfMonth, subMonths } from 'date-fns'
import { es } from 'date-fns/locale'

export default function AsistenciaEmpleados() {
  const [asistencias, setAsistencias] = useState([])
  const [empleados, setEmpleados] = useState([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState('')
  const [selectedEmpleado, setSelectedEmpleado] = useState('')
  const [dateRange, setDateRange] = useState({
    inicio: format(startOfMonth(new Date()), 'yyyy-MM-dd'),
    fin: format(endOfMonth(new Date()), 'yyyy-MM-dd'),
  })

  useEffect(() => {
    loadData()
  }, [dateRange, selectedEmpleado])

  const loadData = async () => {
    try {
      setLoading(true)
      
      // Cargar empleados
      const { data: empleadosData, error: empError } = await supabase
        .from('empleado')
        .select('*')
        .order('nombre')

      if (empError) throw empError

      // Construir query de asistencias
      let query = supabase
        .from('asistencia')
        .select(`
          *,
          empleado:id_empleado (
            id_empleado,
            nombre,
            rol,
            telefono
          )
        `)
        .gte('fecha', dateRange.inicio)
        .lte('fecha', dateRange.fin)
        .order('fecha', { ascending: false })

      // Filtrar por empleado si está seleccionado
      if (selectedEmpleado) {
        query = query.eq('id_empleado', parseInt(selectedEmpleado))
      }

      const { data: asistenciasData, error: asistError } = await query

      if (asistError) throw asistError

      setEmpleados(empleadosData || [])
      setAsistencias(asistenciasData || [])
    } catch (error) {
      console.error('Error loading data:', error)
      alert('Error al cargar los datos')
    } finally {
      setLoading(false)
    }
  }

  const calcularHorasTrabajadas = (entrada, salida) => {
    if (!entrada || !salida) return 'N/A'
    
    const horaEntrada = new Date(entrada)
    const horaSalida = new Date(salida)
    const diff = horaSalida - horaEntrada
    const horas = Math.floor(diff / (1000 * 60 * 60))
    const minutos = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60))
    
    return `${horas}h ${minutos}m`
  }

  const getEstadoAsistencia = (entrada, salida) => {
    if (!entrada) return { text: 'Sin registro', color: 'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-300' }
    if (!salida) return { text: 'En turno', color: 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200' }
    return { text: 'Completado', color: 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200' }
  }

  const filteredAsistencias = asistencias.filter((item) => {
    const searchLower = searchTerm.toLowerCase()
    return item.empleado?.nombre?.toLowerCase().includes(searchLower)
  })

  // Calcular estadísticas
  const stats = {
    totalRegistros: asistencias.length,
    empleadosActivos: new Set(asistencias.map(a => a.id_empleado)).size,
    registrosCompletos: asistencias.filter(a => a.hora_entrada && a.hora_salida).length,
    registrosPendientes: asistencias.filter(a => a.hora_entrada && !a.hora_salida).length,
  }

  const exportarCSV = () => {
    const headers = ['Fecha', 'Empleado', 'Cargo', 'Hora Entrada', 'Hora Salida', 'Horas Trabajadas']
    const rows = filteredAsistencias.map(a => [
      format(new Date(a.fecha), 'dd/MM/yyyy'),
      a.empleado?.nombre || 'N/A',
      a.empleado?.cargo || 'N/A',
      a.hora_entrada ? format(new Date(a.hora_entrada), 'HH:mm') : 'N/A',
      a.hora_salida ? format(new Date(a.hora_salida), 'HH:mm') : 'N/A',
      calcularHorasTrabajadas(a.hora_entrada, a.hora_salida),
    ])

    const csv = [headers, ...rows].map(row => row.join(',')).join('\n')
    const blob = new Blob([csv], { type: 'text/csv' })
    const url = window.URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `asistencias_${format(new Date(), 'yyyy-MM-dd')}.csv`
    a.click()
  }

  return (
    <Layout type="empleado">
      <div className="space-y-6">
        {/* Header */}
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
              Asistencia de Empleados
            </h1>
            <p className="text-gray-600 dark:text-gray-400 mt-1">
              Monitorea la asistencia y horas trabajadas
            </p>
          </div>
          <button
            onClick={exportarCSV}
            className="btn-primary flex items-center"
          >
            <Download className="w-5 h-5 mr-2" />
            Exportar CSV
          </button>
        </div>

        {/* Estadísticas */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div className="card bg-blue-50 dark:bg-blue-900/20 border-blue-200 dark:border-blue-800">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-blue-600 dark:text-blue-400">Total Registros</p>
                <p className="text-2xl font-bold text-blue-700 dark:text-blue-300">
                  {stats.totalRegistros}
                </p>
              </div>
              <Calendar className="w-8 h-8 text-blue-600 dark:text-blue-400" />
            </div>
          </div>
          <div className="card bg-purple-50 dark:bg-purple-900/20 border-purple-200 dark:border-purple-800">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-purple-600 dark:text-purple-400">Empleados Activos</p>
                <p className="text-2xl font-bold text-purple-700 dark:text-purple-300">
                  {stats.empleadosActivos}
                </p>
              </div>
              <Users className="w-8 h-8 text-purple-600 dark:text-purple-400" />
            </div>
          </div>
          <div className="card bg-green-50 dark:bg-green-900/20 border-green-200 dark:border-green-800">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-green-600 dark:text-green-400">Completos</p>
                <p className="text-2xl font-bold text-green-700 dark:text-green-300">
                  {stats.registrosCompletos}
                </p>
              </div>
              <Clock className="w-8 h-8 text-green-600 dark:text-green-400" />
            </div>
          </div>
          <div className="card bg-yellow-50 dark:bg-yellow-900/20 border-yellow-200 dark:border-yellow-800">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-yellow-600 dark:text-yellow-400">En Turno</p>
                <p className="text-2xl font-bold text-yellow-700 dark:text-yellow-300">
                  {stats.registrosPendientes}
                </p>
              </div>
              <Clock className="w-8 h-8 text-yellow-600 dark:text-yellow-400" />
            </div>
          </div>
        </div>

        {/* Filtros */}
        <div className="card">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            {/* Búsqueda */}
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
              <input
                type="text"
                placeholder="Buscar empleado..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="input pl-10 w-full"
              />
            </div>

            {/* Filtro por empleado */}
            <div className="relative">
              <Filter className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
              <select
                value={selectedEmpleado}
                onChange={(e) => setSelectedEmpleado(e.target.value)}
                className="input pl-10 w-full"
              >
                <option value="">Todos los empleados</option>
                {empleados.map((emp) => (
                  <option key={emp.id_empleado} value={emp.id_empleado}>
                    {emp.nombre}
                  </option>
                ))}
              </select>
            </div>

            {/* Fecha inicio */}
            <div>
              <input
                type="date"
                value={dateRange.inicio}
                onChange={(e) => setDateRange({ ...dateRange, inicio: e.target.value })}
                className="input w-full"
              />
            </div>

            {/* Fecha fin */}
            <div>
              <input
                type="date"
                value={dateRange.fin}
                onChange={(e) => setDateRange({ ...dateRange, fin: e.target.value })}
                className="input w-full"
              />
            </div>
          </div>

          {/* Botones de rango rápido */}
          <div className="flex flex-wrap gap-2 mt-4">
            <button
              onClick={() => setDateRange({
                inicio: format(startOfMonth(new Date()), 'yyyy-MM-dd'),
                fin: format(endOfMonth(new Date()), 'yyyy-MM-dd'),
              })}
              className="px-3 py-1 text-sm bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 rounded hover:bg-gray-200 dark:hover:bg-gray-600"
            >
              Este mes
            </button>
            <button
              onClick={() => setDateRange({
                inicio: format(startOfMonth(subMonths(new Date(), 1)), 'yyyy-MM-dd'),
                fin: format(endOfMonth(subMonths(new Date(), 1)), 'yyyy-MM-dd'),
              })}
              className="px-3 py-1 text-sm bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 rounded hover:bg-gray-200 dark:hover:bg-gray-600"
            >
              Mes anterior
            </button>
            <button
              onClick={() => setDateRange({
                inicio: format(new Date(), 'yyyy-MM-dd'),
                fin: format(new Date(), 'yyyy-MM-dd'),
              })}
              className="px-3 py-1 text-sm bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 rounded hover:bg-gray-200 dark:hover:bg-gray-600"
            >
              Hoy
            </button>
          </div>
        </div>

        {/* Tabla de asistencias */}
        <div className="card overflow-hidden">
          {loading ? (
            <div className="text-center py-12">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600 mx-auto"></div>
              <p className="text-gray-600 dark:text-gray-400 mt-4">Cargando...</p>
            </div>
          ) : filteredAsistencias.length === 0 ? (
            <div className="text-center py-12">
              <Users className="w-16 h-16 text-gray-400 mx-auto mb-4" />
              <p className="text-gray-600 dark:text-gray-400">
                {searchTerm || selectedEmpleado ? 'No se encontraron registros' : 'No hay registros de asistencia'}
              </p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
                <thead className="bg-gray-50 dark:bg-gray-800">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                      Fecha
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                      Empleado
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                      Cargo
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                      Hora Entrada
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                      Hora Salida
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                      Horas Trabajadas
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                      Estado
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white dark:bg-gray-900 divide-y divide-gray-200 dark:divide-gray-700">
                  {filteredAsistencias.map((item) => {
                    const estado = getEstadoAsistencia(item.hora_entrada, item.hora_salida)
                    return (
                      <tr key={item.id_asistencia} className="hover:bg-gray-50 dark:hover:bg-gray-800">
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="flex items-center text-sm text-gray-900 dark:text-white">
                            <Calendar className="w-4 h-4 mr-2 text-gray-400" />
                            {format(new Date(item.fecha), 'dd/MM/yyyy', { locale: es })}
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="flex items-center">
                            <Users className="w-5 h-5 text-gray-400 mr-2" />
                            <div className="text-sm font-medium text-gray-900 dark:text-white">
                              {item.empleado?.nombre || 'N/A'}
                            </div>
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span className="px-2 py-1 text-xs font-medium rounded-full bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-200">
                            {item.empleado?.cargo || 'N/A'}
                          </span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="flex items-center text-sm text-gray-900 dark:text-white">
                            <Clock className="w-4 h-4 mr-2 text-green-500" />
                            {item.hora_entrada ? format(new Date(item.hora_entrada), 'HH:mm') : 'N/A'}
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="flex items-center text-sm text-gray-900 dark:text-white">
                            <Clock className="w-4 h-4 mr-2 text-red-500" />
                            {item.hora_salida ? format(new Date(item.hora_salida), 'HH:mm') : 'N/A'}
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="text-sm font-semibold text-gray-900 dark:text-white">
                            {calcularHorasTrabajadas(item.hora_entrada, item.hora_salida)}
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span className={`px-2 py-1 text-xs font-medium rounded-full ${estado.color}`}>
                            {estado.text}
                          </span>
                        </td>
                      </tr>
                    )
                  })}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
    </Layout>
  )
}
