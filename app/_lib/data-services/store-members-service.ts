import { supabase } from "../supabase/client";

export type StoreMemberRole = "co_owner" | "assistant";

export interface StoreMember {
  id: string;
  store_id: string;
  user_id: string;
  role: StoreMemberRole;
  added_by: string | null;
  created_at: string;
  profiles?: { full_name: string; email: string; phone?: string } | null;
}

export async function getStoreMembers(storeId: string): Promise<StoreMember[]> {
  const { data, error } = await supabase
    .from("store_members")
    .select("*, profiles!user_id(full_name, email, phone)")
    .eq("store_id", storeId)
    .order("created_at");
  if (error) throw new Error(error.message);
  // Normalise: the joined relation key will match the hint name
  return (data ?? []).map((row: any) => ({
    ...row,
    profiles: row["profiles!user_id"] ?? row.profiles ?? null,
  })) as StoreMember[];
}

export async function addStoreMember(
  storeId: string,
  userId: string,
  role: StoreMemberRole,
  addedBy: string,
): Promise<StoreMember> {
  const { data, error } = await supabase
    .from("store_members")
    .insert([{ store_id: storeId, user_id: userId, role, added_by: addedBy }])
    .select("*, profiles!user_id(full_name, email, phone)")
    .single();
  if (error) throw new Error(error.message);
  const row = data as any;
  return {
    ...row,
    profiles: row["profiles!user_id"] ?? row.profiles ?? null,
  } as StoreMember;
}

export async function removeStoreMember(memberId: string): Promise<void> {
  const { error } = await supabase
    .from("store_members")
    .delete()
    .eq("id", memberId);
  if (error) throw new Error(error.message);
}

export async function updateStoreMemberRole(
  memberId: string,
  role: StoreMemberRole,
): Promise<void> {
  const { error } = await supabase
    .from("store_members")
    .update({ role })
    .eq("id", memberId);
  if (error) throw new Error(error.message);
}

/** Check if a given userId is a member (co_owner/assistant) of a store. */
export async function isStoreMember(
  storeId: string,
  userId: string,
): Promise<boolean> {
  const { data } = await supabase
    .from("store_members")
    .select("id")
    .eq("store_id", storeId)
    .eq("user_id", userId)
    .maybeSingle();
  return !!data;
}

/** Search profiles by name/email. Pass empty string to get recent users. */
export async function searchProfiles(
  query: string,
): Promise<{ id: string; full_name: string; email: string }[]> {
  const q = query.trim();
  let builder = supabase
    .from("profiles")
    .select("id, full_name, email")
    .order("created_at", { ascending: false })
    .limit(8);

  if (q) {
    builder = builder.or(`full_name.ilike.%${q}%,email.ilike.%${q}%`);
  }

  const { data, error } = await builder;
  if (error) throw new Error(error.message);
  return data ?? [];
}
