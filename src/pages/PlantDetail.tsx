import { useEffect, useState } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { ArrowLeft, Trash2, MapPin, Sun, Maximize2, Calendar, CheckCircle2 } from 'lucide-react'
import { supabase } from '../lib/supabase'
import { useAuth } from '../hooks/useAuth'
import { Plant, PlantPhoto } from '../types/database.types'

export default function PlantDetail() {
  const { id } = useParams<{ id: string }>()
  const navigate = useNavigate()
  const { user } = useAuth()

  const [plant, setPlant] = useState<Plant | null>(null)
  const [photos, setPhotos] = useState<PlantPhoto[]>([])
  const [photoUrls, setPhotoUrls] = useState<Record<string, string>>({})
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  useEffect(() => {
    fetchPlantDetails()
  }, [id])

  const fetchPlantDetails = async () => {
    if (!id || !user) return

    try {
      // Fetch plant
      const { data: plantData, error: plantError } = await supabase
        .from('plants')
        .select('*')
        .eq('id', id)
        .eq('user_id', user.id)
        .single()

      if (plantError) throw plantError
      setPlant(plantData)

      // Fetch photos
      const { data: photosData, error: photosError } = await supabase
        .from('plant_photos')
        .select('*')
        .eq('plant_id', id)
        .order('created_at', { ascending: false })

      if (photosError) throw photosError
      setPhotos(photosData || [])

      // Get public URLs for photos
      const urls: Record<string, string> = {}
      photosData?.forEach((photo) => {
        const { data } = supabase.storage
          .from('plant-photos')
          .getPublicUrl(photo.storage_path)
        urls[photo.id] = data.publicUrl
      })
      setPhotoUrls(urls)
    } catch (err: any) {
      console.error('Error fetching plant:', err)
      setError('Failed to load plant details')
    } finally {
      setLoading(false)
    }
  }

  const handleDelete = async () => {
    if (!plant || !window.confirm(`Delete ${plant.custom_name}? This cannot be undone.`)) {
      return
    }

    try {
      // Delete plant (photos will cascade delete via database)
      const { error } = await supabase
        .from('plants')
        .delete()
        .eq('id', plant.id)

      if (error) throw error

      // Navigate back to home
      navigate('/home')
    } catch (err: any) {
      console.error('Error deleting plant:', err)
      alert('Failed to delete plant')
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-b from-cream to-sage-50">
        <div className="text-center animate-pulse">
          <div className="text-6xl mb-4">🌿</div>
          <div className="text-lg text-charcoal-600">Loading your plant...</div>
        </div>
      </div>
    )
  }

  if (error || !plant) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-b from-cream to-sage-50 px-6">
        <div className="text-center">
          <div className="text-6xl mb-4">😕</div>
          <h2 className="text-2xl font-black text-forest-900 mb-2">Plant not found</h2>
          <p className="text-charcoal-600 mb-6">{error || 'This plant might have been deleted'}</p>
          <button onClick={() => navigate('/home')} className="btn-primary">
            Go Home
          </button>
        </div>
      </div>
    )
  }

  const latestPhoto = photos[0]

  return (
    <div className="min-h-screen bg-gradient-to-b from-cream to-sage-50 pb-24">
      {/* Glass Header */}
      <div className="bg-white/80 backdrop-blur-md shadow-soft px-6 py-4 sticky top-0 z-20 border-b border-white/20">
        <div className="flex items-center justify-between">
          <button onClick={() => navigate('/home')} className="icon-btn">
            <ArrowLeft className="w-5 h-5" />
          </button>
          <button
            onClick={handleDelete}
            className="flex items-center gap-2 text-sunset-600 text-sm font-bold hover:text-sunset-700 transition-colors"
          >
            <Trash2 className="w-4 h-4" />
            Delete
          </button>
        </div>
      </div>

      {/* Hero Photo with Gradient Overlay */}
      <div className="w-full aspect-square bg-charcoal-100 flex items-center justify-center relative overflow-hidden">
        {latestPhoto ? (
          <>
            <img
              src={photoUrls[latestPhoto.id]}
              alt={plant.custom_name}
              className="w-full h-full object-cover"
            />
            {/* Gradient overlay for glass card readability */}
            <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent" />
          </>
        ) : (
          <div className="text-9xl">🌱</div>
        )}
      </div>

      {/* Glass Name Card Floating Over Hero */}
      <div className="px-6 -mt-20 relative z-10">
        <div className="card-glass p-6">
          <h1 className="text-3xl font-black text-forest-900 mb-2">{plant.custom_name}</h1>
          {plant.species_name && (
            <p className="text-lg text-charcoal-600 italic">{plant.species_name}</p>
          )}
        </div>
      </div>

      {/* Details - Bento Grid */}
      <div className="px-6 py-6 space-y-6">
        {/* Info Bento Grid */}
        <div className="grid grid-cols-2 gap-3">
          <div className="card-bento">
            <div className="flex items-center gap-2 mb-2">
              <MapPin className="w-4 h-4 text-forest-600" />
              <div className="text-xs font-semibold text-charcoal-500 uppercase">Location</div>
            </div>
            <div className="font-bold text-forest-900">{plant.location}</div>
          </div>

          <div className="card-bento">
            <div className="flex items-center gap-2 mb-2">
              <Sun className="w-4 h-4 text-sunset-600" />
              <div className="text-xs font-semibold text-charcoal-500 uppercase">Light</div>
            </div>
            <div className="font-bold text-forest-900">
              {plant.light_type === 'direct' && '☀️ Direct'}
              {plant.light_type === 'indirect' && '🌤️ Indirect'}
              {plant.light_type === 'low' && '🌥️ Low'}
            </div>
          </div>

          <div className="card-bento">
            <div className="flex items-center gap-2 mb-2">
              <Maximize2 className="w-4 h-4 text-sage-600" />
              <div className="text-xs font-semibold text-charcoal-500 uppercase">Distance</div>
            </div>
            <div className="font-bold text-forest-900 text-sm">
              {plant.proximity_to_window === 'on_sill' && 'On windowsill'}
              {plant.proximity_to_window === 'near' && 'Near (1-3 ft)'}
              {plant.proximity_to_window === 'far' && 'Far (3+ ft)'}
            </div>
          </div>

          <div className="card-bento">
            <div className="flex items-center gap-2 mb-2">
              <Calendar className="w-4 h-4 text-charcoal-500" />
              <div className="text-xs font-semibold text-charcoal-500 uppercase">Added</div>
            </div>
            <div className="font-bold text-forest-900 text-sm">
              {new Date(plant.created_at).toLocaleDateString('en-US', {
                month: 'short',
                day: 'numeric',
                year: 'numeric',
              })}
            </div>
          </div>
        </div>

        {/* Enhanced Check-In Button */}
        <button
          onClick={() => navigate(`/check-in/${plant.id}`)}
          className="btn-primary w-full text-lg py-4 flex items-center justify-center gap-2 animate-bounce-soft"
        >
          <CheckCircle2 className="w-6 h-6" />
          Start Check-In
        </button>

        {/* Horizontal Photo Timeline */}
        {photos.length > 0 && (
          <div>
            <h2 className="text-xl font-black text-forest-900 mb-4">Photo Timeline</h2>
            <div className="flex gap-3 overflow-x-auto snap-x snap-mandatory pb-2 -mx-6 px-6">
              {photos.map((photo) => (
                <div key={photo.id} className="flex-shrink-0 snap-center">
                  <div className="w-48 h-48 rounded-2xl overflow-hidden shadow-soft">
                    <img
                      src={photoUrls[photo.id]}
                      alt="Plant photo"
                      className="w-full h-full object-cover"
                    />
                  </div>
                  <div className="text-xs text-charcoal-500 mt-2 text-center">
                    {new Date(photo.created_at).toLocaleDateString('en-US', {
                      month: 'short',
                      day: 'numeric',
                    })}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Check-In History Placeholder */}
        <div className="card-solid p-6">
          <h2 className="text-xl font-black text-forest-900 mb-3">The Plant Report</h2>
          <p className="text-charcoal-600">
            Nothing logged yet — hit that check-in button when you're ready 👆
          </p>
        </div>
      </div>
    </div>
  )
}
