'use client'

import { InputHTMLAttributes, forwardRef } from 'react'
import { cn } from '@/lib/utils'

interface InputProps extends InputHTMLAttributes<HTMLInputElement> {
  label?: string
  error?: string
}

export const Input = forwardRef<HTMLInputElement, InputProps>(
  ({ className, label, error, id, ...props }, ref) => {
    return (
      <div className="flex flex-col gap-1.5">
        {label && (
          <label htmlFor={id} className="text-sm font-medium text-[#475569]">
            {label}
          </label>
        )}
        <input
          ref={ref}
          id={id}
          className={cn(
            'w-full px-4 py-3 rounded-xl border-2 bg-white text-[#1E293B] placeholder:text-[#94A3B8] transition-colors duration-200',
            'focus:outline-none focus:border-[#5ECEB8]',
            error ? 'border-[#FF6B6B]' : 'border-[#E2E8F0]',
            className
          )}
          {...props}
        />
        {error && <p className="text-sm text-[#FF6B6B]">{error}</p>}
      </div>
    )
  }
)

Input.displayName = 'Input'
