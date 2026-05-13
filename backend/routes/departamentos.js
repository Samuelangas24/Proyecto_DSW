const express = require('express');
const Departamento = require('../models/Departamento');
const { requireRole } = require('../middlewares/auth');

const router = express.Router();

router.post('/', requireRole(['administrador']), async (req, res) => {
    try {
        const depto = await Departamento.create(req.body);
        res.status(201).json({ ok: true, data: depto });
    } catch (err) {
        res.status(500).json({ ok: false, error: 'Error al crear departamento' });
    }
});

router.get('/', async (req, res) => {
    try {
        const deptos = await Departamento.find();
        res.json({ ok: true, data: deptos });
    } catch (err) {
        res.status(500).json({ ok: false, error: 'Error' });
    }
});

module.exports = router;
