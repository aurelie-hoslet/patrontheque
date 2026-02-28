import React, { useState, useRef } from 'react';
import { Box, Typography, Card, CardContent, CardMedia, Chip, IconButton } from '@mui/material';
import FavoriteIcon from '@mui/icons-material/Favorite';
import FavoriteBorderIcon from '@mui/icons-material/FavoriteBorder';
import StraightenIcon from '@mui/icons-material/Straighten';
import PatronModal from './PatronModal';
import { patronService } from '../services/api';

const LANGUE_DRAPEAUX = {
  'Français': { img: 'https://flagcdn.com/20x15/fr.png' },
  'Anglais':  { img: 'https://flagcdn.com/20x15/gb.png' },
  'Allemand': { img: 'https://flagcdn.com/20x15/de.png' },
  'Autre':    { emoji: '🌍' }
};

function HomePage({ patrons, tissus = [], projets = [], onEdit, onDelete, onBrowse }) {
  const [selectedPatron, setSelectedPatron] = useState(null);
  const [modalOpen, setModalOpen] = useState(false);
  const [localPatrons, setLocalPatrons] = useState(patrons);
  const [suggestions, setSuggestions] = useState([]);
  const suggestionsSet = useRef(false);

  React.useEffect(() => {
    setLocalPatrons(patrons);
    if (!suggestionsSet.current && patrons.length > 0) {
      const shuffled = [...patrons].sort(() => Math.random() - 0.5);
      setSuggestions(shuffled.slice(0, 4));
      suggestionsSet.current = true;
    }
  }, [patrons]);

  const toggleFavori = async (patron, e) => {
    e.stopPropagation();
    const newValue = !patron.favori;
    const update = (list) => list.map(p => p._id === patron._id ? { ...p, favori: newValue } : p);
    setLocalPatrons(prev => update(prev));
    setSuggestions(prev => update(prev));
    try {
      await patronService.setFavori(patron._id, newValue);
    } catch (error) {
      const revert = (list) => list.map(p => p._id === patron._id ? { ...p, favori: !newValue } : p);
      setLocalPatrons(prev => revert(prev));
      setSuggestions(prev => revert(prev));
      console.error('Erreur mise à jour Favori:', error);
    }
  };

  const getMetrageRange = (min, max) => {
    if (!min && !max) return '';
    if (min && max) return `${min} à ${max}m`;
    if (min) return `${min}m+`;
    if (max) return `jusqu'à ${max}m`;
  };

  const getTaillesRange = (tailles) => {
    if (!tailles || tailles.length === 0) return '';
    if (tailles.length === 1) return tailles[0];
    return `${tailles[0]} - ${tailles[tailles.length - 1]}`;
  };

  return (
    <Box>
      {/* Bandeau de bienvenue */}
      <Box sx={{
        background: 'linear-gradient(135deg, #33658a 0%, #0cbaba 100%)',
        borderRadius: 3,
        p: { xs: 3, md: 5 },
        mb: 5,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        gap: 3,
        boxShadow: '0 8px 32px rgba(51,101,138,0.25)',
        overflow: 'hidden',
        position: 'relative',
      }}>
        {/* Cercles décoratifs */}
        <Box sx={{ position: 'absolute', top: -40, right: -40, width: 160, height: 160, borderRadius: '50%', bgcolor: 'rgba(255,255,255,0.08)' }} />
        <Box sx={{ position: 'absolute', bottom: -30, right: 80, width: 100, height: 100, borderRadius: '50%', bgcolor: 'rgba(255,255,255,0.06)' }} />

        <Box sx={{ position: 'relative', zIndex: 1 }}>
          <Typography variant="h4" sx={{ color: 'white', fontWeight: 800, mb: 1, textShadow: '0 2px 8px rgba(0,0,0,0.2)' }}>
            Bienvenue dans Sewing Box 🧵
          </Typography>
        </Box>
      </Box>

      {/* Fun facts */}
      {false && (() => {
        const avecMetrage = patrons.filter(p => p.metrageMin);
        const totalMetrage = avecMetrage.reduce((sum, p) => sum + p.metrageMin, 0);
        const jamaiscousu = patrons.filter(p => !p.cousu).length;
        const pourcentCousu = patrons.length > 0 ? Math.round((patrons.filter(p => p.cousu).length / patrons.length) * 100) : 0;
        const marqueCounts = patrons.reduce((acc, p) => { if (p.marque) acc[p.marque] = (acc[p.marque] || 0) + 1; return acc; }, {});
        const marquestar = Object.entries(marqueCounts).sort((a, b) => b[1] - a[1])[0];
        const typeCounts = patrons.reduce((acc, p) => { (p.types || []).forEach(t => { acc[t] = (acc[t] || 0) + 1; }); return acc; }, {});
        const typeStar = Object.entries(typeCounts).sort((a, b) => b[1] - a[1])[0];
        const stockMetrage = tissus.reduce((sum, t) => sum + (t.quantite || 0), 0);
        const projetsTermines = projets.filter(p => p.statut === 'Terminé').length;
        const avecManches = patrons.filter(p => p.manches && p.manches.length > 0 && !p.manches.every(m => m === 'Sans manches')).length;

        const cards = [
          totalMetrage > 0 && {
            emoji: '📏',
            titre: 'Si tu cousais tout...',
            valeur: `~${totalMetrage} m de tissu`,
            detail: totalMetrage >= 105
              ? `soit ${(totalMetrage / 105).toFixed(1)} terrains de foot 🏟️`
              : `soit ${(totalMetrage / 50).toFixed(1)} longueurs de piscine 🏊`,
            color: '#33658a',
          },
          jamaiscousu > 0 && {
            emoji: '😴',
            titre: 'Encore jamais cousus',
            valeur: `${jamaiscousu} patron${jamaiscousu > 1 ? 's' : ''}`,
            detail: `${pourcentCousu}% de ta collection a été cousu`,
            color: '#e36397',
          },
          marquestar && {
            emoji: '🏆',
            titre: 'Marque star',
            valeur: marquestar[0],
            detail: `${marquestar[1]} patron${marquestar[1] > 1 ? 's' : ''} dans ta collection`,
            color: '#0cbaba',
          },
          typeStar && {
            emoji: '👗',
            titre: 'Type préféré',
            valeur: typeStar[0],
            detail: `${typeStar[1]} patron${typeStar[1] > 1 ? 's' : ''} de ce type`,
            color: '#e36397',
          },
          avecManches > 0 && {
            emoji: '🧥',
            titre: 'Avec des manches',
            valeur: `${avecManches} patron${avecManches > 1 ? 's' : ''}`,
            detail: `soit ${avecManches * 2} manches à coudre si tout cousu ! ✂️`,
            color: '#33658a',
          },
          stockMetrage > 0 && {
            emoji: '🧵',
            titre: 'Tissu en stock',
            valeur: `${stockMetrage} m`,
            detail: `dans ${tissus.length} tissu${tissus.length > 1 ? 's' : ''} différent${tissus.length > 1 ? 's' : ''}`,
            color: '#0cbaba',
          },
          projetsTermines > 0 && {
            emoji: '🎉',
            titre: 'Projets terminés',
            valeur: `${projetsTermines} projet${projetsTermines > 1 ? 's' : ''}`,
            detail: projetsTermines >= 10 ? 'Tu es une machine ! 🚀' : projetsTermines >= 5 ? 'Belle progression ! 👏' : 'C\'est un début ! 💪',
            color: '#e36397',
          },
        ].filter(Boolean);

        if (cards.length === 0) return null;
        return (
          <Box sx={{ mb: 4 }}>
            <Typography variant="h6" sx={{ mb: 2, fontWeight: 700 }}>🎲 Le saviez-vous ?</Typography>
            <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr 1fr', sm: '1fr 1fr 1fr', md: 'repeat(4, 1fr)' }, gap: 2 }}>
              {cards.map((card, i) => (
                <Box key={i} sx={{ p: 2.5, bgcolor: '#ffddd2', borderRadius: 2, border: `2px solid ${card.color}20`, textAlign: 'center', borderTop: `4px solid ${card.color}` }}>
                  <Typography sx={{ fontSize: '2rem', lineHeight: 1, mb: 0.5 }}>{card.emoji}</Typography>
                  <Typography variant="body2" sx={{ color: 'text.secondary', fontSize: '0.75rem', fontWeight: 600, textTransform: 'uppercase', mb: 0.5 }}>{card.titre}</Typography>
                  <Typography variant="h6" sx={{ fontWeight: 800, color: card.color, fontSize: '1.1rem', lineHeight: 1.2, mb: 0.5 }}>{card.valeur}</Typography>
                  <Typography variant="body2" sx={{ fontSize: '0.75rem', color: 'text.secondary' }}>{card.detail}</Typography>
                </Box>
              ))}
            </Box>
          </Box>
        );
      })()}

      {/* Section Suggestions */}

      {suggestions.length === 0 ? (
        <Box sx={{ textAlign: 'center', py: 6, color: 'text.secondary' }}>
          <Typography variant="body1">Chargement des suggestions...</Typography>
        </Box>
      ) : (
        <>
          <Typography variant="h6" sx={{ mb: 2, fontWeight: 700 }}>
            ✨ Suggestions du jour
          </Typography>
          <Box sx={{
            display: 'grid',
            gridTemplateColumns: { xs: '1fr', sm: '1fr 1fr', md: '1fr 1fr 1fr 1fr' },
            gap: 3
          }}>
            {suggestions.map((patron) => (
              <Card
                key={patron._id}
                onClick={() => { setSelectedPatron(patron); setModalOpen(true); }}
                sx={{
                  cursor: 'pointer',
                  width: '100%',
                  height: '100%',
                  display: 'flex',
                  flexDirection: 'column',
                  overflow: 'hidden',
                  bgcolor: '#ffddd2',
                  border: patron.complet ? '2px solid #0cbaba' : '2px solid transparent',
                  '&:hover': { boxShadow: 6, bgcolor: '#e85d75', color: 'white' }
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
                      fontSize: '0.75rem', fontWeight: 700, boxShadow: 2
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

                  <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 0.25 }}>
                    <Typography variant="h6" sx={{ fontWeight: 800, fontSize: '1.15rem', lineHeight: 1.2 }}>
                      {patron.modele}
                    </Typography>
                    {patron.cousu && (
                      <Chip label="✂️" size="small" sx={{ bgcolor: '#e36397', color: 'white' }} title="Déjà cousu" />
                    )}
                  </Box>

                  <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 1 }}>
                    <Box sx={{ display: 'flex', gap: 0.5, flexWrap: 'wrap' }}>
                      {patron.tissuTypes?.includes('Chaîne et trame') && <Chip label="Chaîne et trame" size="small" color="primary" />}
                      {patron.tissuTypes?.includes('Maille') && <Chip label="Maille" size="small" sx={{ bgcolor: '#0cbaba', color: 'white' }} />}
                    </Box>
                    <Typography variant="body2" color="text.secondary" sx={{ textAlign: 'right' }}>
                      {getTaillesRange(patron.taillesDisponibles) || getTaillesRange(patron.taillesEnfant) || patron.dimensions || ''}
                    </Typography>
                  </Box>

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
                </CardContent>
              </Card>
            ))}
          </Box>
        </>
      )}

      {selectedPatron && (
        <PatronModal
          open={modalOpen}
          patron={selectedPatron}
          onClose={() => { setModalOpen(false); setSelectedPatron(null); }}
          onEdit={onEdit}
          onDelete={() => { onDelete(); setModalOpen(false); setSelectedPatron(null); }}
        />
      )}
    </Box>
  );
}

export default HomePage;
