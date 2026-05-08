const mongoose = require('mongoose');

const RegistroSchema = new mongoose.Schema({
  folio: { type: String, required: true, unique: true },
  remitente: { type: String, required: true },
  asunto: { type: String, required: true },
  estado: { type: String, default: 'Recibido' },
}, { timestamps: true });

module.exports = mongoose.model('Registro', RegistroSchema);
