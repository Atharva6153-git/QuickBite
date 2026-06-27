import express from 'express'
import Stripe from 'stripe'
import authMiddleware from '../middleware/auth.js'
import User from '../models/User.js'

const router = express.Router()

// In-memory OTP store for demo purposes (keyed by userId)
// Note: this resets if the server restarts — fine for a college project demo
const otpStore = {}

// POST /api/payments/create-intent
router.post('/create-intent', authMiddleware, async (req, res) => {
  try {
    if (!process.env.STRIPE_SECRET_KEY) {
      return res.status(200).json({ clientSecret: 'demo_secret_not_configured' })
    }

    const stripe = new Stripe(process.env.STRIPE_SECRET_KEY)
    const { amount } = req.body

    if (!amount || amount <= 0)
      return res.status(400).json({ message: 'Invalid amount' })

    const paymentIntent = await stripe.paymentIntents.create({
      amount: Math.round(amount * 100),
      currency: 'inr',
      metadata: { userId: req.user.id },
    })

    res.json({ clientSecret: paymentIntent.client_secret })
  } catch (err) {
    res.status(500).json({ message: err.message })
  }
})

// POST /api/payments/send-otp
// Generates a 4-digit OTP, sends it via Twilio SMS, and returns it to the
// client so PaymentModal.jsx can check it locally (demo-only behavior —
// a real payment gateway would verify the OTP server-side and never send
// it back in the response).
router.post('/send-otp', authMiddleware, async (req, res) => {
  try {
    const user = await User.findById(req.user.id)
    if (!user || !user.phone) {
      return res.status(400).json({ message: 'No phone number on file for this user' })
    }

    const otp = Math.floor(1000 + Math.random() * 9000).toString() // 4-digit
    otpStore[req.user.id] = otp

    const phone = user.phone.startsWith('+') ? user.phone : `+91${user.phone}`

    if (process.env.TWILIO_ACCOUNT_SID && process.env.TWILIO_AUTH_TOKEN) {
      const twilio = (await import('twilio')).default
      const client = twilio(process.env.TWILIO_ACCOUNT_SID, process.env.TWILIO_AUTH_TOKEN)
      await client.messages.create({
        body: `Your QuickBite payment OTP is ${otp}`,
        from: process.env.TWILIO_PHONE_NUMBER,
        to: phone,
      })
    }

    res.json({ otp }) // demo only
  } catch (err) {
    res.status(500).json({ message: err.message })
  }
})

// POST /api/payments/confirm
// Marks the payment as confirmed. Doesn't re-check the OTP here since
// PaymentModal.jsx already verified it client-side for this demo flow.
router.post('/confirm', authMiddleware, async (req, res) => {
  try {
    const { amount, method } = req.body
    if (!amount || amount <= 0)
      return res.status(400).json({ message: 'Invalid amount' })

    delete otpStore[req.user.id]

    res.json({
      success: true,
      method,
      amount,
      transactionId: `TXN${Date.now()}`,
    })
  } catch (err) {
    res.status(500).json({ message: err.message })
  }
})

export default router