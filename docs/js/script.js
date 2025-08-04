const map = L.map('map').setView([9.082, 8.6753], 6);

L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
  attribution: '&copy; OpenStreetMap contributors'
}).addTo(map);

let currentLayer;

// Dropdown elements
const stateSelector = document.getElementById("stateSelector");
const lgaSelector = document.getElementById("lgaSelector");
const wardSelector = document.getElementById("wardSelector");

// Hide LGA and Ward selectors initially
lgaSelector.style.display = "none";
wardSelector.style.display = "none";

// State selection logic
stateSelector.addEventListener("change", function () {
  const selectedState = this.value;

  // Clear map and hide other dropdowns
  if (currentLayer) {
    map.removeLayer(currentLayer);
  }
  lgaSelector.style.display = "none";
  wardSelector.style.display = "none";

  if (!selectedState) return;

  // Fetch polling unit GeoJSON for selected state
  const geojsonUrl = `geojson/${selectedState}.geojson`;

  fetch(geojsonUrl)
    .then(response => {
      if (!response.ok) {
        throw new Error(`GeoJSON not found for ${selectedState}`);
      }
      return response.json();
    })
    .then(data => {
      currentLayer = L.geoJSON(data, {
        onEachFeature: (feature, layer) => {
          const props = feature.properties;
          layer.bindPopup(
            `<strong>${props.name}</strong><br>Ward: ${props.ward}<br>LGA: ${props.lga}<br>State: ${props.state}`
          );
        }
      }).addTo(map);
      map.fitBounds(currentLayer.getBounds());

      // Show LGA dropdown (optional future logic to populate LGAs)
      lgaSelector.style.display = "inline-block";
    })
    .catch(err => {
      alert("Failed to load polling unit data for selected state. Contact Collins.");
      console.error(err);
    });
});

// LGA change handler
lgaSelector.addEventListener("change", function () {
  const selectedLGA = this.value;
  if (selectedLGA) {
    wardSelector.style.display = "inline-block";
  } else {
    wardSelector.style.display = "none";
  }
});

