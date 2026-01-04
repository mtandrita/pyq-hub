// Get PYQs - Supabase Version
import { supabase } from './supabase-config.js';

const form = document.getElementById("getForm");
const results = document.getElementById("results");

form.addEventListener("submit", async (e) => {
  e.preventDefault();

  const stream = document.getElementById("stream").value.toUpperCase();
  const year = document.getElementById("year").value;
  const semester = document.getElementById("semester").value;
  const subject = document.getElementById("subject").value.trim().toLowerCase();

  // Show loading
  results.innerHTML = '<p class="loading">🔍 Searching for papers...</p>';

  try {
    // Build query
    let query = supabase
      .from('papers')
      .select('*')
      .order('created_at', { ascending: false });

    // Add filters based on user input
    if (stream) {
      query = query.ilike('stream', `%${stream}%`);
    }
    if (year) {
      query = query.eq('calendar_year', year);
    }
    if (semester) {
      query = query.eq('semester', semester);
    }
    if (subject) {
      query = query.ilike('subject', `%${subject}%`);
    }

    const { data: papers, error } = await query;

    if (error) {
      console.error('Query error:', error);
      throw error;
    }

    // Display results
    if (papers && papers.length > 0) {
      displayPapers(papers);
    } else {
      results.innerHTML = `
        <div class="no-results">
          <p>📭 No papers found matching your criteria.</p>
          <p>Try different filters or <a href="upload.html">upload a paper</a>!</p>
        </div>
      `;
    }

  } catch (err) {
    console.error('Error:', err);
    results.innerHTML = `<p class="error">❌ Error searching papers. Please try again.</p>`;
  }
});

// Function to display papers
function displayPapers(papers) {
  let html = `<h3>📚 Found ${papers.length} paper(s)</h3><div class="papers-list">`;

  papers.forEach(paper => {
    const yearText = getYearText(paper.year_of_study);
    const semesterText = paper.semester ? paper.semester.replace('sem', 'Semester ') : '';
    
    html += `
      <div class="paper-card">
        <div class="paper-info">
          <h4>📄 ${capitalizeFirst(paper.subject)}</h4>
          <p><strong>Stream:</strong> ${paper.stream}</p>
          <p><strong>Year:</strong> ${yearText} | <strong>Semester:</strong> ${semesterText}</p>
          <p><strong>Exam Year:</strong> ${paper.calendar_year}</p>
          <p class="file-name">📁 ${paper.file_name}</p>
        </div>
        <a href="${paper.download_url}" target="_blank" class="download-btn">
          ⬇️ Download
        </a>
      </div>
    `;
  });

  html += '</div>';
  results.innerHTML = html;
}

// Helper functions
function getYearText(year) {
  const yearMap = {
    '1': '1st Year',
    '2': '2nd Year',
    '3': '3rd Year',
    '4': '4th Year'
  };
  return yearMap[year] || year || '-';
}

function capitalizeFirst(str) {
  if (!str) return '';
  return str.charAt(0).toUpperCase() + str.slice(1);
}
