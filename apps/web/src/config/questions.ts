import { Level } from '@/types/question'
import {
  Infinity,
  ChartColumn,
  CircleCheck,
  CodeXml,
  Component,
  Cpu,
  Database,
  Globe,
  HelpCircle,
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
  DevOps: Infinity,
  Architecture: Server,
}

export const LEVEL_COLOR_MAP: Record<Level, string> = {
  Junior: 'bg-success-50/15 text-success-50 border-success-50/30',
  Middle: 'bg-warning-50/15 text-warning-50 border-warning-50/30',
  Senior: 'bg-alert-50/15 text-alert-50 border-alert-50/30',
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
