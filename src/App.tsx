import { Routes, Route, Navigate } from 'react-router-dom'
import { useEffect, useState } from 'react'
import { supabase } from './lib/supabase'
import { Session } from '@supabase/supabase-js'

// Pages
import Welcome from './pages/Welcome'
import Login from './pages/Auth/Login'
import Signup from './pages/Auth/Signup'
import Home from './pages/Home'
import AddPlant from './pages/AddPlant'
import PlantDetail from './pages/PlantDetail'
import CheckIn from './pages/CheckIn'
import Profile from './pages/Profile'

// Context for auth
import { AuthProvider } from './hooks/useAuth'

function App() {
  const [session, setSession] = useState<Session | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    // Check active session
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session)
      setLoading(false)
    })

    // Listen for auth changes
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      setSession(session)
    })

    return () => subscription.unsubscribe()
  }, [])

  if (loading) {
    return (
      <div className="flex items-center justify-center h-screen bg-background">
        <div className="text-center">
          <div className="text-6xl mb-4">🌿</div>
          <div className="text-xl font-semibold text-primary">Loading PlantSis...</div>
        </div>
      </div>
    )
  }

  return (
    <AuthProvider session={session}>
      <div className="min-h-screen bg-background">
        <Routes>
          {/* Public routes */}
          <Route path="/welcome" element={!session ? <Welcome /> : <Navigate to="/home" />} />
          <Route path="/login" element={!session ? <Login /> : <Navigate to="/home" />} />
          <Route path="/signup" element={!session ? <Signup /> : <Navigate to="/home" />} />

          {/* Protected routes */}
          <Route path="/home" element={session ? <Home /> : <Navigate to="/welcome" />} />
          <Route path="/add-plant" element={session ? <AddPlant /> : <Navigate to="/welcome" />} />
          <Route path="/plant/:id" element={session ? <PlantDetail /> : <Navigate to="/welcome" />} />
          <Route path="/check-in/:plantId" element={session ? <CheckIn /> : <Navigate to="/welcome" />} />
          <Route path="/profile" element={session ? <Profile /> : <Navigate to="/welcome" />} />

          {/* Default redirect */}
          <Route path="/" element={<Navigate to={session ? "/home" : "/welcome"} />} />
          <Route path="*" element={<Navigate to={session ? "/home" : "/welcome"} />} />
        </Routes>
      </div>
    </AuthProvider>
  )
}

export default App
