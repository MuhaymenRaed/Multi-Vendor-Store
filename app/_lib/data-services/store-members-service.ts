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
    .select("*, profiles(full_name, email, phone)")
    .eq("store_id", storeId)
    .order("created_at");
  if (error) throw new Error(error.message);
  return (data ?? []) as StoreMember[];
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
    .select("*, profiles(full_name, email, phone)")
    .single();
  if (error) throw new Error(error.message);
  return data as StoreMember;
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

/** Search profiles by email or name for member invitation. */
export async function searchProfiles(
  query: string,
): Promise<{ id: string; full_name: string; email: string }[]> {
  if (!query.trim() || query.trim().length < 2) return [];
  const { data, error } = await supabase
    .from("profiles")
    .select("id, full_name, email")
    .or(`email.ilike.%${query}%,full_name.ilike.%${query}%`)
    .neq("role", "admin")
    .limit(8);
  if (error) throw new Error(error.message);
  return data ?? [];
}
