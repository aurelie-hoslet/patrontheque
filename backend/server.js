const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const fs = require('fs');
const path = require('path');
const Patron = require('./models/Patron');
const Tissu = require('./models/Tissu');
const Projet = require('./models/Projet');
const Dealer = require('./models/Dealer');

const app = express();
const PORT = 5000;

app.use(cors());
app.use(express.json({ limit: '200mb' }));
app.use(express.urlencoded({ limit: '200mb', extended: true }));
app.use('/pdfs', express.static(path.join(__dirname, 'pdfs')));

const MONGODB_URI = 'mongodb://localhost:27017/patron-manager';

const capFirst = s => s && typeof s === 'string' ? s.charAt(0).toUpperCase() + s.slice(1) : s;
const capArray = arr => Array.isArray(arr) ? arr.map(capFirst) : arr;

const sanitizeName = (s) => (s || '').replace(/[<>:"/\\|?*]/g, '').replace(/\s+/g, '-').slice(0, 80);

const copyPdfs = (sourcePath, marque, modele) => {
  const destDir = path.join(__dirname, 'pdfs', sanitizeName(marque), sanitizeName(modele));
  if (!fs.existsSync(sourcePath)) throw new Error(`Dossier source introuvable : ${sourcePath}`);
  if (!fs.existsSync(destDir)) fs.mkdirSync(destDir, { recursive: true });
  const files = fs.readdirSync(sourcePath).filter(f => f.toLowerCase().endsWith('.pdf'));
  files.forEach(f => fs.copyFileSync(path.join(sourcePath, f), path.join(destDir, f)));
  return { pdfPath: `pdfs/${sanitizeName(marque)}/${sanitizeName(modele)}`, count: files.length };
};

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
    const { pdfFiles, ...rest } = req.body;
    const body = { ...rest, details: capArray(rest.details), tissuSpecifique: capArray(rest.tissuSpecifique), typeAccessoires: capArray(rest.typeAccessoires) };
    const patron = new Patron(body);
    if (pdfFiles && pdfFiles.length > 0) {
      try {
        const destDir = path.join(__dirname, 'pdfs', sanitizeName(patron.marque), sanitizeName(patron.modele));
        if (!fs.existsSync(destDir)) fs.mkdirSync(destDir, { recursive: true });
        pdfFiles.forEach(({ name, data }) => {
          const finalName = name.replace(/\.pdf$/i, '') + '.pdf';
          const buf = Buffer.from(data.replace(/^data:.*?;base64,/, ''), 'base64');
          fs.writeFileSync(path.join(destDir, finalName), buf);
        });
        patron.pdfPath = `pdfs/${sanitizeName(patron.marque)}/${sanitizeName(patron.modele)}`;
      } catch (e) {
        console.warn('Écriture PDFs échouée:', e.message);
      }
    }
    const nouveauPatron = await patron.save();
    res.status(201).json(nouveauPatron);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
});

app.put('/api/patrons/:id', async (req, res) => {
  try {
    const { pdfFiles, ...rest } = req.body;
    const body = { ...rest, details: capArray(rest.details), tissuSpecifique: capArray(rest.tissuSpecifique), typeAccessoires: capArray(rest.typeAccessoires), dateModification: new Date() };
    if (pdfFiles && pdfFiles.length > 0) {
      try {
        const destDir = path.join(__dirname, 'pdfs', sanitizeName(body.marque), sanitizeName(body.modele));
        if (!fs.existsSync(destDir)) fs.mkdirSync(destDir, { recursive: true });
        pdfFiles.forEach(({ name, data }) => {
          const finalName = name.replace(/\.pdf$/i, '') + '.pdf';
          const buf = Buffer.from(data.replace(/^data:.*?;base64,/, ''), 'base64');
          fs.writeFileSync(path.join(destDir, finalName), buf);
        });
        body.pdfPath = `pdfs/${sanitizeName(body.marque)}/${sanitizeName(body.modele)}`;
      } catch (e) {
        console.warn('Écriture PDFs échouée:', e.message);
      }
    }
    const patron = await Patron.findByIdAndUpdate(req.params.id, body, { new: true, runValidators: true });
    if (!patron) return res.status(404).json({ message: 'Patron non trouvé' });
    res.json(patron);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
});

app.patch('/api/patrons/:id/aRevoir', async (req, res) => {
  try {
    const patron = await Patron.findByIdAndUpdate(
      req.params.id,
      { aRevoir: req.body.aRevoir, dateModification: new Date() },
      { new: true }
    );
    if (!patron) return res.status(404).json({ message: 'Patron non trouvé' });
    res.json(patron);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

app.patch('/api/patrons/:id/favori', async (req, res) => {
  try {
    const patron = await Patron.findByIdAndUpdate(
      req.params.id,
      { favori: req.body.favori, dateModification: new Date() },
      { new: true }
    );
    if (!patron) return res.status(404).json({ message: 'Patron non trouvé' });
    res.json(patron);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

app.patch('/api/patrons/:id/complet', async (req, res) => {
  try {
    const patron = await Patron.findByIdAndUpdate(
      req.params.id,
      { complet: req.body.complet, dateModification: new Date() },
      { new: true }
    );
    if (!patron) return res.status(404).json({ message: 'Patron non trouvé' });
    res.json(patron);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

app.get('/api/patrons/:id/pdfs', async (req, res) => {
  try {
    const patron = await Patron.findById(req.params.id);
    if (!patron || !patron.pdfPath) return res.json([]);
    const dir = path.join(__dirname, patron.pdfPath);
    if (!fs.existsSync(dir)) return res.json([]);
    const files = fs.readdirSync(dir).filter(f => f.toLowerCase().endsWith('.pdf'));
    const relativePath = patron.pdfPath.replace(/\\/g, '/');
    res.json(files.map(f => ({ name: f, url: `/${relativePath}/${encodeURIComponent(f)}` })));
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

app.delete('/api/patrons/:id/pdfs/:filename', async (req, res) => {
  try {
    const patron = await Patron.findById(req.params.id);
    if (!patron || !patron.pdfPath) return res.status(404).json({ message: 'Patron ou PDF non trouvé' });
    const filePath = path.join(__dirname, patron.pdfPath, req.params.filename);
    if (!fs.existsSync(filePath)) return res.status(404).json({ message: 'Fichier non trouvé' });
    fs.unlinkSync(filePath);
    const remaining = fs.readdirSync(path.join(__dirname, patron.pdfPath)).filter(f => f.toLowerCase().endsWith('.pdf'));
    if (remaining.length === 0) {
      await Patron.findByIdAndUpdate(req.params.id, { pdfPath: null });
    }
    res.json({ message: 'PDF supprimé' });
  } catch (error) {
    res.status(500).json({ message: error.message });
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
    if (filters.typeAccessoires && filters.typeAccessoires.length > 0) {
      query.$or = [
        { typeAccessoires: { $in: filters.typeAccessoires } },
        { typeAccessoire: { $in: filters.typeAccessoires } }
      ];
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
    if (filters.taillesEnfant && filters.taillesEnfant.length > 0) {
      query.taillesEnfant = { $in: filters.taillesEnfant };
    }
    if (filters.langues && filters.langues.length > 0) {
      query.langues = { $in: filters.langues };
    }
    if (filters.formats) {
      if (filters.formats.projecteur) query['formats.projecteur'] = true;
      if (filters.formats.a4) query['formats.a4'] = true;
      if (filters.formats.a0) query['formats.a0'] = true;
    }
    if (filters.metrageRanges && filters.metrageRanges.length > 0) {
      query.$or = filters.metrageRanges.map(r => ({
        metrageMin: { $lte: r.max },
        metrageMax: { $gte: r.min }
      }));
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
          typeAccessoires: Array.isArray(patronData.typeAccessoires) ? patronData.typeAccessoires : (patronData.typeAccessoire ? [patronData.typeAccessoire] : []),
          manches: patronData.manches || [],
          longueurs: patronData.longueurs || [],
          tissuTypes: patronData.tissuTypes || (patronData.tissuType ? [patronData.tissuType] : []),
          tissuSpecifique: capArray(Array.isArray(patronData.tissuSpecifique) ? patronData.tissuSpecifique : (patronData.tissuSpecifique ? [patronData.tissuSpecifique] : [])),
          details: capArray(Array.isArray(patronData.details) ? patronData.details : (patronData.details ? [patronData.details] : [])),
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
      marques: [...new Set(patrons.map(p => p.marque).filter(Boolean))].sort(),
      genres: [...new Set(patrons.flatMap(p => p.genres || []))].sort(),
      types: [...new Set(patrons.flatMap(p => p.types || []))].sort(),
      manches: [...new Set(patrons.flatMap(p => p.manches || []))].sort(),
      longueurs: [...new Set(patrons.flatMap(p => p.longueurs || []))].sort(),
      typeAccessoires: (() => {
        const seen = new Set();
        return [
          ...patrons.flatMap(p => p.typeAccessoires || []),
          ...patrons.map(p => p.typeAccessoire).filter(Boolean)
        ].map(capFirst).filter(s => {
          const key = s.trim().toLowerCase();
          if (seen.has(key)) return false;
          seen.add(key);
          return true;
        }).sort();
      })(),
      tissuTypes: [...new Set(patrons.flatMap(p => p.tissuTypes || []))].sort(),
      tissuSpecifique: (() => {
        const seen = new Set();
        return patrons.flatMap(p => p.tissuSpecifique || []).map(capFirst).filter(s => {
          const key = s.trim().toLowerCase();
          if (seen.has(key)) return false;
          seen.add(key);
          return true;
        }).sort();
      })(),
      details: (() => {
        const seen = new Set();
        return patrons.flatMap(p => p.details || []).map(capFirst).filter(d => {
          const key = d.trim().toLowerCase();
          if (seen.has(key)) return false;
          seen.add(key);
          return true;
        }).sort();
      })(),
      taillesDisponibles: ['XS', 'S', 'M', 'L', 'XL', '2X', '3X', '4X+'],
      taillesEnfant: ['1 an', '2 ans', '3 ans', '4 ans', '5 ans', '6 ans', '8 ans', '10 ans', '12 ans', '14 ans', '16 ans'],
      formats: ['Projecteur', 'A4', 'A0']
    };
    res.json(options);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// ── TISSUS ──────────────────────────────────────────────────────────────────

app.get('/api/tissus', async (req, res) => {
  try {
    const tissus = await Tissu.find().sort({ dateAjout: -1 });
    res.json(tissus);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

app.post('/api/tissus', async (req, res) => {
  try {
    const tissu = new Tissu(req.body);
    const nouveau = await tissu.save();
    res.status(201).json(nouveau);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
});

app.put('/api/tissus/:id', async (req, res) => {
  try {
    const tissu = await Tissu.findByIdAndUpdate(req.params.id, req.body, { new: true, runValidators: true });
    if (!tissu) return res.status(404).json({ message: 'Tissu non trouvé' });
    res.json(tissu);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
});

app.delete('/api/tissus/:id', async (req, res) => {
  try {
    const tissu = await Tissu.findByIdAndDelete(req.params.id);
    if (!tissu) return res.status(404).json({ message: 'Tissu non trouvé' });
    res.json({ message: 'Tissu supprimé' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// ── PROJETS ──────────────────────────────────────────────────────────────────

app.get('/api/projets', async (req, res) => {
  try {
    const projets = await Projet.find().sort({ dateCreation: -1 });
    res.json(projets);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

app.post('/api/projets', async (req, res) => {
  try {
    const projet = new Projet(req.body);
    const nouveau = await projet.save();
    res.status(201).json(nouveau);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
});

app.put('/api/projets/:id', async (req, res) => {
  try {
    const projet = await Projet.findByIdAndUpdate(req.params.id, req.body, { new: true, runValidators: true });
    if (!projet) return res.status(404).json({ message: 'Projet non trouvé' });
    res.json(projet);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
});

app.delete('/api/projets/:id', async (req, res) => {
  try {
    const projet = await Projet.findByIdAndDelete(req.params.id);
    if (!projet) return res.status(404).json({ message: 'Projet non trouvé' });
    res.json({ message: 'Projet supprimé' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

app.patch('/api/projets/:id/etape/:etapeIndex', async (req, res) => {
  try {
    const projet = await Projet.findById(req.params.id);
    if (!projet) return res.status(404).json({ message: 'Projet non trouvé' });
    const idx = parseInt(req.params.etapeIndex);
    if (projet.etapes[idx] === undefined) return res.status(404).json({ message: 'Étape non trouvée' });
    projet.etapes[idx].faite = req.body.faite;
    await projet.save();
    res.json(projet);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

app.patch('/api/projets/:id/statut', async (req, res) => {
  try {
    const projet = await Projet.findByIdAndUpdate(
      req.params.id,
      { statut: req.body.statut },
      { new: true }
    );
    if (!projet) return res.status(404).json({ message: 'Projet non trouvé' });
    res.json(projet);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

app.patch('/api/projets/:id/imagePosition', async (req, res) => {
  try {
    const projet = await Projet.findByIdAndUpdate(
      req.params.id,
      { imagePosition: req.body.imagePosition },
      { new: true }
    );
    if (!projet) return res.status(404).json({ message: 'Projet non trouvé' });
    res.json(projet);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// ── DEALERS ──────────────────────────────────────────────────────────────────

app.get('/api/dealers', async (req, res) => {
  try {
    const dealers = await Dealer.find().sort({ categorie: 1, nom: 1 });
    res.json(dealers);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

app.post('/api/dealers', async (req, res) => {
  try {
    const dealer = new Dealer(req.body);
    const nouveau = await dealer.save();
    res.status(201).json(nouveau);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
});

app.put('/api/dealers/:id', async (req, res) => {
  try {
    const dealer = await Dealer.findByIdAndUpdate(req.params.id, req.body, { new: true, runValidators: true });
    if (!dealer) return res.status(404).json({ message: 'Dealer non trouvé' });
    res.json(dealer);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
});

app.delete('/api/dealers/:id', async (req, res) => {
  try {
    const dealer = await Dealer.findByIdAndDelete(req.params.id);
    if (!dealer) return res.status(404).json({ message: 'Dealer non trouvé' });
    res.json({ message: 'Dealer supprimé' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

app.listen(PORT, () => {
  console.log('🚀 Serveur démarré sur http://localhost:' + PORT);
});
