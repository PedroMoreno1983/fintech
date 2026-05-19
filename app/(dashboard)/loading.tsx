function SkeletonBlock({ className }: { className: string }) {
  return <div className={`animate-pulse rounded-xl bg-gray-200/70 ${className}`} />;
}

export default function DashboardLoading() {
  return (
    <div className="mx-auto max-w-7xl space-y-6 p-4 lg:p-6">
      <div className="space-y-2">
        <SkeletonBlock className="h-8 w-52" />
        <SkeletonBlock className="h-4 w-40" />
      </div>

      <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">
        {Array.from({ length: 4 }).map((_, index) => (
          <div key={index} className="rounded-xl border border-gray-200 bg-white p-4 shadow-sm">
            <div className="flex items-start justify-between gap-3">
              <div className="space-y-2">
                <SkeletonBlock className="h-4 w-24" />
                <SkeletonBlock className="h-7 w-16" />
              </div>
              <SkeletonBlock className="h-10 w-10 rounded-xl" />
            </div>
          </div>
        ))}
      </div>

      <div className="rounded-xl border border-gray-200 bg-white p-5 shadow-sm">
        <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
          <div className="space-y-2">
            <SkeletonBlock className="h-4 w-32" />
            <SkeletonBlock className="h-4 w-72 max-w-full" />
            <SkeletonBlock className="h-3 w-60 max-w-full" />
          </div>
          <div className="flex gap-2">
            <SkeletonBlock className="h-10 w-40" />
            <SkeletonBlock className="h-10 w-32" />
          </div>
        </div>
      </div>

      <div className="grid gap-4 lg:grid-cols-2">
        {Array.from({ length: 2 }).map((_, index) => (
          <div key={index} className="rounded-xl border border-gray-200 bg-white p-5 shadow-sm">
            <div className="space-y-4">
              <SkeletonBlock className="h-5 w-40" />
              {Array.from({ length: 3 }).map((__, row) => (
                <div key={row} className="flex items-start gap-3">
                  <SkeletonBlock className="h-9 w-9 rounded-full" />
                  <div className="flex-1 space-y-2">
                    <SkeletonBlock className="h-4 w-48 max-w-full" />
                    <SkeletonBlock className="h-3 w-64 max-w-full" />
                  </div>
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>

      <div className="space-y-3">
        <SkeletonBlock className="h-4 w-28" />
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
          {Array.from({ length: 4 }).map((_, index) => (
            <div key={index} className="rounded-xl border border-gray-200 bg-white p-4 shadow-sm">
              <div className="flex flex-col items-center gap-3">
                <SkeletonBlock className="h-10 w-10 rounded-xl" />
                <SkeletonBlock className="h-3 w-20" />
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
