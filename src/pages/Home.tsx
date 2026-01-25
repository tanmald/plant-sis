import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { supabase } from '../lib/supabase'
import { useAuth } from '../hooks/useAuth'
import { Plant } from '../types/database.types'

export default function Home() {
  const navigate = useNavigate()
  const { user } = useAuth()
  const [plants, setPlants] = useState<Plant[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchPlants()
  }, [user])

  const fetchPlants = async () => {
    try {
      const { data, error } = await supabase
        .from('plants')
        .select('*')
        .eq('user_id', user?.id)
        .order('updated_at', { ascending: false })

      if (error) throw error
      setPlants(data || [])
    } catch (error) {
      console.error('Error fetching plants:', error)
    } finally {
      setLoading(false)
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="text-center">
          <div className="text-6xl mb-4">🌿</div>
          <div className="text-lg text-gray-600">Loading your plants...</div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-background pb-20">
      {/* Header */}
      <div className="bg-white shadow-sm px-6 py-4 sticky top-0 z-10">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-primary">My Plants</h1>
            {plants.length > 0 && (
              <p className="text-sm text-gray-600">{plants.length} plants thriving</p>
            )}
          </div>
          <button
            onClick={() => navigate('/add-plant')}
            className="bg-primary text-white w-12 h-12 rounded-full flex items-center justify-center text-2xl"
          >
            +
          </button>
        </div>
      </div>

      {/* Content */}
      <div className="px-6 py-8">
        {plants.length === 0 ? (
          // Empty State
          <div className="text-center py-16">
            <div className="text-8xl mb-6">🪴</div>
            <h2 className="text-2xl font-bold text-text mb-3">Add your first plant 🌿</h2>
            <p className="text-gray-600 mb-8">
              Let's get started! Snap a photo or add manually.
            </p>
            <button
              onClick={() => navigate('/add-plant')}
              className="btn-primary"
            >
              Add Plant
            </button>
          </div>
        ) : (
          // Plant Grid
          <div className="grid grid-cols-2 gap-4">
            {plants.map((plant) => (
              <div
                key={plant.id}
                onClick={() => navigate(`/plant/${plant.id}`)}
                className="card cursor-pointer hover:shadow-lg transition-shadow"
              >
                <div className="aspect-square bg-gray-100 flex items-center justify-center text-6xl">
                  🌱
                </div>
                <div className="p-3">
                  <h3 className="font-bold text-text truncate">{plant.custom_name}</h3>
                  {plant.species_name && (
                    <p className="text-sm text-gray-600 truncate">{plant.species_name}</p>
                  )}
                  <div className="mt-2 text-xs text-gray-500">
                    💚 Healthy
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Bottom Navigation */}
      <div className="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 px-6 py-4 safe-bottom">
        <div className="flex items-center justify-around">
          <button className="flex flex-col items-center text-primary">
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
          <button
            onClick={() => navigate('/profile')}
            className="flex flex-col items-center text-gray-500"
          >
            <span className="text-2xl mb-1">👤</span>
            <span className="text-xs font-medium">Profile</span>
          </button>
        </div>
      </div>
    </div>
  )
}
