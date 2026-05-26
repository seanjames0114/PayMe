'use client'

import { ButtonHTMLAttributes, forwardRef } from 'react'
import { cn } from '@/lib/utils'

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'ghost' | 'danger'
  size?: 'sm' | 'md' | 'lg'
}

export const Button = forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant = 'primary', size = 'md', children, ...props }, ref) => {
    return (
      <button
        ref={ref}
        className={cn(
          'inline-flex items-center justify-center font-semibold rounded-2xl transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed active:scale-95',
          {
            'bg-[#5ECEB8] text-white hover:bg-[#4ab8a4] focus:ring-[#5ECEB8]': variant === 'primary',
            'bg-white text-[#1E293B] border-2 border-[#E2E8F0] hover:border-[#5ECEB8] hover:text-[#5ECEB8] focus:ring-[#5ECEB8]': variant === 'secondary',
            'bg-transparent text-[#64748B] hover:text-[#1E293B] hover:bg-[#F1F5F9] focus:ring-[#5ECEB8]': variant === 'ghost',
            'bg-[#FF6B6B] text-white hover:bg-[#e05a5a] focus:ring-[#FF6B6B]': variant === 'danger',
          },
          {
            'text-sm px-4 py-2 gap-1.5': size === 'sm',
            'text-base px-6 py-3 gap-2': size === 'md',
            'text-lg px-8 py-4 gap-2': size === 'lg',
          },
          className
        )}
        {...props}
      >
        {children}
      </button>
    )
  }
)

Button.displayName = 'Button'
