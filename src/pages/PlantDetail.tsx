import { useEffect, useState } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
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
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="text-center">
          <div className="text-6xl mb-4">🌿</div>
          <div className="text-lg text-gray-600">Loading plant...</div>
        </div>
      </div>
    )
  }

  if (error || !plant) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background px-6">
        <div className="text-center">
          <div className="text-6xl mb-4">😕</div>
          <h2 className="text-xl font-bold text-text mb-2">Plant not found</h2>
          <p className="text-gray-600 mb-6">{error || 'This plant might have been deleted'}</p>
          <button onClick={() => navigate('/home')} className="btn-primary">
            Go Home
          </button>
        </div>
      </div>
    )
  }

  const latestPhoto = photos[0]

  return (
    <div className="min-h-screen bg-background pb-24">
      {/* Header */}
      <div className="bg-white shadow-sm px-6 py-4 sticky top-0 z-10">
        <div className="flex items-center justify-between">
          <button onClick={() => navigate('/home')} className="text-primary text-2xl">
            ←
          </button>
          <button
            onClick={handleDelete}
            className="text-error text-sm font-medium"
          >
            Delete
          </button>
        </div>
      </div>

      {/* Hero Photo */}
      <div className="w-full aspect-square bg-gray-100 flex items-center justify-center">
        {latestPhoto ? (
          <img
            src={photoUrls[latestPhoto.id]}
            alt={plant.custom_name}
            className="w-full h-full object-cover"
          />
        ) : (
          <div className="text-9xl">🌱</div>
        )}
      </div>

      {/* Plant Name Overlay */}
      <div className="px-6 -mt-16 relative z-10">
        <div className="bg-white rounded-xl shadow-lg p-6">
          <h1 className="text-3xl font-bold text-primary mb-2">{plant.custom_name}</h1>
          {plant.species_name && (
            <p className="text-lg text-gray-600 italic">{plant.species_name}</p>
          )}
        </div>
      </div>

      {/* Details */}
      <div className="px-6 py-6 space-y-6">
        {/* Info Card */}
        <div className="card p-6 space-y-3">
          <div>
            <div className="text-sm font-medium text-gray-500">Location</div>
            <div className="text-text">{plant.location}</div>
          </div>

          <div>
            <div className="text-sm font-medium text-gray-500">Light</div>
            <div className="text-text">
              {plant.light_type === 'direct' && '☀️ Direct sunlight'}
              {plant.light_type === 'indirect' && '🌤️ Indirect light'}
              {plant.light_type === 'low' && '🌥️ Low light'}
            </div>
          </div>

          <div>
            <div className="text-sm font-medium text-gray-500">Distance from window</div>
            <div className="text-text">
              {plant.proximity_to_window === 'on_sill' && 'On the windowsill'}
              {plant.proximity_to_window === 'near' && 'Near window (1-3 feet)'}
              {plant.proximity_to_window === 'far' && 'Far from window (3+ feet)'}
            </div>
          </div>

          <div>
            <div className="text-sm font-medium text-gray-500">Added</div>
            <div className="text-text">
              {new Date(plant.created_at).toLocaleDateString('en-US', {
                month: 'long',
                day: 'numeric',
                year: 'numeric',
              })}
            </div>
          </div>
        </div>

        {/* Check-In Button */}
        <button
          onClick={() => navigate(`/check-in/${plant.id}`)}
          className="btn-primary w-full text-lg py-4"
        >
          Start Check-In
        </button>

        {/* Photo Gallery */}
        {photos.length > 0 && (
          <div>
            <h2 className="text-lg font-bold text-text mb-3">Photo Timeline</h2>
            <div className="grid grid-cols-3 gap-2">
              {photos.map((photo) => (
                <div key={photo.id} className="aspect-square">
                  <img
                    src={photoUrls[photo.id]}
                    alt="Plant photo"
                    className="w-full h-full object-cover rounded-lg"
                  />
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Check-In History Placeholder */}
        <div className="card p-6">
          <h2 className="text-lg font-bold text-text mb-2">What We've Noticed</h2>
          <p className="text-gray-600 text-sm">
            Nothing logged yet — hit that check-in button when you're ready 👆
          </p>
        </div>
      </div>
    </div>
  )
}
