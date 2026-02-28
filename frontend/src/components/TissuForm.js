import React, { useState, useEffect } from 'react';
import {
  Box, TextField, Select, MenuItem, FormControl, InputLabel,
  Button, Typography, Paper, IconButton
} from '@mui/material';
import ContentPasteIcon from '@mui/icons-material/ContentPaste';
import DeleteIcon from '@mui/icons-material/Delete';
import { tissuService } from '../services/api';

const TYPES_TISSU = ['Chaîne et trame', 'Maille', 'Dentelle', 'Cuir', 'Autre'];

const defaultForm = {
  nom: '', type: '', couleur: '', quantite: '', provenance: '', image: ''
};

function TissuForm({ tissu, onSave, onCancel }) {
  const [formData, setFormData] = useState(defaultForm);

  useEffect(() => {
    if (tissu) {
      setFormData({
        nom: tissu.nom || '',
        type: tissu.type || '',
        couleur: tissu.couleur || '',
        quantite: tissu.quantite !== undefined ? tissu.quantite : '',
        provenance: tissu.provenance || '',
        image: tissu.image || ''
      });
    } else {
      setFormData(defaultForm);
    }
  }, [tissu]);

  const handleChange = (field, value) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const handlePasteImage = async () => {
    try {
      const items = await navigator.clipboard.read();
      for (const item of items) {
        for (const type of item.types) {
          if (type.startsWith('image/')) {
            const blob = await item.getType(type);
            const reader = new FileReader();
            reader.onloadend = () => handleChange('image', reader.result);
            reader.readAsDataURL(blob);
            return;
          }
        }
      }
      alert("Pas d'image dans le presse-papier");
    } catch {
      alert("Erreur : copiez d'abord une image avec Ctrl+C");
    }
  };

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
    } catch (error) {
      console.error('Erreur sauvegarde tissu:', error);
      alert('Erreur lors de la sauvegarde');
    }
  };

  return (
    <Paper sx={{ p: 3, maxWidth: 600, mx: 'auto', bgcolor: '#fff8f6' }}>
      <Typography variant="h5" sx={{ mb: 3, fontWeight: 800, color: '#33658a' }}>
        {tissu ? '✏️ Modifier le tissu' : '🧵 Ajouter un tissu'}
      </Typography>

      <Box component="form" onSubmit={handleSubmit} sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>

        <TextField
          label="Nom / référence *"
          value={formData.nom}
          onChange={e => handleChange('nom', e.target.value)}
          fullWidth
        />

        <FormControl fullWidth>
          <InputLabel>Type de tissu</InputLabel>
          <Select value={formData.type} label="Type de tissu" onChange={e => handleChange('type', e.target.value)}>
            <MenuItem value=""><em>—</em></MenuItem>
            {TYPES_TISSU.map(t => <MenuItem key={t} value={t}>{t}</MenuItem>)}
          </Select>
        </FormControl>

        <TextField
          label="Couleur / motif"
          value={formData.couleur}
          onChange={e => handleChange('couleur', e.target.value)}
          fullWidth
        />

        <TextField
          label="Quantité en stock (mètres)"
          type="number"
          inputProps={{ min: 0, step: 0.1 }}
          value={formData.quantite}
          onChange={e => handleChange('quantite', e.target.value)}
          fullWidth
        />

        <TextField
          label="Provenance"
          value={formData.provenance}
          onChange={e => handleChange('provenance', e.target.value)}
          fullWidth
          placeholder="Ex: Tissus de la Lune, Etsy..."
        />

        {/* Image */}
        <Box>
          <Typography variant="body2" sx={{ mb: 1, fontWeight: 600 }}>Photo du tissu</Typography>
          <Box sx={{ display: 'flex', gap: 1, alignItems: 'flex-start' }}>
            {formData.image ? (
              <Box sx={{ position: 'relative' }}>
                <img src={formData.image} alt="Aperçu" style={{ width: 120, height: 90, objectFit: 'cover', borderRadius: 8 }} />
                <IconButton
                  size="small"
                  onClick={() => handleChange('image', '')}
                  sx={{ position: 'absolute', top: -8, right: -8, bgcolor: 'white', boxShadow: 1 }}
                >
                  <DeleteIcon fontSize="small" />
                </IconButton>
              </Box>
            ) : (
              <Button
                variant="outlined"
                startIcon={<ContentPasteIcon />}
                onClick={handlePasteImage}
                sx={{ borderColor: '#33658a', color: '#33658a' }}
              >
                Coller depuis le presse-papier
              </Button>
            )}
          </Box>
        </Box>

        <Box sx={{ display: 'flex', gap: 2, mt: 1 }}>
          <Button
            type="submit"
            variant="contained"
            size="large"
            sx={{ bgcolor: '#33658a', '&:hover': { bgcolor: '#1e4d6b' } }}
          >
            {tissu ? '✨ Modifier' : '🧵 Ajouter'}
          </Button>
          <Button variant="outlined" size="large" onClick={onCancel}>
            Annuler
          </Button>
        </Box>
      </Box>
    </Paper>
  );
}

export default TissuForm;
