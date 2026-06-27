// client/src/components/PaymentModal.jsx
import { useState } from 'react'
import { X, CreditCard, Smartphone, CheckCircle } from 'lucide-react'
import { sendOtp, confirmPayment } from '../api/index.js'

export default function PaymentModal({ amount, onSuccess, onClose }) {
  const [step, setStep] = useState('method') // method | details | otp | success
  const [method, setMethod] = useState('card')
  const [card, setCard] = useState({ number: '', expiry: '', cvv: '', name: '' })
  const [upiId, setUpiId] = useState('')
  const [otp, setOtp] = useState('')
  const [serverOtp, setServerOtp] = useState('') // demo only - real apps never do this client-side
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  const formatCardNumber = (val) => {
    const digits = val.replace(/\D/g, '').slice(0, 16)
    return digits.replace(/(.{4})/g, '$1 ').trim()
  }

  const handleContinueToOtp = async () => {
    setError('')
    if (method === 'card') {
      if (card.number.replace(/\s/g, '').length !== 16 || card.cvv.length !== 3 || !card.expiry) {
        setError('Please fill all card details correctly')
        return
      }
    } else {
      if (!upiId.includes('@')) {
        setError('Enter a valid UPI ID (e.g. name@upi)')
        return
      }
    }

    setLoading(true)
    try {
      
      const res = await sendOtp()      
      setServerOtp(res.data.otp) 
      setStep('otp')
    } catch (err) {
      setError('Could not send OTP. Try again.')
    } finally {
      setLoading(false)
    }
  }

  const handleVerifyOtp = async () => {
    setError('')
    if (otp !== serverOtp) {
      setError('Incorrect OTP')
      return
    }
    setLoading(true)
    try {
      await confirmPayment(amount, method)
      setStep('success')
      setTimeout(() => onSuccess(), 1200)
    } catch (err) {
      setError('Payment confirmation failed')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl w-full max-w-md p-6 relative shadow-xl">
        <button onClick={onClose} className="absolute top-4 right-4 text-gray-400 hover:text-gray-600">
          <X size={20} />
        </button>

        {step === 'method' && (
          <>
            <h2 className="text-xl font-bold mb-1">Choose Payment Method</h2>
            <p className="text-gray-500 text-sm mb-4">Amount to pay: ₹{amount}</p>

            <div className="flex gap-2 mb-4">
              <button
                onClick={() => setMethod('card')}
                className={`flex-1 flex items-center justify-center gap-2 py-3 rounded-xl border ${method === 'card' ? 'border-orange-500 bg-orange-50 text-orange-600' : 'border-gray-200'}`}
              >
                <CreditCard size={18} /> Card
              </button>
              <button
                onClick={() => setMethod('upi')}
                className={`flex-1 flex items-center justify-center gap-2 py-3 rounded-xl border ${method === 'upi' ? 'border-orange-500 bg-orange-50 text-orange-600' : 'border-gray-200'}`}
              >
                <Smartphone size={18} /> UPI
              </button>
            </div>

            <button
              onClick={() => setStep('details')}
              className="w-full bg-orange-500 text-white py-3 rounded-xl font-semibold hover:bg-orange-600"
            >
              Continue
            </button>
          </>
        )}

        {step === 'details' && (
          <>
            <h2 className="text-xl font-bold mb-4">
              {method === 'card' ? 'Enter Card Details' : 'Enter UPI ID'}
            </h2>

            {method === 'card' ? (
              <div className="space-y-3">
                <input
                  type="text"
                  placeholder="Cardholder Name"
                  value={card.name}
                  onChange={(e) => setCard({ ...card, name: e.target.value })}
                  className="w-full border rounded-lg px-3 py-2"
                />
                <input
                  type="text"
                  placeholder="1234 5678 9012 3456"
                  value={card.number}
                  onChange={(e) => setCard({ ...card, number: formatCardNumber(e.target.value) })}
                  className="w-full border rounded-lg px-3 py-2"
                  maxLength={19}
                />
                <div className="flex gap-3">
                  <input
                    type="text"
                    placeholder="MM/YY"
                    value={card.expiry}
                    onChange={(e) => setCard({ ...card, expiry: e.target.value })}
                    className="w-1/2 border rounded-lg px-3 py-2"
                    maxLength={5}
                  />
                  <input
                    type="password"
                    placeholder="CVV"
                    value={card.cvv}
                    onChange={(e) => setCard({ ...card, cvv: e.target.value.replace(/\D/g, '').slice(0, 3) })}
                    className="w-1/2 border rounded-lg px-3 py-2"
                    maxLength={3}
                  />
                </div>
              </div>
            ) : (
              <input
                type="text"
                placeholder="yourname@upi"
                value={upiId}
                onChange={(e) => setUpiId(e.target.value)}
                className="w-full border rounded-lg px-3 py-2"
              />
            )}

            {error && <p className="text-red-500 text-sm mt-2">{error}</p>}

            <button
              onClick={handleContinueToOtp}
              disabled={loading}
              className="w-full bg-orange-500 text-white py-3 rounded-xl font-semibold mt-4 hover:bg-orange-600 disabled:opacity-50"
            >
              {loading ? 'Sending OTP...' : `Pay ₹${amount}`}
            </button>
          </>
        )}

        {step === 'otp' && (
          <>
            <h2 className="text-xl font-bold mb-1">Verify OTP</h2>
            <p className="text-gray-500 text-sm mb-4">Sent to your registered mobile number</p>
            <input
              type="text"
              placeholder="Enter 4-digit OTP"
              value={otp}
              onChange={(e) => setOtp(e.target.value.replace(/\D/g, '').slice(0, 4))}
              className="w-full border rounded-lg px-3 py-2 text-center text-2xl tracking-widest"
              maxLength={4}
            />
            {error && <p className="text-red-500 text-sm mt-2">{error}</p>}
            <button
              onClick={handleVerifyOtp}
              disabled={loading}
              className="w-full bg-orange-500 text-white py-3 rounded-xl font-semibold mt-4 hover:bg-orange-600 disabled:opacity-50"
            >
              {loading ? 'Verifying...' : 'Verify & Pay'}
            </button>
          </>
        )}

        {step === 'success' && (
          <div className="text-center py-6">
            <CheckCircle size={56} className="text-green-500 mx-auto mb-3" />
            <h2 className="text-xl font-bold">Payment Successful!</h2>
            <p className="text-gray-500 text-sm mt-1">Redirecting to order tracking...</p>
          </div>
        )}
      </div>
    </div>
  )
}