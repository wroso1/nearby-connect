# 📍 Nearby Connect

MVP de una app web para descubrir y chatear con personas cercanas en tiempo real.

- **Registro** con nombre y foto de perfil
- **Geolocalización** por GPS
- **Mapa interactivo** (Leaflet) con usuarios dentro de un radio configurable
- **Chat 1 a 1** en tiempo real (Socket.io)

## Stack

| Capa | Tecnología |
|------|------------|
| Backend | Node.js + Express + Socket.io |
| Base de datos | Supabase + PostGIS |
| Frontend | React + Vite + Tailwind CSS + Leaflet |

## Estructura

```
nearby-connect/
├── server/          # Backend (Express + Socket.io + Supabase)
│   ├── package.json
│   ├── .env.example
│   └── index.js
├── client/          # Frontend (React + Vite + Tailwind + Leaflet)
│   ├── package.json
│   ├── vite.config.js
│   ├── index.html
│   └── src/
│       ├── index.jsx
│       ├── index.css
│       ├── App.jsx
│       └── components/
│           ├── RegisterForm.jsx
│           ├── MapView.jsx
│           └── ChatModal.jsx
├── database/
│   └── schema.sql   # Script PostGIS para Supabase
└── README.md
```

> Nota: se usó **Vite** en lugar de Create React App (obsoleto). Por eso
> `index.html` está en la raíz de `client/` y no en `public/`.

## Configuración

### 1. Base de datos (Supabase)

1. Crea un proyecto en [Supabase](https://supabase.com).
2. Abre **SQL Editor** y ejecuta todo el contenido de `database/schema.sql`.
   - Esto crea la extensión PostGIS, la tabla `usuarios`, el índice geoespacial y la función `get_usuarios_cercanos`.

### 2. Backend

```bash
cd server
cp .env.example .env
# Edita .env con tus credenciales:
#   SUPABASE_URL=https://TU-PROYECTO.supabase.co
#   SUPABASE_KEY=TU-ANON-KEY
npm install
npm start
```

El backend arranca en `http://localhost:4000`.

### 3. Frontend

```bash
cd client
npm install
npm start
```

El frontend arranca en `http://localhost:3000` (usa un proxy para `/api` → `localhost:4000`).

## Uso

1. Abre `http://localhost:3000` en el navegador.
2. Permite el acceso a tu ubicación GPS.
3. Escribe tu nombre y (opcional) sube una foto.
4. Verás el mapa con tu posición y un círculo de 5 km.
5. Los usuarios dentro de ese radio aparecen en la lista y en el mapa; pulsa **Chat** para hablar en tiempo real.

## Endpoints

| Método | Ruta | Descripción |
|--------|------|-------------|
| POST | `/api/users/register` | Registra un usuario con `{ nombre, foto_url, lat, lng }` |
| GET | `/api/users/nearby?lat=&lng=&radius_meters=` | Devuelve usuarios cercanos ordenados por distancia |

## Eventos de Socket.io

| Evento | Dirección | Payload |
|--------|-----------|---------|
| `join_chat` | cliente → servidor | `{ roomId }` |
| `send_message` | cliente → servidor | `{ roomId, senderId, senderName, message }` |
| `receive_message` | servidor → cliente | `{ senderId, senderName, message, timestamp }` |
