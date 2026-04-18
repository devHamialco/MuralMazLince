# STD - Software Test Documentation

Este documento describe los casos de prueba detallados para validating the backend auth y registration flows.

## Casos de Prueba (Resumen)
- CT-01 Checksum matrícula válida/ inválida.
- CT-02 Registro estudiante: respuesta 201|409.
- CT-03 Registro emprendedor: respuesta 201|400|409.
- CT-04 Login: con y sin contraseña; cookies seteadas.
- CT-05 Reclamo matrícula: 201.
- CT-06 Persistencia de datos en Cloudinary (mocked).

## Cobertura de Pruebas
- Cobertura objetivo: ≥70% para backend; 100% para módulos críticos (checksum, dHash, generateWaLink, umbral de intención).

*** Fin STD
