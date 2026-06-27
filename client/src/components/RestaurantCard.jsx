import { Link } from 'react-router-dom'
import { Star, Clock, Tag, MapPin } from 'lucide-react'

export default function RestaurantCard({ restaurant, distanceKm }) {
  const { _id, name, cuisine, rating, deliveryTime, offer, imageEmoji, priceForTwo } = restaurant

  return (
    <Link
      to={`/restaurant/${_id}`}
      className="block bg-white rounded-2xl border border-gray-100 overflow-hidden hover:border-gray-200 hover:shadow-sm transition-all group"
    >
      <div className="h-36 bg-gray-50 flex items-center justify-center text-5xl group-hover:bg-gray-100 transition-colors">
        {imageEmoji}
      </div>

      <div className="p-3.5">
        <h3 className="font-semibold text-gray-900 text-sm mb-0.5">{name}</h3>
        <p className="text-xs text-gray-400 mb-2">{cuisine}</p>

        <div className="flex items-center gap-3 text-xs text-gray-500 mb-2 flex-wrap">
          <span className="flex items-center gap-1 text-green-600 font-medium">
            <Star size={11} fill="currentColor" />
            {rating}
          </span>
          <span className="flex items-center gap-1">
            <Clock size={11} />
            {deliveryTime} min
          </span>
          <span>₹{priceForTwo} for two</span>
          {typeof distanceKm === 'number' && (
            <span className="flex items-center gap-1 text-gray-500">
              <MapPin size={11} />
              {distanceKm < 1
                ? `${Math.round(distanceKm * 1000)} m`
                : `${distanceKm.toFixed(1)} km`}
            </span>
          )}
        </div>

        {offer && (
          <div className="flex items-center gap-1 text-xs text-green-700 bg-green-50 px-2 py-1 rounded-md w-fit">
            <Tag size={10} />
            {offer}
          </div>
        )}
      </div>
    </Link>
  )
}