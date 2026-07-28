import {
  CheckCircle2,
  CircleDashed,
  CircleX,
  FileCheck2,
  MessagesSquare,
  Trophy,
  type LucideIcon,
} from 'lucide-react'
import { motion } from 'motion/react'

import type { JobTrackerStatTone } from '@/types/job-tracker'

type JobTrackerStatCardProps = {
  label: string
  value: number
  tone: JobTrackerStatTone
}

const toneClassName: Record<
  JobTrackerStatTone,
  { card: string; icon: string; iconBackground: string; indicator: string }
> = {
  blue: {
    card: 'border-[#BFDBFE] bg-[#EFF6FF] dark:border-[#60A5FA]/35 dark:bg-[#2563EB]/15',
    icon: 'text-[#2563EB] dark:text-[#93C5FD]',
    iconBackground: 'bg-[#DBEAFE] dark:bg-[#2563EB]/25',
    indicator: 'bg-[#2B7FFF] dark:bg-[#60A5FA]',
  },
  purple: {
    card: 'border-[#DDD6FE] bg-[#F5F3FF] dark:border-[#C4B5FD]/35 dark:bg-[#7C3AED]/15',
    icon: 'text-[#7C3AED] dark:text-[#C4B5FD]',
    iconBackground: 'bg-[#EDE9FE] dark:bg-[#7C3AED]/25',
    indicator: 'bg-[#8B5CF6] dark:bg-[#C4B5FD]',
  },
  amber: {
    card: 'border-[#FDE68A] bg-[#FFFBEB] dark:border-[#FDBA74]/35 dark:bg-[#F59E0B]/15',
    icon: 'text-[#D97706] dark:text-[#FDBA74]',
    iconBackground: 'bg-[#FEF3C7] dark:bg-[#F59E0B]/25',
    indicator: 'bg-[#F59E0B] dark:bg-[#FDBA74]',
  },
  orange: {
    card: 'border-[#FED7AA] bg-[#FFF7ED] dark:border-[#FDBA74]/35 dark:bg-[#F97316]/15',
    icon: 'text-[#EA580C] dark:text-[#FDBA74]',
    iconBackground: 'bg-[#FFEDD5] dark:bg-[#F97316]/25',
    indicator: 'bg-[#F97316] dark:bg-[#FDBA74]',
  },
  green: {
    card: 'border-[#A7F3D0] bg-[#ECFDF5] dark:border-[#6EE7B7]/35 dark:bg-[#10B981]/15',
    icon: 'text-[#059669] dark:text-[#6EE7B7]',
    iconBackground: 'bg-[#D1FAE5] dark:bg-[#10B981]/25',
    indicator: 'bg-[#10B981] dark:bg-[#6EE7B7]',
  },
  rose: {
    card: 'border-[#FECDD3] bg-[#FFF1F2] dark:border-[#FDA4AF]/35 dark:bg-[#E11D48]/15',
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

export const JobTrackerStatCard = ({
  label,
  value,
  tone,
}: JobTrackerStatCardProps) => {
  const toneClasses = toneClassName[tone]
  const Icon = toneIconMap[tone]

  return (
    <motion.section
      whileHover={{ y: -2 }}
      transition={{ duration: 0.18, ease: 'easeOut' }}
      className={`relative flex min-h-[86px] overflow-hidden rounded-xl border p-3 ${toneClasses.card}`}
    >
      <span
        className={`absolute right-3 top-3 size-1.5 rounded-full ${toneClasses.indicator}`}
      />
      <div className="flex min-w-0 flex-1 items-center gap-3">
        <span
          className={`flex size-10 shrink-0 items-center justify-center rounded-xl ${toneClasses.iconBackground}`}
        >
          <Icon size={18} className={toneClasses.icon} aria-hidden="true" />
        </span>
        <div className="min-w-0">
          <p className="text-[20px] leading-6 font-bold text-gray-100">{value}</p>
          <p className="body-small truncate font-semibold text-gray-60">{label}</p>
        </div>
      </div>
    </motion.section>
  )
}
