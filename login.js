// Import Supabase client
import { supabase } from './supabase-config.js';

// Login handler
document.getElementById('loginForm').addEventListener("submit", async (event) => {
  event.preventDefault();

  const email = document.getElementById('email').value.trim();
  const password = document.getElementById('password').value;

  // Validation
  if (!email || !password) {
    alert('Please fill in all fields');
    return;
  }

  // Disable button while processing
  const loginBtn = document.getElementById('loginBtn');
  loginBtn.disabled = true;
  loginBtn.textContent = 'Logging in...';

  try {
    // Sign in with Supabase Auth
    const { data, error } = await supabase.auth.signInWithPassword({
      email: email,
      password: password
    });

    if (error) throw error;

    console.log("User logged in:", data.user);
    alert("Login successful ✅");
    
    // Redirect to profile page
    window.location.href = 'profile.html';
    
  } catch (error) {
    console.error("Error:", error.message);
    
    // User-friendly error messages
    let errorMessage = error.message;
    if (error.message.includes('Invalid login credentials')) {
      errorMessage = 'Invalid email or password. Please try again.';
    } else if (error.message.includes('Email not confirmed')) {
      errorMessage = 'Please verify your email before logging in.';
    }
    
    alert(errorMessage);
    loginBtn.disabled = false;
    loginBtn.textContent = 'Log In';
  }
});

// Forgot password handler
document.getElementById('forgotPassword').addEventListener('click', async (event) => {
  event.preventDefault();
  
  const email = document.getElementById('email').value.trim();
  
  if (!email) {
    alert('Please enter your email address first');
    return;
  }

  try {
    const { error } = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: window.location.origin + '/reset-password.html',
    });

    if (error) throw error;

    alert('Password reset email sent! Please check your inbox.');
  } catch (error) {
    console.error('Reset password error:', error);
    alert('Error sending reset email: ' + error.message);
  }
});
