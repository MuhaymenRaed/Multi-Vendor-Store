import { getStorePageData } from "@/app/_lib/data-service";
import StoreClientWrapper from "@/app/_components/ui/store/StoreClientWrapper";
import { notFound } from "next/navigation";

// Notice: params is now treated as a Promise
export default async function Page({
  params,
}: {
  params: Promise<{ storeId: string }>;
}) {
  // 1. Await the params to get the actual storeId
  const resolvedParams = await params;
  const storeId = resolvedParams.storeId;

  // 2. Fetch the data using your service
  const { store, products } = await getStorePageData(storeId);

  // 3. Handle the 'not found' case elegantly
  if (!store) {
    notFound();
  }

  return <StoreClientWrapper store={store} initialProducts={products} />;
}
