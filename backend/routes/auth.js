const express = require('express');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const User = require('../models/User');
const Departamento = require('../models/Departamento');

const router = express.Router();

router.post('/register', async (req, res) => {
    try {
        const { nombre, email, password, role, departamento } = req.body;
        if (!email || !password) return res.status(400).json({ ok: false, error: 'Email and password required' });
        
        const existing = await User.findOne({ email });
        if (existing) return res.status(400).json({ ok: false, error: 'User exists' });
        
        const hash = await bcrypt.hash(password, 10);
        
        let deptoValido = null;
        if (departamento) {
            deptoValido = await Departamento.findById(departamento);
            if (!deptoValido) return res.status(400).json({ ok: false, error: 'Departamento no válido' });
        }
        
        const user = await User.create({
            nombre,
            email,
            passwordHash: hash,
            role: role || 'oficialia',
            departamento: deptoValido ? deptoValido._id : null
        });
        
        res.status(201).json({ ok: true, data: { id: user._id, email: user.email, role: user.role } });
    } catch (err) {
        console.error('Error register', err);
        res.status(500).json({ ok: false, error: 'Error registering user' });
    }
});

router.post('/login', async (req, res) => {
    try {
        const { email, password } = req.body;
        if (!email || !password) return res.status(400).json({ ok: false, error: 'Email and password required' });
        
        const user = await User.findOne({ email });
        if (!user) return res.status(400).json({ ok: false, error: 'Invalid credentials' });
        
        const ok = await bcrypt.compare(password, user.passwordHash);
        if (!ok) return res.status(400).json({ ok: false, error: 'Invalid credentials' });
        
        const token = jwt.sign({
            id: user._id,
            email: user.email,
            role: user.role,
            departamento: user.departamento
        }, process.env.JWT_SECRET || 'changeme', { expiresIn: '8h' });
        
        res.json({ ok: true, data: { token } });
    } catch (err) {
        console.error('Error login', err);
        res.status(500).json({ ok: false, error: 'Error logging in' });
    }
});

module.exports = router;
