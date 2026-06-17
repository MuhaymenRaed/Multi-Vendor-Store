// Server Component - safe to use createServerSupabase here
import StoreClientWrapper from "@/app/_components/ui/store/StoreClientWrapper";
import { getStorePageData } from "@/app/_lib/data-services/dashboard-service";
import { notFound } from "next/navigation";

export default async function Page({
  params,
}: {
  params: Promise<{ storeId: string }>;
}) {
  const { storeId } = await params;
  const { store, products, discounts } = await getStorePageData(storeId);

  if (!store) notFound();

  return (
    <StoreClientWrapper
      store={store}
      initialProducts={products || []}
      initialDiscounts={discounts || []}
    />
  );
}
