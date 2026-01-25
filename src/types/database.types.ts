// Database types for Supabase
// This file will be auto-generated from Supabase schema in production
// For now, we define types manually

export interface Plant {
  id: string
  user_id: string
  custom_name: string
  species_name?: string
  species_common_name?: string
  location: string
  light_type: 'direct' | 'indirect' | 'low'
  proximity_to_window: 'on_sill' | 'near' | 'far'
  created_at: string
  updated_at: string
}

export interface PlantPhoto {
  id: string
  plant_id: string
  storage_path: string
  caption?: string
  created_at: string
}

export interface CheckIn {
  id: string
  plant_id: string
  check_in_date: string
  responses: Record<string, any>
  recommendation: string
  created_at: string
}

export interface PlantIdentification {
  id: string
  plant_id: string
  photo_url: string
  identified_species: string
  confidence_score: number
  ai_provider: string
  created_at: string
}

export interface UserProfile {
  id: string
  subscription_tier: 'free' | 'pro'
  plants_count: number
  ai_ids_used_this_month: number
  created_at: string
  updated_at: string
}
