import React, { useRef, useEffect, useCallback } from 'react';
import { Box, Typography, IconButton, Chip } from '@mui/material';
import { X, Scissors, Ruler, ArrowUpRight } from 'lucide-react';

const LANGUE_DRAPEAUX = {
  'Français': { img: 'https://flagcdn.com/20x15/fr.png' },
  'Anglais':  { img: 'https://flagcdn.com/20x15/gb.png' },
  'Allemand': { img: 'https://flagcdn.com/20x15/de.png' },
  'Autre':    { emoji: '🌍' },
};

function Row({ label, children }) {
  return (
    <Box sx={{ display: 'flex', gap: 1, alignItems: 'flex-start' }}>
      <Typography sx={{ fontSize: '0.75rem', color: 'text.secondary', minWidth: 90, pt: 0.1 }}>
        {label}
      </Typography>
      <Box sx={{ flex: 1 }}>{children}</Box>
    </Box>
  );
}

function FloatingPatronCard({ patron, x, y, zIndex, onClose, onBringToFront, onMove, onOpenFull }) {
  const dragState = useRef({ active: false, startX: 0, startY: 0, origX: 0, origY: 0 });

  const handleMouseMove = useCallback((e) => {
    if (!dragState.current.active) return;
    onMove(
      dragState.current.origX + e.clientX - dragState.current.startX,
      dragState.current.origY + e.clientY - dragState.current.startY,
    );
  }, [onMove]);

  const handleMouseUp = useCallback(() => {
    dragState.current.active = false;
  }, []);

  useEffect(() => {
    window.addEventListener('mousemove', handleMouseMove);
    window.addEventListener('mouseup', handleMouseUp);
    return () => {
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('mouseup', handleMouseUp);
    };
  }, [handleMouseMove, handleMouseUp]);

  const handleHeaderMouseDown = (e) => {
    if (e.target.closest('button')) return;
    e.preventDefault();
    dragState.current = { active: true, startX: e.clientX, startY: e.clientY, origX: x, origY: y };
    onBringToFront();
  };

  const getTailles = () => {
    const t = patron.taillesDisponibles?.length > 0 ? patron.taillesDisponibles
      : patron.taillesEnfant?.length > 0 ? patron.taillesEnfant : null;
    if (!t) return patron.taillesIndiquees || patron.dimensions || null;
    return t.length === 1 ? t[0] : `${t[0]} – ${t[t.length - 1]}`;
  };

  const getMetrage = () => {
    if (!patron.metrageMin && !patron.metrageMax) return null;
    if (patron.metrageMin && patron.metrageMax) return `${patron.metrageMin} à ${patron.metrageMax} m`;
    return patron.metrageMin ? `${patron.metrageMin} m+` : `jusqu'à ${patron.metrageMax} m`;
  };

  const formats = [
    patron.formats?.projecteur && 'Proj.',
    patron.formats?.a4 && 'A4',
    patron.formats?.a0 && 'A0',
  ].filter(Boolean);

  return (
    <Box
      onMouseDown={onBringToFront}
      sx={{
        position: 'fixed', left: x, top: y, zIndex,
        width: 320,
        borderRadius: 3,
        boxShadow: '0 8px 32px rgba(0,0,0,0.2)',
        bgcolor: 'white',
        border: '1.5px solid rgba(227,99,151,0.25)',
        display: 'flex', flexDirection: 'column',
        maxHeight: '82vh',
      }}
    >
      {/* Header — poignée de drag */}
      <Box
        onMouseDown={handleHeaderMouseDown}
        sx={{
          display: 'flex', alignItems: 'center', gap: 1,
          px: 1.5, py: 0.9, flexShrink: 0,
          bgcolor: '#fff5f9',
          borderBottom: '1px solid rgba(227,99,151,0.15)',
          borderRadius: '12px 12px 0 0',
          cursor: 'grab', userSelect: 'none',
          '&:active': { cursor: 'grabbing' },
        }}
      >
        <Box sx={{ flex: 1, minWidth: 0 }}>
          <Typography sx={{ fontWeight: 800, fontSize: '0.9rem', lineHeight: 1.2 }} noWrap>
            {patron.modele}
          </Typography>
          <Typography sx={{ fontSize: '0.73rem', color: 'text.secondary', fontWeight: 600 }} noWrap>
            {patron.marque}
          </Typography>
        </Box>
        {patron.langues?.length > 0 && (
          <Box sx={{ display: 'flex', gap: 0.5, alignItems: 'center', flexShrink: 0 }}>
            {patron.langues.map(lang => {
              const flag = LANGUE_DRAPEAUX[lang];
              if (!flag) return null;
              return flag.img
                ? <img key={lang} src={flag.img} alt={lang} title={lang} style={{ height: 12, borderRadius: 2 }} />
                : <span key={lang} title={lang} style={{ fontSize: '0.85rem' }}>{flag.emoji}</span>;
            })}
          </Box>
        )}
        {onOpenFull && (
          <IconButton size="small" onClick={onOpenFull}
            sx={{ p: 0.25, flexShrink: 0, color: '#e36397', '&:hover': { bgcolor: 'rgba(227,99,151,0.1)' } }}>
            <ArrowUpRight size={15} strokeWidth={2.5} />
          </IconButton>
        )}
        <IconButton size="small" onClick={onClose}
          sx={{ p: 0.25, flexShrink: 0, color: 'text.secondary', '&:hover': { color: '#e85d75', bgcolor: 'rgba(232,93,117,0.08)' } }}>
          <X size={14} strokeWidth={2.5} />
        </IconButton>
      </Box>

      {/* Corps scrollable */}
      <Box sx={{ overflowY: 'auto', flex: 1 }}>

        {/* Photo */}
        {patron.imagePrincipale ? (
          <Box sx={{ height: 180, overflow: 'hidden', flexShrink: 0 }}>
            <Box component="img" src={patron.imagePrincipale} alt={patron.modele}
              sx={{ width: '100%', height: '100%', objectFit: 'cover' }} />
          </Box>
        ) : (
          <Box sx={{ height: 100, bgcolor: 'rgba(227,99,151,0.05)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
            <Scissors size={36} color="#e36397" strokeWidth={1.5} style={{ opacity: 0.2 }} />
          </Box>
        )}

        {/* Infos */}
        <Box sx={{ px: 1.5, py: 1.25, display: 'flex', flexDirection: 'column', gap: 0.75 }}>

          {/* Type + genre */}
          {(patron.types?.length > 0 || patron.typeAccessoires?.length > 0 || patron.genres?.length > 0) && (
            <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5 }}>
              {patron.types?.map(t => (
                <Chip key={t} label={t} size="small"
                  sx={{ bgcolor: '#fce4ec', color: '#e36397', fontWeight: 700, fontSize: '0.68rem', height: 18 }} />
              ))}
              {patron.typeAccessoires?.map(t => (
                <Chip key={t} label={t} size="small"
                  sx={{ bgcolor: '#f3e5f5', color: '#9c27b0', fontWeight: 700, fontSize: '0.68rem', height: 18 }} />
              ))}
              {patron.genres?.filter(g => g !== 'Accessoire').map(g => (
                <Chip key={g} label={g} size="small"
                  sx={{ bgcolor: '#e3f2fd', color: '#1565c0', fontWeight: 700, fontSize: '0.68rem', height: 18 }} />
              ))}
            </Box>
          )}

          {/* Séparateur */}
          <Box sx={{ height: '1px', bgcolor: 'rgba(0,0,0,0.06)', mx: -1.5 }} />

          {getTailles() && (
            <Row label="Tailles">{<Typography sx={{ fontSize: '0.82rem', fontWeight: 600 }}>{getTailles()}</Typography>}</Row>
          )}

          {getMetrage() && (
            <Row label="Métrage">
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                <Ruler size={12} color="#33658a" strokeWidth={2} />
                <Typography sx={{ fontSize: '0.82rem', fontWeight: 700, color: '#33658a' }}>{getMetrage()}</Typography>
              </Box>
            </Row>
          )}

          {patron.tissusConseilles?.length > 0 && (
            <Row label="Tissus">
              <Typography sx={{ fontSize: '0.78rem', color: 'text.secondary' }}>
                {patron.tissusConseilles.join(', ')}
              </Typography>
            </Row>
          )}

          {patron.manches?.length > 0 && (
            <Row label="Manches">
              <Typography sx={{ fontSize: '0.78rem', color: 'text.secondary' }}>{patron.manches.join(', ')}</Typography>
            </Row>
          )}

          {patron.longueurs?.length > 0 && (
            <Row label="Longueur">
              <Typography sx={{ fontSize: '0.78rem', color: 'text.secondary' }}>{patron.longueurs.join(', ')}</Typography>
            </Row>
          )}

          {patron.details?.length > 0 && (
            <Row label="Détails">
              <Typography sx={{ fontSize: '0.78rem', color: 'text.secondary' }}>{patron.details.join(', ')}</Typography>
            </Row>
          )}

          {formats.length > 0 && (
            <Row label="Formats">
              <Box sx={{ display: 'flex', gap: 0.5 }}>
                {formats.map(f => (
                  <Chip key={f} label={f} size="small"
                    sx={{ bgcolor: '#fce4ec', color: '#e36397', fontWeight: 700, fontSize: '0.65rem', height: 18 }} />
                ))}
              </Box>
            </Row>
          )}

          {patron.notes && (
            <>
              <Box sx={{ height: '1px', bgcolor: 'rgba(0,0,0,0.06)', mx: -1.5 }} />
              <Typography sx={{ fontSize: '0.78rem', color: 'text.secondary', fontStyle: 'italic', whiteSpace: 'pre-wrap' }}>
                {patron.notes}
              </Typography>
            </>
          )}

        </Box>
      </Box>
    </Box>
  );
}

export default FloatingPatronCard;
