export default function EventCardSkeleton() {
  return (
    <div className="rounded-[10px] shadow-[0px_4px_20px_0px_rgba(0,0,0,0.25)] overflow-hidden flex flex-col p-6 gap-4 animate-pulse bg-white">
      {/* Badges */}
      <div className="flex items-center gap-3">
        <div className="h-[32px] w-20 bg-gray-200 rounded-[3px]" />
        <div className="h-[32px] w-24 bg-gray-200 rounded-[3px]" />
      </div>
      {/* Title */}
      <div className="flex-1 space-y-2">
        <div className="h-5 bg-gray-200 rounded w-full" />
        <div className="h-5 bg-gray-200 rounded w-3/4" />
      </div>
      {/* When */}
      <div className="space-y-2">
        <div className="h-3 bg-gray-200 rounded w-12" />
        <div className="h-4 bg-gray-200 rounded w-2/3" />
        <div className="h-4 bg-gray-200 rounded w-1/2" />
      </div>
      {/* Footer */}
      <div className="border-t border-gray-100 pt-4 flex items-center justify-between">
        <div className="h-4 bg-gray-200 rounded w-36" />
        <div className="h-9 w-9 bg-gray-200 rounded-full" />
      </div>
    </div>
  )
}
