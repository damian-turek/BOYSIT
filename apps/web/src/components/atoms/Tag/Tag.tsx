import { cn } from '@/utils/cn'

export type TagProps = {
  text: string
  className?: string
  style?: React.CSSProperties
}

export const Tag = ({ text, className, style }: TagProps) => {
  return (
    <span
      style={style}
      className={cn(
        'px-2.5 py-0.5 rounded-md bg-surface-raised text-gray-60 border border-gray-10 label-font',
        className,
      )}
    >
      {text}
    </span>
  )
}
