import React, { useState } from 'react';
import {
  Dialog, DialogTitle, DialogContent,
  Typography, Box, IconButton, Popover,
  CircularProgress, Button, Chip
} from '@mui/material';
import { X, Pencil, Lightbulb, FileText, ChevronLeft, ChevronRight, ExternalLink } from 'lucide-react';
import { patronService } from '../services/api';

const LANGUE_DRAPEAUX = {
  'Français': { img: 'https://flagcdn.com/20x15/fr.png' },
  'Anglais':  { img: 'https://flagcdn.com/20x15/gb.png' },
  'Allemand': { img: 'https://flagcdn.com/20x15/de.png' },
};

function InfoCard({ label, color, children, fullWidth }) {
  return (
    <Box sx={{
      bgcolor: color, borderRadius: 2, px: 1.5, py: 1,
      display: 'flex', flexDirection: 'column', gap: 0.25,
      ...(fullWidth && { width: '100%' })
    }}>
      <Typography sx={{ fontSize: '0.65rem', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.06em', color: 'text.secondary' }}>
        {label}
      </Typography>
      {typeof children === 'string'
        ? <Typography variant="body2" sx={{ fontWeight: 600 }}>{children}</Typography>
        : children}
    </Box>
  );
}

function PatronModal({ open, patron, onClose, onEdit, onDelete }) {
  const [lightboxOpen, setLightboxOpen] = useState(false);
  const [lightboxImage, setLightboxImage] = useState('');
  const [aSavoirAnchor, setASavoirAnchor] = useState(null);
  const [pdfs, setPdfs] = useState(null);
  const [carouselIndex, setCarouselIndex] = useState(0);

  React.useEffect(() => {
    if (open) {
      window.scrollTo(0, 0);
      setPdfs(null);
      setCarouselIndex(0);
      if (patron?.pdfPath) {
        patronService.getPdfs(patron._id)
          .then(res => setPdfs(res.data))
          .catch(() => setPdfs([]));
      }
    }
  }, [open, patron?._id]);

  if (!patron) return null;

  const openLightbox = (image) => {
    setLightboxImage(image);
    setLightboxOpen(true);
  };

  const images = [
    patron.imagePrincipale && { src: patron.imagePrincipale, label: 'Image principale' },
    patron.imageSupp1      && { src: patron.imageSupp1,      label: 'Image supp. 1' },
    patron.imageSupp2      && { src: patron.imageSupp2,      label: 'Image supp. 2' },
    patron.imageSupp3      && { src: patron.imageSupp3,      label: 'Image supp. 3' },
  ].filter(Boolean);
  const idx = Math.min(carouselIndex, Math.max(0, images.length - 1));
  const cur = images[idx];

  return (
    <>
      <Dialog open={open} onClose={() => {}} maxWidth="md" fullWidth scroll="paper"
        PaperProps={{ sx: { borderRadius: 3 } }}>
        <DialogTitle sx={{ py: 1.5, px: 2.5 }}>
          <Box display="flex" justifyContent="space-between" alignItems="center">
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
              {patron.aSavoir && (
                <IconButton size="small" onClick={(e) => setASavoirAnchor(e.currentTarget)}
                  sx={{ color: '#e36397', bgcolor: '#fce4ec', '&:hover': { bgcolor: '#f8c8d8' } }}>
                  <Lightbulb size={16} strokeWidth={2} />
                </IconButton>
              )}
              <Button size="small" variant="outlined" startIcon={<Pencil size={14} />}
                onClick={() => { onEdit(patron); onClose(); }}
                sx={{ borderColor: '#33658a', color: '#33658a', fontWeight: 700, borderWidth: 2, borderRadius: 1.5 }}>
                Modifier
              </Button>
            </Box>
            <IconButton size="small" onClick={onClose}
              sx={{ color: 'text.secondary' }}>
              <X size={18} />
            </IconButton>
          </Box>
        </DialogTitle>

        <Popover
          open={Boolean(aSavoirAnchor)}
          anchorEl={aSavoirAnchor}
          onClose={() => setASavoirAnchor(null)}
          anchorOrigin={{ vertical: 'bottom', horizontal: 'left' }}
          transformOrigin={{ vertical: 'top', horizontal: 'left' }}
          PaperProps={{ sx: { borderRadius: 2, boxShadow: '0 8px 24px rgba(26,19,10,0.12)' } }}
        >
          <Box sx={{ p: 2, maxWidth: 320, display: 'flex', gap: 1, alignItems: 'flex-start' }}>
            <Lightbulb size={18} color="#e36397" strokeWidth={2} style={{ marginTop: 2, flexShrink: 0 }} />
            <Typography variant="body2" sx={{ whiteSpace: 'pre-wrap' }}>{patron.aSavoir}</Typography>
          </Box>
        </Popover>

        <DialogContent dividers sx={{ pt: 2 }}>
          {/* Titre */}
          <Typography variant="h4" fontWeight={800} sx={{ mb: 2, lineHeight: 1.2, textAlign: 'center' }}>
            {patron.modele}
            <Typography component="span" variant="h4" fontWeight={400} sx={{ color: 'text.secondary', ml: 1 }}>
              {patron.marque}
            </Typography>
          </Typography>

          {/* Langues */}
          {patron.langues?.length > 0 && (
            <Box sx={{ display: 'flex', justifyContent: 'center', gap: 0.75, mb: 2 }}>
              {patron.langues.map(lang => {
                const flag = LANGUE_DRAPEAUX[lang];
                if (!flag) return <Chip key={lang} label={lang} size="small" />;
                return flag.img
                  ? <img key={lang} src={flag.img} alt={lang} title={lang} style={{ height: '18px', verticalAlign: 'middle', borderRadius: '2px' }} />
                  : <span key={lang} title={lang} style={{ fontSize: '1.2rem', lineHeight: 1 }}>{flag.emoji}</span>;
              })}
            </Box>
          )}

          {/* Carrousel */}
          {images.length > 0 && (
            <Box sx={{ mb: 2 }}>
              <Box sx={{ position: 'relative', display: 'flex', alignItems: 'center', justifyContent: 'center', minHeight: 200 }}>
                {images.length > 1 && (
                  <IconButton
                    onClick={() => setCarouselIndex(i => (i - 1 + images.length) % images.length)}
                    sx={{ position: 'absolute', left: 0, zIndex: 1, bgcolor: 'rgba(255,255,255,0.88)', '&:hover': { bgcolor: 'white' } }}
                  >
                    <ChevronLeft size={20} />
                  </IconButton>
                )}
                <Box
                  component="img"
                  src={cur.src}
                  alt={cur.label}
                  sx={{ maxWidth: '100%', maxHeight: 380, objectFit: 'contain', cursor: 'zoom-in', borderRadius: 2 }}
                  onClick={() => openLightbox(cur.src)}
                />
                {images.length > 1 && (
                  <IconButton
                    onClick={() => setCarouselIndex(i => (i + 1) % images.length)}
                    sx={{ position: 'absolute', right: 0, zIndex: 1, bgcolor: 'rgba(255,255,255,0.88)', '&:hover': { bgcolor: 'white' } }}
                  >
                    <ChevronRight size={20} />
                  </IconButton>
                )}
              </Box>
              {images.length > 1 && (
                <Box sx={{ display: 'flex', justifyContent: 'center', gap: 0.75, mt: 1 }}>
                  {images.map((_, i) => (
                    <Box
                      key={i}
                      onClick={() => setCarouselIndex(i)}
                      sx={{
                        width: i === idx ? 20 : 8, height: 8, borderRadius: 4,
                        bgcolor: i === idx ? '#e36397' : 'rgba(26,19,10,0.15)',
                        cursor: 'pointer', transition: 'all 0.2s'
                      }}
                    />
                  ))}
                </Box>
              )}
            </Box>
          )}

          {/* Mosaïque infos */}
          <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1, mb: 2 }}>
            {patron.types?.length > 0 && (
              <InfoCard label="Type de vêtement" color="#fce4ec">{patron.types.join(', ')}</InfoCard>
            )}
            {(patron.typeAccessoires?.length > 0 || patron.typeAccessoire) && (
              <InfoCard label="Accessoire" color="#f3e5f5">
                {patron.typeAccessoires?.length > 0 ? patron.typeAccessoires.join(', ') : patron.typeAccessoire}
              </InfoCard>
            )}
            {patron.genres?.filter(g => g !== 'Accessoire').length > 0 && (
              <InfoCard label="Genre" color="#e3f2fd">{patron.genres.filter(g => g !== 'Accessoire').join(', ')}</InfoCard>
            )}
            {patron.manches?.length > 0 && (
              <InfoCard label="Manches" color="#e8f5e9">{patron.manches.join(', ')}</InfoCard>
            )}
            {patron.longueurs?.length > 0 && (
              <InfoCard label="Longueur" color="#fff8e1">{patron.longueurs.join(', ')}</InfoCard>
            )}
            {patron.tissuTypes?.length > 0 && (
              <InfoCard label="Type de tissu" color="#e0f7fa">{patron.tissuTypes.join(', ')}</InfoCard>
            )}
            {patron.tissuSpecifique?.length > 0 && (
              <InfoCard label="Besoins spécifiques" color="#fbe9e7">{patron.tissuSpecifique.join(', ')}</InfoCard>
            )}
            {patron.details?.length > 0 && (
              <InfoCard label="Détails" color="#f9fbe7">{patron.details.join(', ')}</InfoCard>
            )}
            {patron.notes && (
              <InfoCard label="Notes" color="#fffde7" fullWidth>{patron.notes}</InfoCard>
            )}
          </Box>

          {/* Schéma technique */}
          {patron.imageSchemaTechnique && (
            <Box sx={{ mb: 2, textAlign: 'center' }}>
              <Box
                component="img"
                src={patron.imageSchemaTechnique}
                alt="Schéma technique"
                sx={{ maxWidth: '100%', maxHeight: 300, objectFit: 'contain', cursor: 'zoom-in', borderRadius: 2 }}
                onClick={() => openLightbox(patron.imageSchemaTechnique)}
              />
            </Box>
          )}

          {/* Tableau des mesures */}
          {patron.imageTableauTailles && (
            <Box sx={{ mb: 2, textAlign: 'center' }}>
              <Box
                component="img"
                src={patron.imageTableauTailles}
                alt="Tableau des mesures"
                sx={{ maxWidth: '100%', maxHeight: 300, objectFit: 'contain', cursor: 'zoom-in', borderRadius: 2 }}
                onClick={() => openLightbox(patron.imageTableauTailles)}
              />
            </Box>
          )}

          {/* Tailles + métrage */}
          {(patron.taillesIndiquees || patron.dimensions || patron.taillesEnfant?.length > 0 || patron.taillesDisponibles?.length > 0 || patron.metrageMin || patron.metrageMax) && (
            <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1, mb: 2 }}>
              {patron.taillesIndiquees && (
                <InfoCard label="Tailles indiquées" color="#e8eaf6">{patron.taillesIndiquees}</InfoCard>
              )}
              {patron.dimensions && (
                <InfoCard label="Dimensions" color="#e0f2f1">{patron.dimensions}</InfoCard>
              )}
              {patron.taillesEnfant?.length > 0 && (
                <InfoCard label="Tailles enfant" color="#fce4ec">
                  {patron.taillesEnfant.length === 1
                    ? patron.taillesEnfant[0]
                    : `${patron.taillesEnfant[0]} – ${patron.taillesEnfant[patron.taillesEnfant.length - 1]}`}
                </InfoCard>
              )}
              {patron.taillesDisponibles?.length > 0 && (
                <InfoCard label="Tailles" color="#fff3e0">
                  {patron.taillesDisponibles.length === 1
                    ? patron.taillesDisponibles[0]
                    : `${patron.taillesDisponibles[0]} – ${patron.taillesDisponibles[patron.taillesDisponibles.length - 1]}`}
                </InfoCard>
              )}
              {(patron.metrageMin || patron.metrageMax) && (
                <InfoCard label="Métrage" color="#e1f5fe">
                  {patron.metrageMin && patron.metrageMax
                    ? `${patron.metrageMin} à ${patron.metrageMax} m`
                    : patron.metrageMin ? `${patron.metrageMin} m+` : `jusqu'à ${patron.metrageMax} m`}
                </InfoCard>
              )}
            </Box>
          )}

          {/* PDFs */}
          {patron.pdfPath && (
            <Box sx={{ mt: 1, pt: 2, borderTop: '2px solid rgba(123,94,167,0.15)' }}>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1.5 }}>
                <Typography variant="subtitle2" sx={{ color: '#7b5ea7', fontWeight: 700 }}>Fichiers PDF</Typography>
              </Box>
              {pdfs === null ? (
                <CircularProgress size={18} sx={{ color: '#7b5ea7' }} />
              ) : pdfs.length === 0 ? (
                <Typography sx={{ fontSize: '0.85rem', color: 'text.secondary', fontStyle: 'italic' }}>Aucun PDF trouvé.</Typography>
              ) : (
                <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1 }}>
                  {pdfs.map(pdf => (
                    <Box
                      key={pdf.name}
                      component="a"
                      href={`http://localhost:5000${pdf.url}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      sx={{
                        display: 'flex', alignItems: 'center', gap: 0.75,
                        px: 1.5, py: 0.75, borderRadius: 2,
                        border: '2px solid rgba(123,94,167,0.25)', bgcolor: '#f5f0fb',
                        color: '#7b5ea7', fontWeight: 700, fontSize: '0.85rem',
                        textDecoration: 'none', cursor: 'pointer',
                        transition: 'all 0.15s',
                        '&:hover': { bgcolor: '#ebe4f7', borderColor: '#7b5ea7' }
                      }}
                    >
                      <FileText size={14} strokeWidth={2} />
                      {pdf.name.replace(/\.pdf$/i, '').replace(/^[^_]+_/, '')}
                    </Box>
                  ))}
                </Box>
              )}
            </Box>
          )}

          {/* Lien boutique */}
          {patron.lienShop && (
            <Box sx={{ mt: 2 }}>
              <Button
                variant="outlined"
                href={patron.lienShop}
                target="_blank"
                rel="noopener noreferrer"
                component="a"
                endIcon={<ExternalLink size={14} />}
                sx={{ borderColor: '#33658a', color: '#33658a', fontWeight: 700, borderWidth: 2, '&:hover': { borderColor: '#1e4d6b', bgcolor: '#f0f6fb' } }}
              >
                Voir la boutique
              </Button>
            </Box>
          )}
        </DialogContent>
      </Dialog>

      {/* Lightbox */}
      <Dialog open={lightboxOpen} onClose={() => setLightboxOpen(false)} maxWidth="lg" fullWidth
        PaperProps={{ sx: { bgcolor: 'transparent', boxShadow: 'none' } }}>
        <Box
          component="img"
          src={lightboxImage}
          alt="Image agrandie"
          sx={{ width: '100%', height: 'auto', cursor: 'zoom-out' }}
          onClick={() => setLightboxOpen(false)}
        />
      </Dialog>
    </>
  );
}

export default PatronModal;
