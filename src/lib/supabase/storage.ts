import { createClient } from './client'

const BUCKET_NAME = 'memorial-media'

export async function uploadFile(
  file: File,
  path: string,
  userId: string,
  onProgress?: (progress: number) => void
): Promise<{ url: string; path: string }> {
  const supabase = createClient()

  const fileExt = file.name.split('.').pop()
  // Include userId in path for RLS policy: userId/category/timestamp.ext
  const fileName = `${userId}/${path}/${Date.now()}.${fileExt}`
  const filePath = fileName

  const { data, error } = await supabase.storage
    .from(BUCKET_NAME)
    .upload(filePath, file, {
      cacheControl: '3600',
      upsert: false,
    })

  if (error) {
    throw error
  }

  // Get public URL
  const { data: urlData } = supabase.storage
    .from(BUCKET_NAME)
    .getPublicUrl(data.path)

  return { url: urlData.publicUrl, path: data.path }
}

export async function deleteFile(path: string): Promise<void> {
  const supabase = createClient()

  const { error } = await supabase.storage
    .from(BUCKET_NAME)
    .remove([path])

  if (error) {
    throw error
  }
}

export function getPublicUrl(path: string): string {
  const supabase = createClient()
  const { data } = supabase.storage
    .from(BUCKET_NAME)
    .getPublicUrl(path)

  return data.publicUrl
}
