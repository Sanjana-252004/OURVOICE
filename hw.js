// ===============================
// OUR VOICE, OUR RIGHTS - KARNATAKA MGNREGA DASHBOARD
// ===============================

// Demo dataset (replace with live API later)
const districtData = {
  "Bengaluru Urban": { workers_employed: 54320, person_days: 256430, expenditure: 9.4, women_percent: 41 },
  "Bengaluru Rural": { workers_employed: 78430, person_days: 302150, expenditure: 10.8, women_percent: 46 },
  "Mysuru": { workers_employed: 103240, person_days: 414980, expenditure: 12.3, women_percent: 49 },
  "Belagavi": { workers_employed: 120540, person_days: 487800, expenditure: 13.7, women_percent: 47 },
  "Ballari": { workers_employed: 93560, person_days: 391420, expenditure: 11.1, women_percent: 44 },
  "Kalaburagi": { workers_employed: 115320, person_days: 453260, expenditure: 12.9, women_percent: 46 },
  "Dakshina Kannada": { workers_employed: 80410, person_days: 312700, expenditure: 9.8, women_percent: 48 },
  "Udupi": { workers_employed: 74560, person_days: 298400, expenditure: 9.1, women_percent: 50 },
  "Davangere": { workers_employed: 98620, person_days: 382500, expenditure: 10.5, women_percent: 45 },
  "Shivamogga": { workers_employed: 101330, person_days: 398740, expenditure: 11.3, women_percent: 47 }
};

// DOM elements
const districtSelect = document.getElementById("districtSelect");
const detectBtn = document.getElementById("detectBtn");
const voiceBtn = document.getElementById("voiceBtn");

let currentDistrict = null;
let currentData = null;

// Determine preferred language (Kannada if in Karnataka, else Hindi or English)
let langPref = navigator.language.startsWith("kn") ? "kn-IN" :
               navigator.language.startsWith("hi") ? "hi-IN" : "en-IN";

// Manual district selection
districtSelect.addEventListener("change", function () {
  const district = this.value;
  if (district) {
    displayDistrictData(district);
    speakDistrictData(district); // Speak when selected
  }
});

// Detect location automatically
detectBtn.addEventListener("click", function () {
  if (!navigator.geolocation) {
    alert("Geolocation not supported by your browser.");
    return;
  }
  detectBtn.textContent = "Detecting...";
  navigator.geolocation.getCurrentPosition(success, error);
});

function success(position) {
  const lat = position.coords.latitude;
  const lon = position.coords.longitude;

  fetch(`https://nominatim.openstreetmap.org/reverse?format=json&lat=${lat}&lon=${lon}&zoom=10&addressdetails=1`)
    .then(res => res.json())
    .then(data => {
      const addr = data.address;
      let districtName = addr.county || addr.district || addr.state_district || "";
      if (districtName && districtName.toLowerCase().endsWith(" district")) {
        districtName = districtName.replace(" district", "").trim();
      }
      if (districtData[districtName]) {
        districtSelect.value = districtName;
        displayDistrictData(districtName);
        speakDistrictData(districtName);
      } else {
        alert("District data not found for detected location. Please select manually.");
      }
      detectBtn.textContent = "Detect My District";
    })
    .catch(() => {
      alert("Unable to detect location. Please select manually.");
      detectBtn.textContent = "Detect My District";
    });
}

function error() {
  alert("Unable to detect location. Please select manually.");
  detectBtn.textContent = "Detect My District";
}

// Display data for selected district
function displayDistrictData(district) {
  const data = districtData[district];
  if (!data) return;

  document.getElementById("workers").textContent = data.workers_employed.toLocaleString();
  document.getElementById("personDays").textContent = data.person_days.toLocaleString();
  document.getElementById("expenditure").textContent = data.expenditure.toLocaleString();
  document.getElementById("women").textContent = data.women_percent;

  currentDistrict = district;
  currentData = data;
}

// Voice Assistant: Speak automatically or on button click
voiceBtn.addEventListener("click", function () {
  if (!currentDistrict || !currentData) {
    speak("Please select or detect your district first.");
    return;
  }
  speakDistrictData(currentDistrict);
});

function speakDistrictData(district) {
  const data = districtData[district];
  if (!data) return;

  // Stop previous speech
  window.speechSynthesis.cancel();

  let text = `In ${district}, ${data.workers_employed.toLocaleString()} people got work,
  total ${data.person_days.toLocaleString()} work days were created,
  rupees ${data.expenditure.toLocaleString()} crore were spent,
  and ${data.women_percent} percent of the workers were women.`;

  // Kannada translation (simplified)
  if (langPref === "kn-IN") {
    text = `${district} ಜಿಲ್ಲೆಯಲಿ, ${data.workers_employed} ಮಂದಿ ಕೆಲಸ ಪಡೆದಿದ್ದಾರೆ,
    ಒಟ್ಟು ${data.person_days} ಕೆಲಸದ ದಿನಗಳು ಸೃಷ್ಟಿಯಾಗಿವೆ,
    ರೂ. ${data.expenditure} ಕೋಟಿಗಳು ಖರ್ಚಾಗಿವೆ,
    ಮತ್ತು ${data.women_percent} ಶೇಕಡಾ ಮಹಿಳೆಯರು ಪಾಲ್ಗೊಂಡಿದ್ದಾರೆ.`;
  }

  // Hindi translation (simplified)
  if (langPref === "hi-IN") {
    text = `${district} ज़िले में ${data.workers_employed} लोगों को काम मिला,
    कुल ${data.person_days} कार्य दिवस बने,
    ₹${data.expenditure} करोड़ खर्च हुए,
    और ${data.women_percent} प्रतिशत महिलाएँ शामिल थीं।`;
  }

  const msg = new SpeechSynthesisUtterance(text);
  msg.lang = langPref;
  msg.rate = 1;
  msg.pitch = 1;
  window.speechSynthesis.speak(msg);
}

function speak(text) {
  window.speechSynthesis.cancel();
  const msg = new SpeechSynthesisUtterance(text);
  msg.lang = langPref;
  msg.rate = 1;
  msg.pitch = 1;
  window.speechSynthesis.speak(msg);
}
