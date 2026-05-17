export type UserRole = 'admin' | 'user'

export interface Profile {
  id: string
  email: string
  full_name: string | null
  role: UserRole
  created_at: string
}

export interface Collection {
  id: string
  name: string
  description: string | null
  country: string
  city: string
  cover_image_url: string | null
  price_brl: number
  stripe_price_id: string | null
  is_published: boolean
  created_at: string
  places?: Place[]
}

export interface Place {
  id: string
  collection_id: string
  name: string
  description: string | null
  architect: string | null
  year_built: number | null
  category: PlaceCategory
  latitude: number
  longitude: number
  cover_image_url: string | null
  is_published: boolean
  created_at: string
  images?: PlaceImage[]
  facts?: PlaceFact[]
  collection?: Collection
}

export type PlaceCategory =
  | 'art_installation'
  | 'bridge'
  | 'commercial'
  | 'landmark'
  | 'landscape'
  | 'museum'
  | 'office'
  | 'other'
  | 'public'
  | 'religious'
  | 'residential'

export interface PlaceImage {
  id: string
  place_id: string
  url: string
  caption: string | null
  order_index: number
}

export interface PlaceFact {
  id: string
  place_id: string
  content: string
  order_index: number
}

export interface UserPurchase {
  id: string
  user_id: string
  collection_id: string
  stripe_payment_intent_id: string | null
  created_at: string
  collection?: Collection
}
