export type JobApplicationStatus =
  | 'wishlist'
  | 'applied'
  | 'phone_screen'
  | 'technical'
  | 'final_round'
  | 'offer'
  | 'rejected'

export type JobApplicationSort = 'updated_desc' | 'applied_desc' | 'follow_up_asc' | 'company_asc'

export type JobApplicationFollowUpFilter = 'overdue' | 'today' | 'next_7_days' | 'none'

export type JobTrackerStatTone = 'blue' | 'purple' | 'amber' | 'orange' | 'green' | 'rose'

export type JobTechnology = {
  id: string
  name: string
  slug: string
}

export type JobApplication = {
  id: string
  company: string
  role: string
  location: string | null
  status: JobApplicationStatus
  salary: string | null
  appliedAt: string | null
  followUpAt: string | null
  jobUrl: string | null
  note: string | null
  technologies: JobTechnology[]
  customTechnologies: string[]
  createdAt: string
  updatedAt: string
}

export type JobApplicationStatusEvent = {
  id: string
  fromStatus: JobApplicationStatus | null
  toStatus: JobApplicationStatus
  createdAt: string
}

export type JobApplicationInput = {
  company: string
  role: string
  location?: string | null
  salary?: string | null
  jobUrl?: string | null
  status?: JobApplicationStatus
  note?: string | null
  appliedAt?: string | null
  followUpAt?: string | null
  technologyIds?: string[]
  customTechnologies?: string[]
}

export type JobTrackerStats = Record<JobApplicationStatus, number>

export type PaginationMeta = {
  page: number
  limit: number
  total: number
  totalPages: number
}
