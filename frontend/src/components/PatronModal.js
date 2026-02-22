import React, { useState } from 'react';
import {
  Dialog, DialogTitle, DialogContent, DialogActions,
  Button, Typography, Grid, Chip, Box, IconButton
} from '@mui/material';
import CloseIcon from '@mui/icons-material/Close';
import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/Delete';
import { patronService } from '../services/api';

function PatronModal({ open, patron, onClose, onEdit, onDelete }) {
  const [lightboxOpen, setLightboxOpen] = useState(false);
  const [lightboxImage, setLightboxImage] = useState('');

  React.useEffect(() => {
    if (open) {
      window.scrollTo(0, 0);
    }
  }, [open]);

  if (!patron) return null;

  const handleDelete = async () => {
    if (window.confirm('Supprimer ce patron ?')) {
      try {
        await patronService.delete(patron._id);
        onDelete();
      } catch (error) {
        console.error('Erreur suppression:', error);
      }
    }
  };

  const openLightbox = (image) => {
    setLightboxImage(image);
    setLightboxOpen(true);
  };

  return (
    <>
      <Dialog
        open={open}
        onClose={onClose}
        maxWidth="md"
        fullWidth
        scroll="paper"
      >
        <DialogTitle>
          <Box display="flex" justifyContent="space-between" alignItems="center">
            <Typography variant="h5">{patron.marque} - {patron.modele}</Typography>
            <IconButton onClick={onClose}>
              <CloseIcon />
            </IconButton>
          </Box>
        </DialogTitle>

        <DialogContent dividers>
          <Box position="absolute" top={70} left={16}>
            <IconButton
              color="primary"
              onClick={() => {
                onEdit(patron);
                onClose();
              }}
              sx={{ bgcolor: 'primary.main', color: 'white', '&:hover': { bgcolor: 'primary.dark' } }}
            >
              <EditIcon />
            </IconButton>
          </Box>

          {patron.imagePrincipale && (
            <Box
              component="img"
              src={patron.imagePrincipale}
              alt={patron.modele}
              sx={{
                width: '100%',
                maxHeight: 400,
                objectFit: 'contain',
                mb: 3,
                cursor: 'zoom-in'
              }}
              onClick={() => openLightbox(patron.imagePrincipale)}
            />
          )}

          <Grid container spacing={2}>
            <Grid item xs={12} sm={6}>
              <Typography variant="subtitle2" color="primary">Marque</Typography>
              <Typography variant="body1">{patron.marque}</Typography>
            </Grid>

            <Grid item xs={12} sm={6}>
              <Typography variant="subtitle2" color="primary">Modèle</Typography>
              <Typography variant="body1">{patron.modele}</Typography>
            </Grid>

            {patron.genres && patron.genres.length > 0 && (
              <Grid item xs={12}>
                <Typography variant="subtitle2" color="primary">Genre</Typography>
                <Typography variant="body1">{patron.genres.join(', ')}</Typography>
              </Grid>
            )}

            {patron.types && patron.types.length > 0 && (
              <Grid item xs={12}>
                <Typography variant="subtitle2" color="primary">Types de vêtement</Typography>
                <Typography variant="body1">{patron.types.join(', ')}</Typography>
              </Grid>
            )}

            {patron.taillesDisponibles && patron.taillesDisponibles.length > 0 && (
              <Grid item xs={12} sm={6}>
                <Typography variant="subtitle2" color="primary">Tailles</Typography>
                <Typography variant="body1">
                  {patron.taillesDisponibles.length === 1
                    ? patron.taillesDisponibles[0]
                    : `${patron.taillesDisponibles[0]} - ${patron.taillesDisponibles[patron.taillesDisponibles.length - 1]}`
                  }
                </Typography>
              </Grid>
            )}

            {(patron.metrageMin || patron.metrageMax) && (
              <Grid item xs={12} sm={6}>
                <Typography variant="subtitle2" color="primary">Métrage</Typography>
                <Typography variant="body1">
                  {patron.metrageMin && patron.metrageMax
                    ? `${patron.metrageMin} à ${patron.metrageMax}m`
                    : patron.metrageMin
                      ? `${patron.metrageMin}m+`
                      : `jusqu'à ${patron.metrageMax}m`
                  }
                </Typography>
              </Grid>
            )}

            {patron.manches && patron.manches.length > 0 && (
              <Grid item xs={12}>
                <Typography variant="subtitle2" color="primary">Manches</Typography>
                <Typography variant="body1">{patron.manches.join(', ')}</Typography>
              </Grid>
            )}

            {patron.longueurs && patron.longueurs.length > 0 && (
              <Grid item xs={12}>
                <Typography variant="subtitle2" color="primary">Longueur</Typography>
                <Typography variant="body1">{patron.longueurs.join(', ')}</Typography>
              </Grid>
            )}

            {patron.typeAccessoire && (
              <Grid item xs={12}>
                <Typography variant="subtitle2" color="primary">Type d'accessoire</Typography>
                <Typography variant="body1">{patron.typeAccessoire}</Typography>
              </Grid>
            )}

            {patron.tissuTypes && patron.tissuTypes.length > 0 && (
              <Grid item xs={12}>
                <Typography variant="subtitle2" color="primary">Type de tissu</Typography>
                <Typography variant="body1">{patron.tissuTypes.join(', ')}</Typography>
              </Grid>
            )}

            {patron.tissuSpecifique && patron.tissuSpecifique.length > 0 && (
              <Grid item xs={12}>
                <Typography variant="subtitle2" color="primary">Tissus spécifiques</Typography>
                <Typography variant="body1">{patron.tissuSpecifique.join(', ')}</Typography>
              </Grid>
            )}

            {patron.details && patron.details.length > 0 && (
              <Grid item xs={12}>
                <Typography variant="subtitle2" color="primary">Détails</Typography>
                <Typography variant="body1">{patron.details.join(', ')}</Typography>
              </Grid>
            )}

            {patron.taillesIndiquees && (
              <Grid item xs={12}>
                <Typography variant="subtitle2" color="primary">Tailles indiquées</Typography>
                <Typography variant="body1">{patron.taillesIndiquees}</Typography>
              </Grid>
            )}

            {(patron.formats?.projecteur || patron.formats?.a4 || patron.formats?.a0) && (
              <Grid item xs={12}>
                <Typography variant="subtitle2" color="primary">Formats</Typography>
                <Box display="flex" gap={1} mt={1}>
                  {patron.formats.projecteur && <Chip label="Projecteur" size="small" />}
                  {patron.formats.a4 && <Chip label="A4" size="small" />}
                  {patron.formats.a0 && <Chip label="A0" size="small" />}
                </Box>
              </Grid>
            )}

            {patron.notes && (
              <Grid item xs={12}>
                <Typography variant="subtitle2" color="primary">Notes</Typography>
                <Typography variant="body1">{patron.notes}</Typography>
              </Grid>
            )}

            {patron.lienShop && (
              <Grid item xs={12}>
                <Typography variant="subtitle2" color="primary">Lien boutique</Typography>
                <Typography
                  variant="body1"
                  component="a"
                  href={patron.lienShop}
                  target="_blank"
                  sx={{ color: 'primary.main' }}
                >
                  {patron.lienShop}
                </Typography>
              </Grid>
            )}

            {patron.imageTableauTailles && (
              <Grid item xs={12}>
                <Typography variant="subtitle2" color="primary">Tableau des tailles</Typography>
                <Box
                  component="img"
                  src={patron.imageTableauTailles}
                  alt="Tableau des tailles"
                  sx={{ maxWidth: '100%', cursor: 'zoom-in', mt: 1 }}
                  onClick={() => openLightbox(patron.imageTableauTailles)}
                />
              </Grid>
            )}

            {patron.imageSchemaTechnique && (
              <Grid item xs={12}>
                <Typography variant="subtitle2" color="primary">Schéma technique</Typography>
                <Box
                  component="img"
                  src={patron.imageSchemaTechnique}
                  alt="Schéma technique"
                  sx={{ maxWidth: '100%', cursor: 'zoom-in', mt: 1 }}
                  onClick={() => openLightbox(patron.imageSchemaTechnique)}
                />
              </Grid>
            )}
          </Grid>
        </DialogContent>

        <DialogActions sx={{ justifyContent: 'flex-end', p: 2 }}>
          <Button
            variant="contained"
            color="error"
            startIcon={<DeleteIcon />}
            onClick={handleDelete}
          >
            Supprimer
          </Button>
        </DialogActions>
      </Dialog>

      <Dialog
        open={lightboxOpen}
        onClose={() => setLightboxOpen(false)}
        maxWidth="lg"
        fullWidth
      >
        <Box
          component="img"
          src={lightboxImage}
          alt="Image agrandie"
          sx={{ width: '100%', height: 'auto' }}
          onClick={() => setLightboxOpen(false)}
        />
      </Dialog>
    </>
  );
}

export default PatronModal;
