import axios from 'axios'

const api = axios.create({
  baseURL: '/api'
})

api.interceptors.request.use(config => {
  const token = localStorage.getItem('token')
  if (token) config.headers.Authorization = `Bearer ${token}`
  return config
})

export const getRestaurants = (search = '', category = '') =>
  api.get(`/restaurants?search=${search}&category=${category}`)

export const getRestaurant = (id) =>
  api.get(`/restaurants/${id}`)

export const createOrder = (orderData) =>
  api.post('/orders', orderData)

export const getMyOrders = () =>
  api.get('/orders/mine')

export const getOrder = (id) =>
  api.get(`/orders/${id}`)

export const createPaymentIntent = (amount) =>
  api.post('/payments/create-intent', { amount })

export const sendOtp = () =>
  api.post('/payments/send-otp')

export const confirmPayment = (amount, method) =>
  api.post('/payments/confirm', { amount, method })