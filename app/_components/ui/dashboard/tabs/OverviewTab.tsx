import { StatCard } from "../components/Statcard";

// Define the shape of the data based on your data.ts fetcher
interface OverviewTabProps {
  data: {
    statsData: any[];
    usersData: any[];
    storesData: any[];
  };
}

export function OverviewTab({ data }: OverviewTabProps) {
  // Destructure the live data passed from the parent
  const { statsData, usersData, storesData } = data;

  return (
    <>
      {/* 1. Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-6 mb-8">
        {statsData.map((stat, index) => (
          <StatCard key={stat.label} stat={stat} index={index} />
        ))}
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
        {/* 2. Recent Users */}
        <div className="border border-border rounded-xl p-6 transition-colors duration-300 bg-marketplace-card shadow-sm">
          <h2 className="text-xl font-semibold mb-4 text-marketplace-text-primary">
            المستخدمون الجدد
          </h2>
          <div className="space-y-3">
            {usersData.slice(0, 4).map((user) => (
              <div
                key={user.id}
                className="flex items-center justify-between p-3 rounded-lg transition-colors bg-marketplace-bg hover:bg-marketplace-card-hover"
              >
                <div>
                  <div className="font-semibold text-marketplace-text-primary">
                    {user.name}
                  </div>
                  <div className="text-sm text-marketplace-text-secondary">
                    {user.email}
                  </div>
                </div>
                <div className="flex flex-col items-end gap-1">
                  <div
                    className={`px-3 py-1 rounded-full text-xs ${
                      user.status === "نشط"
                        ? "bg-green-500/20 text-green-500"
                        : "bg-muted text-muted-foreground"
                    }`}
                  >
                    {user.status}
                  </div>
                  <span className="text-[10px] text-marketplace-text-secondary">
                    {user.joined}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* 3. Top Stores */}
        <div className="border border-border rounded-xl p-6 transition-colors duration-300 bg-marketplace-card shadow-sm">
          <h2 className="text-xl font-semibold mb-4 text-marketplace-text-primary">
            أفضل المتاجر
          </h2>
          <div className="space-y-3">
            {storesData.slice(0, 4).map((store) => (
              <div
                key={store.id}
                className="flex items-center justify-between p-3 rounded-lg transition-colors bg-marketplace-bg hover:bg-marketplace-card-hover"
              >
                <div>
                  <div className="font-semibold text-marketplace-text-primary">
                    {store.name}
                  </div>
                  <div className="text-sm text-marketplace-text-secondary">
                    {store.products} منتج •{" "}
                    <span className="text-xs opacity-70">{store.dealer}</span>
                  </div>
                </div>
                <div className="text-marketplace-accent font-bold">
                  {store.revenue}
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </>
  );
}
