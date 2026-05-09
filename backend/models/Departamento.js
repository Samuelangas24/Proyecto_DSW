const mongoose = require('mongoose');

const DepartamentoSchema = new mongoose.Schema({
  nombre: { type: String, required: true, unique: true },
  responsable: { type: String, required: true },
  descripcion: { type: String }
}, { timestamps: true });

module.exports = mongoose.model('Departamento', DepartamentoSchema);
