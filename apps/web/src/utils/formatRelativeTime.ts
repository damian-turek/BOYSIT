/** Formats an ISO timestamp as a short relative string, e.g. "2h ago", "3d ago". */
export const formatRelativeTime = (iso: string): string => {
  const date = new Date(iso)
  if (Number.isNaN(date.getTime())) return ''

  const diffMs = Date.now() - date.getTime()
  const diffMinutes = Math.round(diffMs / 60000)

  if (diffMinutes < 1) return 'just now'
  if (diffMinutes < 60) return `${diffMinutes}m ago`

  const diffHours = Math.round(diffMinutes / 60)
  if (diffHours < 24) return `${diffHours}h ago`

  const diffDays = Math.round(diffHours / 24)
  if (diffDays < 30) return `${diffDays}d ago`

  const diffMonths = Math.round(diffDays / 30)
  return `${diffMonths}mo ago`
}
