import React, { useState } from 'react';
import {
  Box, Typography, Button, IconButton, Paper,
  Dialog, DialogTitle, DialogContent, DialogActions,
  TextField, CircularProgress, Chip, FormControlLabel, Checkbox, Tooltip
} from '@mui/material';
import { Store, Plus, Pencil, Trash2, ExternalLink, CheckCircle } from 'lucide-react';
import { dealerService } from '../services/api';

const CATEGORIES = ['Tissus', 'Mercerie', 'Patrons', 'Autre'];

const CAT_COLORS = {
  'Tissus':   { bg: '#33658a', light: '#e3f0f8' },
  'Mercerie': { bg: '#e36397', light: '#fce4ec' },
  'Patrons':  { bg: '#7b5ea7', light: '#ede7f6' },
  'Autre':    { bg: '#0cbaba', light: '#e0f7f7' },
};

const defaultForm = { nom: '', url: '', categories: [], dejaCliente: false, description: '' };

const fieldSx = {
  '& .MuiOutlinedInput-notchedOutline': { borderWidth: 2, borderColor: '#e8e3dd' },
  '&:hover .MuiOutlinedInput-notchedOutline': { borderColor: '#7b5ea7' },
  '&.Mui-focused .MuiOutlinedInput-notchedOutline': { borderColor: '#7b5ea7', borderWidth: 2 },
  '& .MuiInputLabel-root': { fontWeight: 600, color: '#6b6158' },
  '& .MuiInputLabel-root.Mui-focused': { color: '#7b5ea7' },
};

function DealerList({ dealers, loading, onRefresh }) {
  const [formOpen, setFormOpen] = useState(false);
  const [editingDealer, setEditingDealer] = useState(null);
  const [formData, setFormData] = useState(defaultForm);
  const [saving, setSaving] = useState(false);
  const [filterCat, setFilterCat] = useState('');
  const [deleteTarget, setDeleteTarget] = useState(null);

  const handleOpenForm = (dealer = null) => {
    setEditingDealer(dealer);
    setFormData(dealer ? {
      nom: dealer.nom,
      url: dealer.url,
      categories: dealer.categories || (dealer.categorie ? [dealer.categorie] : []),
      dejaCliente: dealer.dejaCliente || false,
      description: dealer.description || ''
    } : defaultForm);
    setFormOpen(true);
  };

  const toggleCategory = (cat) => {
    setFormData(p => ({
      ...p,
      categories: p.categories.includes(cat)
        ? p.categories.filter(c => c !== cat)
        : [...p.categories, cat]
    }));
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
    } catch { console.error('Erreur sauvegarde dealer'); }
    finally { setSaving(false); }
  };

  const handleDelete = async () => {
    if (!deleteTarget) return;
    try {
      await dealerService.delete(deleteTarget._id);
      setDeleteTarget(null);
      onRefresh();
    } catch { console.error('Erreur suppression dealer'); }
  };

  if (loading) return <Box display="flex" justifyContent="center" p={4}><CircularProgress /></Box>;

  const getDealerCategories = (d) => d.categories?.length ? d.categories : (d.categorie ? [d.categorie] : []);
  const displayed = filterCat ? dealers.filter(d => getDealerCategories(d).includes(filterCat)) : dealers;

  return (
    <Box>
      {/* Header */}
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3, flexWrap: 'wrap', gap: 1 }}>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
          <Store size={28} strokeWidth={2} color="#7b5ea7" />
          <Typography variant="h4" sx={{ fontWeight: 900 }}>Les Dealers</Typography>
        </Box>
        <Button variant="contained" startIcon={<Plus size={18} />} onClick={() => handleOpenForm(null)}
          sx={{ bgcolor: '#7b5ea7', '&:hover': { bgcolor: '#5c4380' }, fontWeight: 700, borderRadius: 2 }}>
          Ajouter un shop
        </Button>
      </Box>

      {/* Filtres */}
      <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap', mb: 3 }}>
        <Chip label={`Tous (${dealers.length})`} onClick={() => setFilterCat('')}
          sx={{ fontWeight: 700, bgcolor: !filterCat ? '#7b5ea7' : 'transparent', color: !filterCat ? 'white' : 'text.secondary', border: '1.5px solid #7b5ea730', cursor: 'pointer' }} />
        {CATEGORIES.map(cat => {
          const colors = CAT_COLORS[cat];
          const active = filterCat === cat;
          const count = dealers.filter(d => getDealerCategories(d).includes(cat)).length;
          return (
            <Chip key={cat} label={`${cat} (${count})`} onClick={() => setFilterCat(active ? '' : cat)}
              sx={{ fontWeight: 700, cursor: 'pointer', bgcolor: active ? colors.bg : 'transparent', color: active ? 'white' : colors.bg, border: `1.5px solid ${colors.bg}44` }} />
          );
        })}
      </Box>

      {/* Grille */}
      {dealers.length === 0 ? (
        <Box sx={{ border: '2px dashed rgba(26,19,10,0.1)', borderRadius: 4, p: 8, textAlign: 'center', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 2.5 }}>
          <Store size={60} strokeWidth={1} color="#ddd" />
          <Box>
            <Typography variant="h6" sx={{ fontWeight: 800, mb: 0.5 }}>Aucun shop enregistré</Typography>
            <Typography variant="body2" color="text.secondary">Ajoutez vos boutiques préférées pour les retrouver facilement.</Typography>
          </Box>
          <Button variant="contained" startIcon={<Plus size={18} />} onClick={() => handleOpenForm(null)}
            sx={{ bgcolor: '#7b5ea7', '&:hover': { bgcolor: '#5c4380' }, fontWeight: 700, borderRadius: 2 }}>
            Ajouter un shop
          </Button>
        </Box>
      ) : (
        <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', sm: '1fr 1fr', md: '1fr 1fr 1fr' }, gap: 2 }}>
          {displayed.map(dealer => {
            const cats = getDealerCategories(dealer);
            const primaryCat = cats[0] || 'Autre';
            const colors = CAT_COLORS[primaryCat] || CAT_COLORS['Autre'];
            return (
              <Paper key={dealer._id} elevation={0} sx={{
                border: `1.5px solid rgba(26,19,10,0.07)`,
                borderLeft: `4px solid ${colors.bg}`,
                borderRadius: 3,
                overflow: 'hidden',
                transition: 'all 0.15s',
                '&:hover': { boxShadow: `0 4px 16px ${colors.bg}22` },
              }}>
                {/* Header */}
                <Box sx={{ px: 2, py: 1.75, bgcolor: `${colors.bg}08`, borderBottom: '1px solid rgba(26,19,10,0.05)', display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                  <Box sx={{ flex: 1, minWidth: 0 }}>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.75, mb: 0.25 }}>
                      <Typography component="a"
                        href={dealer.url.startsWith('http') ? dealer.url : `https://${dealer.url}`}
                        target="_blank" rel="noopener noreferrer"
                        sx={{ fontWeight: 800, fontSize: '0.95rem', color: colors.bg, textDecoration: 'none', display: 'flex', alignItems: 'center', gap: 0.5, '&:hover': { textDecoration: 'underline' } }}>
                        {dealer.nom}
                        <ExternalLink size={12} strokeWidth={2.5} />
                      </Typography>
                      {dealer.dejaCliente && (
                        <Tooltip title="Déjà cliente">
                          <CheckCircle size={14} color="#2e7d32" strokeWidth={2.5} />
                        </Tooltip>
                      )}
                    </Box>
                    <Typography variant="body2" color="text.secondary" sx={{ fontSize: '0.72rem', wordBreak: 'break-all' }}>
                      {dealer.url}
                    </Typography>
                  </Box>
                  <Box sx={{ display: 'flex', flexShrink: 0, ml: 1 }}>
                    <Tooltip title="Modifier">
                      <IconButton size="small" onClick={() => handleOpenForm(dealer)} sx={{ color: 'text.secondary' }}>
                        <Pencil size={14} strokeWidth={2} />
                      </IconButton>
                    </Tooltip>
                    <Tooltip title="Supprimer">
                      <IconButton size="small" onClick={() => setDeleteTarget(dealer)} sx={{ color: '#e85d75' }}>
                        <Trash2 size={14} strokeWidth={2} />
                      </IconButton>
                    </Tooltip>
                  </Box>
                </Box>

                {/* Body */}
                <Box sx={{ px: 2, py: 1.25 }}>
                  <Box sx={{ display: 'flex', gap: 0.5, flexWrap: 'wrap', mb: dealer.description ? 0.75 : 0 }}>
                    {cats.map(cat => (
                      <Chip key={cat} label={cat} size="small"
                        sx={{ bgcolor: CAT_COLORS[cat]?.bg || '#0cbaba', color: 'white', fontWeight: 700, fontSize: '0.68rem', height: 18 }} />
                    ))}
                  </Box>
                  {dealer.description && (
                    <Typography variant="body2" sx={{ fontSize: '0.82rem', color: 'text.secondary', mt: 0.5 }}>
                      {dealer.description}
                    </Typography>
                  )}
                </Box>
              </Paper>
            );
          })}
        </Box>
      )}

      {/* Dialog formulaire */}
      <Dialog open={formOpen} onClose={() => setFormOpen(false)} maxWidth="sm" fullWidth
        PaperProps={{ sx: { borderRadius: 3, p: 1 } }}>
        <DialogTitle sx={{ fontWeight: 800, pb: 0 }}>
          {editingDealer ? 'Modifier le shop' : 'Ajouter un shop'}
        </DialogTitle>
        <DialogContent>
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2.5, pt: 2 }}>
            <TextField label="Nom du shop *" value={formData.nom}
              onChange={e => setFormData(p => ({ ...p, nom: e.target.value }))}
              fullWidth autoFocus sx={fieldSx} />
            <TextField label="URL *" value={formData.url}
              onChange={e => setFormData(p => ({ ...p, url: e.target.value }))}
              fullWidth placeholder="https://..." sx={fieldSx} />
            <Box>
              <Typography sx={{ fontWeight: 700, fontSize: '0.78rem', textTransform: 'uppercase', letterSpacing: '0.05em', color: '#7b5ea7', mb: 1 }}>
                Catégories
              </Typography>
              <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap' }}>
                {CATEGORIES.map(cat => {
                  const selected = formData.categories.includes(cat);
                  const colors = CAT_COLORS[cat];
                  return (
                    <Chip key={cat} label={cat} onClick={() => toggleCategory(cat)}
                      sx={{ fontWeight: 700, cursor: 'pointer', bgcolor: selected ? colors.bg : 'transparent', color: selected ? 'white' : colors.bg, border: `2px solid ${colors.bg}`, '&:hover': { bgcolor: selected ? colors.bg : colors.light } }} />
                  );
                })}
              </Box>
            </Box>
            <FormControlLabel
              control={<Checkbox checked={formData.dejaCliente}
                onChange={e => setFormData(p => ({ ...p, dejaCliente: e.target.checked }))}
                sx={{ color: '#2e7d32', '&.Mui-checked': { color: '#2e7d32' } }} />}
              label={<Typography sx={{ fontWeight: 600 }}>Déjà cliente</Typography>}
            />
            <TextField label="Description (optionnel)" value={formData.description}
              onChange={e => setFormData(p => ({ ...p, description: e.target.value }))}
              fullWidth multiline rows={2} placeholder="Spécialité, bon plan, remarques..." sx={fieldSx} />
          </Box>
        </DialogContent>
        <DialogActions sx={{ px: 3, pb: 2, gap: 1 }}>
          <Button onClick={() => setFormOpen(false)} sx={{ color: 'text.secondary' }}>Annuler</Button>
          <Button variant="contained" onClick={handleSave} disabled={saving || !formData.nom.trim() || !formData.url.trim()}
            sx={{ bgcolor: '#7b5ea7', '&:hover': { bgcolor: '#5c4380' }, fontWeight: 700 }}>
            {editingDealer ? 'Modifier' : 'Ajouter'}
          </Button>
        </DialogActions>
      </Dialog>

      {/* Dialog confirmation suppression */}
      <Dialog open={!!deleteTarget} onClose={() => setDeleteTarget(null)} PaperProps={{ sx: { borderRadius: 3 } }}>
        <DialogTitle sx={{ fontWeight: 800 }}>Supprimer ce shop ?</DialogTitle>
        <DialogContent>
          <Typography>Le shop <strong>{deleteTarget?.nom}</strong> sera définitivement supprimé.</Typography>
        </DialogContent>
        <DialogActions sx={{ px: 3, pb: 2 }}>
          <Button onClick={() => setDeleteTarget(null)}>Annuler</Button>
          <Button onClick={handleDelete} variant="contained" sx={{ bgcolor: '#e85d75', '&:hover': { bgcolor: '#c44060' }, fontWeight: 700 }}>
            Supprimer
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
}

export default DealerList;
