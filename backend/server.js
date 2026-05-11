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
        const { email, password, role } = req.body;
        if (!email || !password) return res.status(400).json({ ok: false, error: 'Email and password required' });
        const existing = await User.findOne({ email });
        if (existing) return res.status(400).json({ ok: false, error: 'User exists' });
        const hash = await bcrypt.hash(password, 10);
        const user = await User.create({ email, passwordHash: hash, role: role || 'oficialia' });
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
        const { email, password, role, departamento } = req.body;
        if (!email || !password) return res.status(400).json({ ok: false, error: 'Email and password required' });
        const existing = await User.findOne({ email });
        if (existing) return res.status(400).json({ ok: false, error: 'User exists' });
        const hash = await bcrypt.hash(password, 10);
        
        // Validar que el departamento exista si se proporciona
        let deptoValido = null;
        if (departamento) {
            deptoValido = await Departamento.findById(departamento);
            if (!deptoValido) return res.status(400).json({ ok: false, error: 'Departamento no válido' });
        }
        
        const user = await User.create({ 
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

// MIDDLEWARE DE RESTRICCIÓN POR DEPARTAMENTO
const requireDepartmentAccess = async (req, res, next) => {
    try {
        if (!req.user) {
            return res.status(401).json({ ok: false, error: 'Inicia sesión para continuar' });
        }
        
        // Admin y oficialía pueden ver todo
        if (req.user.role === 'administrador' || req.user.role === 'oficialia') {
            return next();
        }
        
        // Obtener información del usuario con su departamento
        const usuario = await User.findById(req.user.id).populate('departamento');
        
        if (!usuario.departamento) {
            return res.status(403).json({ ok: false, error: 'No tienes departamento asignado' });
        }
        
        // Para endpoints que acceden a documentos específicos, verificar que pertenezcan al departamento del usuario
        if (req.params.id || req.params.folio) {
            const documentoId = req.params.id || req.params.folio;
            const documento = await Registro.findOne(
                req.params.folio ? { folio: documentoId } : { _id: documentoId }
            );
            
            if (!documento) {
                return res.status(404).json({ ok: false, error: 'Documento no encontrado' });
            }
            
            // Verificar que el documento esté asignado al departamento del usuario
            if (!documento.departamentoAsignado || 
                documento.departamentoAsignado.toString() !== usuario.departamento._id.toString()) {
                return res.status(403).json({ ok: false, error: 'No tienes permiso para ver este documento' });
            }
        }
        
        next();
    } catch (err) {
        console.error('Error en middleware de departamento', err);
        res.status(500).json({ ok: false, error: 'Error verificando permisos de departamento' });
    }
};

// RUTAS PROTEGIDAS

// Endpoint para listar usuarios
app.get('/usuarios', requireRole(['administrador', 'oficialia']), async (req, res) => {
    try {
        const usuarios = await User.find()
            .select('-passwordHash')
            .populate('departamento', 'nombre responsable')
            .sort({ createdAt: -1 });
        res.json({ ok: true, data: usuarios });
    } catch (err) {
        console.error('Error obteniendo usuarios', err);
        res.status(500).json({ ok: false, error: 'Error obteniendo usuarios' });
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
app.get('/registro/:folio', requireDepartmentAccess, async (req, res) => {
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

// Endpoint para asignar documento a usuario específico
app.put('/documentos/:id/asignar', requireRole(['oficialia', 'administrador']), async (req, res) => {
    try {
        const { usuarioId, departamentoId } = req.body;
        
        if (!usuarioId && !departamentoId) {
            return res.status(400).json({ ok: false, error: 'Debe proporcionar usuarioId o departamentoId' });
        }
        
        // Verificar que el documento existe
        const documento = await Registro.findById(req.params.id);
        if (!documento) return res.status(404).json({ ok: false, error: 'Documento no encontrado' });
        
        // Si se proporciona usuarioId, validar que exista y obtener su departamento
        if (usuarioId) {
            const usuario = await User.findById(usuarioId).populate('departamento');
            if (!usuario) return res.status(400).json({ ok: false, error: 'Usuario no encontrado' });
            
            if (!usuario.departamento) {
                return res.status(400).json({ ok: false, error: 'El usuario no tiene departamento asignado' });
            }
            
            // Asignar al departamento del usuario
            documento.departamentoAsignado = usuario.departamento._id;
        } 
        // Si se proporciona departamentoId, validar que exista
        else if (departamentoId) {
            const departamento = await Departamento.findById(departamentoId);
            if (!departamento) return res.status(400).json({ ok: false, error: 'Departamento no encontrado' });
            
            documento.departamentoAsignado = departamentoId;
        }
        
        const actualizado = await documento.save();
        
        // Crear registro en el historial de turnos
        await Turno.create({
            documento: req.params.id,
            usuario: req.user.id,
            estadoAnterior: documento.estado,
            estadoNuevo: documento.estado,
            departamentoDestino: actualizado.departamentoAsignado,
            observaciones: `Documento asignado por ${req.user.email}`
        });
        
        res.json({ 
            ok: true, 
            data: await actualizado.populate('departamentoAsignado', 'nombre responsable')
        });
    } catch (err) {
        console.error('Error asignando documento', err);
        res.status(500).json({ ok: false, error: 'Error asignando documento' });
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

// Endpoint para tareas personales del usuario
app.get('/mis-tareas', async (req, res) => {
    try {
        if (!req.user) return res.status(401).json({ ok: false, error: 'Inicia sesión para continuar' });
        
        // Obtener información del usuario con su departamento
        const usuario = await User.findById(req.user.id).populate('departamento');
        
        let query = {};
        
        // Si es administrador u oficialía, puede ver todos los documentos
        if (usuario.role === 'administrador' || usuario.role === 'oficialia') {
            // No aplicar filtro de departamento
        } 
        // Si es de departamento, solo ver documentos asignados a su departamento
        else if (usuario.role === 'departamento' && usuario.departamento) {
            query.departamentoAsignado = usuario.departamento._id;
        } else {
            // Si no tiene departamento asignado, devolver lista vacía
            return res.json({ ok: true, data: [] });
        }
        
        const tareas = await Registro.find(query)
            .populate('departamentoAsignado', 'nombre responsable')
            .sort({ createdAt: -1 })
            .limit(50);
            
        res.json({ ok: true, data: tareas });
    } catch (err) {
        console.error('Error obteniendo mis tareas', err);
        res.status(500).json({ ok: false, error: 'Error obteniendo tareas' });
    }
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