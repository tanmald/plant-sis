import { useState, FormEvent } from 'react'
import { useNavigate } from 'react-router-dom'
import { supabase } from '../lib/supabase'
import { useAuth } from '../hooks/useAuth'
import { uploadPlantPhoto } from '../lib/storage'
import ImageUploader from '../components/ImageUploader'

export default function AddPlant() {
  const navigate = useNavigate()
  const { user } = useAuth()

  // Form state
  const [customName, setCustomName] = useState('')
  const [speciesName, setSpeciesName] = useState('')
  const [location, setLocation] = useState('')
  const [lightType, setLightType] = useState<'direct' | 'indirect' | 'low'>('indirect')
  const [proximity, setProximity] = useState<'on_sill' | 'near' | 'far'>('near')
  const [photoFile, setPhotoFile] = useState<File | null>(null)

  // UI state
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault()
    setError('')

    if (!user) {
      setError('You must be logged in to add a plant')
      return
    }

    if (!customName.trim()) {
      setError('Please give your plant a name')
      return
    }

    if (!location.trim()) {
      setError('Please tell us where your plant lives')
      return
    }

    setLoading(true)

    try {
      // 1. Create plant record
      const { data: plant, error: plantError } = await supabase
        .from('plants')
        .insert({
          user_id: user.id,
          custom_name: customName.trim(),
          species_name: speciesName.trim() || null,
          location: location.trim(),
          light_type: lightType,
          proximity_to_window: proximity,
        })
        .select()
        .single()

      if (plantError) throw plantError

      // 2. Upload photo if provided
      if (photoFile && plant) {
        const { path } = await uploadPlantPhoto({
          file: photoFile,
          userId: user.id,
          plantId: plant.id,
        })

        // Save photo reference
        await supabase.from('plant_photos').insert({
          plant_id: plant.id,
          storage_path: path,
        })
      }

      // 3. Navigate to plant detail page
      navigate(`/plant/${plant.id}`)
    } catch (err: any) {
      console.error('Error adding plant:', err)
      setError(err.message || 'Failed to add plant. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-background pb-24">
      {/* Header */}
      <div className="bg-white shadow-sm px-6 py-4 sticky top-0 z-10">
        <div className="flex items-center gap-4">
          <button
            onClick={() => navigate('/home')}
            className="text-primary text-2xl"
          >
            ←
          </button>
          <h1 className="text-2xl font-bold text-primary">Add Plant</h1>
        </div>
      </div>

      {/* Form */}
      <form onSubmit={handleSubmit} className="px-6 py-8 space-y-6">
        {/* Error Message */}
        {error && (
          <div className="p-4 bg-error bg-opacity-10 border border-error rounded-lg text-error">
            {error}
          </div>
        )}

        {/* Photo Upload */}
        <div>
          <label className="block text-sm font-medium text-text mb-2">
            Plant Photo <span className="text-gray-500">(optional)</span>
          </label>
          <ImageUploader
            onImageSelect={setPhotoFile}
            onRemove={() => setPhotoFile(null)}
          />
        </div>

        {/* Custom Name */}
        <div>
          <label htmlFor="customName" className="block text-sm font-medium text-text mb-2">
            Give your plant a name <span className="text-error">*</span>
          </label>
          <input
            id="customName"
            type="text"
            value={customName}
            onChange={(e) => setCustomName(e.target.value)}
            placeholder="e.g., Monty, Big Phil, Gerald"
            className="input-field"
            required
            maxLength={50}
          />
          <p className="text-xs text-gray-500 mt-1">Something you'll remember 🌿</p>
        </div>

        {/* Species Name */}
        <div>
          <label htmlFor="speciesName" className="block text-sm font-medium text-text mb-2">
            Species (Scientific or Common)
          </label>
          <input
            id="speciesName"
            type="text"
            value={speciesName}
            onChange={(e) => setSpeciesName(e.target.value)}
            placeholder="e.g., Monstera deliciosa, Snake Plant"
            className="input-field"
            maxLength={100}
          />
          <p className="text-xs text-gray-500 mt-1">
            Not sure? We'll add AI identification soon 👀
          </p>
        </div>

        {/* Location */}
        <div>
          <label htmlFor="location" className="block text-sm font-medium text-text mb-2">
            Where does it live? <span className="text-error">*</span>
          </label>
          <input
            id="location"
            type="text"
            value={location}
            onChange={(e) => setLocation(e.target.value)}
            placeholder="e.g., Living room, near east window"
            className="input-field"
            required
            maxLength={100}
          />
        </div>

        {/* Light Type */}
        <div>
          <label className="block text-sm font-medium text-text mb-3">
            Light conditions <span className="text-error">*</span>
          </label>
          <div className="space-y-2">
            <label className="flex items-center gap-3 p-3 border-2 rounded-lg cursor-pointer hover:border-primary transition-colors">
              <input
                type="radio"
                name="lightType"
                value="direct"
                checked={lightType === 'direct'}
                onChange={(e) => setLightType(e.target.value as any)}
                className="w-5 h-5 text-primary"
              />
              <div>
                <div className="font-medium text-text">☀️ Direct</div>
                <div className="text-sm text-gray-600">Full sun most of the day</div>
              </div>
            </label>

            <label className="flex items-center gap-3 p-3 border-2 rounded-lg cursor-pointer hover:border-primary transition-colors">
              <input
                type="radio"
                name="lightType"
                value="indirect"
                checked={lightType === 'indirect'}
                onChange={(e) => setLightType(e.target.value as any)}
                className="w-5 h-5 text-primary"
              />
              <div>
                <div className="font-medium text-text">🌤️ Indirect</div>
                <div className="text-sm text-gray-600">Bright but filtered light</div>
              </div>
            </label>

            <label className="flex items-center gap-3 p-3 border-2 rounded-lg cursor-pointer hover:border-primary transition-colors">
              <input
                type="radio"
                name="lightType"
                value="low"
                checked={lightType === 'low'}
                onChange={(e) => setLightType(e.target.value as any)}
                className="w-5 h-5 text-primary"
              />
              <div>
                <div className="font-medium text-text">🌥️ Low</div>
                <div className="text-sm text-gray-600">Minimal natural light</div>
              </div>
            </label>
          </div>
        </div>

        {/* Proximity to Window */}
        <div>
          <label htmlFor="proximity" className="block text-sm font-medium text-text mb-2">
            How close to a window? <span className="text-error">*</span>
          </label>
          <select
            id="proximity"
            value={proximity}
            onChange={(e) => setProximity(e.target.value as any)}
            className="input-field"
          >
            <option value="on_sill">On the windowsill</option>
            <option value="near">Near window (1-3 feet)</option>
            <option value="far">Far from window (3+ feet)</option>
          </select>
        </div>

        {/* Submit Buttons */}
        <div className="space-y-3 pt-4">
          <button
            type="submit"
            disabled={loading}
            className="btn-primary w-full"
          >
            {loading ? 'Adding Plant...' : 'Save Plant'}
          </button>

          <button
            type="button"
            onClick={() => navigate('/home')}
            disabled={loading}
            className="btn-secondary w-full"
          >
            Cancel
          </button>
        </div>
      </form>
    </div>
  )
}
