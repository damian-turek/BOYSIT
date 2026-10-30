import type { JobTrackerStatTone } from '@/types/job-tracker'
import {
  CheckCircle2,
  CircleDashed,
  CircleX,
  FileCheck2,
  type LucideIcon,
  MessagesSquare,
  Trophy,
} from 'lucide-react'

type JobTrackerStatCardProps = {
  label: string
  value: number
  tone: JobTrackerStatTone
}

const toneClassName: Record<
  JobTrackerStatTone,
  { icon: string; iconBackground: string; indicator: string }
> = {
  blue: {
    icon: 'text-[#2563EB] dark:text-[#93C5FD]',
    iconBackground: 'bg-[#DBEAFE] dark:bg-[#2563EB]/25',
    indicator: 'bg-[#2B7FFF] dark:bg-[#60A5FA]',
  },
  purple: {
    icon: 'text-[#7C3AED] dark:text-[#C4B5FD]',
    iconBackground: 'bg-[#EDE9FE] dark:bg-[#7C3AED]/25',
    indicator: 'bg-[#8B5CF6] dark:bg-[#C4B5FD]',
  },
  amber: {
    icon: 'text-[#D97706] dark:text-[#FDBA74]',
    iconBackground: 'bg-[#FEF3C7] dark:bg-[#F59E0B]/25',
    indicator: 'bg-[#F59E0B] dark:bg-[#FDBA74]',
  },
  orange: {
    icon: 'text-[#EA580C] dark:text-[#FDBA74]',
    iconBackground: 'bg-[#FFEDD5] dark:bg-[#F97316]/25',
    indicator: 'bg-[#F97316] dark:bg-[#FDBA74]',
  },
  green: {
    icon: 'text-[#059669] dark:text-[#6EE7B7]',
    iconBackground: 'bg-[#D1FAE5] dark:bg-[#10B981]/25',
    indicator: 'bg-[#10B981] dark:bg-[#6EE7B7]',
  },
  rose: {
    icon: 'text-[#E11D48] dark:text-[#FDA4AF]',
    iconBackground: 'bg-[#FFE4E6] dark:bg-[#E11D48]/25',
    indicator: 'bg-[#FB5A7A] dark:bg-[#FDA4AF]',
  },
} as const

const toneIconMap: Record<JobTrackerStatTone, LucideIcon> = {
  blue: FileCheck2,
  purple: MessagesSquare,
  amber: CircleDashed,
  orange: CheckCircle2,
  green: Trophy,
  rose: CircleX,
}

export const JobTrackerStatCard = ({ label, value, tone }: JobTrackerStatCardProps) => {
  const toneClasses = toneClassName[tone]
  const Icon = toneIconMap[tone]

  return (
    <section className="surface-card relative flex min-h-[86px] overflow-hidden p-3">
      <span className={`absolute right-3 top-3 size-1.5 rounded-full ${toneClasses.indicator}`} />
      <div className="flex min-w-0 flex-1 items-center gap-3">
        <span
          className={`flex size-10 shrink-0 items-center justify-center rounded-xl ${toneClasses.iconBackground}`}
        >
          <Icon size={18} className={toneClasses.icon} aria-hidden="true" />
        </span>
        <div className="min-w-0">
          <p className="text-[20px] leading-6 font-bold text-gray-100 tabular-nums">{value}</p>
          <p className="body-small truncate font-semibold text-gray-60">{label}</p>
        </div>
      </div>
    </section>
  )
}
