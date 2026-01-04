// Import Supabase client
import { supabase, getCurrentUser, getUserProfile, onAuthStateChange } from './supabase-config.js';

// Get year text
function getYearText(year) {
  const yearMap = {
    '1': '1st Year',
    '2': '2nd Year',
    '3': '3rd Year',
    '4': '4th Year'
  };
  return yearMap[year] || year;
}

// Load user profile
async function loadProfile() {
  const loadingState = document.getElementById('loadingState');
  const profileContent = document.getElementById('profileContent');
  const notLoggedIn = document.getElementById('notLoggedIn');

  try {
    const user = await getCurrentUser();

    if (user) {
      // User is signed in - get profile data
      const profile = await getUserProfile(user.id);
      
      if (profile) {
        // Update profile UI with database data
        document.getElementById('profileAvatar').textContent = profile.name ? profile.name.charAt(0).toUpperCase() : 'U';
        document.getElementById('profileName').textContent = profile.name || 'User';
        document.getElementById('profileEmail').textContent = user.email;
        document.getElementById('profileYear').textContent = getYearText(profile.year);
        document.getElementById('profileStream').textContent = profile.stream || '-';
        document.getElementById('profileEmailInfo').textContent = user.email;
      } else {
        // No profile data, use auth metadata
        const metadata = user.user_metadata || {};
        document.getElementById('profileAvatar').textContent = metadata.name ? metadata.name.charAt(0).toUpperCase() : 'U';
        document.getElementById('profileName').textContent = metadata.name || 'User';
        document.getElementById('profileEmail').textContent = user.email;
        document.getElementById('profileYear').textContent = getYearText(metadata.year) || '-';
        document.getElementById('profileStream').textContent = metadata.stream || '-';
        document.getElementById('profileEmailInfo').textContent = user.email;
      }

      // Show profile content
      loadingState.style.display = 'none';
      profileContent.style.display = 'block';
      notLoggedIn.style.display = 'none';

    } else {
      // User is not signed in
      loadingState.style.display = 'none';
      profileContent.style.display = 'none';
      notLoggedIn.style.display = 'block';
    }
  } catch (error) {
    console.error("Error loading profile:", error);
    loadingState.innerHTML = '<p>Error loading profile. Please try again.</p>';
  }
}

// Initialize on page load
loadProfile();

// Listen for auth state changes
onAuthStateChange((event, session) => {
  if (event === 'SIGNED_IN' || event === 'SIGNED_OUT') {
    loadProfile();
  }
});

// Logout handler
document.getElementById('logoutBtn').addEventListener('click', async () => {
  try {
    const { error } = await supabase.auth.signOut();
    if (error) throw error;
    
    alert('Logged out successfully!');
    window.location.href = 'index.html';
  } catch (error) {
    console.error('Logout error:', error);
    alert('Error logging out. Please try again.');
  }
});
