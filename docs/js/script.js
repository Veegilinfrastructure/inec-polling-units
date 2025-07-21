const map = L.map('map').setView([9.082, 8.6753], 6);

L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
  attribution: '&copy; OpenStreetMap contributors'
}).addTo(map);

let currentLayer;

document.getElementById("stateSelector").addEventListener("change", function () {
  const selectedState = this.value;
  if (!selectedState) return;

  if (currentLayer) {
    map.removeLayer(currentLayer);
  }

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
    })
    .catch(err => {
      alert("Failed to load polling unit data for selected state. Contact Collins.");
      console.error(err);
    });
});