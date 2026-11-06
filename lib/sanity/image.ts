import { createImageUrlBuilder } from '@sanity/image-url'
import { projectId, dataset } from './client'

const imageBuilder = createImageUrlBuilder({
  projectId: projectId || '',
  dataset: dataset || '',
})

export const urlFor = (source: Parameters<typeof imageBuilder.image>[0]) => {
  return imageBuilder.image(source)
}
