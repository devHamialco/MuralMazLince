INSERT INTO categories (code, name, group_name) VALUES
('CAT-01', 'Alimentos y bebidas', 'Productos físicos'),
('CAT-02', 'Repostería y postres', 'Productos físicos'),
('CAT-03', 'Artesanías y manualidades', 'Productos físicos'),
('CAT-04', 'Ropa y accesorios', 'Productos físicos'),
('CAT-05', 'Papelería y material escolar', 'Productos físicos'),
('CAT-06', 'Cosméticos y cuidado personal', 'Productos físicos'),
('CAT-07', 'Plantas y decoración', 'Productos físicos'),

('CAT-08', 'Asesorías académicas y tutorías', 'Servicios'),
('CAT-09', 'Diseño gráfico y digital', 'Servicios'),
('CAT-10', 'Fotografía y video', 'Servicios'),
('CAT-11', 'Desarrollo web y tecnología', 'Servicios'),
('CAT-12', 'Clases particulares (idiomas, música, deporte)', 'Servicios'),
('CAT-13', 'Impresión y copiado', 'Servicios'),
('CAT-14', 'Reparaciones y mantenimiento', 'Servicios'),

('CAT-15', 'Evento cultural', 'Organizaciones'),
('CAT-16', 'Evento deportivo', 'Organizaciones'),
('CAT-17', 'Convocatoria o concurso', 'Organizaciones'),
('CAT-18', 'Comunicado oficial', 'Organizaciones'),
('CAT-19', 'Actividad de voluntariado', 'Organizaciones'),

('CAT-00', 'Otro', 'Otros')
ON CONFLICT (code) DO NOTHING;
