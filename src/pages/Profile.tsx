import { useNavigate } from 'react-router-dom'
import { Home, Plus, User, Bell, Shield, FileText, Sparkles } from 'lucide-react'
import { useAuth } from '../hooks/useAuth'

export default function Profile() {
  const navigate = useNavigate()
  const { user, signOut } = useAuth()

  const handleSignOut = async () => {
    await signOut()
    navigate('/welcome')
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-cream to-sage-50 pb-24">
      {/* Glass Header */}
      <div className="bg-white/80 backdrop-blur-md shadow-soft px-6 py-5 border-b border-white/20">
        <h1 className="text-2xl font-black text-forest-700">Profile</h1>
      </div>

      <div className="px-6 py-8 space-y-6">
        {/* User Info Card */}
        <div className="card-glass p-6">
          <div className="flex items-center gap-4 mb-4">
            <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-forest-500 to-sage-600 flex items-center justify-center text-white text-2xl font-black">
              {user?.email?.[0].toUpperCase()}
            </div>
            <div className="flex-1">
              <h2 className="font-black text-forest-900 text-lg">Plant Parent</h2>
              <p className="text-charcoal-600 text-sm">{user?.email}</p>
            </div>
          </div>
          <div className="inline-block px-4 py-2 bg-charcoal-100 text-charcoal-700 text-sm font-bold rounded-full">
            Free Plan 🌱
          </div>
        </div>

        {/* Stats Bento Grid */}
        <div className="grid grid-cols-3 gap-3">
          <div className="card-bento text-center">
            <div className="text-3xl font-black text-forest-600">0</div>
            <div className="text-xs text-charcoal-600 font-semibold mt-1">Plants</div>
          </div>
          <div className="card-bento text-center">
            <div className="text-3xl font-black text-sage-600">0</div>
            <div className="text-xs text-charcoal-600 font-semibold mt-1">Day Streak</div>
          </div>
          <div className="card-bento text-center">
            <div className="text-3xl font-black text-sunset-600">0</div>
            <div className="text-xs text-charcoal-600 font-semibold mt-1">Check-ins</div>
          </div>
        </div>

        {/* Dramatic Upgrade CTA */}
        <div className="card-solid overflow-hidden relative">
          <div className="absolute inset-0 bg-gradient-to-br from-glow-purple via-glow-pink to-glow-blue opacity-90" />
          <div className="relative p-6 text-white">
            <div className="flex items-center gap-2 mb-3">
              <Sparkles className="w-6 h-6" />
              <h2 className="font-black text-2xl">Level Up Your Plant Game</h2>
            </div>
            <p className="mb-5 opacity-95 font-medium">
              Get unlimited plants, AI-powered recommendations, and exclusive features
            </p>
            <button className="w-full bg-white text-glow-purple font-black py-3 px-6 rounded-2xl shadow-soft hover:shadow-soft-lg transition-all active:scale-95">
              Upgrade to Pro ✨
            </button>
          </div>
        </div>

        {/* Settings Cards with Icons */}
        <div className="space-y-3">
          <h2 className="font-black text-forest-900 text-lg">Settings</h2>

          <button className="w-full card-bento flex items-center gap-4 text-left">
            <div className="w-12 h-12 rounded-xl bg-forest-100 flex items-center justify-center flex-shrink-0">
              <Bell className="w-5 h-5 text-forest-600" />
            </div>
            <div className="flex-1">
              <div className="font-bold text-forest-900">Notifications</div>
              <div className="text-sm text-charcoal-600">Manage your alerts</div>
            </div>
          </button>

          <button className="w-full card-bento flex items-center gap-4 text-left">
            <div className="w-12 h-12 rounded-xl bg-sage-100 flex items-center justify-center flex-shrink-0">
              <Shield className="w-5 h-5 text-sage-600" />
            </div>
            <div className="flex-1">
              <div className="font-bold text-forest-900">Privacy Policy</div>
              <div className="text-sm text-charcoal-600">How we protect your data</div>
            </div>
          </button>

          <button className="w-full card-bento flex items-center gap-4 text-left">
            <div className="w-12 h-12 rounded-xl bg-sunset-100 flex items-center justify-center flex-shrink-0">
              <FileText className="w-5 h-5 text-sunset-600" />
            </div>
            <div className="flex-1">
              <div className="font-bold text-forest-900">Terms of Service</div>
              <div className="text-sm text-charcoal-600">Legal stuff</div>
            </div>
          </button>
        </div>

        {/* Sign Out */}
        <button
          onClick={handleSignOut}
          className="btn-secondary w-full"
        >
          Log Out
        </button>

        {/* Version */}
        <p className="text-center text-sm text-charcoal-500 font-medium">
          PlantSis v1.0.0 • Made with 💚
        </p>
      </div>

      {/* Floating Glass Bottom Navigation */}
      <div className="fixed bottom-0 left-0 right-0 px-4 pb-4 safe-bottom">
        <div className="bg-white/80 backdrop-blur-md rounded-t-3xl shadow-glass border-t border-white/20 px-6 py-4">
          <div className="flex items-center justify-around">
            <button
              onClick={() => navigate('/home')}
              className="flex flex-col items-center gap-1"
            >
              <div className="w-10 h-10 rounded-xl bg-charcoal-100 flex items-center justify-center hover:bg-charcoal-200 transition-colors">
                <Home className="w-5 h-5 text-charcoal-600" />
              </div>
              <span className="text-xs font-medium text-charcoal-500">Home</span>
            </button>

            <button
              onClick={() => navigate('/add-plant')}
              className="flex flex-col items-center -mt-8"
            >
              <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-forest-500 via-forest-600 to-sage-600 flex items-center justify-center shadow-soft-lg hover:shadow-soft active:scale-95 transition-all">
                <Plus className="w-8 h-8 text-white" strokeWidth={3} />
              </div>
            </button>

            <button className="flex flex-col items-center gap-1 relative">
              <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-forest-500 to-forest-600 flex items-center justify-center">
                <User className="w-5 h-5 text-white" />
              </div>
              <span className="text-xs font-semibold text-forest-600">Profile</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}
