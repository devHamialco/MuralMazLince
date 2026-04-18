# STP - Software Test Plan

Sprint 11 (Frontend Auth & Registration) - Mural Maz Lince

## 1.0 Alcance
- Pruebas de integración para flujos de autenticación y registro.
- Componentes probados: auth endpoints, registro estudiante, registro emprendedor, login, reclamo matrícula.

## 2.0 Estrategia de Pruebas
- Unitarias: cobertura de utilidades de checksum, hashing, validaciones de entrada.
- Integración: endpoints /auth, /registrations, /claim-matricula.
- End-to-end: flujos completos desde registro hasta login y acceso al feed.

## 3.0 Entorno de Pruebas
- DB de pruebas: gestionado por scripts de migrate.test, correr antes de tests.
- Arquitectura: pruebas contra la API Node/Express desplegada en el proyecto.

## 4.0 Plan de Ejecución
- Preparar entornos, ejecutar migraciones, ejecutar pruebas unitarias e integración.
- Registro de defectos y reportes (Severity: critical, major, minor).

## 5.0 Criterios de Aceptación
- la suite de pruebas pasa con al menos 70% de cobertura (STD documentado).

*** Fin STP
