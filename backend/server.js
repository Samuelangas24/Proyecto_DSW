const express = require("express");
const cors = require("cors");
require('dotenv').config();
const mongoose = require('mongoose');
const { verifyToken } = require('./middlewares/auth');

// Importar rutas
const authRoutes = require('./routes/auth');
const usuariosRoutes = require('./routes/usuarios');
const documentosRoutes = require('./routes/documentos');
const departamentosRoutes = require('./routes/departamentos');
const turnosRoutes = require('./routes/turnos');
const reportesRoutes = require('./routes/reportes');

const app = express();

app.use(cors());
app.use(express.json());

// Log simple de peticiones
app.use((req, res, next) => {
    console.log(new Date().toISOString(), req.method, req.path);
    next();
});

// Middleware de autenticación global (antes de las rutas que lo necesiten)
// Aplicar globalmente, decodifica si hay token, pasa req.user
app.use(verifyToken);

app.get("/", (req, res) => {
    res.json({ mensaje: "API Oficialía DSW funcionando" });
});

// Usar rutas modulares
app.use('/auth', authRoutes);
app.use('/register', authRoutes); // Alias
app.use('/usuarios', usuariosRoutes);
app.use('/registro', documentosRoutes); // Mantenemos /registro por compatibilidad con frontend
app.use('/documentos', documentosRoutes);
app.use('/bandeja', documentosRoutes); // Bandeja es la ruta raíz GET de documentos
app.use('/departamentos', departamentosRoutes);
app.use('/turnos', turnosRoutes);
app.use('/reportes', reportesRoutes);

// --- INICIO DEL SERVIDOR ---
const http = require('http');
const PORT = process.env.PORT || 3001;
const MONGO_URI = process.env.MONGO_URI || 'mongodb://127.0.0.1:27017/oficialia';

mongoose.connect(MONGO_URI).then(async () => {
    console.log('Conectado a MongoDB');
    
    // Crear admin por defecto si no existe
    const User = require('./models/User');
    const bcrypt = require('bcryptjs');
    try {
        const count = await User.countDocuments();
        if (count === 0) {
            const hash = await bcrypt.hash('admin123', 10);
            await User.create({ email: 'admin@local', passwordHash: hash, role: 'administrador' });
            console.log('Usuario admin creado: admin@local / admin123');
        }
    } catch (err) {
        console.error('Error creando usuario admin', err);
    }

    const server = http.createServer(app);
    server.listen(PORT, () => console.log(`Servidor en puerto ${PORT}`));
}).catch(err => {
    console.error('Error DB', err);
    process.exit(1);
});
