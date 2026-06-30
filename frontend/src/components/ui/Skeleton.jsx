import { classNames } from '@/utils/formatters'

export function Skeleton({ className = '', ...props }) {
  return (
    <div
      className={classNames('animate-pulse bg-gray-200 rounded-lg', className)}
      {...props}
    />
  )
}

export function SkeletonCard() {
  return (
    <div className="bg-white rounded-2xl shadow-card p-6 space-y-3">
      <Skeleton className="h-4 w-1/3" />
      <Skeleton className="h-8 w-1/2" />
      <Skeleton className="h-3 w-1/4" />
    </div>
  )
}
