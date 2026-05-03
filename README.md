# 📋 Sistema de Gestión Documental - Proyecto DSW

## 🚀 Requisitos Previos

Antes de comenzar, asegúrate de tener instalado en tu computadora:

### **Software Obligatorio:**
1. **Node.js** (v14 o superior) - Incluye npm
   - Descarga desde: https://nodejs.org/
   - Verifica la instalación: `node --version` y `npm --version`

2. **Git** - Para clonar el repositorio
   - Descarga desde: https://git-scm.com/

3. **Editor de código** (recomendado: VS Code)
   - Descarga desde: https://code.visualstudio.com/

---

## 📦 Librerías y Dependencias del Proyecto

El proyecto utiliza las siguientes librerías que se **instalarán automáticamente**:

### **Dependencias Principales:**
- `react` (^18.2.0) - Framework principal
- `react-dom` (^18.2.0) - Renderizado de React en el navegador
- `react-router-dom` (^7.14.2) - Enrutamiento entre páginas
- `react-scripts` (5.0.1) - Herramientas de build
- `axios` (^1.16.0) - Cliente HTTP para peticiones

### **Dependencias de Desarrollo:**
- `tailwindcss` (^3.4.19) - Framework CSS para estilos
- `postcss` (^8.5.13) - Procesador de CSS
- `autoprefixer` (^10.5.0) - Compatibilidad CSS en navegadores

---

## 🔧 Pasos para Clonar y Ejecutar el Proyecto

### **1. Clonar el repositorio**
```bash
git clone https://github.com/Samuelangas24/Proyecto_DSW.git
cd Proyecto_DSW
```

### **2. Instalar dependencias**
```bash
npm install
```
> Esto descargará e instalará todas las librerías necesarias (package.json las especifica automáticamente)

### **3. Iniciar la aplicación**
```bash
npm start
```
> La aplicación se abrirá en `http://localhost:3000` automáticamente

### **4. Para compilar para producción**
```bash
npm run build
```

---

## 📁 Estructura del Proyecto

```
src/
├── App.jsx              # Componente principal
├── index.js             # Punto de entrada
├── index.css            # Estilos globales (Tailwind)
├── components/          # Componentes reutilizables
│   ├── Navbar.jsx
│   ├── Sidebar.jsx
│   └── StatCard.jsx
└── page/                # Páginas de la aplicación
    └── Dashboard.jsx
```

---

## 🎯 Comandos Útiles

```bash
# Iniciar desarrollo
npm start

# Compilar para producción
npm run build

# Ejecutar pruebas
npm test

# Limpiar caché
rm -r node_modules/.cache
```

---

## 💡 Consideraciones Importantes

1. **No subir `node_modules` a Git** ✅ (Ya está en .gitignore)
   - Solo tus compañeros necesitan hacer `npm install`

2. **Puertos disponibles:**
   - Si el puerto 3000 está en uso, React sugiere automáticamente otro puerto

3. **Configurar Git por primera vez:**
   ```bash
   git config --global user.email "tu_email@gmail.com"
   git config --global user.name "Tu Nombre"
   ```

4. **Hacer cambios y subirlos:**
   ```bash
   git add .
   git commit -m "Descripción del cambio"
   git push origin main
   ```

---

## ⚠️ Solución de Problemas

| Problema | Solución |
|----------|----------|
| `npm: command not found` | Instala Node.js desde nodejs.org |
| Puerto 3000 en uso | npm start sugerirá otro puerto automáticamente |
| Error de estilos (Tailwind) | Ejecuta `rm -r node_modules && npm install` |
| Cambios no aparecen | Recarga el navegador (Ctrl+R o Cmd+R) |

---

## 📞 Soporte

claudecode.com
chatgpt.com

