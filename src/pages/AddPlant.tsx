import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { ArrowLeft, ArrowRight, Camera, Sparkles, MapPin, Sun, Ruler, Check, Cloud, CloudOff, Loader2 } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Progress } from '@/components/ui/progress'
import { supabase } from '../lib/supabase'
import { useAuth } from '../contexts/AuthContext'
import { uploadPlantPhoto } from '../lib/storage'
import ImageUploader from '../components/ImageUploader'
import { toast } from 'sonner'
import { useAIAnalysis } from '@/hooks/useAIAnalysis'

const STEPS = [
  { id: 'photo', title: 'Photo', icon: Camera },
  { id: 'details', title: 'Details', icon: MapPin },
  { id: 'environment', title: 'Environment', icon: Sun },
  { id: 'confirm', title: 'Confirm', icon: Check },
]

const LOCATIONS = [
  { id: 'Living Room', label: 'Living Room', emoji: '🛋️' },
  { id: 'Bedroom', label: 'Bedroom', emoji: '🛏️' },
  { id: 'Bathroom', label: 'Bathroom', emoji: '🚿' },
  { id: 'Kitchen', label: 'Kitchen', emoji: '🍳' },
  { id: 'Office', label: 'Office', emoji: '💼' },
  { id: 'Balcony', label: 'Balcony', emoji: '🌅' },
]

const LIGHT_TYPES = [
  { id: 'direct', label: 'Bright Direct', emoji: '☀️', description: 'Direct sunlight for 4+ hours', icon: Sun },
  { id: 'indirect', label: 'Bright Indirect', emoji: '🌤️', description: 'Near window, no direct sun', icon: Cloud },
  { id: 'low', label: 'Low Light', emoji: '🌙', description: 'Away from windows, shade', icon: CloudOff },
]

const PROXIMITY_OPTIONS = [
  { id: 'on_sill', label: 'On Windowsill', emoji: '🪟' },
  { id: 'near', label: 'Near Window', emoji: '📏' },
  { id: 'far', label: 'Far from Window', emoji: '🏠' },
]

export default function AddPlant() {
  const navigate = useNavigate()
  const { user } = useAuth()
  const [currentStep, setCurrentStep] = useState(0)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [aiIdentifying, setAiIdentifying] = useState(false)
  const aiAnalysis = useAIAnalysis()

  const [formData, setFormData] = useState({
    custom_name: '',
    species_name: '',
    location: '',
    light_type: '' as 'direct' | 'indirect' | 'low' | '',
    proximity_to_window: '' as 'on_sill' | 'near' | 'far' | '',
    photo: null as File | null,
  })

  const progress = ((currentStep + 1) / STEPS.length) * 100

  const updateFormData = (field: string, value: string | File | null) => {
    setFormData((prev) => ({ ...prev, [field]: value }))
  }

  const canProceed = () => {
    switch (currentStep) {
      case 0: // Photo - optional, always can proceed
        return true
      case 1: // Details - need name
        return formData.custom_name.trim().length > 0
      case 2: // Environment - need location, light, proximity
        return formData.location && formData.light_type && formData.proximity_to_window
      case 3: // Confirm
        return true
      default:
        return true
    }
  }

  const handleNext = () => {
    if (currentStep < STEPS.length - 1) {
      setCurrentStep(currentStep + 1)
    } else {
      handleSubmit()
    }
  }

  const handleBack = () => {
    if (currentStep > 0) {
      setCurrentStep(currentStep - 1)
    }
  }

  const handleSubmit = async () => {
    setError('')

    if (!user) {
      setError('You must be logged in to add a plant')
      return
    }

    setLoading(true)

    try {
      // 1. Create plant record
      const { data: plant, error: plantError } = await supabase
        .from('plants')
        .insert({
          user_id: user.id,
          custom_name: formData.custom_name.trim(),
          species_name: formData.species_name.trim() || null,
          location: formData.location,
          light_type: formData.light_type,
          proximity_to_window: formData.proximity_to_window,
        })
        .select()
        .single()

      if (plantError) throw plantError

      // 2. Upload photo if provided
      if (formData.photo && plant) {
        const { path } = await uploadPlantPhoto({
          file: formData.photo,
          userId: user.id,
          plantId: plant.id,
        })

        // Save photo reference
        await supabase.from('plant_photos').insert({
          plant_id: plant.id,
          storage_path: path,
        })
      }

      // 3. Show success and navigate to plant detail page
      toast.success('Plant added! Welcome to the fam 🌿')
      navigate(`/plant/${plant.id}`)
    } catch (err: any) {
      setError(err.message || 'Failed to add plant. Please try again.')
      toast.error('Failed to add plant. Please try again.')
      setLoading(false)
    }
  }

  const handleAIIdentify = async () => {
    if (!formData.photo || !user) return

    setAiIdentifying(true)

    try {
      // Convert file to base64
      const reader = new FileReader()
      const base64Promise = new Promise<string>((resolve, reject) => {
        reader.onload = () => {
          const result = reader.result as string
          // Remove "data:image/...;base64," prefix
          const base64 = result.split(',')[1]
          resolve(base64)
        }
        reader.onerror = reject
      })
      reader.readAsDataURL(formData.photo)
      const imageBase64 = await base64Promise

      const result = await aiAnalysis.mutateAsync({
        imageBase64,
        mediaType: formData.photo.type as 'image/jpeg' | 'image/png' | 'image/gif' | 'image/webp',
        analysisType: 'initial_identification'
      })

      // Pre-fill species name from AI result
      if (result.species) {
        updateFormData('species_name', result.species)
        toast.success('Plant identified!', {
          description: `Looks like a ${result.species}`
        })
      }
    } catch (error) {
      // Error handling already done in useAIAnalysis hook
      console.error('AI identify error:', error)
    } finally {
      setAiIdentifying(false)
    }
  }

  const renderStepContent = () => {
    switch (currentStep) {
      case 0:
        return (
          <div className="space-y-6 animate-fade-slide-up">
            <div className="text-center space-y-2">
              <h2 className="font-display text-2xl text-foreground">Let's see your new plant baby! 📸</h2>
              <p className="text-charcoal-600">Add a photo to help identify your plant</p>
            </div>

            <div className="max-w-sm mx-auto">
              <ImageUploader
                onImageSelect={(file) => updateFormData('photo', file)}
                onRemove={() => updateFormData('photo', null)}
              />
            </div>

            <div className="flex gap-4 justify-center">
              <Button
                variant="outline"
                className="rounded-xl"
                disabled={!formData.photo || aiIdentifying}
                onClick={handleAIIdentify}
              >
                {aiIdentifying ? (
                  <>
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    Identifying...
                  </>
                ) : (
                  <>
                    <Sparkles className="w-4 h-4 mr-2" />
                    AI Identify
                  </>
                )}
              </Button>
            </div>

            <p className="text-center text-sm text-charcoal-500">
              No pic? No problem — you can skip this step
            </p>
          </div>
        )

      case 1:
        return (
          <div className="space-y-6 animate-fade-slide-up">
            <div className="text-center space-y-2">
              <h2 className="font-display text-2xl text-foreground">Name your plant baby! 💚</h2>
              <p className="text-charcoal-600">Give them a name that sparks joy</p>
            </div>

            <div className="space-y-4 max-w-sm mx-auto">
              <div className="space-y-2">
                <Label htmlFor="custom_name">Nickname *</Label>
                <Input
                  id="custom_name"
                  placeholder="e.g., Monty, Fern Gully, Sir Leafs-a-Lot"
                  value={formData.custom_name}
                  onChange={(e) => updateFormData('custom_name', e.target.value)}
                  className="h-12 rounded-xl text-center text-lg"
                  maxLength={50}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="species">Species (optional)</Label>
                <Input
                  id="species"
                  placeholder="e.g., Monstera deliciosa"
                  value={formData.species_name}
                  onChange={(e) => updateFormData('species_name', e.target.value)}
                  className="h-12 rounded-xl"
                  maxLength={100}
                />
                <p className="text-xs text-charcoal-500 text-center">
                  Not sure? Use AI Identify in Step 1! ✨
                </p>
              </div>
            </div>
          </div>
        )

      case 2:
        return (
          <div className="space-y-8 animate-fade-slide-up">
            <div className="text-center space-y-2">
              <h2 className="font-display text-2xl text-foreground">Where does your plant live? 🏠</h2>
              <p className="text-charcoal-600">This helps us give better care tips!</p>
            </div>

            <div className="space-y-6">
              {/* Location */}
              <div className="space-y-3">
                <Label className="text-base flex items-center gap-2">
                  <MapPin className="w-4 h-4" /> Location *
                </Label>
                <div className="grid grid-cols-3 gap-3">
                  {LOCATIONS.map((loc) => (
                    <button
                      key={loc.id}
                      type="button"
                      onClick={() => updateFormData('location', loc.id)}
                      className={`p-4 rounded-xl border-2 transition-all ${
                        formData.location === loc.id
                          ? 'border-primary bg-primary/10 shadow-warm'
                          : 'border-charcoal-200 hover:border-primary/50'
                      }`}
                    >
                      <span className="text-2xl block mb-1">{loc.emoji}</span>
                      <span className="text-sm">{loc.label}</span>
                    </button>
                  ))}
                </div>
              </div>

              {/* Light Type */}
              <div className="space-y-3">
                <Label className="text-base flex items-center gap-2">
                  <Sun className="w-4 h-4" /> Light Level *
                </Label>
                <div className="space-y-2">
                  {LIGHT_TYPES.map((light) => {
                    const Icon = light.icon
                    return (
                      <button
                        key={light.id}
                        type="button"
                        onClick={() => updateFormData('light_type', light.id)}
                        className={`w-full p-4 rounded-xl border-2 transition-all text-left flex items-center gap-4 ${
                          formData.light_type === light.id
                            ? 'border-primary bg-primary/10 shadow-warm'
                            : 'border-charcoal-200 hover:border-primary/50'
                        }`}
                      >
                        <div className={`w-12 h-12 rounded-xl flex items-center justify-center ${
                          formData.light_type === light.id
                            ? 'bg-gradient-to-br from-forest-500 to-sage-600'
                            : 'bg-charcoal-100'
                        }`}>
                          <Icon className={`w-6 h-6 ${formData.light_type === light.id ? 'text-white dark:text-white' : 'text-muted-foreground'}`} />
                        </div>
                        <div>
                          <p className="font-medium">{light.emoji} {light.label}</p>
                          <p className="text-sm text-charcoal-600">{light.description}</p>
                        </div>
                      </button>
                    )
                  })}
                </div>
              </div>

              {/* Proximity */}
              <div className="space-y-3">
                <Label className="text-base flex items-center gap-2">
                  <Ruler className="w-4 h-4" /> Distance from Window *
                </Label>
                <div className="grid grid-cols-3 gap-3">
                  {PROXIMITY_OPTIONS.map((prox) => (
                    <button
                      key={prox.id}
                      type="button"
                      onClick={() => updateFormData('proximity_to_window', prox.id)}
                      className={`p-4 rounded-xl border-2 transition-all ${
                        formData.proximity_to_window === prox.id
                          ? 'border-primary bg-primary/10 shadow-warm'
                          : 'border-charcoal-200 hover:border-primary/50'
                      }`}
                    >
                      <span className="text-2xl block mb-1">{prox.emoji}</span>
                      <span className="text-sm">{prox.label}</span>
                    </button>
                  ))}
                </div>
              </div>
            </div>
          </div>
        )

      case 3:
        return (
          <div className="space-y-6 animate-fade-slide-up">
            <div className="text-center space-y-2">
              <h2 className="font-display text-2xl text-foreground">Welcome to the plant fam! 🌿✨</h2>
              <p className="text-charcoal-600">Let's review your new plant baby</p>
            </div>

            <Card className="bg-gradient-to-br from-card to-muted border-0 shadow-warm">
              <CardHeader className="text-center">
                <div className="w-20 h-20 rounded-full bg-forest-100 mx-auto mb-4 flex items-center justify-center text-4xl animate-bounce-gentle">
                  🌱
                </div>
                <CardTitle className="font-display text-2xl text-card-foreground">
                  {formData.custom_name || 'Unnamed Plant'}
                </CardTitle>
                {formData.species_name && (
                  <CardDescription className="italic text-charcoal-600">{formData.species_name}</CardDescription>
                )}
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-3 gap-4 text-center">
                  <div className="p-3 bg-white rounded-xl shadow-soft">
                    <p className="text-xl mb-1">
                      {LOCATIONS.find((l) => l.id === formData.location)?.emoji || '🏠'}
                    </p>
                    <p className="text-xs text-charcoal-600">
                      {formData.location || 'Location'}
                    </p>
                  </div>
                  <div className="p-3 bg-white rounded-xl shadow-soft">
                    <p className="text-xl mb-1">
                      {LIGHT_TYPES.find((l) => l.id === formData.light_type)?.emoji || '☀️'}
                    </p>
                    <p className="text-xs text-charcoal-600">
                      {LIGHT_TYPES.find((l) => l.id === formData.light_type)?.label || 'Light'}
                    </p>
                  </div>
                  <div className="p-3 bg-white rounded-xl shadow-soft">
                    <p className="text-xl mb-1">
                      {PROXIMITY_OPTIONS.find((p) => p.id === formData.proximity_to_window)?.emoji || '🪟'}
                    </p>
                    <p className="text-xs text-charcoal-600">
                      {PROXIMITY_OPTIONS.find((p) => p.id === formData.proximity_to_window)?.label || 'Window'}
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>

            {error && (
              <div className="p-4 bg-destructive/10 border border-destructive rounded-xl text-destructive text-center">
                {error}
              </div>
            )}

            <p className="text-center font-handwritten text-xl text-secondary-foreground">
              Slay! Your plant is ready to join the fam 💅
            </p>
          </div>
        )

      default:
        return null
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-background to-card pb-24">
      <div className="max-w-2xl mx-auto px-6 py-8 space-y-8">
        {/* Header with Progress */}
        <div className="space-y-4">
          <Button
            variant="ghost"
            onClick={() => currentStep === 0 ? navigate('/home') : handleBack()}
            className="gap-2 text-primary"
          >
            <ArrowLeft className="w-4 h-4" />
            {currentStep === 0 ? 'Cancel' : 'Back'}
          </Button>

          <div className="space-y-2">
            <div className="flex justify-between text-sm text-charcoal-600">
              <span>Step {currentStep + 1} of {STEPS.length}</span>
              <span>{STEPS[currentStep].title}</span>
            </div>
            <Progress value={progress} className="h-2" />
          </div>

          {/* Step indicators */}
          <div className="flex justify-between">
            {STEPS.map((step, index) => {
              const Icon = step.icon
              return (
                <div
                  key={step.id}
                  className={`flex flex-col items-center gap-1 ${
                    index <= currentStep ? 'text-primary' : 'text-charcoal-400'
                  }`}
                >
                  <div
                    className={`w-10 h-10 rounded-full flex items-center justify-center transition-all ${
                      index < currentStep
                        ? 'bg-primary text-primary-foreground'
                        : index === currentStep
                        ? 'bg-primary/20 border-2 border-primary'
                        : 'bg-charcoal-100'
                    }`}
                  >
                    {index < currentStep ? (
                      <Check className="w-5 h-5" />
                    ) : (
                      <Icon className="w-5 h-5" />
                    )}
                  </div>
                  <span className="text-xs hidden sm:block">{step.title}</span>
                </div>
              )
            })}
          </div>
        </div>

        {/* Step Content */}
        <div>{renderStepContent()}</div>

        {/* Navigation Buttons */}
        <div className="flex gap-4 pt-4">
          {currentStep > 0 && (
            <Button variant="outline" onClick={handleBack} className="flex-1 h-12 rounded-xl">
              <ArrowLeft className="w-4 h-4 mr-2" />
              Back
            </Button>
          )}
          <Button
            onClick={handleNext}
            disabled={!canProceed() || loading}
            className="flex-1 h-12 rounded-xl shadow-warm"
          >
            {loading ? (
              'Adding your plant...'
            ) : currentStep === STEPS.length - 1 ? (
              <>
                <Sparkles className="w-4 h-4 mr-2" />
                Add Plant
              </>
            ) : (
              <>
                Next
                <ArrowRight className="w-4 h-4 ml-2" />
              </>
            )}
          </Button>
        </div>
      </div>
    </div>
  )
}
