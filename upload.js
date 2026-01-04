// Upload PYQ - Supabase Version
import { supabase, getCurrentUser } from './supabase-config.js';

const form = document.getElementById("uploadForm");
const status = document.getElementById("status");
const loginPrompt = document.getElementById("loginPrompt");
const uploadBtn = document.getElementById("uploadBtn");

// Check if user is logged in
async function checkAuth() {
  const user = await getCurrentUser();
  
  if (user) {
    form.style.display = 'block';
    loginPrompt.style.display = 'none';
    return user;
  } else {
    form.style.display = 'none';
    loginPrompt.style.display = 'block';
    return null;
  }
}

// Initialize
checkAuth();

// Upload handler
form.addEventListener("submit", async (e) => {
  e.preventDefault();

  // Check if user is logged in
  const user = await getCurrentUser();
  if (!user) {
    alert("Please log in to upload papers");
    window.location.href = 'login.html';
    return;
  }

  // Get form values
  const stream = document.getElementById("stream").value;
  const yearOfStudy = document.getElementById("yearOfStudy").value;
  const calendarYear = document.getElementById("year").value;
  const semester = document.getElementById("semester").value;
  const subject = document.getElementById("subject").value.trim().toLowerCase();
  const file = document.getElementById("fileInput").files[0];

  // Validation
  if (!stream || !yearOfStudy || !calendarYear || !semester || !subject) {
    showStatus("Please fill in all fields", "error");
    return;
  }
  
  if (!file) { 
    showStatus("Please select a PDF file", "error");
    return; 
  }
  
  if (file.type !== "application/pdf") { 
    showStatus("Only PDF files are allowed", "error");
    return; 
  }
  
  if (file.size > 10 * 1024 * 1024) { // 10MB limit
    showStatus("File size must be less than 10MB", "error");
    return;
  }

  // Disable button while uploading
  uploadBtn.disabled = true;
  uploadBtn.textContent = "Uploading...";
  showStatus("Uploading... Please wait", "uploading");

  try {
    // Create unique filename
    const safeName = file.name.replace(/\s+/g, "_");
    const uniqueName = `${Date.now()}_${safeName}`;
    const storagePath = `${stream}/${calendarYear}/${semester}/${uniqueName}`;

    // Upload file to Supabase Storage
    const { data: uploadData, error: uploadError } = await supabase.storage
      .from('pyq-papers')
      .upload(storagePath, file, {
        cacheControl: '3600',
        upsert: false
      });

    if (uploadError) {
      console.error('Upload error:', uploadError);
      throw uploadError;
    }

    // Get public URL for the uploaded file
    const { data: urlData } = supabase.storage
      .from('pyq-papers')
      .getPublicUrl(storagePath);

    const downloadURL = urlData.publicUrl;

    // Save metadata to Supabase database
    const { error: dbError } = await supabase
      .from('papers')
      .insert([
        {
          stream: stream,
          calendar_year: calendarYear,
          year_of_study: yearOfStudy,
          semester: semester,
          subject: subject,
          file_name: file.name,
          storage_path: storagePath,
          download_url: downloadURL,
          uploaded_by: user.id,
          uploader_email: user.email
        }
      ]);

    if (dbError) {
      console.error('Database error:', dbError);
      throw dbError;
    }

    showStatus("✅ Paper uploaded successfully!", "success");
    form.reset();

  } catch (err) {
    console.error('Error:', err);
    showStatus("❌ Upload failed: " + (err.message || "Please try again"), "error");
  } finally {
    uploadBtn.disabled = false;
    uploadBtn.textContent = "📤 Upload Paper";
  }
});

// Helper function to show status
function showStatus(message, type) {
  status.textContent = message;
  status.className = type;
}
