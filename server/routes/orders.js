import express from 'express'
import Order from '../models/Order.js'
import authMiddleware from '../middleware/auth.js'

const router = express.Router()

const sendSMS = async (to, message) => {
  try {
    const sid   = process.env.TWILIO_ACCOUNT_SID
    const token = process.env.TWILIO_AUTH_TOKEN
    const from  = process.env.TWILIO_PHONE_NUMBER

    console.log('Twilio SID inside sendSMS:', sid)

    if (!sid || !token || !from) {
      console.log('Twilio not configured — skipping SMS')
      return
    }

    const twilio = (await import('twilio')).default
    const client = twilio(sid, token)

    await client.messages.create({
      body: message,
      from: from,
      to: to,
    })

    console.log('✅ SMS sent to', to)
  } catch (err) {
    console.log('SMS failed:', err.message)
  }
}

// POST /api/orders
router.post('/', authMiddleware, async (req, res) => {
  try {
    const {
      items,
      restaurantId,
      restaurantName,
      deliveryAddress,
      subtotal,
      deliveryFee,
      gst,
      total,
      paymentIntentId,
    } = req.body

    if (!items?.length || !deliveryAddress || !total)
      return res.status(400).json({ message: 'Missing required fields' })

    const order = await Order.create({
      user:            req.user.id,
      restaurantId,
      restaurantName,
      items,
      deliveryAddress,
      subtotal,
      deliveryFee,
      gst,
      total,
      paymentIntentId,
      status:          'confirmed',
      paymentStatus:   'paid',
    })

    const User = (await import('../models/User.js')).default
    const userData = await User.findById(req.user.id)

    const phone = userData.phone.startsWith('+')
  ? userData.phone
  : `+91${userData.phone}`

    await sendSMS(
    phone,
    `Hi ${userData.name}! Your order from ${restaurantName} is confirmed. Total: Rs.${total}. Track on QuickBite!`
)

    res.status(201).json(order)
  } catch (err) {
    res.status(500).json({ message: err.message })
  }
})

// GET /api/orders/mine
router.get('/mine', authMiddleware, async (req, res) => {
  try {
    const orders = await Order.find({ user: req.user.id })
      .sort({ createdAt: -1 })
    res.json(orders)
  } catch (err) {
    res.status(500).json({ message: err.message })
  }
})

// GET /api/orders/:id
router.get('/:id', authMiddleware, async (req, res) => {
  try {
    const order = await Order.findById(req.params.id)

    if (!order)
      return res.status(404).json({ message: 'Order not found' })

    if (order.user.toString() !== req.user.id)
      return res.status(403).json({ message: 'Not authorized' })

    res.json(order)
  } catch (err) {
    res.status(500).json({ message: err.message })
  }
})

export default router