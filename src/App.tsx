import { Routes, Route, Navigate } from 'react-router-dom'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { Toaster } from 'sonner'
import { Analytics } from '@vercel/analytics/react'

// Context
import { AuthProvider } from './contexts/AuthContext'
import { NotificationProvider } from './contexts/NotificationContext'

// Components
import { ProtectedRoute } from './components/auth/ProtectedRoute'
import { AppLayout } from './components/layout/AppLayout'

// Pages
import Auth from './pages/Auth'
import Dashboard from './pages/Dashboard'
import AddPlant from './pages/AddPlant'
import PlantDetail from './pages/PlantDetail'
import CheckIn from './pages/CheckIn'
import Profile from './pages/Profile'
import Settings from './pages/Settings'
import AITest from './pages/AITest'

// Create react-query client
const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 1000 * 60 * 5, // 5 minutes
      refetchOnWindowFocus: false,
    },
  },
})

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <AuthProvider>
        <Routes>
          {/* Public routes */}
          <Route path="/auth" element={<Auth />} />

          {/* Protected routes - wrapped with ProtectedRoute & AppLayout */}
          <Route
            element={
              <ProtectedRoute>
                <NotificationProvider>
                  <AppLayout />
                </NotificationProvider>
              </ProtectedRoute>
            }
          >
            <Route path="/" element={<Dashboard />} />
            <Route path="/add-plant" element={<AddPlant />} />
            <Route path="/plant/:id" element={<PlantDetail />} />
            <Route path="/check-in/:plantId" element={<CheckIn />} />
            <Route path="/profile" element={<Profile />} />
            <Route path="/settings" element={<Settings />} />
            <Route path="/ai-test" element={<AITest />} />
          </Route>

          {/* Default redirect */}
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>

        {/* Toast notifications */}
        <Toaster position="top-center" richColors />
        <Analytics />
      </AuthProvider>
    </QueryClientProvider>
  )
}

export default App
