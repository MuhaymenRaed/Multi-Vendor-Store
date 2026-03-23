// Safe for client components - only uses browser Supabase client
import { supabase } from "../supabase/client";

// @/app/_lib/data-services/auth-service.ts

export const verifyEmail = async (email: string, token: string) => {
  const { data, error } = await supabase.auth.verifyOtp({
    email,
    token,
    type: "signup",
  });

  if (error) throw new Error(error.message);
  return data;
};

// @/app/_lib/data-services/auth-service.ts

// @/app/_lib/data-services/auth-service.ts

export const signUp = async ({ email, password, fullName, role }: any) => {
  const { data, error } = await supabase.auth.signUp({
    email,
    password,
    options: {
      data: {
        full_name: fullName,
        role: role,
      },
      emailRedirectTo: `${window.location.origin}/login`,
    },
  });

  if (error) throw new Error(error.message);

  // Supabase returns a fake user with empty identities for already-registered emails
  if (data.user && data.user.identities?.length === 0) {
    throw new Error(
      "هذا البريد الإلكتروني مسجل بالفعل. يرجى تسجيل الدخول بدلاً من ذلك.",
    );
  }

  return data;
};
export async function signIn({ email, password }: any) {
  const { data, error } = await supabase.auth.signInWithPassword({
    email,
    password,
  });
  if (error) throw new Error(error.message);
  return data;
}

export async function signOut() {
  const { error } = await supabase.auth.signOut();
  if (error) throw new Error(error.message);
}

export async function getUser() {
  const {
    data: { user },
  } = await supabase.auth.getUser();
  return user;
}
