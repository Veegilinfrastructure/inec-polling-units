// script.js

// Populate state dropdown
const stateSelector = document.getElementById("stateSelector");
const lgaSelector = document.getElementById("lgaSelector");

Object.keys(stateLgas).forEach(state => {
  const option = document.createElement("option");
  option.value = state;
  option.textContent = state;
  stateSelector.appendChild(option);
});

stateSelector.addEventListener("change", function () {
  const selectedState = this.value;
  lgaSelector.innerHTML = `<option value="">-- Choose LGA --</option>`;

  if (selectedState && stateLgas[selectedState]) {
    stateLgas[selectedState].forEach(lga => {
      const option = document.createElement("option");
      option.value = lga;
      option.textContent = lga;
      lgaSelector.appendChild(option);
    });
  }
});

// Initialize map
const map = L.map("map").setView([9.082, 8.6753], 6);
L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
  attribution: "&copy; OpenStreetMap contributors",
}).addTo(map);
