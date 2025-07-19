import { createClient } from "@supabase/supabase-js";

// Get environment variables with validation
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
const supabaseServiceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

// Validate required environment variables
if (!supabaseUrl || !supabaseAnonKey) {
  console.error("Missing required Supabase environment variables");
}

// Create a Supabase client
export const supabase = createClient(
    supabaseUrl || "",
    supabaseAnonKey || ""
);

// Create a Supabase admin client with service role key
// This should only be used in server-side code
export const supabaseAdmin = createClient(
    supabaseUrl || "",
    supabaseServiceRoleKey || ""
);

// Helper function to get the current user
export async function getCurrentUser() {
    const { data: { user } } = await supabase.auth.getUser();
    return user;
}

// Helper function to get the current session
export async function getCurrentSession() {
    const { data: { session } } = await supabase.auth.getSession();
    return session;
}