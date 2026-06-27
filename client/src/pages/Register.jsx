import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { Zap } from 'lucide-react'
import { useAuth } from '../context/AuthContext'

export default function Register() {
  const { register } = useAuth()
  const navigate = useNavigate()
  const [form, setForm] = useState({ name: '', email: '', phone: '', password: '' })
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  const handle = e => setForm(p => ({ ...p, [e.target.name]: e.target.value }))

  const submit = async () => {
    if (!form.name || !form.email || !form.phone || !form.password)
      return setError('Fill in all fields')
    if (form.password.length < 6)
      return setError('Password must be at least 6 characters')
    try {
      setLoading(true)
      setError('')
      await register(form.name, form.email, form.password, form.phone)
      navigate('/')
    } catch (err) {
      setError(err.response?.data?.message || 'Registration failed')
    } finally {
      setLoading(false)
    }
  }

  const fields = [
    { name: 'name',     label: 'Full name',     placeholder: 'Atharva Joshi', type: 'text'     },
    { name: 'email',    label: 'Email',          placeholder: 'you@email.com', type: 'email'    },
    { name: 'phone',    label: 'Phone number',   placeholder: '+91 98765 43210', type: 'tel'    },
    { name: 'password', label: 'Password',       placeholder: '••••••••',      type: 'password' },
  ]

  return (
    <div className="min-h-[80vh] flex items-center justify-center px-4">
      <div className="w-full max-w-sm">

        <div className="text-center mb-8">
          <div className="flex items-center justify-center gap-2 text-orange-500 font-bold text-xl mb-1">
            <Zap size={22} fill="currentColor" /> QuickBite
          </div>
          <p className="text-gray-400 text-sm">Create your account</p>
        </div>

        <div className="bg-white border border-gray-100 rounded-2xl p-6 space-y-4">
          {error && (
            <p className="text-sm text-red-500 bg-red-50 px-3 py-2 rounded-lg">
              {error}
            </p>
          )}

          {fields.map(field => (
            <div key={field.name}>
              <label className="text-xs font-medium text-gray-600 block mb-1.5">
                {field.label}
              </label>
              <input
                name={field.name}
                type={field.type}
                value={form[field.name]}
                onChange={handle}
                placeholder={field.placeholder}
                onKeyDown={e => e.key === 'Enter' && submit()}
                className="w-full border border-gray-200 rounded-xl px-3 py-2.5 text-sm outline-none focus:border-orange-300 transition-colors"
              />
            </div>
          ))}

          <button
            onClick={submit}
            disabled={loading}
            className="w-full bg-orange-500 hover:bg-orange-600 disabled:opacity-60 text-white font-semibold py-2.5 rounded-xl transition-colors text-sm"
          >
            {loading ? 'Creating account...' : 'Create account'}
          </button>
        </div>

        <p className="text-center text-sm text-gray-400 mt-4">
          Already have an account?{' '}
          <Link to="/login" className="text-orange-500 font-medium hover:underline">
            Sign in
          </Link>
        </p>

      </div>
    </div>
  )
}