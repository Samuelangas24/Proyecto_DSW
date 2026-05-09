const mongoose = require('mongoose');

const RegistroSchema = new mongoose.Schema({
  folio: { type: String, required: true, unique: true },
  remitente: { type: String, required: true },
  asunto: { type: String, required: true },
  estado: { type: String, default: 'Recibido' },
  departamentoAsignado: { type: mongoose.Schema.Types.ObjectId, ref: 'Departamento', default: null }
}, { timestamps: true });

module.exports = mongoose.model('Registro', RegistroSchema);
