import type { CollectionConfig } from 'payload'

import { adminOnly, denyDelete } from '@/access/adminOnly'
import { populateSlug, preventSlugChange } from './slug'

export const Technologies: CollectionConfig = {
  slug: 'cms-technologies',
  labels: {
    singular: 'Technology',
    plural: 'Technologies',
  },
  admin: {
    useAsTitle: 'name',
    defaultColumns: ['name', 'category', 'slug', 'isActive'],
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
    {
      name: 'category',
      type: 'relationship',
      admin: { position: 'sidebar' },
      relationTo: 'cms-categories',
    },
    { name: 'description', type: 'textarea' },
    { name: 'isActive', type: 'checkbox', admin: { position: 'sidebar' }, defaultValue: true, label: 'Active' },
  ],
}
