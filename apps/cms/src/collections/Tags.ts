import type { CollectionConfig } from 'payload'

import { adminOnly } from '@/access/adminOnly'
import { populateSlug } from './slug'

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
    delete: adminOnly,
    read: adminOnly,
    update: adminOnly,
  },
  hooks: {
    beforeValidate: [populateSlug('name')],
  },
  fields: [
    { name: 'name', type: 'text', required: true, unique: true },
    { name: 'slug', type: 'text', admin: { position: 'sidebar' }, index: true, required: true, unique: true },
  ],
}
