import React, { useState, useEffect, useRef } from 'react';

import {
  Box, TextField, FormControl, FormLabel,
  RadioGroup, Radio, FormControlLabel,
  Checkbox, Chip, Button, Typography, Paper, IconButton, Tooltip
} from '@mui/material';
import { Clipboard, Trash2, Layers, Plus } from 'lucide-react';
import { tissuService } from '../services/api';

const TYPES_TISSU = ['Maille', 'Chaîne et trame'];

const COULEURS = [
  { label: 'Rouge',  value: 'rouge',  hex: '#e53935' },
  { label: 'Bleu',   value: 'bleu',   hex: '#1e88e5' },
  { label: 'Vert',   value: 'vert',   hex: '#43a047' },
  { label: 'Jaune',  value: 'jaune',  hex: '#fdd835' },
  { label: 'Noir',   value: 'noir',   hex: '#212121' },
  { label: 'Blanc',  value: 'blanc',  hex: '#f0f0f0', border: '#ccc' },
  { label: 'Orange', value: 'orange', hex: '#fb8c00' },
  { label: 'Rose',   value: 'rose',   hex: '#e91e8c' },
  { label: 'Violet', value: 'violet', hex: '#8e24aa' },
  { label: 'Marron', value: 'marron', hex: '#6d4c41' },
  { label: 'Gris',   value: 'gris',   hex: '#757575' },
  { label: 'Beige',  value: 'beige',  hex: '#d4b896' },
];

const MOTIFS_PREDEFINED = [
  'Uni', 'Rayé', 'Carreaux', 'Fleuri', 'Géométrique',
  'Abstrait', 'Imprimé', 'Pois', 'Brodé', 'Dentelle', 'Autre'
];

const defaultForm = {
  nom: '',
  type: '',
  teinte: '',
  precisionCouleur: '',
  motifs: [],
  quantite: '',
  provenance: '',
  composition: '',
  poids: '',
  lave: false,
  dejaUtilise: false,
  lien: '',
  image: ''
};

const fieldSx = {
  '& .MuiOutlinedInput-notchedOutline': { borderWidth: 2, borderColor: '#e8e3dd' },
  '&:hover .MuiOutlinedInput-notchedOutline': { borderColor: '#33658a' },
  '&.Mui-focused .MuiOutlinedInput-notchedOutline': { borderColor: '#33658a', borderWidth: 2 },
  '& .MuiInputLabel-root': { fontWeight: 600, color: '#6b6158' },
  '& .MuiInputLabel-root.Mui-focused': { color: '#33658a' },
};

const sectionLabelSx = {
  fontWeight: 700, color: '#6b6158', fontSize: '0.78rem',
  textTransform: 'uppercase', letterSpacing: '0.05em', mb: 1
};

function TissuForm({ tissu, onSave, onCancel }) {
  const [formData, setFormData] = useState(defaultForm);
  const [dragging, setDragging] = useState(false);
  const [motifInput, setMotifInput] = useState('');
  const motifInputRef = useRef(null);

  useEffect(() => {
    setFormData(tissu ? {
      nom:            tissu.nom || '',
      type:           tissu.type || '',
      teinte:         tissu.teinte || '',
      precisionCouleur: tissu.precisionCouleur || '',
      motifs:         Array.isArray(tissu.motifs) ? tissu.motifs : [],
      quantite:       tissu.quantite !== undefined ? tissu.quantite : '',
      provenance:     tissu.provenance || '',
      composition:    tissu.composition || '',
      poids:          tissu.poids !== undefined ? tissu.poids : '',
      lave:           tissu.lave || false,
      dejaUtilise:    tissu.dejaUtilise || false,
      lien:           tissu.lien || '',
      image:          tissu.image || ''
    } : defaultForm);
  }, [tissu]);

  const handleChange = (field, value) => setFormData(prev => ({ ...prev, [field]: value }));

  // ── Motifs tag logic ──────────────────────────────────────────────────────

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

  // ── Image logic ───────────────────────────────────────────────────────────

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
      const data = {
        ...formData,
        quantite: formData.quantite !== '' ? Number(formData.quantite) : undefined,
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

      <Box component="form" onSubmit={handleSubmit} sx={{ display: 'flex', flexDirection: 'column', gap: 2.5 }}>

        {/* Nom */}
        <TextField required label="Nom / référence" value={formData.nom}
          onChange={e => handleChange('nom', e.target.value)} fullWidth sx={fieldSx} />

        {/* Type de tissu — radio */}
        <FormControl>
          <FormLabel sx={sectionLabelSx}>Type de tissu</FormLabel>
          <RadioGroup row value={formData.type} onChange={e => handleChange('type', e.target.value)}>
            {TYPES_TISSU.map(t => (
              <FormControlLabel
                key={t} value={t} label={t}
                control={<Radio size="small" sx={{ color: '#aaa', '&.Mui-checked': { color: '#33658a' } }} />}
                sx={{ '& .MuiFormControlLabel-label': { fontSize: '0.92rem', color: '#3a3530' } }}
              />
            ))}
          </RadioGroup>
        </FormControl>

        {/* Teinte — pastilles */}
        <Box>
          <Typography sx={sectionLabelSx}>Teinte</Typography>
          <Box sx={{ display: 'grid', gridTemplateColumns: 'repeat(6, 1fr)', gap: 1, maxWidth: 300 }}>
            {COULEURS.map(c => (
              <Tooltip key={c.value} title={c.label} placement="top">
                <Box
                  onClick={() => handleChange('teinte', formData.teinte === c.value ? '' : c.value)}
                  sx={{
                    width: 32, height: 32, borderRadius: '50%',
                    bgcolor: c.hex,
                    border: `2px solid ${formData.teinte === c.value ? '#33658a' : (c.border || 'transparent')}`,
                    outline: formData.teinte === c.value ? '2px solid #33658a' : '2px solid transparent',
                    outlineOffset: '2px',
                    cursor: 'pointer',
                    transition: 'outline 0.15s, border 0.15s',
                    boxShadow: '0 1px 3px rgba(0,0,0,0.15)',
                    '&:hover': { outlineColor: '#33658a' }
                  }}
                />
              </Tooltip>
            ))}
          </Box>
        </Box>

        {/* Précision couleur */}
        <TextField
          label="Précision couleur" value={formData.precisionCouleur}
          onChange={e => handleChange('precisionCouleur', e.target.value)}
          fullWidth placeholder='ex: bleu pétrole, bordeaux fané' sx={fieldSx}
        />

        {/* Motifs — multiselect avec tags */}
        <Box>
          <Typography sx={sectionLabelSx}>Motifs</Typography>

          {/* Prédéfinis cliquables */}
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

          {/* Tags libres sélectionnés */}
          {formData.motifs.filter(m => !MOTIFS_PREDEFINED.includes(m)).length > 0 && (
            <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.75, mb: 1 }}>
              {formData.motifs.filter(m => !MOTIFS_PREDEFINED.includes(m)).map(m => (
                <Chip
                  key={m} label={m} size="small" onDelete={() => removeMotif(m)}
                  sx={{
                    bgcolor: '#e3eef7', color: '#1e4d6b', fontWeight: 600,
                    fontSize: '0.78rem', border: '1.5px solid #b0cfe0'
                  }}
                />
              ))}
            </Box>
          )}

          {/* Saisie libre */}
          <Box sx={{ display: 'flex', gap: 1 }}>
            <TextField
              inputRef={motifInputRef}
              size="small" placeholder="Ajouter un motif…"
              value={motifInput}
              onChange={e => setMotifInput(e.target.value)}
              onKeyDown={handleMotifKeyDown}
              sx={{ flex: 1, ...fieldSx }}
            />
            <IconButton
              size="small"
              onClick={() => addFreeMotif(motifInput)}
              sx={{ border: '2px solid #33658a', borderRadius: 1, color: '#33658a', '&:hover': { bgcolor: '#e3eef7' } }}
            >
              <Plus size={16} strokeWidth={2.5} />
            </IconButton>
          </Box>
          <Typography variant="caption" sx={{ color: '#9e9790', mt: 0.5, display: 'block' }}>
            Entrée ou virgule pour valider un tag libre
          </Typography>
        </Box>

        {/* Quantité */}
        <TextField label="Quantité en stock (mètres)" type="number" inputProps={{ min: 0, step: 0.1 }}
          value={formData.quantite} onChange={e => handleChange('quantite', e.target.value)} fullWidth sx={fieldSx} />

        {/* Provenance */}
        <TextField label="Provenance" value={formData.provenance}
          onChange={e => handleChange('provenance', e.target.value)} fullWidth
          placeholder="Ex: Tissus de la Lune, Etsy..." sx={fieldSx} />

        {/* Composition */}
        <TextField
          label="Composition" value={formData.composition}
          onChange={e => handleChange('composition', e.target.value)} fullWidth
          placeholder="ex: 100% coton, 50% lin 50% viscose" sx={fieldSx}
        />

        {/* Poids */}
        <TextField
          label="Poids (g/m²)" type="number" inputProps={{ min: 0, step: 1 }}
          value={formData.poids}
          onChange={e => handleChange('poids', e.target.value)}
          fullWidth sx={fieldSx}
        />

        {/* Lien */}
        <TextField label="Lien produit" value={formData.lien}
          onChange={e => handleChange('lien', e.target.value)} fullWidth
          placeholder="https://..." sx={fieldSx} />

        {/* Lavé / Déjà utilisé */}
        <Box sx={{ display: 'flex', gap: 3 }}>
          <FormControlLabel
            control={
              <Checkbox
                checked={formData.lave}
                onChange={e => handleChange('lave', e.target.checked)}
                size="small"
                sx={{ color: '#aaa', '&.Mui-checked': { color: '#33658a' } }}
              />
            }
            label={<Typography sx={{ fontSize: '0.92rem', color: '#3a3530', fontWeight: 600 }}>Lavé</Typography>}
          />
          <FormControlLabel
            control={
              <Checkbox
                checked={formData.dejaUtilise}
                onChange={e => handleChange('dejaUtilise', e.target.checked)}
                size="small"
                sx={{ color: '#aaa', '&.Mui-checked': { color: '#33658a' } }}
              />
            }
            label={<Typography sx={{ fontSize: '0.92rem', color: '#3a3530', fontWeight: 600 }}>Déjà utilisé</Typography>}
          />
        </Box>

        {/* Photo du tissu */}
        <Box>
          <Typography variant="body2" sx={{ mb: 1, fontWeight: 700, color: 'text.secondary', fontSize: '0.78rem', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
            Photo du tissu
          </Typography>
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
        </Box>

        <Box sx={{ display: 'flex', gap: 2, justifyContent: 'flex-end', pt: 1 }}>
          <Button onClick={onCancel} sx={{ color: 'text.secondary' }}>Annuler</Button>
          <Button type="submit" variant="contained" sx={{ bgcolor: '#33658a', '&:hover': { bgcolor: '#1e4d6b' }, fontWeight: 700 }}>
            {tissu ? 'Modifier' : 'Ajouter'}
          </Button>
        </Box>
      </Box>
    </Paper>
  );
}

export default TissuForm;
