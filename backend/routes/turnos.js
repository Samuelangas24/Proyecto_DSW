const express = require('express');
const Turno = require('../models/Turno');
const Registro = require('../models/Registro');

const router = express.Router();

router.post('/', async (req, res) => {
    try {
        if (!req.user) return res.status(401).json({ ok: false, error: 'Unauthorized' });
        const { documentoId, estadoNuevo, departamentoDestino, observaciones } = req.body;

        if (!documentoId || !estadoNuevo || !observaciones) {
            return res.status(400).json({ ok: false, error: 'Faltan datos obligatorios para el turno' });
        }

        const doc = await Registro.findById(documentoId);
        if (!doc) return res.status(404).json({ ok: false, error: 'Documento no encontrado' });

        const turno = await Turno.create({
            documento: documentoId,
            usuario: req.user.id,
            estadoAnterior: doc.estado,
            estadoNuevo,
            departamentoDestino: departamentoDestino || null,
            observaciones
        });

        doc.estado = estadoNuevo;
        if (departamentoDestino) doc.departamentoAsignado = departamentoDestino;
        await doc.save();

        res.status(201).json({ ok: true, data: turno });
    } catch (err) {
        console.error('Error creando turno', err);
        res.status(500).json({ ok: false, error: 'Error al turnar documento' });
    }
});

router.get('/:idDocumento', async (req, res) => {
    try {
        if (!req.user) return res.status(401).json({ ok: false, error: 'Unauthorized' });

        const historial = await Turno.find({ documento: req.params.idDocumento })
            .populate('usuario', 'email role')
            .populate('departamentoDestino', 'nombre')
            .sort({ createdAt: -1 });

        res.json({ ok: true, data: historial });
    } catch (err) {
        console.error('Error obteniendo historial', err);
        res.status(500).json({ ok: false, error: 'Error obteniendo historial' });
    }
});

module.exports = router;
