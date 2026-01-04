// Supabase Configuration
// Your Supabase project credentials

const SUPABASE_URL = 'https://bumnqjgzgtgngxlbhzfg.supabase.co';
const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImJ1bW5xamd6Z3Rnbmd4bGJoemZnIiwicm9sZSI6ImFub24iLCJpYXQiOjE3Njc1MTEwMDgsImV4cCI6MjA4MzA4NzAwOH0.LH7aFVS9aLzQ7icW5KBO29vzqb0CbZEdSNICBrj7uTw';

// Import Supabase client
import { createClient } from 'https://cdn.jsdelivr.net/npm/@supabase/supabase-js@2/+esm';

// Initialize Supabase client
export const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

// Helper function to get current user
export async function getCurrentUser() {
    const { data: { user }, error } = await supabase.auth.getUser();
    if (error) {
        console.error('Error getting user:', error);
        return null;
    }
    return user;
}

// Helper function to get user profile from database
export async function getUserProfile(userId) {
    const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', userId)
        .single();
    
    if (error) {
        console.error('Error getting profile:', error);
        return null;
    }
    return data;
}

// Helper function to check if user is logged in
export async function isLoggedIn() {
    const user = await getCurrentUser();
    return user !== null;
}

// Auth state change listener
export function onAuthStateChange(callback) {
    return supabase.auth.onAuthStateChange((event, session) => {
        callback(event, session);
    });
}
