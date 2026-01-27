import { useQuery } from '@tanstack/react-query'
import { useAuth } from '../contexts/AuthContext'
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
  photo_url: string | null
  last_check_in: string | null
  health_status: 'thriving' | 'good' | 'needs_attention'
}

function computeHealthStatus(responses: any): 'thriving' | 'good' | 'needs_attention' {
  if (!responses) return 'thriving'

  const goodResponses = ['moist', 'perfect', 'lots', 'none']
  const responseValues = Object.values(responses)
  const goodCount = responseValues.filter((r) => goodResponses.includes(r as string)).length

  if (goodCount >= 3) return 'thriving'
  if (goodCount >= 2) return 'good'
  return 'needs_attention'
}

export function usePlants() {
  const { user } = useAuth()

  return useQuery<Plant[]>({
    queryKey: ['plants', user?.id],
    queryFn: async () => {
      if (!user) throw new Error('User not authenticated')

      // Fetch plants from Supabase
      const { data: plants, error } = await supabase
        .from('plants')
        .select('*')
        .eq('user_id', user.id)
        .order('updated_at', { ascending: false })

      if (error) throw error

      // Fetch latest photo and check-in for each plant
      const plantsWithData = await Promise.all(
        plants.map(async (plant) => {
          // Get latest photo
          const { data: photos } = await supabase
            .from('plant_photos')
            .select('storage_path')
            .eq('plant_id', plant.id)
            .order('created_at', { ascending: false })
            .limit(1)

          // Get latest check-in
          const { data: checkIns } = await supabase
            .from('check_ins')
            .select('check_in_date, responses')
            .eq('plant_id', plant.id)
            .order('check_in_date', { ascending: false })
            .limit(1)

          // Get public URL for photo if it exists
          let photoUrl = null
          if (photos && photos.length > 0 && photos[0].storage_path) {
            const { data: urlData } = supabase.storage
              .from('plant-photos')
              .getPublicUrl(photos[0].storage_path)
            photoUrl = urlData.publicUrl
          }

          return {
            ...plant,
            photo_url: photoUrl,
            last_check_in: checkIns?.[0]?.check_in_date || null,
            health_status: computeHealthStatus(checkIns?.[0]?.responses),
          }
        })
      )

      return plantsWithData
    },
    enabled: !!user,
  })
}
