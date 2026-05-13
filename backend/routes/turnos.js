const express = require('express');
const Turno = require('../models/Turno');
const Registro = require('../models/Registro');

const router = express.Router();

router.post('/', async (req, res) => {
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

module.exports = router;
