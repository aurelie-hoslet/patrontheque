const mongoose = require('mongoose');

const WishItemSchema = new mongoose.Schema({
  nom: { type: String, required: true },
  marque: { type: String, default: '' },
  type: { type: String, default: 'patron', enum: ['patron', 'tissu', 'accessoire', 'autre'] },
  priorite: { type: String, default: 'moyenne', enum: ['haute', 'moyenne', 'basse'] },
  lien: { type: String, default: '' },
  image: { type: String, default: '' },
  notes: { type: String, default: '' },
  dateAjout: { type: Date, default: Date.now },
});

module.exports = mongoose.model('WishItem', WishItemSchema);
