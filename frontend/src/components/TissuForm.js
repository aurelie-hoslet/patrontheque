import React, { useState, useEffect, useRef } from 'react';
import {
  Box, TextField, FormControlLabel,
  Checkbox, Chip, Button, Typography, Paper, IconButton, Tooltip
} from '@mui/material';
import { Clipboard, Trash2, Layers, Plus } from 'lucide-react';
import { tissuService, patronService } from '../services/api';
import { FABRIC_TYPES } from '../data/fabricTypes';

const COULEURS = [
  { label: 'Rouge',  value: 'rouge',  hex: '#e53935', darkHex: '#B71C1C',
    path: 'M 8 20 C 4 13 9 4 17 4 C 25 4 29 10 28 18 C 27 26 20 30 13 28 C 6 26 12 27 8 20 Z' },
  { label: 'Bleu',   value: 'bleu',   hex: '#1e88e5', darkHex: '#0D47A1',
    path: 'M 5 16 C 5 8 12 3 20 5 C 28 7 30 15 27 22 C 24 29 14 30 7 25 C 0 20 5 24 5 16 Z' },
  { label: 'Vert',   value: 'vert',   hex: '#43a047', darkHex: '#1B5E20',
    path: 'M 10 22 C 8 14 13 4 19 4 C 25 4 28 11 25 20 C 22 29 14 32 9 27 C 4 22 12 30 10 22 Z' },
  { label: 'Jaune',  value: 'jaune',  hex: '#fdd835', darkHex: '#F57F17',
    path: 'M 4 14 C 6 6 15 2 22 5 C 29 8 31 16 27 23 C 23 30 12 30 5 24 C -2 18 2 22 4 14 Z' },
  { label: 'Noir',   value: 'noir',   hex: '#212121', darkHex: '#555555',
    path: 'M 11 19 C 9 12 13 5 19 5 C 25 5 29 11 27 18 C 25 25 19 29 13 28 C 7 27 13 26 11 19 Z' },
  { label: 'Blanc',  value: 'blanc',  hex: '#f0f0f0', darkHex: '#9E9E9E', isLight: true,
    path: 'M 9 17 C 9 10 14 5 20 5 C 26 5 28 11 27 18 C 26 25 20 29 13 27 C 6 25 9 24 9 17 Z' },
  { label: 'Orange', value: 'orange', hex: '#fb8c00', darkHex: '#E65100',
    path: 'M 7 21 C 4 13 9 4 16 4 C 23 4 29 9 28 17 C 27 25 20 31 13 29 C 6 27 10 29 7 21 Z' },
  { label: 'Rose',   value: 'rose',   hex: '#e91e8c', darkHex: '#880E4F',
    path: 'M 12 22 C 7 15 10 5 17 4 C 24 3 29 8 28 17 C 27 26 19 32 12 29 C 5 26 17 29 12 22 Z' },
  { label: 'Violet', value: 'violet', hex: '#8e24aa', darkHex: '#4A148C',
    path: 'M 9 21 C 7 13 12 3 18 4 C 24 5 27 12 24 21 C 21 30 12 33 8 28 C 4 23 11 29 9 21 Z' },
  { label: 'Marron', value: 'marron', hex: '#6d4c41', darkHex: '#3E2723',
    path: 'M 3 15 C 4 6 13 1 21 5 C 29 9 31 18 26 24 C 21 30 12 31 6 25 C 0 19 2 24 3 15 Z' },
  { label: 'Gris',   value: 'gris',   hex: '#757575', darkHex: '#212121',
    path: 'M 10 18 C 9 11 14 6 20 6 C 26 6 28 12 27 19 C 26 26 20 29 13 28 C 6 27 11 25 10 18 Z' },
  { label: 'Beige',  value: 'beige',  hex: '#d4b896', darkHex: '#8D6E63',
    path: 'M 8 18 C 6 11 11 3 17 4 C 23 5 29 11 27 19 C 25 27 17 31 11 28 C 5 25 10 25 8 18 Z' },
];

const MOTIFS_PREDEFINED = [
  'Uni', 'Rayé', 'Carreaux', 'Fleuri', 'Géométrique',
  'Abstrait', 'Imprimé', 'Pois', 'Brodé', 'Dentelle', 'Autre'
];

const defaultForm = {
  nom: '',
  type: '',
  typeTissu: '',
  teinte: '',
  precisionCouleur: '',
  motifs: [],
  matiere: '',
  composition: '',
  poids: '',
  laize: '',
  quantite: '',
  provenance: '',
  destination: '',
  patronId: null,
  lien: '',
  lave: false,
  dejaUtilise: false,
  image: ''
};

const fieldSx = {
  '& .MuiOutlinedInput-notchedOutline': { borderWidth: 2, borderColor: '#e8e3dd' },
  '&:hover .MuiOutlinedInput-notchedOutline': { borderColor: '#33658a' },
  '&.Mui-focused .MuiOutlinedInput-notchedOutline': { borderColor: '#33658a', borderWidth: 2 },
  '& .MuiInputLabel-root': { fontWeight: 600, color: '#6b6158' },
  '& .MuiInputLabel-root.Mui-focused': { color: '#33658a' },
};

// Titre de section avec ligne
function Section({ label, children }) {
  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
        <Typography sx={{
          fontWeight: 800, fontSize: '0.68rem', textTransform: 'uppercase',
          letterSpacing: '0.1em', color: '#b0a898', whiteSpace: 'nowrap',
        }}>
          {label}
        </Typography>
        <Box sx={{ flex: 1, height: '1px', bgcolor: '#e8e3dd' }} />
      </Box>
      {children}
    </Box>
  );
}

function TissuForm({ tissu, onSave, onCancel }) {
  const [formData, setFormData] = useState(defaultForm);
  const [dragging, setDragging] = useState(false);
  const [motifInput, setMotifInput] = useState('');
  const [openFabricCats, setOpenFabricCats] = useState({});
  const [patronOptions, setPatronOptions] = useState([]);
  const [destinationSuggestions, setDestinationSuggestions] = useState([]);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const motifInputRef = useRef(null);
  const destinationRef = useRef(null);

  // Charge tous les noms de patrons au montage
  useEffect(() => {
    patronService.names('')
      .then(res => setPatronOptions(res.data))
      .catch(err => console.error('[TissuForm] Erreur chargement patrons:', err));
  }, []);

  useEffect(() => {
    setFormData(tissu ? {
      nom:            tissu.nom || '',
      type:           tissu.type || '',
      typeTissu:      tissu.typeTissu || '',
      teinte:         tissu.teinte || '',
      precisionCouleur: tissu.precisionCouleur || '',
      motifs:         Array.isArray(tissu.motifs) ? tissu.motifs : [],
      matiere:        tissu.matiere || '',
      composition:    tissu.composition || '',
      poids:          tissu.poids !== undefined ? tissu.poids : '',
      laize:          tissu.laize !== undefined ? tissu.laize : '',
      quantite:       tissu.quantite !== undefined ? tissu.quantite : '',
      provenance:     tissu.provenance || '',
      destination:    tissu.destination || '',
      patronId:       tissu.patronId || null,
      lien:           tissu.lien || '',
      lave:           tissu.lave || false,
      dejaUtilise:    tissu.dejaUtilise || false,
      image:          tissu.image || ''
    } : defaultForm);
    const tv = tissu ? (tissu.typeTissu || '') : '';
    const lt = tissu ? (tissu.type || '') : '';
    setOpenFabricCats({
      chaineEtTrame: FABRIC_TYPES.chaineEtTrame.values.includes(tv) || lt === 'Chaîne et trame',
      maille: FABRIC_TYPES.maille.values.includes(tv) || lt === 'Maille',
    });
  }, [tissu]);

  const handleChange = (field, value) => setFormData(prev => ({ ...prev, [field]: value }));

  // ── Destination autocomplete ──────────────────────────────────────────────

  const handleDestinationChange = (e) => {
    const val = e.target.value;
    handleChange('destination', val);
    handleChange('patronId', null);
    if (val.trim()) {
      const lowerVal = val.toLowerCase();
      const filtered = patronOptions.filter(p => p && p.label && p.label.toLowerCase().includes(lowerVal));
      setDestinationSuggestions(filtered.slice(0, 8));
      setShowSuggestions(filtered.length > 0);
    } else {
      setShowSuggestions(false);
    }
  };

  const selectDestinationSuggestion = (patron) => {
    handleChange('destination', patron.label);
    handleChange('patronId', patron._id);
    setShowSuggestions(false);
  };

  // ── Motifs ────────────────────────────────────────────────────────────────

  const togglePredefinedMotif = (motif) => {
    const already = formData.motifs.includes(motif);
    handleChange('motifs', already
      ? formData.motifs.filter(m => m !== motif)
      : [...formData.motifs, motif]
    );
  };

  const addFreeMotif = (raw) => {
    const val = raw.trim();
    if (!val || formData.motifs.includes(val)) return;
    handleChange('motifs', [...formData.motifs, val]);
    setMotifInput('');
  };

  const removeMotif = (motif) => handleChange('motifs', formData.motifs.filter(m => m !== motif));

  const handleMotifKeyDown = (e) => {
    if (e.key === 'Enter' || e.key === ',') {
      e.preventDefault();
      addFreeMotif(motifInput);
    } else if (e.key === 'Backspace' && !motifInput && formData.motifs.length > 0) {
      removeMotif(formData.motifs[formData.motifs.length - 1]);
    }
  };

  // ── Image ─────────────────────────────────────────────────────────────────

  const loadImageFile = (file) => {
    if (!file || !file.type.startsWith('image/')) return;
    const reader = new FileReader();
    reader.onloadend = () => handleChange('image', reader.result);
    reader.readAsDataURL(file);
  };

  const handlePasteImage = async () => {
    try {
      const items = await navigator.clipboard.read();
      for (const item of items) {
        const imageType = item.types.find(t => t.startsWith('image/'));
        if (imageType) { loadImageFile(await item.getType(imageType)); return; }
      }
    } catch { console.error('Impossible de lire le presse-papiers'); }
  };

  useEffect(() => {
    const handlePaste = (e) => {
      const items = e.clipboardData?.items;
      if (!items) return;
      for (const item of items) {
        if (item.type.startsWith('image/')) { loadImageFile(item.getAsFile()); return; }
      }
    };
    window.addEventListener('paste', handlePaste);
    return () => window.removeEventListener('paste', handlePaste);
  }, []);

  // ── Submit ────────────────────────────────────────────────────────────────

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.nom) { alert('Le nom est obligatoire'); return; }
    try {
      const derivedType = FABRIC_TYPES.chaineEtTrame.values.includes(formData.typeTissu) ? 'Chaîne et trame'
        : FABRIC_TYPES.maille.values.includes(formData.typeTissu) ? 'Maille'
        : formData.type;
      const data = {
        ...formData,
        type:     derivedType,
        quantite: formData.quantite !== '' ? Number(formData.quantite) : undefined,
        laize:    formData.laize    !== '' ? Number(formData.laize)    : undefined,
        poids:    formData.poids    !== '' ? Number(formData.poids)    : undefined,
      };
      if (tissu) {
        await tissuService.update(tissu._id, data);
      } else {
        await tissuService.create(data);
      }
      onSave();
    } catch {
      alert('Erreur lors de la sauvegarde');
    }
  };

  // ── Render ────────────────────────────────────────────────────────────────

  return (
    <Paper elevation={0} sx={{ p: 3, maxWidth: 600, mx: 'auto' }}>
      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5, mb: 3 }}>
        <Box sx={{ width: 36, height: 36, borderRadius: '50%', bgcolor: '#33658a', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <Layers size={18} color="white" strokeWidth={2} />
        </Box>
        <Typography variant="h6" sx={{ fontWeight: 800 }}>
          {tissu ? 'Modifier le tissu' : 'Ajouter un tissu'}
        </Typography>
      </Box>

      <Box component="form" onSubmit={handleSubmit} sx={{ display: 'flex', flexDirection: 'column', gap: 3 }}>

        {/* ── Identité ── */}
        <Section label="Identité">
          <TextField required label="Nom / référence" value={formData.nom}
            onChange={e => handleChange('nom', e.target.value)} fullWidth sx={fieldSx} />
        </Section>

        {/* ── Nature & aspect ── */}
        <Section label="Nature & aspect">

          {/* Type de tissu — arbre FABRIC_TYPES, sélection unique */}
          <Box>
            <Typography sx={{ fontWeight: 700, color: '#6b6158', fontSize: '0.78rem', mb: 0.75 }}>Type de tissu</Typography>
            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 0.5 }}>
              {Object.entries(FABRIC_TYPES).map(([catKey, cat]) => {
                const catOpen = !!openFabricCats[catKey];
                const catSelected = cat.values.includes(formData.typeTissu);
                const toggleFold = () => setOpenFabricCats(prev => ({ ...prev, [catKey]: !prev[catKey] }));
                const selectVal = (val) => {
                  const newVal = formData.typeTissu === val ? '' : val;
                  handleChange('typeTissu', newVal);
                  if (newVal) setOpenFabricCats(prev => ({ ...prev, [catKey]: true }));
                };
                return (
                  <Box key={catKey}>
                    <Box sx={{
                      display: 'flex', alignItems: 'center', gap: 1,
                      px: 1, py: 0.6, userSelect: 'none', borderRadius: 1.5,
                      bgcolor: catOpen ? 'rgba(51,101,138,0.07)' : 'transparent',
                    }}>
                      <Checkbox
                        checked={catSelected}
                        size="small"
                        sx={{ p: 0, color: '#33658a', '&.Mui-checked': { color: '#33658a' } }}
                        onChange={() => handleChange('typeTissu', '')}
                        onClick={e => e.stopPropagation()}
                      />
                      <Typography
                        onClick={toggleFold}
                        sx={{ fontWeight: 700, fontSize: '0.85rem', color: '#33658a', flex: 1, cursor: 'pointer', '&:hover': { opacity: 0.75 } }}
                      >
                        {cat.label}
                      </Typography>
                    </Box>
                    {catOpen && (
                      <Box sx={{ ml: 3.5, mt: 0.25, mb: 0.5, display: 'grid', gridTemplateColumns: { xs: '1fr', sm: '1fr 1fr' }, gap: 0 }}>
                        {cat.values.map((val) => {
                          const checked = formData.typeTissu === val;
                          return (
                            <Box
                              key={val}
                              onClick={() => selectVal(val)}
                              sx={{
                                display: 'flex', alignItems: 'center', gap: 0.75,
                                py: 0.3, px: 0.5, cursor: 'pointer', borderRadius: 1,
                                '&:hover': { bgcolor: 'rgba(51,101,138,0.07)' },
                              }}
                            >
                              <Checkbox
                                checked={checked}
                                onChange={() => selectVal(val)}
                                onClick={e => e.stopPropagation()}
                                size="small"
                                sx={{ p: 0, color: 'rgba(51,101,138,0.4)', '&.Mui-checked': { color: '#33658a' } }}
                              />
                              <Typography sx={{ fontSize: '0.8rem', fontWeight: checked ? 700 : 400, color: checked ? '#33658a' : 'text.primary' }}>
                                {val}
                              </Typography>
                            </Box>
                          );
                        })}
                      </Box>
                    )}
                  </Box>
                );
              })}
            </Box>
          </Box>

          {/* Couleur — pastilles SVG organiques */}
          <Box>
            <Typography sx={{ fontWeight: 700, color: '#6b6158', fontSize: '0.78rem', mb: 1 }}>Couleur</Typography>
            <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5 }}>
              {COULEURS.map(c => {
                const selected = formData.teinte === c.value;
                return (
                  <Tooltip key={c.value} title={c.label} placement="top">
                    <Box
                      component="svg"
                      viewBox="-2 -2 36 36"
                      width={38}
                      height={38}
                      onClick={() => handleChange('teinte', selected ? '' : c.value)}
                      sx={{
                        cursor: 'pointer',
                        filter: selected
                          ? 'drop-shadow(0 2px 5px rgba(0,0,0,0.35))'
                          : 'drop-shadow(0 1px 2px rgba(0,0,0,0.15))',
                        transition: 'filter 0.15s, transform 0.15s',
                        '&:hover': { transform: 'scale(1.12)' },
                      }}
                    >
                      <path
                        d={c.path}
                        fill={c.hex}
                        stroke={selected ? c.darkHex : (c.isLight ? '#d0d0d0' : 'none')}
                        strokeWidth={selected ? 2.5 : (c.isLight ? 1 : 0)}
                      />
                      {/* Reflet clair */}
                      <path
                        d="M 12 10 C 11 7 14 5 17 7 C 20 9 20 12 17 13 C 14 14 13 13 12 10 Z"
                        fill="white"
                        opacity="0.42"
                      />
                    </Box>
                  </Tooltip>
                );
              })}
            </Box>
          </Box>

          {/* Nuance */}
          <TextField
            label="Nuance" value={formData.precisionCouleur}
            onChange={e => handleChange('precisionCouleur', e.target.value)}
            fullWidth placeholder="ex: terracotta, bleu canard, ivoire…" sx={fieldSx}
          />

          {/* Motifs */}
          <Box>
            <Typography sx={{ fontWeight: 700, color: '#6b6158', fontSize: '0.78rem', mb: 1 }}>Motifs</Typography>

            <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.75, mb: 1.5 }}>
              {MOTIFS_PREDEFINED.map(m => {
                const selected = formData.motifs.includes(m);
                return (
                  <Chip
                    key={m} label={m} size="small"
                    onClick={() => togglePredefinedMotif(m)}
                    sx={{
                      cursor: 'pointer', fontWeight: 600, fontSize: '0.78rem',
                      bgcolor: selected ? '#33658a' : '#f0ece8',
                      color:   selected ? 'white'   : '#3a3530',
                      border:  selected ? '1.5px solid #33658a' : '1.5px solid #e0dbd4',
                      '&:hover': { bgcolor: selected ? '#1e4d6b' : '#e8e3dd' }
                    }}
                  />
                );
              })}
            </Box>

            {formData.motifs.filter(m => !MOTIFS_PREDEFINED.includes(m)).length > 0 && (
              <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.75, mb: 1 }}>
                {formData.motifs.filter(m => !MOTIFS_PREDEFINED.includes(m)).map(m => (
                  <Chip
                    key={m} label={m} size="small" onDelete={() => removeMotif(m)}
                    sx={{ bgcolor: '#e3eef7', color: '#1e4d6b', fontWeight: 600, fontSize: '0.78rem', border: '1.5px solid #b0cfe0' }}
                  />
                ))}
              </Box>
            )}

            <Box sx={{ display: 'flex', gap: 1 }}>
              <TextField
                inputRef={motifInputRef}
                size="small" placeholder="Ajouter un motif…"
                value={motifInput}
                onChange={e => setMotifInput(e.target.value)}
                onKeyDown={handleMotifKeyDown}
                sx={{ flex: 1, ...fieldSx }}
              />
              <IconButton size="small" onClick={() => addFreeMotif(motifInput)}
                sx={{ border: '2px solid #33658a', borderRadius: 1, color: '#33658a', '&:hover': { bgcolor: '#e3eef7' } }}>
                <Plus size={16} strokeWidth={2.5} />
              </IconButton>
            </Box>
            <Typography variant="caption" sx={{ color: '#9e9790', mt: 0.5, display: 'block' }}>
              Entrée ou virgule pour valider un tag libre
            </Typography>
          </Box>
        </Section>

        {/* ── Caractéristiques techniques ── */}
        <Section label="Caractéristiques techniques">
          <TextField
            label="Matière principale" value={formData.matiere}
            onChange={e => handleChange('matiere', e.target.value)} fullWidth
            placeholder="ex: Coton, Lin, Viscose, Laine…" sx={fieldSx}
          />
          <TextField
            label="Composition" value={formData.composition}
            onChange={e => handleChange('composition', e.target.value)} fullWidth
            placeholder="ex: 100% coton, 50% lin 50% viscose" sx={fieldSx}
          />
          <Box sx={{ display: 'flex', gap: 2 }}>
            <TextField
              label="Poids (g/m²)" type="number" inputProps={{ min: 0, step: 1 }}
              value={formData.poids} onChange={e => handleChange('poids', e.target.value)}
              fullWidth sx={fieldSx}
            />
            <TextField
              label="Largeur de laize (cm)" type="number" inputProps={{ min: 0, step: 1 }}
              value={formData.laize} onChange={e => handleChange('laize', e.target.value)}
              fullWidth sx={fieldSx}
            />
          </Box>
        </Section>

        {/* ── Stock & provenance ── */}
        <Section label="Stock & provenance">
          <TextField
            label="Quantité en stock (mètres)" type="number" inputProps={{ min: 0, step: 0.1 }}
            value={formData.quantite} onChange={e => handleChange('quantite', e.target.value)}
            fullWidth sx={fieldSx}
          />
          <TextField
            label="Provenance" value={formData.provenance}
            onChange={e => handleChange('provenance', e.target.value)} fullWidth
            placeholder="Ex: Tissus de la Lune, Etsy…" sx={fieldSx}
          />

          {/* Destination — input + suggestions */}
          <Box sx={{ position: 'relative' }} ref={destinationRef}>
            <TextField
              label="Destination"
              value={formData.destination}
              onChange={handleDestinationChange}
              onBlur={() => setTimeout(() => setShowSuggestions(false), 150)}
              fullWidth
              placeholder="ex: Robe d'été, ou nom d'un patron…"
              sx={fieldSx}
            />
            {showSuggestions && (
              <Paper elevation={4} sx={{
                position: 'absolute', top: '100%', left: 0, right: 0, zIndex: 1300,
                maxHeight: 220, overflowY: 'auto', borderRadius: 2, mt: 0.5,
              }}>
                {destinationSuggestions.map(p => (
                  <Box
                    key={p._id}
                    onMouseDown={() => selectDestinationSuggestion(p)}
                    sx={{
                      px: 2, py: 1.2, cursor: 'pointer', fontSize: '0.9rem',
                      '&:hover': { bgcolor: '#e3eef7' },
                    }}
                  >
                    {p.label}
                  </Box>
                ))}
              </Paper>
            )}
          </Box>

          <TextField
            label="Lien produit" value={formData.lien}
            onChange={e => handleChange('lien', e.target.value)} fullWidth
            placeholder="https://…" sx={fieldSx}
          />
        </Section>

        {/* ── État ── */}
        <Section label="État">
          <Box sx={{ display: 'flex', gap: 3 }}>
            <FormControlLabel
              control={
                <Checkbox checked={formData.lave} onChange={e => handleChange('lave', e.target.checked)}
                  size="small" sx={{ color: '#aaa', '&.Mui-checked': { color: '#33658a' } }} />
              }
              label={<Typography sx={{ fontSize: '0.92rem', color: '#3a3530', fontWeight: 600 }}>Lavé</Typography>}
            />
            <FormControlLabel
              control={
                <Checkbox checked={formData.dejaUtilise} onChange={e => handleChange('dejaUtilise', e.target.checked)}
                  size="small" sx={{ color: '#aaa', '&.Mui-checked': { color: '#33658a' } }} />
              }
              label={<Typography sx={{ fontSize: '0.92rem', color: '#3a3530', fontWeight: 600 }}>Déjà utilisé</Typography>}
            />
          </Box>
        </Section>

        {/* ── Photo du tissu ── */}
        <Section label="Photo du tissu">
          {formData.image ? (
            <Box sx={{ position: 'relative', display: 'inline-block' }}>
              <img src={formData.image} alt="Aperçu" style={{ width: 120, height: 90, objectFit: 'cover', borderRadius: 8 }} />
              <IconButton size="small" onClick={() => handleChange('image', '')}
                sx={{ position: 'absolute', top: -8, right: -8, bgcolor: 'white', boxShadow: 1 }}>
                <Trash2 size={14} strokeWidth={2} />
              </IconButton>
            </Box>
          ) : (
            <Box
              onDragOver={e => { e.preventDefault(); setDragging(true); }}
              onDragLeave={() => setDragging(false)}
              onDrop={e => { e.preventDefault(); setDragging(false); loadImageFile(e.dataTransfer.files[0]); }}
              onClick={() => document.getElementById('tissu-file-input').click()}
              sx={{
                border: `2px dashed ${dragging ? '#33658a' : '#e8e3dd'}`,
                borderRadius: 2, p: 2.5, textAlign: 'center', cursor: 'pointer',
                bgcolor: dragging ? '#e3eef7' : 'transparent',
                transition: 'all 0.15s',
                '&:hover': { borderColor: '#33658a', bgcolor: '#f0f6fa' }
              }}
            >
              <Typography variant="body2" color="text.secondary" sx={{ mb: 1, fontSize: '0.85rem' }}>
                Glisser-déposer ou cliquer pour parcourir
              </Typography>
              <Button size="small" variant="outlined" startIcon={<Clipboard size={14} />}
                onClick={e => { e.stopPropagation(); handlePasteImage(); }}
                sx={{ borderColor: '#33658a', color: '#33658a', fontWeight: 600, borderWidth: 2 }}>
                Coller une image
              </Button>
              <input id="tissu-file-input" type="file" accept="image/*" style={{ display: 'none' }}
                onChange={e => loadImageFile(e.target.files[0])} />
            </Box>
          )}
        </Section>

        <Box sx={{ display: 'flex', gap: 2, justifyContent: 'flex-end', pt: 1 }}>
          <Button onClick={onCancel} sx={{ color: 'text.secondary' }}>Annuler</Button>
          <Button type="submit" variant="contained"
            sx={{ bgcolor: '#33658a', '&:hover': { bgcolor: '#1e4d6b' }, fontWeight: 700 }}>
            {tissu ? 'Modifier' : 'Ajouter'}
          </Button>
        </Box>

      </Box>
    </Paper>
  );
}

export default TissuForm;
