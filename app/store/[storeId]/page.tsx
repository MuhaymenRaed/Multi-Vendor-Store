import { notFound } from "next/navigation";
import { getStorePageData } from "@/app/_lib/data-service";
import { StoreClientWrapper } from "@/app/_components/ui/store/StoreClientWrapper";
import Link from "next/link";

interface PageProps {
  params: Promise<{ storeId: string }>;
}

export default async function StorePage({ params }: PageProps) {
  // 1. Await params (Next.js 15 requirement)
  const { storeId } = await params;

  // 2. Fetch data from Supabase
  const { store, products } = await getStorePageData(storeId);

  // 3. Handle 404 if store doesn't exist
  if (!store) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-marketplace-bg">
        <p className="text-marketplace-text-primary mb-4 text-xl font-semibold">
          المتجر غير موجود
        </p>
        <Link
          href="/"
          className="text-marketplace-accent underline hover:text-marketplace-accent/80 transition-colors"
        >
          العودة للرئيسية
        </Link>
      </div>
    );
  }

  // 4. Pass data to the interactive Client Component
  return <StoreClientWrapper store={store} initialProducts={products} />;
}
