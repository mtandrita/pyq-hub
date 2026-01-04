// upload-pyqs.js - Supabase Version
import { supabase, getCurrentUser } from './supabase-config.js';

const form = document.getElementById("uploadForm");
const status = document.getElementById("status");

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
  const stream = document.getElementById("stream").value.trim();
  const calendarYear = document.getElementById("year").value.trim();
  const yearOfStudyElem = document.getElementById("yearOfStudy");
  const yearOfStudy = yearOfStudyElem ? yearOfStudyElem.value.trim() : "";
  const semester = document.getElementById("semester").value.trim();
  const subjectRaw = document.getElementById("subject").value.trim();
  const subject = subjectRaw.toLowerCase();
  const file = document.getElementById("fileInput").files[0];

  // Validation
  if (!file) { 
    alert("Please select a PDF file"); 
    return; 
  }
  if (file.type !== "application/pdf") { 
    alert("Only PDF files are allowed"); 
    return; 
  }
  if (file.size > 10 * 1024 * 1024) { // 10MB limit
    alert("File size must be less than 10MB");
    return;
  }

  try {
    status && (status.textContent = "Uploading...");

    // Create unique filename
    const safeName = file.name.replace(/\s+/g, "_");
    const uniqueName = `${Date.now()}_${safeName}`;
    const storagePath = `papers/${stream}/${calendarYear}/${semester}/${uniqueName}`;

    // Upload file to Supabase Storage
    const { data: uploadData, error: uploadError } = await supabase.storage
      .from('pyq-papers') // Make sure to create this bucket in Supabase
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

    status && (status.textContent = "Upload complete ✅");
    form.reset();
    alert("Paper uploaded successfully!");

  } catch (err) {
    console.error('Error:', err);
    status && (status.textContent = "Upload failed ❌");
    alert("Upload error: " + (err.message || "Please try again"));
  }
});
