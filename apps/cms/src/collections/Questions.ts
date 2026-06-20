import type { CollectionConfig } from 'payload'

import { adminOnly } from '@/access/adminOnly'
import { populateSlug } from './slug'

export const Questions: CollectionConfig = {
  slug: 'cms-questions',
  labels: {
    singular: 'Question',
    plural: 'Questions',
  },
  admin: {
    useAsTitle: 'title',
    defaultColumns: ['title', 'category', 'technology', 'difficulty', 'accessLevel', 'isActive', 'verified'],
  },
  access: {
    create: adminOnly,
    delete: adminOnly,
    read: adminOnly,
    update: adminOnly,
  },
  hooks: {
    beforeValidate: [populateSlug('title')],
  },
  fields: [
    { name: 'title', type: 'text', required: true },
    { name: 'slug', type: 'text', admin: { position: 'sidebar' }, index: true, required: true, unique: true },
    { name: 'excerpt', type: 'textarea' },
    { name: 'questionText', type: 'textarea', label: 'Question text', required: true },
    { name: 'answerText', type: 'textarea', label: 'Answer text' },
    { name: 'explanation', type: 'textarea' },
    {
      name: 'codeSnippet',
      type: 'code',
      admin: {
        language: 'typescript',
      },
      label: 'Code snippet',
    },
    {
      name: 'category',
      type: 'relationship',
      admin: { position: 'sidebar' },
      relationTo: 'cms-categories',
    },
    {
      name: 'technology',
      type: 'relationship',
      admin: { position: 'sidebar' },
      relationTo: 'cms-technologies',
    },
    {
      name: 'tags',
      type: 'relationship',
      hasMany: true,
      relationTo: 'cms-tags',
    },
    {
      name: 'difficulty',
      type: 'select',
      admin: { position: 'sidebar' },
      defaultValue: 'junior',
      options: [
        { label: 'Junior', value: 'junior' },
        { label: 'Middle', value: 'middle' },
        { label: 'Senior', value: 'senior' },
      ],
      required: true,
    },
    {
      name: 'questionType',
      type: 'select',
      admin: { position: 'sidebar' },
      defaultValue: 'theory',
      label: 'Question type',
      options: [
        { label: 'Theory', value: 'theory' },
        { label: 'Practical', value: 'practical' },
        { label: 'Code', value: 'code' },
        { label: 'System design', value: 'system_design' },
        { label: 'Troubleshooting', value: 'troubleshooting' },
      ],
      required: true,
    },
    {
      name: 'accessLevel',
      type: 'select',
      admin: { position: 'sidebar' },
      defaultValue: 'free',
      label: 'Access level',
      options: [
        { label: 'Free', value: 'free' },
        { label: 'Pro', value: 'pro' },
      ],
      required: true,
    },
    { name: 'isActive', type: 'checkbox', admin: { position: 'sidebar' }, defaultValue: true, label: 'Active' },
    { name: 'verified', type: 'checkbox', admin: { position: 'sidebar' }, defaultValue: false },
  ],
}
