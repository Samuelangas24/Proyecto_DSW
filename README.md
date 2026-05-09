# 📋 Sistema de Gestión Documental - Oficialía DSW

Este proyecto es una aplicación web Full-Stack diseñada para la modernización del proceso de oficialía de partes, permitiendo el registro, turno y seguimiento de documentos institucionales.

## 🚀 Características Implementadas (Proyecto Integrador 7)

- **Servicio de Documentos:** Registro de documentos con generación automática de folio único (ej. `DOC-2026-001`) y consulta en bandeja.
- **Servicio de Departamentos:** Creación y visualización de departamentos de la institución.
- **Servicio de Turnos y Seguimiento:** Capacidad para turnar un documento a un departamento, cambiar su estado, añadir observaciones y mantener un historial detallado de movimientos.
- **Servicio de Usuarios (Roles):** Sistema de seguridad con JWT y encriptación (bcrypt). Soporta roles (`administrador`, `oficialia`, `departamento`) para ocultar menús y proteger rutas.
- **Arquitectura MERN:** React (Frontend) + Node.js/Express (Backend) + MongoDB (Base de datos).

---

## 🔐 Cuentas de Prueba (Pre-configuradas)

La base de datos se inicializa con los siguientes usuarios de prueba para verificar los diferentes niveles de acceso:

| Rol | Correo / Email | Contraseña | Permisos |
| :--- | :--- | :--- | :--- |
| **Administrador** | `admin@local` | `admin123` | Acceso total (Crear documentos, departamentos y turnar). |
| **Oficialía** | `oficialia@local` | `12345` | Puede crear documentos y turnarlos. No puede gestionar departamentos. |
| **Departamento** | `departamento@local` | `12345` | Solo puede visualizar la bandeja y turnar/responder documentos. |

---

## 🔧 Requisitos Previos

1. **Node.js** (v14 o superior)
2. **MongoDB** (Instalado y corriendo localmente en el puerto `27017`, o configurar `MONGO_URI` en un archivo `.env`).
3. **Git**

---

## 🚀 Pasos para Ejecutar el Proyecto (Local)

El proyecto está dividido en dos partes. Necesitas **dos terminales** abiertas:

### Terminal 1: Iniciar el Backend (Servidor)
```bash
cd backend
npm install
node server.js
```
> El servidor se levantará en `http://localhost:3001` y se conectará automáticamente a MongoDB.

### Terminal 2: Iniciar el Frontend (React)
Abre otra terminal en la carpeta principal del proyecto:
```bash
npm install
npm start
```
> La aplicación visual se abrirá en `http://localhost:3000`.

---

## 📁 Estructura del Proyecto

```text
Proyecto_DSW/
├── backend/               # Lógica del servidor (Node.js + Express)
│   ├── models/            # Esquemas de MongoDB (User, Registro, Departamento, Turno)
│   ├── server.js          # Punto de entrada, API REST y Middlewares
│   └── package.json
├── src/                   # Lógica del cliente (React)
│   ├── components/        # Componentes UI (Sidebar, Navbar)
│   ├── page/              # Pantallas (Bandeja, Departamentos, Registro, Login)
│   └── App.jsx            # Enrutamiento principal
└── package.json
```

---

## 🎯 Tecnologías Utilizadas

- **Frontend:** React, React Router, TailwindCSS, Axios.
- **Backend:** Node.js, Express, jsonwebtoken, bcryptjs, cors.
- **Base de Datos:** MongoDB y Mongoose.

## ⚠️ Solución de Problemas

- Si ves un error de **"Unauthorized (401)"** al intentar crear algo, probablemente tu sesión expiró. Cierra sesión y vuelve a ingresar.
- Si el backend dice **"Error conectando a MongoDB"**, asegúrate de que el servicio de MongoDB en tu computadora esté encendido.
