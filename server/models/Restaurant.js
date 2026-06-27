import mongoose from 'mongoose'

const menuItemSchema = new mongoose.Schema({
  name:        { type: String, required: true },
  description: { type: String },
  price:       { type: Number, required: true },
  emoji:       { type: String, default: '🍽️' },
  isVeg:       { type: Boolean, default: true },
  category:    { type: String },
  available:   { type: Boolean, default: true },
})

const menuCategorySchema = new mongoose.Schema({
  name:  { type: String },
  items: [menuItemSchema],
})

const restaurantSchema = new mongoose.Schema({
  name:         { type: String, required: true },
  cuisine:      { type: String },
  rating:       { type: Number, default: 4.0, min: 1, max: 5 },
  deliveryTime: { type: Number, default: 30 },
  offer:        { type: String },
  imageEmoji:   { type: String, default: '🍽️' },
  priceForTwo:  { type: Number },
  category:     { type: String },
  isOpen:       { type: Boolean, default: true },
  categories:   [menuCategorySchema],
  location: {
    lat:     { type: Number },
    lng:     { type: Number },
    address: { type: String },
  },
}, { timestamps: true })

export default mongoose.model('Restaurant', restaurantSchema)