import React, { useState, useEffect, useCallback } from 'react';
import MapView from './components/MapView';
import RegisterForm from './components/RegisterForm';
import ChatModal from './components/ChatModal';

const RADIUS_METERS = 5000;

export default function App() {
  const [currentUser, setCurrentUser] = useState(null);
  const [location, setLocation] = useState(null);
  const [locationError, setLocationError] = useState(null);
  const [nearbyUsers, setNearbyUsers] = useState([]);
  const [chatUser, setChatUser] = useState(null);

  // Capturar geolocalización al montar
  useEffect(() => {
    if (!navigator.geolocation) {
      setLocationError('Tu navegador no soporta geolocalización.');
      return;
    }
    navigator.geolocation.getCurrentPosition(
      (pos) =>
        setLocation({ lat: pos.coords.latitude, lng: pos.coords.longitude }),
      (err) => setLocationError('No se pudo obtener tu ubicación: ' + err.message)
    );
  }, []);

  // Cargar usuarios cercanos
  const fetchNearby = useCallback(async (lat, lng) => {
    try {
      const res = await fetch(
        `/api/users/nearby?lat=${lat}&lng=${lng}&radius_meters=${RADIUS_METERS}`
      );
      const data = await res.json();
      setNearbyUsers(Array.isArray(data) ? data : []);
    } catch (e) {
      console.error('Error al buscar cercanos:', e);
    }
  }, []);

  useEffect(() => {
    if (location) fetchNearby(location.lat, location.lng);
  }, [location, fetchNearby]);

  const others = currentUser
    ? nearbyUsers.filter((u) => u.id !== currentUser.id)
    : nearbyUsers;

  return (
    <div className="min-h-screen bg-gray-100 flex flex-col">
      <header className="bg-teal-600 text-white p-4 shadow-md flex justify-between items-center">
        <h1 className="text-xl font-bold">📍 Nearby Connect</h1>
        {currentUser && <span className="text-sm">Hola, {currentUser.nombre}</span>}
      </header>

      <main className="flex-1 p-4 max-w-6xl w-full mx-auto grid grid-cols-1 md:grid-cols-3 gap-4">
        {!currentUser ? (
          <div className="md:col-span-3 max-w-md mx-auto w-full">
            <RegisterForm
              location={location}
              locationError={locationError}
              onRegistered={(user) => {
                setCurrentUser(user);
                if (location) fetchNearby(location.lat, location.lng);
              }}
            />
          </div>
        ) : (
          <>
            <div className="md:col-span-2">
              <MapView
                userLocation={location}
                nearbyUsers={others}
                onSelectUser={(u) => setChatUser(u)}
              />
            </div>
            <div className="bg-white p-4 rounded-xl shadow border overflow-y-auto max-h-[500px]">
              <h2 className="font-bold text-lg mb-3">Personas cerca de ti</h2>
              {others.length === 0 ? (
                <p className="text-gray-500 text-sm">No hay personas cerca aún.</p>
              ) : (
                others.map((user) => (
                  <div
                    key={user.id}
                    className="flex items-center justify-between p-2 border-b hover:bg-gray-50"
                  >
                    <div className="flex items-center gap-3">
                      <img
                        src={user.foto_url || 'https://via.placeholder.com/40'}
                        alt={user.nombre}
                        className="w-10 h-10 rounded-full object-cover"
                      />
                      <div>
                        <p className="font-semibold text-sm">{user.nombre}</p>
                        <p className="text-xs text-gray-500">
                          {(user.distancia_m / 1000).toFixed(2)} km
                        </p>
                      </div>
                    </div>
                    <button
                      onClick={() => setChatUser(user)}
                      className="bg-teal-600 text-white text-xs px-3 py-1 rounded shadow hover:bg-teal-700"
                    >
                      Chat
                    </button>
                  </div>
                ))
              )}
            </div>
          </>
        )}
      </main>

      {chatUser && currentUser && (
        <ChatModal
          currentUser={currentUser}
          targetUser={chatUser}
          onClose={() => setChatUser(null)}
        />
      )}
    </div>
  );
}
