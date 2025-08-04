const map = L.map('map').setView([9.082, 8.6753], 6);

L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
  attribution: '&copy; OpenStreetMap contributors'
}).addTo(map);

let currentLayer;

document.getElementById("stateSelector").addEventListener("change", function () {
  const selectedState = this.value;

  // Populate LGA dropdown
  const lgaSelector = document.getElementById("lgaSelector");
  lgaSelector.innerHTML = `<option value="">-- Choose LGA --</option>`;

  if (selectedState && stateLgas[selectedState]) {
    stateLgas[selectedState].forEach(lga => {
      const opt = document.createElement("option");
      opt.value = lga;
      opt.textContent = lga;
      lgaSelector.appendChild(opt);
    });

    // Load map if GeoJSON exists
    if (currentLayer) map.removeLayer(currentLayer);
    const geojsonUrl = `geojson/${selectedState.toLowerCase()}.geojson`;

    fetch(geojsonUrl)
      .then(res => {
        if (!res.ok) throw new Error("GeoJSON not found.");
        return res.json();
      })
      .then(data => {
        currentLayer = L.geoJSON(data).addTo(map);
        map.fitBounds(currentLayer.getBounds());
      })
      .catch(err => {
        alert("Could not load map data for the selected state.");
        console.error(err);
      });
  }
});
