import { useState, useEffect, useRef } from 'react'
import { useParams, Link } from 'react-router-dom'
import { MapContainer, TileLayer, Marker, Popup, useMap } from 'react-leaflet'
import L from 'leaflet'
import 'leaflet/dist/leaflet.css'
import 'leaflet-routing-machine'
import 'leaflet-routing-machine/dist/leaflet-routing-machine.css'
import { getOrder } from '../api'
import { CheckCircle, Clock, ChefHat, Bike, Home } from 'lucide-react'

delete L.Icon.Default.prototype._getIconUrl
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon-2x.png',
  iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-shadow.png',
})

const riderIcon = L.divIcon({
  html: '<div style="font-size:28px">🛵</div>',
  className: '',
  iconSize: [32, 32],
  iconAnchor: [16, 16],
})

const destIcon = L.divIcon({
  html: '<div style="font-size:24px">📍</div>',
  className: '',
  iconSize: [28, 28],
  iconAnchor: [14, 28],
})

// Fixed restaurant location for the demo (kept as-is, since the order's
// actual restaurant address isn't geocoded yet)
const RESTAURANT_POS = [19.0760, 72.8777]

const STEPS = [
  { key: 'pending',           label: 'Order placed',        icon: CheckCircle },
  { key: 'confirmed',         label: 'Order confirmed',     icon: CheckCircle },
  { key: 'preparing',         label: 'Preparing your food', icon: ChefHat     },
  { key: 'out_for_delivery',  label: 'Out for delivery',    icon: Bike        },
  { key: 'delivered',         label: 'Delivered!',          icon: Home        },
]

// This component has no visual output of its own (`return null`) — its
// only job is to talk directly to the underlying Leaflet map object
// (via useMap) and add the routing-machine's road-following line to it.
// react-leaflet doesn't wrap this library, so we control it manually.
function RoutingMachine({ from, to, onRouteFound }) {
  const map = useMap()
  const controlRef = useRef(null)

  useEffect(() => {
    if (!from || !to || !map) return

    const control = L.Routing.control({
      waypoints: [L.latLng(from[0], from[1]), L.latLng(to[0], to[1])],
      lineOptions: {
        styles: [{ color: '#f97316', weight: 4, opacity: 0.85 }]
      },
      addWaypoints: false,
      draggableWaypoints: false,
      fitSelectedRoutes: true,
      show: false,               // hides the turn-by-turn text panel
      createMarker: () => null,  // we render our own emoji markers instead
    }).addTo(map)

    controlRef.current = control

    control.on('routesfound', (e) => {
      const coords = e.routes[0].coordinates.map(c => [c.lat, c.lng])
      onRouteFound(coords)
    })

    return () => {
      if (controlRef.current) map.removeControl(controlRef.current)
    }
  }, [map, from, to])

  return null
}

export default function TrackOrder() {
  const { orderId } = useParams()
  const [order, setOrder] = useState(null)
  const [userPos, setUserPos] = useState(null)
  const [routeCoords, setRouteCoords] = useState([])
  const [riderPos, setRiderPos] = useState(RESTAURANT_POS)
  const [statusIdx, setStatusIdx] = useState(1)
  const intervalRef = useRef(null)

  // Get the user's real location (their delivery destination on the map)
  useEffect(() => {
    if (!navigator.geolocation) {
      setUserPos([19.0896, 72.8656]) // fallback if browser doesn't support it
      return
    }
    navigator.geolocation.getCurrentPosition(
      (pos) => setUserPos([pos.coords.latitude, pos.coords.longitude]),
      () => setUserPos([19.0896, 72.8656]) // fallback if permission denied
    )
  }, [])

  useEffect(() => {
    getOrder(orderId)
      .then(res => setOrder(res.data))
      .catch(() => setOrder({
        _id: orderId,
        restaurantName: 'Burger Brothers',
        items: [{ name: 'Classic Smash Burger', qty: 1 }],
        total: 358,
        status: 'preparing',
        deliveryAddress: 'Navi Mumbai, Maharashtra',
      }))
  }, [orderId])

  // Once the routing machine returns the actual road path (an array of
  // [lat, lng] points following real streets), animate the rider along
  // THOSE points instead of a straight line between two coordinates.
  useEffect(() => {
    if (routeCoords.length === 0) return

    let i = 0
    const totalPoints = routeCoords.length

    intervalRef.current = setInterval(() => {
      i++
      const t = i / totalPoints
      const pointIdx = Math.min(i, totalPoints - 1)
      setRiderPos(routeCoords[pointIdx])

      if (t < 0.3)      setStatusIdx(2)
      else if (t < 0.6) setStatusIdx(3)
      else if (i >= totalPoints - 1) {
        setStatusIdx(4)
        clearInterval(intervalRef.current)
      }
    }, 300) // smaller interval since route has many more points than before

    return () => clearInterval(intervalRef.current)
  }, [routeCoords])

  return (
    <div className="max-w-2xl mx-auto px-4 py-6">
      <Link to="/orders" className="text-sm text-gray-400 hover:text-gray-700 mb-4 inline-block">
        ← My orders
      </Link>

      <div className="bg-white border border-gray-100 rounded-2xl p-5 mb-4">
        <div className="flex items-center justify-between mb-5">
          <h2 className="font-bold text-gray-900">Live tracking</h2>
          {order && (
            <span className="text-xs text-gray-400">{order.restaurantName}</span>
          )}
        </div>

        <div className="flex items-center">
          {STEPS.map((step, i) => {
            const done   = i <= statusIdx
            const active = i === statusIdx
            const Icon   = step.icon
            return (
              <div key={step.key} className="flex items-center flex-1 last:flex-none">
                <div className="flex flex-col items-center gap-1">
                  <div className={`w-8 h-8 rounded-full flex items-center justify-center transition-colors
                    ${active ? 'bg-orange-500 text-white shadow-md shadow-orange-200'
                    : done   ? 'bg-green-500 text-white'
                    :          'bg-gray-100 text-gray-400'}`}
                  >
                    <Icon size={14} />
                  </div>
                  <span
                    className={`text-center leading-tight hidden sm:block
                      ${active ? 'text-orange-500 font-medium'
                      : done   ? 'text-green-600'
                      :          'text-gray-400'}`}
                    style={{ fontSize: '10px', maxWidth: '60px' }}
                  >
                    {step.label}
                  </span>
                </div>
                {i < STEPS.length - 1 && (
                  <div className={`flex-1 h-0.5 mx-1 mb-4 transition-colors
                    ${i < statusIdx ? 'bg-green-400' : 'bg-gray-100'}`}
                  />
                )}
              </div>
            )
          })}
        </div>

        <div className="mt-3 flex items-center gap-2 text-sm">
          <Clock size={14} className="text-orange-500" />
          <span className="text-gray-600">
            {statusIdx >= 4
              ? 'Your order has been delivered! 🎉'
              : 'Estimated delivery: 25–35 minutes'
            }
          </span>
        </div>
      </div>

      <div className="rounded-2xl overflow-hidden border border-gray-100 mb-4"
        style={{ height: 320 }}>
        {userPos && (
          <MapContainer
            center={RESTAURANT_POS}
            zoom={13}
            style={{ height: '100%', width: '100%' }}
            zoomControl={false}
          >
            <TileLayer
              attribution='© <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
              url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
            />
            <RoutingMachine
              from={RESTAURANT_POS}
              to={userPos}
              onRouteFound={setRouteCoords}
            />
            <Marker position={riderPos} icon={riderIcon}>
              <Popup>Your delivery rider</Popup>
            </Marker>
            <Marker position={userPos} icon={destIcon}>
              <Popup>Your location</Popup>
            </Marker>
          </MapContainer>
        )}
      </div>

      {order && (
        <div className="bg-white border border-gray-100 rounded-2xl p-4">
          <h3 className="text-sm font-semibold text-gray-800 mb-3">Order summary</h3>
          <div className="space-y-1.5 mb-3">
            {order.items?.map((item, i) => (
              <div key={i} className="flex justify-between text-sm text-gray-600">
                <span>{item.name} × {item.qty}</span>
              </div>
            ))}
          </div>
          <div className="flex justify-between text-sm font-semibold text-gray-900 border-t border-gray-50 pt-2">
            <span>Total paid</span>
            <span>₹{order.total}</span>
          </div>
        </div>
      )}
    </div>
  )
}