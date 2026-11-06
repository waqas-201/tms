import { defineQuery } from 'next-sanity'

export const POSTS_QUERY = defineQuery(`
  *[_type == "post" && defined(slug.current)] | order(publishedAt desc) {
    _id,
    title,
    slug,
    excerpt,
    mainImage,
    publishedAt,
    author-> {
      _id,
      name,
      slug,
      image
    },
    categories[]-> {
      _id,
      title,
      slug
    }
  }
`)

export const POST_QUERY = defineQuery(`
  *[_type == "post" && slug.current == $slug][0] {
    _id,
    title,
    slug,
    excerpt,
    mainImage,
    publishedAt,
    body,
    author-> {
      _id,
      name,
      slug,
      image,
      bio
    },
    categories[]-> {
      _id,
      title,
      slug
    }
  }
`)

export const POST_SLUGS_QUERY = defineQuery(`
  *[_type == "post" && defined(slug.current)] {
    "slug": slug.current
  }
`)

export const ACTIVE_ANNOUNCEMENTS_QUERY = defineQuery(`
  *[_type == "announcement" && active == true] | order(_createdAt desc) {
    _id,
    title,
    message,
    priority,
    link
  }
`)

export const CATEGORIES_QUERY = defineQuery(`
  *[_type == "category"] | order(title asc) {
    _id,
    title,
    slug,
    description
  }
`)
