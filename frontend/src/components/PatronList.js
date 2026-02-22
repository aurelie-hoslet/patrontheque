import React, { useState } from 'react';
import { Grid, Card, CardContent, CardMedia, Typography, Chip, Box, CircularProgress } from '@mui/material';
import PatronFilters from './PatronFilters';
import PatronModal from './PatronModal';
import { patronService } from '../services/api';

function PatronList({ patrons, loading, onEdit, onDelete }) {
  const [filteredPatrons, setFilteredPatrons] = useState(patrons);
  const [selectedPatron, setSelectedPatron] = useState(null);
  const [modalOpen, setModalOpen] = useState(false);

  React.useEffect(() => {
    setFilteredPatrons(patrons);
  }, [patrons]);

  const handleFilter = async (filters) => {
    try {
      const response = await patronService.search(filters);
      setFilteredPatrons(response.data);
    } catch (error) {
      console.error('Erreur filtrage:', error);
    }
  };

  const handleCardClick = (patron) => {
    setSelectedPatron(patron);
    setModalOpen(true);
  };

  const handleCloseModal = () => {
    setModalOpen(false);
    setSelectedPatron(null);
  };

  if (loading) {
    return <Box display="flex" justifyContent="center" p={4}><CircularProgress /></Box>;
  }

  const getTaillesRange = (tailles) => {
    if (!tailles || tailles.length === 0) return '';
    if (tailles.length === 1) return tailles[0];
    return `${tailles[0]} - ${tailles[tailles.length - 1]}`;
  };

  const getMetrageRange = (min, max) => {
    if (!min && !max) return '';
    if (min && max) return `${min} à ${max}m`;
    if (min) return `${min}m+`;
    if (max) return `jusqu'à ${max}m`;
  };

  return (
    <Box>
      <PatronFilters onFilter={handleFilter} />

      <Typography variant="h6" sx={{ mt: 3, mb: 2 }}>
        {filteredPatrons.length} patron{filteredPatrons.length > 1 ? 's' : ''}
      </Typography>

      <Grid container spacing={3}>
        {filteredPatrons.map((patron) => (
          <Grid item xs={12} sm={6} md={4} lg={3} key={patron._id}>
            <Card
              onClick={() => handleCardClick(patron)}
              sx={{
                cursor: 'pointer',
                '&:hover': { boxShadow: 6 }
              }}
            >
              {patron.imagePrincipale && (
                <CardMedia
                  component="img"
                  height="200"
                  image={patron.imagePrincipale}
                  alt={patron.modele}
                />
              )}
              <CardContent>
                <Typography variant="h6" gutterBottom>
                  {patron.marque} - {patron.modele}
                </Typography>

                <Grid container spacing={1} sx={{ mb: 1 }}>
                  <Grid item xs={6}>
                    <Typography variant="body2" color="text.secondary">
                      <strong>Genre:</strong> {patron.genres?.join(', ')}
                    </Typography>
                  </Grid>
                  <Grid item xs={6}>
                    <Typography variant="body2" color="text.secondary">
                      <strong>Type:</strong> {patron.types?.join(', ')}
                    </Typography>
                  </Grid>
                </Grid>

                {patron.manches && patron.manches.length > 0 && (
                  <Typography variant="body2" color="text.secondary">
                    <strong>Manches:</strong> {patron.manches.join(', ')}
                  </Typography>
                )}

                {patron.longueurs && patron.longueurs.length > 0 && (
                  <Typography variant="body2" color="text.secondary">
                    <strong>Longueur:</strong> {patron.longueurs.join(', ')}
                  </Typography>
                )}

                {patron.tissuSpecifique && patron.tissuSpecifique.length > 0 && (
                  <Typography variant="body2" color="text.secondary">
                    <strong>Spécificité:</strong> {patron.tissuSpecifique.join(', ')}
                  </Typography>
                )}

                {patron.details && patron.details.length > 0 && (
                  <Typography variant="body2" color="text.secondary">
                    <strong>Détails:</strong> {patron.details.join(', ')}
                  </Typography>
                )}

                <Grid container spacing={1} sx={{ mt: 1 }}>
                  <Grid item xs={6}>
                    <Typography variant="body2" color="text.secondary">
                      <strong>Tailles:</strong> {getTaillesRange(patron.taillesDisponibles)}
                    </Typography>
                  </Grid>
                  <Grid item xs={6}>
                    <Typography variant="body2" color="text.secondary">
                      <strong>Métrage:</strong> {getMetrageRange(patron.metrageMin, patron.metrageMax)}
                    </Typography>
                  </Grid>
                </Grid>

                <Box sx={{ mt: 2, display: 'flex', gap: 1, flexWrap: 'wrap' }}>
                  {patron.tissuTypes?.includes('Chaîne et trame') && (
                    <Chip label="Chaîne et trame" size="small" color="primary" />
                  )}
                  {patron.tissuTypes?.includes('Maille') && (
                    <Chip label="Maille" size="small" color="secondary" />
                  )}
                  {patron.cousu && (
                    <Chip label="✂️ Déjà cousu" size="small" color="success" />
                  )}
                </Box>
              </CardContent>
            </Card>
          </Grid>
        ))}
      </Grid>

      {selectedPatron && (
        <PatronModal
          open={modalOpen}
          patron={selectedPatron}
          onClose={handleCloseModal}
          onEdit={onEdit}
          onDelete={() => {
            onDelete();
            handleCloseModal();
          }}
        />
      )}
    </Box>
  );
}

export default PatronList;