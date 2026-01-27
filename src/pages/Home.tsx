import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { Home as HomeIcon, Plus, User, Heart } from 'lucide-react'
import { supabase } from '../lib/supabase'
import { useAuth } from '../hooks/useAuth'
import { Plant } from '../types/database.types'

interface PlantWithPhoto extends Plant {
  photoUrl?: string
}

const getGreeting = () => {
  const hour = new Date().getHours()
  if (hour < 12) return 'Morning, plant parent ☀️'
  if (hour < 18) return "Hey there! How's your day going?"
  return 'Evening! Time to wind down with your plants'
}

export default function Home() {
  const navigate = useNavigate()
  const { user } = useAuth()
  const [plants, setPlants] = useState<PlantWithPhoto[]>([])
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

      // Fetch latest photo for each plant
      const plantsWithPhotos = await Promise.all(
        (data || []).map(async (plant) => {
          const { data: photos } = await supabase
            .from('plant_photos')
            .select('*')
            .eq('plant_id', plant.id)
            .order('created_at', { ascending: false })
            .limit(1)

          if (photos && photos.length > 0) {
            const { data: urlData } = supabase.storage
              .from('plant-photos')
              .getPublicUrl(photos[0].storage_path)

            return {
              ...plant,
              photoUrl: urlData.publicUrl,
            }
          }

          return plant
        })
      )

      setPlants(plantsWithPhotos)
    } catch (error) {
      console.error('Error fetching plants:', error)
    } finally {
      setLoading(false)
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-b from-background to-card">
        <div className="text-center animate-pulse">
          <div className="text-6xl mb-4">🌿</div>
          <div className="text-lg text-charcoal-600">Loading your green fam...</div>
        </div>
      </div>
    )
  }

  const plantCount = plants.length
  const plantCountText = plantCount === 1
    ? "You've got 1 green baby"
    : `You've got ${plantCount} green babies`

  return (
    <div className="min-h-screen bg-gradient-to-b from-background to-card pb-24">
      {/* Glass Header */}
      <div className="bg-white/80 backdrop-blur-md shadow-soft px-6 py-5 sticky top-0 z-10 border-b border-white/20">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-black text-foreground">{getGreeting()}</h1>
            {plants.length > 0 && (
              <p className="text-sm text-charcoal-600 mt-1">{plantCountText}</p>
            )}
          </div>
          <button
            onClick={() => navigate('/add-plant')}
            className="w-12 h-12 rounded-full bg-gradient-to-br from-forest-500 to-forest-600 text-white dark:text-white flex items-center justify-center shadow-soft hover:shadow-soft-lg transition-all active:scale-95"
          >
            <Plus className="w-6 h-6" />
          </button>
        </div>
      </div>

      {/* Content */}
      <div className="px-6 py-8">
        {plants.length === 0 ? (
          // Empty State
          <div className="text-center py-16 animate-slide-up">
            <div className="text-8xl mb-6">🪴</div>
            <h2 className="text-3xl font-black text-foreground mb-3">Time to start your plant fam</h2>
            <p className="text-lg text-charcoal-600 mb-8 max-w-sm mx-auto">
              Snap a photo and I'll help you keep your green friends thriving
            </p>
            <button
              onClick={() => navigate('/add-plant')}
              className="btn-primary"
            >
              Add Your First Plant
            </button>
          </div>
        ) : (
          // Plant Grid with enhanced cards
          <div className="grid grid-cols-2 gap-4">
            {plants.map((plant) => (
              <div
                key={plant.id}
                onClick={() => navigate(`/plant/${plant.id}`)}
                className="group card-solid cursor-pointer hover:shadow-soft-lg hover:scale-[1.02] transition-all duration-300"
              >
                <div className="aspect-square bg-charcoal-100 flex items-center justify-center overflow-hidden relative">
                  {plant.photoUrl ? (
                    <>
                      <img
                        src={plant.photoUrl}
                        alt={plant.custom_name}
                        className="w-full h-full object-cover"
                      />
                      {/* Gradient overlay for better text legibility */}
                      <div className="absolute inset-0 bg-gradient-to-t from-black/40 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                    </>
                  ) : (
                    <div className="text-6xl">🌱</div>
                  )}
                </div>
                <div className="p-4">
                  <h3 className="font-bold text-foreground text-lg truncate">{plant.custom_name}</h3>
                  {plant.species_name && (
                    <p className="text-sm text-charcoal-600 truncate italic">{plant.species_name}</p>
                  )}
                  <div className="mt-3 flex items-center gap-1.5">
                    <div className="status-badge healthy">
                      <Heart className="w-3 h-3" fill="currentColor" />
                      <span>Looking good</span>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Floating Glass Bottom Navigation */}
      <div className="fixed bottom-0 left-0 right-0 px-4 pb-4 safe-bottom">
        <div className="bg-white/80 backdrop-blur-md rounded-t-3xl shadow-glass border-t border-white/20 px-6 py-4">
          <div className="flex items-center justify-around">
            <button className="flex flex-col items-center gap-1 relative">
              <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-forest-500 to-forest-600 flex items-center justify-center">
                <HomeIcon className="w-5 h-5 text-white" />
              </div>
              <span className="text-xs font-semibold text-primary">Home</span>
            </button>

            <button
              onClick={() => navigate('/add-plant')}
              className="flex flex-col items-center -mt-8"
            >
              <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-forest-500 via-forest-600 to-sage-600 flex items-center justify-center shadow-soft-lg hover:shadow-soft active:scale-95 transition-all">
                <Plus className="w-8 h-8 text-white" strokeWidth={3} />
              </div>
            </button>

            <button
              onClick={() => navigate('/profile')}
              className="flex flex-col items-center gap-1"
            >
              <div className="w-10 h-10 rounded-xl bg-charcoal-100 flex items-center justify-center hover:bg-charcoal-200 transition-colors">
                <User className="w-5 h-5 text-charcoal-600" />
              </div>
              <span className="text-xs font-medium text-charcoal-500">Profile</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}
