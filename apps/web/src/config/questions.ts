import type { Level } from '@/types/question'
import {
  Infinity as InfinityIcon,
  ChartColumn,
  CircleCheck,
  CodeXml,
  Component,
  Cpu,
  Database,
  Globe,
  Layers,
  type LucideIcon,
  Server,
  Shield,
  Terminal as TerminalIcon,
  Variable,
  Zap,
} from 'lucide-react'

export type FilterItem = {
  id: string
  name: string
  slug: string
}

export const SENIORITY_OPTIONS = ['All levels', 'Junior', 'Middle', 'Senior'] as const

export const ICON_MAP: Record<string, LucideIcon> = {
  'JavaScript/TypeScript': CodeXml,
  Security: Shield,
  'CSS & HTML': Globe,
  Algorithms: Cpu,
  Terminal: TerminalIcon,
  'System Design': Layers,
  Backend: Variable,
  Frontend: Component,
  Performance: Zap,
  Databases: Database,
  Testing: CircleCheck,
  Concurrency: ChartColumn,
  DevOps: InfinityIcon,
  Architecture: Server,
}

export const LEVEL_COLOR_MAP: Record<Level, string> = {
  Junior: 'bg-success-50/10 text-success-100 border-success-50/20 dark:text-emerald-300',
  Middle: 'bg-warning-50/10 text-warning-100 border-warning-50/20 dark:text-amber-300',
  Senior: 'bg-alert-50/10 text-alert-100 border-alert-50/20 dark:text-rose-300',
}

export const CATEGORY_THEMES: Record<string, string> = {
  'JavaScript/TypeScript': '#F0B100',
  Security: '#FF2056',
  Backend: '#16A34A',
  Frontend: '#D946EF',
  'CSS & HTML': '#00B8DB',
  Algorithms: '#2B7FFF',
  Databases: '#FF6900',
  Performance: '#FE9A00',
  Testing: '#00BBA7',
  Architecture: '#615FFF',
  Concurrency: '#F6339A',
  'System Design': '#AD46FF',
  DevOps: '#00BC7D',
  Terminal: '#00B8DB',
}
