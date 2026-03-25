import React, { useState } from 'react';
import {
  Paper, CardMedia, Typography, Chip, Box, CircularProgress,
  IconButton, Button, Dialog, DialogContent, Tooltip, Fab
} from '@mui/material';
import { Plus, Ruler, Heart, Scissors, ChevronUp, X, Shuffle } from 'lucide-react';
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

function PatronList({ patrons, loading, onDelete, matchTissu, onClearMatch }) {
  const [filteredPatrons, setFilteredPatrons] = useState(patrons);
  const [selectedPatron, setSelectedPatron] = useState(null);
  const [modalOpen, setModalOpen] = useState(false);
  const [formOpen, setFormOpen] = useState(false);
  const [editingPatron, setEditingPatron] = useState(null);
  const [showScrollTop, setShowScrollTop] = useState(false);

  React.useEffect(() => {
    const handleScroll = () => setShowScrollTop(window.scrollY > 300);
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const handleOpenForm = (patron = null) => {
    // Ne pas écraser la position si on vient de la modale (déjà sauvegardée)
    if (!modalOpen) savedScrollY.current = window.scrollY;
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
    onDelete();
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

  const savedScrollY = React.useRef(0);

  const handleCardClick = (patron) => {
    savedScrollY.current = window.scrollY;
    setSelectedPatron(patron);
    setModalOpen(true);
  };

  const handleCloseModal = () => {
    setModalOpen(false);
    setSelectedPatron(null);
    requestAnimationFrame(() => window.scrollTo(0, savedScrollY.current));
  };

  if (loading) {
    return <Box display="flex" justifyContent="center" p={4}><CircularProgress /></Box>;
  }

  const getTaillesRange = (tailles) => {
    if (!tailles || tailles.length === 0) return '';
    if (tailles.length === 1) return tailles[0];
    return `${tailles[0]} – ${tailles[tailles.length - 1]}`;
  };

  const getMetrageRange = (min, max) => {
    if (!min && !max) return '';
    if (min && max) return `${min} à ${max}m`;
    if (min) return `${min}m+`;
    if (max) return `jusqu'à ${max}m`;
  };

  return (
    <Box>
      {/* Header */}
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 4 }}>
        <Typography variant="h4" sx={{ fontWeight: 900 }}>Les Patrons</Typography>
        <Button variant="contained" startIcon={<Plus size={18} />} onClick={() => handleOpenForm(null)}
          sx={{ bgcolor: '#e36397', '&:hover': { bgcolor: '#c9547f' }, fontWeight: 700, borderRadius: 2 }}>
          Ajouter un patron
        </Button>
      </Box>

      {matchTissu && (
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5, mb: 2, px: 2, py: 1.25, bgcolor: 'rgba(227,99,151,0.08)', borderRadius: 2, border: '1.5px solid rgba(227,99,151,0.3)' }}>
          <Shuffle size={16} color="#e36397" strokeWidth={2} />
          <Typography variant="body2" sx={{ fontWeight: 700, color: '#e36397', flex: 1 }}>
            Filtré pour : <strong>{matchTissu.nom}</strong>
            {matchTissu.quantite != null ? ` — ${matchTissu.quantite} m disponibles` : ''}
            {matchTissu.type ? ` · ${matchTissu.type}` : ''}
          </Typography>
          <IconButton size="small" onClick={onClearMatch} sx={{ color: '#e36397', p: 0.5 }}>
            <X size={16} />
          </IconButton>
        </Box>
      )}

      <PatronFilters onFilter={handleFilter} matchTissu={matchTissu} onClearMatch={onClearMatch} />

      <Box sx={{ mt: 3, mb: 2 }}>
        <Typography variant="body2" color="text.secondary" sx={{ fontWeight: 600 }}>
          {filteredPatrons.length} patron{filteredPatrons.length > 1 ? 's' : ''}
        </Typography>
      </Box>

      {filteredPatrons.length === 0 ? (
        <Box sx={{ border: '2px dashed rgba(26,19,10,0.1)', borderRadius: 4, p: 8, textAlign: 'center', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 2.5 }}>
          <Scissors size={60} strokeWidth={1} color="#ddd" />
          <Box>
            <Typography variant="h6" sx={{ fontWeight: 800, mb: 0.5 }}>Aucun patron trouvé</Typography>
            <Typography variant="body2" color="text.secondary">Modifiez vos filtres ou ajoutez un nouveau patron.</Typography>
          </Box>
          <Button variant="contained" startIcon={<Plus size={18} />} onClick={() => handleOpenForm(null)}
            sx={{ bgcolor: '#e36397', '&:hover': { bgcolor: '#c9547f' }, fontWeight: 700, borderRadius: 2 }}>
            Ajouter un patron
          </Button>
        </Box>
      ) : (
        <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr 1fr', sm: '1fr 1fr 1fr', md: '1fr 1fr 1fr 1fr' }, gap: 2 }}>
          {filteredPatrons.map((patron) => (
            <Paper
              key={patron._id}
              onClick={() => handleCardClick(patron)}
              elevation={0}
              sx={{
                cursor: 'pointer',
                display: 'flex',
                flexDirection: 'column',
                overflow: 'hidden',
                border: patron.favori
                  ? '1.5px solid #e36397'
                  : '1.5px solid rgba(26,19,10,0.07)',
                borderRadius: 3,
                transition: 'all 0.15s',
                '&:hover': { boxShadow: '0 6px 20px rgba(227,99,151,0.18)', transform: 'translateY(-2px)', borderColor: '#e36397' }
              }}
            >
              {/* Image */}
              <Box sx={{ height: 190, width: '100%', overflow: 'hidden', flexShrink: 0, position: 'relative' }}>
                {patron.imagePrincipale ? (
                  <CardMedia
                    component="img"
                    image={patron.imagePrincipale}
                    alt={patron.modele}
                    sx={{ width: '100%', height: '100%', objectFit: 'cover', transition: 'transform 0.2s', '&:hover': { transform: 'scale(1.03)' } }}
                  />
                ) : (
                  <Box sx={{ width: '100%', height: '100%', bgcolor: 'rgba(227,99,151,0.06)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                    <Scissors size={36} color="#e36397" strokeWidth={1} style={{ opacity: 0.3 }} />
                  </Box>
                )}

                {/* Bouton favori */}
                <Tooltip title={patron.favori ? 'Retirer des favoris' : 'Ajouter aux favoris'}>
                  <IconButton
                    onClick={e => toggleFavori(patron, e)}
                    size="small"
                    sx={{
                      position: 'absolute', top: 6, left: 6,
                      bgcolor: 'rgba(255,255,255,0.88)',
                      '&:hover': { bgcolor: 'white' },
                      p: 0.5
                    }}
                  >
                    <Heart
                      size={16}
                      color="#e85d75"
                      fill={patron.favori ? '#e85d75' : 'none'}
                    />
                  </IconButton>
                </Tooltip>
              </Box>

              {/* Header carte */}
              <Box sx={{ px: 1.5, pt: 1.25, pb: 0.5, borderBottom: '1px solid rgba(26,19,10,0.05)', bgcolor: 'rgba(0,0,0,0.015)' }}>
                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <Typography variant="body2" color="text.secondary" sx={{ fontWeight: 700, letterSpacing: '0.04em', textTransform: 'uppercase', fontSize: '0.68rem' }}>
                    {patron.marque}
                  </Typography>
                  <Box sx={{ display: 'flex', gap: 0.5, alignItems: 'center' }}>
                    {patron.langues?.map(lang => {
                      const flag = LANGUE_DRAPEAUX[lang];
                      if (!flag) return null;
                      return flag.img
                        ? <img key={lang} src={flag.img} alt={lang} title={lang} style={{ height: '13px', verticalAlign: 'middle', borderRadius: '2px' }} />
                        : <span key={lang} title={lang} style={{ fontSize: '1rem', lineHeight: 1 }}>{flag.emoji}</span>;
                    })}
                  </Box>
                </Box>
                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <Typography sx={{ fontWeight: 800, fontSize: '0.95rem', lineHeight: 1.2 }}>
                    {patron.modele}
                  </Typography>
                  {patron.cousu && (
                    <Tooltip title="Déjà cousu">
                      <Box sx={{ display: 'flex', alignItems: 'center' }}>
                        <Scissors size={14} color="#e36397" strokeWidth={2.5} />
                      </Box>
                    </Tooltip>
                  )}
                </Box>
                {patron.details?.some(d => d.toLowerCase() === 'options multiples') && (
                  <Typography variant="body2" sx={{ color: '#e36397', fontWeight: 700, fontSize: '0.72rem' }}>
                    Options multiples
                  </Typography>
                )}
              </Box>

              {/* Body carte */}
              <Box sx={{ px: 1.5, py: 1, flex: 1, display: 'flex', flexDirection: 'column', gap: 0.5 }}>
                {/* Type + Genre */}
                <Typography variant="body2" color="text.secondary" sx={{ fontSize: '0.78rem' }}>
                  {[
                    patron.types?.length > 0 ? patron.types.join(', ') : (patron.typeAccessoires?.join(', ') || patron.typeAccessoire || ''),
                    patron.genres?.join(', ')
                  ].filter(Boolean).join(' · ')}
                </Typography>

                {/* Tailles */}
                {(patron.taillesDisponibles?.length > 0 || patron.taillesEnfant?.length > 0 || patron.dimensions) && (
                  <Typography variant="body2" color="text.secondary" sx={{ fontSize: '0.78rem' }}>
                    {getTaillesRange(patron.taillesDisponibles) || getTaillesRange(patron.taillesEnfant) || patron.dimensions}
                  </Typography>
                )}

                {/* Type tissu chips */}
                {patron.tissuTypes?.length > 0 && (
                  <Box sx={{ display: 'flex', gap: 0.5, flexWrap: 'wrap' }}>
                    {patron.tissuTypes.includes('Chaîne et trame') && (
                      <Chip label="Chaîne et trame" size="small" sx={{ bgcolor: '#e3eef7', color: '#33658a', fontWeight: 700, fontSize: '0.65rem', height: 18 }} />
                    )}
                    {patron.tissuTypes.includes('Maille') && (
                      <Chip label="Maille" size="small" sx={{ bgcolor: '#e0f7f7', color: '#0cbaba', fontWeight: 700, fontSize: '0.65rem', height: 18 }} />
                    )}
                  </Box>
                )}

                {/* Métrage */}
                {(patron.metrageMin || patron.metrageMax) && (
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                    <Ruler size={12} color="#33658a" strokeWidth={2} />
                    <Typography variant="body2" sx={{ fontSize: '0.78rem', color: '#33658a', fontWeight: 700 }}>
                      {getMetrageRange(patron.metrageMin, patron.metrageMax)}
                    </Typography>
                  </Box>
                )}

                {/* Formats */}
                {(patron.formats?.projecteur || patron.formats?.a4 || patron.formats?.a0) && (
                  <Box sx={{ display: 'flex', gap: 0.5, flexWrap: 'wrap' }}>
                    {patron.formats?.projecteur && <Chip label="Proj." size="small" sx={{ bgcolor: '#fce4ec', color: '#e36397', fontWeight: 700, fontSize: '0.65rem', height: 18 }} />}
                    {patron.formats?.a4 && <Chip label="A4" size="small" sx={{ bgcolor: '#fce4ec', color: '#e36397', fontWeight: 700, fontSize: '0.65rem', height: 18 }} />}
                    {patron.formats?.a0 && <Chip label="A0" size="small" sx={{ bgcolor: '#fce4ec', color: '#e36397', fontWeight: 700, fontSize: '0.65rem', height: 18 }} />}
                  </Box>
                )}

              </Box>
            </Paper>
          ))}
        </Box>
      )}

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

      {showScrollTop && (
        <Fab
          size="small"
          onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
          sx={{
            position: 'fixed',
            bottom: 32,
            right: 32,
            bgcolor: '#e36397',
            color: 'white',
            '&:hover': { bgcolor: '#c9547f' },
            boxShadow: '0 4px 14px rgba(227,99,151,0.4)',
            zIndex: 1000,
          }}
        >
          <ChevronUp size={20} />
        </Fab>
      )}
    </Box>
  );
}

export default PatronList;
