import { useNavigate } from 'react-router-dom'
import { useAuth } from '../hooks/useAuth'

export default function Profile() {
  const navigate = useNavigate()
  const { user, signOut } = useAuth()

  const handleSignOut = async () => {
    await signOut()
    navigate('/welcome')
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <div className="bg-white shadow-sm px-6 py-4">
        <h1 className="text-2xl font-bold text-primary">Profile</h1>
      </div>

      <div className="px-6 py-8 space-y-6">
        {/* User Info */}
        <div className="card p-6">
          <h2 className="font-semibold text-text mb-2">Account</h2>
          <p className="text-gray-600">{user?.email}</p>
          <div className="mt-4 inline-block px-3 py-1 bg-gray-100 text-gray-700 text-sm rounded">
            Free Plan
          </div>
        </div>

        {/* Upgrade CTA */}
        <div className="card p-6 bg-gradient-to-br from-primary to-secondary text-white">
          <h2 className="font-bold text-xl mb-2">Upgrade to Pro 🌟</h2>
          <p className="mb-4 opacity-90">Get unlimited plants and AI-powered recommendations</p>
          <button className="bg-white text-primary font-semibold py-2 px-6 rounded-lg">
            Learn More
          </button>
        </div>

        {/* Settings */}
        <div className="card p-6">
          <h2 className="font-semibold text-text mb-4">Settings</h2>
          <div className="space-y-3">
            <button className="w-full text-left py-2 text-gray-700">
              Notifications
            </button>
            <button className="w-full text-left py-2 text-gray-700">
              Privacy Policy
            </button>
            <button className="w-full text-left py-2 text-gray-700">
              Terms of Service
            </button>
          </div>
        </div>

        {/* Sign Out */}
        <button
          onClick={handleSignOut}
          className="btn-secondary w-full"
        >
          Log Out
        </button>

        {/* Version */}
        <p className="text-center text-sm text-gray-500">
          PlantSis v1.0.0
        </p>
      </div>

      {/* Bottom Navigation */}
      <div className="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 px-6 py-4 safe-bottom">
        <div className="flex items-center justify-around">
          <button
            onClick={() => navigate('/home')}
            className="flex flex-col items-center text-gray-500"
          >
            <span className="text-2xl mb-1">🏠</span>
            <span className="text-xs font-medium">Home</span>
          </button>
          <button
            onClick={() => navigate('/add-plant')}
            className="flex flex-col items-center -mt-6"
          >
            <div className="bg-primary text-white w-14 h-14 rounded-full flex items-center justify-center text-3xl shadow-lg">
              +
            </div>
          </button>
          <button className="flex flex-col items-center text-primary">
            <span className="text-2xl mb-1">👤</span>
            <span className="text-xs font-medium">Profile</span>
          </button>
        </div>
      </div>
    </div>
  )
}
