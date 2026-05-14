const express = require('express');
const Registro = require('../models/Registro');

const router = express.Router();

router.get('/', async (req, res) => {
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
        res.status(500).json({ ok: false, error: 'Error reportes' });
    }
});

module.exports = router;
