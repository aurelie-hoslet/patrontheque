import React, { useState, useEffect } from 'react';
import {
  Box, Typography, IconButton,
  Dialog, DialogTitle, DialogContent, DialogActions, Button, CircularProgress,
  TextField, Select, MenuItem, FormControl, InputLabel
} from '@mui/material';
import CloseIcon from '@mui/icons-material/Close';
import DeleteIcon from '@mui/icons-material/Delete';
import UndoIcon from '@mui/icons-material/Undo';
import AddPhotoAlternateIcon from '@mui/icons-material/AddPhotoAlternate';
import ContentPasteIcon from '@mui/icons-material/ContentPaste';
import { projetService, historiqueService } from '../services/api';

const defaultAdd = { nom: '', patronId: '', tissuId: '', dateFin: '', notes: '', image: '' };

function GalerieProjets({ projets, patrons, tissus, loading, onRefresh }) {
  const [detailProjet, setDetailProjet] = useState(null);
  const [hoveredId, setHoveredId] = useState(null);
  const [addOpen, setAddOpen] = useState(false);
  const [addForm, setAddForm] = useState(defaultAdd);
  const [saving, setSaving] = useState(false);

  const termines = projets.filter(p => p.statut === 'Terminé');

  const getPatron = (id) => patrons.find(p => p._id === id);
  const getTissu = (id) => tissus.find(t => t._id === id);

  const getNomProjet = (projet) => {
    if (projet.nom) return projet.nom;
    const p = getPatron(projet.patronId);
    if (p) return `${p.marque} — ${p.modele}`;
    return 'Projet sans nom';
  };

  useEffect(() => {
    if (detailProjet?._id) {
      historiqueService.track({
        id: detailProjet._id,
        type: 'projet',
        nom: getNomProjet(detailProjet),
        image: detailProjet.image || getPatron(detailProjet.patronId)?.imagePrincipale || null,
      }).catch(() => {});
    }
  }, [detailProjet?._id]); // eslint-disable-line react-hooks/exhaustive-deps

  const handleRemettreEnCours = async () => {
    if (!window.confirm(`Remettre "${getNomProjet(detailProjet)}" en cours ?`)) return;
    try {
      await projetService.setStatut(detailProjet._id, 'En cours');
      setDetailProjet(null);
      onRefresh();
    } catch (error) {
      console.error('Erreur statut:', error);
    }
  };

  const handleDelete = async () => {
    if (!window.confirm(`Supprimer "${getNomProjet(detailProjet)}" définitivement ?`)) return;
    try {
      await projetService.delete(detailProjet._id);
      setDetailProjet(null);
      onRefresh();
    } catch (error) {
      console.error('Erreur suppression:', error);
    }
  };

  const POSITIONS = [
    ['left top',    'center top',    'right top'],
    ['left center', 'center',        'right center'],
    ['left bottom', 'center bottom', 'right bottom'],
  ];

  const handleSetPosition = async (projetId, pos) => {
    try {
      await projetService.setImagePosition(projetId, pos);
      onRefresh();
    } catch (err) {
      console.error('Erreur position:', err);
    }
  };

  const [dragging, setDragging] = useState(false);

  const loadImageFile = (file) => {
    if (!file || !file.type.startsWith('image/')) return;
    const reader = new FileReader();
    reader.onloadend = () => setAddForm(f => ({ ...f, image: reader.result }));
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
    setSaving(true);
    try {
      await projetService.create({
        ...addForm,
        statut: 'Terminé',
        patronId: addForm.patronId || undefined,
        tissuId: addForm.tissuId || undefined,
        dateFin: addForm.dateFin || undefined,
        etapes: []
      });
      setAddOpen(false);
      setAddForm(defaultAdd);
      onRefresh();
    } catch (err) {
      console.error('Erreur ajout:', err);
    } finally {
      setSaving(false);
    }
  };

  if (loading) return <Box display="flex" justifyContent="center" p={4}><CircularProgress /></Box>;

  return (
    <Box>
      <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 2 }}>
        <Typography variant="h4" sx={{ fontFamily: "'Permanent Marker', cursive", fontWeight: 900 }}>
          {termines.length > 0
            ? `${termines.length} projet${termines.length > 1 ? 's' : ''} terminé${termines.length > 1 ? 's' : ''}`
            : 'Galerie des projets terminés'}
        </Typography>
        <Button
          variant="contained"
          startIcon={<AddPhotoAlternateIcon />}
          onClick={() => setAddOpen(true)}
          sx={{ bgcolor: '#0cbaba', '&:hover': { bgcolor: '#099999' } }}
        >
          Ajouter
        </Button>
      </Box>

      {termines.length === 0 ? (
        <Box sx={{ textAlign: 'center', py: 8, color: 'text.secondary' }}>
          <Typography variant="h6">Aucun projet terminé pour l'instant.</Typography>
          <Typography variant="body2">Ajoutez directement une réalisation ou marquez un projet en cours comme "Terminé".</Typography>
        </Box>
      ) : (
        <Box sx={{
          display: 'grid',
          gridTemplateColumns: { xs: '1fr 1fr', sm: '1fr 1fr 1fr', md: '1fr 1fr 1fr 1fr' },
          gap: 0
        }}>
          {termines.map(projet => {
            const patron = getPatron(projet.patronId);
            const imageAffichee = projet.image || patron?.imagePrincipale;
            const position = projet.imagePosition || 'center';
            const isHovered = hoveredId === projet._id;

            return (
              <Box
                key={projet._id}
                onMouseEnter={() => setHoveredId(projet._id)}
                onMouseLeave={() => setHoveredId(null)}
                sx={{ position: 'relative', aspectRatio: '1/1', overflow: 'hidden', bgcolor: 'grey.100' }}
              >
                {imageAffichee ? (
                  <Box
                    component="img"
                    src={imageAffichee}
                    alt={getNomProjet(projet)}
                    onClick={() => setDetailProjet(projet)}
                    sx={{
                      width: '100%', height: '100%', objectFit: 'cover',
                      objectPosition: position, display: 'block',
                      cursor: 'pointer', transition: 'transform 0.2s',
                      ...(isHovered && { transform: 'scale(1.03)' })
                    }}
                  />
                ) : (
                  <Box
                    onClick={() => setDetailProjet(projet)}
                    sx={{ width: '100%', height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer' }}
                  >
                    <Typography variant="body2" color="text.disabled" sx={{ fontSize: '0.75rem', textAlign: 'center', px: 1 }}>
                      {getNomProjet(projet)}
                    </Typography>
                  </Box>
                )}

                {/* Sélecteur de cadrage */}
                {isHovered && imageAffichee && (
                  <Box
                    sx={{
                      position: 'absolute', bottom: 4, right: 4,
                      bgcolor: 'rgba(0,0,0,0.55)', borderRadius: 1, p: '5px',
                      display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '3px'
                    }}
                  >
                    {POSITIONS.map((row, ri) => row.map((pos, ci) => (
                      <Box
                        key={`${ri}-${ci}`}
                        onClick={e => { e.stopPropagation(); handleSetPosition(projet._id, pos); }}
                        sx={{
                          width: 10, height: 10, borderRadius: '50%',
                          bgcolor: position === pos ? 'white' : 'rgba(255,255,255,0.35)',
                          cursor: 'pointer',
                          '&:hover': { bgcolor: 'white' }
                        }}
                      />
                    )))}
                  </Box>
                )}
              </Box>
            );
          })}
        </Box>
      )}

      {/* Mini formulaire d'ajout */}
      <Dialog open={addOpen} onClose={() => { setAddOpen(false); setAddForm(defaultAdd); }} maxWidth="sm" fullWidth>
        <DialogTitle>
          <Box display="flex" justifyContent="space-between" alignItems="center">
            <Typography variant="h6">Ajouter une réalisation</Typography>
            <IconButton onClick={() => { setAddOpen(false); setAddForm(defaultAdd); }}><CloseIcon /></IconButton>
          </Box>
        </DialogTitle>
        <DialogContent sx={{ display: 'flex', flexDirection: 'column', gap: 2, pt: 2 }}>

          {/* Image */}
          <Box>
            {addForm.image ? (
              <Box sx={{ position: 'relative' }}>
                <Box component="img" src={addForm.image} alt="Aperçu"
                  sx={{ width: '100%', maxHeight: 220, objectFit: 'cover', borderRadius: 2 }} />
                <IconButton
                  size="small"
                  onClick={() => setAddForm(f => ({ ...f, image: '' }))}
                  sx={{ position: 'absolute', top: 4, right: 4, bgcolor: 'white', boxShadow: 1 }}
                >
                  <DeleteIcon fontSize="small" />
                </IconButton>
              </Box>
            ) : (
              <Box
                onDragOver={e => { e.preventDefault(); setDragging(true); }}
                onDragLeave={() => setDragging(false)}
                onDrop={e => { e.preventDefault(); setDragging(false); loadImageFile(e.dataTransfer.files[0]); }}
                onClick={() => document.getElementById('galerie-file-input').click()}
                sx={{
                  border: `2px dashed ${dragging ? '#0cbaba' : '#b2dfdb'}`,
                  borderRadius: 2, p: 3, textAlign: 'center', cursor: 'pointer',
                  bgcolor: dragging ? '#e0f7f7' : '#f5fffe',
                  transition: 'all 0.15s',
                  '&:hover': { borderColor: '#0cbaba', bgcolor: '#e0f7f7' }
                }}
              >
                <AddPhotoAlternateIcon sx={{ fontSize: 36, color: '#0cbaba', mb: 1 }} />
                <Typography variant="body2" color="text.secondary">
                  Glisser-déposer une photo ici<br />ou cliquer pour ouvrir un dossier
                </Typography>
                <Button size="small" variant="outlined" startIcon={<ContentPasteIcon sx={{ fontSize: 14 }} />}
                  onClick={e => { e.stopPropagation(); handlePasteImage(); }}
                  sx={{ mt: 1, borderColor: '#0cbaba', color: '#0cbaba', fontWeight: 600, borderWidth: 2 }}>
                  Coller une image
                </Button>
                <input
                  id="galerie-file-input"
                  type="file"
                  accept="image/*"
                  style={{ display: 'none' }}
                  onChange={e => loadImageFile(e.target.files[0])}
                />
              </Box>
            )}
          </Box>

          <TextField
            label="Nom (optionnel)"
            value={addForm.nom}
            onChange={e => setAddForm(f => ({ ...f, nom: e.target.value }))}
            fullWidth
            size="small"
          />

          <FormControl fullWidth size="small">
            <InputLabel>Patron associé</InputLabel>
            <Select value={addForm.patronId} label="Patron associé" onChange={e => setAddForm(f => ({ ...f, patronId: e.target.value }))}>
              <MenuItem value=""><em>Aucun</em></MenuItem>
              {patrons.map(p => (
                <MenuItem key={p._id} value={p._id}>{p.marque} — {p.modele}</MenuItem>
              ))}
            </Select>
          </FormControl>

          <FormControl fullWidth size="small">
            <InputLabel>Tissu associé</InputLabel>
            <Select value={addForm.tissuId} label="Tissu associé" onChange={e => setAddForm(f => ({ ...f, tissuId: e.target.value }))}>
              <MenuItem value=""><em>Aucun</em></MenuItem>
              {tissus.map(t => (
                <MenuItem key={t._id} value={t._id}>
                  {t.nom}{t.couleur ? ` — ${t.couleur}` : ''}
                </MenuItem>
              ))}
            </Select>
          </FormControl>

          <TextField
            label="Date de fin"
            type="date"
            value={addForm.dateFin}
            onChange={e => setAddForm(f => ({ ...f, dateFin: e.target.value }))}
            InputLabelProps={{ shrink: true }}
            fullWidth
            size="small"
          />

          <TextField
            label="Notes"
            value={addForm.notes}
            onChange={e => setAddForm(f => ({ ...f, notes: e.target.value }))}
            fullWidth
            multiline
            rows={2}
            size="small"
          />
        </DialogContent>
        <DialogActions sx={{ p: 2, gap: 1 }}>
          <Button onClick={() => { setAddOpen(false); setAddForm(defaultAdd); }} variant="outlined">
            Annuler
          </Button>
          <Button
            onClick={handleAddSubmit}
            variant="contained"
            disabled={saving}
            sx={{ bgcolor: '#0cbaba', '&:hover': { bgcolor: '#099999' } }}
          >
            {saving ? <CircularProgress size={20} color="inherit" /> : 'Ajouter à la galerie'}
          </Button>
        </DialogActions>
      </Dialog>

      {/* Modal détail */}
      <Dialog open={!!detailProjet} onClose={() => {}} disableEscapeKeyDown maxWidth="md" fullWidth scroll="paper">
        {detailProjet && (() => {
          const patron = getPatron(detailProjet.patronId);
          const tissu = getTissu(detailProjet.tissuId);
          const imageAffichee = detailProjet.image || patron?.imagePrincipale;
          return (
            <>
              <DialogTitle>
                <Box display="flex" justifyContent="space-between" alignItems="center">
                  <Typography variant="h6">{getNomProjet(detailProjet)}</Typography>
                  <IconButton onClick={() => setDetailProjet(null)}><CloseIcon /></IconButton>
                </Box>
              </DialogTitle>
              <DialogContent dividers>
                {imageAffichee && (
                  <Box component="img" src={imageAffichee} alt={getNomProjet(detailProjet)}
                    sx={{ width: '100%', maxHeight: 400, objectFit: 'contain', mb: 2, borderRadius: 1 }} />
                )}
                {patron && <Typography sx={{ mb: 0.5 }}><strong>Patron :</strong> {patron.marque} — {patron.modele}</Typography>}
                {tissu && <Typography sx={{ mb: 0.5 }}><strong>Tissu :</strong> {tissu.nom}{tissu.couleur ? ` (${tissu.couleur})` : ''}</Typography>}
                {detailProjet.dateDebut && <Typography sx={{ mb: 0.5 }}><strong>Début :</strong> {new Date(detailProjet.dateDebut).toLocaleDateString('fr-FR')}</Typography>}
                {detailProjet.dateFin && <Typography sx={{ mb: 0.5 }}><strong>Fin :</strong> {new Date(detailProjet.dateFin).toLocaleDateString('fr-FR')}</Typography>}
                {detailProjet.notes && <Typography sx={{ mt: 1, fontStyle: 'italic' }}>{detailProjet.notes}</Typography>}
                {detailProjet.etapes.length > 0 && (
                  <Box sx={{ mt: 2 }}>
                    <Typography sx={{ fontWeight: 700, mb: 1 }}>Étapes réalisées :</Typography>
                    {detailProjet.etapes.map((e, i) => (
                      <Typography key={i} variant="body2" sx={{ color: e.faite ? 'text.primary' : 'text.disabled' }}>
                        {e.faite ? '✓' : '○'} {e.titre}
                      </Typography>
                    ))}
                  </Box>
                )}
              </DialogContent>
              <DialogActions sx={{ justifyContent: 'space-between', p: 2 }}>
                <Button startIcon={<DeleteIcon />} variant="contained"
                  sx={{ bgcolor: '#e85d75', '&:hover': { bgcolor: '#c94a60' } }}
                  onClick={handleDelete}>
                  Supprimer
                </Button>
                <Button startIcon={<UndoIcon />} variant="outlined"
                  sx={{ borderColor: '#33658a', color: '#33658a' }}
                  onClick={handleRemettreEnCours}>
                  Remettre en cours
                </Button>
              </DialogActions>
            </>
          );
        })()}
      </Dialog>
    </Box>
  );
}

export default GalerieProjets;
