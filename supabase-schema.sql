-- =====================================================
-- SCHEMA PARA SISTEMA DE GESTIÓN DE TURNOS
-- Ejecutar en el SQL Editor de Supabase
-- =====================================================

-- Habilitar extensión uuid
create extension if not exists "uuid-ossp";

-- =====================================================
-- TABLAS PRINCIPALES
-- =====================================================

create table if not exists profesionales (
  id uuid primary key default uuid_generate_v4(),
  nombre text not null,
  especialidad text,
  activo boolean default true,
  created_at timestamptz default now()
);

create table if not exists servicios (
  id uuid primary key default uuid_generate_v4(),
  nombre text not null,
  descripcion text,
  duracion_minutos integer not null check (duracion_minutos >= 15),
  precio numeric(10,2) not null default 0,
  activo boolean default true,
  created_at timestamptz default now()
);

-- Horario laboral por profesional y día de la semana (0=domingo, 1=lunes, ..., 6=sábado)
create table if not exists horarios_profesionales (
  id uuid primary key default uuid_generate_v4(),
  profesional_id uuid references profesionales(id) on delete cascade,
  dia_semana integer not null check (dia_semana between 0 and 6),
  hora_inicio time not null,
  hora_fin time not null,
  unique (profesional_id, dia_semana)
);

create table if not exists turnos (
  id uuid primary key default uuid_generate_v4(),
  profesional_id uuid references profesionales(id) on delete set null,
  servicio_id uuid references servicios(id) on delete set null,
  nombre text not null,
  whatsapp text,
  notas text,
  fecha date not null,
  hora time not null,
  estado text not null default 'pendiente'
    check (estado in ('pendiente', 'confirmado', 'cancelado', 'completado')),
  created_at timestamptz default now()
);

-- Índices para performance
create index if not exists idx_turnos_fecha on turnos(fecha);
create index if not exists idx_turnos_profesional_fecha on turnos(profesional_id, fecha);
create index if not exists idx_turnos_estado on turnos(estado);

-- =====================================================
-- CONSTRAINT DE NO SOLAPAMIENTO (a nivel DB)
-- =====================================================
-- Previene turnos duplicados en el mismo profesional, fecha y hora
create unique index if not exists idx_turnos_no_solapamiento
  on turnos(profesional_id, fecha, hora)
  where estado != 'cancelado';

-- =====================================================
-- ROW LEVEL SECURITY
-- =====================================================
alter table turnos enable row level security;
alter table servicios enable row level security;
alter table profesionales enable row level security;
alter table horarios_profesionales enable row level security;

-- Política pública: cualquiera puede leer servicios y profesionales activos
create policy "Servicios públicos" on servicios
  for select using (activo = true);

create policy "Profesionales públicos" on profesionales
  for select using (activo = true);

create policy "Horarios públicos" on horarios_profesionales
  for select using (true);

-- Política pública: clientes pueden crear turnos
create policy "Clientes pueden crear turnos" on turnos
  for insert with check (true);

-- Admin puede hacer todo (autenticado)
create policy "Admin full access turnos" on turnos
  for all using (auth.role() = 'authenticated');

create policy "Admin full access servicios" on servicios
  for all using (auth.role() = 'authenticated');

create policy "Admin full access profesionales" on profesionales
  for all using (auth.role() = 'authenticated');

create policy "Admin full access horarios" on horarios_profesionales
  for all using (auth.role() = 'authenticated');

-- =====================================================
-- DATOS DE EJEMPLO
-- =====================================================
insert into profesionales (nombre, especialidad) values
  ('Martín García', 'Cortes modernos y barbería clásica'),
  ('Lucas Rodríguez', 'Coloración y tratamientos')
on conflict do nothing;

insert into servicios (nombre, descripcion, duracion_minutos, precio) values
  ('Corte de cabello', 'Corte clásico o moderno a elección', 30, 3500),
  ('Corte + Barba', 'Corte y arreglo de barba completo', 45, 5000),
  ('Coloración', 'Tintura completa con lavado', 90, 8000),
  ('Tratamiento capilar', 'Hidratación y nutrición profunda', 60, 6000)
on conflict do nothing;

-- Horarios de lunes a sábado (1-6), 9:00 a 19:00
insert into horarios_profesionales (profesional_id, dia_semana, hora_inicio, hora_fin)
select p.id, d.dia, '09:00', '19:00'
from profesionales p, (select generate_series(1,6) as dia) d
on conflict do nothing;
