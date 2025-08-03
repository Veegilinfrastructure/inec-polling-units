const map = L.map('map').setView([9.082, 8.6753], 6);

L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
  attribution: '&copy; OpenStreetMap contributors'
}).addTo(map);

let currentLayer;

const stateSelector = document.getElementById("stateSelector");
const lgaSelector = document.getElementById("lgaSelector");
const wardSelector = document.getElementById("wardSelector");

// State selection
stateSelector.addEventListener("change", function () {
  const selectedState = this.value;
  if (!selectedState) {
    lgaSelector.style.display = "none";
    wardSelector.style.display = "none";
    return;
  }

  if (currentLayer) {
    map.removeLayer(currentLayer);
  }

  const geojsonUrl = `geojson/${selectedState}.geojson`;

  fetch(geojsonUrl)
    .then(res => res.json())
    .then(data => {
      const lgas = [...new Set(data.features.map(f => f.properties.lga))].sort();
      lgaSelector.innerHTML = '<option value="">Select LGA</option>' + lgas.map(lga => `<option value="${lga}">${lga}</option>`).join('');
      lgaSelector.style.display = "inline-block";
      wardSelector.style.display = "none";
    })
    .catch(err => {
      alert("Error loading state data.");
      console.error(err);
    });
});

// LGA selection
lgaSelector.addEventListener("change", function () {
  const selectedState = stateSelector.value;
  const selectedLga = this.value;
  if (!selectedLga) {
    wardSelector.style.display = "none";
    return;
  }

  const geojsonUrl = `geojson/${selectedState}.geojson`;

  fetch(geojsonUrl)
    .then(res => res.json())
    .then(data => {
      const wards = [...new Set(data.features
        .filter(f => f.properties.lga === selectedLga)
        .map(f => f.properties.ward))].sort();

      wardSelector.innerHTML = '<option value="">Select Ward</option>' + wards.map(ward => `<option value="${ward}">${ward}</option>`).join('');
      wardSelector.style.display = "inline-block";
    });
});

// Ward selection
wardSelector.addEventListener("change", function () {
  const selectedState = stateSelector.value;
  const selectedLga = lgaSelector.value;
  const selectedWard = this.value;

  if (!selectedWard) return;

  if (currentLayer) {
    map.removeLayer(currentLayer);
  }

  const geojsonUrl = `geojson/${selectedState}.geojson`;

  fetch(geojsonUrl)
    .then(res => res.json())
    .then(data => {
      const filteredFeatures = data.features.filter(f =>
        f.properties.lga === selectedLga && f.properties.ward === selectedWard
      );

      currentLayer = L.geoJSON({ type: "FeatureCollection", features: filteredFeatures }, {
        onEachFeature: (feature, layer) => {
          const props = feature.properties;
          layer.bindPopup(
            `<strong>${props.name}</strong><br>Ward: ${props.ward}<br>LGA: ${props.lga}<br>State: ${props.state}`
          );
        }
      }).addTo(map);

      if (filteredFeatures.length > 0) {
        map.fitBounds(currentLayer.getBounds());
      }
    });
});
