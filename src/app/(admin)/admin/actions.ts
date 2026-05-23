'use server'

import { createClient } from '@/lib/supabase/server'
import { createAdminClient } from '@/lib/supabase/admin'
import { revalidatePath } from 'next/cache'
import { redirect } from 'next/navigation'

async function uploadToStorage(file: File, path: string): Promise<string> {
  const supabase = createAdminClient()
  const { error } = await supabase.storage.from('images').upload(path, file, { upsert: true })
  if (error) throw new Error(`Upload failed: ${error.message}`)
  const { data } = supabase.storage.from('images').getPublicUrl(path)
  return data.publicUrl
}

// ── Categories ─────────────────────────────────────────────────

export async function createCategory(formData: FormData) {
  const label = (formData.get('label') as string)?.trim()
  if (!label) return
  const slug = label.toLowerCase().replace(/[^a-z0-9]+/g, '_').replace(/^_|_$/g, '')
  const supabase = await createClient()
  const { error } = await supabase.from('categories').insert({ slug, label })
  if (error) throw new Error(error.message)
  revalidatePath('/admin/categories')
}

export async function deleteCategory(slug: string) {
  const supabase = await createClient()
  await supabase.from('categories').delete().eq('slug', slug)
  revalidatePath('/admin/categories')
}

// ── Collections ────────────────────────────────────────────────

export async function createCollection(formData: FormData) {
  const supabase = await createClient()

  let coverUrl: string | null = null
  const file = formData.get('cover_file') as File
  if (file && file.size > 0) {
    const ext = file.name.split('.').pop()
    coverUrl = await uploadToStorage(file, `collections/${crypto.randomUUID()}.${ext}`)
  }

  const { error } = await supabase.from('collections').insert({
    name: formData.get('name') as string,
    country: formData.get('country') as string,
    city: formData.get('city') as string,
    description: (formData.get('description') as string) || null,
    price_brl: parseFloat(formData.get('price_brl') as string) || 0,
    is_published: formData.get('is_published') === 'on',
    cover_image_url: coverUrl,
  })

  if (error) throw new Error(error.message)
  revalidatePath('/admin/collections')
  revalidatePath('/protected/map')
  revalidatePath('/protected/collections')
  redirect('/admin/collections')
}

export async function updateCollection(id: string, formData: FormData) {
  const supabase = await createClient()

  let coverUrl: string | null = (formData.get('current_cover') as string) || null
  const file = formData.get('cover_file') as File
  if (file && file.size > 0) {
    const ext = file.name.split('.').pop()
    coverUrl = await uploadToStorage(file, `collections/${id}.${ext}`)
  }

  const { error } = await supabase.from('collections').update({
    name: formData.get('name') as string,
    country: formData.get('country') as string,
    city: formData.get('city') as string,
    description: (formData.get('description') as string) || null,
    price_brl: parseFloat(formData.get('price_brl') as string) || 0,
    is_published: formData.get('is_published') === 'on',
    cover_image_url: coverUrl,
  }).eq('id', id)

  if (error) throw new Error(error.message)
  revalidatePath('/admin/collections')
  revalidatePath('/protected/map')
  revalidatePath('/protected/collections')
  redirect('/admin/collections')
}

export async function deleteCollection(id: string) {
  const supabase = await createClient()
  await supabase.from('collections').delete().eq('id', id)
  revalidatePath('/admin/collections')
  redirect('/admin/collections')
}

// ── Places ─────────────────────────────────────────────────────

export async function createPlace(formData: FormData) {
  const supabase = await createClient()

  let coverUrl: string | null = null
  const file = formData.get('cover_file') as File
  if (file && file.size > 0) {
    const ext = file.name.split('.').pop()
    coverUrl = await uploadToStorage(file, `places/${crypto.randomUUID()}.${ext}`)
  }

  const { data, error } = await supabase.from('places').insert({
    collection_id: (formData.get('collection_id') as string) || null,
    name: formData.get('name') as string,
    category: formData.get('category') as string,
    architect: (formData.get('architect') as string) || null,
    year_built: formData.get('year_built') ? parseInt(formData.get('year_built') as string) : null,
    latitude: parseFloat(formData.get('latitude') as string),
    longitude: parseFloat(formData.get('longitude') as string),
    description: (formData.get('description') as string) || null,
    is_published: formData.get('is_published') === 'on',
    cover_image_url: coverUrl,
  }).select('id').single()

  if (error) throw new Error(error.message)
  revalidatePath('/admin/places')
  revalidatePath('/map')
  redirect(`/admin/places/${data.id}/edit`)
}

export async function updatePlace(id: string, formData: FormData) {
  const supabase = createAdminClient()

  let coverUrl: string | null = (formData.get('current_cover') as string) || null
  const file = formData.get('cover_file') as File
  if (file && file.size > 0) {
    const ext = file.name.split('.').pop()
    coverUrl = await uploadToStorage(file, `places/${id}-cover.${ext}`)
  }

  const { error } = await supabase.from('places').update({
    collection_id: (formData.get('collection_id') as string) || null,
    name: formData.get('name') as string,
    category: formData.get('category') as string,
    architect: (formData.get('architect') as string) || null,
    year_built: formData.get('year_built') ? parseInt(formData.get('year_built') as string) : null,
    latitude: parseFloat(formData.get('latitude') as string),
    longitude: parseFloat(formData.get('longitude') as string),
    description: (formData.get('description') as string) || null,
    is_published: formData.get('is_published') === 'on',
    cover_image_url: coverUrl,
  }).eq('id', id)

  if (error) throw new Error(error.message)
  revalidatePath('/admin/places')
  revalidatePath('/map')
  redirect('/admin/places')
}

export async function deletePlace(id: string) {
  const supabase = await createClient()
  await supabase.from('places').delete().eq('id', id)
  revalidatePath('/admin/places')
  revalidatePath('/map')
  redirect('/admin/places')
}

// ── Facts ──────────────────────────────────────────────────────

export async function addFact(placeId: string, formData: FormData) {
  const content = (formData.get('content') as string)?.trim()
  if (!content) return
  const supabase = await createClient()
  const { data: existing } = await supabase
    .from('place_facts')
    .select('order_index')
    .eq('place_id', placeId)
    .order('order_index', { ascending: false })
    .limit(1)
  const nextIndex = (existing?.[0]?.order_index ?? -1) + 1
  await supabase.from('place_facts').insert({ place_id: placeId, content, order_index: nextIndex })
  revalidatePath(`/admin/places/${placeId}/edit`)
}

export async function deleteFact(factId: string, placeId: string) {
  const supabase = await createClient()
  await supabase.from('place_facts').delete().eq('id', factId)
  revalidatePath(`/admin/places/${placeId}/edit`)
}

// ── Place images ───────────────────────────────────────────────

export async function addPlaceImage(placeId: string, formData: FormData) {
  const file = formData.get('file') as File
  if (!file || file.size === 0) return
  const ext = file.name.split('.').pop()
  const url = await uploadToStorage(file, `places/${placeId}/${Date.now()}.${ext}`)
  const caption = (formData.get('caption') as string) || null
  const supabase = await createClient()
  const { data: existing } = await supabase
    .from('place_images')
    .select('order_index')
    .eq('place_id', placeId)
    .order('order_index', { ascending: false })
    .limit(1)
  const nextIndex = (existing?.[0]?.order_index ?? -1) + 1
  await supabase.from('place_images').insert({ place_id: placeId, url, caption, order_index: nextIndex })
  revalidatePath(`/admin/places/${placeId}/edit`)
}

export async function deletePlaceImage(imageId: string, placeId: string) {
  const supabase = await createClient()
  await supabase.from('place_images').delete().eq('id', imageId)
  revalidatePath(`/admin/places/${placeId}/edit`)
}

// ── Import ────────────────────────────────────────────────────

export async function batchCreatePlaces(
  collectionId: string | null,
  category: string,
  places: Array<{ name: string; latitude: number; longitude: number; description?: string; architect?: string; year_built?: number }>
) {
  const supabase = await createClient()

  const placesToInsert = places.map((place) => ({
    collection_id: collectionId || null,
    name: place.name,
    category,
    description: place.description || null,
    architect: place.architect || null,
    year_built: place.year_built || null,
    latitude: place.latitude,
    longitude: place.longitude,
    is_published: false,
  }))

  const { error } = await supabase.from('places').insert(placesToInsert)
  if (error) throw new Error(error.message)

  revalidatePath('/admin/places')
  revalidatePath('/map')
  redirect('/admin/places')
}

export async function togglePublishPlace(id: string) {
  const supabase = await createClient()
  const { data: place } = await supabase.from('places').select('is_published').eq('id', id).single()

  const { error } = await supabase.from('places').update({ is_published: !place?.is_published }).eq('id', id)
  if (error) throw new Error(error.message)

  revalidatePath('/admin/places')
  revalidatePath('/map')
}

export async function publishAllByCollection(collectionId: string) {
  const supabase = await createClient()
  const { error } = await supabase.from('places').update({ is_published: true }).eq('collection_id', collectionId)
  if (error) throw new Error(error.message)

  revalidatePath('/admin/places')
  revalidatePath('/map')
}

export async function batchPublishPlaces(placeIds: string[]) {
  const supabase = await createClient()
  const { error } = await supabase.from('places').update({ is_published: true }).in('id', placeIds)
  if (error) throw new Error(error.message)

  revalidatePath('/admin/places')
  revalidatePath('/map')
}

export async function batchDeletePlaces(placeIds: string[]) {
  const supabase = await createClient()
  const { error } = await supabase.from('places').delete().in('id', placeIds)
  if (error) throw new Error(error.message)

  revalidatePath('/admin/places')
  revalidatePath('/map')
}

// ── User access ────────────────────────────────────────────────

export async function grantCollectionAccess(userId: string, collectionId: string) {
  const supabase = await createClient()

  const { error } = await supabase.from('user_purchases').insert({
    user_id: userId,
    collection_id: collectionId,
  })

  if (error) throw new Error(error.message)
  revalidatePath('/admin/users')
  revalidatePath('/map')
  revalidatePath('/collections')
}

export async function revokeCollectionAccess(userId: string, collectionId: string) {
  const supabase = await createClient()

  const { error } = await supabase
    .from('user_purchases')
    .delete()
    .eq('user_id', userId)
    .eq('collection_id', collectionId)

  if (error) throw new Error(error.message)
  revalidatePath('/admin/users')
  revalidatePath('/map')
  revalidatePath('/collections')
}
