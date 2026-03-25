import React, { useState, useEffect } from 'react';

import {
  Box, TextField, Select, MenuItem, FormControl, InputLabel,
  Button, Typography, Paper, IconButton
} from '@mui/material';
import { Clipboard, Trash2, Layers } from 'lucide-react';
import { tissuService } from '../services/api';

const TYPES_TISSU = ['Chaîne et trame', 'Maille', 'Dentelle', 'Cuir', 'Autre'];

const defaultForm = { nom: '', type: '', couleur: '', quantite: '', provenance: '', lien: '', image: '' };

const fieldSx = {
  '& .MuiOutlinedInput-notchedOutline': { borderWidth: 2, borderColor: '#e8e3dd' },
  '&:hover .MuiOutlinedInput-notchedOutline': { borderColor: '#33658a' },
  '&.Mui-focused .MuiOutlinedInput-notchedOutline': { borderColor: '#33658a', borderWidth: 2 },
  '& .MuiInputLabel-root': { fontWeight: 600, color: '#6b6158' },
  '& .MuiInputLabel-root.Mui-focused': { color: '#33658a' },
};

function TissuForm({ tissu, onSave, onCancel }) {
  const [formData, setFormData] = useState(defaultForm);
  const [dragging, setDragging] = useState(false);

  useEffect(() => {
    setFormData(tissu ? {
      nom: tissu.nom || '',
      type: tissu.type || '',
      couleur: tissu.couleur || '',
      quantite: tissu.quantite !== undefined ? tissu.quantite : '',
      provenance: tissu.provenance || '',
      lien: tissu.lien || '',
      image: tissu.image || ''
    } : defaultForm);
  }, [tissu]);

  const handleChange = (field, value) => setFormData(prev => ({ ...prev, [field]: value }));

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

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.nom) { alert('Le nom est obligatoire'); return; }
    try {
      const data = { ...formData, quantite: formData.quantite !== '' ? Number(formData.quantite) : undefined };
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

        <TextField required label="Nom / référence" value={formData.nom}
          onChange={e => handleChange('nom', e.target.value)} fullWidth sx={fieldSx} />

        <FormControl fullWidth sx={fieldSx}>
          <InputLabel>Type de tissu</InputLabel>
          <Select value={formData.type} label="Type de tissu" onChange={e => handleChange('type', e.target.value)}>
            <MenuItem value=""><em>—</em></MenuItem>
            {TYPES_TISSU.map(t => <MenuItem key={t} value={t}>{t}</MenuItem>)}
          </Select>
        </FormControl>

        <TextField label="Couleur / motif" value={formData.couleur}
          onChange={e => handleChange('couleur', e.target.value)} fullWidth sx={fieldSx} />

        <TextField label="Quantité en stock (mètres)" type="number" inputProps={{ min: 0, step: 0.1 }}
          value={formData.quantite} onChange={e => handleChange('quantite', e.target.value)} fullWidth sx={fieldSx} />

        <TextField label="Provenance" value={formData.provenance}
          onChange={e => handleChange('provenance', e.target.value)} fullWidth
          placeholder="Ex: Tissus de la Lune, Etsy..." sx={fieldSx} />

        <TextField label="Lien produit" value={formData.lien}
          onChange={e => handleChange('lien', e.target.value)} fullWidth
          placeholder="https://..." sx={fieldSx} />

        {/* Image */}
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
