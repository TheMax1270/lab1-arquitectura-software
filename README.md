# Laboratorio 1 - Arquitectura de Software

Aplicación bancaria desarrollada con Spring Boot y React. Permite consultar clientes, crear clientes, realizar transferencias y consultar el historial de transacciones por cuenta.

Estudiante: Max Daniel Perez Quintero

Curso: Arquitectura de Software

Docente: Diego José Luis Botia Valderrama

Universidad de Antioquia

Ejecución del backend:

```powershell
.\mvnw spring-boot:run
```

Ejecución del frontend:

```powershell
cd frontend
npm install
npm run dev
```

Base de datos:
MySQL
Esquema: lab12026p

## Laboratorio 2 - Integración continua y despliegue

Sobre el proyecto del Laboratorio 1 se implementó un flujo de CI/CD con GitHub Actions. El proceso incluye pruebas automatizadas, cobertura con JaCoCo, análisis de calidad con SonarQube Cloud, generación del artefacto JAR, construcción de imagen Docker y publicación en Docker Hub.

La aplicación backend fue desplegada en Render utilizando PostgreSQL como base de datos en producción.

### Herramientas utilizadas
- GitHub Actions
- JUnit 5 y Mockito
- JaCoCo
- SonarQube Cloud
- Docker y Docker Hub
- Render
- PostgreSQL

### Resultados principales
- 9 pruebas ejecutadas correctamente.
- Cobertura final en SonarQube Cloud: 71,0 %.
- Quality Gate: Passed.
- Imagen Docker publicada en `max127085/lab12026p:latest`.
- Despliegue del backend en Render.
