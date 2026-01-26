import { useState, FormEvent } from 'react'
import { useNavigate } from 'react-router-dom'
import { ArrowLeft, Eye, EyeOff } from 'lucide-react'
import { supabase } from '../../lib/supabase'

export default function Signup() {
  const navigate = useNavigate()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault()
    setError('')

    // Validation
    if (password.length < 8) {
      setError('Password must be at least 8 characters')
      return
    }

    if (password !== confirmPassword) {
      setError('Passwords do not match')
      return
    }

    setLoading(true)

    try {
      const { error } = await supabase.auth.signUp({
        email,
        password,
      })

      if (error) throw error

      // Success - navigate to home
      navigate('/home')
    } catch (err: any) {
      setError(err.message || 'Sign up failed. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen flex flex-col items-center justify-center px-6 bg-gradient-to-b from-cream via-sage-50 to-forest-50">
      {/* Logo/Brand */}
      <div className="text-6xl mb-6 animate-bounce-soft">🌿</div>

      {/* Glass Card Container */}
      <div className="w-full max-w-md">
        {/* Back Button */}
        <button
          onClick={() => navigate('/welcome')}
          className="flex items-center gap-2 text-forest-600 font-semibold mb-6 hover:text-forest-700 transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          Back
        </button>

        {/* Form Card */}
        <div className="card-glass p-8 animate-slide-up">
          <h1 className="text-3xl font-black text-forest-900 mb-2">Join the Plant Fam</h1>
          <p className="text-charcoal-600 mb-8">Let's keep your plants thriving together</p>

          {/* Error Message */}
          {error && (
            <div className="mb-6 p-4 bg-sunset-500 bg-opacity-10 border-2 border-sunset-500 rounded-2xl text-sunset-700 font-medium animate-slide-up">
              {error}
            </div>
          )}

          {/* Form */}
          <form onSubmit={handleSubmit} className="space-y-5">
            <div>
              <label htmlFor="email" className="block text-sm font-bold text-forest-900 mb-2">
                Email
              </label>
              <input
                id="email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="your@email.com"
                className="input-field"
                required
              />
            </div>

            <div>
              <label htmlFor="password" className="block text-sm font-bold text-forest-900 mb-2">
                Password
              </label>
              <div className="relative">
                <input
                  id="password"
                  type={showPassword ? 'text' : 'password'}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="At least 8 characters"
                  className="input-field pr-12"
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-charcoal-500 hover:text-forest-600 transition-colors"
                >
                  {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                </button>
              </div>
            </div>

            <div>
              <label htmlFor="confirmPassword" className="block text-sm font-bold text-forest-900 mb-2">
                Confirm Password
              </label>
              <input
                id="confirmPassword"
                type="password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                placeholder="••••••••"
                className="input-field"
                required
              />
            </div>

            <button
              type="submit"
              disabled={loading}
              className="btn-primary w-full mt-6"
            >
              {loading ? 'Creating your account...' : 'Create Account ✨'}
            </button>
          </form>

          {/* Footer */}
          <div className="mt-6 text-center">
            <span className="text-charcoal-600">Already have an account? </span>
            <button
              onClick={() => navigate('/login')}
              className="text-forest-600 font-bold hover:text-forest-700 transition-colors"
            >
              Log in
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}
