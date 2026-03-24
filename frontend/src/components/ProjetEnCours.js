import React, { useState } from 'react';
import {
  Box, Paper, CardMedia, Typography, Button, IconButton,
  LinearProgress, Checkbox, Dialog, DialogTitle, DialogContent,
  DialogActions, CircularProgress, Chip, Tooltip
} from '@mui/material';
import { Plus, Pencil, Trash2, CheckCircle, FolderOpen } from 'lucide-react';
import { projetService } from '../services/api';
import ProjetForm from './ProjetForm';

function ProjetEnCours({ projets, patrons, tissus, loading, onRefresh }) {
  const [formOpen, setFormOpen] = useState(false);
  const [editingProjet, setEditingProjet] = useState(null);
  const [terminerTarget, setTerminerTarget] = useState(null);
  const [deleteTarget, setDeleteTarget] = useState(null);

  const enCours = projets.filter(p => p.statut === 'En cours');

  const getPatron = (id) => patrons.find(p => p._id === id);
  const getTissu = (id) => tissus.find(t => t._id === id);

  const getNomProjet = (projet) => {
    if (projet.nom) return projet.nom;
    const p = getPatron(projet.patronId);
    if (p) return `${p.marque} — ${p.modele}`;
    return 'Projet sans nom';
  };

  const handleToggleEtape = async (projet, idx, e) => {
    e.stopPropagation();
    const newFaite = !projet.etapes[idx].faite;
    try {
      await projetService.setEtape(projet._id, idx, newFaite);
      onRefresh();
    } catch (error) {
      console.error('Erreur étape:', error);
    }
  };

  const handleMarquerTermine = async () => {
    if (!terminerTarget) return;
    try {
      await projetService.setStatut(terminerTarget._id, 'Terminé');
      setTerminerTarget(null);
      onRefresh();
    } catch (error) {
      console.error('Erreur statut:', error);
    }
  };

  const handleDelete = async () => {
    if (!deleteTarget) return;
    try {
      await projetService.delete(deleteTarget._id);
      setDeleteTarget(null);
      onRefresh();
    } catch (error) {
      console.error('Erreur suppression:', error);
    }
  };

  const handleSave = () => {
    setFormOpen(false);
    setEditingProjet(null);
    onRefresh();
  };

  if (loading) return <Box display="flex" justifyContent="center" p={4}><CircularProgress /></Box>;

  return (
    <Box>
      {/* Header */}
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
          <FolderOpen size={28} strokeWidth={2} color="#33658a" />
          <Typography variant="h4" sx={{ fontWeight: 900 }}>Projets en cours</Typography>
          {enCours.length > 0 && (
            <Typography variant="body2" color="text.secondary" sx={{ fontWeight: 600 }}>
              {enCours.length} projet{enCours.length > 1 ? 's' : ''}
            </Typography>
          )}
        </Box>
        <Button
          variant="contained"
          startIcon={<Plus size={18} />}
          onClick={() => { setEditingProjet(null); setFormOpen(true); }}
          sx={{ bgcolor: '#33658a', '&:hover': { bgcolor: '#1e4d6b' }, fontWeight: 700, borderRadius: 2 }}
        >
          Nouveau projet
        </Button>
      </Box>

      {enCours.length === 0 ? (
        <Box sx={{ border: '2px dashed rgba(26,19,10,0.1)', borderRadius: 4, p: 8, textAlign: 'center', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 2.5 }}>
          <FolderOpen size={60} strokeWidth={1} color="#ddd" />
          <Box>
            <Typography variant="h6" sx={{ fontWeight: 800, mb: 0.5 }}>Aucun projet en cours</Typography>
            <Typography variant="body2" color="text.secondary">
              Créez un projet pour suivre votre avancement étape par étape.
            </Typography>
          </Box>
          <Button variant="contained" startIcon={<Plus size={18} />}
            onClick={() => { setEditingProjet(null); setFormOpen(true); }}
            sx={{ bgcolor: '#33658a', '&:hover': { bgcolor: '#1e4d6b' }, fontWeight: 700, borderRadius: 2 }}>
            Nouveau projet
          </Button>
        </Box>
      ) : (
        <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', sm: '1fr 1fr', md: '1fr 1fr 1fr' }, gap: 2 }}>
          {enCours.map(projet => {
            const patron = getPatron(projet.patronId);
            const tissu = getTissu(projet.tissuId);
            const etapesFaites = projet.etapes.filter(e => e.faite).length;
            const totalEtapes = projet.etapes.length;
            const progression = totalEtapes > 0 ? (etapesFaites / totalEtapes) * 100 : 0;

            return (
              <Paper key={projet._id} elevation={0} sx={{
                border: '1.5px solid rgba(26,19,10,0.07)',
                borderTop: '3px solid #33658a',
                borderRadius: 3,
                overflow: 'hidden',
                display: 'flex', flexDirection: 'column',
                transition: 'all 0.15s',
                '&:hover': { boxShadow: '0 4px 16px rgba(51,101,138,0.12)', transform: 'translateY(-2px)' },
              }}>
                {projet.image ? (
                  <Box sx={{ height: 160, overflow: 'hidden' }}>
                    <CardMedia component="img" image={projet.image} alt={getNomProjet(projet)}
                      sx={{ height: '100%', objectFit: 'cover' }} />
                  </Box>
                ) : patron?.imagePrincipale ? (
                  <Box sx={{ height: 160, overflow: 'hidden' }}>
                    <CardMedia component="img" image={patron.imagePrincipale} alt={getNomProjet(projet)}
                      sx={{ height: '100%', objectFit: 'cover', opacity: 0.7 }} />
                  </Box>
                ) : null}

                {/* Header */}
                <Box sx={{ px: 2, py: 1.5, bgcolor: 'rgba(0,0,0,0.015)', borderBottom: '1px solid rgba(26,19,10,0.05)', display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                  <Typography sx={{ fontWeight: 800, fontSize: '0.95rem', lineHeight: 1.3, flex: 1, minWidth: 0 }}>
                    {getNomProjet(projet)}
                  </Typography>
                  <Box sx={{ display: 'flex', flexShrink: 0, ml: 1 }}>
                    <Tooltip title="Modifier">
                      <IconButton size="small" onClick={e => { e.stopPropagation(); setEditingProjet(projet); setFormOpen(true); }} sx={{ color: 'text.secondary' }}>
                        <Pencil size={14} strokeWidth={2} />
                      </IconButton>
                    </Tooltip>
                    <Tooltip title="Supprimer">
                      <IconButton size="small" onClick={e => { e.stopPropagation(); setDeleteTarget(projet); }} sx={{ color: '#e85d75' }}>
                        <Trash2 size={14} strokeWidth={2} />
                      </IconButton>
                    </Tooltip>
                  </Box>
                </Box>

                {/* Body */}
                <Box sx={{ px: 2, py: 1.5, flex: 1 }}>
                  {tissu && (
                    <Chip label={tissu.nom} size="small"
                      sx={{ mb: 1, bgcolor: '#e0f7f7', color: '#0cbaba', fontWeight: 700, fontSize: '0.7rem', height: 20 }} />
                  )}

                  {projet.dateDebut && (
                    <Typography variant="body2" color="text.secondary" sx={{ fontSize: '0.78rem', mb: 0.5 }}>
                      Début : {new Date(projet.dateDebut).toLocaleDateString('fr-FR')}
                    </Typography>
                  )}

                  {totalEtapes > 0 && (
                    <Box sx={{ mt: 0.5, mb: 1 }}>
                      <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 0.5 }}>
                        <Typography variant="body2" sx={{ fontSize: '0.75rem', fontWeight: 700, color: 'text.secondary', textTransform: 'uppercase', letterSpacing: '0.04em' }}>
                          Étapes
                        </Typography>
                        <Typography variant="body2" sx={{ fontSize: '0.78rem', color: '#0cbaba', fontWeight: 700 }}>
                          {etapesFaites}/{totalEtapes}
                        </Typography>
                      </Box>
                      <LinearProgress
                        variant="determinate"
                        value={progression}
                        sx={{ height: 5, borderRadius: 3, bgcolor: 'rgba(26,19,10,0.07)', '& .MuiLinearProgress-bar': { bgcolor: '#0cbaba' } }}
                      />
                      <Box sx={{ mt: 0.75, maxHeight: 110, overflowY: 'auto' }}>
                        {projet.etapes.map((etape, idx) => (
                          <Box key={idx} sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }} onClick={e => e.stopPropagation()}>
                            <Checkbox
                              checked={etape.faite}
                              onChange={e => handleToggleEtape(projet, idx, e)}
                              size="small"
                              sx={{ p: 0.25, color: '#0cbaba', '&.Mui-checked': { color: '#0cbaba' } }}
                            />
                            <Typography variant="body2" sx={{ fontSize: '0.78rem', textDecoration: etape.faite ? 'line-through' : 'none', color: etape.faite ? 'text.disabled' : 'inherit' }}>
                              {etape.titre}
                            </Typography>
                          </Box>
                        ))}
                      </Box>
                    </Box>
                  )}

                  {projet.notes && (
                    <Typography variant="body2" color="text.secondary" sx={{ fontSize: '0.78rem', fontStyle: 'italic' }}>
                      {projet.notes.slice(0, 80)}{projet.notes.length > 80 ? '...' : ''}
                    </Typography>
                  )}
                </Box>

                {/* Footer actions */}
                <Box sx={{ px: 2, py: 1.25, borderTop: '1px solid rgba(26,19,10,0.05)' }}>
                  <Button size="small" startIcon={<CheckCircle size={14} />}
                    onClick={e => { e.stopPropagation(); setTerminerTarget(projet); }}
                    sx={{ bgcolor: '#0cbaba', color: 'white', fontSize: '0.72rem', fontWeight: 700, borderRadius: 1.5, '&:hover': { bgcolor: '#09a0a0' } }}>
                    Marquer terminé
                  </Button>
                </Box>
              </Paper>
            );
          })}
        </Box>
      )}

      {/* Dialog confirmation terminer */}
      <Dialog open={!!terminerTarget} onClose={() => setTerminerTarget(null)} PaperProps={{ sx: { borderRadius: 3 } }}>
        <DialogTitle sx={{ fontWeight: 800 }}>Marquer comme terminé ?</DialogTitle>
        <DialogContent>
          <Typography>Le projet <strong>{terminerTarget ? getNomProjet(terminerTarget) : ''}</strong> sera marqué comme terminé.</Typography>
        </DialogContent>
        <DialogActions sx={{ px: 3, pb: 2 }}>
          <Button onClick={() => setTerminerTarget(null)}>Annuler</Button>
          <Button onClick={handleMarquerTermine} variant="contained"
            sx={{ bgcolor: '#0cbaba', '&:hover': { bgcolor: '#09a0a0' }, fontWeight: 700 }}>
            Terminé
          </Button>
        </DialogActions>
      </Dialog>

      {/* Dialog confirmation suppression */}
      <Dialog open={!!deleteTarget} onClose={() => setDeleteTarget(null)} PaperProps={{ sx: { borderRadius: 3 } }}>
        <DialogTitle sx={{ fontWeight: 800 }}>Supprimer ce projet ?</DialogTitle>
        <DialogContent>
          <Typography>Le projet <strong>{deleteTarget ? getNomProjet(deleteTarget) : ''}</strong> sera définitivement supprimé.</Typography>
        </DialogContent>
        <DialogActions sx={{ px: 3, pb: 2 }}>
          <Button onClick={() => setDeleteTarget(null)}>Annuler</Button>
          <Button onClick={handleDelete} variant="contained"
            sx={{ bgcolor: '#e85d75', '&:hover': { bgcolor: '#c44060' }, fontWeight: 700 }}>
            Supprimer
          </Button>
        </DialogActions>
      </Dialog>

      {/* Dialog formulaire */}
      <Dialog open={formOpen} onClose={() => {}} disableEscapeKeyDown maxWidth="md" fullWidth>
        <DialogContent sx={{ p: 0 }}>
          <ProjetForm
            projet={editingProjet}
            patrons={patrons}
            tissus={tissus}
            onSave={handleSave}
            onCancel={() => { setFormOpen(false); setEditingProjet(null); }}
          />
        </DialogContent>
      </Dialog>
    </Box>
  );
}

export default ProjetEnCours;
