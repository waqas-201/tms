import type { PortableTextBlock } from '@portabletext/react'

export interface SanityImageCrop {
  top?: number
  bottom?: number
  left?: number
  right?: number
}

export interface SanityImageHotspot {
  x?: number
  y?: number
  height?: number
  width?: number
}

export interface SanityImage {
  _type?: 'image'
  asset?: {
    _ref: string
    _type?: 'reference'
  }
  alt?: string
  caption?: string
  crop?: SanityImageCrop
  hotspot?: SanityImageHotspot
}

export interface SanityAuthor {
  _id: string
  name: string
  slug?: { current: string }
  image?: SanityImage | null
  bio?: string | null
}

export interface SanityCategory {
  _id: string
  title: string
  slug?: { current: string }
  description?: string | null
}

export interface SanityPost {
  _id: string
  title: string
  slug: { current: string }
  excerpt?: string | null
  mainImage?: SanityImage | null
  publishedAt?: string | null
  body?: PortableTextBlock[] | null
  author?: SanityAuthor | null
  categories?: SanityCategory[] | null
}

export interface SanityAnnouncement {
  _id: string
  title: string
  message: string
  priority?: 'normal' | 'info' | 'high'
  link?: string | null
  active?: boolean
}
