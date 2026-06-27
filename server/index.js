import { config } from 'dotenv'
config()

import express from 'express'
import cors from 'cors'
import mongoose from 'mongoose'
import authRoutes       from './routes/auth.js'
import restaurantRoutes from './routes/restaurants.js'
import orderRoutes      from './routes/orders.js'
import paymentRoutes    from './routes/payments.js'

const app = express()

app.use(cors({
  origin: (origin, callback) => {
    const allowed = [
      'http://localhost:5173',
      /\.vercel\.app$/
    ]
    if (!origin || allowed.some(o => typeof o === 'string' ? o === origin : o.test(origin))) {
      callback(null, true)
    } else {
      callback(new Error('Not allowed by CORS'))
    }
  },
  credentials: true
}))
app.use(express.json())

app.use('/api/auth',        authRoutes)
app.use('/api/restaurants', restaurantRoutes)
app.use('/api/orders',      orderRoutes)
app.use('/api/payments',    paymentRoutes)

app.get('/api/health', (_, res) => res.json({ status: 'ok' }))

mongoose.connect(process.env.MONGO_URI)
  .then(() => {
    console.log('✅ MongoDB connected')
    app.listen(process.env.PORT || 5000, () =>
      console.log(`🚀 Server running on port ${process.env.PORT || 5000}`)
    )
  })
  .catch(err => {
    console.error('❌ MongoDB connection failed:', err.message)
    process.exit(1)
  })