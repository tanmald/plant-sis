import { useState } from 'react'
import { useParams, Link, useNavigate } from 'react-router-dom'
import { ArrowLeft, Camera, MapPin, Sun, Calendar, Sparkles, Heart, TrendingUp, AlertTriangle, Loader2, Bell, Trash2 } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from '@/components/ui/alert-dialog'
import { supabase } from '@/lib/supabase'
import { PhotoCarousel } from '@/components/plants/PhotoCarousel'
import { EmptyState } from '@/components/ui/EmptyState'
import { usePlantDetail } from '@/hooks/usePlantDetail'
import { useAIAnalysis, useCheckInPrompt, useSnoozeCheckIn } from '@/hooks/useAIAnalysis'
import { AIFeatureGate } from '@/components/AIFeatureGate'
import { toast } from 'sonner'
import { formatDistanceToNow } from 'date-fns'
import { cn } from '@/lib/utils'
import { useQueryClient } from '@tanstack/react-query'

const getLightTypeLabel = (type: string) => {
  const labels: Record<string, string> = {
    direct: '☀️ Bright Direct',
    indirect: '🌤️ Bright Indirect',
    low: '🌙 Low Light',
  }
  return labels[type] || type
}

export default function PlantDetail() {
  const { id } = useParams<{ id: string }>()
  const navigate = useNavigate()
  const queryClient = useQueryClient()
  const { data, isLoading, error, refetch } = usePlantDetail(id || '')
  const aiAnalysis = useAIAnalysis()
  const { data: isDueForCheckIn } = useCheckInPrompt(id)
  const snoozeCheckIn = useSnoozeCheckIn()
  const [analyzing, setAnalyzing] = useState(false)

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center space-y-4">
          <div className="text-6xl animate-bounce-gentle">🌱</div>
          <p className="text-muted-foreground font-handwritten text-xl">Loading plant details...</p>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <EmptyState
        icon={AlertTriangle}
        title="Oops! Something went wrong"
        description="We couldn't load this plant. Try refreshing!"
        action={<Button onClick={() => refetch()}>Retry</Button>}
      />
    )
  }

  if (!data?.plant) {
    return (
      <EmptyState
        icon={AlertTriangle}
        title="Plant not found"
        description="This plant might have been deleted"
        action={<Button onClick={() => navigate('/')}>Go Home</Button>}
      />
    )
  }

  const { plant, photos, checkIns, identifications, latestAnalysis } = data

  // Calculate derived values
  const daysSinceAdded = Math.floor((Date.now() - new Date(plant.created_at).getTime()) / (1000 * 60 * 60 * 24))
  const lastCheckIn = checkIns[0]
  const daysSinceCheckIn = lastCheckIn
    ? Math.floor((Date.now() - new Date(lastCheckIn.check_in_date).getTime()) / (1000 * 60 * 60 * 24))
    : null

  const handleDelete = async () => {
    const { error } = await supabase
      .from('plants')
      .delete()
      .eq('id', plant.id)

    if (error) {
      toast.error('Failed to delete plant')
      return
    }

    queryClient.invalidateQueries({ queryKey: ['plants'] })
    toast.success(`${plant.custom_name} removed from your garden`)
    navigate('/')
  }

  const handleAnalyzeHealth = async () => {
    if (!photos?.length) {
      toast.error('No photo available', {
        description: 'Add a photo first to analyze plant health'
      })
      return
    }

    setAnalyzing(true)
    try {
      // Get latest photo's public URL
      const latestPhoto = photos[0]

      // Fetch the image and convert to base64
      const response = await fetch(latestPhoto.public_url)
      const blob = await response.blob()
      const reader = new FileReader()
      const base64Promise = new Promise<string>((resolve, reject) => {
        reader.onload = () => {
          const result = reader.result as string
          resolve(result.split(',')[1])
        }
        reader.onerror = reject
      })
      reader.readAsDataURL(blob)
      const imageBase64 = await base64Promise

      await aiAnalysis.mutateAsync({
        imageBase64,
        mediaType: blob.type as 'image/jpeg' | 'image/png' | 'image/gif' | 'image/webp',
        analysisType: 'health_monitoring',
        plantData: {
          plant_id: plant.id,
          custom_name: plant.custom_name,
          species: plant.species_name || undefined,
          location: plant.location
        }
      })

      // Refetch plant data to get updated analysis
      queryClient.invalidateQueries({ queryKey: ['plant', id] })
    } catch (error) {
      console.error('Health analysis error:', error)
    } finally {
      setAnalyzing(false)
    }
  }

  return (
    <div className="space-y-8 max-w-4xl mx-auto">
      {/* Header with Back Button and Delete */}
      <div className="flex items-center justify-between">
        <Link
          to="/"
          className="inline-flex items-center gap-2 text-muted-foreground hover:text-foreground transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Back to plants</span>
        </Link>

        <AlertDialog>
          <AlertDialogTrigger asChild>
            <Button variant="ghost" size="sm" className="text-destructive hover:text-destructive hover:bg-destructive/10">
              <Trash2 className="w-4 h-4 mr-1" />
              Delete
            </Button>
          </AlertDialogTrigger>
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>Delete {plant.custom_name}?</AlertDialogTitle>
              <AlertDialogDescription>
                This will permanently remove {plant.custom_name} and all its photos, check-ins, and history.
                This action cannot be undone.
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel>Cancel</AlertDialogCancel>
              <AlertDialogAction
                onClick={handleDelete}
                className="bg-destructive hover:bg-destructive/90"
              >
                Delete Plant
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
      </div>

      {/* Hero Section */}
      <div className="relative">
        <div className="photo-frame aspect-[4/3] bg-gradient-to-br from-sage-light to-secondary/20 flex items-center justify-center">
          {photos.length > 0 && photos[0].public_url ? (
            <img
              src={photos[0].public_url}
              alt={plant.custom_name}
              className="w-full h-full object-cover"
            />
          ) : (
            <div className="text-center space-y-2">
              <span className="text-6xl">🌿</span>
              <p className="text-sm text-muted-foreground font-handwritten">No photo yet</p>
            </div>
          )}
        </div>

        {/* Floating badges */}
        <div className="absolute -bottom-4 left-4 right-4 flex justify-between">
          <Badge className="bg-primary text-primary-foreground shadow-lg border-0 px-4 py-2 text-sm hover:bg-primary">
            <Heart className="w-4 h-4 mr-2" />
            {daysSinceAdded} days together
          </Badge>
          <Button size="sm" variant="secondary" className="rounded-full shadow-lg">
            <Camera className="w-4 h-4 mr-2" />
            Add Photo
          </Button>
        </div>
      </div>

      {/* Plant Info Card */}
      <Card className="border-0 shadow-warm mt-8">
        <CardHeader className="text-center">
          <CardTitle className="font-display text-3xl">{plant.custom_name}</CardTitle>
          {plant.species_common_name && (
            <p className="text-muted-foreground italic">{plant.species_common_name}</p>
          )}
          {plant.species_name && (
            <p className="text-xs text-muted-foreground">{plant.species_name}</p>
          )}
        </CardHeader>
        <CardContent>
          <div className="flex flex-wrap justify-center gap-3">
            <Badge variant="outline" className="px-4 py-2 rounded-full">
              <MapPin className="w-3 h-3 mr-2" />
              {plant.location}
            </Badge>
            <Badge variant="outline" className="px-4 py-2 rounded-full">
              <Sun className="w-3 h-3 mr-2" />
              {getLightTypeLabel(plant.light_type)}
            </Badge>
            <Badge variant="outline" className="px-4 py-2 rounded-full">
              <Calendar className="w-3 h-3 mr-2" />
              Added {new Date(plant.created_at).toLocaleDateString()}
            </Badge>
          </div>
        </CardContent>
      </Card>

      {/* Check-in Due Banner */}
      {isDueForCheckIn && (
        <Card className="border-amber-200 bg-amber-50 dark:bg-amber-950/20 dark:border-amber-800">
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-amber-100 dark:bg-amber-900 flex items-center justify-center">
                <Bell className="w-5 h-5 text-amber-600 dark:text-amber-400" />
              </div>
              <div className="flex-1">
                <p className="font-medium text-amber-900 dark:text-amber-100">Time for a check-in!</p>
                <p className="text-sm text-amber-700 dark:text-amber-300">See how {plant.custom_name} is doing</p>
              </div>
              <div className="flex gap-2">
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => snoozeCheckIn.mutate({ plantId: id!, days: 3 })}
                  disabled={snoozeCheckIn.isPending}
                >
                  Snooze
                </Button>
                <Button asChild size="sm">
                  <Link to={`/check-in/${id}`}>Check In</Link>
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Quick Actions */}
      <div className="grid grid-cols-2 gap-4">
        <Button asChild variant="outline" className="h-16 rounded-2xl">
          <Link to={`/check-in/${id}`}>
            <div className="text-center">
              <TrendingUp className="w-5 h-5 mx-auto mb-1" />
              <span className="text-sm">Check In</span>
            </div>
          </Link>
        </Button>
        <Button
          variant="outline"
          className="h-16 rounded-2xl"
          onClick={handleAnalyzeHealth}
          disabled={analyzing || !photos?.length}
        >
          <div className="text-center">
            {analyzing ? (
              <Loader2 className="w-5 h-5 mx-auto mb-1 animate-spin" />
            ) : (
              <Sparkles className="w-5 h-5 mx-auto mb-1" />
            )}
            <span className="text-sm">{analyzing ? 'Analyzing...' : 'AI Health'}</span>
          </div>
        </Button>
      </div>

      {/* Photo Timeline */}
      {photos.length > 0 && (
        <Card className="border-0 shadow-sm">
          <CardHeader>
            <CardTitle className="font-display text-xl flex items-center gap-2">
              <Camera className="w-5 h-5 text-primary" />
              Photo Timeline
            </CardTitle>
          </CardHeader>
          <CardContent>
            <PhotoCarousel
              photos={photos.map((p) => ({
                ...p,
                storage_path: p.public_url,
                created_at: new Date(p.created_at),
              }))}
            />
          </CardContent>
        </Card>
      )}

      {/* Care Recommendations */}
      {checkIns.length > 0 && checkIns[0].recommendation && (
        <Card className="border-0 shadow-sm gradient-warm">
          <CardHeader>
            <CardTitle className="font-display text-xl flex items-center gap-2">
              <Heart className="w-5 h-5 text-accent" />
              Latest Care Advice
            </CardTitle>
            <p className="text-sm text-muted-foreground">
              From your check-in {daysSinceCheckIn} day{daysSinceCheckIn !== 1 ? 's' : ''} ago
            </p>
          </CardHeader>
          <CardContent>
            <p className="text-foreground">{checkIns[0].recommendation}</p>
          </CardContent>
        </Card>
      )}

      {/* AI Health Analysis */}
      <AIFeatureGate feature="analysis">
        <Card className="border-0 shadow-warm">
          <CardHeader>
            <CardTitle className="font-display text-xl flex items-center gap-2">
              <Sparkles className="w-5 h-5 text-honey" />
              AI Health Analysis
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {latestAnalysis ? (
              <>
                {/* Health Status Badge */}
                <div className="flex items-center justify-between">
                  <span className="text-sm text-muted-foreground">Current Status</span>
                  <Badge className={cn(
                    "capitalize",
                    latestAnalysis.health_status === 'thriving' && "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-100",
                    latestAnalysis.health_status === 'good' && "bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-100",
                    latestAnalysis.health_status === 'at_risk' && "bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-100",
                    latestAnalysis.health_status === 'critical' && "bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-100"
                  )}>
                    {latestAnalysis.health_status === 'at_risk' ? 'Needs Attention' : latestAnalysis.health_status}
                  </Badge>
                </div>

                {/* Risk Flags */}
                {latestAnalysis.risk_flags?.length > 0 && (
                  <div className="p-3 bg-destructive/10 rounded-xl space-y-2">
                    <div className="flex items-center gap-2 text-destructive font-medium">
                      <AlertTriangle className="w-4 h-4" />
                      Attention Needed
                    </div>
                    <ul className="text-sm space-y-1">
                      {latestAnalysis.risk_flags.map((flag: string, i: number) => (
                        <li key={i}>• {flag}</li>
                      ))}
                    </ul>
                  </div>
                )}

                {/* Insights */}
                {latestAnalysis.insights?.length > 0 && (
                  <div className="space-y-2">
                    <p className="text-sm font-medium">Insights</p>
                    <ul className="text-sm text-muted-foreground space-y-1">
                      {latestAnalysis.insights.slice(0, 3).map((insight: string, i: number) => (
                        <li key={i}>• {insight}</li>
                      ))}
                    </ul>
                  </div>
                )}

                {/* Recommendations */}
                {latestAnalysis.recommendations?.length > 0 && (
                  <div className="space-y-2">
                    <p className="text-sm font-medium">Care Tips</p>
                    <ul className="text-sm text-muted-foreground space-y-1">
                      {latestAnalysis.recommendations.slice(0, 3).map((rec: string, i: number) => (
                        <li key={i}>• {rec}</li>
                      ))}
                    </ul>
                  </div>
                )}

                {/* Last Analyzed + Re-analyze button */}
                <div className="flex items-center justify-between pt-2">
                  <p className="text-xs text-muted-foreground">
                    Analyzed {formatDistanceToNow(new Date(latestAnalysis.created_at), { addSuffix: true })}
                  </p>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={handleAnalyzeHealth}
                    disabled={analyzing || !photos?.length}
                  >
                    {analyzing ? (
                      <Loader2 className="w-4 h-4 animate-spin" />
                    ) : (
                      'Re-analyze'
                    )}
                  </Button>
                </div>
              </>
            ) : (
              <div className="text-center py-4">
                <p className="text-muted-foreground mb-4">No health analysis yet</p>
                <Button
                  onClick={handleAnalyzeHealth}
                  disabled={analyzing || !photos?.length}
                >
                  {analyzing ? (
                    <>
                      <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                      Analyzing...
                    </>
                  ) : (
                    <>
                      <Sparkles className="w-4 h-4 mr-2" />
                      Analyze Now
                    </>
                  )}
                </Button>
              </div>
            )}
          </CardContent>
        </Card>
      </AIFeatureGate>

      {/* AI Identification History */}
      {identifications.length > 0 && (
        <Card className="border-0 shadow-sm">
          <CardHeader>
            <CardTitle className="font-display text-xl flex items-center gap-2">
              <Sparkles className="w-5 h-5 text-honey" />
              AI Identification
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {identifications.map((identification) => (
              <div
                key={identification.id}
                className="flex items-center justify-between p-4 bg-muted rounded-xl"
              >
                <div>
                  <p className="font-medium">{identification.identified_species || 'Unknown'}</p>
                  <p className="text-sm text-muted-foreground">
                    {new Date(identification.created_at).toLocaleDateString()}
                  </p>
                </div>
                <Badge variant="secondary" className="rounded-full">
                  {Math.round((identification.confidence_score || 0) * 100)}% match
                </Badge>
              </div>
            ))}
          </CardContent>
        </Card>
      )}
    </div>
  )
}
