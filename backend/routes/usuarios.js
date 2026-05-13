const express = require('express');
const User = require('../models/User');
const { requireRole } = require('../middlewares/auth');

const router = express.Router();

router.get('/', requireRole(['administrador', 'oficialia']), async (req, res) => {
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

module.exports = router;
