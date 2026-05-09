Arquitectura del Sistema - Oficialía DSW
1. Tipo de Arquitectura
El sistema será desarrollado utilizando una arquitectura monolítica modular.
Este enfoque permite mantener todos los servicios dentro de una sola aplicación backend, pero organizados en módulos independientes según su responsabilidad.
Ventajas
Fácil mantenimiento
Separación lógica de funcionalidades
Desarrollo más rápido
Escalabilidad futura
Ideal para proyectos académicos y medianos
2. Tecnologías Utilizadas
Frontend
React
Axios
TailwindCSS
Backend
Node.js
Express
Base de Datos
MongoDB

3. Separación por Servicios
Servicio de Documentos
Responsable de:
Registrar documentos
Generar folio único
Consultar documentos
Actualizar información

Servicio de Departamentos
Responsable de:
Registrar departamentos
Consultar responsables
Relacionar departamentos con documentos

Servicio de Turnos y Seguimiento
Responsable de:
Turnar documentos
Cambiar estados
Registrar observaciones
Mantener historial

Servicio de Usuarios
Responsable de:
Registrar usuarios
Gestionar roles
Controlar permisos

4. Flujo del Sistema
El usuario interactúa con la interfaz en React.
React realiza peticiones HTTP al backend usando Axios.
El backend en Node.js con Express procesa la solicitud.
Se realizan operaciones sobre MongoDB.
La información se devuelve en formato JSON.
React actualiza la interfaz dinámicamente.



5. Estructura Propuesta del Backend
backend/
|	-modules/
|		-documentos/
|		-departamentos/
|		-turnos/
|		-usuarios/
|
|
|-controllers/
|-models/
|-routes/
|-config/
|-server.js



6. Flujo de Comunicación
React → Express → Controladores → Modelos → MongoDB → JSON → React

7. Comunicación entre Servicios
Todos los módulos compartirán la misma API REST interna utilizando intercambio de datos JSON.
Cada módulo tendrá:
Rutas independientes
Controladores independientes
Modelos independientes
