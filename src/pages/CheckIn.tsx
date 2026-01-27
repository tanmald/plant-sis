import { useState, useEffect } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { ArrowLeft, ArrowRight, Check, Droplets, Leaf, TrendingUp, Bug, Sparkles } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Progress } from '@/components/ui/progress'
import { Textarea } from '@/components/ui/textarea'
import { supabase } from '../lib/supabase'
import { Plant } from '../types/database.types'
import { toast } from 'sonner'

const HEALTH_QUESTIONS = [
  {
    id: 'watering',
    question: "How's the soil feeling?",
    icon: Droplets,
    options: [
      { id: 'dry', label: 'Bone dry 🏜️', value: 'dry' },
      { id: 'slightly_dry', label: 'A bit dry', value: 'slightly_dry' },
      { id: 'moist', label: 'Nice and moist 💧', value: 'moist' },
      { id: 'wet', label: 'Pretty wet', value: 'wet' },
    ],
  },
  {
    id: 'leaves',
    question: 'How are the leaves looking?',
    icon: Leaf,
    options: [
      { id: 'perfect', label: 'Gorgeous & glossy ✨', value: 'perfect' },
      { id: 'slightly_droopy', label: 'A little droopy', value: 'slightly_droopy' },
      { id: 'yellow', label: 'Some yellowing', value: 'yellow' },
      { id: 'brown_spots', label: 'Brown spots 😟', value: 'brown_spots' },
    ],
  },
  {
    id: 'growth',
    question: 'Any new growth happening?',
    icon: TrendingUp,
    options: [
      { id: 'lots', label: 'Yes, thriving! 🌱', value: 'lots' },
      { id: 'some', label: 'A little bit', value: 'some' },
      { id: 'none', label: 'Not really', value: 'none' },
      { id: 'declining', label: 'Actually losing leaves', value: 'declining' },
    ],
  },
  {
    id: 'pests',
    question: 'Any uninvited guests?',
    icon: Bug,
    options: [
      { id: 'none', label: 'All clear! 🛡️', value: 'none' },
      { id: 'suspicious', label: 'Something looks sus', value: 'suspicious' },
      { id: 'yes', label: 'Yes, bugs! 😱', value: 'yes' },
      { id: 'unsure', label: 'Not sure how to tell', value: 'unsure' },
    ],
  },
]

export default function CheckIn() {
  const { plantId } = useParams()
  const navigate = useNavigate()
  const [plant, setPlant] = useState<Plant | null>(null)
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [currentStep, setCurrentStep] = useState(0)
  const [responses, setResponses] = useState<Record<string, string>>({})
  const [notes, setNotes] = useState('')
  const [showResults, setShowResults] = useState(false)
  const [error, setError] = useState('')

  const totalSteps = HEALTH_QUESTIONS.length + 1 // +1 for notes/summary
  const progress = ((currentStep + 1) / totalSteps) * 100

  const currentQuestion = HEALTH_QUESTIONS[currentStep]

  useEffect(() => {
    fetchPlant()
  }, [plantId])

  const fetchPlant = async () => {
    if (!plantId) return

    try {
      const { data, error } = await supabase
        .from('plants')
        .select('*')
        .eq('id', plantId)
        .single()

      if (error) throw error
      setPlant(data)
    } catch (err) {
      setError('Could not load plant details')
    } finally {
      setLoading(false)
    }
  }

  const handleOptionSelect = (value: string) => {
    setResponses((prev) => ({
      ...prev,
      [currentQuestion.id]: value,
    }))
  }

  const handleNext = () => {
    if (currentStep < HEALTH_QUESTIONS.length) {
      setCurrentStep(currentStep + 1)
    } else {
      // Generate recommendations and show results
      handleSaveCheckIn()
    }
  }

  const handleBack = () => {
    if (currentStep > 0) {
      setCurrentStep(currentStep - 1)
    }
  }

  const getHealthStatus = () => {
    const goodResponses = ['moist', 'perfect', 'lots', 'none']
    const responseValues = Object.values(responses)
    const goodCount = responseValues.filter((r) => goodResponses.includes(r)).length

    if (goodCount >= 3) return { status: 'thriving', emoji: '🌟', message: 'Your plant is absolutely SLAYING!' }
    if (goodCount >= 2) return { status: 'good', emoji: '💚', message: 'Looking good! Just a few tweaks needed.' }
    return { status: 'needs_love', emoji: '💕', message: 'Time to show some extra love!' }
  }

  const getRecommendations = () => {
    const recommendations: string[] = []

    if (responses.watering === 'dry' || responses.watering === 'slightly_dry') {
      recommendations.push('💧 Time for a drink! Give your plant a good watering.')
    }
    if (responses.watering === 'wet') {
      recommendations.push('🚱 Hold off on watering - soil is already wet. Check drainage!')
    }
    if (responses.leaves === 'yellow') {
      recommendations.push('💛 Yellow leaves could mean overwatering or nutrient deficiency. Check the soil!')
    }
    if (responses.leaves === 'brown_spots') {
      recommendations.push('🤎 Brown spots might indicate too much direct sun or inconsistent watering.')
    }
    if (responses.leaves === 'slightly_droopy') {
      recommendations.push('🍃 Droopy leaves often mean thirst! Check soil moisture.')
    }
    if (responses.growth === 'none' || responses.growth === 'declining') {
      recommendations.push('🌱 Growth slowed? Consider fertilizing or checking light levels.')
    }
    if (responses.pests === 'yes' || responses.pests === 'suspicious') {
      recommendations.push('🐛 Possible pest alert! Inspect closely and consider neem oil treatment.')
    }

    if (recommendations.length === 0) {
      recommendations.push('✨ Keep doing what you\'re doing! Your plant care game is on point.')
    }

    return recommendations
  }

  const handleSaveCheckIn = async () => {
    if (!plantId) return

    setSaving(true)
    setError('')

    const recommendations = getRecommendations()

    try {
      const { error: saveError } = await supabase.from('check_ins').insert({
        plant_id: plantId,
        check_in_date: new Date().toISOString(),
        responses: responses,
        recommendation: recommendations.join('\n'),
      })

      if (saveError) throw saveError

      toast.success('Check-in saved! 💚')
      setShowResults(true)
    } catch (err: any) {
      // Still show results even if save fails
      setError('Could not save check-in, but here are your recommendations!')
      toast.error('Could not save check-in')
      setShowResults(true)
    } finally {
      setSaving(false)
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-b from-cream to-sage-50">
        <div className="text-center animate-pulse">
          <div className="text-6xl mb-4">🌿</div>
          <div className="text-lg text-charcoal-600">Loading check-in...</div>
        </div>
      </div>
    )
  }

  if (error && !showResults) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-b from-cream to-sage-50 px-6">
        <div className="text-center">
          <div className="text-6xl mb-4">😕</div>
          <h2 className="text-2xl font-black text-forest-900 mb-2">Oops!</h2>
          <p className="text-charcoal-600 mb-6">{error}</p>
          <Button onClick={() => navigate('/home')}>Go Home</Button>
        </div>
      </div>
    )
  }

  if (showResults) {
    const health = getHealthStatus()
    const recommendations = getRecommendations()

    return (
      <div className="min-h-screen bg-gradient-to-b from-cream to-sage-50 pb-24">
        <div className="max-w-2xl mx-auto px-6 py-8 space-y-8 animate-fade-slide-up">
          <div className="text-center space-y-4">
            <div className="text-6xl animate-bounce-gentle">{health.emoji}</div>
            <h1 className="font-display text-3xl text-forest-900">{health.message}</h1>
            <p className="font-handwritten text-xl text-secondary">
              Check-in complete! Here's the tea on {plant?.custom_name} ☕
            </p>
          </div>

          <Card className="border-0 shadow-warm bg-gradient-to-br from-sage-50 to-forest-50">
            <CardHeader>
              <CardTitle className="font-display text-xl flex items-center gap-2 text-forest-900">
                <Sparkles className="w-5 h-5 text-sunset-500" />
                Care Recommendations
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {recommendations.map((rec, index) => (
                <div key={index} className="p-4 bg-white rounded-xl shadow-soft">
                  <p>{rec}</p>
                </div>
              ))}
            </CardContent>
          </Card>

          {notes && (
            <Card className="border-0 shadow-soft">
              <CardHeader>
                <CardTitle className="font-display text-lg text-forest-900">Your Notes</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-charcoal-600">{notes}</p>
              </CardContent>
            </Card>
          )}

          {error && (
            <div className="p-4 bg-sunset-100 border border-sunset-300 rounded-xl text-sunset-700 text-center text-sm">
              {error}
            </div>
          )}

          <div className="flex gap-4">
            <Button
              variant="outline"
              onClick={() => navigate(`/plant/${plantId}`)}
              className="flex-1 h-12 rounded-xl"
            >
              View Plant
            </Button>
            <Button
              onClick={() => navigate('/home')}
              className="flex-1 h-12 rounded-xl shadow-warm"
            >
              <Check className="w-4 h-4 mr-2" />
              Done
            </Button>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-cream to-sage-50 pb-24">
      <div className="max-w-2xl mx-auto px-6 py-8 space-y-8">
        {/* Header */}
        <div className="space-y-4">
          <Button
            variant="ghost"
            onClick={() => navigate(`/plant/${plantId}`)}
            className="gap-2 text-forest-600"
          >
            <ArrowLeft className="w-4 h-4" />
            Cancel
          </Button>

          {plant && (
            <div className="text-center mb-4">
              <p className="text-sm text-charcoal-500">Checking in on</p>
              <h2 className="font-display text-xl text-forest-900">{plant.custom_name}</h2>
            </div>
          )}

          <div className="space-y-2">
            <div className="flex justify-between text-sm text-charcoal-600">
              <span>Question {currentStep + 1} of {totalSteps}</span>
              <span>{currentStep < HEALTH_QUESTIONS.length ? 'Health Check' : 'Notes'}</span>
            </div>
            <Progress value={progress} className="h-2" />
          </div>
        </div>

        {/* Question Content */}
        <div className="animate-fade-slide-up">
          {currentStep < HEALTH_QUESTIONS.length ? (
            <Card className="border-0 shadow-soft">
              <CardHeader className="text-center">
                <div className="w-16 h-16 rounded-full bg-primary/10 mx-auto mb-4 flex items-center justify-center">
                  {currentQuestion && <currentQuestion.icon className="w-8 h-8 text-primary" />}
                </div>
                <CardTitle className="font-display text-2xl text-forest-900">{currentQuestion?.question}</CardTitle>
                <CardDescription className="font-handwritten text-lg text-secondary">
                  Be honest - no judgment here! 💅
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-3">
                {currentQuestion?.options.map((option) => (
                  <button
                    key={option.id}
                    type="button"
                    onClick={() => handleOptionSelect(option.value)}
                    className={`w-full p-4 rounded-xl border-2 transition-all text-left ${
                      responses[currentQuestion.id] === option.value
                        ? 'border-primary bg-primary/10 shadow-warm'
                        : 'border-charcoal-200 hover:border-primary/50'
                    }`}
                  >
                    <span className="text-lg">{option.label}</span>
                  </button>
                ))}
              </CardContent>
            </Card>
          ) : (
            <Card className="border-0 shadow-soft">
              <CardHeader className="text-center">
                <div className="w-16 h-16 rounded-full bg-secondary/20 mx-auto mb-4 flex items-center justify-center text-3xl">
                  📝
                </div>
                <CardTitle className="font-display text-2xl text-forest-900">Any extra notes?</CardTitle>
                <CardDescription className="font-handwritten text-lg text-secondary">
                  Spill the tea about your plant! ☕
                </CardDescription>
              </CardHeader>
              <CardContent>
                <Textarea
                  placeholder="e.g., Noticed a new leaf unfurling! The cat knocked it over last week..."
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  className="min-h-[150px] rounded-xl resize-none"
                />
              </CardContent>
            </Card>
          )}
        </div>

        {/* Navigation */}
        <div className="flex gap-4 pt-4">
          {currentStep > 0 && (
            <Button variant="outline" onClick={handleBack} className="flex-1 h-12 rounded-xl">
              <ArrowLeft className="w-4 h-4 mr-2" />
              Back
            </Button>
          )}
          <Button
            onClick={handleNext}
            disabled={(currentStep < HEALTH_QUESTIONS.length && !responses[currentQuestion?.id]) || saving}
            className="flex-1 h-12 rounded-xl shadow-warm"
          >
            {saving ? (
              'Saving...'
            ) : currentStep >= HEALTH_QUESTIONS.length ? (
              <>
                <Sparkles className="w-4 h-4 mr-2" />
                Get Recommendations
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
