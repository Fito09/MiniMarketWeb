import { useEffect, useRef, useState } from 'react'
import { X, MapPin, Navigation, Check } from 'lucide-react'
import toast from 'react-hot-toast'

const GOOGLE_MAPS_API_KEY = 'AIzaSyCyQ8v_j2uPV5lkHqezvdhQbkTgMEkrYJk'

// Variable global para cargar Google Maps solo una vez
let googleMapsScriptLoaded = false

export default function DeliveryModal({ reparto, onClose, onDelivered }) {
  const mapRef = useRef(null)
  const mapInstance = useRef(null)
  const [currentLocation, setCurrentLocation] = useState(null)
  const [distance, setDistance] = useState(null)
  const [duration, setDuration] = useState(null)
  const [routeCoordinates, setRouteCoordinates] = useState(null)

  // Obtener ruta de OSRM
  const fetchOSRMRoute = async (startLat, startLng, endLat, endLng) => {
    try {
      const response = await fetch(
        `https://router.project-osrm.org/route/v1/driving/${startLng},${startLat};${endLng},${endLat}?overview=full&geometries=geojson`
      )
      const data = await response.json()
      
      if (data.routes && data.routes.length > 0) {
        const route = data.routes[0]
        const coordinates = route.geometry.coordinates.map(coord => ({
          lat: coord[1],
          lng: coord[0]
        }))
        
        const distanceKm = route.distance / 1000
        const durationMin = Math.ceil(route.duration / 60)
        
        setRouteCoordinates(coordinates)
        setDistance(`${distanceKm.toFixed(1)} km`)
        setDuration(`${durationMin} min`)
      }
    } catch (error) {
      console.error('Error fetching OSRM route:', error)
      // Fallback a cálculo aproximado
      const R = 6371
      const dLat = (endLat - startLat) * Math.PI / 180
      const dLng = (endLng - startLng) * Math.PI / 180
      const a = Math.sin(dLat / 2) * Math.sin(dLat / 2) +
        Math.cos(startLat * Math.PI / 180) * Math.cos(endLat * Math.PI / 180) *
        Math.sin(dLng / 2) * Math.sin(dLng / 2)
      const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a))
      const distanceKm = R * c
      
      setDistance(`${distanceKm.toFixed(1)} km`)
      setDuration(`${Math.ceil(distanceKm / 40)} min`)
    }
  }

  useEffect(() => {
    let isMounted = true

    // Obtener ubicación actual
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        position => {
          if (isMounted) {
            const currentLat = position.coords.latitude
            const currentLng = position.coords.longitude
            
            setCurrentLocation({
              lat: currentLat,
              lng: currentLng,
            })

            // Obtener ruta de OSRM
            const deliveryLat = parseFloat(reparto.venta?.latitud) || -17.3895
            const deliveryLng = parseFloat(reparto.venta?.longitud) || -66.1568
            
            fetchOSRMRoute(currentLat, currentLng, deliveryLat, deliveryLng)
          }
        },
        error => {
          console.error('Error getting location:', error)
          if (isMounted) {
            setDistance('--')
            setDuration('--')
          }
        }
      )
    }

    return () => {
      isMounted = false
    }
  }, [reparto])

  // Cargar Google Maps solo una vez
  useEffect(() => {
    if (googleMapsScriptLoaded || window.google?.maps) {
      initializeMap()
      return
    }

    if (!googleMapsScriptLoaded) {
      googleMapsScriptLoaded = true
      const script = document.createElement('script')
      script.src = `https://maps.googleapis.com/maps/api/js?key=${GOOGLE_MAPS_API_KEY}&libraries=geometry`
      script.async = true
      script.defer = true
      script.onload = () => {
        initializeMap()
      }
      script.onerror = () => {
        console.error('Error loading Google Maps - Habilita Billing en Google Cloud Console')
        googleMapsScriptLoaded = false
      }
      document.head.appendChild(script)
    }
  }, [])

  const initializeMap = () => {
    if (!mapRef.current || !currentLocation || !window.google?.maps) return

    try {
      // Limpiar mapa anterior si existe
      if (mapInstance.current) {
        mapInstance.current = null
      }

      const deliveryLocation = {
        lat: parseFloat(reparto.venta?.latitud) || -17.3895,
        lng: parseFloat(reparto.venta?.longitud) || -66.1568,
      }

      mapInstance.current = new window.google.maps.Map(mapRef.current, {
        zoom: 15,
        center: deliveryLocation,
        mapTypeControl: false,
        fullscreenControl: false,
      })

      // Marcador de destino
      new window.google.maps.Marker({
        position: deliveryLocation,
        map: mapInstance.current,
        title: 'Punto de entrega',
        icon: 'http://maps.google.com/mapfiles/ms/icons/green-dot.png',
      })

      // Marcador de ubicación actual
      new window.google.maps.Marker({
        position: currentLocation,
        map: mapInstance.current,
        title: 'Tu ubicación',
        icon: 'http://maps.google.com/mapfiles/ms/icons/blue-dot.png',
      })

      // Polyline con ruta de OSRM
      const polylinePath = routeCoordinates || [currentLocation, deliveryLocation]
      new window.google.maps.Polyline({
        path: polylinePath,
        geodesic: !routeCoordinates, // Solo geodésico si no tenemos ruta real
        strokeColor: '#FF0000',
        strokeOpacity: 0.7,
        strokeWeight: 3,
        map: mapInstance.current,
      })

      // Ajustar zoom
      const bounds = new window.google.maps.LatLngBounds()
      bounds.extend(currentLocation)
      bounds.extend(deliveryLocation)
      mapInstance.current.fitBounds(bounds)
    } catch (error) {
      console.error('Error initializing map:', error)
      // No lanzar error para evitar que se reinicie la página
      if (mapRef.current) {
        mapRef.current.innerHTML = '<div style="display:flex;align-items:center;justify-content:center;height:100%;color:#999;font-size:14px;">Mapa no disponible - Habilita Billing en Google Cloud</div>'
      }
    }
  }

  // Dibujar mapa cuando currentLocation esté disponible o cuando la ruta cambie
  useEffect(() => {
    if (currentLocation && window.google?.maps) {
      initializeMap()
    }
  }, [currentLocation, routeCoordinates])

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="sticky top-0 bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700 p-4 flex justify-between items-center">
          <h2 className="text-xl font-bold text-gray-900 dark:text-white">
            Entregar Pedido #{reparto.venta?.id_venta}
          </h2>
          <button
            onClick={onClose}
            className="text-gray-500 hover:text-gray-700 dark:hover:text-gray-300"
          >
            <X className="w-6 h-6" />
          </button>
        </div>

        {/* Contenido */}
        <div className="p-4">
          {/* Mapa */}
          <div className="mb-6">
            <div
              ref={mapRef}
              className="w-full h-80 rounded-lg border border-gray-200 dark:border-gray-700 bg-gray-100 dark:bg-gray-700"
            />
          </div>

          {/* Información de Ruta */}
          {distance && duration && (
            <div className="grid grid-cols-2 gap-4 mb-6">
              <div className="bg-blue-50 dark:bg-blue-900/20 rounded-lg p-4 border border-blue-200 dark:border-blue-800">
                <p className="text-sm text-blue-600 dark:text-blue-400 font-medium mb-1">
                  Distancia
                </p>
                <p className="text-2xl font-bold text-blue-900 dark:text-blue-100">
                  {distance}
                </p>
              </div>
              <div className="bg-green-50 dark:bg-green-900/20 rounded-lg p-4 border border-green-200 dark:border-green-800">
                <p className="text-sm text-green-600 dark:text-green-400 font-medium mb-1">
                  Tiempo Estimado
                </p>
                <p className="text-2xl font-bold text-green-900 dark:text-green-100">
                  {duration}
                </p>
              </div>
            </div>
          )}

          {/* Información de Entrega */}
          <div className="bg-gray-50 dark:bg-gray-700 rounded-lg p-4 mb-6">
            <div className="flex items-start gap-3 mb-4">
              <MapPin className="w-5 h-5 text-primary-600 mt-1 flex-shrink-0" />
              <div>
                <p className="font-semibold text-gray-900 dark:text-white mb-1">
                  Dirección de Entrega
                </p>
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  {reparto.venta?.direccion_envio ||
                    reparto.venta?.cliente?.direccion}
                </p>
              </div>
            </div>
            <div className="flex items-start gap-3">
              <Navigation className="w-5 h-5 text-primary-600 mt-1 flex-shrink-0" />
              <div>
                <p className="font-semibold text-gray-900 dark:text-white mb-1">
                  Coordenadas
                </p>
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  {reparto.venta?.latitud}, {reparto.venta?.longitud}
                </p>
              </div>
            </div>
          </div>

          {/* Información del Cliente */}
          <div className="bg-gray-50 dark:bg-gray-700 rounded-lg p-4 mb-6">
            <p className="font-semibold text-gray-900 dark:text-white mb-2">
              Información del Cliente
            </p>
            <p className="text-sm text-gray-600 dark:text-gray-400 mb-1">
              <strong>Nombre:</strong> {reparto.venta?.cliente?.nombre}
            </p>
            <p className="text-sm text-gray-600 dark:text-gray-400">
              <strong>Teléfono:</strong> {reparto.venta?.cliente?.telefono}
            </p>
          </div>

          {/* Botones de Acción */}
          <div className="flex gap-3">
            <button
              onClick={onClose}
              className="flex-1 bg-gray-300 dark:bg-gray-600 hover:bg-gray-400 dark:hover:bg-gray-500 text-gray-900 dark:text-white font-medium py-3 px-4 rounded-lg transition-colors"
            >
              Cancelar
            </button>
            <button
              onClick={onDelivered}
              className="flex-1 bg-green-600 hover:bg-green-700 text-white font-medium py-3 px-4 rounded-lg transition-colors flex items-center justify-center gap-2"
            >
              <Check className="w-5 h-5" />
              Marcar como Entregado
            </button>
          </div>

          {/* Nota */}
          <p className="text-xs text-gray-500 dark:text-gray-400 mt-4 text-center">
            La línea roja muestra la ruta desde tu ubicación actual hasta el punto de entrega.
          </p>
        </div>
      </div>
    </div>
  )
}
