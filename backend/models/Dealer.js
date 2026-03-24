const mongoose = require('mongoose');

const dealerSchema = new mongoose.Schema({
  nom: { type: String, required: true, trim: true },
  url: { type: String, required: true, trim: true },
  categories: [{ type: String, enum: ['Tissus', 'Mercerie', 'Patrons', 'Autre'] }],
  dejaCliente: { type: Boolean, default: false },
  description: { type: String, trim: true },
  dateAjout: { type: Date, default: Date.now }
});

module.exports = mongoose.model('Dealer', dealerSchema);
