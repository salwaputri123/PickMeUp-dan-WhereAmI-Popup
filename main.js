import Map from 'https://cdn.skypack.dev/ol/Map.js';
import OSM from 'https://cdn.skypack.dev/ol/source/OSM.js';
import TileLayer from 'https://cdn.skypack.dev/ol/layer/Tile.js';
import View from 'https://cdn.skypack.dev/ol/View.js';
import { defaults as defaultControls } from 'https://cdn.skypack.dev/ol/control.js';
import Feature from 'https://cdn.skypack.dev/ol/Feature.js';
import Point from 'https://cdn.skypack.dev/ol/geom/Point.js';
import VectorLayer from 'https://cdn.skypack.dev/ol/layer/Vector.js';
import VectorSource from 'https://cdn.skypack.dev/ol/source/Vector.js';
import { Circle as CircleStyle, Fill, Stroke, Style } from 'https://cdn.skypack.dev/ol/style.js';
import { fromLonLat } from 'https://cdn.skypack.dev/ol/proj.js';

// Inisialisasi peta
const map = new Map({
  target: 'map',
  layers: [
    new TileLayer({
      source: new OSM(),
    }),
  ],
  view: new View({
    center: [0, 0],
    zoom: 2,
  }),
  controls: defaultControls(),
});

const vectorSource = new VectorSource();
const vectorLayer = new VectorLayer({
  source: vectorSource,
});
map.addLayer(vectorLayer);

// Fungsi untuk mendapatkan lokasi pengguna
function getUserLocation() {
  if (navigator.geolocation) {
    navigator.geolocation.getCurrentPosition(position => {
      const lon = position.coords.longitude;
      const lat = position.coords.latitude;
      const userCoords = fromLonLat([lon, lat]);

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

// Tambahkan event listener ke tombol "Dapatkan Lokasi Saya"
document.getElementById('get-location').addEventListener('click', getUserLocation);
