export type JobApplicationStatus =
  | 'wishlist'
  | 'applied'
  | 'phone_screen'
  | 'technical'
  | 'final_round'
  | 'offer'
  | 'rejected'

export type JobTrackerStatTone = 'blue' | 'purple' | 'amber' | 'orange' | 'green' | 'rose'

export type JobApplication = {
  id: number
  company: string
  role: string
  location: string
  status: JobApplicationStatus
  salary: string
  date: string
  jobUrl: string
  note: string
  technologies: string[]
}
