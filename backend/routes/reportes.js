const express = require('express');
const Registro = require('../models/Registro');

const router = express.Router();

router.get('/', async (req, res) => {
    try {
        const total = await Registro.countDocuments();
        res.json({ ok: true, data: { total } });
    } catch (err) {
        res.status(500).json({ ok: false, error: 'Error reportes' });
    }
});

module.exports = router;
