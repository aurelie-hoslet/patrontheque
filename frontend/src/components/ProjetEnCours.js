import React, { useState } from 'react';
import {
  Box, Card, CardContent, CardMedia, Typography, Button, IconButton,
  LinearProgress, Checkbox, Dialog, DialogContent, CircularProgress, Chip
} from '@mui/material';
import AddIcon from '@mui/icons-material/Add';
import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/Delete';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import { projetService } from '../services/api';
import ProjetForm from './ProjetForm';

function ProjetEnCours({ projets, patrons, tissus, loading, onRefresh }) {
  const [formOpen, setFormOpen] = useState(false);
  const [editingProjet, setEditingProjet] = useState(null);

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

  const handleMarquerTermine = async (projet, e) => {
    e.stopPropagation();
    if (!window.confirm(`Marquer "${getNomProjet(projet)}" comme terminé ?`)) return;
    try {
      await projetService.setStatut(projet._id, 'Terminé');
      onRefresh();
    } catch (error) {
      console.error('Erreur statut:', error);
    }
  };

  const handleDelete = async (projet, e) => {
    e.stopPropagation();
    if (!window.confirm(`Supprimer "${getNomProjet(projet)}" ?`)) return;
    try {
      await projetService.delete(projet._id);
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
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
        <Typography variant="h6">
          {enCours.length} projet{enCours.length > 1 ? 's' : ''} en cours
        </Typography>
        <Button
          variant="contained"
          startIcon={<AddIcon />}
          onClick={() => { setEditingProjet(null); setFormOpen(true); }}
          sx={{ bgcolor: '#33658a', '&:hover': { bgcolor: '#1e4d6b' } }}
        >
          Nouveau projet
        </Button>
      </Box>

      {enCours.length === 0 ? (
        <Box sx={{ textAlign: 'center', py: 8, color: 'text.secondary' }}>
          <Typography variant="h6">Aucun projet en cours.</Typography>
          <Typography variant="body2">Cliquez sur "Nouveau projet" pour commencer.</Typography>
        </Box>
      ) : (
        <Box sx={{
          display: 'grid',
          gridTemplateColumns: { xs: '1fr', sm: '1fr 1fr', md: '1fr 1fr 1fr' },
          gap: 3
        }}>
          {enCours.map(projet => {
            const patron = getPatron(projet.patronId);
            const tissu = getTissu(projet.tissuId);
            const etapesFaites = projet.etapes.filter(e => e.faite).length;
            const totalEtapes = projet.etapes.length;
            const progression = totalEtapes > 0 ? (etapesFaites / totalEtapes) * 100 : 0;

            return (
              <Card key={projet._id} sx={{ bgcolor: '#ffddd2', border: '2px solid transparent' }}>
                {projet.image ? (
                  <CardMedia component="img" image={projet.image} alt={getNomProjet(projet)}
                    sx={{ height: 180, objectFit: 'cover' }} />
                ) : patron?.imagePrincipale ? (
                  <CardMedia component="img" image={patron.imagePrincipale} alt={getNomProjet(projet)}
                    sx={{ height: 180, objectFit: 'cover', opacity: 0.7 }} />
                ) : (
                  <Box sx={{ height: 100, bgcolor: 'grey.100', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                    <Typography variant="body2" color="text.disabled">Pas d'image</Typography>
                  </Box>
                )}

                <CardContent>
                  <Typography variant="h6" sx={{ fontWeight: 800, fontSize: '1rem', mb: 0.5 }}>
                    {getNomProjet(projet)}
                  </Typography>

                  {tissu && (
                    <Chip label={`🧵 ${tissu.nom}`} size="small" sx={{ mb: 1, bgcolor: '#0cbaba', color: 'white' }} />
                  )}

                  {projet.dateDebut && (
                    <Typography variant="body2" color="text.secondary" sx={{ fontSize: '0.78rem' }}>
                      Début : {new Date(projet.dateDebut).toLocaleDateString('fr-FR')}
                    </Typography>
                  )}

                  {/* Progression étapes */}
                  {totalEtapes > 0 && (
                    <Box sx={{ mt: 1, mb: 1 }}>
                      <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 0.5 }}>
                        <Typography variant="body2" sx={{ fontSize: '0.78rem', fontWeight: 600 }}>
                          Étapes
                        </Typography>
                        <Typography variant="body2" sx={{ fontSize: '0.78rem', color: '#0cbaba', fontWeight: 700 }}>
                          {etapesFaites}/{totalEtapes}
                        </Typography>
                      </Box>
                      <LinearProgress
                        variant="determinate"
                        value={progression}
                        sx={{ height: 6, borderRadius: 3, bgcolor: '#eee', '& .MuiLinearProgress-bar': { bgcolor: '#0cbaba' } }}
                      />
                      <Box sx={{ mt: 0.5, maxHeight: 120, overflowY: 'auto' }}>
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
                    <Typography variant="body2" color="text.secondary" sx={{ fontSize: '0.78rem', mt: 0.5, fontStyle: 'italic' }}>
                      {projet.notes.slice(0, 80)}{projet.notes.length > 80 ? '...' : ''}
                    </Typography>
                  )}

                  {/* Actions */}
                  <Box sx={{ display: 'flex', gap: 0.5, mt: 1, flexWrap: 'wrap' }}>
                    <Button
                      size="small"
                      startIcon={<CheckCircleIcon />}
                      onClick={e => handleMarquerTermine(projet, e)}
                      sx={{ bgcolor: '#0cbaba', color: 'white', fontSize: '0.7rem', '&:hover': { bgcolor: '#09a0a0' } }}
                    >
                      Terminé
                    </Button>
                    <IconButton size="small" onClick={e => { e.stopPropagation(); setEditingProjet(projet); setFormOpen(true); }} sx={{ color: '#33658a' }}>
                      <EditIcon fontSize="small" />
                    </IconButton>
                    <IconButton size="small" onClick={e => handleDelete(projet, e)} sx={{ color: '#e85d75' }}>
                      <DeleteIcon fontSize="small" />
                    </IconButton>
                  </Box>
                </CardContent>
              </Card>
            );
          })}
        </Box>
      )}

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
