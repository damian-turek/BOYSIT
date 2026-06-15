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
        'px-3 py-1 rounded-full bg-primary/15 text-primary border border-primary/30 label-font visual-style',
        className,
      )}
    >
      {text}
    </span>
  )
}
