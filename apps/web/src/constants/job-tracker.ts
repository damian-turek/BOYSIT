import type { JobApplicationStatus, JobTrackerStatTone } from '@/types/job-tracker'

export const JOB_APPLICATION_STATUSES: JobApplicationStatus[] = [
  'wishlist',
  'applied',
  'phone_screen',
  'technical',
  'final_round',
  'offer',
  'rejected',
]

export const JOB_STATUS_CONFIG: Record<
  JobApplicationStatus,
  { className: string; dotClassName: string }
> = {
  wishlist: {
    className: 'border-gray-60/20 bg-gray-60/10 text-gray-60',
    dotClassName: 'bg-gray-60',
  },
  applied: {
    className: 'border-[#93C5FD] bg-[#DBEAFE] text-[#2563EB]',
    dotClassName: 'bg-[#2B7FFF]',
  },
  phone_screen: {
    className: 'border-[#C4B5FD] bg-[#EDE9FE] text-[#7C3AED]',
    dotClassName: 'bg-[#8B5CF6]',
  },
  technical: {
    className: 'border-[#FDBA74] bg-[#FFEDD5] text-[#EA580C]',
    dotClassName: 'bg-[#F59E0B]',
  },
  final_round: {
    className: 'border-[#FDBA74] bg-[#FFEDD5] text-[#F97316]',
    dotClassName: 'bg-[#F97316]',
  },
  offer: {
    className: 'border-[#A7F3D0] bg-[#D1FAE5] text-[#059669]',
    dotClassName: 'bg-[#10B981]',
  },
  rejected: {
    className: 'border-[#FDA4AF] bg-[#FFE4E6] text-[#E11D48]',
    dotClassName: 'bg-[#FB5A7A]',
  },
}

export const JOB_TRACKER_STATS: {
  id: Exclude<JobApplicationStatus, 'wishlist'>
  tone: JobTrackerStatTone
}[] = [
  { id: 'applied', tone: 'blue' },
  { id: 'phone_screen', tone: 'purple' },
  { id: 'technical', tone: 'amber' },
  { id: 'final_round', tone: 'orange' },
  { id: 'offer', tone: 'green' },
  { id: 'rejected', tone: 'rose' },
]
