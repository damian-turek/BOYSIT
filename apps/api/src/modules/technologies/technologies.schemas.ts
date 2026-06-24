export type TechnologiesQuery = {
  categorySlug?: string
}

export const technologiesQuerySchema = {
  type: 'object',
  additionalProperties: false,
  properties: {
    categorySlug: {
      type: 'string',
      minLength: 1,
      maxLength: 100,
    },
  },
} as const
