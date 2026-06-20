import type { CollectionConfig } from 'payload'

import { adminOnly, denyDelete } from '@/access/adminOnly'
import { populateSlug, preventSlugChange } from './slug'

export const Tags: CollectionConfig = {
  slug: 'cms-tags',
  labels: {
    singular: 'Tag',
    plural: 'Tags',
  },
  admin: {
    useAsTitle: 'name',
    defaultColumns: ['name', 'slug'],
  },
  access: {
    create: adminOnly,
    delete: denyDelete,
    read: adminOnly,
    update: adminOnly,
  },
  hooks: {
    beforeChange: [preventSlugChange],
    beforeValidate: [populateSlug('name')],
  },
  fields: [
    { name: 'name', type: 'text', required: true, unique: true },
    { name: 'slug', type: 'text', admin: { position: 'sidebar' }, index: true, required: true, unique: true },
  ],
}
