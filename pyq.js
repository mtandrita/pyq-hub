// get-pyqs.js
import { initializeApp } from "https://www.gstatic.com/firebasejs/12.2.1/firebase-app.js";
import { getFirestore, collection, query, where, getDocs } from "https://www.gstatic.com/firebasejs/12.2.1/firebase-firestore.js";

// ---------- REPLACE with your Firebase config ----------
const firebaseConfig = {
  apiKey: "AIzaSyCPmZAEd5ASGr-PnYYOCLw-X70MQkoy2mY",
  authDomain: "pyq-hub-4c302.firebaseapp.com",
  projectId: "pyq-hub-4c302",
  storageBucket: "pyq-hub-4c302.firebasestorage.app",
  messagingSenderId: "536159781239",
  appId: "1:536159781239:web:130428e365509d8b6b2172",
  measurementId: "G-C0BM557N1S"
};
// -------------------------------------------------------

const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

const form = document.getElementById("getForm");
const resultsDiv = document.getElementById("results");

form.addEventListener("submit", async (e) => {
  e.preventDefault();

  const stream = document.getElementById("stream").value.trim();
  const calendarYear = document.getElementById("year").value.trim();
  const yearOfStudyElem = document.getElementById("yearOfStudy");
  const yearOfStudy = yearOfStudyElem ? yearOfStudyElem.value.trim() : "";
  const semester = document.getElementById("semester").value.trim();
  const subject = document.getElementById("subject").value.trim().toLowerCase();

  resultsDiv.innerHTML = "<p>Searching…</p>";

  try {
    // Query - exact-match on the key fields we stored
    const q = query(
      collection(db, "papers"),
      where("stream", "==", stream),
      where("calendarYear", "==", calendarYear),
      where("semester", "==", semester),
      where("subject", "==", subject)
      // optionally include yearOfStudy in query if you store/use it:
      // where("yearOfStudy", "==", yearOfStudy)
    );

    const snap = await getDocs(q);

    if (snap.empty) {
      resultsDiv.innerHTML = `<p>No papers found for ${subject} — try checking spelling or try other years.</p>`;
      return;
    }

    let html = "<h3>Available papers:</h3><ul>";
    snap.forEach(doc => {
      const data = doc.data();
      html += `<li>${data.subject} — ${data.calendarYear} — <a href="${data.downloadURL}" target="_blank">Download</a></li>`;
    });
    html += "</ul>";
    resultsDiv.innerHTML = html;

  } catch (err) {
    console.error(err);
    resultsDiv.innerHTML = "<p>Error fetching papers — check console.</p>";
  }
});
