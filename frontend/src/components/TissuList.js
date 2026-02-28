import React, { useState } from 'react';
import {
  Box, Card, CardContent, CardMedia, Typography, Chip,
  CircularProgress, Dialog, DialogTitle, DialogContent, DialogActions,
  Button, IconButton
} from '@mui/material';
import AddIcon from '@mui/icons-material/Add';
import CloseIcon from '@mui/icons-material/Close';
import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/Delete';
import { tissuService } from '../services/api';
import TissuForm from './TissuForm';

function TissuList({ tissus, loading, onRefresh }) {
  const [editingTissu, setEditingTissu] = useState(null);
  const [formOpen, setFormOpen] = useState(false);
  const [detailTissu, setDetailTissu] = useState(null);

  const handleOpenForm = (tissu = null) => {
    setEditingTissu(tissu);
    setDetailTissu(null);
    setFormOpen(true);
  };

  const handleDelete = async (tissu, e) => {
    e.stopPropagation();
    if (!window.confirm(`Supprimer "${tissu.nom}" ?`)) return;
    try {
      await tissuService.delete(tissu._id);
      onRefresh();
    } catch (error) {
      console.error('Erreur suppression tissu:', error);
    }
  };

  const handleEdit = (tissu, e) => {
    e.stopPropagation();
    handleOpenForm(tissu);
  };

  const handleSave = () => {
    setFormOpen(false);
    setEditingTissu(null);
    setDetailTissu(null);
    onRefresh();
  };

  if (loading) {
    return <Box display="flex" justifyContent="center" p={4}><CircularProgress /></Box>;
  }

  return (
    <Box>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
        <Typography variant="h6">
          {tissus.length} tissu{tissus.length > 1 ? 's' : ''}
        </Typography>
        <Button
          variant="contained"
          startIcon={<AddIcon />}
          onClick={() => handleOpenForm(null)}
          sx={{ bgcolor: '#33658a', '&:hover': { bgcolor: '#1e4d6b' } }}
        >
          Ajouter un tissu
        </Button>
      </Box>

      {tissus.length === 0 && (
        <Box sx={{ textAlign: 'center', py: 8, color: 'text.secondary' }}>
          <Typography variant="h6">Aucun tissu dans votre stock.</Typography>
          <Typography variant="body2">Cliquez sur "Ajouter un tissu" pour commencer.</Typography>
        </Box>
      )}

      <Box sx={{
        display: 'grid',
        gridTemplateColumns: { xs: '1fr', sm: '1fr 1fr', md: '1fr 1fr 1fr 1fr' },
        gap: 3
      }}>
        {tissus.map(tissu => (
          <Card
            key={tissu._id}
            onClick={() => setDetailTissu(tissu)}
            sx={{
              cursor: 'pointer',
              bgcolor: '#ffddd2',
              border: '2px solid transparent',
              '&:hover': { boxShadow: 6, bgcolor: '#e85d75', color: 'white' }
            }}
          >
            {tissu.image ? (
              <CardMedia
                component="img"
                image={tissu.image}
                alt={tissu.nom}
                sx={{ height: 160, objectFit: 'cover' }}
              />
            ) : (
              <Box sx={{ height: 160, bgcolor: 'grey.100', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <Typography variant="body2" color="text.disabled">Pas d'image</Typography>
              </Box>
            )}
            <CardContent>
              <Typography variant="h6" sx={{ fontWeight: 800, fontSize: '1rem', mb: 0.5 }}>
                {tissu.nom}
              </Typography>
              {tissu.type && (
                <Chip label={tissu.type} size="small" sx={{ mb: 0.5, bgcolor: '#33658a', color: 'white' }} />
              )}
              {tissu.couleur && (
                <Typography variant="body2" color="text.secondary">{tissu.couleur}</Typography>
              )}
              {tissu.quantite !== undefined && tissu.quantite !== null && (
                <Typography variant="body2" sx={{ fontWeight: 700, color: '#0cbaba' }}>
                  {tissu.quantite} m
                </Typography>
              )}
              <Box sx={{ display: 'flex', justifyContent: 'flex-end', gap: 0.5, mt: 1 }} onClick={e => e.stopPropagation()}>
                <IconButton size="small" onClick={e => handleEdit(tissu, e)} sx={{ color: '#33658a' }}>
                  <EditIcon fontSize="small" />
                </IconButton>
                <IconButton size="small" onClick={e => handleDelete(tissu, e)} sx={{ color: '#e85d75' }}>
                  <DeleteIcon fontSize="small" />
                </IconButton>
              </Box>
            </CardContent>
          </Card>
        ))}
      </Box>

      {/* Modal détail / édition */}
      <Dialog open={!!detailTissu && !formOpen} onClose={() => {}} disableEscapeKeyDown maxWidth="sm" fullWidth>
        {detailTissu && (
          <>
            <DialogTitle>
              <Box display="flex" justifyContent="space-between" alignItems="center">
                <Typography variant="h6">{detailTissu.nom}</Typography>
                <IconButton onClick={() => setDetailTissu(null)}><CloseIcon /></IconButton>
              </Box>
            </DialogTitle>
            <DialogContent dividers>
              {detailTissu.image && (
                <Box component="img" src={detailTissu.image} alt={detailTissu.nom}
                  sx={{ width: '100%', maxHeight: 300, objectFit: 'contain', mb: 2, borderRadius: 1 }} />
              )}
              {detailTissu.type && <Typography><strong>Type :</strong> {detailTissu.type}</Typography>}
              {detailTissu.couleur && <Typography><strong>Couleur :</strong> {detailTissu.couleur}</Typography>}
              {detailTissu.quantite !== undefined && <Typography><strong>Quantité :</strong> {detailTissu.quantite} m</Typography>}
              {detailTissu.provenance && <Typography><strong>Provenance :</strong> {detailTissu.provenance}</Typography>}
            </DialogContent>
            <DialogActions sx={{ justifyContent: 'space-between', p: 2 }}>
              <Button
                startIcon={<DeleteIcon />}
                variant="contained"
                sx={{ bgcolor: '#e85d75', '&:hover': { bgcolor: '#c94a60' } }}
                onClick={async () => {
                  if (!window.confirm(`Supprimer "${detailTissu.nom}" ?`)) return;
                  await tissuService.delete(detailTissu._id);
                  setDetailTissu(null);
                  onRefresh();
                }}
              >
                Supprimer
              </Button>
              <Button
                startIcon={<EditIcon />}
                variant="contained"
                sx={{ bgcolor: '#33658a', '&:hover': { bgcolor: '#1e4d6b' } }}
                onClick={() => handleOpenForm(detailTissu)}
              >
                Modifier
              </Button>
            </DialogActions>
          </>
        )}
      </Dialog>

      {/* Dialog formulaire édition */}
      <Dialog open={formOpen} onClose={() => {}} disableEscapeKeyDown maxWidth="sm" fullWidth>
        <DialogContent sx={{ p: 0 }}>
          <TissuForm
            tissu={editingTissu}
            onSave={handleSave}
            onCancel={() => { setFormOpen(false); setEditingTissu(null); }}
          />
        </DialogContent>
      </Dialog>
    </Box>
  );
}

export default TissuList;
