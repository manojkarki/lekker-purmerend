'use client'

import { ClockIcon, TruckIcon } from '@heroicons/react/24/outline'
import { calculateETA } from '@lekker/utils'
import { useMemo } from 'react'

interface DeliveryEstimateProps {
  prepTimeHours: number
  cutoffTime: string
  className?: string
  showIcon?: boolean
  variant?: 'badge' | 'card' | 'inline'
}

export function DeliveryEstimate({ 
  prepTimeHours, 
  cutoffTime, 
  className = '',
  showIcon = true,
  variant = 'badge'
}: DeliveryEstimateProps) {
  const estimate = useMemo(() => {
    return calculateETA(prepTimeHours, cutoffTime)
  }, [prepTimeHours, cutoffTime])

  const baseClasses = {
    badge: 'inline-flex items-center gap-2 bg-green-50 border border-green-200 rounded-full px-3 py-1.5 text-sm font-medium text-green-900',
    card: 'flex items-center gap-3 bg-green-50 border border-green-200 rounded-lg p-4',
    inline: 'inline-flex items-center gap-2 text-green-700'
  }

  const iconClasses = {
    badge: 'w-4 h-4',
    card: 'w-5 h-5',
    inline: 'w-4 h-4'
  }

  return (
    <div className={`${baseClasses[variant]} ${className}`}>
      {showIcon && (
        <TruckIcon className={`${iconClasses[variant]} text-green-600`} />
      )}
      <div className="flex flex-col gap-0.5">
        <span className="font-semibold">
          {estimate.eta_label}
        </span>
        {estimate.eta_range && (
          <span className="text-xs opacity-90">
            {estimate.eta_range}
          </span>
        )}
      </div>
    </div>
  )
}

interface DeliveryBadgeProps {
  prepTimeHours: number
  cutoffTime: string
  className?: string
}

export function DeliveryBadge({ prepTimeHours, cutoffTime, className }: DeliveryBadgeProps) {
  return (
    <DeliveryEstimate
      prepTimeHours={prepTimeHours}
      cutoffTime={cutoffTime}
      variant="badge"
      className={className}
    />
  )
}

export function DeliveryCard({ prepTimeHours, cutoffTime, className }: DeliveryBadgeProps) {
  return (
    <DeliveryEstimate
      prepTimeHours={prepTimeHours}
      cutoffTime={cutoffTime}
      variant="card"
      className={className}
    />
  )
}