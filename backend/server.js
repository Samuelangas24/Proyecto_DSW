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
// Log simple de todas las peticiones entrantes (diagnóstico)
app.use((req, res, next) => {
    console.log(new Date().toISOString(), req.method, req.path);
    next();
});

app.get("/", (req, res) => {
    res.json({ mensaje: "API Oficialía DSW funcionando" });
});

// Rutas Públicas (Auth)
console.log('Definiendo ruta POST /auth/register');
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

// Alias simple para registro: POST /register (por compatibilidad)
console.log('Definiendo ruta POST /register');
app.post('/register', async (req, res) => {
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
        }); res.status(201).json({ ok: true, data: { id: user._id, email: user.email, role: user.role } });
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

// MIDDLEWARE DE AUTENTICACIÓN (Debe ir antes de las rutas protegidas)
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

// MIDDLEWARE DE ROLES
const requireRole = (rolesPermitidos) => {
    return (req, res, next) => {
        if (!req.user) {
            return res.status(401).json({ ok: false, error: 'Inicia sesión para continuar' });
        }
        if (!rolesPermitidos.includes(req.user.role)) {
            return res.status(403).json({ ok: false, error: 'No tienes permisos suficientes (Requiere rol: ' + rolesPermitidos.join(' o ') + ')' });
        }
        next();
    };
};

// RUTAS PROTEGIDAS
// Obtener usuarios
app.get('/usuarios', requireRole(['administrador']), async (req, res) => {

    try {

        const usuarios = await User.find()
            .populate('departamento', 'nombre responsable');

        res.json({
            ok: true,
            data: usuarios
        });

    } catch (err) {

        console.error('Error obteniendo usuarios', err);

        res.status(500).json({
            ok: false,
            error: 'Error obteniendo usuarios'
        });

    }

});
// Obtener tareas asignadas al usuario
app.get('/mis-tareas', async (req, res) => {

    try {

        if (!req.user) {
            return res.status(401).json({
                ok: false,
                error: 'Unauthorized'
            });
        }

        const tareas = await Registro.find({
            usuarioAsignado: req.user.id
        })
            .populate('departamentoAsignado', 'nombre')
            .populate('usuarioAsignado', 'nombre email');

        res.json({
            ok: true,
            data: tareas
        });

    } catch (err) {

        console.error('Error obteniendo tareas', err);

        res.status(500).json({
            ok: false,
            error: 'Error obteniendo tareas'
        });

    }

});
// Asignar documento a usuario
app.put('/documentos/:id/asignar', async (req, res) => {

    try {

        if (!req.user) {
            return res.status(401).json({
                ok: false,
                error: 'Unauthorized'
            });
        }

        const { usuarioAsignado } = req.body;

        const documento = await Registro.findById(req.params.id);

        if (!documento) {
            return res.status(404).json({
                ok: false,
                error: 'Documento no encontrado'
            });
        }

        const usuario = await User.findById(usuarioAsignado);

        if (!usuario) {
            return res.status(404).json({
                ok: false,
                error: 'Usuario no encontrado'
            });
        }

        documento.usuarioAsignado = usuarioAsignado;

        await documento.save();

        res.json({
            ok: true,
            message: 'Documento asignado correctamente',
            data: documento
        });

    } catch (err) {

        console.error('Error asignando documento', err);

        res.status(500).json({
            ok: false,
            error: 'Error asignando documento'
        });

    }

});
// Endpoint para crear un nuevo registro (Solo Oficialía y Admin)
app.post('/registro', requireRole(['oficialia', 'administrador']), async (req, res) => {
    try {
        const { remitente, asunto, estado, departamentoAsignado } = req.body;
        let { folio } = req.body;

        if (!remitente || !asunto) return res.status(400).json({ ok: false, error: 'Remitente y asunto son requeridos' });

        // Generar folio automáticamente si no viene
        if (!folio) {
            const count = await Registro.countDocuments();
            const year = new Date().getFullYear();
            folio = `DOC-${year}-${(count + 1).toString().padStart(3, '0')}`;
        }

        try {
            const creado = await Registro.create({ folio, remitente, asunto, estado, departamentoAsignado });
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

// Endpoint para buscar por folio
app.get('/registro/:folio', async (req, res) => {
    try {
        const doc = await Registro.findOne({ folio: req.params.folio }).populate('departamentoAsignado');
        if (!doc) return res.status(404).json({ ok: false, error: 'Documento no encontrado' });
        res.json({ ok: true, data: doc });
    } catch (err) {
        res.status(500).json({ ok: false, error: 'Error al buscar documento' });
    }
});

// Endpoint para actualizar documento
app.put('/registro/:id', async (req, res) => {
    try {
        if (!req.user) return res.status(401).json({ ok: false, error: 'Unauthorized' });
        const actualizado = await Registro.findByIdAndUpdate(req.params.id, req.body, { new: true });
        res.json({ ok: true, data: actualizado });
    } catch (err) {
        res.status(500).json({ ok: false, error: 'Error actualizando documento' });
    }
});

// SERVICIO DE DEPARTAMENTOS
app.post('/departamentos', requireRole(['administrador']), async (req, res) => {
    try {
        const { nombre, responsable, descripcion } = req.body;
        if (!nombre || !responsable) return res.status(400).json({ ok: false, error: 'Nombre y responsable son requeridos' });

        const depto = await Departamento.create({ nombre, responsable, descripcion });
        res.status(201).json({ ok: true, data: depto });
    } catch (err) {
        if (err.code === 11000) return res.status(400).json({ ok: false, error: 'El departamento ya existe' });
        res.status(500).json({ ok: false, error: 'Error al crear departamento' });
    }
});

app.get('/departamentos', async (req, res) => {
    try {
        const deptos = await Departamento.find();
        res.json({ ok: true, data: deptos });
    } catch (err) {
        res.status(500).json({ ok: false, error: 'Error al obtener departamentos' });
    }
});

// SERVICIO DE TURNOS Y SEGUIMIENTO
app.post('/turnos', async (req, res) => {
    try {
        if (!req.user) return res.status(401).json({ ok: false, error: 'Unauthorized' });
        const { documentoId, estadoNuevo, departamentoDestino, observaciones } = req.body;

        if (!documentoId || !estadoNuevo || !observaciones) {
            return res.status(400).json({ ok: false, error: 'Faltan datos obligatorios para el turno' });
        }

        // Buscar documento para saber su estado anterior
        const doc = await Registro.findById(documentoId);
        if (!doc) return res.status(404).json({ ok: false, error: 'Documento no encontrado' });

        const estadoAnterior = doc.estado;

        // Crear registro en el historial
        const turno = await Turno.create({
            documento: documentoId,
            usuario: req.user.id,
            estadoAnterior,
            estadoNuevo,
            departamentoDestino: departamentoDestino || null,
            observaciones
        });

        // Actualizar el estado y el departamento en el documento principal
        doc.estado = estadoNuevo;
        if (departamentoDestino) {
            doc.departamentoAsignado = departamentoDestino;
        }
        await doc.save();

        res.status(201).json({ ok: true, data: turno });
    } catch (err) {
        console.error('Error creando turno', err);
        res.status(500).json({ ok: false, error: 'Error al turnar documento' });
    }
});

app.get('/turnos/:idDocumento', async (req, res) => {
    try {
        if (!req.user) return res.status(401).json({ ok: false, error: 'Unauthorized' });
        const historial = await Turno.find({ documento: req.params.idDocumento })
            .populate('usuario', 'email role')
            .populate('departamentoDestino', 'nombre')
            .sort({ createdAt: -1 });

        res.json({ ok: true, data: historial });
    } catch (err) {
        res.status(500).json({ ok: false, error: 'Error obteniendo historial' });
    }
});

// Obtener todos los registros (bandeja de entrada)
app.get('/bandeja', async (req, res) => {
    try {
        let filtro = {};

        if (req.user && req.user.role !== 'administrador') {

            filtro.departamentoAsignado = req.user.departamento;

        }

        const docs = await Registro.find(filtro)
            .sort({ createdAt: -1 })
            .limit(100)
            .populate('departamentoAsignado', 'nombre');
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
            await User.create({ email: 'admin@local', passwordHash: hash, role: 'administrador' });
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