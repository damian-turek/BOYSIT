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
    className:
      'border-gray-60/20 bg-gray-60/10 text-gray-60 dark:border-gray-60/30 dark:bg-gray-60/15',
    dotClassName: 'bg-gray-60',
  },
  applied: {
    className:
      'border-[#93C5FD] bg-[#DBEAFE] text-[#2563EB] dark:border-[#60A5FA]/35 dark:bg-[#2563EB]/15 dark:text-[#93C5FD]',
    dotClassName: 'bg-[#2B7FFF]',
  },
  phone_screen: {
    className:
      'border-[#C4B5FD] bg-[#EDE9FE] text-[#7C3AED] dark:border-[#C4B5FD]/35 dark:bg-[#7C3AED]/15 dark:text-[#C4B5FD]',
    dotClassName: 'bg-[#8B5CF6]',
  },
  technical: {
    className:
      'border-[#FDBA74] bg-[#FFEDD5] text-[#EA580C] dark:border-[#FDBA74]/35 dark:bg-[#F59E0B]/15 dark:text-[#FDBA74]',
    dotClassName: 'bg-[#F59E0B]',
  },
  final_round: {
    className:
      'border-[#FDBA74] bg-[#FFEDD5] text-[#F97316] dark:border-[#FDBA74]/35 dark:bg-[#F97316]/15 dark:text-[#FDBA74]',
    dotClassName: 'bg-[#F97316]',
  },
  offer: {
    className:
      'border-[#A7F3D0] bg-[#D1FAE5] text-[#059669] dark:border-[#6EE7B7]/35 dark:bg-[#10B981]/15 dark:text-[#6EE7B7]',
    dotClassName: 'bg-[#10B981]',
  },
  rejected: {
    className:
      'border-[#FDA4AF] bg-[#FFE4E6] text-[#E11D48] dark:border-[#FDA4AF]/35 dark:bg-[#E11D48]/15 dark:text-[#FDA4AF]',
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
