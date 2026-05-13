const express = require('express');
const Registro = require('../models/Registro');
const Turno = require('../models/Turno');
const User = require('../models/User');
const { requireRole, requireDepartmentAccess } = require('../middlewares/auth');

const router = express.Router();

// Obtener bandeja
router.get('/', async (req, res) => {
    try {
        const docs = await Registro.find().sort({ createdAt: -1 }).limit(100);
        res.json({ ok: true, data: docs });
    } catch (err) {
        console.error('Error obteniendo bandeja', err);
        res.status(500).json({ ok: false, error: 'Error obteniendo bandeja' });
    }
});

// Crear registro
router.post('/', requireRole(['oficialia', 'administrador']), async (req, res) => {
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

// Buscar por folio
router.get('/:folio', requireDepartmentAccess, async (req, res) => {
    try {
        const doc = await Registro.findOne({ folio: req.params.folio }).populate('departamentoAsignado');
        if (!doc) return res.status(404).json({ ok: false, error: 'Documento no encontrado' });
        res.json({ ok: true, data: doc });
    } catch (err) {
        res.status(500).json({ ok: false, error: 'Error al buscar documento' });
    }
});

// Actualizar básico
router.put('/:id', async (req, res) => {
    try {
        if (!req.user) return res.status(401).json({ ok: false, error: 'Unauthorized' });
        const actualizado = await Registro.findByIdAndUpdate(req.params.id, req.body, { new: true });
        res.json({ ok: true, data: actualizado });
    } catch (err) {
        res.status(500).json({ ok: false, error: 'Error actualizando documento' });
    }
});

// Asignar
router.put('/:id/asignar', requireRole(['oficialia', 'administrador']), async (req, res) => {
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

module.exports = router;
