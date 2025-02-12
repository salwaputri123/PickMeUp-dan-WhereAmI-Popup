import Map from 'https://cdn.skypack.dev/ol/Map.js';
import OSM from 'https://cdn.skypack.dev/ol/source/OSM.js';
import TileLayer from 'https://cdn.skypack.dev/ol/layer/Tile.js';
import View from 'https://cdn.skypack.dev/ol/View.js';
import { defaults as defaultControls } from 'https://cdn.skypack.dev/ol/control.js';
import Feature from 'https://cdn.skypack.dev/ol/Feature.js';
import Point from 'https://cdn.skypack.dev/ol/geom/Point.js';
import VectorLayer from 'https://cdn.skypack.dev/ol/layer/Vector.js';
import VectorSource from 'https://cdn.skypack.dev/ol/source/Vector.js';
import Overlay from 'https://cdn.skypack.dev/ol/Overlay.js';
import { Circle as CircleStyle, Fill, Stroke, Style } from 'https://cdn.skypack.dev/ol/style.js';
import { fromLonLat, toLonLat } from 'https://cdn.skypack.dev/ol/proj.js';  // ✅ Perbaikan di sini

// Inisialisasi peta
const map = new Map({
  target: 'map',
  layers: [
    new TileLayer({
      source: new OSM(),
    }),
  ],
  view: new View({
    center: fromLonLat([0, 0]),  // ✅ Perbaikan di sini
    zoom: 2,
  }),
  controls: defaultControls(),
});

const vectorSource = new VectorSource();
const vectorLayer = new VectorLayer({
  source: vectorSource,
});
map.addLayer(vectorLayer);

// Overlay untuk pop-up
const popup = document.getElementById('popup');
const popupContent = document.getElementById('popup-content');
const popupOverlay = new Overlay({
  element: popup,
  autoPan: true,
  positioning: 'bottom-center',
  stopEvent: false,
});
map.addOverlay(popupOverlay);

// Fungsi untuk mendapatkan lokasi pengguna
function getUserLocation() {
  if (navigator.geolocation) {
    navigator.geolocation.getCurrentPosition(position => {
      const lon = position.coords.longitude;
      const lat = position.coords.latitude;
      const userCoords = fromLonLat([lon, lat]);  // ✅ Perbaikan di sini

      // Tambahkan marker ke peta
      const userLocation = new Feature({
        geometry: new Point(userCoords),
      });
      userLocation.setStyle(new Style({
        image: new CircleStyle({
          radius: 8,
          fill: new Fill({ color: 'red' }),
          stroke: new Stroke({ color: 'white', width: 2 }),
        }),
      }));
      vectorSource.clear();
      vectorSource.addFeature(userLocation);

      // Update tampilan peta
      map.getView().setCenter(userCoords);
      map.getView().setZoom(15);

      // Ambil nama lokasi menggunakan API OpenStreetMap Reverse Geocoding
      fetch(`https://nominatim.openstreetmap.org/reverse?format=json&lat=${lat}&lon=${lon}`)
        .then(response => response.json())
        .then(data => {
          document.getElementById('location-info').innerText = `Anda berada di: ${data.display_name}`;
        })
        .catch(error => console.error('Error fetching location name:', error));
    }, error => {
      console.error('Error mendapatkan lokasi:', error);
      alert('Gagal mendapatkan lokasi. Pastikan GPS aktif.');
    });
  } else {
    alert('Geolokasi tidak didukung oleh browser Anda.');
  }
}

document.getElementById('get-location').addEventListener('click', getUserLocation);

// Tambahkan event click pada peta untuk menampilkan popup informasi
map.on('singleclick', function (event) {
  const coordinate = event.coordinate;
  const lonLat = toLonLat(coordinate);  // ✅ Perbaikan di sini

  fetch(`https://nominatim.openstreetmap.org/reverse?format=json&lat=${lonLat[1]}&lon=${lonLat[0]}`)
    .then(response => response.json())
    .then(data => {
      const locationName = data.display_name || 'Tidak diketahui';
      const placeType = data.type || 'Tidak ada informasi';
      const addressDetails = data.address || {};

      const details = `
        <b>Lokasi:</b> ${locationName}<br>
        <b>Jenis Tempat:</b> ${placeType}<br>
        <b>Negara:</b> ${addressDetails.country || 'Tidak diketahui'}<br>
        <b>Kota:</b> ${addressDetails.city || addressDetails.town || addressDetails.village || 'Tidak diketahui'}
      `;

      popupContent.innerHTML = details;
      popupOverlay.setPosition(coordinate);
    })
    .catch(error => console.error('Error fetching popup location:', error));
});
