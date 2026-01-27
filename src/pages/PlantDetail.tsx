import { useParams, Link, useNavigate } from 'react-router-dom'
import { ArrowLeft, Camera, MapPin, Sun, Calendar, Sparkles, Heart, TrendingUp, AlertTriangle } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { PhotoCarousel } from '@/components/plants/PhotoCarousel'
import { EmptyState } from '@/components/ui/EmptyState'
import { usePlantDetail } from '@/hooks/usePlantDetail'
import { toast } from 'sonner'

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
  const { data, isLoading, error, refetch } = usePlantDetail(id || '')

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

  const { plant, photos, checkIns, identifications } = data

  // Calculate derived values
  const daysSinceAdded = Math.floor((Date.now() - new Date(plant.created_at).getTime()) / (1000 * 60 * 60 * 24))
  const lastCheckIn = checkIns[0]
  const daysSinceCheckIn = lastCheckIn
    ? Math.floor((Date.now() - new Date(lastCheckIn.check_in_date).getTime()) / (1000 * 60 * 60 * 24))
    : null

  return (
    <div className="space-y-8 max-w-4xl mx-auto">
      {/* Back Button */}
      <Link
        to="/"
        className="inline-flex items-center gap-2 text-muted-foreground hover:text-foreground transition-colors"
      >
        <ArrowLeft className="w-4 h-4" />
        <span>Back to plants</span>
      </Link>

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
          onClick={() => toast.info('AI Identify coming soon! 🌿')}
        >
          <div className="text-center">
            <Sparkles className="w-5 h-5 mx-auto mb-1" />
            <span className="text-sm">AI Identify</span>
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
