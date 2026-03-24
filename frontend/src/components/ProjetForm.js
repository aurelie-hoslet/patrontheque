import React, { useState, useEffect } from 'react';
import {
  Box, TextField, Select, MenuItem, FormControl, InputLabel,
  Button, Typography, Paper, IconButton, Checkbox,
  List, ListItem, ListItemText
} from '@mui/material';
import { ClipboardList, Plus, Trash2, Clipboard, Pencil } from 'lucide-react';
import { projetService } from '../services/api';

const defaultForm = {
  nom: '', patronId: '', tissuId: '', statut: 'En cours',
  notes: '', image: '', dateDebut: '', dateFin: '', etapes: []
};

const fieldSx = {
  '& .MuiOutlinedInput-notchedOutline': { borderWidth: 2, borderColor: '#e8e3dd' },
  '&:hover .MuiOutlinedInput-notchedOutline': { borderColor: '#33658a' },
  '&.Mui-focused .MuiOutlinedInput-notchedOutline': { borderColor: '#33658a', borderWidth: 2 },
  '& .MuiInputLabel-root': { fontWeight: 600, color: '#6b6158' },
  '& .MuiInputLabel-root.Mui-focused': { color: '#33658a' },
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
    <Paper elevation={0} sx={{ p: 3, maxWidth: 700, mx: 'auto' }}>
      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5, mb: 3 }}>
        <Box sx={{ width: 36, height: 36, borderRadius: '50%', bgcolor: '#33658a', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <ClipboardList size={18} color="white" strokeWidth={2} />
        </Box>
        <Typography variant="h6" sx={{ fontWeight: 800 }}>
          {projet ? 'Modifier le projet' : 'Nouveau projet'}
        </Typography>
      </Box>

      <Box component="form" onSubmit={handleSubmit} sx={{ display: 'flex', flexDirection: 'column', gap: 2.5 }}>

        <TextField
          label="Nom du projet (optionnel)"
          value={formData.nom}
          onChange={e => handleChange('nom', e.target.value)}
          fullWidth
          placeholder={nomProjetAffiche || "Ex: Robe d'été bleue"}
          helperText="Si vide, le nom du patron sera utilisé"
          sx={fieldSx}
        />

        <FormControl fullWidth sx={fieldSx}>
          <InputLabel>Patron associé</InputLabel>
          <Select value={formData.patronId} label="Patron associé" onChange={e => handleChange('patronId', e.target.value)}>
            <MenuItem value=""><em>Aucun</em></MenuItem>
            {patrons.map(p => (
              <MenuItem key={p._id} value={p._id}>{p.marque} — {p.modele}</MenuItem>
            ))}
          </Select>
        </FormControl>

        <FormControl fullWidth sx={fieldSx}>
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

        <Box sx={{ display: 'flex', gap: 2 }}>
          <TextField
            label="Date de début"
            type="date"
            value={formData.dateDebut}
            onChange={e => handleChange('dateDebut', e.target.value)}
            InputLabelProps={{ shrink: true }}
            fullWidth
            sx={fieldSx}
          />
          <TextField
            label="Date de fin"
            type="date"
            value={formData.dateFin}
            onChange={e => handleChange('dateFin', e.target.value)}
            InputLabelProps={{ shrink: true }}
            fullWidth
            sx={fieldSx}
          />
        </Box>

        <FormControl fullWidth sx={fieldSx}>
          <InputLabel>Statut</InputLabel>
          <Select value={formData.statut} label="Statut" onChange={e => handleChange('statut', e.target.value)}>
            <MenuItem value="En cours">En cours</MenuItem>
            <MenuItem value="Terminé">Terminé</MenuItem>
          </Select>
        </FormControl>

        {/* Étapes */}
        <Box>
          <Typography variant="body2" sx={{ mb: 1, fontWeight: 700, color: 'text.secondary', fontSize: '0.78rem', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
            Étapes
          </Typography>
          <Box sx={{ display: 'flex', gap: 1, mb: 1 }}>
            <TextField
              size="small"
              placeholder="Ajouter une étape..."
              value={nouvelleEtape}
              onChange={e => setNouvelleEtape(e.target.value)}
              onKeyDown={e => { if (e.key === 'Enter') { e.preventDefault(); ajouterEtape(); } }}
              sx={{ flexGrow: 1, ...fieldSx }}
            />
            <IconButton onClick={ajouterEtape} sx={{ bgcolor: '#33658a', color: 'white', borderRadius: 1.5, '&:hover': { bgcolor: '#1e4d6b' } }}>
              <Plus size={18} />
            </IconButton>
          </Box>
          {formData.etapes.length > 0 && (
            <List dense sx={{ bgcolor: 'rgba(51,101,138,0.04)', borderRadius: 2, border: '1.5px solid rgba(26,19,10,0.07)' }}>
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
                    primaryTypographyProps={{ sx: { textDecoration: etape.faite ? 'line-through' : 'none', color: etape.faite ? 'text.disabled' : 'inherit', fontSize: '0.88rem' } }}
                  />
                  <IconButton size="small" onClick={() => supprimerEtape(idx)} edge="end" sx={{ color: '#e85d75', mr: 0.5 }}>
                    <Trash2 size={14} strokeWidth={2} />
                  </IconButton>
                </ListItem>
              ))}
            </List>
          )}
        </Box>

        <TextField
          label="Notes"
          value={formData.notes}
          onChange={e => handleChange('notes', e.target.value)}
          fullWidth
          multiline
          rows={3}
          sx={fieldSx}
        />

        {/* Image */}
        <Box>
          <Typography variant="body2" sx={{ mb: 1, fontWeight: 700, color: 'text.secondary', fontSize: '0.78rem', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
            Photo du projet
          </Typography>
          {formData.image ? (
            <Box sx={{ position: 'relative', display: 'inline-block' }}>
              <img src={formData.image} alt="Aperçu" style={{ width: 160, height: 120, objectFit: 'cover', borderRadius: 8 }} />
              <IconButton
                size="small"
                onClick={() => handleChange('image', '')}
                sx={{ position: 'absolute', top: -8, right: -8, bgcolor: 'white', boxShadow: 1 }}
              >
                <Trash2 size={14} strokeWidth={2} />
              </IconButton>
            </Box>
          ) : (
            <Button variant="outlined" startIcon={<Clipboard size={16} />} onClick={handlePasteImage}
              sx={{ borderColor: '#33658a', color: '#33658a', fontWeight: 600, borderWidth: 2 }}>
              Coller depuis le presse-papier
            </Button>
          )}
        </Box>

        <Box sx={{ display: 'flex', gap: 2, justifyContent: 'flex-end', pt: 1 }}>
          <Button onClick={onCancel} sx={{ color: 'text.secondary' }}>Annuler</Button>
          <Button type="button" onClick={handleSubmit} variant="contained" startIcon={projet ? <Pencil size={16} /> : <Plus size={16} />}
            sx={{ bgcolor: '#33658a', '&:hover': { bgcolor: '#1e4d6b' }, fontWeight: 700 }}>
            {projet ? 'Modifier' : 'Créer le projet'}
          </Button>
        </Box>
      </Box>
    </Paper>
  );
}

export default ProjetForm;
