import mongoose from 'mongoose'

const orderItemSchema = new mongoose.Schema({
  item:  { type: mongoose.Schema.Types.ObjectId },
  name:  { type: String },
  price: { type: Number },
  qty:   { type: Number },
})

const orderSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  restaurantId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Restaurant'
  },
  restaurantName:  { type: String },
  items:           [orderItemSchema],
  deliveryAddress: { type: String, required: true },
  subtotal:        { type: Number },
  deliveryFee:     { type: Number },
  gst:             { type: Number },
  total:           { type: Number, required: true },
  status: {
    type: String,
    enum: ['pending', 'confirmed', 'preparing', 'out_for_delivery', 'delivered', 'cancelled'],
    default: 'pending'
  },
  paymentIntentId: { type: String },
  paymentStatus: {
    type: String,
    enum: ['pending', 'paid', 'failed'],
    default: 'pending'
  },
  riderLocation: {
    lat: { type: Number },
    lng: { type: Number },
  },
}, { timestamps: true })

export default mongoose.model('Order', orderSchema)