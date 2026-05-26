import { cn } from '@/lib/utils'

export function Spinner({ className }: { className?: string }) {
  return (
    <div
      className={cn(
        'w-6 h-6 border-3 border-current border-t-transparent rounded-full animate-spin',
        className
      )}
      style={{ borderWidth: 3 }}
    />
  )
}
