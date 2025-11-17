-- ============================================
-- DATOS DE PRUEBA PARA MINI MARKET APP
-- ============================================
-- Este script inserta datos de ejemplo para probar la aplicación

-- ============================================
-- PRODUCTOS DE EJEMPLO
-- ============================================

-- Productos de Abarrotes
INSERT INTO productos (codigo, nombre, descripcion, precio, stock, categoria_id) 
SELECT 
  'PROD-001', 'Arroz Premium 1kg', 'Arroz blanco de primera calidad, grano largo', 2.50, 100,
  (SELECT id FROM categorias WHERE nombre = 'Abarrotes' LIMIT 1)
WHERE NOT EXISTS (SELECT 1 FROM productos WHERE codigo = 'PROD-001');

INSERT INTO productos (codigo, nombre, descripcion, precio, stock, categoria_id) 
SELECT 
  'PROD-002', 'Aceite Vegetal 1L', 'Aceite vegetal 100% puro', 3.75, 50,
  (SELECT id FROM categorias WHERE nombre = 'Abarrotes' LIMIT 1)
WHERE NOT EXISTS (SELECT 1 FROM productos WHERE codigo = 'PROD-002');

INSERT INTO productos (codigo, nombre, descripcion, precio, stock, categoria_id) 
SELECT 
  'PROD-003', 'Frijoles Negros 500g', 'Frijoles negros seleccionados', 1.80, 75,
  (SELECT id FROM categorias WHERE nombre = 'Abarrotes' LIMIT 1)
WHERE NOT EXISTS (SELECT 1 FROM productos WHERE codigo = 'PROD-003');

INSERT INTO productos (codigo, nombre, descripcion, precio, stock, categoria_id) 
SELECT 
  'PROD-004', 'Azúcar Blanca 1kg', 'Azúcar refinada de caña', 1.50, 120,
  (SELECT id FROM categorias WHERE nombre = 'Abarrotes' LIMIT 1)
WHERE NOT EXISTS (SELECT 1 FROM productos WHERE codigo = 'PROD-004');

INSERT INTO productos (codigo, nombre, descripcion, precio, stock, categoria_id) 
SELECT 
  'PROD-005', 'Sal de Mesa 500g', 'Sal yodada refinada', 0.75, 200,
  (SELECT id FROM categorias WHERE nombre = 'Abarrotes' LIMIT 1)
WHERE NOT EXISTS (SELECT 1 FROM productos WHERE codigo = 'PROD-005');

-- Productos de Bebidas
INSERT INTO productos (codigo, nombre, descripcion, precio, stock, categoria_id) 
SELECT 
  'PROD-006', 'Coca Cola 2L', 'Refresco de cola', 2.00, 120,
  (SELECT id FROM categorias WHERE nombre = 'Bebidas' LIMIT 1)
WHERE NOT EXISTS (SELECT 1 FROM productos WHERE codigo = 'PROD-006');

INSERT INTO productos (codigo, nombre, descripcion, precio, stock, categoria_id) 
SELECT 
  'PROD-007', 'Agua Mineral 1.5L', 'Agua purificada sin gas', 1.00, 150,
  (SELECT id FROM categorias WHERE nombre = 'Bebidas' LIMIT 1)
WHERE NOT EXISTS (SELECT 1 FROM productos WHERE codigo = 'PROD-007');

INSERT INTO productos (codigo, nombre, descripcion, precio, stock, categoria_id) 
SELECT 
  'PROD-008', 'Jugo de Naranja 1L', 'Jugo natural de naranja', 2.50, 60,
  (SELECT id FROM categorias WHERE nombre = 'Bebidas' LIMIT 1)
WHERE NOT EXISTS (SELECT 1 FROM productos WHERE codigo = 'PROD-008');

INSERT INTO productos (codigo, nombre, descripcion, precio, stock, categoria_id) 
SELECT 
  'PROD-009', 'Café Instantáneo 200g', 'Café soluble premium', 5.50, 40,
  (SELECT id FROM categorias WHERE nombre = 'Bebidas' LIMIT 1)
WHERE NOT EXISTS (SELECT 1 FROM productos WHERE codigo = 'PROD-009');

-- Productos Lácteos
INSERT INTO productos (codigo, nombre, descripcion, precio, stock, categoria_id) 
SELECT 
  'PROD-010', 'Leche Entera 1L', 'Leche entera pasteurizada', 1.50, 80,
  (SELECT id FROM categorias WHERE nombre = 'Lácteos' LIMIT 1)
WHERE NOT EXISTS (SELECT 1 FROM productos WHERE codigo = 'PROD-010');

INSERT INTO productos (codigo, nombre, descripcion, precio, stock, categoria_id) 
SELECT 
  'PROD-011', 'Yogurt Natural 1L', 'Yogurt natural sin azúcar', 2.25, 45,
  (SELECT id FROM categorias WHERE nombre = 'Lácteos' LIMIT 1)
WHERE NOT EXISTS (SELECT 1 FROM productos WHERE codigo = 'PROD-011');

INSERT INTO productos (codigo, nombre, descripcion, precio, stock, categoria_id) 
SELECT 
  'PROD-012', 'Queso Fresco 500g', 'Queso fresco artesanal', 4.50, 30,
  (SELECT id FROM categorias WHERE nombre = 'Lácteos' LIMIT 1)
WHERE NOT EXISTS (SELECT 1 FROM productos WHERE codigo = 'PROD-012');

INSERT INTO productos (codigo, nombre, descripcion, precio, stock, categoria_id) 
SELECT 
  'PROD-013', 'Mantequilla 250g', 'Mantequilla con sal', 3.00, 50,
  (SELECT id FROM categorias WHERE nombre = 'Lácteos' LIMIT 1)
WHERE NOT EXISTS (SELECT 1 FROM productos WHERE codigo = 'PROD-013');

-- Productos de Panadería
INSERT INTO productos (codigo, nombre, descripcion, precio, stock, categoria_id) 
SELECT 
  'PROD-014', 'Pan Blanco', 'Pan de molde blanco', 1.25, 60,
  (SELECT id FROM categorias WHERE nombre = 'Panadería' LIMIT 1)
WHERE NOT EXISTS (SELECT 1 FROM productos WHERE codigo = 'PROD-014');

INSERT INTO productos (codigo, nombre, descripcion, precio, stock, categoria_id) 
SELECT 
  'PROD-015', 'Pan Integral', 'Pan de molde integral', 1.50, 40,
  (SELECT id FROM categorias WHERE nombre = 'Panadería' LIMIT 1)
WHERE NOT EXISTS (SELECT 1 FROM productos WHERE codigo = 'PROD-015');

INSERT INTO productos (codigo, nombre, descripcion, precio, stock, categoria_id) 
SELECT 
  'PROD-016', 'Galletas María 200g', 'Galletas tipo María', 1.75, 80,
  (SELECT id FROM categorias WHERE nombre = 'Panadería' LIMIT 1)
WHERE NOT EXISTS (SELECT 1 FROM productos WHERE codigo = 'PROD-016');

-- Productos de Limpieza
INSERT INTO productos (codigo, nombre, descripcion, precio, stock, categoria_id) 
SELECT 
  'PROD-017', 'Detergente 1kg', 'Detergente en polvo para ropa', 4.50, 70,
  (SELECT id FROM categorias WHERE nombre = 'Limpieza' LIMIT 1)
WHERE NOT EXISTS (SELECT 1 FROM productos WHERE codigo = 'PROD-017');

INSERT INTO productos (codigo, nombre, descripcion, precio, stock, categoria_id) 
SELECT 
  'PROD-018', 'Cloro 1L', 'Blanqueador desinfectante', 2.00, 90,
  (SELECT id FROM categorias WHERE nombre = 'Limpieza' LIMIT 1)
WHERE NOT EXISTS (SELECT 1 FROM productos WHERE codigo = 'PROD-018');

INSERT INTO productos (codigo, nombre, descripcion, precio, stock, categoria_id) 
SELECT 
  'PROD-019', 'Jabón Líquido 500ml', 'Jabón líquido para trastes', 2.75, 55,
  (SELECT id FROM categorias WHERE nombre = 'Limpieza' LIMIT 1)
WHERE NOT EXISTS (SELECT 1 FROM productos WHERE codigo = 'PROD-019');

-- Productos de Higiene Personal
INSERT INTO productos (codigo, nombre, descripcion, precio, stock, categoria_id) 
SELECT 
  'PROD-020', 'Shampoo 400ml', 'Shampoo para todo tipo de cabello', 3.50, 65,
  (SELECT id FROM categorias WHERE nombre = 'Higiene Personal' LIMIT 1)
WHERE NOT EXISTS (SELECT 1 FROM productos WHERE codigo = 'PROD-020');

INSERT INTO productos (codigo, nombre, descripcion, precio, stock, categoria_id) 
SELECT 
  'PROD-021', 'Jabón de Tocador', 'Jabón antibacterial', 1.25, 100,
  (SELECT id FROM categorias WHERE nombre = 'Higiene Personal' LIMIT 1)
WHERE NOT EXISTS (SELECT 1 FROM productos WHERE codigo = 'PROD-021');

INSERT INTO productos (codigo, nombre, descripcion, precio, stock, categoria_id) 
SELECT 
  'PROD-022', 'Pasta Dental 100ml', 'Pasta dental con flúor', 2.50, 85,
  (SELECT id FROM categorias WHERE nombre = 'Higiene Personal' LIMIT 1)
WHERE NOT EXISTS (SELECT 1 FROM productos WHERE codigo = 'PROD-022');

-- ============================================
-- PROMOCIONES DE EJEMPLO
-- ============================================

-- Promoción en Arroz (15% descuento)
INSERT INTO promociones (producto_id, nombre, descripcion, descuento_porcentaje, fecha_inicio, fecha_fin)
SELECT 
  id,
  'Oferta Especial - Arroz Premium',
  'Descuento en arroz por tiempo limitado',
  15.00,
  NOW(),
  NOW() + INTERVAL '30 days'
FROM productos WHERE codigo = 'PROD-001'
ON CONFLICT DO NOTHING;

-- Promoción en Aceite (10% descuento)
INSERT INTO promociones (producto_id, nombre, descripcion, descuento_porcentaje, fecha_inicio, fecha_fin)
SELECT 
  id,
  'Descuento en Aceite Vegetal',
  'Ahorra en tu aceite favorito',
  10.00,
  NOW(),
  NOW() + INTERVAL '15 days'
FROM productos WHERE codigo = 'PROD-002'
ON CONFLICT DO NOTHING;

-- Promoción en Coca Cola (20% descuento)
INSERT INTO promociones (producto_id, nombre, descripcion, descuento_porcentaje, fecha_inicio, fecha_fin)
SELECT 
  id,
  'Mega Oferta - Coca Cola',
  '20% de descuento en refrescos',
  20.00,
  NOW(),
  NOW() + INTERVAL '7 days'
FROM productos WHERE codigo = 'PROD-006'
ON CONFLICT DO NOTHING;

-- Promoción en Leche (5% descuento)
INSERT INTO promociones (producto_id, nombre, descripcion, descuento_porcentaje, fecha_inicio, fecha_fin)
SELECT 
  id,
  'Oferta Lácteos',
  'Descuento especial en leche',
  5.00,
  NOW(),
  NOW() + INTERVAL '14 days'
FROM productos WHERE codigo = 'PROD-010'
ON CONFLICT DO NOTHING;

-- Promoción en Detergente (25% descuento)
INSERT INTO promociones (producto_id, nombre, descripcion, descuento_porcentaje, fecha_inicio, fecha_fin)
SELECT 
  id,
  'Super Descuento - Limpieza',
  '¡25% OFF en detergente!',
  25.00,
  NOW(),
  NOW() + INTERVAL '10 days'
FROM productos WHERE codigo = 'PROD-017'
ON CONFLICT DO NOTHING;

-- ============================================
-- MENSAJE DE CONFIRMACIÓN
-- ============================================

DO $$
BEGIN
  RAISE NOTICE '✅ Datos de prueba insertados correctamente';
  RAISE NOTICE '📦 % productos creados', (SELECT COUNT(*) FROM productos);
  RAISE NOTICE '🏷️ % promociones activas', (SELECT COUNT(*) FROM promociones WHERE activo = true);
  RAISE NOTICE '📂 % categorías disponibles', (SELECT COUNT(*) FROM categorias WHERE activo = true);
END $$;

-- Mostrar resumen
SELECT 
  'Productos' as tipo,
  COUNT(*) as cantidad
FROM productos
UNION ALL
SELECT 
  'Promociones Activas' as tipo,
  COUNT(*) as cantidad
FROM promociones
WHERE activo = true
UNION ALL
SELECT 
  'Categorías' as tipo,
  COUNT(*) as cantidad
FROM categorias
WHERE activo = true;
