import React, { useState } from 'react';
import { Grid, Card, CardContent, CardMedia, Typography, Chip, Box, CircularProgress, Checkbox, FormControlLabel, IconButton, Button, Dialog, DialogContent } from '@mui/material';
import AddIcon from '@mui/icons-material/Add';
import StraightenIcon from '@mui/icons-material/Straighten';
import FavoriteIcon from '@mui/icons-material/Favorite';
import FavoriteBorderIcon from '@mui/icons-material/FavoriteBorder';
import PatronFilters from './PatronFilters';
import PatronModal from './PatronModal';
import PatronForm from './PatronForm';
import { patronService } from '../services/api';

const LANGUE_DRAPEAUX = {
  'Français': { img: 'https://flagcdn.com/20x15/fr.png' },
  'Anglais':  { img: 'https://flagcdn.com/20x15/gb.png' },
  'Allemand': { img: 'https://flagcdn.com/20x15/de.png' },
  'Autre':    { emoji: '🌍' }
};

function PatronList({ patrons, loading, onDelete }) {
  const [filteredPatrons, setFilteredPatrons] = useState(patrons);
  const [selectedPatron, setSelectedPatron] = useState(null);
  const [modalOpen, setModalOpen] = useState(false);
  const [formOpen, setFormOpen] = useState(false);
  const [editingPatron, setEditingPatron] = useState(null);
  const savedScrollY = React.useRef(0);

  const handleOpenForm = (patron = null) => {
    savedScrollY.current = window.scrollY;
    setEditingPatron(patron);
    setFormOpen(true);
    setModalOpen(false);
  };

  const closeForm = () => {
    setFormOpen(false);
    setEditingPatron(null);
    requestAnimationFrame(() => window.scrollTo(0, savedScrollY.current));
  };

  const handleSaveForm = () => {
    closeForm();
    onDelete(); // recharge la liste
  };

  const toggleFavori = async (patron, e) => {
    e.stopPropagation();
    const newValue = !patron.favori;
    setFilteredPatrons(prev => {
      const updated = prev.map(p => p._id === patron._id ? { ...p, favori: newValue } : p);
      return [...updated].sort((a, b) => (b.favori ? 1 : 0) - (a.favori ? 1 : 0));
    });
    try {
      await patronService.setFavori(patron._id, newValue);
    } catch (error) {
      setFilteredPatrons(prev => {
        const reverted = prev.map(p => p._id === patron._id ? { ...p, favori: !newValue } : p);
        return [...reverted].sort((a, b) => (b.favori ? 1 : 0) - (a.favori ? 1 : 0));
      });
      console.error('Erreur mise à jour Favori:', error);
    }
  };

  const toggleComplet = async (patron, e) => {
    e.stopPropagation();
    const newValue = !patron.complet;
    setFilteredPatrons(prev => prev.map(p => p._id === patron._id ? { ...p, complet: newValue } : p));
    try {
      await patronService.setComplet(patron._id, newValue);
    } catch (error) {
      setFilteredPatrons(prev => prev.map(p => p._id === patron._id ? { ...p, complet: !newValue } : p));
      console.error('Erreur mise à jour Complet:', error);
    }
  };

  const sortWithFavoris = (list) =>
    [...list].sort((a, b) => (b.favori ? 1 : 0) - (a.favori ? 1 : 0));

  React.useEffect(() => {
    setFilteredPatrons(sortWithFavoris(patrons));
  }, [patrons]);

  const handleFilter = async (filters) => {
    try {
      const response = await patronService.search(filters);
      setFilteredPatrons(sortWithFavoris(response.data));
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

      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mt: 3, mb: 2 }}>
        <Typography variant="h6">
          {filteredPatrons.length} patron{filteredPatrons.length > 1 ? 's' : ''}
        </Typography>
        <Button
          variant="contained"
          startIcon={<AddIcon />}
          onClick={() => handleOpenForm(null)}
          sx={{ bgcolor: '#33658a', '&:hover': { bgcolor: '#1e4d6b' } }}
        >
          Ajouter un patron
        </Button>
      </Box>

      <Box sx={{
        display: 'grid',
        gridTemplateColumns: { xs: '1fr', sm: '1fr 1fr', md: '1fr 1fr 1fr 1fr' },
        gap: 3
      }}>
        {filteredPatrons.map((patron) => (
          <Card
            key={patron._id}
            onClick={() => handleCardClick(patron)}
            sx={{
                cursor: 'pointer',
                width: '100%',
                height: '100%',
                display: 'flex',
                flexDirection: 'column',
                overflow: 'hidden',
                bgcolor: '#ffddd2',
                border: patron.complet ? '2px solid #0cbaba' : '2px solid transparent',
                '&:hover': { boxShadow: 6, bgcolor: '#b2dfcc', color: 'inherit' }
              }}
            >
              <Box sx={{ height: 200, width: '100%', overflow: 'hidden', flexShrink: 0, position: 'relative' }}>
                {patron.imagePrincipale ? (
                  <CardMedia
                    component="img"
                    image={patron.imagePrincipale}
                    alt={patron.modele}
                    sx={{ width: '100%', height: '100%', objectFit: 'cover', display: 'block' }}
                  />
                ) : (
                  <Box sx={{ width: '100%', height: '100%', bgcolor: 'grey.100', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                    <Typography variant="body2" color="text.disabled">Pas d'image</Typography>
                  </Box>
                )}
                {patron.complet && (
                  <Box sx={{
                    position: 'absolute', top: 8, right: 8,
                    bgcolor: '#0cbaba', color: 'white',
                    borderRadius: '12px', px: 1.5, py: 0.5,
                    fontSize: '0.75rem', fontWeight: 700,
                    boxShadow: 2
                  }}>
                    ✓ Complet
                  </Box>
                )}
                <IconButton
                  onClick={e => toggleFavori(patron, e)}
                  size="small"
                  sx={{
                    position: 'absolute', top: 4, left: 4,
                    bgcolor: 'rgba(255,255,255,0.85)',
                    '&:hover': { bgcolor: 'rgba(255,255,255,1)' },
                    p: 0.5
                  }}
                >
                  {patron.favori
                    ? <FavoriteIcon sx={{ color: '#e85d75', fontSize: '1.3rem' }} />
                    : <FavoriteBorderIcon sx={{ color: '#e85d75', fontSize: '1.3rem' }} />
                  }
                </IconButton>
              </Box>
              <CardContent sx={{ flexGrow: 1 }}>

                {/* Ligne 1 : Marque | Drapeaux */}
                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 0.25 }}>
                  <Typography variant="body2" color="text.secondary" sx={{ fontWeight: 700, letterSpacing: '0.04em', textTransform: 'uppercase', fontSize: '0.75rem' }}>
                    {patron.marque}
                  </Typography>
                  <Box sx={{ display: 'flex', gap: 0.5, alignItems: 'center' }}>
                    {patron.langues?.map(lang => {
                      const flag = LANGUE_DRAPEAUX[lang];
                      if (!flag) return null;
                      return flag.img
                        ? <img key={lang} src={flag.img} alt={lang} title={lang} style={{ height: '15px', verticalAlign: 'middle', borderRadius: '2px' }} />
                        : <span key={lang} title={lang} style={{ fontSize: '1.1rem', lineHeight: 1 }}>{flag.emoji}</span>;
                    })}
                  </Box>
                </Box>

                {/* Ligne 2 : Modèle | Cousu */}
                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 0.25 }}>
                  <Typography variant="h6" sx={{ fontWeight: 800, fontSize: '1.15rem', lineHeight: 1.2, textShadow: '0 1px 2px rgba(0,0,0,0.10)' }}>
                    {patron.modele}
                  </Typography>
                  {patron.cousu && (
                    <Chip label="✂️" size="small" sx={{ bgcolor: '#e36397', color: 'white' }} title="Déjà cousu" />
                  )}
                </Box>
                {patron.details?.some(d => d.toLowerCase() === 'options multiples') && (
                  <Typography variant="body2" sx={{ color: '#e36397', fontWeight: 700, fontSize: '0.78rem', mb: 1 }}>
                    Options multiples
                  </Typography>
                )}

                {/* Ligne 3 : Type | Genre */}
                <Grid container spacing={1} sx={{ mb: 1 }}>
                  <Grid item xs={6}>
                    <Typography variant="body2" color="text.secondary">
                      {patron.types?.length > 0 ? patron.types.join(', ') : (patron.typeAccessoires?.join(', ') || patron.typeAccessoire || '')}
                    </Typography>
                  </Grid>
                  <Grid item xs={6}>
                    <Typography variant="body2" color="text.secondary">
                      {patron.genres?.join(', ')}
                    </Typography>
                  </Grid>
                </Grid>

                {/* Ligne 4 : Chips tissu | Tailles */}
                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 1 }}>
                  <Box sx={{ display: 'flex', gap: 0.5, flexWrap: 'wrap' }}>
                    {patron.tissuTypes?.includes('Chaîne et trame') && (
                      <Chip label="Chaîne et trame" size="small" color="primary" />
                    )}
                    {patron.tissuTypes?.includes('Maille') && (
                      <Chip label="Maille" size="small" sx={{ bgcolor: '#0cbaba', color: 'white' }} />
                    )}
                  </Box>
                  <Typography variant="body2" color="text.secondary" sx={{ textAlign: 'right' }}>
                    {getTaillesRange(patron.taillesDisponibles) || getTaillesRange(patron.taillesEnfant) || patron.dimensions || ''}
                  </Typography>
                </Box>

                {/* Ligne 5 : Métrage */}
                {(patron.metrageMin || patron.metrageMax) && (
                  <Box sx={{ mb: 1, display: 'flex', justifyContent: 'center' }}>
                    <Chip
                      icon={<StraightenIcon sx={{ color: 'white !important' }} />}
                      label={getMetrageRange(patron.metrageMin, patron.metrageMax)}
                      size="small"
                      sx={{ fontSize: '0.75rem', bgcolor: '#33658a', color: 'white', width: '100%', justifyContent: 'center' }}
                    />
                  </Box>
                )}

                {/* Ligne 6 : Formats */}
                {(patron.formats?.projecteur || patron.formats?.a4 || patron.formats?.a0) && (
                  <Box sx={{ display: 'flex', gap: 0.5, flexWrap: 'wrap', mb: 1, justifyContent: 'center' }}>
                    {patron.formats?.projecteur && <Chip label="Projecteur" size="small" sx={{ bgcolor: '#e36397', color: 'white', flex: 1 }} />}
                    {patron.formats?.a4 && <Chip label="A4" size="small" sx={{ bgcolor: '#e36397', color: 'white', flex: 1 }} />}
                    {patron.formats?.a0 && <Chip label="A0" size="small" sx={{ bgcolor: '#e36397', color: 'white', flex: 1 }} />}
                  </Box>
                )}

                {/* Complet */}
                <Box sx={{ mt: 'auto', pt: 1, borderTop: '1px solid #eee' }} onClick={e => e.stopPropagation()}>
                  <FormControlLabel
                    control={
                      <Checkbox
                        checked={patron.complet || false}
                        onChange={e => toggleComplet(patron, e)}
                        size="small"
                        sx={{ color: '#0cbaba', '&.Mui-checked': { color: '#0cbaba' } }}
                      />
                    }
                    label={<span style={{ fontSize: '0.8rem', color: '#0cbaba', fontWeight: 600 }}>Complet</span>}
                  />
                </Box>

              </CardContent>
            </Card>
        ))}
      </Box>

      {selectedPatron && (
        <PatronModal
          open={modalOpen}
          patron={selectedPatron}
          onClose={handleCloseModal}
          onEdit={handleOpenForm}
          onDelete={() => { onDelete(); handleCloseModal(); }}
        />
      )}

      <Dialog open={formOpen} onClose={() => {}} disableEscapeKeyDown disableRestoreFocus maxWidth="lg" fullWidth>
        <DialogContent sx={{ p: 0 }}>
          <PatronForm
            patron={editingPatron}
            onSave={handleSaveForm}
            onCancel={closeForm}
            onDelete={handleSaveForm}
          />
        </DialogContent>
      </Dialog>
    </Box>
  );
}

export default PatronList;
