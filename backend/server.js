const express = require('express');
const cors = require('cors');
require('dotenv').config();
const mongoose = require('mongoose');
const http = require('http');
const bcrypt = require('bcryptjs');
const User = require('./models/User');
const { verifyToken } = require('./middlewares/auth');

const authRoutes = require('./routes/auth');
const usuariosRoutes = require('./routes/usuarios');
const documentosRoutes = require('./routes/documentos');
const departamentosRoutes = require('./routes/departamentos');
const turnosRoutes = require('./routes/turnos');
const reportesRoutes = require('./routes/reportes');

const app = express();

app.use(cors());
app.use(express.json());

app.use((req, res, next) => {
    console.log(new Date().toISOString(), req.method, req.path);
    next();
});

app.use(verifyToken);

app.get('/', (req, res) => {
    res.json({ mensaje: 'API Oficialia DSW funcionando' });
});

app.use('/auth', authRoutes);
app.use('/', authRoutes);
app.use('/usuarios', usuariosRoutes);
app.use('/registro', documentosRoutes);
app.use('/documentos', documentosRoutes);
app.use('/bandeja', documentosRoutes);
app.use('/departamentos', departamentosRoutes);
app.use('/turnos', turnosRoutes);
app.use('/reportes', reportesRoutes);

const PORT = process.env.PORT || 3001;
const MONGO_URI = process.env.MONGO_URI || 'mongodb://127.0.0.1:27017/oficialia';

mongoose.connect(MONGO_URI).then(async () => {
    console.log('Conectado a MongoDB');

    try {
        const count = await User.countDocuments();
        if (count === 0) {
            const hash = await bcrypt.hash('admin123', 10);
            await User.create({
                email: 'admin@local',
                passwordHash: hash,
                role: 'administrador'
            });
            console.log('Usuario admin creado: admin@local / admin123');
        }
    } catch (err) {
        console.error('Error creando usuario admin', err);
    }

    const server = http.createServer(app);
    server.listen(PORT, () => {
        console.log(`Servidor backend corriendo en puerto ${PORT}`);
    });
}).catch((err) => {
    console.error('Error conectando a MongoDB', err);
    process.exit(1);
});
