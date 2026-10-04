-- ============================================
-- Nearby Connect — Esquema PostGIS para Supabase
-- Ejecutar en el SQL Editor de Supabase
-- ============================================

-- 1. Activar extensión geoespacial
CREATE EXTENSION IF NOT EXISTS postgis;

-- 2. Tabla de usuarios
CREATE TABLE IF NOT EXISTS public.usuarios (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  nombre TEXT NOT NULL,
  foto_url TEXT,
  ubicacion GEOGRAPHY(POINT, 4326),
  creado_en TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- 3. Índice geoespacial (acelera ST_DWithin)
CREATE INDEX IF NOT EXISTS usuarios_ubicacion_idx
  ON public.usuarios USING GIST (ubicacion);

-- 4. Función para buscar usuarios por distancia
CREATE OR REPLACE FUNCTION get_usuarios_cercanos(
  user_lat DOUBLE PRECISION,
  user_lng DOUBLE PRECISION,
  radius_meters DOUBLE PRECISION
)
RETURNS TABLE (
  id UUID,
  nombre TEXT,
  foto_url TEXT,
  lat DOUBLE PRECISION,
  lng DOUBLE PRECISION,
  distancia_m DOUBLE PRECISION
)
LANGUAGE plpgsql
AS $$
BEGIN
  RETURN QUERY
  SELECT
    u.id,
    u.nombre,
    u.foto_url,
    ST_Y(u.ubicacion::geometry) AS lat,
    ST_X(u.ubicacion::geometry) AS lng,
    ST_Distance(
      u.ubicacion,
      ST_SetSRID(ST_MakePoint(user_lng, user_lat), 4326)::geography
    ) AS distancia_m
  FROM public.usuarios u
  WHERE ST_DWithin(
    u.ubicacion,
    ST_SetSRID(ST_MakePoint(user_lng, user_lat), 4326)::geography,
    radius_meters
  )
  ORDER BY distancia_m ASC;
END;
$$;
