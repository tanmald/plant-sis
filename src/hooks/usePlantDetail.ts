import { useQuery } from '@tanstack/react-query'
import { supabase } from '../lib/supabase'

interface Plant {
  id: string
  user_id: string
  custom_name: string
  species_name: string | null
  species_common_name: string | null
  location: string
  light_type: 'direct' | 'indirect' | 'low'
  proximity_to_window: 'on_sill' | 'near' | 'far'
  created_at: string
  updated_at: string
}

interface PlantPhoto {
  id: string
  plant_id: string
  storage_path: string
  caption: string | null
  created_at: string
}

interface CheckIn {
  id: string
  plant_id: string
  check_in_date: string
  responses: any
  recommendation: string | null
  created_at: string
}

interface PlantIdentification {
  id: string
  plant_id: string
  photo_url: string
  identified_species: string | null
  confidence_score: number | null
  ai_provider: string | null
  created_at: string
}

interface AIAnalysis {
  id: string
  plant_id: string
  health_status: 'thriving' | 'good' | 'at_risk' | 'critical'
  insights: string[]
  recommendations: string[]
  risk_flags: string[]
  identified_species: string | null
  confidence_score: number | null
  created_at: string
}

export function usePlantDetail(plantId: string) {
  return useQuery({
    queryKey: ['plant', plantId],
    queryFn: async () => {
      // Fetch plant details
      const { data: plant, error: plantError } = await supabase
        .from('plants')
        .select('*')
        .eq('id', plantId)
        .single()

      if (plantError) throw plantError

      // Fetch photos
      const { data: rawPhotos, error: photosError } = await supabase
        .from('plant_photos')
        .select('*')
        .eq('plant_id', plantId)
        .order('created_at', { ascending: false })

      if (photosError) throw photosError

      // Get public URLs for photos
      const photos = (rawPhotos || []).map((photo) => {
        const { data: urlData } = supabase.storage
          .from('plant-photos')
          .getPublicUrl(photo.storage_path)

        return {
          ...photo,
          public_url: urlData.publicUrl,
        }
      })

      // Fetch check-ins
      const { data: checkIns, error: checkInsError } = await supabase
        .from('check_ins')
        .select('*')
        .eq('plant_id', plantId)
        .order('check_in_date', { ascending: false })
        .limit(5)

      if (checkInsError) throw checkInsError

      // Fetch AI identifications
      const { data: identifications, error: identificationsError } = await supabase
        .from('plant_identifications')
        .select('*')
        .eq('plant_id', plantId)
        .order('created_at', { ascending: false })

      if (identificationsError) throw identificationsError

      // Fetch latest AI analysis
      const { data: latestAnalysis } = await supabase
        .from('ai_plant_analyses')
        .select('*')
        .eq('plant_id', plantId)
        .order('created_at', { ascending: false })
        .limit(1)
        .single()

      // Fetch analysis history (last 5)
      const { data: analysisHistory } = await supabase
        .from('ai_plant_analyses')
        .select('id, health_status, created_at')
        .eq('plant_id', plantId)
        .order('created_at', { ascending: false })
        .limit(5)

      return {
        plant: plant as Plant,
        photos: photos as (PlantPhoto & { public_url: string })[],
        checkIns: (checkIns || []) as CheckIn[],
        identifications: (identifications || []) as PlantIdentification[],
        latestAnalysis: latestAnalysis as AIAnalysis | null,
        analysisHistory: (analysisHistory || []) as Pick<AIAnalysis, 'id' | 'health_status' | 'created_at'>[],
      }
    },
    enabled: !!plantId,
  })
}
