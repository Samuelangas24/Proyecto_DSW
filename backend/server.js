const express = require("express");
const cors = require("cors");
require('dotenv').config();
const mongoose = require('mongoose');
const Registro = require('./models/Registro');
const User = require('./models/User');
const Departamento = require('./models/Departamento');
const Turno = require('./models/Turno');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');

const app = express();

app.use(cors());
app.use(express.json());

// Log simple de todas las peticiones entrantes
app.use((req, res, next) => {
    console.log(new Date().toISOString(), req.method, req.path);
    next();
});

app.get("/", (req, res) => {
    res.json({ mensaje: "API Oficialía DSW funcionando" });
});

// --- RUTAS PÚBLICAS (AUTH) ---

app.post('/auth/register', async (req, res) => {
    try {
        const { nombre, email, password, role, departamento } = req.body;
        if (!email || !password) return res.status(400).json({ ok: false, error: 'Email and password required' });
        
        const existing = await User.findOne({ email });
        if (existing) return res.status(400).json({ ok: false, error: 'User exists' });
        
        const hash = await bcrypt.hash(password, 10);
        const user = await User.create({
            nombre,
            email,
            passwordHash: hash,
            role: role || 'oficialia',
            departamento
        });
        res.status(201).json({ ok: true, data: { id: user._id, email: user.email, role: user.role } });
    } catch (err) {
        console.error('Error register', err);
        res.status(500).json({ ok: false, error: 'Error registering user' });
    }
});

// Alias para registro (unificado con validación de departamento)
app.post('/register', async (req, res) => {
    try {
        const { nombre, email, password, role, departamento } = req.body;
        if (!email || !password) return res.status(400).json({ ok: false, error: 'Email and password required' });
        
        const existing = await User.findOne({ email });
        if (existing) return res.status(400).json({ ok: false, error: 'User exists' });
        
        const hash = await bcrypt.hash(password, 10);
        
        let deptoValido = null;
        if (departamento) {
            deptoValido = await Departamento.findById(departamento);
            if (!deptoValido) return res.status(400).json({ ok: false, error: 'Departamento no válido' });
        }
        
        const user = await User.create({ 
            nombre,
            email, 
            passwordHash: hash, 
            role: role || 'oficialia',
            departamento: deptoValido ? deptoValido._id : null
        });
        
        res.status(201).json({ 
            ok: true, 
            data: { 
                id: user._id, 
                email: user.email, 
                role: user.role,
                departamento: user.departamento 
            } 
        });
    } catch (err) {
        console.error('Error register alias', err);
        res.status(500).json({ ok: false, error: 'Error registering user' });
    }
});

app.post('/auth/login', async (req, res) => {
    try {
        const { email, password } = req.body;
        if (!email || !password) return res.status(400).json({ ok: false, error: 'Email and password required' });
        
        const user = await User.findOne({ email });
        if (!user) return res.status(400).json({ ok: false, error: 'Invalid credentials' });
        
        const ok = await bcrypt.compare(password, user.passwordHash);
        if (!ok) return res.status(400).json({ ok: false, error: 'Invalid credentials' });
        
        const token = jwt.sign({
            id: user._id,
            email: user.email,
            role: user.role,
            departamento: user.departamento
        }, process.env.JWT_SECRET || 'changeme', { expiresIn: '8h' });
        
        res.json({ ok: true, data: { token } });
    } catch (err) {
        console.error('Error login', err);
        res.status(500).json({ ok: false, error: 'Error logging in' });
    }
});

// --- MIDDLEWARES ---

app.use((req, res, next) => {
    const auth = req.headers.authorization;
    if (!auth) return next();
    const parts = auth.split(' ');
    if (parts.length !== 2) return next();
    const token = parts[1];
    try {
        const data = jwt.verify(token, process.env.JWT_SECRET || 'changeme');
        req.user = data;
    } catch (err) { /* ignore invalid token */ }
    next();
});

const requireRole = (rolesPermitidos) => {
    return (req, res, next) => {
        if (!req.user) return res.status(401).json({ ok: false, error: 'Inicia sesión para continuar' });
        if (!rolesPermitidos.includes(req.user.role)) {
            return res.status(403).json({ ok: false, error: 'No tienes permisos suficientes' });
        }
        next();
    };
};

const requireDepartmentAccess = async (req, res, next) => {
    try {
        if (!req.user) return res.status(401).json({ ok: false, error: 'Inicia sesión para continuar' });
        if (req.user.role === 'administrador' || req.user.role === 'oficialia') return next();
        
        const usuario = await User.findById(req.user.id).populate('departamento');
        if (!usuario.departamento) return res.status(403).json({ ok: false, error: 'No tienes departamento asignado' });
        
        if (req.params.id || req.params.folio) {
            const documentoId = req.params.id || req.params.folio;
            const documento = await Registro.findOne(req.params.folio ? { folio: documentoId } : { _id: documentoId });
            
            if (!documento) return res.status(404).json({ ok: false, error: 'Documento no encontrado' });
            if (!documento.departamentoAsignado || documento.departamentoAsignado.toString() !== usuario.departamento._id.toString()) {
                return res.status(403).json({ ok: false, error: 'No tienes permiso para ver este documento' });
            }
        }
        next();
    } catch (err) {
        res.status(500).json({ ok: false, error: 'Error verificando permisos' });
    }
};

// --- RUTAS PROTEGIDAS ---

app.get('/usuarios', requireRole(['administrador', 'oficialia']), async (req, res) => {
    try {
        const usuarios = await User.find()
            .select('-passwordHash')
            .populate('departamento', 'nombre responsable')
            .sort({ createdAt: -1 });
        res.json({ ok: true, data: usuarios });
    } catch (err) {
        res.status(500).json({ ok: false, error: 'Error obteniendo usuarios' });
    }
});

app.post('/registro', requireRole(['oficialia', 'administrador']), async (req, res) => {
    try {
        const { remitente, asunto, estado, departamentoAsignado } = req.body;
        let { folio } = req.body;

        if (!remitente || !asunto) return res.status(400).json({ ok: false, error: 'Remitente y asunto son requeridos' });

        if (!folio) {
            const count = await Registro.countDocuments();
            const year = new Date().getFullYear();
            folio = `DOC-${year}-${(count + 1).toString().padStart(3, '0')}`;
        }

        const creado = await Registro.create({ folio, remitente, asunto, estado, departamentoAsignado });
        res.status(201).json({ ok: true, data: creado });
    } catch (err) {
        if (err.code === 11000) return res.status(400).json({ ok: false, error: 'Folio ya existe' });
        res.status(500).json({ ok: false, error: 'Error creando registro' });
    }
});

app.get('/registro/:folio', requireDepartmentAccess, async (req, res) => {
    try {
        const doc = await Registro.findOne({ folio: req.params.folio }).populate('departamentoAsignado');
        if (!doc) return res.status(404).json({ ok: false, error: 'Documento no encontrado' });
        res.json({ ok: true, data: doc });
    } catch (err) {
        res.status(500).json({ ok: false, error: 'Error al buscar documento' });
    }
});

app.put('/registro/:id', async (req, res) => {
    try {
        if (!req.user) return res.status(401).json({ ok: false, error: 'Unauthorized' });
        const actualizado = await Registro.findByIdAndUpdate(req.params.id, req.body, { new: true });
        res.json({ ok: true, data: actualizado });
    } catch (err) {
        res.status(500).json({ ok: false, error: 'Error actualizando documento' });
    }
});

app.put('/documentos/:id/asignar', requireRole(['oficialia', 'administrador']), async (req, res) => {
    try {
        const { usuarioId, departamentoId } = req.body;
        if (!usuarioId && !departamentoId) return res.status(400).json({ ok: false, error: 'Faltan datos' });
        
        const documento = await Registro.findById(req.params.id);
        if (!documento) return res.status(404).json({ ok: false, error: 'Documento no encontrado' });
        
        if (usuarioId) {
            const usuario = await User.findById(usuarioId).populate('departamento');
            if (!usuario || !usuario.departamento) return res.status(400).json({ ok: false, error: 'Usuario o depto inválido' });
            documento.departamentoAsignado = usuario.departamento._id;
            documento.usuarioAsignado = usuarioId;
        } else if (departamentoId) {
            documento.departamentoAsignado = departamentoId;
        }
        
        const actualizado = await documento.save();
        await Turno.create({
            documento: req.params.id,
            usuario: req.user.id,
            estadoAnterior: documento.estado,
            estadoNuevo: documento.estado,
            departamentoDestino: actualizado.departamentoAsignado,
            observaciones: `Asignado por ${req.user.email}`
        });
        
        res.json({ ok: true, data: await actualizado.populate('departamentoAsignado', 'nombre') });
    } catch (err) {
        res.status(500).json({ ok: false, error: 'Error asignando documento' });
    }
});

app.get('/mis-tareas', async (req, res) => {
    try {
        if (!req.user) return res.status(401).json({ ok: false, error: 'Inicia sesión' });
        const usuario = await User.findById(req.user.id).populate('departamento');
        
        let query = {};
        if (usuario.role !== 'administrador' && usuario.role !== 'oficialia') {
            if (!usuario.departamento) return res.json({ ok: true, data: [] });
            query.departamentoAsignado = usuario.departamento._id;
        }
        
        const tareas = await Registro.find(query).populate('departamentoAsignado').sort({ createdAt: -1 });
        res.json({ ok: true, data: tareas });
    } catch (err) {
        res.status(500).json({ ok: false, error: 'Error obteniendo tareas' });
    }
});

// --- SERVICIOS ADICIONALES ---

app.post('/departamentos', requireRole(['administrador']), async (req, res) => {
    try {
        const depto = await Departamento.create(req.body);
        res.status(201).json({ ok: true, data: depto });
    } catch (err) {
        res.status(500).json({ ok: false, error: 'Error al crear departamento' });
    }
});

app.get('/departamentos', async (req, res) => {
    try {
        const deptos = await Departamento.find();
        res.json({ ok: true, data: deptos });
    } catch (err) {
        res.status(500).json({ ok: false, error: 'Error' });
    }
});

app.post('/turnos', async (req, res) => {
    try {
        if (!req.user) return res.status(401).json({ ok: false, error: 'Unauthorized' });
        const { documentoId, estadoNuevo, departamentoDestino, observaciones } = req.body;
        
        const doc = await Registro.findById(documentoId);
        if (!doc) return res.status(404).json({ ok: false, error: 'No encontrado' });

        const turno = await Turno.create({
            documento: documentoId,
            usuario: req.user.id,
            estadoAnterior: doc.estado,
            estadoNuevo,
            departamentoDestino,
            observaciones
        });

        doc.estado = estadoNuevo;
        if (departamentoDestino) doc.departamentoAsignado = departamentoDestino;
        await doc.save();

        res.status(201).json({ ok: true, data: turno });
    } catch (err) {
        res.status(500).json({ ok: false, error: 'Error al turnar' });
    }
});

app.get('/reportes', async (req, res) => {
    try {
        const total = await Registro.countDocuments();
        res.json({ ok: true, data: { total } });
    } catch (err) {
        res.status(500).json({ ok: false, error: 'Error reportes' });
    }
});

// --- INICIO DEL SERVIDOR ---

const http = require('http');
const PORT = process.env.PORT || 3001;
const MONGO_URI = process.env.MONGO_URI || 'mongodb://127.0.0.1:27017/oficialia';

mongoose.connect(MONGO_URI).then(async () => {
    console.log('Conectado a MongoDB');
    const server = http.createServer(app);
    server.listen(PORT, () => console.log(`Servidor en puerto ${PORT}`));
}).catch(err => {
    console.error('Error DB', err);
    process.exit(1);
});