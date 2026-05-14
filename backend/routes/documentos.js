const express = require('express');
const Registro = require('../models/Registro');
const Turno = require('../models/Turno');
const User = require('../models/User');
const { requireRole, requireDepartmentAccess } = require('../middlewares/auth');

const router = express.Router();

const estadosValidos = [
    'Recibido',
    'Turnado',
    'En atención',
    'En Atención',
    'En Proceso',
    'Atendido',
    'Completado',
    'Archivado'
];

// Obtener bandeja con filtros y paginacion
router.get('/', async (req, res) => {
    try {
        const {
            estado,
            remitente,
            departamento,
            pagina = 1,
            limite = 10
        } = req.query;

        const page = Math.max(Number(pagina) || 1, 1);
        const pageSize = Math.min(Math.max(Number(limite) || 10, 1), 1000);
        const filtro = {};

        if (estado) filtro.estado = estado;
        if (remitente) {
            filtro.remitente = {
                $regex: remitente,
                $options: 'i'
            };
        }
        if (departamento === 'sin_asignar') {
            filtro.departamentoAsignado = null;
        } else if (departamento) {
            filtro.departamentoAsignado = departamento;
        }

        const [docs, total] = await Promise.all([
            Registro.find(filtro)
                .populate('departamentoAsignado', 'nombre')
                .sort({ createdAt: -1 })
                .skip((page - 1) * pageSize)
                .limit(pageSize),
            Registro.countDocuments(filtro)
        ]);

        res.json({
            ok: true,
            total,
            pagina: page,
            limite: pageSize,
            data: docs
        });
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

        if (!remitente || remitente.trim().length < 3) {
            return res.status(400).json({ ok: false, error: 'El remitente debe tener al menos 3 caracteres' });
        }

        if (!asunto || asunto.trim().length < 5) {
            return res.status(400).json({ ok: false, error: 'El asunto debe tener al menos 5 caracteres' });
        }

        if (estado && !estadosValidos.includes(estado)) {
            return res.status(400).json({ ok: false, error: 'Estado invalido' });
        }

        if (!folio) {
            const count = await Registro.countDocuments();
            const year = new Date().getFullYear();
            folio = `DOC-${year}-${(count + 1).toString().padStart(3, '0')}`;
        }

        const creado = await Registro.create({
            folio,
            remitente: remitente.trim(),
            asunto: asunto.trim(),
            estado: estado || 'Recibido',
            departamentoAsignado: departamentoAsignado || null
        });
        res.status(201).json({ ok: true, data: creado });
    } catch (err) {
        console.error('Error creando registro', err);
        if (err.code === 11000) return res.status(400).json({ ok: false, error: 'El folio ya existe' });
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

        if (req.body.remitente && req.body.remitente.trim().length < 3) {
            return res.status(400).json({ ok: false, error: 'El remitente debe tener al menos 3 caracteres' });
        }
        if (req.body.asunto && req.body.asunto.trim().length < 5) {
            return res.status(400).json({ ok: false, error: 'El asunto debe tener al menos 5 caracteres' });
        }
        if (req.body.estado && !estadosValidos.includes(req.body.estado)) {
            return res.status(400).json({ ok: false, error: 'Estado invalido' });
        }

        const payload = { ...req.body };
        if (payload.remitente) payload.remitente = payload.remitente.trim();
        if (payload.asunto) payload.asunto = payload.asunto.trim();

        const actualizado = await Registro.findByIdAndUpdate(req.params.id, payload, { new: true })
            .populate('departamentoAsignado', 'nombre');
        if (!actualizado) return res.status(404).json({ ok: false, error: 'Documento no encontrado' });

        res.json({ ok: true, data: actualizado });
    } catch (err) {
        console.error('Error actualizando documento', err);
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

// Eliminar documento
router.delete('/:id', requireRole(['administrador']), async (req, res) => {
    try {
        const documento = await Registro.findById(req.params.id);
        if (!documento) return res.status(404).json({ ok: false, error: 'Documento no encontrado' });

        // Opcional: borrar el historial de turnos asociado
        await Turno.deleteMany({ documento: req.params.id });

        await Registro.findByIdAndDelete(req.params.id);
        res.json({ ok: true, mensaje: 'Documento eliminado exitosamente' });
    } catch (err) {
        console.error('Error eliminando documento', err);
        res.status(500).json({ ok: false, error: 'Error eliminando documento' });
    }
});

module.exports = router;
