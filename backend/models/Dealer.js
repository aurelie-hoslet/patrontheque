const mongoose = require('mongoose');

const dealerSchema = new mongoose.Schema({
  nom: { type: String, required: true, trim: true },
  url: { type: String, required: true, trim: true },
  categorie: { type: String, enum: ['Tissus', 'Mercerie', 'Patrons', 'Autre'], default: 'Autre' },
  description: { type: String, trim: true },
  dateAjout: { type: Date, default: Date.now }
});

module.exports = mongoose.model('Dealer', dealerSchema);
