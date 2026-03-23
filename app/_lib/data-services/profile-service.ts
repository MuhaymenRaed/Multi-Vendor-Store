// utils/supabase/profile-actions.ts
import { supabase } from "../supabase/client";

/**
 * Fetches a user profile by ID
 */

export async function getProfile(id: string) {
  const { data, error } = await supabase
    .from("profiles")
    .select("*")
    .eq("id", id)
    .eq("is_deleted", false)
    .single();
  if (error) return null;
  return data;
}

/**
 * Updates or Inserts profile data
 */

export async function updateProfile(userId: string, updates: any) {
  const { data, error } = await supabase
    .from("profiles")
    .upsert({ id: userId, ...updates, updated_at: new Date().toISOString() })
    .select()
    .maybeSingle();
  if (error) throw new Error(error.message);
  return data;
}

/**
 * Fetches only the phone number for a specific owner
 */
export async function getOwnerPhone(ownerId: string) {
  const { data } = await supabase
    .from("profiles")
    .select("phone")
    .eq("id", ownerId)
    .single();

  return data?.phone || "";
}

/**
 * Handles the logic of deleting the old image and uploading a new one
 */
export async function uploadAvatar(
  userId: string,
  file: File,
  oldImageUrl?: string,
) {
  const bucket = "galary";

  try {
    // 1. List files inside the user's folder
    const { data: existingFiles, error: listError } = await supabase.storage
      .from(bucket)
      .list(userId);

    if (listError) {
      console.error("Supabase List Error (Check RLS Policies!):", listError);
    }

    // 2. Delete existing files (if any are found)
    if (existingFiles && existingFiles.length > 0) {
      // Supabase sometimes creates a hidden placeholder file for folders. We skip it.
      const filesToRemove = existingFiles
        .filter((x) => x.name !== ".emptyFolderPlaceholder")
        .map((x) => `${userId}/${x.name}`);

      if (filesToRemove.length > 0) {
        const { error: removeError } = await supabase.storage
          .from(bucket)
          .remove(filesToRemove);

        if (removeError) {
          console.error(
            "Supabase Remove Error (Check RLS Policies!):",
            removeError,
          );
        }
      }
    }

    // 3. Prepare the new file path
    const fileExt = file.name.split(".").pop();
    const fileName = `${Date.now()}.${fileExt}`;
    const filePath = `${userId}/${fileName}`;

    // 4. Upload the new file
    const { error: uploadError } = await supabase.storage
      .from(bucket)
      .upload(filePath, file, {
        cacheControl: "3600",
        upsert: true, // Changed to true to prevent upload collisions from crashing it
      });

    // If upload fails, throw it so the catch block handles it
    if (uploadError) throw uploadError;

    // 5. Get and return the Public URL
    const { data } = supabase.storage.from(bucket).getPublicUrl(filePath);
    return `${data.publicUrl}?t=${Date.now()}`;
  } catch (error) {
    // Catching all errors here prevents your UI from getting stuck in an infinite loop!
    console.error("Critical error in uploadAvatar:", error);
    throw error; // Rethrow so your UI component can show an error message
  }
}
