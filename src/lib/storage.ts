import { supabase } from './supabase'

export interface UploadPhotoParams {
  file: File
  userId: string
  plantId?: string
}

export async function uploadPlantPhoto({ file, userId, plantId }: UploadPhotoParams) {
  try {
    // Generate unique filename
    const timestamp = Date.now()
    const randomString = Math.random().toString(36).substring(7)
    const fileExt = file.name.split('.').pop()
    const fileName = `${timestamp}-${randomString}.${fileExt}`

    // Upload to: userId/plantId/filename.jpg
    // If no plantId yet (during creation), use temp folder
    const folder = plantId || 'temp'
    const filePath = `${userId}/${folder}/${fileName}`

    const { data, error } = await supabase.storage
      .from('plant-photos')
      .upload(filePath, file, {
        cacheControl: '3600',
        upsert: false,
      })

    if (error) throw error

    // Get public URL
    const { data: urlData } = supabase.storage
      .from('plant-photos')
      .getPublicUrl(data.path)

    return {
      path: data.path,
      url: urlData.publicUrl,
    }
  } catch (error: any) {
    throw new Error(error.message || 'Failed to upload photo')
  }
}

export async function deletePhoto(path: string) {
  try {
    const { error } = await supabase.storage
      .from('plant-photos')
      .remove([path])

    if (error) throw error
    return true
  } catch (error: any) {
    throw new Error(error.message || 'Failed to delete photo')
  }
}

export async function moveTempPhoto(tempPath: string, userId: string, plantId: string) {
  try {
    // Get the original file
    const { data: fileData, error: downloadError } = await supabase.storage
      .from('plant-photos')
      .download(tempPath)

    if (downloadError) throw downloadError

    // Upload to final location
    const fileName = tempPath.split('/').pop()
    const newPath = `${userId}/${plantId}/${fileName}`

    const { error: uploadError } = await supabase.storage
      .from('plant-photos')
      .upload(newPath, fileData, {
        cacheControl: '3600',
        upsert: false,
      })

    if (uploadError) throw uploadError

    // Delete temp file
    await deletePhoto(tempPath)

    // Get new URL
    const { data: urlData } = supabase.storage
      .from('plant-photos')
      .getPublicUrl(newPath)

    return {
      path: newPath,
      url: urlData.publicUrl,
    }
  } catch (error: any) {
    throw new Error(error.message || 'Failed to move photo')
  }
}
