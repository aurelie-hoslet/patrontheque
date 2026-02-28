import React, { useState, useEffect } from 'react';
import {
  Box, TextField, Select, MenuItem, FormControl, InputLabel,
  Button, Typography, Paper, IconButton, Checkbox, FormControlLabel,
  List, ListItem, ListItemText, ListItemSecondaryAction
} from '@mui/material';
import AddIcon from '@mui/icons-material/Add';
import DeleteIcon from '@mui/icons-material/Delete';
import ContentPasteIcon from '@mui/icons-material/ContentPaste';
import { projetService } from '../services/api';

const defaultForm = {
  nom: '', patronId: '', tissuId: '', statut: 'En cours',
  notes: '', image: '', dateDebut: '', dateFin: '', etapes: []
};

function ProjetForm({ projet, patrons, tissus, onSave, onCancel }) {
  const [formData, setFormData] = useState(defaultForm);
  const [nouvelleEtape, setNouvelleEtape] = useState('');

  useEffect(() => {
    if (projet) {
      setFormData({
        nom: projet.nom || '',
        patronId: projet.patronId || '',
        tissuId: projet.tissuId || '',
        statut: projet.statut || 'En cours',
        notes: projet.notes || '',
        image: projet.image || '',
        dateDebut: projet.dateDebut ? projet.dateDebut.slice(0, 10) : '',
        dateFin: projet.dateFin ? projet.dateFin.slice(0, 10) : '',
        etapes: projet.etapes || []
      });
    } else {
      setFormData(defaultForm);
    }
  }, [projet]);

  const handleChange = (field, value) => setFormData(prev => ({ ...prev, [field]: value }));

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

  const ajouterEtape = () => {
    if (!nouvelleEtape.trim()) return;
    handleChange('etapes', [...formData.etapes, { titre: nouvelleEtape.trim(), faite: false }]);
    setNouvelleEtape('');
  };

  const supprimerEtape = (idx) => {
    handleChange('etapes', formData.etapes.filter((_, i) => i !== idx));
  };

  const toggleEtape = (idx) => {
    const updated = formData.etapes.map((e, i) => i === idx ? { ...e, faite: !e.faite } : e);
    handleChange('etapes', updated);
  };

  const handleSubmit = async (e) => {
    if (e && e.preventDefault) e.preventDefault();
    try {
      const data = {
        ...formData,
        patronId: formData.patronId || undefined,
        tissuId: formData.tissuId || undefined,
        dateDebut: formData.dateDebut || undefined,
        dateFin: formData.dateFin || undefined
      };
      if (projet) {
        await projetService.update(projet._id, data);
      } else {
        await projetService.create(data);
      }
      onSave();
    } catch (error) {
      console.error('Erreur sauvegarde projet:', error);
      alert('Erreur lors de la sauvegarde');
    }
  };

  const patronSelectionne = patrons.find(p => p._id === formData.patronId);
  const nomProjetAffiche = formData.nom || (patronSelectionne ? `${patronSelectionne.marque} - ${patronSelectionne.modele}` : '');

  return (
    <Paper sx={{ p: 3, maxWidth: 700, mx: 'auto', bgcolor: '#fff8f6' }}>
      <Typography variant="h5" sx={{ mb: 3, fontWeight: 800, color: '#33658a' }}>
        {projet ? '✏️ Modifier le projet' : '🪡 Nouveau projet'}
      </Typography>

      <Box component="form" onSubmit={handleSubmit} sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>

        <TextField
          label="Nom du projet (optionnel)"
          value={formData.nom}
          onChange={e => handleChange('nom', e.target.value)}
          fullWidth
          placeholder={nomProjetAffiche || 'Ex: Robe d\'été bleue'}
          helperText="Si vide, le nom du patron sera utilisé"
        />

        {/* Patron */}
        <FormControl fullWidth>
          <InputLabel>Patron associé</InputLabel>
          <Select value={formData.patronId} label="Patron associé" onChange={e => handleChange('patronId', e.target.value)}>
            <MenuItem value=""><em>Aucun</em></MenuItem>
            {patrons.map(p => (
              <MenuItem key={p._id} value={p._id}>{p.marque} — {p.modele}</MenuItem>
            ))}
          </Select>
        </FormControl>

        {/* Tissu */}
        <FormControl fullWidth>
          <InputLabel>Tissu associé</InputLabel>
          <Select value={formData.tissuId} label="Tissu associé" onChange={e => handleChange('tissuId', e.target.value)}>
            <MenuItem value=""><em>Aucun</em></MenuItem>
            {tissus.map(t => (
              <MenuItem key={t._id} value={t._id}>
                {t.nom}{t.couleur ? ` — ${t.couleur}` : ''}{t.quantite ? ` (${t.quantite}m)` : ''}
              </MenuItem>
            ))}
          </Select>
        </FormControl>

        {/* Dates */}
        <Box sx={{ display: 'flex', gap: 2 }}>
          <TextField
            label="Date de début"
            type="date"
            value={formData.dateDebut}
            onChange={e => handleChange('dateDebut', e.target.value)}
            InputLabelProps={{ shrink: true }}
            fullWidth
          />
          <TextField
            label="Date de fin"
            type="date"
            value={formData.dateFin}
            onChange={e => handleChange('dateFin', e.target.value)}
            InputLabelProps={{ shrink: true }}
            fullWidth
          />
        </Box>

        {/* Statut */}
        <FormControl fullWidth>
          <InputLabel>Statut</InputLabel>
          <Select value={formData.statut} label="Statut" onChange={e => handleChange('statut', e.target.value)}>
            <MenuItem value="En cours">En cours</MenuItem>
            <MenuItem value="Terminé">Terminé</MenuItem>
          </Select>
        </FormControl>

        {/* Étapes */}
        <Box>
          <Typography variant="body1" sx={{ fontWeight: 700, mb: 1 }}>Étapes</Typography>
          <Box sx={{ display: 'flex', gap: 1, mb: 1 }}>
            <TextField
              size="small"
              placeholder="Ajouter une étape..."
              value={nouvelleEtape}
              onChange={e => setNouvelleEtape(e.target.value)}
              onKeyDown={e => { if (e.key === 'Enter') { e.preventDefault(); ajouterEtape(); } }}
              sx={{ flexGrow: 1 }}
            />
            <IconButton onClick={ajouterEtape} sx={{ bgcolor: '#33658a', color: 'white', '&:hover': { bgcolor: '#1e4d6b' } }}>
              <AddIcon />
            </IconButton>
          </Box>
          {formData.etapes.length > 0 && (
            <List dense sx={{ bgcolor: 'white', borderRadius: 1, border: '1px solid #eee' }}>
              {formData.etapes.map((etape, idx) => (
                <ListItem key={idx} disablePadding sx={{ px: 1 }}>
                  <Checkbox
                    checked={etape.faite}
                    onChange={() => toggleEtape(idx)}
                    size="small"
                    sx={{ color: '#0cbaba', '&.Mui-checked': { color: '#0cbaba' } }}
                  />
                  <ListItemText
                    primary={etape.titre}
                    sx={{ textDecoration: etape.faite ? 'line-through' : 'none', color: etape.faite ? 'text.disabled' : 'inherit' }}
                  />
                  <ListItemSecondaryAction>
                    <IconButton size="small" onClick={() => supprimerEtape(idx)} edge="end">
                      <DeleteIcon fontSize="small" sx={{ color: '#e85d75' }} />
                    </IconButton>
                  </ListItemSecondaryAction>
                </ListItem>
              ))}
            </List>
          )}
        </Box>

        {/* Notes */}
        <TextField
          label="Notes"
          value={formData.notes}
          onChange={e => handleChange('notes', e.target.value)}
          fullWidth
          multiline
          rows={3}
        />

        {/* Image */}
        <Box>
          <Typography variant="body2" sx={{ mb: 1, fontWeight: 600 }}>Photo du projet</Typography>
          {formData.image ? (
            <Box sx={{ position: 'relative', display: 'inline-block' }}>
              <img src={formData.image} alt="Aperçu" style={{ width: 160, height: 120, objectFit: 'cover', borderRadius: 8 }} />
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

        <Box sx={{ display: 'flex', gap: 2, mt: 1 }}>
          <Button type="button" onClick={handleSubmit} variant="contained" size="large" sx={{ bgcolor: '#33658a', '&:hover': { bgcolor: '#1e4d6b' } }}>
            {projet ? '✨ Modifier' : '🪡 Créer le projet'}
          </Button>
          <Button variant="outlined" size="large" onClick={onCancel}>Annuler</Button>
        </Box>
      </Box>
    </Paper>
  );
}

export default ProjetForm;
