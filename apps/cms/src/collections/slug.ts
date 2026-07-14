import type { CollectionBeforeChangeHook, CollectionBeforeValidateHook } from 'payload'

const slugify = (value: string): string =>
  value
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/(^-|-$)+/g, '')

export const populateSlug =
  (sourceField: string): CollectionBeforeValidateHook =>
  ({ data }) => {
    if (!data || data.slug || typeof data[sourceField] !== 'string') {
      return data
    }

    return {
      ...data,
      slug: slugify(data[sourceField]),
    }
  }

export const preventSlugChange: CollectionBeforeChangeHook = ({ data, originalDoc }) => {
  if (!data || !originalDoc?.slug || !data.slug || data.slug === originalDoc.slug) {
    return data
  }

  throw new Error('Slug is immutable after creation. Create a new record or handle migration manually.')
}
