export default function ServiceCardSkeleton() {
  return (
    <div className="flex flex-col bg-white rounded-[12px] overflow-hidden shadow-[0_2px_16px_rgba(0,0,0,0.08)] animate-pulse">
      {/* Image */}
      <div className="h-[220px] w-full bg-gray-200" />
      {/* Body */}
      <div className="p-6 flex flex-col flex-1 gap-3">
        <div className="h-6 bg-gray-200 rounded w-4/5" />
        <div className="h-4 bg-gray-200 rounded w-2/5" />
        <div className="mt-auto pt-4 border-t border-gray-100">
          <div className="h-[45px] bg-gray-200 rounded-[50px] w-36" />
        </div>
      </div>
    </div>
  )
}
