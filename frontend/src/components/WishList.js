import React, { useState, useEffect, useRef } from 'react';
import {
  Box, Typography, IconButton, CircularProgress, Button,
  Dialog, DialogTitle, DialogContent, DialogActions,
  TextField, Select, MenuItem, FormControl, InputLabel,
  Paper, Chip, Tooltip
} from '@mui/material';
import { Bookmark, Plus, Trash2, ExternalLink, ImagePlus, X, Flame, Star, Moon, Clipboard } from 'lucide-react';
import { wishlistService, ogService, historiqueService } from '../services/api';

const defaultForm = { nom: '', marque: '', type: 'patron', priorite: 'moyenne', lien: '', image: '', notes: '' };

const PRIORITE = {
  haute:   { color: '#c62828', bg: '#fdecea', icon: Flame,  label: 'Haute' },
  moyenne: { color: '#e65100', bg: '#fff8e1', icon: Star,   label: 'Moyenne' },
  basse:   { color: '#2e7d32', bg: '#e8f5e9', icon: Moon,   label: 'Basse' },
};

const TYPE_LABELS = { patron: 'Patron', tissu: 'Tissu', accessoire: 'Accessoire', autre: 'Autre' };

const fieldSx = {
  '& .MuiOutlinedInput-notchedOutline': { borderWidth: 2, borderColor: '#e8e3dd' },
  '&:hover .MuiOutlinedInput-notchedOutline': { borderColor: '#33658a' },
  '&.Mui-focused .MuiOutlinedInput-notchedOutline': { borderColor: '#33658a', borderWidth: 2 },
  '& .MuiInputLabel-root': { fontWeight: 600, color: '#6b6158' },
  '& .MuiInputLabel-root.Mui-focused': { color: '#33658a' },
};

function WishList() {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [addOpen, setAddOpen] = useState(false);
  const [form, setForm] = useState(defaultForm);
  const [saving, setSaving] = useState(false);
  const [dragging, setDragging] = useState(false);
  const [filterType, setFilterType] = useState('');
  const [filterPriorite, setFilterPriorite] = useState('');
  const [deleteTarget, setDeleteTarget] = useState(null);
  const [ogPreview, setOgPreview] = useState(null);
  const [ogLoading, setOgLoading] = useState(false);
  const [ogError, setOgError] = useState(null);
  const ogDebounceRef = useRef(null);

  useEffect(() => { loadItems(); }, []);

  const loadItems = async () => {
    try {
      setLoading(true);
      const res = await wishlistService.getAll();
      setItems(res.data);
    } catch { console.error('Erreur chargement wishlist'); }
    finally { setLoading(false); }
  };

  const loadImageFile = (file) => {
    if (!file || !file.type.startsWith('image/')) return;
    const reader = new FileReader();
    reader.onloadend = () => setForm(f => ({ ...f, image: reader.result }));
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

  const handleLienChange = (value) => {
    setForm(f => ({ ...f, lien: value }));
    setOgPreview(null);
    setOgError(null);
    clearTimeout(ogDebounceRef.current);
    if (!/^https?:\/\/.{4}/.test(value)) return;
    ogDebounceRef.current = setTimeout(async () => {
      setOgLoading(true);
      try {
        const res = await ogService.preview(value);
        setOgPreview(res.data);
        setOgError(null);
      } catch (err) {
        setOgPreview(null);
        const msg = err?.response?.data?.error || 'Aperçu non disponible pour ce lien';
        setOgError(msg);
      } finally {
        setOgLoading(false);
      }
    }, 700);
  };

  const applyOgPreview = () => {
    setForm(f => ({
      ...f,
      nom: f.nom.trim() || ogPreview.title || f.nom,
      image: f.image || ogPreview.image || ogPreview.icon || '',
      notes: f.notes.trim() || ogPreview.description || f.notes,
    }));
    setOgPreview(null);
  };

  useEffect(() => {
    if (!addOpen) {
      setOgPreview(null);
      setOgError(null);
      setOgLoading(false);
      clearTimeout(ogDebounceRef.current);
    }
  }, [addOpen]);

  useEffect(() => {
    if (!addOpen) return;
    const handlePaste = (e) => {
      const items = e.clipboardData?.items;
      if (!items) return;
      for (const item of items) {
        if (item.type.startsWith('image/')) { loadImageFile(item.getAsFile()); return; }
      }
    };
    window.addEventListener('paste', handlePaste);
    return () => window.removeEventListener('paste', handlePaste);
  }, [addOpen]);

  const handleAddSubmit = async () => {
    if (!form.nom.trim()) return;
    setSaving(true);
    try {
      await wishlistService.create(form);
      setAddOpen(false);
      setForm(defaultForm);
      loadItems();
    } catch { console.error('Erreur ajout'); }
    finally { setSaving(false); }
  };

  const handleDelete = async () => {
    if (!deleteTarget) return;
    try {
      await wishlistService.delete(deleteTarget._id);
      setDeleteTarget(null);
      loadItems();
    } catch { console.error('Erreur suppression'); }
  };

  const displayed = items
    .filter(item => !filterType || item.type === filterType)
    .filter(item => !filterPriorite || item.priorite === filterPriorite);

  if (loading) return <Box display="flex" justifyContent="center" p={4}><CircularProgress /></Box>;

  return (
    <Box>
      {/* Header */}
      <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 3, flexWrap: 'wrap', gap: 1 }}>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
          <Typography variant="h4" sx={{ fontWeight: 900 }}>Wish List</Typography>
          {items.length > 0 && (
            <Typography variant="body2" color="text.secondary" sx={{ fontWeight: 600 }}>
              {items.length} item{items.length > 1 ? 's' : ''}
            </Typography>
          )}
        </Box>
        <Box sx={{ display: 'flex', gap: 1, alignItems: 'center', flexWrap: 'wrap' }}>
          <FormControl size="small" sx={{ minWidth: 110, ...fieldSx }}>
            <InputLabel>Type</InputLabel>
            <Select value={filterType} label="Type" onChange={e => setFilterType(e.target.value)}>
              <MenuItem value=""><em>Tous</em></MenuItem>
              {Object.entries(TYPE_LABELS).map(([k, v]) => <MenuItem key={k} value={k}>{v}</MenuItem>)}
            </Select>
          </FormControl>
          <FormControl size="small" sx={{ minWidth: 120, ...fieldSx }}>
            <InputLabel>Priorité</InputLabel>
            <Select value={filterPriorite} label="Priorité" onChange={e => setFilterPriorite(e.target.value)}>
              <MenuItem value=""><em>Toutes</em></MenuItem>
              <MenuItem value="haute">Haute</MenuItem>
              <MenuItem value="moyenne">Moyenne</MenuItem>
              <MenuItem value="basse">Basse</MenuItem>
            </Select>
          </FormControl>
          <Button variant="contained" startIcon={<Plus size={18} />} onClick={() => setAddOpen(true)}
            sx={{ bgcolor: '#33658a', '&:hover': { bgcolor: '#1e4d6b' }, fontWeight: 700, borderRadius: 2 }}>
            Ajouter
          </Button>
        </Box>
      </Box>

      {/* Contenu */}
      {items.length === 0 ? (
        <Box sx={{ border: '2px dashed rgba(26,19,10,0.1)', borderRadius: 4, p: 8, textAlign: 'center', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 2.5 }}>
          <Bookmark size={60} strokeWidth={1} color="#ddd" />
          <Box>
            <Typography variant="h6" sx={{ fontWeight: 800, mb: 0.5 }}>Votre wish list est vide</Typography>
            <Typography variant="body2" color="text.secondary">
              Ajoutez les patrons, tissus ou accessoires qui vous font envie.
            </Typography>
          </Box>
          <Button variant="contained" startIcon={<Plus size={18} />} onClick={() => setAddOpen(true)}
            sx={{ bgcolor: '#33658a', '&:hover': { bgcolor: '#1e4d6b' }, fontWeight: 700, borderRadius: 2 }}>
            Ajouter un item
          </Button>
        </Box>
      ) : displayed.length === 0 ? (
        <Box sx={{ textAlign: 'center', py: 6, color: 'text.secondary' }}>
          <Typography variant="body1" sx={{ fontWeight: 600 }}>Aucun résultat pour ces filtres.</Typography>
        </Box>
      ) : (
        <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', sm: '1fr 1fr', md: '1fr 1fr 1fr', lg: '1fr 1fr 1fr 1fr' }, gap: 2 }}>
          {displayed.map(item => {
            const prio = PRIORITE[item.priorite] || PRIORITE.moyenne;
            const PrioIcon = prio.icon;
            return (
              <Paper key={item._id} elevation={0} onClick={() => historiqueService.track({ id: item._id, type: 'wishlist', nom: item.nom, image: item.image || null }).catch(() => {})} sx={{
                border: '1.5px solid rgba(26,19,10,0.07)',
                borderTop: `3px solid ${prio.color}`,
                borderRadius: 3,
                overflow: 'hidden',
                display: 'flex', flexDirection: 'column',
                transition: 'all 0.15s',
                cursor: 'default',
                '&:hover': { boxShadow: '0 4px 16px rgba(26,19,10,0.1)', transform: 'translateY(-2px)' },
              }}>
                {item.image && (
                  <Box sx={{ height: 150, overflow: 'hidden' }}>
                    <Box component="img" src={item.image} alt={item.nom}
                      sx={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                  </Box>
                )}

                {/* Header */}
                <Box sx={{ px: 2, py: 1.5, bgcolor: 'rgba(0,0,0,0.015)', borderBottom: '1px solid rgba(26,19,10,0.05)', display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                  <Box sx={{ flex: 1, minWidth: 0 }}>
                    <Typography sx={{ fontWeight: 800, fontSize: '0.92rem', lineHeight: 1.2 }}>{item.nom}</Typography>
                    {item.marque && <Typography variant="body2" color="text.secondary" sx={{ fontSize: '0.78rem' }}>{item.marque}</Typography>}
                  </Box>
                  <Tooltip title="Supprimer">
                    <IconButton size="small" onClick={() => setDeleteTarget(item)} sx={{ color: '#e85d75', ml: 0.5, mt: -0.25 }}>
                      <Trash2 size={14} strokeWidth={2} />
                    </IconButton>
                  </Tooltip>
                </Box>

                {/* Body */}
                <Box sx={{ px: 2, py: 1.25, flex: 1 }}>
                  <Box sx={{ display: 'flex', gap: 0.5, flexWrap: 'wrap', mb: 0.75 }}>
                    <Chip
                      icon={<PrioIcon size={11} color={prio.color} style={{ marginLeft: 6 }} />}
                      label={prio.label}
                      size="small"
                      sx={{ bgcolor: prio.bg, color: prio.color, fontWeight: 700, fontSize: '0.7rem', height: 20 }}
                    />
                    <Chip label={TYPE_LABELS[item.type] || item.type} size="small"
                      sx={{ bgcolor: '#e3eef7', color: '#33658a', fontWeight: 700, fontSize: '0.7rem', height: 20 }} />
                  </Box>
                  {item.notes && (
                    <Typography variant="body2" color="text.secondary" sx={{ fontSize: '0.78rem', fontStyle: 'italic' }}>
                      {item.notes}
                    </Typography>
                  )}
                  {item.lien && (
                    <Button size="small" href={item.lien} target="_blank" rel="noopener noreferrer"
                      endIcon={<ExternalLink size={11} />}
                      sx={{ fontSize: '0.75rem', p: 0, minWidth: 0, textTransform: 'none', color: '#33658a', mt: 0.5 }}>
                      Voir le lien
                    </Button>
                  )}
                </Box>
              </Paper>
            );
          })}
        </Box>
      )}

      {/* Dialog ajout */}
      <Dialog open={addOpen} onClose={() => { setAddOpen(false); setForm(defaultForm); }} maxWidth="sm" fullWidth
        PaperProps={{ sx: { borderRadius: 3, p: 1 } }}>
        <DialogTitle sx={{ fontWeight: 800, pb: 0, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          Ajouter à la wish list
          <IconButton size="small" onClick={() => { setAddOpen(false); setForm(defaultForm); }}><X size={18} /></IconButton>
        </DialogTitle>
        <DialogContent sx={{ display: 'flex', flexDirection: 'column', gap: 2.5, pt: 2 }}>
          {form.image ? (
            <Box sx={{ position: 'relative' }}>
              <Box component="img" src={form.image} alt="Aperçu"
                sx={{ width: '100%', maxHeight: 180, objectFit: 'cover', borderRadius: 2 }} />
              <IconButton size="small" onClick={() => setForm(f => ({ ...f, image: '' }))}
                sx={{ position: 'absolute', top: 4, right: 4, bgcolor: 'white', boxShadow: 1 }}>
                <Trash2 size={14} strokeWidth={2} />
              </IconButton>
            </Box>
          ) : (
            <Box
              onDragOver={e => { e.preventDefault(); setDragging(true); }}
              onDragLeave={() => setDragging(false)}
              onDrop={e => { e.preventDefault(); setDragging(false); loadImageFile(e.dataTransfer.files[0]); }}
              onClick={() => document.getElementById('wishlist-file-input').click()}
              sx={{
                border: `2px dashed ${dragging ? '#33658a' : '#e8e3dd'}`,
                borderRadius: 2, p: 2.5, textAlign: 'center', cursor: 'pointer',
                bgcolor: dragging ? '#e3eef7' : 'transparent',
                transition: 'all 0.15s',
                '&:hover': { borderColor: '#33658a', bgcolor: '#f0f6fa' }
              }}
            >
              <ImagePlus size={28} color="#33658a" style={{ marginBottom: 6 }} />
              <Typography variant="body2" color="text.secondary" sx={{ fontSize: '0.82rem' }}>
                Photo (optionnel) — glisser ou cliquer
              </Typography>
              <Button size="small" variant="outlined" startIcon={<Clipboard size={14} />}
                onClick={e => { e.stopPropagation(); handlePasteImage(); }}
                sx={{ mt: 1, borderColor: '#33658a', color: '#33658a', fontWeight: 600, borderWidth: 2 }}>
                Coller une image
              </Button>
              <input id="wishlist-file-input" type="file" accept="image/*" style={{ display: 'none' }}
                onChange={e => loadImageFile(e.target.files[0])} />
            </Box>
          )}

          <TextField label="Nom *" value={form.nom} onChange={e => setForm(f => ({ ...f, nom: e.target.value }))} fullWidth size="small" sx={fieldSx} />
          <TextField label="Marque / créateur (optionnel)" value={form.marque} onChange={e => setForm(f => ({ ...f, marque: e.target.value }))} fullWidth size="small" sx={fieldSx} />
          <Box sx={{ display: 'flex', gap: 2 }}>
            <FormControl fullWidth size="small" sx={fieldSx}>
              <InputLabel>Type</InputLabel>
              <Select value={form.type} label="Type" onChange={e => setForm(f => ({ ...f, type: e.target.value }))}>
                {Object.entries(TYPE_LABELS).map(([k, v]) => <MenuItem key={k} value={k}>{v}</MenuItem>)}
              </Select>
            </FormControl>
            <FormControl fullWidth size="small" sx={fieldSx}>
              <InputLabel>Priorité</InputLabel>
              <Select value={form.priorite} label="Priorité" onChange={e => setForm(f => ({ ...f, priorite: e.target.value }))}>
                <MenuItem value="haute">Haute</MenuItem>
                <MenuItem value="moyenne">Moyenne</MenuItem>
                <MenuItem value="basse">Basse</MenuItem>
              </Select>
            </FormControl>
          </Box>
          <Box>
            <TextField label="Lien (optionnel)" value={form.lien} onChange={e => handleLienChange(e.target.value)}
              fullWidth size="small" placeholder="https://..." sx={fieldSx}
              InputProps={{ endAdornment: ogLoading ? <CircularProgress size={14} sx={{ mr: 1, color: '#33658a' }} /> : null }} />
            {ogError && !ogPreview && (
              <Typography variant="body2" sx={{ mt: 0.75, fontSize: '0.75rem', color: 'text.disabled', fontStyle: 'italic' }}>
                {ogError}
              </Typography>
            )}
            {ogPreview && (
              <Box sx={{ mt: 1, border: '1.5px solid rgba(51,101,138,0.2)', borderRadius: 2, overflow: 'hidden', bgcolor: 'rgba(51,101,138,0.03)' }}>
                {ogPreview.image && (
                  <Box component="img" src={ogPreview.image} alt=""
                    sx={{ width: '100%', maxHeight: 140, objectFit: 'cover', display: 'block' }} />
                )}
                <Box sx={{ px: 1.5, py: 1 }}>
                  {ogPreview.title && (
                    <Typography sx={{ fontWeight: 700, fontSize: '0.88rem', lineHeight: 1.3, mb: 0.25 }}>
                      {ogPreview.title}
                    </Typography>
                  )}
                  {ogPreview.description && (
                    <Typography variant="body2" color="text.secondary" sx={{ fontSize: '0.78rem',
                      display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', overflow: 'hidden' }}>
                      {ogPreview.description}
                    </Typography>
                  )}
                  <Box sx={{ display: 'flex', gap: 1, mt: 1 }}>
                    <Button size="small" variant="contained" onClick={applyOgPreview}
                      sx={{ bgcolor: '#33658a', '&:hover': { bgcolor: '#1e4d6b' }, fontWeight: 700, fontSize: '0.75rem', py: 0.25 }}>
                      Utiliser ces infos
                    </Button>
                    <Button size="small" onClick={() => setOgPreview(null)}
                      sx={{ color: 'text.secondary', fontSize: '0.75rem', py: 0.25 }}>
                      Ignorer
                    </Button>
                  </Box>
                </Box>
              </Box>
            )}
          </Box>
          <TextField label="Notes" value={form.notes} onChange={e => setForm(f => ({ ...f, notes: e.target.value }))} fullWidth multiline rows={2} size="small" sx={fieldSx} />
        </DialogContent>
        <DialogActions sx={{ px: 3, pb: 2, gap: 1 }}>
          <Button onClick={() => { setAddOpen(false); setForm(defaultForm); }} sx={{ color: 'text.secondary' }}>Annuler</Button>
          <Button onClick={handleAddSubmit} variant="contained" disabled={saving || !form.nom.trim()}
            sx={{ bgcolor: '#33658a', '&:hover': { bgcolor: '#1e4d6b' }, fontWeight: 700 }}>
            {saving ? <CircularProgress size={20} color="inherit" /> : 'Ajouter'}
          </Button>
        </DialogActions>
      </Dialog>

      {/* Dialog confirmation suppression */}
      <Dialog open={!!deleteTarget} onClose={() => setDeleteTarget(null)} PaperProps={{ sx: { borderRadius: 3 } }}>
        <DialogTitle sx={{ fontWeight: 800 }}>Supprimer cet item ?</DialogTitle>
        <DialogContent>
          <Typography><strong>{deleteTarget?.nom}</strong> sera retiré de votre wish list.</Typography>
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

export default WishList;
