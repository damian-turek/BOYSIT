import { requestAuthenticatedApi } from '@/services/apiClient'
import type {
  JobApplication,
  JobApplicationInput,
  JobApplicationSort,
  JobApplicationStatus,
  JobApplicationStatusEvent,
  JobTechnology,
  JobTrackerStats,
  PaginationMeta,
} from '@/types/job-tracker'

type JobApplicationsResponse = {
  data: JobApplication[]
  meta: PaginationMeta
  stats: JobTrackerStats
}

type JobApplicationResponse = {
  data: JobApplication
}

type TechnologyOptionsResponse = {
  data: JobTechnology[]
}

type StatusEventsResponse = {
  data: JobApplicationStatusEvent[]
  meta: PaginationMeta
}

export type JobApplicationsQuery = {
  search?: string
  status?: JobApplicationStatus
  sort?: JobApplicationSort
  page?: number
  limit?: number
}

const jsonHeaders = { 'Content-Type': 'application/json' }

export const fetchJobApplications = async (
  query: JobApplicationsQuery,
  signal?: AbortSignal,
): Promise<JobApplicationsResponse> => {
  const params = new URLSearchParams()

  if (query.search) params.set('search', query.search)
  if (query.status) params.set('status', query.status)
  if (query.sort) params.set('sort', query.sort)
  if (query.page) params.set('page', String(query.page))
  if (query.limit) params.set('limit', String(query.limit))

  const response = await requestAuthenticatedApi(`/api/v1/job-applications?${params}`, { signal })
  return (await response.json()) as JobApplicationsResponse
}

export const fetchJobTechnologyOptions = async (signal?: AbortSignal): Promise<JobTechnology[]> => {
  const response = await requestAuthenticatedApi('/api/v1/job-applications/technology-options', {
    signal,
  })
  const body = (await response.json()) as TechnologyOptionsResponse
  return body.data
}

export const createJobApplication = async (input: JobApplicationInput): Promise<JobApplication> => {
  const response = await requestAuthenticatedApi('/api/v1/job-applications', {
    method: 'POST',
    headers: jsonHeaders,
    body: JSON.stringify(input),
  })
  const body = (await response.json()) as JobApplicationResponse
  return body.data
}

export const updateJobApplication = async (
  id: string,
  input: Partial<JobApplicationInput>,
): Promise<JobApplication> => {
  const response = await requestAuthenticatedApi(`/api/v1/job-applications/${id}`, {
    method: 'PATCH',
    headers: jsonHeaders,
    body: JSON.stringify(input),
  })
  const body = (await response.json()) as JobApplicationResponse
  return body.data
}

export const deleteJobApplication = async (id: string): Promise<void> => {
  await requestAuthenticatedApi(`/api/v1/job-applications/${id}`, { method: 'DELETE' })
}

export const fetchJobApplicationStatusEvents = async (
  id: string,
  page: number,
  signal?: AbortSignal,
): Promise<StatusEventsResponse> => {
  const response = await requestAuthenticatedApi(
    `/api/v1/job-applications/${id}/status-events?page=${page}&limit=20`,
    { signal },
  )
  return (await response.json()) as StatusEventsResponse
}
