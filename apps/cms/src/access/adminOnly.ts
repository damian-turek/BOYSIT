import type { Access, FieldAccess } from 'payload'

type PayloadUser = {
  role?: string | null
}

export const isAdminUser = (user: null | PayloadUser | undefined): boolean => user?.role === 'admin'

export const adminOnly: Access = ({ req }) => isAdminUser(req.user as PayloadUser | undefined)

export const denyDelete: Access = () => false

export const adminPanelOnly = ({ req }: Parameters<Access>[0]): boolean =>
  isAdminUser(req.user as PayloadUser | undefined)

export const adminFieldOnly: FieldAccess = ({ req }) => isAdminUser(req.user as PayloadUser | undefined)

export const firstUserOrAdmin: Access = async ({ req }) => {
  if (isAdminUser(req.user as PayloadUser | undefined)) {
    return true
  }

  const { totalDocs } = await req.payload.count({
    collection: 'cms-users',
    overrideAccess: true,
  })

  return totalDocs === 0
}
