const mongoose = require('mongoose');

const etapeSchema = new mongoose.Schema({
  titre: { type: String, required: true },
  faite: { type: Boolean, default: false }
}, { _id: true });

const projetSchema = new mongoose.Schema({
  nom: { type: String, trim: true },
  patronId: { type: mongoose.Schema.Types.ObjectId, ref: 'Patron' },
  tissuId: { type: mongoose.Schema.Types.ObjectId, ref: 'Tissu' },
  statut: { type: String, enum: ['En cours', 'Terminé'], default: 'En cours' },
  notes: { type: String },
  image: { type: String },
  imagePosition: { type: String, default: 'center' },
  dateDebut: { type: Date },
  dateFin: { type: Date },
  etapes: [etapeSchema],
  dateCreation: { type: Date, default: Date.now }
});

module.exports = mongoose.model('Projet', projetSchema);
