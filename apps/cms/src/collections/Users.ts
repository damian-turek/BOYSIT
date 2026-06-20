import type { CollectionConfig } from 'payload'

import { adminFieldOnly, adminOnly, adminPanelOnly, firstUserOrAdmin } from '@/access/adminOnly'

export const Users: CollectionConfig = {
  slug: 'cms-users',
  labels: {
    singular: 'Admin User',
    plural: 'Admin Users',
  },
  auth: true,
  admin: {
    useAsTitle: 'email',
    defaultColumns: ['email', 'role', 'createdAt'],
  },
  access: {
    admin: adminPanelOnly,
    create: firstUserOrAdmin,
    delete: adminOnly,
    read: adminOnly,
    update: adminOnly,
  },
  fields: [
    {
      name: 'role',
      type: 'select',
      access: {
        create: adminFieldOnly,
        update: adminFieldOnly,
      },
      defaultValue: 'admin',
      options: [{ label: 'Admin', value: 'admin' }],
      required: true,
    },
  ],
}
