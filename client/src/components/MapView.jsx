import { MapContainer, TileLayer, Marker, Popup, Circle } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';

// Corregir iconos por defecto de Leaflet (se rompen con bundlers)
import iconUrl from 'leaflet/dist/images/marker-icon.png';
import iconRetinaUrl from 'leaflet/dist/images/marker-icon-2x.png';
import shadowUrl from 'leaflet/dist/images/marker-shadow.png';

delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({ iconRetinaUrl, iconUrl, shadowUrl });

const RADIUS_METERS = 5000;

export default function MapView({ userLocation, nearbyUsers, onSelectUser }) {
  if (!userLocation) {
    return (
      <div className="h-[500px] bg-white rounded-xl shadow border flex items-center justify-center text-gray-500">
        Obteniendo ubicación...
      </div>
    );
  }

  return (
    <MapContainer
      center={[userLocation.lat, userLocation.lng]}
      zoom={15}
      style={{ height: '500px', width: '100%', borderRadius: '0.75rem' }}
    >
      <TileLayer
        attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
        url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
      />

      {/* Radio de búsqueda */}
      <Circle
        center={[userLocation.lat, userLocation.lng]}
        radius={RADIUS_METERS}
        pathOptions={{ color: 'teal', fillColor: 'teal', fillOpacity: 0.08 }}
      />

      {/* Posición del usuario */}
      <Marker position={[userLocation.lat, userLocation.lng]}>
        <Popup>Tú estás aquí</Popup>
      </Marker>

      {/* Usuarios cercanos */}
      {nearbyUsers.map((u) => (
        <Marker key={u.id} position={[u.lat, u.lng]}>
          <Popup>
            <div className="text-center">
              <p className="font-semibold">{u.nombre}</p>
              <p className="text-xs text-gray-500">
                {(u.distancia_m / 1000).toFixed(2)} km
              </p>
              <button
                onClick={() => onSelectUser(u)}
                className="mt-1 bg-teal-600 text-white text-xs px-3 py-1 rounded hover:bg-teal-700"
              >
                Chat
              </button>
            </div>
          </Popup>
        </Marker>
      ))}
    </MapContainer>
  );
}
