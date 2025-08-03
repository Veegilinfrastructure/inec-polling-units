const map = L.map('map').setView([9.082, 8.6753], 6);

L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
  attribution: '&copy; OpenStreetMap contributors'
}).addTo(map);

let currentLayer;

const stateSelector = document.getElementById("stateSelector");
const lgaSelector = document.getElementById("lgaSelector");
const wardSelector = document.getElementById("wardSelector");

stateSelector.addEventListener("change", function () {
  const selectedState = this.value;
  if (!selectedState) return;

  if (currentLayer) {
    map.removeLayer(currentLayer);
  }

  fetch(`geojson/${selectedState}.geojson`)
    .then(response => {
      if (!response.ok) throw new Error(`GeoJSON not found for ${selectedState}`);
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

      populateDropdown(lgaSelector, [...new Set(data.features.map(f => f.properties.lga))]);
      lgaSelector.disabled = false;
      wardSelector.innerHTML = `<option value="">-- Choose Ward --</option>`;
      wardSelector.disabled = true;
    })
    .catch(err => {
      alert("Failed to load polling unit data. Contact Collins.");
      console.error(err);
    });
});

lgaSelector.addEventListener("change", function () {
  const selectedLGA = this.value;
  if (!selectedLGA || !currentLayer) return;

  const wards = new Set();
  currentLayer.eachLayer(layer => {
    if (layer.feature.properties.lga === selectedLGA) {
      wards.add(layer.feature.properties.ward);
    }
  });

  populateDropdown(wardSelector, [...wards]);
  wardSelector.disabled = false;
});

wardSelector.addEventListener("change", function () {
  const selectedWard = this.value;
  if (!selectedWard || !currentLayer) return;

  const bounds = [];
  currentLayer.eachLayer(layer => {
    const props = layer.feature.properties;
    if (props.ward === selectedWard && props.lga === lgaSelector.value) {
      bounds.push(layer.getBounds());
      layer.openPopup();
    }
  });

  if (bounds.length) {
    const combinedBounds = bounds.reduce((acc, b) => acc.extend(b), bounds[0]);
    map.fitBounds(combinedBounds);
  }
});

function populateDropdown(dropdown, items) {
  dropdown.innerHTML = `<option value="">-- Choose --</option>`;
  items.forEach(item => {
    const opt = document.createElement("option");
    opt.value = item;
    opt.textContent = item;
    dropdown.appendChild(opt);
  });
}
