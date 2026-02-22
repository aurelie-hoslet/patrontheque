const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const Patron = require('./models/Patron');

const app = express();
const PORT = 5000;

app.use(cors());
app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ limit: '50mb', extended: true }));

const MONGODB_URI = 'mongodb://localhost:27017/patron-manager';

mongoose.connect(MONGODB_URI)
  .then(() => console.log('✅ Connecté à MongoDB'))
  .catch(err => console.error('❌ Erreur MongoDB:', err));

app.get('/api/patrons', async (req, res) => {
  try {
    const patrons = await Patron.find().sort({ dateModification: -1 });
    res.json(patrons);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

app.get('/api/patrons/:id', async (req, res) => {
  try {
    const patron = await Patron.findById(req.params.id);
    if (!patron) return res.status(404).json({ message: 'Patron non trouvé' });
    res.json(patron);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

app.post('/api/patrons', async (req, res) => {
  try {
    const patron = new Patron(req.body);
    const nouveauPatron = await patron.save();
    res.status(201).json(nouveauPatron);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
});

app.put('/api/patrons/:id', async (req, res) => {
  try {
    const patron = await Patron.findByIdAndUpdate(req.params.id, req.body, { new: true, runValidators: true });
    if (!patron) return res.status(404).json({ message: 'Patron non trouvé' });
    res.json(patron);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
});

app.delete('/api/patrons/:id', async (req, res) => {
  try {
    const patron = await Patron.findByIdAndDelete(req.params.id);
    if (!patron) return res.status(404).json({ message: 'Patron non trouvé' });
    res.json({ message: 'Patron supprimé avec succès' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

app.post('/api/patrons/search', async (req, res) => {
  try {
    const filters = req.body;
    let query = {};
    
    if (filters.searchText) {
      query.$text = { $search: filters.searchText };
    }
    if (filters.genres && filters.genres.length > 0) {
      query.genres = { $in: filters.genres };
    }
    if (filters.types && filters.types.length > 0) {
      query.types = { $in: filters.types };
    }
    if (filters.manches && filters.manches.length > 0) {
      query.manches = { $in: filters.manches };
    }
    if (filters.longueurs && filters.longueurs.length > 0) {
      query.longueurs = { $in: filters.longueurs };
    }
    if (filters.tissuTypes && filters.tissuTypes.length > 0) {
      query.tissuTypes = { $in: filters.tissuTypes };
    }
    if (filters.tissuSpecifique && filters.tissuSpecifique.length > 0) {
      query.tissuSpecifique = { $in: filters.tissuSpecifique };
    }
    if (filters.details && filters.details.length > 0) {
      query.details = { $in: filters.details };
    }
    if (filters.taillesDisponibles && filters.taillesDisponibles.length > 0) {
      query.taillesDisponibles = { $in: filters.taillesDisponibles };
    }
    if (filters.formats) {
      if (filters.formats.projecteur) query['formats.projecteur'] = true;
      if (filters.formats.a4) query['formats.a4'] = true;
      if (filters.formats.a0) query['formats.a0'] = true;
    }
    if (filters.metrageMin !== undefined && filters.metrageMax !== undefined) {
      query.metrageMin = { $lte: filters.metrageMax };
      query.metrageMax = { $gte: filters.metrageMin };
    }
    if (filters.cousu !== undefined) {
      query.cousu = filters.cousu;
    }
    
    const patrons = await Patron.find(query).sort({ dateModification: -1 });
    res.json(patrons);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

app.post('/api/import', async (req, res) => {
  try {
    const { patrons } = req.body;
    if (!Array.isArray(patrons)) {
      return res.status(400).json({ message: 'Format invalide' });
    }
    
    const results = { success: 0, errors: [] };
    
    for (const patronData of patrons) {
      try {
        const migratedData = {
          marque: patronData.marque,
          modele: patronData.modele,
          genres: patronData.genres || (patronData.genre ? [patronData.genre] : []),
          types: patronData.types || (patronData.type ? [patronData.type] : []),
          typeAccessoire: patronData.typeAccessoire || '',
          manches: patronData.manches || [],
          longueurs: patronData.longueurs || [],
          tissuTypes: patronData.tissuTypes || (patronData.tissuType ? [patronData.tissuType] : []),
          tissuSpecifique: Array.isArray(patronData.tissuSpecifique) ? patronData.tissuSpecifique : (patronData.tissuSpecifique ? [patronData.tissuSpecifique] : []),
          details: Array.isArray(patronData.details) ? patronData.details : (patronData.details ? [patronData.details] : []),
          taillesIndiquees: patronData.tailles || patronData.taillesIndiquees || '',
          taillesDisponibles: patronData.taillesDisponibles || [],
          metrageMin: patronData.metrageMin,
          metrageMax: patronData.metrageMax,
          formats: {
            projecteur: patronData.projecteur || patronData.formats?.projecteur || false,
            a4: patronData.formats?.a4 || false,
            a0: patronData.formats?.a0 || false
          },
          maTaille: patronData.maTaille || false,
          cousu: patronData.cousu || false,
          notes: patronData.notes || '',
          lienShop: patronData.lienShop || '',
          imagePrincipale: '',
          imageTableauTailles: '',
          imageSchemaTechnique: ''
        };
        
        const patron = new Patron(migratedData);
        await patron.save();
        results.success++;
      } catch (error) {
        results.errors.push({ patron: patronData.modele, error: error.message });
      }
    }
    
    res.json(results);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

app.get('/api/stats/filter-options', async (req, res) => {
  try {
    const patrons = await Patron.find();
    const options = {
      genres: [...new Set(patrons.flatMap(p => p.genres || []))].sort(),
      types: [...new Set(patrons.flatMap(p => p.types || []))].sort(),
      manches: [...new Set(patrons.flatMap(p => p.manches || []))].sort(),
      longueurs: [...new Set(patrons.flatMap(p => p.longueurs || []))].sort(),
      tissuTypes: [...new Set(patrons.flatMap(p => p.tissuTypes || []))].sort(),
      tissuSpecifique: [...new Set(patrons.flatMap(p => p.tissuSpecifique || []))].sort(),
      details: [...new Set(patrons.flatMap(p => p.details || []))].sort(),
      taillesDisponibles: ['XS', 'S', 'M', 'L', 'XL', '2X', '3X', '4X+'],
      formats: ['Projecteur', 'A4', 'A0']
    };
    res.json(options);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

app.listen(PORT, () => {
  console.log('🚀 Serveur démarré sur http://localhost:' + PORT);
});
