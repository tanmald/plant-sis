import { useState, FormEvent } from 'react'
import { useNavigate } from 'react-router-dom'
import { ArrowLeft, Sun, Cloud, CloudOff, Camera } from 'lucide-react'
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
    <div className="min-h-screen bg-gradient-to-b from-cream to-sage-50 pb-24">
      {/* Glass Header */}
      <div className="bg-white/80 backdrop-blur-md shadow-soft px-6 py-5 sticky top-0 z-10 border-b border-white/20">
        <div className="flex items-center gap-4">
          <button
            onClick={() => navigate('/home')}
            className="icon-btn"
          >
            <ArrowLeft className="w-5 h-5" />
          </button>
          <h1 className="text-2xl font-black text-forest-700">Tell Me About Your New Plant Baby</h1>
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
          <label className="block text-base font-bold text-forest-900 mb-3 flex items-center gap-2">
            <Camera className="w-5 h-5" />
            Got a pic? <span className="font-normal text-charcoal-500">(optional)</span>
          </label>
          <ImageUploader
            onImageSelect={setPhotoFile}
            onRemove={() => setPhotoFile(null)}
          />
        </div>

        {/* Custom Name */}
        <div>
          <label htmlFor="customName" className="block text-base font-bold text-forest-900 mb-2">
            What should we call them? <span className="text-sunset-600">*</span>
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
          <p className="text-sm text-charcoal-600 mt-2">Something you'll actually remember</p>
        </div>

        {/* Species Name */}
        <div>
          <label htmlFor="speciesName" className="block text-base font-bold text-forest-900 mb-2">
            What kinda plant is this?
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
          <p className="text-sm text-charcoal-600 mt-2">
            Not sure? No stress — AI help coming soon 👀
          </p>
        </div>

        {/* Location */}
        <div>
          <label htmlFor="location" className="block text-base font-bold text-forest-900 mb-2">
            Where's this one living? <span className="text-sunset-600">*</span>
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

        {/* Light Type - Card Based */}
        <div>
          <label className="block text-base font-bold text-forest-900 mb-3">
            What's the light situation? <span className="text-sunset-600">*</span>
          </label>
          <div className="space-y-3">
            <button
              type="button"
              onClick={() => setLightType('direct')}
              className={`w-full p-4 rounded-2xl border-2 transition-all duration-200 text-left ${
                lightType === 'direct'
                  ? 'border-forest-500 bg-forest-50 shadow-soft'
                  : 'border-charcoal-200 bg-white hover:border-forest-300 hover:shadow-soft'
              }`}
            >
              <div className="flex items-center gap-3">
                <div className={`w-12 h-12 rounded-xl flex items-center justify-center ${
                  lightType === 'direct' ? 'bg-gradient-to-br from-sunset-400 to-sunset-600' : 'bg-charcoal-100'
                }`}>
                  <Sun className={`w-6 h-6 ${lightType === 'direct' ? 'text-white' : 'text-charcoal-500'}`} />
                </div>
                <div className="flex-1">
                  <div className="font-bold text-forest-900 flex items-center gap-2">
                    ☀️ Direct
                  </div>
                  <div className="text-sm text-charcoal-600">Direct sun, most of the day</div>
                </div>
              </div>
            </button>

            <button
              type="button"
              onClick={() => setLightType('indirect')}
              className={`w-full p-4 rounded-2xl border-2 transition-all duration-200 text-left ${
                lightType === 'indirect'
                  ? 'border-forest-500 bg-forest-50 shadow-soft'
                  : 'border-charcoal-200 bg-white hover:border-forest-300 hover:shadow-soft'
              }`}
            >
              <div className="flex items-center gap-3">
                <div className={`w-12 h-12 rounded-xl flex items-center justify-center ${
                  lightType === 'indirect' ? 'bg-gradient-to-br from-sage-400 to-sage-600' : 'bg-charcoal-100'
                }`}>
                  <Cloud className={`w-6 h-6 ${lightType === 'indirect' ? 'text-white' : 'text-charcoal-500'}`} />
                </div>
                <div className="flex-1">
                  <div className="font-bold text-forest-900 flex items-center gap-2">
                    🌤️ Indirect
                  </div>
                  <div className="text-sm text-charcoal-600">Bright, but no direct blasting</div>
                </div>
              </div>
            </button>

            <button
              type="button"
              onClick={() => setLightType('low')}
              className={`w-full p-4 rounded-2xl border-2 transition-all duration-200 text-left ${
                lightType === 'low'
                  ? 'border-forest-500 bg-forest-50 shadow-soft'
                  : 'border-charcoal-200 bg-white hover:border-forest-300 hover:shadow-soft'
              }`}
            >
              <div className="flex items-center gap-3">
                <div className={`w-12 h-12 rounded-xl flex items-center justify-center ${
                  lightType === 'low' ? 'bg-gradient-to-br from-charcoal-400 to-charcoal-600' : 'bg-charcoal-100'
                }`}>
                  <CloudOff className={`w-6 h-6 ${lightType === 'low' ? 'text-white' : 'text-charcoal-500'}`} />
                </div>
                <div className="flex-1">
                  <div className="font-bold text-forest-900 flex items-center gap-2">
                    🌥️ Low
                  </div>
                  <div className="text-sm text-charcoal-600">Low light, kinda dim</div>
                </div>
              </div>
            </button>
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
        <div className="space-y-3 pt-6">
          <button
            type="submit"
            disabled={loading}
            className="btn-primary w-full"
          >
            {loading ? 'Adding your plant...' : 'Add This Plant ✨'}
          </button>

          <button
            type="button"
            onClick={() => navigate('/home')}
            disabled={loading}
            className="btn-ghost w-full"
          >
            Not feeling it? Go back
          </button>
        </div>
      </form>
    </div>
  )
}
