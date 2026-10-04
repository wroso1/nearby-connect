import { useState } from 'react';

export default function RegisterForm({ location, locationError, onRegistered }) {
  const [nombre, setNombre] = useState('');
  const [fotoUrl, setFotoUrl] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleFoto = (e) => {
    const file = e.target.files[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = () => setFotoUrl(reader.result);
    reader.readAsDataURL(file);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!nombre.trim()) {
      setError('Escribe tu nombre');
      return;
    }
    if (!location) {
      setError('Esperando tu ubicación GPS...');
      return;
    }
    setLoading(true);
    setError('');
    try {
      const res = await fetch('/api/users/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          nombre: nombre.trim(),
          foto_url: fotoUrl || null,
          lat: location.lat,
          lng: location.lng,
        }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Error al registrarte');
      onRegistered({ ...data.user, lat: location.lat, lng: location.lng });
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="bg-white p-6 rounded-xl shadow border">
      <h2 className="text-xl font-bold mb-4 text-center">Únete a Nearby Connect</h2>
      {locationError && <p className="text-red-500 text-sm mb-2">{locationError}</p>}
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Nombre</label>
          <input
            value={nombre}
            onChange={(e) => setNombre(e.target.value)}
            placeholder="Tu nombre"
            className="w-full border rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-teal-500"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Foto de perfil (opcional)
          </label>
          <input type="file" accept="image/*" onChange={handleFoto} className="w-full text-sm" />
          {fotoUrl && (
            <img src={fotoUrl} alt="preview" className="mt-2 w-16 h-16 rounded-full object-cover" />
          )}
        </div>
        {!location && !locationError && (
          <p className="text-gray-500 text-sm">Obteniendo tu ubicación...</p>
        )}
        {error && <p className="text-red-500 text-sm">{error}</p>}
        <button
          type="submit"
          disabled={loading}
          className="w-full bg-teal-600 text-white py-2 rounded-lg hover:bg-teal-700 disabled:opacity-50"
        >
          {loading ? 'Registrando...' : 'Registrarme'}
        </button>
      </form>
    </div>
  );
}
