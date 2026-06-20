import type { CollectionBeforeValidateHook } from 'payload'

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
