const mongoose = require('mongoose');

const tissuSchema = new mongoose.Schema({
  nom: { type: String, required: true, trim: true },
  type: { type: String, enum: ['Chaîne et trame', 'Maille', 'Dentelle', 'Cuir', 'Autre'] },
  couleur: { type: String, trim: true },
  quantite: { type: Number, min: 0 },
  provenance: { type: String, trim: true },
  image: { type: String },
  dateAjout: { type: Date, default: Date.now }
});

module.exports = mongoose.model('Tissu', tissuSchema);
