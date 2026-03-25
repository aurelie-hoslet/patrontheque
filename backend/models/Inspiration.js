const mongoose = require('mongoose');

const InspirationSchema = new mongoose.Schema({
  titre: { type: String, default: '' },
  image: { type: String, default: '' },
  imagePosition: { type: String, default: 'center' },
  source: { type: String, default: '' },
  notes: { type: String, default: '' },
  tags: [String],
  dateAjout: { type: Date, default: Date.now },
});

module.exports = mongoose.model('Inspiration', InspirationSchema);
