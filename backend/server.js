const express = require('express');
const cors = require('cors');
const fs = require('fs');
const path = require('path');
const Datastore = require('@seald-io/nedb');

const app = express();
const PORT = 5000;

// Répertoire de données : défini par Electron, ou local en dev
const DATA_DIR = process.env.USER_DATA_PATH || path.join(__dirname, 'data');
const PDF_DIR = process.env.USER_DATA_PATH
  ? path.join(process.env.USER_DATA_PATH, 'pdfs')
  : path.join(__dirname, 'pdfs');

if (!fs.existsSync(DATA_DIR)) fs.mkdirSync(DATA_DIR, { recursive: true });
if (!fs.existsSync(PDF_DIR)) fs.mkdirSync(PDF_DIR, { recursive: true });

// NeDB datastores
const patronsDb  = new Datastore({ filename: path.join(DATA_DIR, 'patrons.db'),     autoload: true });
const tissusDb   = new Datastore({ filename: path.join(DATA_DIR, 'tissus.db'),      autoload: true });
const projetsDb  = new Datastore({ filename: path.join(DATA_DIR, 'projets.db'),     autoload: true });
const dealersDb  = new Datastore({ filename: path.join(DATA_DIR, 'dealers.db'),     autoload: true });
const inspDb         = new Datastore({ filename: path.join(DATA_DIR, 'inspirations.db'),  autoload: true });
const wishlistDb     = new Datastore({ filename: path.join(DATA_DIR, 'wishlist.db'),       autoload: true });
const mensurationsDb = new Datastore({ filename: path.join(DATA_DIR, 'mensurations.db'),   autoload: true });

app.use(cors());
app.use(express.json({ limit: '200mb' }));
app.use(express.urlencoded({ limit: '200mb', extended: true }));
app.use('/pdfs', express.static(PDF_DIR));

// ── Helpers ──────────────────────────────────────────────────────────────────

const capFirst = s => s && typeof s === 'string' ? s.charAt(0).toUpperCase() + s.slice(1) : s;
const capArray = arr => Array.isArray(arr) ? arr.map(capFirst) : arr;
const sanitizeName = s => (s || '').replace(/[<>:"/\\|?*]/g, '').replace(/\s+/g, '-').slice(0, 80);

const escapeRegex = s => s.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');

const sortDocs = (docs, field, order = -1) => {
  return docs.sort((a, b) => {
    const va = a[field] ? new Date(a[field]).getTime() : 0;
    const vb = b[field] ? new Date(b[field]).getTime() : 0;
    return order === -1 ? vb - va : va - vb;
  });
};

const sortDocsString = (docs, field, order = 1) => {
  return docs.sort((a, b) => {
    const va = (a[field] || '').toString().toLowerCase();
    const vb = (b[field] || '').toString().toLowerCase();
    return order === 1 ? va.localeCompare(vb) : vb.localeCompare(va);
  });
};

// ── PATRONS ──────────────────────────────────────────────────────────────────

app.get('/api/patrons', async (req, res) => {
  try {
    const patrons = await patronsDb.findAsync({});
    res.json(sortDocs(patrons, 'dateModification'));
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

app.get('/api/patrons/:id', async (req, res) => {
  try {
    const patron = await patronsDb.findOneAsync({ _id: req.params.id });
    if (!patron) return res.status(404).json({ message: 'Patron non trouvé' });
    res.json(patron);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

app.post('/api/patrons', async (req, res) => {
  try {
    const { pdfFiles, ...rest } = req.body;
    const now = new Date();
    const doc = {
      ...rest,
      details: capArray(rest.details),
      tissuSpecifique: capArray(rest.tissuSpecifique),
      typeAccessoires: capArray(rest.typeAccessoires),
      dateAjout: now,
      dateModification: now,
    };

    if (pdfFiles && pdfFiles.length > 0) {
      try {
        const destDir = path.join(PDF_DIR, sanitizeName(doc.marque), sanitizeName(doc.modele));
        if (!fs.existsSync(destDir)) fs.mkdirSync(destDir, { recursive: true });
        pdfFiles.forEach(({ name, data }) => {
          const finalName = name.replace(/\.pdf$/i, '') + '.pdf';
          const buf = Buffer.from(data.replace(/^data:.*?;base64,/, ''), 'base64');
          fs.writeFileSync(path.join(destDir, finalName), buf);
        });
        doc.pdfPath = `pdfs/${sanitizeName(doc.marque)}/${sanitizeName(doc.modele)}`;
      } catch (e) {
        console.warn('Écriture PDFs échouée:', e.message);
      }
    }

    const nouveau = await patronsDb.insertAsync(doc);
    res.status(201).json(nouveau);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
});

app.put('/api/patrons/:id', async (req, res) => {
  try {
    const { pdfFiles, ...rest } = req.body;
    const update = {
      ...rest,
      details: capArray(rest.details),
      tissuSpecifique: capArray(rest.tissuSpecifique),
      typeAccessoires: capArray(rest.typeAccessoires),
      dateModification: new Date(),
    };

    if (pdfFiles && pdfFiles.length > 0) {
      try {
        const destDir = path.join(PDF_DIR, sanitizeName(update.marque), sanitizeName(update.modele));
        if (!fs.existsSync(destDir)) fs.mkdirSync(destDir, { recursive: true });
        pdfFiles.forEach(({ name, data }) => {
          const finalName = name.replace(/\.pdf$/i, '') + '.pdf';
          const buf = Buffer.from(data.replace(/^data:.*?;base64,/, ''), 'base64');
          fs.writeFileSync(path.join(destDir, finalName), buf);
        });
        update.pdfPath = `pdfs/${sanitizeName(update.marque)}/${sanitizeName(update.modele)}`;
      } catch (e) {
        console.warn('Écriture PDFs échouée:', e.message);
      }
    }

    delete update._id;
    await patronsDb.updateAsync({ _id: req.params.id }, { $set: update });
    const patron = await patronsDb.findOneAsync({ _id: req.params.id });
    if (!patron) return res.status(404).json({ message: 'Patron non trouvé' });
    res.json(patron);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
});

app.patch('/api/patrons/:id/aRevoir', async (req, res) => {
  try {
    await patronsDb.updateAsync({ _id: req.params.id }, { $set: { aRevoir: req.body.aRevoir, dateModification: new Date() } });
    const patron = await patronsDb.findOneAsync({ _id: req.params.id });
    if (!patron) return res.status(404).json({ message: 'Patron non trouvé' });
    res.json(patron);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

app.patch('/api/patrons/:id/favori', async (req, res) => {
  try {
    await patronsDb.updateAsync({ _id: req.params.id }, { $set: { favori: req.body.favori, dateModification: new Date() } });
    const patron = await patronsDb.findOneAsync({ _id: req.params.id });
    if (!patron) return res.status(404).json({ message: 'Patron non trouvé' });
    res.json(patron);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

app.patch('/api/patrons/:id/complet', async (req, res) => {
  try {
    await patronsDb.updateAsync({ _id: req.params.id }, { $set: { complet: req.body.complet, dateModification: new Date() } });
    const patron = await patronsDb.findOneAsync({ _id: req.params.id });
    if (!patron) return res.status(404).json({ message: 'Patron non trouvé' });
    res.json(patron);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

app.get('/api/patrons/:id/pdfs', async (req, res) => {
  try {
    const patron = await patronsDb.findOneAsync({ _id: req.params.id });
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
    const patron = await patronsDb.findOneAsync({ _id: req.params.id });
    if (!patron || !patron.pdfPath) return res.status(404).json({ message: 'Patron ou PDF non trouvé' });
    const filePath = path.join(__dirname, patron.pdfPath, req.params.filename);
    if (!fs.existsSync(filePath)) return res.status(404).json({ message: 'Fichier non trouvé' });
    fs.unlinkSync(filePath);
    const remaining = fs.readdirSync(path.join(__dirname, patron.pdfPath)).filter(f => f.toLowerCase().endsWith('.pdf'));
    if (remaining.length === 0) {
      await patronsDb.updateAsync({ _id: req.params.id }, { $set: { pdfPath: null } });
    }
    res.json({ message: 'PDF supprimé' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

app.delete('/api/patrons/:id', async (req, res) => {
  try {
    const numRemoved = await patronsDb.removeAsync({ _id: req.params.id }, {});
    if (numRemoved === 0) return res.status(404).json({ message: 'Patron non trouvé' });
    res.json({ message: 'Patron supprimé avec succès' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

app.post('/api/patrons/search', async (req, res) => {
  try {
    const filters = req.body;
    const query = {};
    const andClauses = [];

    if (filters.searchText) {
      const regex = new RegExp(escapeRegex(filters.searchText), 'i');
      andClauses.push({ $or: [{ marque: regex }, { modele: regex }, { notes: regex }] });
    }
    if (filters.genres && filters.genres.length > 0) {
      query.genres = { $in: filters.genres };
    }
    if (filters.types && filters.types.length > 0) {
      query.types = { $in: filters.types };
    }
    if (filters.typeAccessoires && filters.typeAccessoires.length > 0) {
      andClauses.push({ $or: [
        { typeAccessoires: { $in: filters.typeAccessoires } },
        { typeAccessoire: { $in: filters.typeAccessoires } }
      ]});
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
      andClauses.push({ $or: filters.metrageRanges.map(r => ({
        metrageMin: { $lte: r.max },
        metrageMax: { $gte: r.min }
      }))});
    }
    if (filters.metrageMaxDispo != null) {
      query.metrageMax = { $lte: Number(filters.metrageMaxDispo) };
    }
    if (filters.cousu !== undefined) {
      query.cousu = filters.cousu;
    }

    if (andClauses.length > 0) query.$and = andClauses;

    const patrons = await patronsDb.findAsync(query);
    res.json(sortDocs(patrons, 'dateModification'));
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

app.post('/api/import', async (req, res) => {
  try {
    const { patrons } = req.body;
    if (!Array.isArray(patrons)) return res.status(400).json({ message: 'Format invalide' });

    const results = { success: 0, errors: [] };
    const now = new Date();

    for (const patronData of patrons) {
      try {
        const doc = {
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
          imageSchemaTechnique: '',
          dateAjout: now,
          dateModification: now,
        };
        await patronsDb.insertAsync(doc);
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
    const patrons = await patronsDb.findAsync({});
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

// ── TISSUS ───────────────────────────────────────────────────────────────────

app.get('/api/tissus', async (req, res) => {
  try {
    const tissus = await tissusDb.findAsync({});
    res.json(sortDocs(tissus, 'dateAjout'));
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

app.post('/api/tissus', async (req, res) => {
  try {
    const doc = { ...req.body, dateAjout: new Date() };
    const nouveau = await tissusDb.insertAsync(doc);
    res.status(201).json(nouveau);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
});

app.put('/api/tissus/:id', async (req, res) => {
  try {
    const update = { ...req.body };
    delete update._id;
    await tissusDb.updateAsync({ _id: req.params.id }, { $set: update });
    const tissu = await tissusDb.findOneAsync({ _id: req.params.id });
    if (!tissu) return res.status(404).json({ message: 'Tissu non trouvé' });
    res.json(tissu);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
});

app.delete('/api/tissus/:id', async (req, res) => {
  try {
    const numRemoved = await tissusDb.removeAsync({ _id: req.params.id }, {});
    if (numRemoved === 0) return res.status(404).json({ message: 'Tissu non trouvé' });
    res.json({ message: 'Tissu supprimé' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// ── PROJETS ──────────────────────────────────────────────────────────────────

app.get('/api/projets', async (req, res) => {
  try {
    const projets = await projetsDb.findAsync({});
    res.json(sortDocs(projets, 'dateCreation'));
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

app.get('/api/projets/etapes-suggestions', async (req, res) => {
  try {
    const projets = await projetsDb.findAsync({});
    const titres = new Set();
    projets.forEach(p => (p.etapes || []).forEach(e => { if (e.titre) titres.add(e.titre); }));
    res.json([...titres].sort((a, b) => a.localeCompare(b, 'fr')));
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

app.patch('/api/projets/:id/etapes', async (req, res) => {
  try {
    await projetsDb.updateAsync({ _id: req.params.id }, { $set: { etapes: req.body.etapes } });
    const projet = await projetsDb.findOneAsync({ _id: req.params.id });
    if (!projet) return res.status(404).json({ message: 'Projet non trouvé' });
    res.json(projet);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

app.post('/api/projets', async (req, res) => {
  try {
    const doc = { ...req.body, dateCreation: new Date() };
    const nouveau = await projetsDb.insertAsync(doc);
    res.status(201).json(nouveau);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
});

app.put('/api/projets/:id', async (req, res) => {
  try {
    const update = { ...req.body };
    delete update._id;
    await projetsDb.updateAsync({ _id: req.params.id }, { $set: update });
    const projet = await projetsDb.findOneAsync({ _id: req.params.id });
    if (!projet) return res.status(404).json({ message: 'Projet non trouvé' });
    res.json(projet);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
});

app.delete('/api/projets/:id', async (req, res) => {
  try {
    const numRemoved = await projetsDb.removeAsync({ _id: req.params.id }, {});
    if (numRemoved === 0) return res.status(404).json({ message: 'Projet non trouvé' });
    res.json({ message: 'Projet supprimé' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

app.patch('/api/projets/:id/etape/:etapeIndex', async (req, res) => {
  try {
    const projet = await projetsDb.findOneAsync({ _id: req.params.id });
    if (!projet) return res.status(404).json({ message: 'Projet non trouvé' });
    const idx = parseInt(req.params.etapeIndex);
    if (!projet.etapes || projet.etapes[idx] === undefined) return res.status(404).json({ message: 'Étape non trouvée' });
    projet.etapes[idx].faite = req.body.faite;
    await projetsDb.updateAsync({ _id: req.params.id }, { $set: { etapes: projet.etapes } });
    const updated = await projetsDb.findOneAsync({ _id: req.params.id });
    res.json(updated);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

app.patch('/api/projets/:id/statut', async (req, res) => {
  try {
    await projetsDb.updateAsync({ _id: req.params.id }, { $set: { statut: req.body.statut } });
    const projet = await projetsDb.findOneAsync({ _id: req.params.id });
    if (!projet) return res.status(404).json({ message: 'Projet non trouvé' });
    res.json(projet);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

app.patch('/api/projets/:id/imagePosition', async (req, res) => {
  try {
    await projetsDb.updateAsync({ _id: req.params.id }, { $set: { imagePosition: req.body.imagePosition } });
    const projet = await projetsDb.findOneAsync({ _id: req.params.id });
    if (!projet) return res.status(404).json({ message: 'Projet non trouvé' });
    res.json(projet);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// ── DEALERS ──────────────────────────────────────────────────────────────────

app.get('/api/dealers', async (req, res) => {
  try {
    const dealers = await dealersDb.findAsync({});
    res.json(sortDocsString(dealers, 'nom'));
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

app.post('/api/dealers', async (req, res) => {
  try {
    const doc = { ...req.body, dateAjout: new Date() };
    const nouveau = await dealersDb.insertAsync(doc);
    res.status(201).json(nouveau);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
});

app.put('/api/dealers/:id', async (req, res) => {
  try {
    const update = { ...req.body };
    delete update._id;
    await dealersDb.updateAsync({ _id: req.params.id }, { $set: update });
    const dealer = await dealersDb.findOneAsync({ _id: req.params.id });
    if (!dealer) return res.status(404).json({ message: 'Dealer non trouvé' });
    res.json(dealer);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
});

app.delete('/api/dealers/:id', async (req, res) => {
  try {
    const numRemoved = await dealersDb.removeAsync({ _id: req.params.id }, {});
    if (numRemoved === 0) return res.status(404).json({ message: 'Dealer non trouvé' });
    res.json({ message: 'Dealer supprimé' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// ── INSPIRATIONS ─────────────────────────────────────────────────────────────

app.get('/api/inspirations', async (req, res) => {
  try {
    const inspirations = await inspDb.findAsync({});
    res.json(sortDocs(inspirations, 'dateAjout'));
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

app.post('/api/inspirations', async (req, res) => {
  try {
    const doc = { ...req.body, dateAjout: new Date() };
    const nouveau = await inspDb.insertAsync(doc);
    res.status(201).json(nouveau);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
});

app.put('/api/inspirations/:id', async (req, res) => {
  try {
    const update = { ...req.body };
    delete update._id;
    await inspDb.updateAsync({ _id: req.params.id }, { $set: update });
    const inspiration = await inspDb.findOneAsync({ _id: req.params.id });
    if (!inspiration) return res.status(404).json({ message: 'Inspiration non trouvée' });
    res.json(inspiration);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
});

app.patch('/api/inspirations/:id/imagePosition', async (req, res) => {
  try {
    await inspDb.updateAsync({ _id: req.params.id }, { $set: { imagePosition: req.body.imagePosition } });
    const inspiration = await inspDb.findOneAsync({ _id: req.params.id });
    if (!inspiration) return res.status(404).json({ message: 'Inspiration non trouvée' });
    res.json(inspiration);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

app.delete('/api/inspirations/:id', async (req, res) => {
  try {
    const numRemoved = await inspDb.removeAsync({ _id: req.params.id }, {});
    if (numRemoved === 0) return res.status(404).json({ message: 'Inspiration non trouvée' });
    res.json({ message: 'Inspiration supprimée' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// ── WISH LIST ────────────────────────────────────────────────────────────────

app.get('/api/wishlist', async (req, res) => {
  try {
    const items = await wishlistDb.findAsync({});
    res.json(sortDocs(items, 'dateAjout'));
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

app.post('/api/wishlist', async (req, res) => {
  try {
    const doc = { ...req.body, dateAjout: new Date() };
    const nouveau = await wishlistDb.insertAsync(doc);
    res.status(201).json(nouveau);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
});

app.put('/api/wishlist/:id', async (req, res) => {
  try {
    const update = { ...req.body };
    delete update._id;
    await wishlistDb.updateAsync({ _id: req.params.id }, { $set: update });
    const item = await wishlistDb.findOneAsync({ _id: req.params.id });
    if (!item) return res.status(404).json({ message: 'Item non trouvé' });
    res.json(item);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
});

app.delete('/api/wishlist/:id', async (req, res) => {
  try {
    const numRemoved = await wishlistDb.removeAsync({ _id: req.params.id }, {});
    if (numRemoved === 0) return res.status(404).json({ message: 'Item non trouvé' });
    res.json({ message: 'Item supprimé' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// ── MENSURATIONS ──────────────────────────────────────────────────────────────

app.get('/api/mensurations', async (req, res) => {
  try {
    const docs = await mensurationsDb.findAsync({});
    res.json(sortDocsString(docs, 'nom'));
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

app.post('/api/mensurations', async (req, res) => {
  try {
    const doc = await mensurationsDb.insertAsync({
      ...req.body,
      dateCreation: new Date().toISOString(),
    });
    res.status(201).json(doc);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

app.put('/api/mensurations/:id', async (req, res) => {
  try {
    const update = { ...req.body };
    delete update._id;
    await mensurationsDb.updateAsync({ _id: req.params.id }, { $set: update }, {});
    const updated = await mensurationsDb.findOneAsync({ _id: req.params.id });
    res.json(updated);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

app.delete('/api/mensurations/:id', async (req, res) => {
  try {
    const numRemoved = await mensurationsDb.removeAsync({ _id: req.params.id }, {});
    if (numRemoved === 0) return res.status(404).json({ message: 'Profil non trouvé' });
    res.json({ message: 'Profil supprimé' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// ── OG PREVIEW ───────────────────────────────────────────────────────────────

function fetchUrl(url, maxRedirects = 5) {
  return new Promise((resolve, reject) => {
    const mod = url.startsWith('https') ? require('https') : require('http');
    const req = mod.get(url, {
      headers: { 'User-Agent': 'Mozilla/5.0 (compatible; SewingBox/1.0)', Accept: 'text/html' },
      timeout: 8000,
    }, (res) => {
      if ([301, 302, 303, 307, 308].includes(res.statusCode) && res.headers.location) {
        if (maxRedirects <= 0) return reject(new Error('Trop de redirections'));
        const next = res.headers.location.startsWith('http')
          ? res.headers.location
          : new URL(res.headers.location, url).href;
        return resolve(fetchUrl(next, maxRedirects - 1));
      }
      if (res.statusCode < 200 || res.statusCode >= 300) return reject(new Error(`HTTP ${res.statusCode}`));
      res.setEncoding('utf8');
      let data = '';
      res.on('data', chunk => { data += chunk; if (data.length > 500_000) req.destroy(); });
      res.on('end', () => resolve(data));
    });
    req.on('error', reject);
    req.on('timeout', () => { req.destroy(); reject(new Error('Timeout')); });
  });
}

function getMetaContent(html, attrName, attrValue) {
  // Extrait toutes les balises <meta ...> (multiline avec flag s)
  const metas = [...html.matchAll(/<meta\s([\s\S]+?)\/?>(?!\s*<\/meta>)/gi)];
  for (const meta of metas) {
    const attrs = meta[1];
    // Cherche property/name/itemprop = attrValue
    const hasProp = new RegExp(`(?:property|name|itemprop)\\s*=\\s*["']${attrValue}["']`, 'i').test(attrs);
    if (!hasProp) continue;
    const contentMatch = attrs.match(/content\s*=\s*["']([^"']+)["']/i);
    if (contentMatch) return contentMatch[1].trim();
  }
  return null;
}

function resolveUrl(base, relative) {
  if (!relative) return null;
  if (/^https?:\/\//.test(relative)) return relative;
  try { return new URL(relative, base).href; } catch { return null; }
}

function getFavicon(html, baseUrl) {
  // apple-touch-icon en priorité (meilleure résolution), puis icon standard
  const patterns = [
    /<link[^>]+rel=["'][^"']*apple-touch-icon[^"']*["'][^>]+href=["']([^"']+)["']/i,
    /<link[^>]+href=["']([^"']+)["'][^>]+rel=["'][^"']*apple-touch-icon[^"']*["']/i,
    /<link[^>]+rel=["'][^"']*(?:shortcut )?icon[^"']*["'][^>]+href=["']([^"']+)["']/i,
    /<link[^>]+href=["']([^"']+)["'][^>]+rel=["'][^"']*(?:shortcut )?icon[^"']*["']/i,
  ];
  for (const p of patterns) {
    const m = html.match(p);
    if (m) return resolveUrl(baseUrl, m[1]);
  }
  // Fallback sur /favicon.ico
  try { return new URL('/favicon.ico', baseUrl).href; } catch { return null; }
}

function parseOgTags(html, baseUrl) {
  const title = getMetaContent(html, 'property', 'og:title')
    || getMetaContent(html, 'name', 'twitter:title')
    || html.match(/<title[^>]*>([^<]+)<\/title>/i)?.[1]?.trim()
    || null;
  const rawImage = getMetaContent(html, 'property', 'og:image')
    || getMetaContent(html, 'property', 'og:image:url')
    || getMetaContent(html, 'name', 'twitter:image')
    || null;
  const image = resolveUrl(baseUrl, rawImage) || null;
  const icon = getFavicon(html, baseUrl);
  const description = getMetaContent(html, 'property', 'og:description')
    || getMetaContent(html, 'name', 'description')
    || getMetaContent(html, 'name', 'twitter:description')
    || null;
  return { title, image, icon, description };
}

function fetchImage(url, maxRedirects = 3) {
  return new Promise((resolve, reject) => {
    const mod = url.startsWith('https') ? require('https') : require('http');
    const req = mod.get(url, {
      headers: { 'User-Agent': 'Mozilla/5.0 (compatible; SewingBox/1.0)' },
      timeout: 6000,
    }, (res) => {
      if ([301, 302, 303, 307, 308].includes(res.statusCode) && res.headers.location) {
        if (maxRedirects <= 0) return reject(new Error('Trop de redirections'));
        const next = res.headers.location.startsWith('http') ? res.headers.location : new URL(res.headers.location, url).href;
        return resolve(fetchImage(next, maxRedirects - 1));
      }
      if (res.statusCode < 200 || res.statusCode >= 300) return reject(new Error(`HTTP ${res.statusCode}`));
      const contentType = (res.headers['content-type'] || 'image/png').split(';')[0].trim();
      if (!contentType.startsWith('image/')) return reject(new Error('Pas une image'));
      const chunks = [];
      let size = 0;
      res.on('data', chunk => {
        size += chunk.length;
        if (size > 500_000) { req.destroy(); return reject(new Error('Image trop grande')); }
        chunks.push(chunk);
      });
      res.on('end', () => resolve(`data:${contentType};base64,${Buffer.concat(chunks).toString('base64')}`));
    });
    req.on('error', reject);
    req.on('timeout', () => { req.destroy(); reject(new Error('Timeout')); });
  });
}

app.get('/api/og-preview', async (req, res) => {
  const { url } = req.query;
  if (!url || !/^https?:\/\//.test(url)) return res.status(400).json({ error: 'URL invalide' });
  try {
    const domain = new URL(url).hostname;

    // Fetch HTML + images en parallèle
    const [htmlResult, clearbitResult, faviconResult] = await Promise.allSettled([
      fetchUrl(url),
      fetchImage(`https://logo.clearbit.com/${domain}`),
      fetchImage(`https://www.google.com/s2/favicons?domain=${domain}&sz=128`),
    ]);

    const html = htmlResult.status === 'fulfilled' ? htmlResult.value : '';
    const og = parseOgTags(html, url);

    // og:image → base64 (fetch séparé si URL trouvée)
    let imageBase64 = null;
    if (og.image) {
      try { imageBase64 = await fetchImage(og.image); } catch {}
    }

    const iconBase64 = clearbitResult.status === 'fulfilled' ? clearbitResult.value
      : (faviconResult.status === 'fulfilled' ? faviconResult.value : null);

    if (!og.title && !imageBase64 && !iconBase64 && !og.description) {
      return res.status(404).json({ error: 'Aucune information trouvée pour ce lien' });
    }

    res.json({ title: og.title, image: imageBase64, icon: iconBase64, description: og.description });
  } catch (err) {
    res.status(500).json({ error: err.message || 'Erreur de récupération' });
  }
});

// ── Vérification de mise à jour ───────────────────────────────────────────────

const CURRENT_VERSION = '1.2.0';

app.get('/api/check-update', async (req, res) => {
  try {
    const data = await fetchUrl('https://api.github.com/repos/aurelie-hoslet/patrontheque/releases/latest');
    const release = JSON.parse(data);
    const latest = release.tag_name?.replace(/^v/, '');
    if (!latest) return res.json({ hasUpdate: false });

    const toNum = v => v.split('.').map(Number);
    const [Ma, mi, pa] = toNum(latest);
    const [Mc, mc, pc] = toNum(CURRENT_VERSION);
    const hasUpdate = Ma > Mc || (Ma === Mc && mi > mc) || (Ma === Mc && mi === mc && pa > pc);

    res.json({
      hasUpdate,
      latestVersion: latest,
      currentVersion: CURRENT_VERSION,
      downloadUrl: release.assets?.[0]?.browser_download_url || '',
    });
  } catch {
    res.json({ hasUpdate: false });
  }
});

// ── Frontend build (production Electron) ─────────────────────────────────────

if (process.env.NODE_ENV === 'production') {
  const base = __dirname.includes('app.asar')
    ? __dirname.replace(/app\.asar([\/\\])/, 'app.asar.unpacked$1')
    : __dirname;
  const frontendBuildPath = path.join(base, '../frontend/build');
  if (fs.existsSync(frontendBuildPath)) {
    app.use(express.static(frontendBuildPath));
    app.get('*', (req, res) => {
      res.sendFile(path.join(frontendBuildPath, 'index.html'));
    });
  }
}

// ── Start ─────────────────────────────────────────────────────────────────────

app.listen(PORT, () => {
  console.log('🚀 Serveur démarré sur http://localhost:' + PORT);
  console.log('📁 Données stockées dans :', DATA_DIR);
}).on('error', (err) => {
  if (err.code === 'EADDRINUSE') {
    console.log('⚠️ Port ' + PORT + ' déjà utilisé, connexion au serveur existant.');
  } else {
    console.error('❌ Erreur serveur :', err.message);
  }
});
