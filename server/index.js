const express = require('express');
const http = require('http');
const { Server } = require('socket.io');
const cors = require('cors');
const { createClient } = require('@supabase/supabase-js');
require('dotenv').config();

const app = express();
app.use(cors());
app.use(express.json({ limit: '10mb' })); // 10mb para fotos en base64

const server = http.createServer(app);
const io = new Server(server, {
  cors: { origin: '*', methods: ['GET', 'POST'] },
});

const SUPABASE_URL = process.env.SUPABASE_URL;
const SUPABASE_KEY = process.env.SUPABASE_KEY;

if (!SUPABASE_URL || !SUPABASE_KEY) {
  console.error('⚠️  Faltan SUPABASE_URL o SUPABASE_KEY. Copia .env.example a .env y complétalo.');
  process.exit(1);
}

const supabase = createClient(SUPABASE_URL, SUPABASE_KEY);

// ---------- Registro de usuario con coordenadas ----------
app.post('/api/users/register', async (req, res) => {
  try {
    const { nombre, foto_url, lat, lng } = req.body;
    if (!nombre || lat == null || lng == null) {
      return res.status(400).json({ error: 'nombre, lat y lng son obligatorios' });
    }

    // WKT que PostGIS interpreta como GEOGRAPHY(POINT)
    const point = `POINT(${lng} ${lat})`;

    const { data, error } = await supabase
      .from('usuarios')
      .insert([{ nombre, foto_url: foto_url || null, ubicacion: point }])
      .select()
      .single();

    if (error) throw error;
    res.json({ success: true, user: { ...data, lat, lng } });
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

// ---------- Obtener usuarios cercanos ----------
app.get('/api/users/nearby', async (req, res) => {
  try {
    const { lat, lng, radius_meters = 5000 } = req.query;
    if (!lat || !lng) {
      return res.status(400).json({ error: 'lat y lng son obligatorios' });
    }

    const { data, error } = await supabase.rpc('get_usuarios_cercanos', {
      user_lat: parseFloat(lat),
      user_lng: parseFloat(lng),
      radius_meters: parseFloat(radius_meters),
    });

    if (error) throw error;
    res.json(data);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

// ---------- WebSockets para chat 1 a 1 ----------
io.on('connection', (socket) => {
  socket.on('join_chat', ({ roomId }) => {
    socket.join(roomId);
  });

  socket.on('send_message', ({ roomId, senderId, senderName, message }) => {
    io.to(roomId).emit('receive_message', {
      senderId,
      senderName,
      message,
      timestamp: new Date().toISOString(),
    });
  });
});

const PORT = process.env.PORT || 4000;
server.listen(PORT, () =>
  console.log(`🚀 Backend ejecutándose en http://localhost:${PORT}`)
);
