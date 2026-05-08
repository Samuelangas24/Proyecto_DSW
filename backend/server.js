const express = require("express");
const cors = require("cors");
require('dotenv').config();
const mongoose = require('mongoose');
const Registro = require('./models/Registro');
const User = require('./models/User');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');

const app = express();

app.use(cors());
app.use(express.json());
// Log simple de todas las peticiones entrantes (diagnóstico)
app.use((req, res, next) => {
    console.log(new Date().toISOString(), req.method, req.path);
    next();
});

app.get("/", (req, res) => {
    res.json({ mensaje: "API Oficialía DSW funcionando" });
});

// Endpoint para crear un nuevo registro (persistente)
app.post('/registro', async (req, res) => {
    try {
        // require auth
        if (!req.user) return res.status(401).json({ ok: false, error: 'Unauthorized' });
        const { folio, remitente, asunto, estado } = req.body;
        if (!folio || !remitente || !asunto) return res.status(400).json({ ok: false, error: 'Folio, remitente y asunto son requeridos' });
        try {
            const creado = await Registro.create({ folio, remitente, asunto, estado });
            res.status(201).json({ ok: true, data: creado });
        } catch (e) {
            if (e.code === 11000) {
                return res.status(400).json({ ok: false, error: 'Folio ya existe' });
            }
            throw e;
        }
    } catch (err) {
        console.error('Error creando registro', err);
        res.status(500).json({ ok: false, error: 'Error creando registro' });
    }
});

// Auth routes
console.log('Definiendo ruta POST /auth/register');
app.post('/auth/register', async (req, res) => {
    try {
        const { email, password, role } = req.body;
        if (!email || !password) return res.status(400).json({ ok: false, error: 'Email and password required' });
        const existing = await User.findOne({ email });
        if (existing) return res.status(400).json({ ok: false, error: 'User exists' });
        const hash = await bcrypt.hash(password, 10);
        const user = await User.create({ email, passwordHash: hash, role: role || 'user' });
        res.status(201).json({ ok: true, data: { id: user._id, email: user.email, role: user.role } });
    } catch (err) {
        console.error('Error register', err);
        res.status(500).json({ ok: false, error: 'Error registering user' });
    }
});

// Alias simple para registro: POST /register (por compatibilidad)
console.log('Definiendo ruta POST /register');
app.post('/register', async (req, res) => {
    try {
        const { email, password, role } = req.body;
        if (!email || !password) return res.status(400).json({ ok: false, error: 'Email and password required' });
        const existing = await User.findOne({ email });
        if (existing) return res.status(400).json({ ok: false, error: 'User exists' });
        const hash = await bcrypt.hash(password, 10);
        const user = await User.create({ email, passwordHash: hash, role: role || 'user' });
        res.status(201).json({ ok: true, data: { id: user._id, email: user.email, role: user.role } });
    } catch (err) {
        console.error('Error register alias', err);
        res.status(500).json({ ok: false, error: 'Error registering user' });
    }
});

console.log('Definiendo ruta POST /auth/login');
app.post('/auth/login', async (req, res) => {
    try {
        const { email, password } = req.body;
        if (!email || !password) return res.status(400).json({ ok: false, error: 'Email and password required' });
        const user = await User.findOne({ email });
        if (!user) return res.status(400).json({ ok: false, error: 'Invalid credentials' });
        const ok = await bcrypt.compare(password, user.passwordHash);
        if (!ok) return res.status(400).json({ ok: false, error: 'Invalid credentials' });
        const token = jwt.sign({ id: user._id, email: user.email, role: user.role }, process.env.JWT_SECRET || 'changeme', { expiresIn: '8h' });
        res.json({ ok: true, data: { token } });
    } catch (err) {
        console.error('Error login', err);
        res.status(500).json({ ok: false, error: 'Error logging in' });
    }
});

// Middleware to authenticate token
app.use((req, res, next) => {
    const auth = req.headers.authorization;
    if (!auth) return next();
    const parts = auth.split(' ');
    if (parts.length !== 2) return next();
    const token = parts[1];
    try {
        const data = jwt.verify(token, process.env.JWT_SECRET || 'changeme');
        req.user = data;
    } catch (err) {
        // ignore invalid token
    }
    next();
});

// Obtener todos los registros (bandeja de entrada)
app.get('/bandeja', async (req, res) => {
    try {
        const docs = await Registro.find().sort({ createdAt: -1 }).limit(100);
        res.json({ ok: true, data: docs });
    } catch (err) {
        console.error('Error obteniendo bandeja', err);
        res.status(500).json({ ok: false, error: 'Error obteniendo bandeja' });
    }
});

// Estadísticas / reportes básicos
app.get('/reportes', async (req, res) => {
    try {
        const total = await Registro.countDocuments();
        const byEstadoAgg = await Registro.aggregate([
            { $group: { _id: '$estado', count: { $sum: 1 } } }
        ]);
        const byRemitenteAgg = await Registro.aggregate([
            { $group: { _id: '$remitente', count: { $sum: 1 } } },
            { $sort: { count: -1 } }
        ]);

        const byEstado = {};
        byEstadoAgg.forEach(i => { byEstado[i._id || 'Desconocido'] = i.count; });

        const byRemitente = {};
        byRemitenteAgg.forEach(i => { byRemitente[i._id || 'Desconocido'] = i.count; });

        res.json({ ok: true, data: { total, byEstado, byRemitente } });
    } catch (err) {
        console.error('Error generando reportes', err);
        res.status(500).json({ ok: false, error: 'Error generando reportes' });
    }
});

// Debug: mostrar estado del router ahora
try {
    console.log('DEBUG app._router type:', typeof app._router);
    console.log('DEBUG app._router exists:', !!app._router);
    console.log('DEBUG app._router.stack length:', app._router && app._router.stack ? app._router.stack.length : 'N/A');
} catch (e) {
    console.error('DEBUG error reading app._router', e);
}

// Conectar a MongoDB y levantar servidor
const http = require('http');
const PORT = process.env.PORT || 3001;
const MONGO_URI = process.env.MONGO_URI || 'mongodb://127.0.0.1:27017/oficialia';

mongoose.connect(MONGO_URI).then(async () => {
    console.log('Conectado a MongoDB');
    // Crear usuario admin por defecto si no existe
    try {
        const count = await User.countDocuments();
        if (count === 0) {
            const hash = await bcrypt.hash('admin123', 10);
            await User.create({ email: 'admin@local', passwordHash: hash, role: 'admin' });
            console.log('Usuario admin creado: admin@local / admin123');
        }
    } catch (err) {
        console.error('Error creando usuario admin', err);
    }

    const server = http.createServer((req, res) => {
        console.log('RAW REQUEST:', req.method, req.url);
        app(req, res);
    });

    server.listen(PORT, () => {
        console.log(`Servidor backend corriendo en puerto ${PORT}`);
    });
}).catch(err => {
    console.error('Error conectando a MongoDB', err);
    process.exit(1);
});

// Listar rutas registradas (debug) si es posible
try {
    if (app._router && app._router.stack) {
        const routes = [];
        app._router.stack.forEach(mw => {
            if (mw.route) {
                const methods = Object.keys(mw.route.methods).join(',');
                routes.push({ path: mw.route.path, methods });
            }
        });
        console.log('Rutas (pre-start):', routes);
    } else {
        console.log('No hay router montado aún');
    }
} catch (e) {
    console.error('Error listando rutas (pre-start)', e);
}