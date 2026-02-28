import React, { useState } from 'react';
import {
  Box, Typography, Button, IconButton, Card, CardContent,
  Dialog, DialogContent, DialogActions, TextField, Select,
  MenuItem, FormControl, InputLabel, CircularProgress, Chip
} from '@mui/material';
import AddIcon from '@mui/icons-material/Add';
import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/Delete';
import OpenInNewIcon from '@mui/icons-material/OpenInNew';
import { dealerService } from '../services/api';

const CATEGORIES = ['Tissus', 'Mercerie', 'Patrons', 'Autre'];

const CAT_COLORS = {
  'Tissus':   { bg: '#33658a', light: '#e8f0f7' },
  'Mercerie': { bg: '#e36397', light: '#fce8f1' },
  'Patrons':  { bg: '#7b5ea7', light: '#f0eaf8' },
  'Autre':    { bg: '#0cbaba', light: '#e0f7f7' },
};

const defaultForm = { nom: '', url: '', categorie: 'Tissus', description: '' };

function DealerList({ dealers, loading, onRefresh }) {
  const [formOpen, setFormOpen] = useState(false);
  const [editingDealer, setEditingDealer] = useState(null);
  const [formData, setFormData] = useState(defaultForm);
  const [saving, setSaving] = useState(false);

  const handleOpenForm = (dealer = null) => {
    setEditingDealer(dealer);
    setFormData(dealer
      ? { nom: dealer.nom, url: dealer.url, categorie: dealer.categorie, description: dealer.description || '' }
      : defaultForm
    );
    setFormOpen(true);
  };

  const handleSave = async () => {
    if (!formData.nom.trim() || !formData.url.trim()) return;
    setSaving(true);
    try {
      if (editingDealer) {
        await dealerService.update(editingDealer._id, formData);
      } else {
        await dealerService.create(formData);
      }
      setFormOpen(false);
      setEditingDealer(null);
      onRefresh();
    } catch (error) {
      console.error('Erreur sauvegarde dealer:', error);
      alert('Erreur lors de la sauvegarde');
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (dealer) => {
    if (!window.confirm(`Supprimer "${dealer.nom}" ?`)) return;
    try {
      await dealerService.delete(dealer._id);
      onRefresh();
    } catch (error) {
      console.error('Erreur suppression dealer:', error);
    }
  };

  if (loading) return <Box display="flex" justifyContent="center" p={4}><CircularProgress /></Box>;

  const byCategory = CATEGORIES.reduce((acc, cat) => {
    acc[cat] = dealers.filter(d => d.categorie === cat);
    return acc;
  }, {});

  return (
    <Box>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
        <Typography variant="h6">
          {dealers.length} shop{dealers.length > 1 ? 's' : ''}
        </Typography>
        <Button
          variant="contained"
          startIcon={<AddIcon />}
          onClick={() => handleOpenForm(null)}
          sx={{ bgcolor: '#33658a', '&:hover': { bgcolor: '#1e4d6b' } }}
        >
          Ajouter un shop
        </Button>
      </Box>

      {dealers.length === 0 && (
        <Box sx={{ textAlign: 'center', py: 8, color: 'text.secondary' }}>
          <Typography variant="h6">Aucun shop enregistré.</Typography>
          <Typography variant="body2">Cliquez sur "Ajouter un shop" pour commencer.</Typography>
        </Box>
      )}

      {CATEGORIES.map(cat => {
        const list = byCategory[cat];
        if (list.length === 0) return null;
        const colors = CAT_COLORS[cat];
        return (
          <Box key={cat} sx={{ mb: 4 }}>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 2 }}>
              <Chip
                label={cat}
                sx={{ bgcolor: colors.bg, color: 'white', fontWeight: 700, fontSize: '0.9rem', px: 1 }}
              />
              <Typography variant="body2" color="text.secondary">
                {list.length} shop{list.length > 1 ? 's' : ''}
              </Typography>
            </Box>
            <Box sx={{
              display: 'grid',
              gridTemplateColumns: { xs: '1fr', sm: '1fr 1fr', md: '1fr 1fr 1fr' },
              gap: 2
            }}>
              {list.map(dealer => (
                <Card
                  key={dealer._id}
                  sx={{
                    bgcolor: colors.light,
                    border: `2px solid ${colors.bg}30`,
                    borderLeft: `4px solid ${colors.bg}`,
                    '&:hover': { boxShadow: 4 }
                  }}
                >
                  <CardContent sx={{ pb: '12px !important' }}>
                    <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                      <Box sx={{ flexGrow: 1, minWidth: 0 }}>
                        <Typography
                          variant="h6"
                          component="a"
                          href={dealer.url.startsWith('http') ? dealer.url : `https://${dealer.url}`}
                          target="_blank"
                          rel="noopener noreferrer"
                          sx={{
                            fontWeight: 800,
                            fontSize: '1rem',
                            color: colors.bg,
                            textDecoration: 'none',
                            display: 'flex',
                            alignItems: 'center',
                            gap: 0.5,
                            '&:hover': { textDecoration: 'underline' }
                          }}
                        >
                          {dealer.nom}
                          <OpenInNewIcon sx={{ fontSize: '0.9rem', opacity: 0.7 }} />
                        </Typography>
                        <Typography variant="body2" color="text.secondary" sx={{ fontSize: '0.78rem', mt: 0.25, wordBreak: 'break-all' }}>
                          {dealer.url}
                        </Typography>
                        {dealer.description && (
                          <Typography variant="body2" sx={{ mt: 0.75, fontSize: '0.85rem', color: 'text.primary' }}>
                            {dealer.description}
                          </Typography>
                        )}
                      </Box>
                      <Box sx={{ display: 'flex', flexShrink: 0, ml: 1 }}>
                        <IconButton size="small" onClick={() => handleOpenForm(dealer)} sx={{ color: colors.bg }}>
                          <EditIcon fontSize="small" />
                        </IconButton>
                        <IconButton size="small" onClick={() => handleDelete(dealer)} sx={{ color: '#e85d75' }}>
                          <DeleteIcon fontSize="small" />
                        </IconButton>
                      </Box>
                    </Box>
                  </CardContent>
                </Card>
              ))}
            </Box>
          </Box>
        );
      })}

      {/* Dialog formulaire */}
      <Dialog open={formOpen} onClose={() => {}} disableEscapeKeyDown maxWidth="sm" fullWidth>
        <DialogContent>
          <Typography variant="h6" sx={{ fontWeight: 800, color: '#33658a', mb: 2 }}>
            {editingDealer ? '✏️ Modifier le shop' : '🛍️ Ajouter un shop'}
          </Typography>
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
            <TextField
              label="Nom du shop *"
              value={formData.nom}
              onChange={e => setFormData(p => ({ ...p, nom: e.target.value }))}
              fullWidth
              autoFocus
            />
            <TextField
              label="URL *"
              value={formData.url}
              onChange={e => setFormData(p => ({ ...p, url: e.target.value }))}
              fullWidth
              placeholder="https://..."
            />
            <FormControl fullWidth>
              <InputLabel>Catégorie</InputLabel>
              <Select
                value={formData.categorie}
                label="Catégorie"
                onChange={e => setFormData(p => ({ ...p, categorie: e.target.value }))}
              >
                {CATEGORIES.map(cat => (
                  <MenuItem key={cat} value={cat}>{cat}</MenuItem>
                ))}
              </Select>
            </FormControl>
            <TextField
              label="Description (optionnel)"
              value={formData.description}
              onChange={e => setFormData(p => ({ ...p, description: e.target.value }))}
              fullWidth
              multiline
              rows={2}
              placeholder="Spécialité, bon plan, remarques..."
            />
          </Box>
        </DialogContent>
        <DialogActions sx={{ px: 3, pb: 2, gap: 1 }}>
          <Button variant="outlined" onClick={() => setFormOpen(false)}>Annuler</Button>
          <Button
            variant="contained"
            onClick={handleSave}
            disabled={saving || !formData.nom.trim() || !formData.url.trim()}
            sx={{ bgcolor: '#33658a', '&:hover': { bgcolor: '#1e4d6b' } }}
          >
            {editingDealer ? 'Modifier' : 'Ajouter'}
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
}

export default DealerList;
