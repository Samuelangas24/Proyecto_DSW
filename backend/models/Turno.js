const mongoose = require('mongoose');

const TurnoSchema = new mongoose.Schema({
  documento: { type: mongoose.Schema.Types.ObjectId, ref: 'Registro', required: true },
  usuario: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  estadoAnterior: { type: String, required: true },
  estadoNuevo: { type: String, required: true },
  departamentoDestino: { type: mongoose.Schema.Types.ObjectId, ref: 'Departamento' },
  observaciones: { type: String, required: true }
}, { timestamps: true });

module.exports = mongoose.model('Turno', TurnoSchema);
