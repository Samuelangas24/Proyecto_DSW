const jwt = require('jsonwebtoken');
const User = require('../models/User');
const Registro = require('../models/Registro');

const verifyToken = (req, res, next) => {
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
};

const requireRole = (rolesPermitidos) => {
    return (req, res, next) => {
        if (!req.user) return res.status(401).json({ ok: false, error: 'Inicia sesión para continuar' });
        if (!rolesPermitidos.includes(req.user.role)) {
            return res.status(403).json({ ok: false, error: 'No tienes permisos suficientes' });
        }
        next();
    };
};

const requireDepartmentAccess = async (req, res, next) => {
    try {
        if (!req.user) return res.status(401).json({ ok: false, error: 'Inicia sesión para continuar' });
        if (req.user.role === 'administrador' || req.user.role === 'oficialia') return next();

        const usuario = await User.findById(req.user.id).populate('departamento');
        if (!usuario.departamento) return res.status(403).json({ ok: false, error: 'No tienes departamento asignado' });

        if (req.params.id || req.params.folio) {
            const documentoId = req.params.id || req.params.folio;
            const documento = await Registro.findOne(req.params.folio ? { folio: documentoId } : { _id: documentoId });

            if (!documento) return res.status(404).json({ ok: false, error: 'Documento no encontrado' });
            if (!documento.departamentoAsignado || documento.departamentoAsignado.toString() !== usuario.departamento._id.toString()) {
                return res.status(403).json({ ok: false, error: 'No tienes permiso para ver este documento' });
            }
        }
        next();
    } catch (err) {
        res.status(500).json({ ok: false, error: 'Error verificando permisos' });
    }
};

module.exports = {
    verifyToken,
    requireRole,
    requireDepartmentAccess
};
