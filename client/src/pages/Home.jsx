import { useState, useEffect } from 'react'
import { Search, MapPin } from 'lucide-react'
import RestaurantCard from '../components/RestaurantCard'

const CATEGORIES = ['All', 'Burgers', 'Pizza', 'Indian', 'Chinese', 'Desserts', 'Rolls']

const LOCATION_CACHE_KEY = 'quickbite_location'
const RESTAURANTS_CACHE_KEY = 'quickbite_restaurants'
const LOCATION_CACHE_MS = 2 * 60 * 60 * 1000 // 2 hours

// Each category has keywords to check against + a matching emoji
const CATEGORY_RULES = [
  { category: 'Pizza',    emoji: '🍕', keywords: ['pizza', 'italian'] },
  { category: 'Burgers',  emoji: '🍔', keywords: ['burger', 'fast_food', 'american'] },
  { category: 'Chinese',  emoji: '🍜', keywords: ['chinese', 'noodle', 'asian', 'thai'] },
  { category: 'Desserts', emoji: '🍦', keywords: ['cafe', 'dessert', 'bakery', 'ice_cream', 'sweet'] },
  { category: 'Rolls',    emoji: '🌯', keywords: ['kebab', 'roll', 'wrap', 'shawarma', 'street'] },
  { category: 'Indian',   emoji: '🍛', keywords: ['indian', 'regional_indian', 'south_indian', 'north_indian'] },
]

function randomCategoryRule() {
  return CATEGORY_RULES[Math.floor(Math.random() * CATEGORY_RULES.length)]
}

function guessEmojiAndCategory(cuisineTag = '', placeName = '') {
  const text = `${cuisineTag} ${placeName}`.toLowerCase()
  for (const rule of CATEGORY_RULES) {
    if (rule.keywords.some(kw => text.includes(kw))) {
      return { emoji: rule.emoji, category: rule.category }
    }
  }
  const fallback = randomCategoryRule()
  return { emoji: fallback.emoji, category: fallback.category }
}

// Queries OpenStreetMap's free Overpass API for real restaurants, cafes,
// and fast-food places within `radiusMeters` of the user's location.
async function fetchRealNearbyRestaurants(lat, lng, radiusMeters = 3000) {
  const query = `
    [out:json];
    (
      node["amenity"~"restaurant|fast_food|cafe"](around:${radiusMeters},${lat},${lng});
    );
    out body 30;
  `
  const url = `https://overpass-api.de/api/interpreter?data=${encodeURIComponent(query)}`
  const res = await fetch(url)
  const data = await res.json()

  return data.elements
    .filter(el => el.tags?.name)
    .map(el => {
      const { emoji, category } = guessEmojiAndCategory(el.tags.cuisine, el.tags.name)
      return {
        _id: `osm_${el.id}`,
        name: el.tags.name,
        cuisine: el.tags.cuisine
          ? el.tags.cuisine.replace(/_/g, ' ')
          : (el.tags.amenity === 'cafe' ? 'Cafe' : 'Multi-cuisine'),
        rating: (3.8 + Math.random() * 1.1).toFixed(1),
        priceForTwo: [200, 300, 400, 500][Math.floor(Math.random() * 4)],
        category,
        imageEmoji: emoji,
        offer: Math.random() > 0.5 ? `${[10, 15, 20][Math.floor(Math.random() * 3)]}% OFF` : null,
        location: { lat: el.lat, lng: el.lon },
      }
    })
}

// Real driving ETA via OSRM's free public routing server
async function fetchRealETA(fromLat, fromLng, toLat, toLng) {
  try {
    const url = `https://router.project-osrm.org/route/v1/driving/${fromLng},${fromLat};${toLng},${toLat}?overview=false`
    const res = await fetch(url)
    const data = await res.json()
    if (data.code !== 'Ok') return null
    const route = data.routes[0]
    return {
      distanceKm: route.distance / 1000,
      durationMin: Math.round(route.duration / 60),
    }
  } catch {
    return null
  }
}

export default function Home() {
  const [search, setSearch] = useState('')
  const [category, setCategory] = useState('All')
  const [restaurants, setRestaurants] = useState([])
  const [loading, setLoading] = useState(true)
  const [userLocation, setUserLocation] = useState(null)
  const [locationStatus, setLocationStatus] = useState('loading')
  const [error, setError] = useState('')

  // Step 1: get user location (from cache if fresh, else ask browser)
  useEffect(() => {
    const cached = localStorage.getItem(LOCATION_CACHE_KEY)
    if (cached) {
      try {
        const { lat, lng, timestamp } = JSON.parse(cached)
        const age = Date.now() - timestamp
        if (age < LOCATION_CACHE_MS) {
          setUserLocation({ lat, lng })
          setLocationStatus('granted')
          return
        }
      } catch {
        // corrupted cache, fall through to fresh fetch
      }
    }

    if (!navigator.geolocation) {
      setUserLocation({ lat: 19.0760, lng: 72.8777 })
      setLocationStatus('denied')
      return
    }

    navigator.geolocation.getCurrentPosition(
      (pos) => {
        const lat = pos.coords.latitude
        const lng = pos.coords.longitude
        setUserLocation({ lat, lng })
        setLocationStatus('granted')
        localStorage.setItem(LOCATION_CACHE_KEY, JSON.stringify({ lat, lng, timestamp: Date.now() }))
      },
      () => {
        setUserLocation({ lat: 19.0760, lng: 72.8777 })
        setLocationStatus('denied')
      }
    )
  }, [])

  // Step 2: once we have a location, load restaurants (from cache if fresh)
  useEffect(() => {
    if (!userLocation) return
    loadNearbyRestaurants()
  }, [userLocation])

  const loadNearbyRestaurants = async () => {
    const cached = localStorage.getItem(RESTAURANTS_CACHE_KEY)
    if (cached) {
      try {
        const { lat, lng, restaurants: cachedList, timestamp } = JSON.parse(cached)
        const age = Date.now() - timestamp
        const distMoved = Math.sqrt(
          Math.pow(lat - userLocation.lat, 2) + Math.pow(lng - userLocation.lng, 2)
        )
        if (age < LOCATION_CACHE_MS && distMoved < 0.01) {
          setRestaurants(cachedList)
          setLoading(false)
          return
        }
      } catch {
        // corrupted cache, fall through to fresh fetch
      }
    }

    setLoading(true)
    setError('')
    try {
      const places = await fetchRealNearbyRestaurants(userLocation.lat, userLocation.lng)

      if (places.length === 0) {
        setError('No real restaurants found nearby on OpenStreetMap for this area.')
        setRestaurants([])
        setLoading(false)
        return
      }

      const withEta = await Promise.all(
        places.map(async (r) => {
          const eta = await fetchRealETA(r.location.lat, r.location.lng, userLocation.lat, userLocation.lng)
          return {
            ...r,
            distanceKm: eta?.distanceKm ?? null,
            deliveryTime: eta?.durationMin ?? 30,
          }
        })
      )

      withEta.sort((a, b) => (a.distanceKm ?? 999) - (b.distanceKm ?? 999))
      setRestaurants(withEta)

      localStorage.setItem(RESTAURANTS_CACHE_KEY, JSON.stringify({
        lat: userLocation.lat,
        lng: userLocation.lng,
        restaurants: withEta,
        timestamp: Date.now(),
      }))
    } catch (err) {
      setError('Could not load nearby restaurants. Try again.')
    } finally {
      setLoading(false)
    }
  }

  const filtered = restaurants.filter(r =>
  (category === 'All' || r.category === category) &&
  r.name.toLowerCase().includes(search.toLowerCase())
)

  return (
    <div className="max-w-6xl mx-auto px-4 py-6">

      <div className="mb-6">
        <div className="flex items-center gap-1.5 text-sm text-gray-400 mb-1">
          <MapPin size={14} className="text-orange-500" />
          <span>
            {locationStatus === 'loading' && 'Finding your location...'}
            {locationStatus === 'granted' && 'Using your current location'}
            {locationStatus === 'denied' && 'Mumbai, Maharashtra (default)'}
          </span>
        </div>
        <h1 className="text-2xl font-bold text-gray-900">
          What are you craving? 🤤
        </h1>
      </div>

      <div className="flex items-center gap-3 bg-white border border-gray-200 rounded-xl px-4 py-3 mb-5 focus-within:border-orange-300 transition-colors">
        <Search size={18} className="text-gray-400 flex-shrink-0" />
        <input
          type="text"
          placeholder="Search for food or restaurants..."
          value={search}
          onChange={e => setSearch(e.target.value)}
          className="flex-1 outline-none text-sm text-gray-800 placeholder-gray-400 bg-transparent"
        />
      </div>

      <div className="flex gap-2 mb-6 overflow-x-auto pb-1">
        {CATEGORIES.map(cat => (
          <button
            key={cat}
            onClick={() => setCategory(cat)}
            className={`flex-shrink-0 px-4 py-1.5 rounded-full text-sm font-medium border transition-colors
              ${category === cat
                ? 'bg-orange-500 border-orange-500 text-white'
                : 'bg-white border-gray-200 text-gray-600 hover:border-gray-300'
              }`}
          >
            {cat}
          </button>
        ))}
      </div>

      <p className="text-sm text-gray-400 mb-3">
        {filtered.length} real restaurants near you
      </p>

      {loading ? (
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
          {[...Array(6)].map((_, i) => (
            <div key={i} className="bg-white rounded-2xl border border-gray-100 h-52 animate-pulse">
              <div className="h-36 bg-gray-100 rounded-t-2xl" />
              <div className="p-3 space-y-2">
                <div className="h-3 bg-gray-100 rounded w-3/4" />
                <div className="h-2.5 bg-gray-100 rounded w-1/2" />
              </div>
            </div>
          ))}
        </div>
      ) : error ? (
        <div className="text-center py-16 text-gray-400">
          <p className="text-4xl mb-3">📍</p>
          <p className="text-sm">{error}</p>
        </div>
      ) : filtered.length === 0 ? (
        <div className="text-center py-16 text-gray-400">
          <p className="text-4xl mb-3">🍽️</p>
          <p className="text-sm">No restaurants match your search/filter.</p>
        </div>
      ) : (
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
          {filtered.map(r => (
            <RestaurantCard
              key={r._id}
              restaurant={r}
              distanceKm={r.distanceKm}
            />
          ))}
        </div>
      )}

    </div>
  )
}