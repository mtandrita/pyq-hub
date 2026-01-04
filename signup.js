// Import Supabase client
import { supabase } from './supabase-config.js';

// Sign up handler
document.getElementById('submit').addEventListener("click", async (event) => {
  event.preventDefault();

  const name = document.getElementById('name').value.trim();
  const year = document.getElementById('year').value;
  const stream = document.getElementById('stream').value;
  const email = document.getElementById('email').value.trim();
  const password = document.getElementById('password').value;

  // Validation
  if (!name || !year || !stream || !email || !password) {
    alert('Please fill in all fields');
    return;
  }

  if (password.length < 6) {
    alert('Password must be at least 6 characters');
    return;
  }

  // Disable button while processing
  const submitBtn = document.getElementById('submit');
  submitBtn.disabled = true;
  submitBtn.textContent = 'Creating Account...';

  try {
    // Create user account with Supabase Auth
    const { data: authData, error: authError } = await supabase.auth.signUp({
      email: email,
      password: password,
      options: {
        data: {
          name: name,
          year: year,
          stream: stream
        }
      }
    });

    if (authError) throw authError;

    // Save additional user data to profiles table
    const { error: profileError } = await supabase
      .from('profiles')
      .insert([
        {
          id: authData.user.id,
          name: name,
          year: year,
          stream: stream,
          email: email,
          created_at: new Date().toISOString()
        }
      ]);

    if (profileError) {
      console.error('Profile creation error:', profileError);
      // Continue anyway as auth was successful
    }

    console.log("User created:", authData.user);
    alert("Account created successfully ✅\nPlease check your email to verify your account.");
    
    // Redirect to profile page
    window.location.href = 'profile.html';
    
  } catch (error) {
    console.error("Error:", error.message);
    alert(error.message);
    submitBtn.disabled = false;
    submitBtn.textContent = 'Sign Up';
  }
});
