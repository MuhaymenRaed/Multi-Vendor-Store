// Safe for client components - only uses browser Supabase client
import { supabase } from "../supabase/client";

export async function getProducts(storeId?: string, categoryId?: number) {
  let query = supabase
    .from("products")
    .select("*, stores(name, logo_url)")
    .eq("is_deleted", false);

  if (storeId) query = query.eq("store_id", storeId);
  if (categoryId) query = query.eq("category_id", categoryId);

  const { data, error } = await query.order("created_at", { ascending: false });
  if (error) throw new Error("Products could not be loaded");
  return data;
}

export async function updateProduct(
  productId: string,
  payload: {
    name?: string;
    price?: number;
    description?: string;
    stock_quantity?: number;
    category_id?: number | null;
    image_url?: string;
  },
) {
  const { data, error } = await supabase
    .from("products")
    .update(payload)
    .eq("id", productId)
    .select(
      `
      *,
      categories ( name ),
      stores ( name )
    `,
    )
    .single();

  if (error) throw new Error(error.message);
  return data;
}

/**
 * Soft-delete a product by ID.
 * Throws if the operation fails.
 */
export async function deleteProduct(productId: string) {
  const { error } = await supabase
    .from("products")
    .update({ is_deleted: true })
    .eq("id", productId);

  if (error) throw new Error(error.message);
}

export async function getProduct(id: string) {
  const { data, error } = await supabase
    .from("products")
    .select("*, stores(*)")
    .eq("id", id)
    .eq("is_deleted", false)
    .single();
  if (error || !data) {
    throw new Error("Product not found");
  }
  return data;
}

export async function createProduct(productData: {
  name: string;
  price: number;
  description: string;
  store_id: string;
  image_url?: string;
  category_id?: number | null;
  stock_quantity?: number;
}) {
  const { data, error } = await supabase
    .from("products")
    .insert([productData])
    .select()
    .single();
  if (error) throw new Error(error.message);
  return data;
}

export async function uploadProductImage(
  storeId: string,
  file: File,
  productId?: string,
) {
  const bucket = "products";

  if (!file) return null;

  // IMPORTANT: The path must start with 'stores/' for our policy to work correctly.
  // When productId is known (edit flow) we nest under it so old images are cleaned up.
  const folderPath = productId
    ? `stores/${storeId}/${productId}`
    : `stores/${storeId}`;

  try {
    // 1. Cleanup old files in this specific folder (only when productId is known)
    if (productId) {
      const { data: existingFiles } = await supabase.storage
        .from(bucket)
        .list(folderPath);
      if (existingFiles && existingFiles.length > 0) {
        const filesToRemove = existingFiles.map(
          (x) => `${folderPath}/${x.name}`,
        );
        await supabase.storage.from(bucket).remove(filesToRemove);
      }
    }

    // 2. Prepare unique path
    const fileExt = file.name.split(".").pop();
    const filePath = `${folderPath}/${Date.now()}.${fileExt}`;

    // 3. Upload
    const { error: uploadError } = await supabase.storage
      .from(bucket)
      .upload(filePath, file, { cacheControl: "3600", upsert: true });

    if (uploadError) throw uploadError;

    const { data } = supabase.storage.from(bucket).getPublicUrl(filePath);
    return `${data.publicUrl}?t=${Date.now()}`;
  } catch (error) {
    console.error("Upload error:", error);
    throw error;
  }
}
