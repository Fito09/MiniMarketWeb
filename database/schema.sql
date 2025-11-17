-- ============================================
-- SCHEMA PARA MINI MARKET APP - SUPABASE
-- ============================================

-- Habilitar extensiones necesarias
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- ============================================
-- TABLAS PRINCIPALES
-- ============================================

-- Tabla de Usuarios (Empleados y Clientes)
CREATE TABLE IF NOT EXISTS usuarios (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    email VARCHAR(255) UNIQUE NOT NULL,
    password_hash VARCHAR(255) NOT NULL,
    nombre VARCHAR(255) NOT NULL,
    telefono VARCHAR(20),
    direccion TEXT,
    rol VARCHAR(20) NOT NULL CHECK (rol IN ('empleado', 'cliente', 'admin')),
    activo BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Tabla de Categorías
CREATE TABLE IF NOT EXISTS categorias (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    nombre VARCHAR(100) NOT NULL,
    descripcion TEXT,
    icono VARCHAR(50),
    activo BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Tabla de Productos
CREATE TABLE IF NOT EXISTS productos (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    codigo VARCHAR(50) UNIQUE NOT NULL,
    nombre VARCHAR(255) NOT NULL,
    descripcion TEXT,
    precio DECIMAL(10, 2) NOT NULL,
    stock INTEGER NOT NULL DEFAULT 0,
    categoria_id UUID REFERENCES categorias(id),
    imagen_url TEXT,
    activo BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Tabla de Promociones
CREATE TABLE IF NOT EXISTS promociones (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    producto_id UUID REFERENCES productos(id) ON DELETE CASCADE,
    nombre VARCHAR(255) NOT NULL,
    descripcion TEXT,
    descuento_porcentaje DECIMAL(5, 2) NOT NULL,
    fecha_inicio TIMESTAMP WITH TIME ZONE NOT NULL,
    fecha_fin TIMESTAMP WITH TIME ZONE NOT NULL,
    activo BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Tabla de Pedidos
CREATE TABLE IF NOT EXISTS pedidos (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    codigo VARCHAR(50) UNIQUE NOT NULL,
    cliente_id UUID REFERENCES usuarios(id),
    empleado_asignado_id UUID REFERENCES usuarios(id),
    tipo_entrega VARCHAR(20) NOT NULL CHECK (tipo_entrega IN ('tienda', 'domicilio')),
    direccion_entrega TEXT,
    estado VARCHAR(20) NOT NULL DEFAULT 'pendiente' 
        CHECK (estado IN ('pendiente', 'preparacion', 'reparto', 'entregado', 'cancelado')),
    total DECIMAL(10, 2) NOT NULL,
    observaciones TEXT,
    fecha_pedido TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    fecha_entrega TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Tabla de Detalle de Pedidos
CREATE TABLE IF NOT EXISTS detalle_pedidos (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    pedido_id UUID REFERENCES pedidos(id) ON DELETE CASCADE,
    producto_id UUID REFERENCES productos(id),
    cantidad INTEGER NOT NULL,
    precio_unitario DECIMAL(10, 2) NOT NULL,
    subtotal DECIMAL(10, 2) NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Tabla de Evidencias de Entrega
CREATE TABLE IF NOT EXISTS evidencias_entrega (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    pedido_id UUID REFERENCES pedidos(id) ON DELETE CASCADE,
    empleado_id UUID REFERENCES usuarios(id),
    foto_url TEXT NOT NULL,
    observaciones TEXT,
    latitud DECIMAL(10, 8),
    longitud DECIMAL(11, 8),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Tabla de Tareas
CREATE TABLE IF NOT EXISTS tareas (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    empleado_id UUID REFERENCES usuarios(id),
    titulo VARCHAR(255) NOT NULL,
    descripcion TEXT,
    prioridad VARCHAR(20) NOT NULL DEFAULT 'media' 
        CHECK (prioridad IN ('baja', 'media', 'alta', 'urgente')),
    estado VARCHAR(20) NOT NULL DEFAULT 'pendiente' 
        CHECK (estado IN ('pendiente', 'en_progreso', 'completada', 'cancelada')),
    fecha_inicio TIMESTAMP WITH TIME ZONE,
    fecha_limite TIMESTAMP WITH TIME ZONE,
    fecha_completada TIMESTAMP WITH TIME ZONE,
    observaciones TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Tabla de Asistencia
CREATE TABLE IF NOT EXISTS asistencia (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    empleado_id UUID REFERENCES usuarios(id),
    fecha DATE NOT NULL,
    hora_entrada TIMESTAMP WITH TIME ZONE,
    hora_salida TIMESTAMP WITH TIME ZONE,
    latitud_entrada DECIMAL(10, 8),
    longitud_entrada DECIMAL(11, 8),
    latitud_salida DECIMAL(10, 8),
    longitud_salida DECIMAL(11, 8),
    observaciones TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE(empleado_id, fecha)
);

-- Tabla de Notificaciones
CREATE TABLE IF NOT EXISTS notificaciones (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    usuario_id UUID REFERENCES usuarios(id) ON DELETE CASCADE,
    titulo VARCHAR(255) NOT NULL,
    mensaje TEXT NOT NULL,
    tipo VARCHAR(50) NOT NULL,
    leida BOOLEAN DEFAULT FALSE,
    datos_extra JSONB,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- ============================================
-- VISTAS
-- ============================================

-- Vista de Promociones Activas
CREATE OR REPLACE VIEW vw_promociones_activas AS
SELECT 
    p.id,
    p.producto_id,
    pr.nombre AS producto_nombre,
    pr.precio AS precio_original,
    p.nombre AS promocion_nombre,
    p.descripcion,
    p.descuento_porcentaje,
    ROUND(pr.precio * (1 - p.descuento_porcentaje / 100), 2) AS precio_con_descuento,
    p.fecha_inicio,
    p.fecha_fin,
    pr.imagen_url
FROM promociones p
JOIN productos pr ON p.producto_id = pr.id
WHERE p.activo = TRUE
    AND pr.activo = TRUE
    AND NOW() BETWEEN p.fecha_inicio AND p.fecha_fin;

-- Vista de Pedidos con Detalles
CREATE OR REPLACE VIEW vw_pedidos_completos AS
SELECT 
    p.id,
    p.codigo,
    p.cliente_id,
    c.nombre AS cliente_nombre,
    c.telefono AS cliente_telefono,
    p.empleado_asignado_id,
    e.nombre AS empleado_nombre,
    p.tipo_entrega,
    p.direccion_entrega,
    p.estado,
    p.total,
    p.observaciones,
    p.fecha_pedido,
    p.fecha_entrega,
    COUNT(dp.id) AS total_items
FROM pedidos p
LEFT JOIN usuarios c ON p.cliente_id = c.id
LEFT JOIN usuarios e ON p.empleado_asignado_id = e.id
LEFT JOIN detalle_pedidos dp ON p.id = dp.pedido_id
GROUP BY p.id, c.nombre, c.telefono, e.nombre;

-- ============================================
-- FUNCIONES
-- ============================================

-- Función para actualizar updated_at automáticamente
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Triggers para updated_at
CREATE TRIGGER update_usuarios_updated_at BEFORE UPDATE ON usuarios
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_productos_updated_at BEFORE UPDATE ON productos
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_pedidos_updated_at BEFORE UPDATE ON pedidos
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_tareas_updated_at BEFORE UPDATE ON tareas
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Función para generar código de pedido
CREATE OR REPLACE FUNCTION generar_codigo_pedido()
RETURNS TRIGGER AS $$
BEGIN
    NEW.codigo = 'PED-' || TO_CHAR(NOW(), 'YYYYMMDD') || '-' || LPAD(NEXTVAL('pedidos_seq')::TEXT, 5, '0');
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE SEQUENCE IF NOT EXISTS pedidos_seq;

CREATE TRIGGER trigger_generar_codigo_pedido
    BEFORE INSERT ON pedidos
    FOR EACH ROW
    WHEN (NEW.codigo IS NULL)
    EXECUTE FUNCTION generar_codigo_pedido();

-- ============================================
-- ROW LEVEL SECURITY (RLS)
-- ============================================

-- Habilitar RLS en todas las tablas
ALTER TABLE usuarios ENABLE ROW LEVEL SECURITY;
ALTER TABLE productos ENABLE ROW LEVEL SECURITY;
ALTER TABLE promociones ENABLE ROW LEVEL SECURITY;
ALTER TABLE pedidos ENABLE ROW LEVEL SECURITY;
ALTER TABLE detalle_pedidos ENABLE ROW LEVEL SECURITY;
ALTER TABLE tareas ENABLE ROW LEVEL SECURITY;
ALTER TABLE asistencia ENABLE ROW LEVEL SECURITY;
ALTER TABLE notificaciones ENABLE ROW LEVEL SECURITY;
ALTER TABLE evidencias_entrega ENABLE ROW LEVEL SECURITY;

-- Políticas para usuarios (los usuarios pueden ver y editar su propia información)
CREATE POLICY "Usuarios pueden ver su propia información" ON usuarios
    FOR SELECT USING (auth.uid()::text = id::text OR rol = 'admin');

CREATE POLICY "Usuarios pueden actualizar su propia información" ON usuarios
    FOR UPDATE USING (auth.uid()::text = id::text);

-- Políticas para productos (todos pueden ver, solo admin puede modificar)
CREATE POLICY "Todos pueden ver productos activos" ON productos
    FOR SELECT USING (activo = TRUE);

-- Políticas para pedidos
CREATE POLICY "Clientes pueden ver sus propios pedidos" ON pedidos
    FOR SELECT USING (
        cliente_id::text = auth.uid()::text OR 
        empleado_asignado_id::text = auth.uid()::text
    );

CREATE POLICY "Clientes pueden crear pedidos" ON pedidos
    FOR INSERT WITH CHECK (cliente_id::text = auth.uid()::text);

CREATE POLICY "Empleados pueden actualizar pedidos asignados" ON pedidos
    FOR UPDATE USING (empleado_asignado_id::text = auth.uid()::text);

-- Políticas para tareas
CREATE POLICY "Empleados pueden ver sus tareas" ON tareas
    FOR SELECT USING (empleado_id::text = auth.uid()::text);

CREATE POLICY "Empleados pueden actualizar sus tareas" ON tareas
    FOR UPDATE USING (empleado_id::text = auth.uid()::text);

-- Políticas para asistencia
CREATE POLICY "Empleados pueden ver su asistencia" ON asistencia
    FOR SELECT USING (empleado_id::text = auth.uid()::text);

CREATE POLICY "Empleados pueden registrar su asistencia" ON asistencia
    FOR INSERT WITH CHECK (empleado_id::text = auth.uid()::text);

-- Políticas para notificaciones
CREATE POLICY "Usuarios pueden ver sus notificaciones" ON notificaciones
    FOR SELECT USING (usuario_id::text = auth.uid()::text);

CREATE POLICY "Usuarios pueden actualizar sus notificaciones" ON notificaciones
    FOR UPDATE USING (usuario_id::text = auth.uid()::text);

-- ============================================
-- DATOS INICIALES
-- ============================================

-- Insertar categorías por defecto
INSERT INTO categorias (nombre, descripcion, icono) VALUES
    ('Abarrotes', 'Productos de despensa básica', 'package'),
    ('Bebidas', 'Bebidas y refrescos', 'coffee'),
    ('Lácteos', 'Productos lácteos y derivados', 'milk'),
    ('Carnes', 'Carnes y embutidos', 'beef'),
    ('Frutas y Verduras', 'Productos frescos', 'apple'),
    ('Panadería', 'Pan y productos de panadería', 'croissant'),
    ('Limpieza', 'Productos de limpieza', 'spray-can'),
    ('Higiene Personal', 'Productos de cuidado personal', 'sparkles')
ON CONFLICT DO NOTHING;

-- Nota: Los usuarios deben crearse a través de Supabase Auth
-- Luego se sincronizan con la tabla usuarios mediante triggers o funciones

COMMENT ON TABLE usuarios IS 'Almacena información de empleados y clientes';
COMMENT ON TABLE productos IS 'Catálogo de productos del mini market';
COMMENT ON TABLE pedidos IS 'Órdenes de compra de los clientes';
COMMENT ON TABLE tareas IS 'Tareas asignadas a empleados';
COMMENT ON TABLE asistencia IS 'Control de asistencia de empleados';
COMMENT ON TABLE notificaciones IS 'Sistema de notificaciones push';
