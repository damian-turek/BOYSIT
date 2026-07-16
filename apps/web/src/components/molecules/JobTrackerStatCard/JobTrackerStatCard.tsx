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

type JobTrackerStatCardProps = {
  label: string
  value: number
  tone: JobTrackerStatTone
}

export type JobTrackerStatTone = 'blue' | 'purple' | 'amber' | 'orange' | 'green' | 'rose'

const toneClassName: Record<
  JobTrackerStatTone,
  { card: string; icon: string; iconBackground: string; indicator: string }
> = {
  blue: {
    card: 'bg-[#EFF6FF] border-[#BFDBFE]',
    icon: 'text-[#2563EB]',
    iconBackground: 'bg-[#DBEAFE]',
    indicator: 'bg-[#2B7FFF]',
  },
  purple: {
    card: 'bg-[#F5F3FF] border-[#DDD6FE]',
    icon: 'text-[#7C3AED]',
    iconBackground: 'bg-[#EDE9FE]',
    indicator: 'bg-[#8B5CF6]',
  },
  amber: {
    card: 'bg-[#FFFBEB] border-[#FDE68A]',
    icon: 'text-[#D97706]',
    iconBackground: 'bg-[#FEF3C7]',
    indicator: 'bg-[#F59E0B]',
  },
  orange: {
    card: 'bg-[#FFF7ED] border-[#FED7AA]',
    icon: 'text-[#EA580C]',
    iconBackground: 'bg-[#FFEDD5]',
    indicator: 'bg-[#F97316]',
  },
  green: {
    card: 'bg-[#ECFDF5] border-[#A7F3D0]',
    icon: 'text-[#059669]',
    iconBackground: 'bg-[#D1FAE5]',
    indicator: 'bg-[#10B981]',
  },
  rose: {
    card: 'bg-[#FFF1F2] border-[#FECDD3]',
    icon: 'text-[#E11D48]',
    iconBackground: 'bg-[#FFE4E6]',
    indicator: 'bg-[#FB5A7A]',
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
