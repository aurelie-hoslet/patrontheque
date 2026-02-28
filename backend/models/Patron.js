const mongoose = require('mongoose');

const patronSchema = new mongoose.Schema({
  marque: { type: String, required: true, trim: true },
  modele: { type: String, required: true, trim: true },
  genres: [{ type: String, enum: ['Femme', 'Homme', 'Enfant', 'Bébé', 'Unisexe', 'Accessoire'] }],
  types: [String],
  typeAccessoire: String,
  typeAccessoires: [String],
  manches: [{ type: String, enum: ['Manches Longues', 'Manches 3/4', 'Manches Courtes', 'Sans Manches'] }],
  longueurs: [{ type: String, enum: ['Courte', 'Genou', 'Longue'] }],
  tissuTypes: [{ type: String, enum: ['Chaîne et trame', 'Maille'] }],
  tissuSpecifique: [String],
  details: [String],
  taillesIndiquees: String,
  taillesDisponibles: [{ type: String, enum: ['XS', 'S', 'M', 'L', 'XL', '2X', '3X', '4X+'] }],
  taillesEnfant: [String],
  taillesBebe: [String],
  dimensions: String,
  metrageMin: { type: Number, min: 0 },
  metrageMax: { type: Number, min: 0 },
  langues: [{ type: String, enum: ['Français', 'Anglais', 'Allemand', 'Autre'] }],
  formats: {
    projecteur: { type: Boolean, default: false },
    a4: { type: Boolean, default: false },
    a0: { type: Boolean, default: false }
  },
  maTaille: { type: Boolean, default: false },
  cousu: { type: Boolean, default: false },
  aRevoir: { type: Boolean, default: false },
  complet: { type: Boolean, default: false },
  favori: { type: Boolean, default: false },
  notes: String,
  lienShop: String,
  aSavoir: String,
  imagePrincipale: String,
  imageTableauTailles: String,
  imageSchemaTechnique: String,
  imageSupp1: String,
  imageSupp2: String,
  imageSupp3: String,
  pdfPath: { type: String },
  dateAjout: { type: Date, default: Date.now },
  dateModification: { type: Date, default: Date.now }
});

patronSchema.index({ marque: 'text', modele: 'text', notes: 'text' });

patronSchema.pre('save', function(next) {
  this.dateModification = new Date();
  next();
});

module.exports = mongoose.model('Patron', patronSchema);