import React, { useState, useEffect } from 'react';
import { createPortal } from 'react-dom';
import {
  Box, Paper, CardMedia, Typography, Chip,
  CircularProgress, Dialog, DialogTitle, DialogContent, DialogActions,
  Button, IconButton, Tooltip
} from '@mui/material';
import { Layers, Plus, Pencil, Trash2, X, Shuffle, Scissors } from 'lucide-react';
import { tissuService, patronService, historiqueService } from '../services/api';
import TissuForm from './TissuForm';
import PatronModal from './PatronModal';
import FloatingPatronCard from './FloatingPatronCard';

const COULEURS_MAP = {
  rouge: '#e53935', bleu: '#1e88e5', vert: '#43a047', jaune: '#fdd835',
  noir: '#212121', blanc: '#f0f0f0', orange: '#fb8c00', rose: '#e91e8c',
  violet: '#8e24aa', marron: '#6d4c41', gris: '#757575', beige: '#d4b896',
};

function TissuList({ tissus, loading, onRefresh, onMatchTissu }) {
  const [editingTissu, setEditingTissu] = useState(null);
  const [formOpen, setFormOpen] = useState(false);
  const [detailTissu, setDetailTissu] = useState(null);
  const [deleteTarget, setDeleteTarget] = useState(null);
  const [linkedPatron, setLinkedPatron] = useState(null);
  const [linkedPatronOpen, setLinkedPatronOpen] = useState(false);
  const [matchingPatrons, setMatchingPatrons] = useState(null);
  const [floatingPatrons, setFloatingPatrons] = useState([]);
  const [topZ, setTopZ] = useState(1500);

  useEffect(() => {
    if (detailTissu?._id) {
      historiqueService.track({
        id: detailTissu._id,
        type: 'tissu',
        nom: detailTissu.nom,
        image: detailTissu.image || null,
      }).catch(() => {});
    }
  }, [detailTissu?._id]);

  useEffect(() => {
    if (!detailTissu?.typeTissu) { setMatchingPatrons([]); return; }
    setMatchingPatrons(null);
    setFloatingPatrons([]);
    patronService.getAll()
      .then(res => setMatchingPatrons(res.data.filter(p => p.tissusConseilles?.includes(detailTissu.typeTissu))))
      .catch(() => setMatchingPatrons([]));
  }, [detailTissu?._id]);

  const openFloatingPatron = (patron) => {
    const already = floatingPatrons.find(f => f.patron._id === patron._id);
    const nextZ = topZ + 1;
    setTopZ(nextZ);
    if (already) {
      setFloatingPatrons(prev => prev.map(f => f.patron._id === patron._id ? { ...f, zIndex: nextZ } : f));
      return;
    }
    const offset = floatingPatrons.length * 28;
    setFloatingPatrons(prev => [...prev, {
      id: patron._id,
      patron,
      x: Math.min(window.innerWidth / 2 - 132 + offset, window.innerWidth - 280),
      y: Math.max(80 + offset, 60),
      zIndex: nextZ,
    }]);
  };

  const closeFloatingPatron = (id) => setFloatingPatrons(prev => prev.filter(f => f.id !== id));

  const bringToFront = (id) => {
    const nextZ = topZ + 1;
    setTopZ(nextZ);
    setFloatingPatrons(prev => prev.map(f => f.id === id ? { ...f, zIndex: nextZ } : f));
  };

  const moveFloatingPatron = (id, x, y) => {
    setFloatingPatrons(prev => prev.map(f => f.id === id ? { ...f, x, y } : f));
  };

  const handleOpenLinkedPatron = async (patronId) => {
    try {
      const res = await patronService.getById(patronId);
      setLinkedPatron(res.data);
      setLinkedPatronOpen(true);
    } catch (err) {
      console.error('Erreur chargement patron lié:', err);
    }
  };

  const handleOpenForm = (tissu = null) => {
    setEditingTissu(tissu);
    setDetailTissu(null);
    setFormOpen(true);
  };

  const handleDelete = async () => {
    if (!deleteTarget) return;
    try {
      await tissuService.delete(deleteTarget._id);
      setDeleteTarget(null);
      setDetailTissu(null);
      onRefresh();
    } catch (error) {
      console.error('Erreur suppression tissu:', error);
    }
  };

  const handleSave = () => {
    setFormOpen(false);
    setEditingTissu(null);
    setDetailTissu(null);
    onRefresh();
  };

  if (loading) return <Box display="flex" justifyContent="center" p={4}><CircularProgress /></Box>;

  return (
    <Box>
      {/* Header */}
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 4 }}>
        <Box sx={{ display: 'flex', alignItems: 'baseline', gap: 2 }}>
          <Typography variant="h4" sx={{ fontWeight: 900 }}>
            Les Tissus
          </Typography>
          <Typography sx={{ fontWeight: 700, color: '#0cbaba', fontSize: '1.1rem' }}>
            {tissus.reduce((sum, t) => sum + (parseFloat(t.quantite) || 0), 0).toFixed(1)} m en stock
          </Typography>
        </Box>
        <Button variant="contained" startIcon={<Plus size={18} />} onClick={() => handleOpenForm(null)}
          sx={{ bgcolor: '#33658a', '&:hover': { bgcolor: '#1e4d6b' }, fontWeight: 700, borderRadius: 2 }}>
          Ajouter un tissu
        </Button>
      </Box>

      {/* Grille */}
      {tissus.length === 0 ? (
        <Box sx={{
          border: '2px dashed rgba(26,19,10,0.1)', borderRadius: 4, p: 8,
          textAlign: 'center', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 2.5,
        }}>
          <Layers size={60} strokeWidth={1} color="#ddd" />
          <Box>
            <Typography variant="h6" sx={{ fontWeight: 800, mb: 0.5 }}>Aucun tissu dans votre stock</Typography>
            <Typography variant="body2" color="text.secondary">
              Ajoutez vos tissus pour les retrouver facilement et les associer à vos projets.
            </Typography>
          </Box>
          <Button variant="contained" startIcon={<Plus size={18} />} onClick={() => handleOpenForm(null)}
            sx={{ bgcolor: '#33658a', '&:hover': { bgcolor: '#1e4d6b' }, fontWeight: 700, borderRadius: 2 }}>
            Ajouter un tissu
          </Button>
        </Box>
      ) : (
        <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', sm: '1fr 1fr', md: '1fr 1fr 1fr 1fr' }, gap: 2 }}>
          {tissus.map(tissu => (
            <Paper
              key={tissu._id}
              elevation={0}
              onClick={() => setDetailTissu(tissu)}
              sx={{
                cursor: 'pointer',
                border: '1.5px solid rgba(26,19,10,0.07)',
                borderRadius: 3,
                overflow: 'hidden',
                transition: 'all 0.15s',
                '&:hover': { boxShadow: '0 6px 20px rgba(51,101,138,0.15)', transform: 'translateY(-2px)', borderColor: '#33658a44' },
              }}
            >
              {tissu.image ? (
                <Box sx={{ height: 150, overflow: 'hidden' }}>
                  <CardMedia component="img" image={tissu.image} alt={tissu.nom}
                    sx={{ height: '100%', objectFit: 'cover', transition: 'transform 0.2s', '&:hover': { transform: 'scale(1.04)' } }} />
                </Box>
              ) : (
                <Box sx={{ height: 150, bgcolor: 'rgba(51,101,138,0.06)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  <Layers size={40} color="#33658a44" strokeWidth={1.5} />
                </Box>
              )}

              {/* Header de la carte */}
              <Box sx={{ px: 2, py: 1.5, bgcolor: 'rgba(0,0,0,0.015)', borderBottom: '1px solid rgba(26,19,10,0.05)' }}>
                <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                  <Typography sx={{ fontWeight: 800, fontSize: '0.95rem', lineHeight: 1.2 }}>
                    {tissu.nom}
                  </Typography>
                  <Box sx={{ display: 'flex', gap: 0.5 }} onClick={e => e.stopPropagation()}>
                    <Tooltip title="Modifier">
                      <IconButton size="small" onClick={() => handleOpenForm(tissu)} sx={{ color: 'text.secondary' }}>
                        <Pencil size={14} strokeWidth={2} />
                      </IconButton>
                    </Tooltip>
                    <Tooltip title="Supprimer">
                      <IconButton size="small" onClick={() => setDeleteTarget(tissu)} sx={{ color: '#e85d75' }}>
                        <Trash2 size={14} strokeWidth={2} />
                      </IconButton>
                    </Tooltip>
                  </Box>
                </Box>
              </Box>

              {/* Body */}
              <Box sx={{ px: 2, py: 1.5, display: 'flex', flexWrap: 'wrap', gap: 0.75, alignItems: 'center' }}>
                {tissu.type && <Chip label={tissu.type} size="small" sx={{ bgcolor: '#33658a', color: 'white', fontWeight: 700, fontSize: '0.7rem', height: 20 }} />}
                {tissu.teinte && COULEURS_MAP[tissu.teinte] && (
                  <Tooltip title={tissu.teinte.charAt(0).toUpperCase() + tissu.teinte.slice(1)}>
                    <Box sx={{ width: 14, height: 14, borderRadius: '50%', bgcolor: COULEURS_MAP[tissu.teinte], border: '1.5px solid rgba(0,0,0,0.15)', flexShrink: 0 }} />
                  </Tooltip>
                )}
                {(tissu.precisionCouleur || tissu.teinte) && (
                  <Typography variant="body2" color="text.secondary" sx={{ fontSize: '0.8rem' }}>
                    {tissu.precisionCouleur || tissu.teinte}
                  </Typography>
                )}
                {tissu.quantite != null && (
                  <Typography sx={{ fontWeight: 800, color: '#0cbaba', fontSize: '0.85rem', ml: 'auto' }}>
                    {tissu.quantite} m
                  </Typography>
                )}
              </Box>
            </Paper>
          ))}
        </Box>
      )}

      {/* Dialog détail */}
      <Dialog open={!!detailTissu && !formOpen} onClose={() => setDetailTissu(null)} maxWidth="sm" fullWidth
        PaperProps={{ sx: { borderRadius: 3 } }}>
        {detailTissu && (
          <>
            <DialogTitle sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontWeight: 800 }}>
              {detailTissu.nom}
              <IconButton size="small" onClick={() => setDetailTissu(null)}><X size={18} /></IconButton>
            </DialogTitle>
            <DialogContent dividers>
              {detailTissu.image && (
                <Box component="img" src={detailTissu.image} alt={detailTissu.nom}
                  sx={{ width: '100%', maxHeight: 300, objectFit: 'contain', mb: 2, borderRadius: 2 }} />
              )}
              <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
                {detailTissu.type && <Box sx={{ display: 'flex', gap: 1 }}><Typography color="text.secondary" sx={{ fontSize: '0.85rem', minWidth: 120 }}>Type</Typography><Typography sx={{ fontWeight: 700, fontSize: '0.85rem' }}>{detailTissu.type}</Typography></Box>}
                {detailTissu.teinte && (
                  <Box sx={{ display: 'flex', gap: 1, alignItems: 'center' }}>
                    <Typography color="text.secondary" sx={{ fontSize: '0.85rem', minWidth: 120 }}>Teinte</Typography>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.75 }}>
                      {COULEURS_MAP[detailTissu.teinte] && <Box sx={{ width: 16, height: 16, borderRadius: '50%', bgcolor: COULEURS_MAP[detailTissu.teinte], border: '1.5px solid rgba(0,0,0,0.15)' }} />}
                      <Typography sx={{ fontWeight: 700, fontSize: '0.85rem' }}>{detailTissu.teinte.charAt(0).toUpperCase() + detailTissu.teinte.slice(1)}</Typography>
                    </Box>
                  </Box>
                )}
                {detailTissu.precisionCouleur && <Box sx={{ display: 'flex', gap: 1 }}><Typography color="text.secondary" sx={{ fontSize: '0.85rem', minWidth: 120 }}>Précision couleur</Typography><Typography sx={{ fontWeight: 700, fontSize: '0.85rem' }}>{detailTissu.precisionCouleur}</Typography></Box>}
                {detailTissu.motifs && detailTissu.motifs.length > 0 && (
                  <Box sx={{ display: 'flex', gap: 1, alignItems: 'flex-start' }}>
                    <Typography color="text.secondary" sx={{ fontSize: '0.85rem', minWidth: 120, pt: 0.25 }}>Motifs</Typography>
                    <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5 }}>
                      {detailTissu.motifs.map(m => <Chip key={m} label={m} size="small" sx={{ bgcolor: '#f0ece8', fontSize: '0.72rem', height: 20 }} />)}
                    </Box>
                  </Box>
                )}
                {detailTissu.quantite != null && <Box sx={{ display: 'flex', gap: 1 }}><Typography color="text.secondary" sx={{ fontSize: '0.85rem', minWidth: 120 }}>Quantité</Typography><Typography sx={{ fontWeight: 700, fontSize: '0.85rem' }}>{detailTissu.quantite} m</Typography></Box>}
                {detailTissu.laize != null && detailTissu.laize !== '' && <Box sx={{ display: 'flex', gap: 1 }}><Typography color="text.secondary" sx={{ fontSize: '0.85rem', minWidth: 120 }}>Laize</Typography><Typography sx={{ fontWeight: 700, fontSize: '0.85rem' }}>{detailTissu.laize} cm</Typography></Box>}
                {detailTissu.matiere && <Box sx={{ display: 'flex', gap: 1 }}><Typography color="text.secondary" sx={{ fontSize: '0.85rem', minWidth: 120 }}>Matière principale</Typography><Typography sx={{ fontWeight: 700, fontSize: '0.85rem' }}>{detailTissu.matiere}</Typography></Box>}
                {detailTissu.provenance && <Box sx={{ display: 'flex', gap: 1 }}><Typography color="text.secondary" sx={{ fontSize: '0.85rem', minWidth: 120 }}>Provenance</Typography><Typography sx={{ fontWeight: 700, fontSize: '0.85rem' }}>{detailTissu.provenance}</Typography></Box>}
                {detailTissu.destination && (
                  <Box sx={{ display: 'flex', gap: 1, alignItems: 'center' }}>
                    <Typography color="text.secondary" sx={{ fontSize: '0.85rem', minWidth: 120 }}>Destination</Typography>
                    {detailTissu.patronId ? (
                      <Typography
                        onClick={() => handleOpenLinkedPatron(detailTissu.patronId)}
                        sx={{ fontWeight: 700, fontSize: '0.85rem', color: '#33658a', cursor: 'pointer', textDecoration: 'underline', '&:hover': { color: '#1e4d6b' } }}
                      >
                        {detailTissu.destination}
                      </Typography>
                    ) : (
                      <Typography sx={{ fontWeight: 700, fontSize: '0.85rem' }}>{detailTissu.destination}</Typography>
                    )}
                  </Box>
                )}
                {detailTissu.composition && <Box sx={{ display: 'flex', gap: 1 }}><Typography color="text.secondary" sx={{ fontSize: '0.85rem', minWidth: 120 }}>Composition</Typography><Typography sx={{ fontWeight: 700, fontSize: '0.85rem' }}>{detailTissu.composition}</Typography></Box>}
                {detailTissu.poids != null && detailTissu.poids !== '' && <Box sx={{ display: 'flex', gap: 1 }}><Typography color="text.secondary" sx={{ fontSize: '0.85rem', minWidth: 120 }}>Poids</Typography><Typography sx={{ fontWeight: 700, fontSize: '0.85rem' }}>{detailTissu.poids} g/m²</Typography></Box>}
                {(detailTissu.lave || detailTissu.dejaUtilise) && (
                  <Box sx={{ display: 'flex', gap: 0.75, flexWrap: 'wrap', mt: 0.5 }}>
                    {detailTissu.lave && <Chip label="Lavé" size="small" sx={{ bgcolor: '#e3eef7', color: '#1e4d6b', fontWeight: 700, fontSize: '0.72rem', height: 20 }} />}
                    {detailTissu.dejaUtilise && <Chip label="Déjà utilisé" size="small" sx={{ bgcolor: '#fef3e2', color: '#b45309', fontWeight: 700, fontSize: '0.72rem', height: 20 }} />}
                  </Box>
                )}
              </Box>

              {/* Patrons compatibles */}
              {detailTissu.typeTissu && (
                <Box sx={{ mt: 2, pt: 2, borderTop: '2px solid rgba(227,99,151,0.12)' }}>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1.25 }}>
                    <Scissors size={15} color="#e36397" strokeWidth={2} />
                    <Typography variant="subtitle2" sx={{ color: '#e36397', fontWeight: 700 }}>
                      Patrons compatibles dans ma collection
                    </Typography>
                  </Box>
                  {matchingPatrons === null ? (
                    <CircularProgress size={18} sx={{ color: '#e36397' }} />
                  ) : matchingPatrons.length === 0 ? (
                    <Typography sx={{ fontSize: '0.85rem', color: 'text.secondary', fontStyle: 'italic' }}>
                      Aucun patron compatible dans ta collection.
                    </Typography>
                  ) : (
                    <Box sx={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(120px, 1fr))', gap: 1 }}>
                      {matchingPatrons.map(p => (
                        <Box key={p._id} onClick={() => openFloatingPatron(p)} sx={{
                          borderRadius: 2, overflow: 'hidden',
                          border: '1.5px solid rgba(227,99,151,0.15)',
                          bgcolor: 'white', cursor: 'pointer',
                          transition: 'all 0.15s',
                          '&:hover': { boxShadow: '0 4px 14px rgba(227,99,151,0.15)', transform: 'translateY(-2px)', borderColor: '#e3639766' },
                        }}>
                          {p.imagePrincipale ? (
                            <Box sx={{ height: 80, overflow: 'hidden' }}>
                              <Box component="img" src={p.imagePrincipale} alt={p.modele}
                                sx={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                            </Box>
                          ) : (
                            <Box sx={{ height: 80, bgcolor: 'rgba(227,99,151,0.05)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                              <Scissors size={24} color="#e36397" strokeWidth={1.5} style={{ opacity: 0.25 }} />
                            </Box>
                          )}
                          <Box sx={{ px: 1, pt: 0.6, pb: 0.75 }}>
                            <Typography sx={{ fontWeight: 700, fontSize: '0.78rem', lineHeight: 1.2 }} noWrap>
                              {p.modele}
                            </Typography>
                            <Typography sx={{ fontSize: '0.7rem', color: 'text.secondary' }} noWrap>
                              {p.marque}
                            </Typography>
                            {p.types?.length > 0 && (
                              <Typography sx={{ fontSize: '0.68rem', color: '#e36397', fontWeight: 700, mt: 0.25 }} noWrap>
                                {p.types[0]}
                              </Typography>
                            )}
                          </Box>
                        </Box>
                      ))}
                    </Box>
                  )}
                </Box>
              )}
            </DialogContent>
            <DialogActions sx={{ justifyContent: 'space-between', p: 2 }}>
              <Button startIcon={<Trash2 size={16} />} variant="outlined"
                sx={{ borderColor: '#e85d75', color: '#e85d75', fontWeight: 700 }}
                onClick={() => setDeleteTarget(detailTissu)}>
                Supprimer
              </Button>
              <Box sx={{ display: 'flex', gap: 1 }}>
                {onMatchTissu && (
                  <Button startIcon={<Shuffle size={16} />} variant="contained"
                    sx={{ bgcolor: '#e36397', '&:hover': { bgcolor: '#c9547f' }, fontWeight: 700 }}
                    onClick={() => { onMatchTissu(detailTissu); setDetailTissu(null); }}>
                    Matche avec
                  </Button>
                )}
                <Button startIcon={<Pencil size={16} />} variant="contained"
                  sx={{ bgcolor: '#33658a', '&:hover': { bgcolor: '#1e4d6b' }, fontWeight: 700 }}
                  onClick={() => handleOpenForm(detailTissu)}>
                  Modifier
                </Button>
              </Box>
            </DialogActions>
          </>
        )}
      </Dialog>

      {/* Dialog formulaire */}
      <Dialog open={formOpen} onClose={() => { setFormOpen(false); setEditingTissu(null); }} maxWidth="sm" fullWidth
        PaperProps={{ sx: { borderRadius: 3, p: 1 } }}>
        <DialogContent sx={{ p: 0 }}>
          <TissuForm tissu={editingTissu} onSave={handleSave}
            onCancel={() => { setFormOpen(false); setEditingTissu(null); }} />
        </DialogContent>
      </Dialog>

      {/* Fenêtres flottantes patrons — portail hors du DOM du Dialog */}
      {floatingPatrons.map(f => createPortal(
        <FloatingPatronCard
          key={f.id}
          patron={f.patron}
          x={f.x}
          y={f.y}
          zIndex={f.zIndex}
          onClose={() => closeFloatingPatron(f.id)}
          onBringToFront={() => bringToFront(f.id)}
          onMove={(x, y) => moveFloatingPatron(f.id, x, y)}
          onOpenFull={() => { setLinkedPatron(f.patron); setLinkedPatronOpen(true); }}
        />,
        document.body
      ))}

      {/* Popup patron lié */}
      <PatronModal
        open={linkedPatronOpen}
        patron={linkedPatron}
        onClose={() => setLinkedPatronOpen(false)}
        onEdit={() => {}}
        onDelete={() => {}}
      />

      {/* Dialog confirmation suppression */}
      <Dialog open={!!deleteTarget} onClose={() => setDeleteTarget(null)} PaperProps={{ sx: { borderRadius: 3 } }}>
        <DialogTitle sx={{ fontWeight: 800 }}>Supprimer ce tissu ?</DialogTitle>
        <DialogContent>
          <Typography>
            Le tissu <strong>{deleteTarget?.nom}</strong> sera définitivement supprimé.
          </Typography>
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

export default TissuList;
