export default function DashboardLoadingSkeleton() {
  return (
    <main className="mr-64 p-8" dir="rtl">
      <div className="max-w-7xl mx-auto space-y-8">
        <div className="h-10 w-64 bg-marketplace-card rounded-md animate-pulse" />
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          <div className="h-32 bg-marketplace-card rounded-xl animate-pulse" />
          <div className="h-32 bg-marketplace-card rounded-xl animate-pulse" />
          <div className="h-32 bg-marketplace-card rounded-xl animate-pulse" />
          <div className="h-32 bg-marketplace-card rounded-xl animate-pulse" />
        </div>
        <div className="h-96 bg-marketplace-card rounded-xl animate-pulse" />
      </div>
    </main>
  );
}
