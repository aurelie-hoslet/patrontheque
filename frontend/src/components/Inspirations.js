import React, { useState, useEffect } from 'react';
import {
  Box, Typography, IconButton, CircularProgress, Button,
  Dialog, DialogTitle, DialogContent, DialogActions, TextField, Chip
} from '@mui/material';
import { Sparkles, Plus, Trash2, ImagePlus, Clipboard, X } from 'lucide-react';
import { inspirationService, historiqueService } from '../services/api';

const defaultForm = { titre: '', image: '', source: '', notes: '', tags: '' };

const POSITIONS = [
  ['left top',    'center top',    'right top'],
  ['left center', 'center',        'right center'],
  ['left bottom', 'center bottom', 'right bottom'],
];

const fieldSx = {
  '& .MuiOutlinedInput-notchedOutline': { borderWidth: 2, borderColor: '#e8e3dd' },
  '&:hover .MuiOutlinedInput-notchedOutline': { borderColor: '#e36397' },
  '&.Mui-focused .MuiOutlinedInput-notchedOutline': { borderColor: '#e36397', borderWidth: 2 },
  '& .MuiInputLabel-root': { fontWeight: 600, color: '#6b6158' },
  '& .MuiInputLabel-root.Mui-focused': { color: '#e36397' },
};

function Inspirations() {
  const [inspirations, setInspirations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [detail, setDetail] = useState(null);
  const [hoveredId, setHoveredId] = useState(null);
  const [addOpen, setAddOpen] = useState(false);
  const [form, setForm] = useState(defaultForm);
  const [saving, setSaving] = useState(false);
  const [dragging, setDragging] = useState(false);
  const [deleteTarget, setDeleteTarget] = useState(null);

  useEffect(() => { loadInspirations(); }, []);

  useEffect(() => {
    if (detail?._id) {
      historiqueService.track({
        id: detail._id,
        type: 'inspiration',
        nom: detail.titre || 'Inspiration',
        image: detail.image || null,
      }).catch(() => {});
    }
  }, [detail?._id]);

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

  const handleCollerPressepapier = async () => {
    try {
      const items = await navigator.clipboard.read();
      for (const item of items) {
        const imageType = item.types.find(t => t.startsWith('image/'));
        if (imageType) { loadImageFile(await item.getType(imageType)); break; }
      }
    } catch { console.error('Impossible de lire le presse-papiers'); }
  };

  const loadInspirations = async () => {
    try {
      setLoading(true);
      const res = await inspirationService.getAll();
      setInspirations(res.data);
    } catch { console.error('Erreur chargement inspirations'); }
    finally { setLoading(false); }
  };

  const loadImageFile = (file) => {
    if (!file || !file.type.startsWith('image/')) return;
    const reader = new FileReader();
    reader.onloadend = () => setForm(f => ({ ...f, image: reader.result }));
    reader.readAsDataURL(file);
  };

  const handleAddSubmit = async () => {
    setSaving(true);
    try {
      const tags = form.tags ? form.tags.split(',').map(t => t.trim()).filter(Boolean) : [];
      await inspirationService.create({ ...form, tags });
      setAddOpen(false);
      setForm(defaultForm);
      loadInspirations();
    } catch { console.error('Erreur ajout'); }
    finally { setSaving(false); }
  };

  const handleDelete = async () => {
    if (!deleteTarget) return;
    try {
      await inspirationService.delete(deleteTarget._id);
      setDeleteTarget(null);
      setDetail(null);
      loadInspirations();
    } catch { console.error('Erreur suppression'); }
  };

  const handleSetPosition = async (id, pos) => {
    try {
      await inspirationService.setImagePosition(id, pos);
      loadInspirations();
    } catch { console.error('Erreur position'); }
  };

  if (loading) return <Box display="flex" justifyContent="center" p={4}><CircularProgress /></Box>;

  return (
    <Box>
      {/* Header */}
      <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 3 }}>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
          <Typography variant="h4" sx={{ fontWeight: 900 }}>Inspirations</Typography>
          {inspirations.length > 0 && (
            <Typography variant="body2" color="text.secondary" sx={{ fontWeight: 600 }}>
              {inspirations.length} photo{inspirations.length > 1 ? 's' : ''}
            </Typography>
          )}
        </Box>
        <Button variant="contained" startIcon={<Plus size={18} />} onClick={() => setAddOpen(true)}
          sx={{ bgcolor: '#e36397', '&:hover': { bgcolor: '#c9547f' }, fontWeight: 700, borderRadius: 2 }}>
          Ajouter
        </Button>
      </Box>

      {/* Contenu */}
      {inspirations.length === 0 ? (
        <Box sx={{ border: '2px dashed rgba(26,19,10,0.1)', borderRadius: 4, p: 8, textAlign: 'center', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 2.5 }}>
          <Sparkles size={60} strokeWidth={1} color="#ddd" />
          <Box>
            <Typography variant="h6" sx={{ fontWeight: 800, mb: 0.5 }}>Aucune inspiration pour l'instant</Typography>
            <Typography variant="body2" color="text.secondary">
              Ajoutez des photos, captures d'écran ou images qui vous inspirent.
            </Typography>
          </Box>
          <Button variant="contained" startIcon={<Plus size={18} />} onClick={() => setAddOpen(true)}
            sx={{ bgcolor: '#e36397', '&:hover': { bgcolor: '#c9547f' }, fontWeight: 700, borderRadius: 2 }}>
            Ajouter une inspiration
          </Button>
        </Box>
      ) : (
        <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr 1fr', sm: '1fr 1fr 1fr', md: '1fr 1fr 1fr 1fr' }, gap: 0 }}>
          {inspirations.map(item => {
            const position = item.imagePosition || 'center';
            const isHovered = hoveredId === item._id;
            return (
              <Box key={item._id} onMouseEnter={() => setHoveredId(item._id)} onMouseLeave={() => setHoveredId(null)}
                sx={{ position: 'relative', aspectRatio: '1/1', overflow: 'hidden', bgcolor: 'grey.100' }}>
                {item.image ? (
                  <Box component="img" src={item.image} alt={item.titre || 'Inspiration'}
                    onClick={() => setDetail(item)}
                    sx={{ width: '100%', height: '100%', objectFit: 'cover', objectPosition: position, display: 'block', cursor: 'pointer', transition: 'transform 0.2s', ...(isHovered && { transform: 'scale(1.03)' }) }} />
                ) : (
                  <Box onClick={() => setDetail(item)}
                    sx={{ width: '100%', height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer' }}>
                    <Typography variant="body2" color="text.disabled" sx={{ fontSize: '0.75rem', textAlign: 'center', px: 1 }}>
                      {item.titre || 'Inspiration'}
                    </Typography>
                  </Box>
                )}

                {isHovered && item.image && (
                  <Box sx={{ position: 'absolute', bottom: 4, right: 4, bgcolor: 'rgba(0,0,0,0.55)', borderRadius: 1, p: '5px', display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '3px' }}>
                    {POSITIONS.map((row, ri) => row.map((pos, ci) => (
                      <Box key={`${ri}-${ci}`} onClick={e => { e.stopPropagation(); handleSetPosition(item._id, pos); }}
                        sx={{ width: 10, height: 10, borderRadius: '50%', bgcolor: position === pos ? 'white' : 'rgba(255,255,255,0.35)', cursor: 'pointer', '&:hover': { bgcolor: 'white' } }} />
                    )))}
                  </Box>
                )}

                {item.titre && isHovered && (
                  <Box sx={{ position: 'absolute', bottom: 0, left: 0, right: 0, bgcolor: 'rgba(0,0,0,0.45)', px: 1, py: 0.5, pointerEvents: 'none' }}>
                    <Typography sx={{ color: 'white', fontSize: '0.72rem', fontWeight: 700 }}>{item.titre}</Typography>
                  </Box>
                )}
              </Box>
            );
          })}
        </Box>
      )}

      {/* Dialog ajout */}
      <Dialog open={addOpen} onClose={() => { setAddOpen(false); setForm(defaultForm); }} maxWidth="sm" fullWidth
        PaperProps={{ sx: { borderRadius: 3, p: 1 } }}>
        <DialogTitle sx={{ fontWeight: 800, pb: 0, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          Ajouter une inspiration
          <IconButton size="small" onClick={() => { setAddOpen(false); setForm(defaultForm); }}><X size={18} /></IconButton>
        </DialogTitle>
        <DialogContent sx={{ display: 'flex', flexDirection: 'column', gap: 2.5, pt: 2 }}>
          {form.image ? (
            <Box sx={{ position: 'relative' }}>
              <Box component="img" src={form.image} alt="Aperçu"
                sx={{ width: '100%', maxHeight: 220, objectFit: 'cover', borderRadius: 2 }} />
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
              onClick={() => document.getElementById('inspiration-file-input').click()}
              sx={{ border: `2px dashed ${dragging ? '#e36397' : '#e8e3dd'}`, borderRadius: 2, p: 3, textAlign: 'center', cursor: 'pointer', bgcolor: dragging ? '#fce4ec' : 'transparent', transition: 'all 0.15s', '&:hover': { borderColor: '#e36397', bgcolor: '#fef5f8' } }}
            >
              <ImagePlus size={36} color="#e36397" style={{ marginBottom: 8 }} />
              <Typography variant="body2" color="text.secondary" sx={{ mb: 1.5 }}>
                Glisser-déposer une photo ici<br />ou cliquer pour ouvrir un dossier
              </Typography>
              <Button size="small" variant="outlined" startIcon={<Clipboard size={14} />}
                onClick={e => { e.stopPropagation(); handleCollerPressepapier(); }}
                sx={{ borderColor: '#e36397', color: '#e36397', fontWeight: 600, borderWidth: 2 }}>
                Coller une image
              </Button>
              <input id="inspiration-file-input" type="file" accept="image/*" style={{ display: 'none' }}
                onChange={e => loadImageFile(e.target.files[0])} />
            </Box>
          )}
          <TextField label="Titre (optionnel)" value={form.titre} onChange={e => setForm(f => ({ ...f, titre: e.target.value }))} fullWidth size="small" sx={fieldSx} />
          <TextField label="Source / lien (optionnel)" value={form.source} onChange={e => setForm(f => ({ ...f, source: e.target.value }))} fullWidth size="small" sx={fieldSx} />
          <TextField label="Tags (séparés par des virgules)" value={form.tags} onChange={e => setForm(f => ({ ...f, tags: e.target.value }))} fullWidth size="small" placeholder="ex: robe, vintage, été" sx={fieldSx} />
          <TextField label="Notes" value={form.notes} onChange={e => setForm(f => ({ ...f, notes: e.target.value }))} fullWidth multiline rows={2} size="small" sx={fieldSx} />
        </DialogContent>
        <DialogActions sx={{ px: 3, pb: 2, gap: 1 }}>
          <Button onClick={() => { setAddOpen(false); setForm(defaultForm); }} sx={{ color: 'text.secondary' }}>Annuler</Button>
          <Button onClick={handleAddSubmit} variant="contained" disabled={saving || !form.image}
            sx={{ bgcolor: '#e36397', '&:hover': { bgcolor: '#c9547f' }, fontWeight: 700 }}>
            {saving ? <CircularProgress size={20} color="inherit" /> : 'Ajouter'}
          </Button>
        </DialogActions>
      </Dialog>

      {/* Dialog détail */}
      <Dialog open={!!detail} onClose={() => setDetail(null)} maxWidth="md" fullWidth scroll="paper"
        PaperProps={{ sx: { borderRadius: 3 } }}>
        {detail && (
          <>
            <DialogTitle sx={{ fontWeight: 800, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              {detail.titre || 'Inspiration'}
              <IconButton size="small" onClick={() => setDetail(null)}><X size={18} /></IconButton>
            </DialogTitle>
            <DialogContent dividers>
              {detail.image && (
                <Box component="img" src={detail.image} alt={detail.titre || 'Inspiration'}
                  sx={{ width: '100%', maxHeight: 450, objectFit: 'contain', mb: 2, borderRadius: 2 }} />
              )}
              {detail.source && (
                <Typography sx={{ mb: 0.5, fontSize: '0.9rem' }}>
                  <strong>Source :</strong>{' '}
                  {detail.source.startsWith('http')
                    ? <a href={detail.source} target="_blank" rel="noopener noreferrer">{detail.source}</a>
                    : detail.source}
                </Typography>
              )}
              {detail.tags?.length > 0 && (
                <Box sx={{ display: 'flex', gap: 0.5, flexWrap: 'wrap', mt: 1, mb: 0.5 }}>
                  {detail.tags.map(tag => (
                    <Chip key={tag} label={tag} size="small" sx={{ bgcolor: '#fce4ec', color: '#c2185b', fontWeight: 700 }} />
                  ))}
                </Box>
              )}
              {detail.notes && <Typography sx={{ mt: 1, fontStyle: 'italic', fontSize: '0.9rem' }}>{detail.notes}</Typography>}
            </DialogContent>
            <DialogActions sx={{ p: 2 }}>
              <Button startIcon={<Trash2 size={16} />} variant="outlined"
                sx={{ borderColor: '#e85d75', color: '#e85d75', fontWeight: 700 }}
                onClick={() => { setDeleteTarget(detail); setDetail(null); }}>
                Supprimer
              </Button>
            </DialogActions>
          </>
        )}
      </Dialog>

      {/* Dialog confirmation suppression */}
      <Dialog open={!!deleteTarget} onClose={() => setDeleteTarget(null)} PaperProps={{ sx: { borderRadius: 3 } }}>
        <DialogTitle sx={{ fontWeight: 800 }}>Supprimer cette inspiration ?</DialogTitle>
        <DialogContent>
          <Typography>Cette photo sera définitivement supprimée de votre galerie d'inspirations.</Typography>
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

export default Inspirations;
